# Sample Data Utilities

This directory contains utilities for seeding and testing sample data in the Tinder Clone application.

## Files

- `seedData.js` - Main seeding script that populates the database with sample users, matches, and messages
- `testData.js` - Test script to verify and display statistics about the seeded data
- `README.md` - This documentation file

## Usage

### Seeding the Database

To populate your database with sample data, run:

```bash
cd server
npm run seed
```

This will:
- Create 20 sample users with realistic profiles
- Generate random swipes (likes, passes, super likes) between users
- Create matches based on mutual likes
- Generate conversation messages for active matches
- Display a summary of created data

### Testing Sample Data

To verify the sample data and view statistics, run:

```bash
cd server
npm run test-data
```

This will display:
- Database statistics (user, match, message counts)
- Sample user profiles
- Sample matches
- Sample messages
- User swipe data
- Location-based queries
- Message and match statistics

## Sample Data Details

### Users (20 total)
- **Names**: Popular names from different backgrounds
- **Ages**: 18-45 years old
- **Genders**: male, female, non-binary
- **Interests**: Various preferences (male, female, non-binary, everyone)
- **Bios**: Realistic, engaging bios with emojis
- **Photos**: High-quality Unsplash images
- **Locations**: San Francisco area with realistic coordinates
- **Preferences**: Age ranges, distance preferences, show preferences
- **Status**: Online/offline status, verification, premium features

### Swipes
- **Like rate**: ~40% of potential matches
- **Pass rate**: ~40% of potential matches
- **Super like rate**: ~5% of potential matches
- **No swipe**: ~15% (haven't seen yet)

### Matches
- Created based on mutual likes
- 70% chance of conversation starting
- Random message counts (0-50)
- Unread message tracking

### Messages
- 5-25 messages per active conversation
- Realistic conversation flow
- Various message statuses (sent, delivered, read)
- Timestamps spread over time

## Environment Setup

Make sure you have:

1. **MongoDB running** (local or Atlas)
2. **Environment variables** set in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/tinder-clone
   ```

## Sample Login Credentials

After seeding, you can use these test accounts:

- **Email**: `user1@example.com` | **Password**: `password123`
- **Email**: `user2@example.com` | **Password**: `password123`
- **Email**: `user3@example.com` | **Password**: `password123`
- ... (up to user20@example.com)

## Customization

You can modify the sample data by editing:

- `sampleNames` array for different names
- `sampleBios` array for different bios
- `samplePhotos` array for different profile pictures
- `sampleMessages` array for different conversation starters
- `numUsers` variable to change the number of users created

## Database Schema Validation

The sample data validates all schema relationships:

- **User ↔ Match**: Proper ObjectId references
- **User ↔ Message**: Sender/receiver relationships
- **Match ↔ Message**: Match reference for grouping
- **Validation**: All required fields and constraints satisfied

## Performance Notes

- Uses MongoDB indexes for efficient queries
- Geospatial queries for location-based matching
- Aggregation pipelines for statistics
- Proper population of referenced documents

## Troubleshooting

If you encounter issues:

1. **Connection errors**: Check your MongoDB connection string
2. **Validation errors**: Ensure all required fields are provided
3. **Memory issues**: Reduce `numUsers` for smaller datasets
4. **Photo loading**: Check internet connection for Unsplash images

## Next Steps

After seeding:
1. Start your server: `npm run dev`
2. Test the API endpoints with the sample data
3. Use the test accounts to explore the application
4. Build your frontend to interact with the seeded data 