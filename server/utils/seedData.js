const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Match = require('../models/Match');
const Message = require('../models/Message');
require('dotenv').config();

// Sample data arrays
const sampleNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Isabella', 'Lucas',
  'Sophia', 'Mason', 'Mia', 'Oliver', 'Charlotte', 'Elijah', 'Amelia', 'James',
  'Harper', 'Benjamin', 'Evelyn', 'Sebastian', 'Abigail', 'Michael', 'Emily', 'Daniel',
  'Elizabeth', 'Henry', 'Sofia', 'Jackson', 'Avery', 'Samuel', 'Ella', 'David',
  'Madison', 'Joseph', 'Scarlett', 'Carter', 'Victoria', 'Owen', 'Luna', 'Wyatt',
  'Grace', 'Jack', 'Chloe', 'Luke', 'Penelope', 'Jayden', 'Layla', 'Dylan'
];

const sampleBios = [
  "Adventure seeker and coffee enthusiast ☕️",
  "Passionate about travel and photography 📸",
  "Foodie who loves trying new restaurants 🍕",
  "Fitness junkie and outdoor lover 🏃‍♀️",
  "Bookworm with a love for classic literature 📚",
  "Music lover and amateur guitarist 🎸",
  "Dog person and nature enthusiast 🐕",
  "Tech geek and startup enthusiast 💻",
  "Yoga instructor and wellness advocate 🧘‍♀️",
  "Artist who finds beauty in everyday moments 🎨",
  "Chef who loves experimenting with flavors 👨‍🍳",
  "Travel blogger and culture enthusiast ✈️",
  "Marathon runner and fitness coach 🏃‍♂️",
  "Photographer capturing life's beautiful moments 📷",
  "Environmentalist and sustainability advocate 🌱",
  "Dance instructor and performance artist 💃",
  "Entrepreneur building the next big thing 🚀",
  "Teacher inspiring the next generation 👩‍🏫",
  "Doctor helping people live healthier lives 👨‍⚕️",
  "Architect designing spaces that inspire 🏗️"
];

const samplePhotos = [
  {
    url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop',
    publicId: 'sample_photo_1',
    isPrimary: true
  },
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    publicId: 'sample_photo_2',
    isPrimary: true
  },
  {
    url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop',
    publicId: 'sample_photo_3',
    isPrimary: true
  },
  {
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop',
    publicId: 'sample_photo_4',
    isPrimary: true
  },
  {
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
    publicId: 'sample_photo_5',
    isPrimary: true
  },
  {
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
    publicId: 'sample_photo_6',
    isPrimary: true
  },
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
    publicId: 'sample_photo_7',
    isPrimary: true
  },
  {
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
    publicId: 'sample_photo_8',
    isPrimary: true
  }
];

const sampleMessages = [
  "Hey! How's your day going? 😊",
  "I love your profile! What's your favorite travel destination?",
  "Coffee or tea? This is very important to know ☕️",
  "Your photos are amazing! Do you take them yourself?",
  "What's the best book you've read recently?",
  "I'm also a foodie! Any restaurant recommendations?",
  "Your bio made me laugh 😄 What's your favorite joke?",
  "Do you enjoy hiking? I know some great trails nearby",
  "Music lover here too! What's your current favorite song?",
  "I'm planning a trip soon. Any travel tips?",
  "Your dog is adorable! What's their name?",
  "I'm learning to cook. Any easy recipes you'd recommend?",
  "What's your ideal weekend look like?",
  "I'm also into fitness! What's your workout routine?",
  "Your photography skills are impressive! 📸",
  "What's the most adventurous thing you've ever done?",
  "I love trying new cuisines. What's your favorite?",
  "Your smile is contagious! 😊",
  "What's your dream vacation destination?",
  "I'm also a morning person! What's your morning routine?"
];

