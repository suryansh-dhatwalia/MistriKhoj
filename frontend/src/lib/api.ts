import axios from 'axios';
import { clientEnv } from '../config/env';

export const api = axios.create({
  baseURL: clientEnv.apiUrl,
  timeout: 60_000,
  headers: {
    'Content-Type': 'application/json'
  }
});
