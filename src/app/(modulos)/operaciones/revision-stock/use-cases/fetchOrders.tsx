import { fetchOrdersData } from "../services/orderService";
export async function fetchOrders() {
    try {
        const response = await fetchOrdersData();
        const data = response.data;
        return data;
    } catch (error) {
        console.error('Error fetching data', error);
        throw error;
    }
}
