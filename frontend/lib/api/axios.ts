import axios, { CreateAxiosDefaults } from "axios";

const options: CreateAxiosDefaults = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
};

const API = axios.create(options);

const APIRefresh = axios.create(options);
APIRefresh.interceptors.response.use((response) => {
  return response;
});

API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { data, status } = error?.response || {};

    if (data.errorCode === "AUTH_TOKEN_NOT_FOUND" && status === 401) {
      try {
        await APIRefresh.get("/auth/refresh");
        return APIRefresh(error.config);
      } catch (error) {
        if (typeof window !== "undefined") window.location.href = "/";
      }
    }
    return Promise.reject({
      ...data,
    });
  }
);
export { API };
