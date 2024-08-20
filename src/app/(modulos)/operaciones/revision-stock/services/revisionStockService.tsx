import instance from "@/infrastructure/config/AxiosConfig";

export const fetchOrdersData = () => {
    return instance.get('/operations/v1/revision-stock');
};

export const closeOrdersRequest = (ordenesSeleccionadas: any[]) => {
    return instance.put('/operations/v1/revision-stock/ordenes', { ordenes: ordenesSeleccionadas });
};

