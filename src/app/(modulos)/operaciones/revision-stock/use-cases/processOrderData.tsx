﻿export interface Detalle {
    tejido: string;
    ancho: string;
    programado: number;
    consumido: number;
    restante: number;
    merma: string;
    progreso: string;
    estado: string;
}

export interface Orden {
    orden: string;
    fecha: string;
    tejeduria: string;
    programado: number;
    consumido: number;
    restante: number;
    merma: string;
    progreso: string;
    estado: string;
    expandida: Detalle[];
}

const roundToTwo = (num: number) => Math.round(num * 100) / 100;

const calculateGlobalState = (detalles: any[]): string => {
    const estados = detalles.map((detalle: { estado: string; }) => detalle.estado);
    if (estados.every(estado => estado === "LISTO")) {
        return "LISTO";
    }
    if (estados.some(estado => estado === "DETENIDO")) {
        return "DETENIDO";
    }
    if (estados.some(estado => estado === "EN CURSO")) {
        return "EN CURSO";
    }
    return "NO INICIADO";
};

export const processOrderData = (orders: any[]): Orden[] => {
    return orders.map(order => {
        const totalProgramado = roundToTwo(order.detalles.reduce((sum: number, detalle: { programado_kg: string; }) => sum + parseFloat(detalle.programado_kg), 0));
        const totalConsumido = roundToTwo(order.detalles.reduce((sum: number, detalle: { reporte_tejeduria_cantidad_kg: string; }) => sum + parseFloat(detalle.reporte_tejeduria_cantidad_kg), 0));
        const totalRestante = roundToTwo(totalProgramado - totalConsumido);
        const totalMerma = ((totalRestante / totalProgramado) * 100).toFixed(2) + "%";
        const totalProgreso = ((totalConsumido / totalProgramado) * 100).toFixed(2) + "%";
        const estado = calculateGlobalState(order.detalles);

        return {
            orden: order.orden_servicio_tejeduria_id,
            fecha: order.fecha.slice(0,-9),
            tejeduria: order.tejeduria_id,
            programado: roundToTwo(totalProgramado),
            consumido: roundToTwo(totalConsumido),
            restante: roundToTwo(totalRestante),
            merma: totalMerma,
            progreso: totalProgreso,
            estado: estado,
            expandida: order.detalles.map((detalle: { crudo_id: any; programado_kg: any; reporte_tejeduria_cantidad_kg: any; estado: any; }) => ({
                tejido: detalle.crudo_id.slice(0, -2),
                ancho: detalle.crudo_id.slice(-2),
                programado: roundToTwo(parseFloat(detalle.programado_kg)),
                consumido: roundToTwo(parseFloat(detalle.reporte_tejeduria_cantidad_kg)),
                restante: roundToTwo(parseFloat(detalle.programado_kg) - parseFloat(detalle.reporte_tejeduria_cantidad_kg)),
                merma: ((parseFloat(detalle.programado_kg) - parseFloat(detalle.reporte_tejeduria_cantidad_kg)) / parseFloat(detalle.programado_kg) * 100).toFixed(2) + "%",
                progreso: (parseFloat(detalle.reporte_tejeduria_cantidad_kg) / parseFloat(detalle.programado_kg) * 100).toFixed(2) + "%",
                estado: detalle.estado
            }))
        };
    });
};