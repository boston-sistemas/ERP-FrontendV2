export const ColorDeEstadoOrden = (status: string) => {
    switch (status) {
      case "EN CURSO":
        return "bg-warning text-warning";
      case "LISTO":
        return "bg-success text-success";
      case "DETENIDO":
        return "bg-danger text-danger";
      default:
        return "bg-black text-gray-200";
    }
  };
