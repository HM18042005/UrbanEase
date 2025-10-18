const mongoose = require('mongoose');
require('dotenv').config();

async function dropDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');

    // Get the database name
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 Current database: ${dbName}`);

    // List all collections before dropping
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Found ${collections.length} collections:`, collections.map(c => c.name));

    // Drop the database completely
    await mongoose.connection.db.dropDatabase();
    console.log(`✅ Database '${dbName}' has been dropped successfully!`);
    console.log('🗑️  All collections and data removed');

    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    
  } catch (error) {
    console.error('❌ Error dropping database:', error);
  } finally {
    process.exit(0);
  }
}

console.log('🚨 WARNING: This will permanently delete ALL data!');
console.log('⏰ Starting database drop in 3 seconds...');

setTimeout(() => {
  dropDatabase();
}, 3000);
