import axios from 'axios';

const server = 'http://10.0.1.135:8000';

const instance = axios.create({
  baseURL: server,
  withCredentials: true,
});

export default instance;
