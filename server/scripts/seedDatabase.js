const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

// Import all models
const User = require('../models/user');
const Service = require('../models/service');
const Booking = require('../models/booking');
const Review = require('../models/review');
const Message = require('../models/message');

// Service categories
const SERVICE_CATEGORIES = [
  'Cleaning', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 
  'Appliance Repair', 'HVAC', 'Gardening', 'Home Security', 'Pest Control',
  'Roofing', 'Flooring', 'Interior Design', 'Moving', 'General Maintenance'
];

// Cities in India
const INDIAN_CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', zipCode: '400001' },
  { city: 'Delhi', state: 'Delhi', zipCode: '110001' },
  { city: 'Bangalore', state: 'Karnataka', zipCode: '560001' },
  { city: 'Chennai', state: 'Tamil Nadu', zipCode: '600001' },
  { city: 'Hyderabad', state: 'Telangana', zipCode: '500001' },
  { city: 'Pune', state: 'Maharashtra', zipCode: '411001' },
  { city: 'Kolkata', state: 'West Bengal', zipCode: '700001' },
  { city: 'Ahmedabad', state: 'Gujarat', zipCode: '380001' },
  { city: 'Jaipur', state: 'Rajasthan', zipCode: '302001' },
  { city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226001' }
];

class DatabaseSeeder {
  constructor() {
    this.users = [];
    this.services = [];
    this.bookings = [];
    this.reviews = [];
    this.messages = [];
  }

  async connect() {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🔗 Connected to MongoDB');
  }

  async clearAll() {
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Service.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Message.deleteMany({});
    console.log('✅ All collections cleared');
  }

  getRandomCity() {
    return faker.helpers.arrayElement(INDIAN_CITIES);
  }

  getRandomCategory() {
    return faker.helpers.arrayElement(SERVICE_CATEGORIES);
  }

  generatePhoneNumber() {
    return faker.phone.number('9#########');
  }

  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async seedUsers() {
    console.log('👥 Seeding Users...');
    const hashedPassword = await this.hashPassword('12345678');
    const users = [];

    // Create 3 admins
    for (let i = 0; i < 3; i++) {
      const city = this.getRandomCity();
      users.push({
        name: `Admin ${faker.person.firstName()}`,
        email: `admin${i + 1}@urbanease.com`,
        password: hashedPassword,
        phone: this.generatePhoneNumber(),
        role: 'admin',
        address: faker.location.streetAddress(),
        city: city.city,
        state: city.state,
        zipCode: city.zipCode,
        dateOfBirth: faker.date.birthdate({ min: 25, max: 50, mode: 'age' }),
        bio: 'System Administrator with extensive experience in platform management',
        active: true
      });
    }

    // Create 25 providers
    for (let i = 0; i < 25; i++) {
      const city = this.getRandomCity();
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      users.push({
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: hashedPassword,
        phone: this.generatePhoneNumber(),
        role: 'provider',
        address: faker.location.streetAddress(),
        city: city.city,
        state: city.state,
        zipCode: city.zipCode,
        dateOfBirth: faker.date.birthdate({ min: 22, max: 60, mode: 'age' }),
        bio: `Professional ${this.getRandomCategory().toLowerCase()} service provider with ${faker.number.int({ min: 1, max: 15 })} years of experience. Dedicated to quality service and customer satisfaction.`,
        active: true
      });
    }

    // Create 22 customers
    for (let i = 0; i < 22; i++) {
      const city = this.getRandomCity();
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      users.push({
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: hashedPassword,
        phone: this.generatePhoneNumber(),
        role: 'customer',
        address: faker.location.streetAddress(),
        city: city.city,
        state: city.state,
        zipCode: city.zipCode,
        dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        bio: faker.lorem.sentence(),
        active: faker.datatype.boolean(0.95) // 95% active users
      });
    }

    this.users = await User.insertMany(users);
    console.log(`✅ Created ${this.users.length} users`);
  }

