'use client';

import { useEffect, useState } from 'react';
import { AuditoriaListService, AuditoriaDetailService, AuditLog, AuditLogDetail, AuditLogFilters } from '../../services/AuditoriaService';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Pagination,
  TextField,
  Box,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Tooltip,
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

// Métodos HTTP comunes
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

// Función para determinar el color del estado basado en el código de estado
const getStatusColor = (statusCode: number): string => {
  if (statusCode >= 200 && statusCode < 300) {
    return 'bg-green-500'; // Verde para códigos 2xx (éxito)
  } else if (statusCode >= 300 && statusCode < 400) {
    return 'bg-blue-500'; // Azul para códigos 3xx (redirección)
  } else if (statusCode >= 400 && statusCode < 500) {
    return 'bg-orange-500'; // Naranja para códigos 4xx (error del cliente)
  } else if (statusCode >= 500) {
    return 'bg-red-500'; // Rojo para códigos 5xx (error del servidor)
  }
  return 'bg-gray-500'; // Gris para otros códigos
};

// Función para formatear y colorear JSON
const JsonRenderer = ({ data }: { data: any }) => {
  if (!data) return (
    <div className="text-gray-500 italic p-4">
      No hay datos que mostrar
    </div>
  );
  
  // Si es un string que parece JSON, intentamos parsearlo
  if (typeof data === 'string' && (data.startsWith('{') || data.startsWith('['))) {
    try {
      data = JSON.parse(data);
    } catch (e) {
      // Si no se puede parsear, lo dejamos como string
    }
  }
  
  // Si es un objeto o array vacío
  if ((typeof data === 'object' && data && Object.keys(data).length === 0) || 
      (Array.isArray(data) && data.length === 0)) {
    return (
      <div className="text-gray-500 italic p-4">
        Objeto vacío
      </div>
    );
  }

  // Si es un string simple
  if (typeof data === 'string') {
    return <div className="p-4 text-gray-800">{data}</div>;
  }

  // Función recursiva para renderizar el JSON con estilos
  const renderJson = (obj: any, indent = 0, isLast = true, path = '', isArrayItem = false) => {
    // Si el objeto es null o undefined
    if (obj === null || obj === undefined) {
      return (
        <span className="text-gray-500">
          {obj === null ? 'null' : 'undefined'}
        </span>
      );
    }
    
    // Determinamos el tipo de dato
    const type = Array.isArray(obj) ? 'array' : typeof obj;
    
    if (type !== 'object' && type !== 'array') {
      // Valores primitivos
      let valueClass = 'text-blue-600'; // número por defecto
      
      if (type === 'string') {
        valueClass = 'text-green-600';
        obj = `"${obj}"`;
      } else if (type === 'boolean') {
        valueClass = 'text-purple-600';
      } else if (obj === null) {
        valueClass = 'text-gray-500';
        obj = 'null';
      }
      
      return (
        <span className={valueClass}>
          {obj}
        </span>
      );
    }
    
    const isArray = Array.isArray(obj);
    const bracketOpen = isArray ? '[' : '{';
    const bracketClose = isArray ? ']' : '}';
    
    // Verificamos que obj no sea null o undefined antes de usar Object.keys
    const items = isArray ? obj : (obj ? Object.keys(obj) : []);
    
    if (items.length === 0) {
      return (
        <span>
          {bracketOpen}{bracketClose}
        </span>
      );
    }
    
    return (
      <div style={{ paddingLeft: `${indent > 0 ? 20 : 0}px` }}>
        <span className="text-gray-800 font-mono">{bracketOpen}</span>
        <div className="ml-4 border-l-2 border-gray-200 pl-2">
          {isArray ? (
            // Renderizamos arrays
            items.map((item: any, index: number) => (
              <div key={`${path}_${index}`} className="my-1">
                {renderJson(item, indent + 1, index === items.length - 1, `${path}[${index}]`, true)}
                {index < items.length - 1 && <span className="text-gray-500">,</span>}
              </div>
            ))
          ) : (
            // Renderizamos objetos
            Object.keys(obj).map((key, index) => (
              <div key={`${path}.${key}`} className="my-1">
                <span className="text-red-600 mr-2 font-mono">"{key}"</span>
                <span className="text-gray-800 mr-2">:</span>
                {renderJson(obj[key], indent + 1, index === Object.keys(obj).length - 1, `${path}.${key}`)}
                {index < Object.keys(obj).length - 1 && <span className="text-gray-500">,</span>}
              </div>
            ))
          )}
        </div>
        <span className="text-gray-800 font-mono">{bracketClose}</span>
        {!isLast && !isArrayItem && <span className="text-gray-500">,</span>}
      </div>
    );
  };

  return (
    <Paper elevation={0} className="p-4 bg-gray-50 rounded-md overflow-auto max-h-[500px]">
      <div className="font-mono text-sm">
        {renderJson(data)}
      </div>
    </Paper>
  );
};

