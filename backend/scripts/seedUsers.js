const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/user');

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Hash password function
    const hashPassword = async (password) => {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    };

    const hashedPassword = await hashPassword('12345678');

    // Users data
    const users = [
      // Admin users
      {
        name: 'harshit',
        email: 'harshit@gmail.com',
        password: hashedPassword,
        phone: '9876543210',
        role: 'admin',
        address: '123 Admin Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        bio: 'System Administrator',
        active: true
      },
      {
        name: 'harshit1',
        email: 'harshit1@gmail.com',
        password: hashedPassword,
        phone: '9876543211',
        role: 'admin',
        address: '124 Admin Street',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        bio: 'Senior Administrator',
        active: true
      },
      {
        name: 'harshit2',
        email: 'harshit2@gmail.com',
        password: hashedPassword,
        phone: '9876543212',
        role: 'admin',
        address: '125 Admin Street',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        bio: 'Database Administrator',
        active: true
      },
      
      // Regular users (customers)
      {
        name: 'harshit3',
        email: 'harshit3@gmail.com',
        password: hashedPassword,
        phone: '9876543213',
        role: 'customer',
        address: '126 User Street',
        city: 'Chennai',
        state: 'Tamil Nadu',
        zipCode: '600001',
        bio: 'Regular customer looking for home services',
        active: true
      },
      {
        name: 'harshit4',
        email: 'harshit4@gmail.com',
        password: hashedPassword,
        phone: '9876543214',
        role: 'customer',
        address: '127 User Street',
        city: 'Hyderabad',
        state: 'Telangana',
        zipCode: '500001',
        bio: 'Tech professional seeking cleaning services',
        active: true
      },
      {
        name: 'harshit5',
        email: 'harshit5@gmail.com',
        password: hashedPassword,
        phone: '9876543215',
        role: 'customer',
        address: '128 User Street',
        city: 'Pune',
        state: 'Maharashtra',
        zipCode: '411001',
        bio: 'Business owner needing regular maintenance',
        active: true
      },
      
      // Provider users
      {
        name: 'harshit6',
        email: 'harshit6@gmail.com',
        password: hashedPassword,
        phone: '9876543216',
        role: 'provider',
        address: '129 Provider Street',
        city: 'Kolkata',
        state: 'West Bengal',
        zipCode: '700001',
        bio: 'Professional home cleaning and maintenance services with 5 years experience',
        active: true
      },
      {
        name: 'harshit7',
        email: 'harshit7@gmail.com',
        password: hashedPassword,
        phone: '9876543217',
        role: 'provider',
        address: '130 Provider Street',
        city: 'Ahmedabad',
        state: 'Gujarat',
        zipCode: '380001',
        bio: 'Expert appliance repair and maintenance services with 8 years experience',
        active: true
      },
      {
        name: 'harshit8',
        email: 'harshit8@gmail.com',
        password: hashedPassword,
        phone: '9876543218',
        role: 'provider',
        address: '131 Provider Street',
        city: 'Jaipur',
        state: 'Rajasthan',
        zipCode: '302001',
        bio: 'Reliable plumbing and water system services with 6 years experience',
        active: true
      }
    ];

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Insert new users
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users successfully!`);

    // Display created users
    console.log('\n📋 Created Users:');
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n🔐 All users have password: 12345678');

    // Close connection
    await mongoose.connection.close();
    console.log('Connection closed');
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    process.exit(0);
  }
};

seedUsers();
