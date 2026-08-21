import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

// Add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data.error != "Invalid credentials"
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Categories API
export const categoryAPI = {
  getAll: () => API.get("/categories"),
  create: (data) => API.post("/categories", data),
  delete: (id) => API.delete(`/categories/${id}`),
};

// Products API
export const productAPI = {
  getAll: () => API.get("/products"),
  getOne: (id) => API.get(`/products/${id}`),
  create: (data) => API.post("/products", data),
  update: (id, data) => API.patch(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
  bulkCreate: (products) => API.post("/products/bulk/create", { products }),
  bulkUpdate: (products) => API.patch("/products/bulk/update", { products }),
  bulkDelete: (ids) => API.delete("/products/bulk/delete", { data: { ids } }),
};

export default API;
