﻿import instance from "@/infrastructure/config/AxiosConfig";
import { YarnPurchaseEntryResponse } from "../../models/models";

export const fetchYarnPurchaseEntries = async (period: number, limit: number, offset: number): Promise<YarnPurchaseEntryResponse> => {
    const response = await instance.get<YarnPurchaseEntryResponse>(`/operations/v1/yarn-purchase-entries/?period=${period}&limit=${limit}&offset=${offset}&include_inactive=true`);
    return response.data;
}

export const fetchYarnPurchaseEntryDetails = async (entryNumber: string, period: number): Promise<YarnPurchaseEntryResponse> => {
    const response = await instance.get(`/operations/v1/yarn-purchase-entries/${entryNumber}?period=${period}`);
    return response.data;
  };