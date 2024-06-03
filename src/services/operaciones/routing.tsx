import instance from "@/config/AxiosConfig";


export const RevisionStock = async () => {
    try {
      console.log("Llamando")
      const response = await instance.get('/api/v1/modulo1/revision-stock/');
      return response.data;
    } catch (error) {
      console.error('Error fetching data', error);
      return { ordenes_pendientes: [], ordenes_cerradas: [] };
    }
  };


