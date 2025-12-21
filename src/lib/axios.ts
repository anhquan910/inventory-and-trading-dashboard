import axios from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || "Something went wrong";
    toast.error(message);
    return Promise.reject(error);
  }
);