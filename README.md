# Tinder Clone (MERN Stack)

A full-stack Tinder-like swipe app built with MongoDB, Express, React, and Node.js.

## Features
- Swipeable card interface (like Tinder)
- React frontend (Create React App)
- Express + Node.js backend
- MongoDB for card storage
- REST API for card data
- GitHub Actions CI/CD: auto-deploys frontend to GitHub Pages on every push to `main`

## Live Demo
[https://heyaniket.github.io/tinder-clone/](https://heyaniket.github.io/tinder-clone/)

## Getting Started (Local Development)

### Prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB (local or Atlas)

### 1. Install dependencies
```bash
npm install
```

### 2. Start MongoDB
Make sure MongoDB is running locally (default: `mongodb://localhost:27017/myFirstDatabase`).

### 3. Add test cards (optional)
```bash
node server/addTestCards.js
```

### 4. Start the app (dev mode)
```bash
npm run dev
```
- React frontend: [http://localhost:3000](http://localhost:3000)
- Express backend: [http://localhost:8001](http://localhost:8001)

## Production Build & Server
```bash
npm run build
npm start
```
- Serves the React build from Express on port 8001

## API Endpoints
- `GET /tinder/cards` — Get all cards
- `POST /tinder/cards` — Add a new card

## Deployment
- Frontend is auto-deployed to GitHub Pages via GitHub Actions on every push/merge to `main`.
- See `.github/workflows/deploy.yml` for details.

## Project Structure
```
/                  # Project root
  /client/         # React frontend
    /public/       # React public assets
    /src/          # React source code
      components/  # React components
      styles/      # CSS files
      utils/       # Utility JS (e.g., axios.js)
      index.js
      index.css
      ...
  /server/         # Express backend
    models/        # Mongoose models
    addTestCards.js# Script to seed DB
    server.js      # Express server
  package.json     # Unified dependencies/scripts
  ...
```

## Notes
- All import paths have been updated to reflect the new structure. If you add new files, follow the same organization.
- To seed the database, run `node server/addTestCards.js` from the project root.

## License
MIT
