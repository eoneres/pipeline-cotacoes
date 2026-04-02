import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 10000,
});

// Interceptor para logs
api.interceptors.request.use(
    (config) => {
        console.log(`📡 ${config.method.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Erro na requisição:', error);
        return Promise.reject(error);
    }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.error?.message || 'Erro na comunicação com o servidor';
        toast.error(message);
        return Promise.reject(error);
    }
);

export default api;