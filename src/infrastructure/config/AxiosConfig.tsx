import axios from 'axios';

const server = 'http://10.0.1.13:8000/';

const instance = axios.create({
  baseURL: server,
  withCredentials: true,
});

export default instance;
