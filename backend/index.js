const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');

const env = require('./config/env');
const logger = require('./utils/logger');
const createHealthRouter = require('./routes/healthRoutes');
const { protect, restrictTo } = require('./middleware/auth');
const SocketHandler = require('./socket/socketHandler');

const app = express();
app.set('trust proxy', env.isProd);

const corsOptions = env.allowedOrigins.length
  ? {
    origin(origin, callback) {
      if (!origin || env.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      logger.warn(`Blocked request from disallowed origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }
  : { origin: true, credentials: true };

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  const started = Date.now();
  res.on('finish', () => {
    logger.http(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - started}ms)`);
  });
  next();
});

const routeBindings = [
  ['/api/auth', require('./routes/authRoutes')],
  ['/api/profile', require('./routes/profileRoutes')],
  ['/api/services', require('./routes/serviceRoutes')],
  ['/api/bookings', require('./routes/bookingRoutes')],
  ['/api/reviews', require('./routes/reviewRoutes')],
  ['/api/messages', require('./routes/messageRoutes')],
  ['/api/users', require('./routes/userRoutes')],
  ['/api/provider', require('./routes/providerRoutes')],
  ['/api/admin', require('./routes/adminRoutes')],
  ['/api/payments', require('./routes/paymentRoutes')],
];

routeBindings.forEach(([mountPath, router]) => app.use(mountPath, router));

app.use('/health', createHealthRouter({ enableDebugMetrics: env.exposeDebugRoutes }));

app.get('/', (req, res) => {
  res.json({
    message: 'UrbanEase backend is online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/admin/ping', protect, restrictTo('admin'), (req, res) => {
  res.json({ ok: true, user: req.user });
});

const server = http.createServer(app);
const socketHandler = new SocketHandler(server);
app.set('socketHandler', socketHandler);

mongoose.connection.on('connected', () => logger.success('Connected to MongoDB'));
mongoose.connection.on('error', (error) => logger.error(`MongoDB connection error: ${error.message}`));
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

const connectToDatabase = async () => {
  if (!env.mongoUri) {
    throw new Error('MONGO_URI is required but missing');
  }

  await mongoose.connect(env.mongoUri, {
    autoIndex: env.nodeEnv !== 'production',
  });
};

const startServer = () =>
  new Promise((resolve) => {
    server.listen(env.port, () => {
      logger.success(`🚀 Server running on port ${env.port}`);
      logger.info(`📡 Socket.IO enabled for real-time chat`);
      resolve();
    });
  });

const bootstrap = async () => {
  try {
    await connectToDatabase();
    await startServer();
  } catch (error) {
    logger.error('Server failed to start', error);
    process.exit(1);
  }
};

bootstrap();

const gracefulShutdown = (signal) => {
  logger.warn(`${signal} received. Closing server...`);
  server.close(() => {
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
};

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => gracefulShutdown(signal));
});

app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Origin blocked by CORS policy' });
  }

  logger.error(err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});
