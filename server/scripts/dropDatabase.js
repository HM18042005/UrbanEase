const mongoose = require('mongoose');
require('dotenv').config();

async function dropDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get the database name
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Current database: ${dbName}`);

    // Drop the database
    await mongoose.connection.db.dropDatabase();
    console.log(`✅ Database '${dbName}' has been dropped successfully!`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
    
  } catch (error) {
    console.error('❌ Error dropping database:', error);
  } finally {
    process.exit(0);
  }
}

dropDatabase();
