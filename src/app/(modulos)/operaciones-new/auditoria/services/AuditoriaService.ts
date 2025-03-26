import instance from "@/infrastructure/config/AxiosConfig";

export interface AuditLog {
  id: string;
  user_id: string | null;
  endpoint_name: string;
  ip: string;
  action: string;
  path_params: Record<string, any>;
  query_params: Record<string, any>;
  request_data: Record<string, any>;
  response_data: Record<string, any>;
  user_agent: string;
  status_code: number;
  at: string;
  audit_data_logs: any[];
}

export interface AuditLogsResponse {
  audit_action_logs: AuditLog[];
  total: number;
  page: number;
  total_pages: number;
}

export interface AuditLogDetail extends AuditLog {
  [key: string]: any; // Para permitir acceso por índice de string
}

export interface AuditLogFilters {
  page?: number;
  start_date?: string;
  end_date?: string;
  user_ids?: number[];
  actions?: string[];
}

export const AuditoriaListService = {
  getAuditLogs: async (filters: AuditLogFilters): Promise<AuditLogsResponse> => {
    const { page = 1, start_date, end_date, user_ids, actions } = filters;
    
    let url = `/security/v1/audit/?page=${page}`;
    
    if (start_date) {
      url += `&start_date=${start_date}`;
    }
    
    if (end_date) {
      url += `&end_date=${end_date}`;
    }
    
    if (user_ids && user_ids.length > 0) {
      url += `&user_ids=${user_ids.join(',')}`;
    }
    
    if (actions && actions.length > 0) {
      url += `&actions=${actions.join(',')}`;
    }
    
    const response = await instance.get(url);
    return response.data;
  }
};

export const AuditoriaDetailService = {
  getAuditLogDetail: async (auditId: string): Promise<AuditLogDetail> => {
    const response = await instance.get(`/security/v1/audit/${auditId}`);
    return response.data;
  }
};
