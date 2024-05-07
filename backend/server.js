import express from 'express';
import router from './routes.js';
import cors from 'cors';

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.use(router);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})