// Generate random location within a reasonable range
function generateRandomLocation() {
  // San Francisco area coordinates
  const baseLat = 37.7749;
  const baseLng = -122.4194;
  const latOffset = (Math.random() - 0.5) * 0.1; // ±0.05 degrees
  const lngOffset = (Math.random() - 0.5) * 0.1; // ±0.05 degrees
  
  return {
    type: 'Point',
    coordinates: [baseLng + lngOffset, baseLat + latOffset],
    address: 'San Francisco, CA'
  };
}

// Generate random age between 18-45
function generateRandomAge() {
  return Math.floor(Math.random() * 28) + 18; // 18-45
}

// Generate random user data
function generateUserData(index) {
  const gender = ['male', 'female', 'non-binary'][Math.floor(Math.random() * 3)];
  const interestedIn = ['male', 'female', 'non-binary', 'everyone'][Math.floor(Math.random() * 4)];
  
  return {
    name: sampleNames[index % sampleNames.length],
    email: `user${index + 1}@example.com`,
    password: 'password123',
    age: generateRandomAge(),
    gender: gender,
    interestedIn: interestedIn,
    bio: sampleBios[index % sampleBios.length],
    photos: [samplePhotos[index % samplePhotos.length]],
    location: generateRandomLocation(),
    preferences: {
      ageRange: {
        min: 18,
        max: 45
      },
      maxDistance: Math.floor(Math.random() * 50) + 10, // 10-60 km
      showMe: interestedIn
    },
    isActive: true,
    isOnline: Math.random() > 0.7, // 30% chance of being online
    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within last 7 days
    isVerified: Math.random() > 0.3, // 70% chance of being verified
    isPremium: Math.random() > 0.8, // 20% chance of being premium
    superLikesCount: Math.floor(Math.random() * 5),
    boostsCount: Math.floor(Math.random() * 3)
  };
}

// Generate sample swipes
function generateSwipes(userId, otherUsers) {
  const swipes = {
    liked: [],
    passed: [],
    superLiked: []
  };
  
  // Randomly like/pass/superlike some users
  otherUsers.forEach(otherUser => {
    const random = Math.random();
    const swipeData = {
      user: otherUser._id,
      swipedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Within last 30 days
    };
    
    if (random < 0.4) {
      swipes.liked.push(swipeData);
    } else if (random < 0.8) {
      swipes.passed.push(swipeData);
    } else if (random < 0.85) {
      swipes.superLiked.push(swipeData);
    }
    // 15% chance of no swipe (haven't seen yet)
  });
  
  return swipes;
}

// Generate matches based on mutual likes
function generateMatches(users) {
  const matches = [];
  
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const user1 = users[i];
      const user2 = users[j];
      
      // Check if they liked each other
      const user1LikedUser2 = user1.swipes.liked.some(swipe => 
        swipe.user.toString() === user2._id.toString()
      );
      const user2LikedUser1 = user2.swipes.liked.some(swipe => 
        swipe.user.toString() === user1._id.toString()
      );
      
      if (user1LikedUser2 && user2LikedUser1) {
        // Create a match
        const match = new Match({
          users: [user1._id, user2._id],
          status: 'active',
          matchedBy: user1LikedUser2 ? user1._id : user2._id,
          isConversationStarted: Math.random() > 0.3, // 70% chance of conversation started
          messageCount: Math.floor(Math.random() * 50),
          unreadCount: [
            { user: user1._id, count: Math.floor(Math.random() * 10) },
            { user: user2._id, count: Math.floor(Math.random() * 10) }
          ]
        });
        
        // Add last message if conversation started
        if (match.isConversationStarted) {
          const lastMessageText = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
          match.lastMessage = {
            text: lastMessageText,
            sender: Math.random() > 0.5 ? user1._id : user2._id,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            messageType: 'text'
          };
        }
        
        matches.push(match);
      }
    }
  }
  
  return matches;
}

