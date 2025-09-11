const { exec } = require('child_process');
const path = require('path');

console.log('🚨 UrbanEase Database Reset & Seed Tool');
console.log('=====================================');
console.log('This will:');
console.log('1. 🗑️  Drop the entire database');
console.log('2. 🌱 Create fresh data with 50 records per model');
console.log('3. 👥 Create test users (Admins, Providers, Customers)');
console.log('4. 🔧 Generate realistic services and bookings');
console.log('5. 💬 Add sample messages and reviews');

const runScript = (scriptName) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptName);
    console.log(`\n🏃 Running: ${scriptName}`);
    
    const child = exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error in ${scriptName}:`, error);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.error(`⚠️  Warning in ${scriptName}:`, stderr);
      }
      
      console.log(stdout);
      resolve();
    });

    // Forward the output in real-time
    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
};

async function resetAndSeedDatabase() {
  try {
    console.log('\n⏰ Starting in 5 seconds...');
    console.log('Press Ctrl+C to cancel');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 1: Drop Database
    console.log('\n🗑️  STEP 1: Dropping Database');
    console.log('==============================');
    await runScript('dropDatabase.js');
    
    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Seed Database
    console.log('\n🌱 STEP 2: Seeding Database');
    console.log('============================');
    await runScript('seedDatabase.js');
    
    console.log('\n🎉 DATABASE RESET COMPLETE!');
    console.log('===========================');
    console.log('✅ Database has been successfully reset and seeded');
    console.log('🔐 Default password for all users: 12345678');
    console.log('🌐 You can now start your application and test with fresh data');
    
  } catch (error) {
    console.error('\n❌ RESET FAILED!');
    console.error('=================');
    console.error('Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check your .env file for correct MONGO_URI');
    console.log('3. Ensure all required npm packages are installed');
  } finally {
    process.exit(0);
  }
}

resetAndSeedDatabase();
