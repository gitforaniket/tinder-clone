# Tinder Clone (MERN Stack)

A full-stack Tinder-like dating application built with MongoDB, Express, React, and Node.js.

## Features
- User authentication and registration
- Profile creation and management
- Swipeable card interface (like Tinder)
- Real-time chat functionality
- Matching algorithm
- Image upload with Cloudinary
- Responsive design with styled-components
- Real-time notifications with Socket.io

## Tech Stack
- **Frontend**: React, React Router, Styled Components, Framer Motion, Socket.io Client
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **Real-time**: Socket.io
- **File Upload**: Multer, Cloudinary
- **Styling**: Styled Components, CSS3

## Project Structure
```
tinder-clone/
├── client/                     # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/           # Authentication components
│   │   │   ├── Profile/        # Profile management
│   │   │   ├── Cards/          # Swipe card interface
│   │   │   ├── Chat/           # Chat functionality
│   │   │   ├── Header/         # Navigation header
│   │   │   └── Common/         # Shared components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API and socket services
│   │   ├── context/            # React context providers
│   │   ├── hooks/              # Custom React hooks
│   │   └── utils/              # Utility functions
│   └── package.json
├── server/                     # Node.js backend
│   ├── controllers/            # Route controllers
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API routes
│   ├── middleware/             # Custom middleware
│   ├── config/                 # Configuration files
│   ├── utils/                  # Utility functions
│   ├── socket/                 # Socket.io handlers
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tinder-clone.git
   cd tinder-clone
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**

   Create `.env` files in both `server/` and `client/` directories:

   **Server (.env)**
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

   **Client (.env)**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

5. **Start Development Servers**

   **Backend (Terminal 1)**
   ```bash
   cd server
   npm run dev
   ```

   **Frontend (Terminal 2)**
   ```bash
   cd client
   npm start
   ```

   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user

### Matches
- `GET /api/matches` - Get user matches
- `POST /api/matches` - Create new match
- `DELETE /api/matches/:id` - Remove match

### Messages
- `GET /api/messages/:matchId` - Get messages for a match
- `POST /api/messages` - Send a message

## Features to Implement

- [ ] User authentication and registration
- [ ] Profile creation and editing
- [ ] Swipe card interface
- [ ] Matching algorithm
- [ ] Real-time chat
- [ ] Image upload functionality
- [ ] Push notifications
- [ ] User preferences and filters
- [ ] Location-based matching
- [ ] Premium features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Tinder's user interface and functionality
- Built with modern web technologies for optimal performance and user experience
