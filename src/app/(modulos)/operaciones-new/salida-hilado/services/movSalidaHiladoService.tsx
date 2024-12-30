import instance from "@/infrastructure/config/AxiosConfig";
import { YarnDispatch, YarnDispatchDetail, YarnDispatchResponse } from "../../models/models";

export const fetchYarnDispatches = async (
    period: number,
    limit: number,
    offset: number
    ): Promise<YarnDispatchResponse> => {
    const response = await instance.get<YarnDispatchResponse>(
        `/operations/v1/yarn-weaving-dispatches/?period=${period}&limit=${limit}&offset=${offset}&include_inactive=true`
    );
    console.log(response.data);
    return response.data;
    }

export const fetchYarnDispatchByNumber = async (
        exitNumber: string,
        period: number
      ): Promise<YarnDispatch> => {
        const response = await instance.get<YarnDispatch>(
          `/operations/v1/yarn-weaving-dispatches/${exitNumber}?period=${period}`
        );
        return response.data;
      };
      