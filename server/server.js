import express from 'express';
import mongoose from 'mongoose';
import Cors from 'cors';
import Cards from './dbCards.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//App Config
const app = express();
const port = process.env.PORT || 8001;
const connection_url = 'mongodb://localhost:27017/myFirstDatabase';

//Middleware
app.use(express.json())
app.use(Cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

//DB Config
mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

//API Endpoints
app.get('/', (req, res) => {
    res.status(200).send('Hello World!!')
});

app.post('/tinder/Cards', async (req, res) => {
    const dbCard = req.body;
    try {
        const data = await Cards.create(dbCard);
        res.status(201).send(data);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/tinder/Cards', async (req, res) => {
    try {
        const data = await Cards.find();
        res.status(200).send(data);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Fallback: serve React index.html for any unknown route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

//Listener
app.listen(port, () => console.log(`Listening on Localhost: ${port}`));