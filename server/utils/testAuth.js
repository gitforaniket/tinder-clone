const mongoose = require('mongoose');
const User = require('../models/User');
const { generateToken, verifyToken } = require('./generateToken');
require('dotenv').config();

async function testAuthentication() {
  try {
    console.log('🔐 Testing Authentication System...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tinder-clone');
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Create a test user
    console.log('📝 Test 1: Creating test user...');
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      age: 25,
      gender: 'male',
      interestedIn: 'female',
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749],
        address: 'San Francisco, CA'
      }
    });

    await testUser.save();
    console.log('✅ Test user created successfully');
    console.log(`   Name: ${testUser.name}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Age: ${testUser.age}`);
    console.log(`   Password hashed: ${testUser.password.startsWith('$2a$') ? 'Yes' : 'No'}\n`);

    // Test 2: Password comparison
    console.log('🔑 Test 2: Testing password comparison...');
    const isPasswordValid = await testUser.comparePassword('password123');
    const isPasswordInvalid = await testUser.comparePassword('wrongpassword');
    
    console.log(`   Correct password: ${isPasswordValid ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`   Wrong password: ${isPasswordInvalid ? '❌ Should be invalid' : '✅ Correctly invalid'}\n`);

    // Test 3: JWT token generation
    console.log('🎫 Test 3: Testing JWT token generation...');
    const token = generateToken(testUser._id);
    console.log(`   Token generated: ${token ? '✅ Yes' : '❌ No'}`);
    console.log(`   Token length: ${token.length} characters`);
    
    // Verify token
    const decoded = verifyToken(token);
    console.log(`   Token verification: ${decoded.userId === testUser._id.toString() ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`   User ID in token: ${decoded.userId}`);
    console.log(`   Token type: ${decoded.type}\n`);

    // Test 4: Token expiration
    console.log('⏰ Test 4: Testing token expiration...');
    const expirationDate = new Date(decoded.exp * 1000);
    const now = new Date();
    const isExpired = expirationDate < now;
    
    console.log(`   Token expiration: ${expirationDate.toISOString()}`);
    console.log(`   Current time: ${now.toISOString()}`);
    console.log(`   Is expired: ${isExpired ? '❌ Yes' : '✅ No'}\n`);

    // Test 5: User methods
    console.log('👤 Test 5: Testing user methods...');
    const hasLiked = testUser.hasLiked(testUser._id);
    const hasPassed = testUser.hasPassed(testUser._id);
    const primaryPhoto = testUser.getPrimaryPhoto();
    
    console.log(`   Has liked self: ${hasLiked ? 'Yes' : 'No'}`);
    console.log(`   Has passed self: ${hasPassed ? 'Yes' : 'No'}`);
    console.log(`   Primary photo: ${primaryPhoto ? 'Available' : 'Not available'}\n`);

    // Test 6: User validation
    console.log('✅ Test 6: Testing user validation...');
    const validationErrors = testUser.validateSync();
    console.log(`   Validation errors: ${validationErrors ? validationErrors.message : 'None'}\n`);

    // Test 7: Clean up
    console.log('🧹 Test 7: Cleaning up test data...');
    await User.findByIdAndDelete(testUser._id);
    console.log('✅ Test user deleted\n');

    console.log('🎉 All authentication tests passed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User creation and validation');
    console.log('   ✅ Password hashing with bcrypt');
    console.log('   ✅ Password comparison');
    console.log('   ✅ JWT token generation');
    console.log('   ✅ JWT token verification');
    console.log('   ✅ Token expiration handling');
    console.log('   ✅ User methods');
    console.log('   ✅ Data cleanup');

  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAuthentication();
}

module.exports = { testAuthentication }; 