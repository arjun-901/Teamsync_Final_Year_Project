import { CustomError } from "@/types/custom-error.type";
import axios from "axios";
import { baseURL } from "./base-url";

const options = {
  baseURL,
  withCredentials: true,
  timeout: 10000,
};

const API = axios.create(options);

API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const data = error?.response?.data;
    const status = error?.response?.status;

    if (data === "Unauthorized" && status === 401) {
      window.location.href = "/";
    }

    const extractedMessage =
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : undefined) ||
      error?.message ||
      "Something went wrong. Please try again.";

    const customError: CustomError = {
      ...error,
      message: extractedMessage,
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
    };

    return Promise.reject(customError);
  }
);

export default API;
