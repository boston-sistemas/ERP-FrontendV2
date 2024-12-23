import axios from 'axios';

const local = 'http://localhost:8000/';

const server = 'http://10.0.1.13:8000/';

const server2 = 'http://10.0.1.13:7000/';

const instance = axios.create({
  baseURL: server2,
  withCredentials: true,
});

export default instance;
