import axios from 'axios';

const api = axios.create({
  // Isso lê a variável da Vercel ou usa o localhost se você estiver no VS Code
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

export default api;