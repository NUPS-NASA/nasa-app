import 'dotenv/config';
import express from 'express';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => res.send('Hello World!'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API listening on ${PORT}`));
