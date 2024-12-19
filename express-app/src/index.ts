import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import elasticClient from './config/elasticsearch';
import { runDemo } from './elasticsearch-demo';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const health = await elasticClient.cluster.health();
    res.json({ status: 'OK', elasticsearch: health });
  } catch (error) {
    console.log(error)
    res.status(500).json({ status: 'Error', message: error });
  }
});

runDemo()

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
}); 