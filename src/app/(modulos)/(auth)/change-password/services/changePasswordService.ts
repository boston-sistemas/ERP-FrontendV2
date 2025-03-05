import instance from "@/infrastructure/config/AxiosConfig";

export const changeUserPassword = async (newPassword: string) => {
  return await instance.put("/security/v1/usuarios/me/password", {
    new_password: newPassword,
  });
};