  async seedServices() {
    console.log('🔧 Seeding Services...');
    const providers = this.users.filter(user => user.role === 'provider');
    const services = [];

    for (let i = 0; i < 50; i++) {
      const provider = faker.helpers.arrayElement(providers);
      const category = this.getRandomCategory();
      
      services.push({
        title: `${category} - ${faker.commerce.productName()}`,
        description: `Professional ${category.toLowerCase()} service. ${faker.lorem.sentences(2)} We ensure quality work with guaranteed satisfaction.`,
        price: faker.number.int({ min: 500, max: 5000 }),
        provider: provider._id,
        category: category,
        isAvailable: faker.datatype.boolean(0.9), // 90% available
        duration: faker.helpers.arrayElement(['1 hour', '2 hours', '3 hours', '4 hours', 'Half day', 'Full day']),
        createdAt: faker.date.between({ 
          from: new Date('2024-01-01'), 
          to: new Date() 
        })
      });
    }

    this.services = await Service.insertMany(services);
    console.log(`✅ Created ${this.services.length} services`);
  }

  async seedBookings() {
    console.log('📅 Seeding Bookings...');
    const customers = this.users.filter(user => user.role === 'customer');
    const bookings = [];

    for (let i = 0; i < 50; i++) {
      const service = faker.helpers.arrayElement(this.services);
      const customer = faker.helpers.arrayElement(customers);
      const provider = this.users.find(user => user._id.equals(service.provider));
      
      const bookingDate = faker.date.between({ 
        from: new Date('2024-01-01'), 
        to: new Date('2025-12-31') 
      });

      const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      const paymentStatuses = ['unpaid', 'pending', 'paid', 'failed', 'refunded'];
      
      const status = faker.helpers.arrayElement(statuses);
      const paymentStatus = status === 'completed' ? 'paid' : faker.helpers.arrayElement(paymentStatuses);

      const booking = {
        customer: customer._id,
        provider: provider._id,
        service: service._id,
        date: bookingDate,
        address: `${faker.location.streetAddress()}, ${customer.city}, ${customer.state}`,
        status: status,
        paymentStatus: paymentStatus,
        createdAt: faker.date.between({ 
          from: new Date('2024-01-01'), 
          to: bookingDate 
        })
      };

      // Add payment details for paid bookings
      if (paymentStatus === 'paid') {
        booking.paymentId = `pay_${faker.string.alphanumeric(14)}`;
        booking.paymentOrderId = `order_${faker.string.alphanumeric(14)}`;
        booking.paidAt = faker.date.between({ 
          from: booking.createdAt, 
          to: bookingDate 
        });
      }

      // Add refund details for refunded bookings
      if (paymentStatus === 'refunded') {
        booking.refundId = `rfnd_${faker.string.alphanumeric(14)}`;
        booking.refundAmount = service.price;
        booking.refundReason = faker.helpers.arrayElement([
          'Service not satisfactory',
          'Provider cancelled',
          'Customer request',
          'Technical issues'
        ]);
        booking.refundedAt = faker.date.recent({ days: 30 });
      }

      bookings.push(booking);
    }

    this.bookings = await Booking.insertMany(bookings);
    console.log(`✅ Created ${this.bookings.length} bookings`);
  }

