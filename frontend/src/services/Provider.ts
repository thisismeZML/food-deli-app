import axios from "axios";
import { useUserStore } from "@/stores/user.store";

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "bypass-tunnel-reminder": "1",
  },
  withCredentials: true, // REQUIRED for httpOnly cookies
});

/* =========================
   GLOBAL 401 HANDLER
========================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear auth state
      const { setUser, setRole } = useUserStore.getState();
      setUser(null);
      setRole(null);

      // Redirect to login
      window.location.href = "/signin";
    }

    return Promise.reject(error);
  }
);

export default api;
