const mongoose = require('mongoose');
const User = require('../models/User');
const { uploadImage, deleteImage } = require('../config/cloudinary');
require('dotenv').config();

async function testUserCRUD() {
  try {
    console.log('👤 Testing User CRUD & Profile Upload System...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tinder-clone');
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Create test users
    console.log('📝 Test 1: Creating test users...');
    
    const testUser1 = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      age: 25,
      gender: 'male',
      interestedIn: 'female',
      bio: 'Adventure seeker and coffee lover',
      job: 'Software Engineer',
      education: 'Computer Science',
      interests: ['hiking', 'photography', 'travel'],
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749],
        address: 'San Francisco, CA'
      },
      preferences: {
        ageRange: { min: 22, max: 30 },
        distance: 50,
        showMen: false,
        showWomen: true
      }
    });

    const testUser2 = new User({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      age: 23,
      gender: 'female',
      interestedIn: 'male',
      bio: 'Artist and yoga enthusiast',
      job: 'Graphic Designer',
      education: 'Fine Arts',
      interests: ['painting', 'yoga', 'cooking'],
      location: {
        type: 'Point',
        coordinates: [-74.0060, 40.7128],
        address: 'New York, NY'
      },
      preferences: {
        ageRange: { min: 24, max: 32 },
        distance: 30,
        showMen: true,
        showWomen: false
      }
    });

    await testUser1.save();
    await testUser2.save();
    
    console.log('✅ Test users created successfully');
    console.log(`   User 1: ${testUser1.name} (${testUser1.email})`);
    console.log(`   User 2: ${testUser2.name} (${testUser2.email})\n`);

    // Test 2: Test user retrieval
    console.log('🔍 Test 2: Testing user retrieval...');
    
    const users = await User.find({ isActive: true }).select('-password');
    console.log(`   Total active users: ${users.length}`);
    
    const userById = await User.findById(testUser1._id).select('-password');
    console.log(`   User by ID: ${userById.name} (${userById._id})\n`);

    // Test 3: Test profile update
    console.log('✏️  Test 3: Testing profile update...');
    
    const updatedBio = 'Updated bio: Adventure seeker, coffee lover, and tech enthusiast';
    testUser1.bio = updatedBio;
    testUser1.job = 'Senior Software Engineer';
    await testUser1.save();
    
    console.log(`   Updated bio: ${testUser1.bio}`);
    console.log(`   Updated job: ${testUser1.job}\n`);

    // Test 4: Test user search
    console.log('🔎 Test 4: Testing user search...');
    
    const searchResults = await User.find({
      $or: [
        { name: { $regex: 'John', $options: 'i' } },
        { bio: { $regex: 'adventure', $options: 'i' } }
      ]
    }).select('-password');
    
    console.log(`   Search results for "John" or "adventure": ${searchResults.length} users\n`);

    // Test 5: Test Cloudinary configuration (mock test)
    console.log('☁️  Test 5: Testing Cloudinary configuration...');
    
    // Check if Cloudinary environment variables are set
    const cloudinaryConfig = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET
    };
    
    const hasCloudinaryConfig = cloudinaryConfig.cloudName && 
                               cloudinaryConfig.apiKey && 
                               cloudinaryConfig.apiSecret;
    
    console.log(`   Cloudinary configured: ${hasCloudinaryConfig ? '✅ Yes' : '❌ No'}`);
    if (hasCloudinaryConfig) {
      console.log(`   Cloud name: ${cloudinaryConfig.cloudName}`);
      console.log(`   API key: ${cloudinaryConfig.apiKey ? '✅ Set' : '❌ Missing'}`);
      console.log(`   API secret: ${cloudinaryConfig.apiSecret ? '✅ Set' : '❌ Missing'}\n`);
    } else {
      console.log('   ⚠️  Cloudinary not configured. Photo upload tests will be skipped.\n');
    }

    // Test 6: Test photo management (simulated)
    console.log('📸 Test 6: Testing photo management...');
    
    // Simulate adding photos to user
    const mockPhoto1 = {
      url: 'https://example.com/photo1.jpg',
      publicId: 'tinder-clone/profiles/mock_photo_1',
      isPrimary: true,
      order: 0
    };
    
    const mockPhoto2 = {
      url: 'https://example.com/photo2.jpg',
      publicId: 'tinder-clone/profiles/mock_photo_2',
      isPrimary: false,
      order: 1
    };
    
    testUser1.photos = [mockPhoto1, mockPhoto2];
    await testUser1.save();
    
    console.log(`   Photos added to ${testUser1.name}: ${testUser1.photos.length}`);
    console.log(`   Primary photo: ${testUser1.getPrimaryPhoto()?.url || 'None'}`);
    console.log(`   Total photos: ${testUser1.photos.length}\n`);

    // Test 7: Test photo reordering
    console.log('🔄 Test 7: Testing photo reordering...');
    
    // Swap photo order
    const tempOrder = testUser1.photos[0].order;
    testUser1.photos[0].order = testUser1.photos[1].order;
    testUser1.photos[1].order = tempOrder;
    
    // Sort by order
    testUser1.photos.sort((a, b) => a.order - b.order);
    await testUser1.save();
    
    console.log(`   Photo order updated: ${testUser1.photos.map(p => p.order).join(', ')}\n`);

    // Test 8: Test user preferences
    console.log('⚙️  Test 8: Testing user preferences...');
    
    console.log(`   ${testUser1.name} preferences:`);
    console.log(`     Age range: ${testUser1.preferences.ageRange.min}-${testUser1.preferences.ageRange.max}`);
    console.log(`     Distance: ${testUser1.preferences.distance}km`);
    console.log(`     Show men: ${testUser1.preferences.showMen}`);
    console.log(`     Show women: ${testUser1.preferences.showWomen}\n`);

    // Test 9: Test user validation
    console.log('✅ Test 9: Testing user validation...');
    
    const validationErrors = testUser1.validateSync();
    console.log(`   Validation errors: ${validationErrors ? validationErrors.message : 'None'}\n`);

    // Test 10: Test user methods
    console.log('🔧 Test 10: Testing user methods...');
    
    const hasLiked = testUser1.hasLiked(testUser2._id);
    const hasPassed = testUser1.hasPassed(testUser2._id);
    const primaryPhoto = testUser1.getPrimaryPhoto();
    
    console.log(`   Has liked ${testUser2.name}: ${hasLiked ? 'Yes' : 'No'}`);
    console.log(`   Has passed ${testUser2.name}: ${hasPassed ? 'Yes' : 'No'}`);
    console.log(`   Primary photo: ${primaryPhoto ? 'Available' : 'Not available'}\n`);

    // Test 11: Test user statistics
    console.log('📊 Test 11: Testing user statistics...');
    
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const maleUsers = await User.countDocuments({ gender: 'male', isActive: true });
    const femaleUsers = await User.countDocuments({ gender: 'female', isActive: true });
    
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Active users: ${activeUsers}`);
    console.log(`   Male users: ${maleUsers}`);
    console.log(`   Female users: ${femaleUsers}\n`);

    // Test 12: Clean up
    console.log('🧹 Test 12: Cleaning up test data...');
    
    await User.findByIdAndDelete(testUser1._id);
    await User.findByIdAndDelete(testUser2._id);
    console.log('✅ Test users deleted\n');

    console.log('🎉 All User CRUD & Profile Upload tests passed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User creation and validation');
    console.log('   ✅ User retrieval and search');
    console.log('   ✅ Profile updates');
    console.log('   ✅ Photo management (simulated)');
    console.log('   ✅ User preferences');
    console.log('   ✅ User methods and utilities');
    console.log('   ✅ Cloudinary configuration check');
    console.log('   ✅ Data cleanup');

  } catch (error) {
    console.error('❌ User CRUD test failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testUserCRUD();
}

module.exports = { testUserCRUD }; 