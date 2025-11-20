const express = require('express');
const mongoose = require('mongoose');

const Booking = require('../models/booking');
const Message = require('../models/message');
const Review = require('../models/review');
const Service = require('../models/service');
const User = require('../models/user');

const trackedCollections = [
    { label: 'users', model: User },
    { label: 'services', model: Service },
    { label: 'bookings', model: Booking },
    { label: 'messages', model: Message },
    { label: 'reviews', model: Review },
];

const connectionStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

const getConnectionLabel = () => connectionStates[mongoose.connection.readyState] || 'unknown';

const buildMetricsPayload = async () => {
    const entries = await Promise.all(
        trackedCollections.map(async ({ label, model }) => {
            const count = await model.estimatedDocumentCount();
            return [label, count];
        })
    );

    return Object.fromEntries(entries);
};

const createHealthRouter = ({ enableDebugMetrics = false } = {}) => {
    const router = express.Router();

    router.get('/', (req, res) => {
        res.json({
            ok: true,
            uptimeSeconds: Math.round(process.uptime()),
            timestamp: new Date().toISOString(),
            database: getConnectionLabel(),
        });
    });

    if (enableDebugMetrics) {
        router.get('/metrics', async (req, res) => {
            try {
                const metrics = await buildMetricsPayload();
                res.json({ ok: true, database: getConnectionLabel(), metrics });
            } catch (error) {
                res.status(500).json({ ok: false, message: 'Unable to collect metrics', error: error.message });
            }
        });
    }

    return router;
};

module.exports = createHealthRouter;
