import { useEffect } from "react";
import useLocalStorage from "./useLocalStorage";

const useColorMode = () => {
  const [colorMode, setColorMode] = useLocalStorage("color-theme", "light");

  useEffect(() => {
    // Función para detectar la preferencia del sistema
    const detectSystemPreference = () => {
      // Verifica si el usuario tiene configurado el modo oscuro en su sistema
      const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Obtiene el valor almacenado
      const storedTheme = localStorage.getItem("color-theme");
      
      // Si no hay tema almacenado, usa la preferencia del sistema
      if (!storedTheme) {
        setColorMode(prefersDarkMode ? "dark" : "light");
      }
    };

    // Detecta la preferencia del sistema solo si estamos en el navegador
    if (typeof window !== 'undefined') {
      detectSystemPreference();
    }

    const className = "dark";
    const bodyClass = window.document.body.classList;

    colorMode === "dark"
      ? bodyClass.add(className)
      : bodyClass.remove(className);
  }, [colorMode, setColorMode]);

  return [colorMode, setColorMode];
};

export default useColorMode;