// Generate messages for matches
function generateMessages(matches) {
  const messages = [];
  
  matches.forEach(match => {
    if (!match.isConversationStarted) return;
    
    const user1 = match.users[0];
    const user2 = match.users[1];
    const messageCount = Math.floor(Math.random() * 20) + 5; // 5-25 messages per match
    
    for (let i = 0; i < messageCount; i++) {
      const isUser1Sender = i % 2 === 0;
      const sender = isUser1Sender ? user1 : user2;
      const receiver = isUser1Sender ? user2 : user1;
      
      const message = new Message({
        match: match._id,
        sender: sender,
        receiver: receiver,
        content: {
          text: sampleMessages[Math.floor(Math.random() * sampleMessages.length)]
        },
        messageType: 'text',
        status: ['sent', 'delivered', 'read'][Math.floor(Math.random() * 3)],
        sentAt: new Date(Date.now() - (messageCount - i) * 60 * 60 * 1000) // Messages spread over time
      });
      
      // Set read/delivered timestamps
      if (message.status === 'read') {
        message.readAt = new Date(message.sentAt.getTime() + Math.random() * 60 * 60 * 1000);
        message.deliveredAt = new Date(message.sentAt.getTime() + Math.random() * 30 * 60 * 1000);
      } else if (message.status === 'delivered') {
        message.deliveredAt = new Date(message.sentAt.getTime() + Math.random() * 30 * 60 * 1000);
      }
      
      messages.push(message);
    }
  });
  
  return messages;
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Match.deleteMany({});
    await Message.deleteMany({});
    
    // Generate users
    console.log('👥 Creating sample users...');
    const users = [];
    const numUsers = 20; // Create 20 sample users
    
    for (let i = 0; i < numUsers; i++) {
      const userData = generateUserData(i);
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`Created user: ${user.name} (${user.email})`);
    }
    
    // Generate swipes for each user
    console.log('💕 Generating swipes...');
    for (let i = 0; i < users.length; i++) {
      const otherUsers = users.filter((_, index) => index !== i);
      const swipes = generateSwipes(users[i]._id, otherUsers);
      
      users[i].swipes = swipes;
      await users[i].save();
    }
    
    // Generate matches
    console.log('💘 Creating matches...');
    const matches = generateMatches(users);
    for (const match of matches) {
      await match.save();
      const user1 = users.find(u => u._id.toString() === match.users[0].toString());
      const user2 = users.find(u => u._id.toString() === match.users[1].toString());
      console.log(`Match created: ${user1.name} & ${user2.name}`);
    }
    
    // Generate messages
    console.log('💬 Creating messages...');
    const messages = generateMessages(matches);
    for (const message of messages) {
      await message.save();
    }
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users created: ${users.length}`);
    console.log(`   - Matches created: ${matches.length}`);
    console.log(`   - Messages created: ${messages.length}`);
    
    // Display some sample data
    console.log('\n🔍 Sample data preview:');
    const sampleUser = await User.findOne().populate('swipes.liked.user', 'name');
    console.log(`Sample user: ${sampleUser.name} (${sampleUser.email})`);
    console.log(`Likes: ${sampleUser.swipes.liked.length}, Passes: ${sampleUser.swipes.passed.length}`);
    
    const sampleMatch = await Match.findOne().populate('users', 'name');
    if (sampleMatch) {
      console.log(`Sample match: ${sampleMatch.users[0].name} & ${sampleMatch.users[1].name}`);
    }
    
    const sampleMessage = await Message.findOne().populate('sender receiver', 'name');
    if (sampleMessage) {
      console.log(`Sample message: "${sampleMessage.content.text}" from ${sampleMessage.sender.name} to ${sampleMessage.receiver.name}`);
    }
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  // Connect to MongoDB
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tinder-clone')
    .then(() => {
      console.log('📦 Connected to MongoDB');
      return seedDatabase();
    })
    .then(() => {
      console.log('🎉 Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database connection error:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase }; 