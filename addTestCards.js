import mongoose from 'mongoose';
import Cards from './dbCards.js';

const connection_url = 'mongodb://localhost:27017/myFirstDatabase';

const testCards = [
  { name: 'Alice', imgUrl: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { name: 'Bob', imgUrl: 'https://randomuser.me/api/portraits/men/65.jpg' },
  { name: 'Charlie', imgUrl: 'https://randomuser.me/api/portraits/men/66.jpg' },
  { name: 'Diana', imgUrl: 'https://randomuser.me/api/portraits/women/67.jpg' },
];

async function addCards() {
  try {
    await mongoose.connect(connection_url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await Cards.deleteMany({}); // Clear existing cards for a clean slate
    await Cards.insertMany(testCards);
    console.log('Test cards added!');
    process.exit(0);
  } catch (err) {
    console.error('Error adding test cards:', err);
    process.exit(1);
  }
}

addCards(); 