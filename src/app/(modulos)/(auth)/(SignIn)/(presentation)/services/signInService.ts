import instance from "@/infrastructure/config/AxiosConfig";
import axios from "axios";

export const sendAuthToken = async (username: string, password: string) => {
  return await instance.post("/security/v1/auth/send-token", { username, password });
};

export const verifyRecaptcha = async (token: string) => {
  return await axios.post("/api/verify-recaptcha", { token });
};
