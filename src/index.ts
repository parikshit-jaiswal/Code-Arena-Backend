import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';


dotenv.config({
    path: './.env',
});

const port: number = parseInt(process.env.PORT || '8080');

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server started on port: ${port}`);
            console.log(`http://localhost:${port}`);
        });
    })
    .catch((err: unknown) => {
        console.error('MONGO DB connection failed!!!', err);
    });