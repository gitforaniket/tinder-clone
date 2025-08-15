const mongoose = require('mongoose');
const User = require('../models/User');
const Match = require('../models/Match');
const Message = require('../models/Message');
require('dotenv').config();

async function testSampleData() {
  try {
    console.log('🔍 Testing sample data...');
    
    // Get counts
    const userCount = await User.countDocuments();
    const matchCount = await Match.countDocuments();
    const messageCount = await Message.countDocuments();
    
    console.log(`📊 Database Statistics:`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Matches: ${matchCount}`);
    console.log(`   - Messages: ${messageCount}`);
    
    // Test user data
    console.log('\n👥 Sample Users:');
    const users = await User.find().limit(5).select('name email age gender bio isOnline lastActive');
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.age}yo ${user.gender} - ${user.isOnline ? '🟢 Online' : '🔴 Offline'}`);
      console.log(`     Bio: "${user.bio}"`);
    });
    
    // Test matches
    console.log('\n💘 Sample Matches:');
    const matches = await Match.find().limit(3).populate('users', 'name age gender');
    matches.forEach(match => {
      const user1 = match.users[0];
      const user2 = match.users[1];
      console.log(`   - ${user1.name} (${user1.age}yo ${user1.gender}) & ${user2.name} (${user2.age}yo ${user2.gender})`);
      console.log(`     Messages: ${match.messageCount}, Conversation started: ${match.isConversationStarted ? 'Yes' : 'No'}`);
    });
    
    // Test messages
    console.log('\n💬 Sample Messages:');
    const messages = await Message.find().limit(5).populate('sender receiver', 'name').populate('match');
    messages.forEach(message => {
      console.log(`   - "${message.content.text}"`);
      console.log(`     From: ${message.sender.name} → To: ${message.receiver.name}`);
      console.log(`     Status: ${message.status}, Sent: ${message.sentAt.toLocaleDateString()}`);
    });
    
    // Test user swipes
    console.log('\n💕 Sample User Swipes:');
    const userWithSwipes = await User.findOne().populate('swipes.liked.user', 'name age gender');
    if (userWithSwipes) {
      console.log(`   User: ${userWithSwipes.name}`);
      console.log(`   Likes: ${userWithSwipes.swipes.liked.length}`);
      console.log(`   Passes: ${userWithSwipes.swipes.passed.length}`);
      console.log(`   Super Likes: ${userWithSwipes.swipes.superLiked.length}`);
      
      if (userWithSwipes.swipes.liked.length > 0) {
        console.log(`   Sample likes:`);
        userWithSwipes.swipes.liked.slice(0, 3).forEach(swipe => {
          console.log(`     - ${swipe.user.name} (${swipe.user.age}yo ${swipe.user.gender})`);
        });
      }
    }
    
    // Test location-based queries
    console.log('\n📍 Location-based Queries:');
    const usersNearSF = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749] // San Francisco
          },
          $maxDistance: 50000 // 50km
        }
      }
    }).limit(3).select('name location.coordinates');
    
    console.log(`   Users near San Francisco: ${usersNearSF.length}`);
    usersNearSF.forEach(user => {
      console.log(`     - ${user.name}: [${user.location.coordinates[0].toFixed(4)}, ${user.location.coordinates[1].toFixed(4)}]`);
    });
    
    // Test message statistics
    console.log('\n📈 Message Statistics:');
    const messageStats = await Message.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    messageStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} messages`);
    });
    
    // Test match statistics
    console.log('\n💘 Match Statistics:');
    const matchStats = await Match.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgMessages: { $avg: '$messageCount' }
        }
      }
    ]);
    
    matchStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} matches, avg ${Math.round(stat.avgMessages)} messages`);
    });
    
    console.log('\n✅ Sample data test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing sample data:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tinder-clone')
    .then(() => {
      console.log('📦 Connected to MongoDB');
      return testSampleData();
    })
    .then(() => {
      console.log('🎉 Test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database connection error:', error);
      process.exit(1);
    });
}

module.exports = { testSampleData }; 