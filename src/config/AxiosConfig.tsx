import axios from 'axios';

const server = 'http://localhost:8000';
//const dev = 'https://327487x2-8080.brs.devtunnels.ms'
//const prod =

const instance = axios.create({
  baseURL: server
});

export default instance;