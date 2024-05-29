export const ColorDeEstadoOrden = (status: string) => {
    switch (status) {
      case "En curso":
        return "bg-warning text-warning";
      case "Listo":
        return "bg-success text-success";
      case "Detenido":
        return "bg-danger text-danger";
      default:
        return "bg-black text-gray-200";
    }
  };
