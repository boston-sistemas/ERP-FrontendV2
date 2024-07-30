import axios from 'axios';

const server = 'http://localhost:8000';

const instance = axios.create({
  baseURL: server,
  withCredentials: true,
});

export default instance;
