import axios from 'axios';
import { server } from '../config/Server';

const instance = axios.create({
  baseURL: server
});

export default instance;