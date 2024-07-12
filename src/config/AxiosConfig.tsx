import axios from 'axios';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const server = 'http://localhost:8000';

const instance = axios.create({
  baseURL: server,
  withCredentials: true,
});

export default instance;
