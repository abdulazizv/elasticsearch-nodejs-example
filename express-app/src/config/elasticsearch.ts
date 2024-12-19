import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

const elasticClient = new Client({
  node: process.env.ELASTICSEARCH_NODE,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || '',
  },
  tls: {
    rejectUnauthorized: false // Only for development
  }
});

export default elasticClient; 