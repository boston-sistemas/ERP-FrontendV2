import instance from "@/infrastructure/config/AxiosConfig";

export const loginUser = async (username: string, password: string, token: string) => {
  const response = await instance.post('/security/v1/auth/login', { username, password, token });
  return response;
};

export const resendAuthToken = async (username: string, password: string) => {
  const response = await instance.post('/security/v1/auth/send-token', { username, password });
  return response;
};
