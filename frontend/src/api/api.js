import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// Add token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Categories API
export const categoryAPI = {
    getAll: () => API.get('/categories'),
    create: (data) => API.post('/categories', data),
    delete: (id) => API.delete(`/categories/${id}`),
};

// Products API
export const productAPI = {
    getAll: () => API.get('/products'),
    getOne: (id) => API.get(`/products/${id}`),
    create: (data) => API.post('/products', data),
    update: (id, data) => API.patch(`/products/${id}`, data),
    delete: (id) => API.delete(`/products/${id}`),
    bulkCreate: (products) => API.post('/products/bulk/create', { products }),
    bulkUpdate: (products) => API.patch('/products/bulk/update', { products }),
    bulkDelete: (ids) => API.delete('/products/bulk/delete', { data: { ids } }),
};

export default API;