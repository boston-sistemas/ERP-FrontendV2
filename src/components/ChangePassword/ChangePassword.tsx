"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LanguageIcon from "@mui/icons-material/Language";
import instance from "@/config/AxiosConfig";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ChangePassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const userDisplayName = localStorage.getItem("user_display_name");

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setSnackbarMessage("Las contraseñas no coinciden.");
      setOpenSnackbar(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await instance.post("/security/v1/usuarios/me/password", {
        new_password: newPassword,
      });

      if (response.status === 200) {
        localStorage.removeItem("reset_password_at");
        setSnackbarMessage("Contraseña cambiada correctamente.");
        setOpenSnackbar(true);
        setTimeout(() => {
          router.push("/inicio");
        }, 2000);
      } else {
        throw new Error("Error al cambiar la contraseña.");
      }
    } catch (error) {
      setSnackbarMessage("Error al cambiar la contraseña.");
      setOpenSnackbar(true);
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-wrap flex-1">
        <div className="md:w-1/2 w-full bg-blue-900 p-4 md:order-1 flex items-center justify-center">
          <div className="flex flex-col items-center max-w-md text-center">
            <div style={{ width: 200, height: 200, position: "relative" }}>
              <Image
                src="/images/password-reset.png"
                alt="Logo de Password Reset"
                fill
                priority
                placeholder="blur"
                blurDataURL="/images/password-reset.png"
              />
            </div>
            <p className="text-white mt-4 text-2xl font-bold">Hola, {userDisplayName}</p>
            <p className="text-white mt-2 text-lg">Tu contraseña necesita ser cambiada.</p>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center w-full bg-white p-4 md:w-1/2 md:order-2">
          <div className="w-full max-w-md px-2 sm:px-6">
            <div className="flex flex-col items-center">
              <form className="w-full" onSubmit={handleSubmit}>
                <TextField
                  type={showPassword ? "text" : "password"}
                  id="new-password"
                  label="Nueva Contraseña"
                  variant="standard"
                  margin="normal"
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label="toggle password visibility" onClick={toggleShowPassword}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  type={showPassword ? "text" : "password"}
                  id="confirm-password"
                  label="Confirmar Contraseña"
                  variant="standard"
                  margin="normal"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label="toggle password visibility" onClick={toggleShowPassword}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <button
                  type="submit"
                  className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-500 transition duration-300 ease-in-out flex justify-center items-center"
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : "Cambiar Contraseña"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <footer className="w-full p-1 bg-zinc-800 text-white flex justify-center items-center mt-auto">
        <span>© {new Date().getFullYear()} MECSA. Todos los derechos reservados.</span>
        <div className="ml-4 mr-4"></div>
        <div className="flex space-x-4">
          <a href="https://www.instagram.com/bostonropainterior/" target="_blank" rel="noopener noreferrer">
            <IconButton aria-label="Instagram" color="inherit">
              <InstagramIcon />
            </IconButton>
          </a>
          <a href="https://www.facebook.com/BostonOficial/" target="_blank" rel="noopener noreferrer">
            <IconButton aria-label="Facebook" color="inherit">
              <FacebookIcon />
            </IconButton>
          </a>
          <a href="https://www.boston.com.pe/" target="_blank" rel="noopener noreferrer">
            <IconButton aria-label="Web page" color="inherit">
              <LanguageIcon />
            </IconButton>
          </a>
        </div>
      </footer>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: "100%", alignItems: "center" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ChangePassword;