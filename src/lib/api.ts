import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem('travelplusnovo_user');
  const token = localStorage.getItem('travelplusnovo_token');
  if (savedUser && token) {
    const user = JSON.parse(savedUser);
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-User-Role'] = user.role;
  }
  return config;
});

export const apiClient = {
  _baseUrl: API_URL,
  auth: {
    login: (data: { username: string; password: string }) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
  },
  customers: {
    getAll: () => api.get('/customers'),
    create: (data: any) => api.post('/customers', data),
  },
  bookings: {
    getAll: () => api.get('/bookings'),
    create: (data: any) => api.post('/bookings', data),
    update: (id: number, data: any) => api.put(`/bookings/${id}`, data),
    delete: (id: number) => api.delete(`/bookings/${id}`),
  },
  dashboard: { getStats: () => api.get('/dashboard/stats') },
  financial: {
    getBudgets: (config?: any) => api.get('/financial/budgets', config),
    getExpenses: (config?: any) => api.get('/financial/expenses', config),
    getRevenues: (config?: any) => api.get('/financial/revenues', config),
    getAllocations: () => api.get('/financial/allocations'),
    getProfitability: () => api.get('/financial/profitability'),
    getVendorInvoices: () => api.get('/financial/vendor-invoices'),
    getExpenseDrilldown: () => api.get('/financial/expenses/drilldown'),
    getApprovals: () => api.get('/financial/approvals'),
    createBudget: (data: any) => api.post('/financial/budgets', data),
    createExpense: (data: any) => api.post('/financial/expenses', data),
    createRevenue: (data: any) => api.post('/financial/revenues', data),
    createAllocation: (data: any) => api.post('/financial/allocations', data),
    createVendorInvoice: (data: any) => api.post('/financial/vendor-invoices', data),
    approveExpense: (id: number, data: any) => api.post(`/financial/expenses/${id}/approve`, data),
  },
  slm: {
    getServiceLevels: () => api.get('/slm/service-levels'),
    getSLAContracts: () => api.get('/slm/sla-contracts'),
    getRequirements: () => api.get('/slm/requirements'),
    getIncidents: () => api.get('/slm/incidents'),
    getMetrics: () => api.get('/slm/metrics'),
    getPartnerRatings: () => api.get('/slm/partner-ratings'),
    createServiceLevel: (data: any) => api.post('/slm/service-levels', data),
    createSLAContract: (data: any) => api.post('/slm/sla-contracts', data),
    createRequirement: (data: any) => api.post('/slm/requirements', data),
    createIncident: (data: any) => api.post('/slm/incidents', data),
    createMetric: (data: any) => api.post('/slm/metrics', data),
    updateSLAContract: (id: number, data: any) => api.put(`/slm/sla-contracts/${id}`, data),
    updateRequirement: (id: number, data: any) => api.put(`/slm/requirements/${id}`, data),
    updateIncident: (id: number, data: any) => api.put(`/slm/incidents/${id}`, data),
    escalateIncident: (id: number, data: any) => api.post(`/slm/incidents/${id}/escalate`, data),
    downloadSLAContract: (id: number) => `${API_URL}/api/slm/sla-contracts/${id}/pdf`,
    getOLAContracts: () => api.get('/slm/ola-agreements'),
    createOLAContract: (data: any) => api.post('/slm/ola-agreements', data),
    updateOLAContract: (id: number, data: any) => api.put(`/slm/ola-agreements/${id}`, data),
    downloadOLAContract: (id: number) => `${API_URL}/api/slm/ola-agreements/${id}/pdf`,
  },
};

export default api;