  async seedReviews() {
    console.log('⭐ Seeding Reviews...');
    const completedBookings = this.bookings.filter(booking => booking.status === 'completed');
    const reviews = [];

    for (let i = 0; i < Math.min(30, completedBookings.length); i++) {
      const booking = completedBookings[i];
      // Ensure review date is after booking date
      const minDate = new Date(Math.max(booking.date.getTime() + 86400000, new Date('2024-01-01').getTime())); // Add 1 day
      const maxDate = new Date();
      
      if (minDate < maxDate) {
        reviews.push({
          user: booking.customer,
          service: booking.service,
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.lorem.paragraph(),
          createdAt: faker.date.between({ 
            from: minDate, 
            to: maxDate 
          })
        });
      }
    }

    // Create additional reviews to reach 50
    while (reviews.length < 50) {
      const customer = faker.helpers.arrayElement(this.users.filter(u => u.role === 'customer'));
      const service = faker.helpers.arrayElement(this.services);
      
      reviews.push({
        user: customer._id,
        service: service._id,
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.paragraph(),
        createdAt: faker.date.between({ 
          from: new Date('2024-01-01'), 
          to: new Date() 
        })
      });
    }

    this.reviews = await Review.insertMany(reviews);
    console.log(`✅ Created ${this.reviews.length} reviews`);
  }

  async seedMessages() {
    console.log('💬 Seeding Messages...');
    const customers = this.users.filter(user => user.role === 'customer');
    const providers = this.users.filter(user => user.role === 'provider');
    const messages = [];

    // Create conversations between customers and providers
    for (let i = 0; i < 50; i++) {
      const customer = faker.helpers.arrayElement(customers);
      const provider = faker.helpers.arrayElement(providers);
      
      const conversationId = `conv_${[customer._id, provider._id].sort().join('_')}`;
      const messageCount = faker.number.int({ min: 1, max: 5 });
      
      for (let j = 0; j < messageCount; j++) {
        const isCustomerSender = faker.datatype.boolean();
        const sender = isCustomerSender ? customer : provider;
        const receiver = isCustomerSender ? provider : customer;
        
        const messageTime = faker.date.recent({ days: 30 });
        
        messages.push({
          senderId: sender._id,
          receiverId: receiver._id,
          message: isCustomerSender 
            ? faker.helpers.arrayElement([
                'Hi, I need help with your service',
                'What time are you available?',
                'Can you come today?',
                'How much will this cost?',
                'Is the service still available?'
              ])
            : faker.helpers.arrayElement([
                'Hello! I can help you with that',
                'I am available tomorrow morning',
                'The cost depends on the work required',
                'Yes, the service is available',
                'Let me check my schedule'
              ]),
          conversationId: conversationId,
          status: faker.helpers.arrayElement(['sent', 'delivered', 'read']),
          messageType: 'text',
          timestamp: messageTime,
          isEdited: faker.datatype.boolean(0.1), // 10% edited messages
          createdAt: messageTime
        });
      }
    }

    this.messages = await Message.insertMany(messages);
    console.log(`✅ Created ${this.messages.length} messages`);
  }

  async displaySummary() {
    console.log('\n📊 SEEDING SUMMARY');
    console.log('===================');
    console.log(`👥 Users: ${this.users.length}`);
    console.log(`   - Admins: ${this.users.filter(u => u.role === 'admin').length}`);
    console.log(`   - Providers: ${this.users.filter(u => u.role === 'provider').length}`);
    console.log(`   - Customers: ${this.users.filter(u => u.role === 'customer').length}`);
    console.log(`🔧 Services: ${this.services.length}`);
    console.log(`📅 Bookings: ${this.bookings.length}`);
    console.log(`⭐ Reviews: ${this.reviews.length}`);
    console.log(`💬 Messages: ${this.messages.length}`);
    console.log('\n🔐 Default password for all users: 12345678');
    console.log('🌟 Database is now ready for testing!');
  }

  async run() {
    try {
      await this.connect();
      await this.clearAll();
      
      console.log('\n🚀 Starting database seeding...\n');
      
      await this.seedUsers();
      await this.seedServices();
      await this.seedBookings();
      await this.seedReviews();
      await this.seedMessages();
      
      await this.displaySummary();
      
      await mongoose.connection.close();
      console.log('\n🔌 Connection closed');
      
    } catch (error) {
      console.error('❌ Error seeding database:', error);
    } finally {
      process.exit(0);
    }
  }
}

// Run the seeder
const seeder = new DatabaseSeeder();
seeder.run();
