import { closeOrdersRequest } from "../services/orderService";

export const handleSelectAll = (selectAll: boolean, data: any[]) => {
    const newSelectAll = !selectAll;
    const newFilasSeleccionadas = new Array(data.length).fill(newSelectAll);
    return { newSelectAll, newFilasSeleccionadas };
};

export const handleSelectFila = (index: number, filasSeleccionadas: boolean[]) => {
    const newfilasSeleccionadas = [...filasSeleccionadas];
    newfilasSeleccionadas[index] = !newfilasSeleccionadas[index];
    return newfilasSeleccionadas;
};

export const handleExpandirFila = (index: number, filasExpandidas: number[]) => {
    if (filasExpandidas.includes(index)) {
        return filasExpandidas.filter(rowIndex => rowIndex !== index);
    } else {
        return [...filasExpandidas, index];
    }
};

export const handleCerrarOrden = async (data: any[], filasSeleccionadas: boolean[], fetchData: Function, TIMEOUTFETCH: number, setMensajeError: Function, setMensajeExito: Function, setEnviando: Function) => {
    setEnviando(true);

    const ordenesSeleccionadas = data.filter((_, index) => filasSeleccionadas[index]).map((item: any) => ({
        orden_servicio_tejeduria_id: item.orden,
        estado: "CERRADO",
    }));

    if (ordenesSeleccionadas.length === 0) {
        setMensajeError("Ninguna orden seleccionada. Por favor, seleccione las órdenes que desea cerrar.");
        setTimeout(() => setEnviando(false), TIMEOUTFETCH);
        return;
    }

    const detallesOrden = ordenesSeleccionadas.map((orden: any) => `OS: ${orden.orden_servicio_tejeduria_id}`).join(", ");

    setMensajeError(null); // Resetear mensaje de error si todo está correcto

    try {
        await closeOrdersRequest(ordenesSeleccionadas);
        setMensajeExito(detallesOrden);
        fetchData(); // Actualizar datos
    } catch (error) {
        setMensajeError(`Error cerrando las órdenes. Conflictos: ${detallesOrden}`);
    }

    setTimeout(() => setEnviando(false), TIMEOUTFETCH);
};