const RegistroAuditoria = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogData, setDialogData] = useState<any>(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detailCache, setDetailCache] = useState<Record<string, AuditLogDetail>>({});
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedField, setSelectedField] = useState<string>('');
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  const formatDate = (dateStr: string): string => {
    // La fecha viene en formato "dd-MM-yyyy HH:mm:ss"
    if (!dateStr) return '';
    
    const parts = dateStr.split(' ');
    const dateParts = parts[0].split('-');
    
    return `${dateParts[0]}/${dateParts[1]}/${dateParts[2]} ${parts[1] || ''}`;
  };

  const handleViewData = async (field: string, title: string, auditId: string) => {
    try {
      setLoadingDetail(true);
      setSelectedField(field);
      
      // Si ya tenemos los detalles en caché, los usamos
      if (detailCache[auditId]) {
        setDialogData(detailCache[auditId][field]);
        setDialogTitle(title);
        setOpenDialog(true);
        return;
      }

      // Si no está en caché, hacemos la petición
      const detail = await AuditoriaDetailService.getAuditLogDetail(auditId);
      
      // Guardamos en caché
      setDetailCache(prev => ({
        ...prev,
        [auditId]: detail
      }));

      setDialogData(detail[field]);
      setDialogTitle(title);
      setOpenDialog(true);
    } catch (err) {
      console.error('Error al obtener detalles:', err);
      setError('Error al cargar los detalles del registro');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogData(null);
    setSelectedField('');
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleStartDateChange = (date: dayjs.Dayjs | null) => {
    setStartDate(date);
    setPage(1); // Reiniciar a la primera página al cambiar la fecha
  };

  const handleEndDateChange = (date: dayjs.Dayjs | null) => {
    setEndDate(date);
    setPage(1); // Reiniciar a la primera página al cambiar la fecha
  };

  const handleMethodChange = (event: SelectChangeEvent) => {
    setSelectedMethod(event.target.value);
    setPage(1); // Reiniciar a la primera página al cambiar el método
  };

  const handleUserIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(event.target.value);
    setPage(1); // Reiniciar a la primera página al cambiar el usuario
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedMethod('');
    setUserId('');
    setPage(1);
  };

  const isEmptyObject = (obj: any) => {
    return obj && Object.keys(obj).length === 0;
  };

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        
        const filters: AuditLogFilters = { page };
        
        if (startDate) {
          filters.start_date = startDate.format('YYYY-MM-DD');
        }
        
        if (endDate) {
          filters.end_date = endDate.format('YYYY-MM-DD');
        }
        
        if (selectedMethod) {
          filters.actions = [selectedMethod];
        }

        if (userId) {
          filters.user_ids = [parseInt(userId, 10)];
        }
        
        const response = await AuditoriaListService.getAuditLogs(filters);
        setAuditLogs(response.audit_action_logs);
        setTotalPages(response.total_pages);
      } catch (err) {
        setError('Error al cargar los datos de auditoría');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [page, startDate, endDate, selectedMethod, userId]);

  if (loading) {
    return <div className="text-center p-4">Cargando datos de auditoría...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full">
      <Box className="mb-4">
        <Box className="flex flex-col md:flex-row gap-3 mb-4">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <DatePicker
                label="Fecha inicio"
                value={startDate}
                onChange={handleStartDateChange}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { width: '160px' }
                  }
                }}
              />
              <DatePicker
                label="Fecha fin"
                value={endDate}
                onChange={handleEndDateChange}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { width: '160px' }
                  }
                }}
              />
            </Stack>
          </LocalizationProvider>
          
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="method-select-label">Método</InputLabel>
            <Select
              labelId="method-select-label"
              id="method-select"
              value={selectedMethod}
              onChange={handleMethodChange}
              label="Método"
              displayEmpty
            >
              <MenuItem value="">
              </MenuItem>
              {HTTP_METHODS.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="ID Usuario"
            value={userId}
            onChange={handleUserIdChange}
            size="small"
            sx={{ width: '150px' }}
            type="number"
            inputProps={{ min: 1 }}
          />
          
          {(startDate || endDate || selectedMethod || userId) && (
            <Button 
              variant="outlined" 
              color="primary" 
              size="small"
              onClick={handleClearFilter}
            >
              Limpiar filtros
            </Button>
          )}
        </Box>
      </Box>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-blue-900 uppercase text-center text-white">
              <th className="px-2 py-2 text-center font-normal w-[100px]">ID</th>
              <th className="px-2 py-2 text-center font-normal w-[120px]">Usuario</th>
              <th className="px-2 py-2 text-center font-normal w-[100px]">Método</th>
              <th className="px-2 py-2 text-center font-normal w-[150px]">Endpoint</th>
              <th className="px-2 py-2 text-center font-normal w-[150px]">Path Params</th>
              <th className="px-2 py-2 text-center font-normal w-[150px]">Query Params</th>
              <th className="px-2 py-2 text-center font-normal w-[150px]">Request Data</th>
              <th className="px-2 py-2 text-center font-normal w-[150px]">Response Data</th>
              <th className="px-2 py-2 text-center font-normal w-[150px]">Data Logs</th>
              <th className="px-2 py-2 text-center font-normal w-[150px]">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan={10} className="border-b border-gray-300 px-2 py-4 text-center text-gray-500">
                  No hay registros para mostrar
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id} className="text-center text-black hover:bg-gray-50">
                  <td className="border-b border-gray-300 px-2 py-2">{log.id}</td>
                  <td className="border-b border-gray-300 px-2 py-2">{log.user_id || 'No especificado'}</td>
                  <td className="border-b border-gray-300 px-2 py-2">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span>{log.action}</span>
                      <Tooltip title={`Código de estado: ${log.status_code}`} arrow>
                        <span 
                          className={`inline-block w-[60px] py-1 px-2 rounded-full text-white text-xs font-medium ${getStatusColor(log.status_code)}`}
                        >
                          {log.status_code}
                        </span>
                      </Tooltip>
                    </div>
                  </td>
                  <td className="border-b border-gray-300 px-2 py-2">{log.endpoint_name}</td>
                  <td className="border-b border-gray-300 px-2 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <IconButton 
                        onClick={() => handleViewData('path_params', 'Path Params', log.id)}
                        size="small"
                      >
                        <VisibilityIcon style={{ color: "#1976d2" }} />
                      </IconButton>
                    </div>
                  </td>
                  <td className="border-b border-gray-300 px-2 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <IconButton 
                        onClick={() => handleViewData('query_params', 'Query Params', log.id)}
                        size="small"
                      >
                        <VisibilityIcon style={{ color: "#1976d2" }} />
                      </IconButton>
                    </div>
                  </td>
                  <td className="border-b border-gray-300 px-2 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <IconButton 
                        onClick={() => handleViewData('request_data', 'Request Data', log.id)}
                        size="small"
                      >
                        <VisibilityIcon style={{ color: "#1976d2" }} />
                      </IconButton>
                    </div>
                  </td>
                  <td className="border-b border-gray-300 px-2 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <IconButton 
                        onClick={() => handleViewData('response_data', 'Response Data', log.id)}
                        size="small"
                      >
                        <VisibilityIcon style={{ color: "#1976d2" }} />
                      </IconButton>
                    </div>
                  </td>
                  <td className="border-b border-gray-300 px-2 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <IconButton 
                        onClick={() => handleViewData('audit_data_logs', 'Data Logs', log.id)}
                        size="small"
                      >
                        <VisibilityIcon style={{ color: "#1976d2" }} />
                      </IconButton>
                    </div>
                  </td>
                  <td className="border-b border-gray-300 px-2 py-2">
                    {formatDate(log.at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4">
        <Pagination 
          count={totalPages} 
          page={page} 
          onChange={handlePageChange}
          color="primary"
          size="large"
        />
      </div>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            {dialogTitle}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {loadingDetail ? (
            <Typography className="text-center text-gray-500">
              Cargando detalles...
            </Typography>
          ) : isEmptyObject(dialogData) ? (
            <Typography className="text-center text-gray-500">
              No hay datos que mostrar
            </Typography>
          ) : (
            <JsonRenderer data={dialogData} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RegistroAuditoria;
