import axios from "axios";
import { toast } from "sonner";
import { authStore, logout } from "@/stores/auth";

// Create axios instance with base URL
export const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
});

// Add authorization token to all requests
api.interceptors.request.use(
  (config) => {
    const token = authStore.state.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle authentication errors and display error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.detail || "Something went wrong";

    if (status === 401) {
      logout();
      window.location.href = "/login";
    }

    toast.error(message);
    return Promise.reject(error);
  }
);