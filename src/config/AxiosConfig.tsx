import axios from 'axios';

const server = 'http://localhost:8000'; //lOCAL
//const server ='http://10.0.1.9:8000/'; // PRODUCCION

const instance = axios.create({
  baseURL: server
});

export default instance;