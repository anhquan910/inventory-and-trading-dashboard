import axios from "axios";
import { toast } from "sonner";
import { authStore, logout } from "@/stores/auth";

export const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.detail || "Something went wrong";

    if (status === 401) {
      logout();
    }

    toast.error(message);
    return Promise.reject(error);
  }
);