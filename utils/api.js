// utils/api.js
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'https://memis-90605b282646.herokuapp.com/api';

// Authentication functions
export const loginUser = async (email, password, rememberMe) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login/`, { email, password });

        // Extract tokens and user data
        const { refresh, access, user } = response.data;

        if (rememberMe) {
            // Securely store tokens in cookies only if rememberMe is checked
            Cookies.set('memis-r', refresh, { secure: true, sameSite: 'Strict', expires: 7 });
            Cookies.set('memis-a', access, { secure: true, sameSite: 'Strict', expires: 7 });

            // Store user data in cookies for easy access
            Cookies.set('memis-u', JSON.stringify(user), { secure: true, sameSite: 'Strict', expires: 7 });
        }

        return { success: true, data: response.data };
    } catch (error) {
        console.error('Login API Error:', error.response?.data || error);
        return {
            success: false,
            message: error.response?.data?.detail || 'An error occurred. Please try again.'
        };
    }
};

export const verifyAccessToken = async (token) => {
    try {
        await axios.post(`${API_BASE_URL}/login/token-verify/`, { token });
        return { success: true };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.detail || 'Token verification failed.'
        };
    }
};

export const refreshAccessToken = async () => {
    try {
        const refreshToken = Cookies.get('memis-r');
        if (!refreshToken) {
            return { success: false, message: 'No refresh token found' };
        }

        const response = await axios.post(`${API_BASE_URL}/login/token-refresh/`, { refresh: refreshToken });

        // Extract new tokens
        const { access } = response.data;

        // Update stored tokens
        Cookies.set('memis-a', access, { secure: true, sameSite: 'Strict', expires: 7 });

        return { success: true, accessToken: access };
    } catch (error) {
        console.error('Token Refresh Error:', error.response?.data || error);
        return {
            success: false,
            message: error.response?.data?.detail || 'Failed to refresh access token. Please log in again.'
        };
    }
};

export const checkUserSession = async () => {
    const accessToken = Cookies.get('memis-a');
    if (accessToken) {
        const verifyResponse = await verifyAccessToken(accessToken);
        if (verifyResponse.success) {
            return { success: true, message: 'User is authenticated' };
        }
    }

    const refreshToken = Cookies.get('memis-r');
    if (refreshToken) {
        const refreshResponse = await refreshAccessToken();
        if (refreshResponse.success) {
            return await verifyAccessToken(refreshResponse.accessToken);
        }
    }

    return { success: false, message: 'Session expired. Please log in again.' };
};

export const logoutUser = () => {
    // Clear all authentication cookies
    Cookies.remove('memis-r');
    Cookies.remove('memis-a');
    Cookies.remove('memis-u');

    // Redirect to login page
    window.location.href = '/login';
};

// Helper function to get authenticated API instance
const getAuthenticatedApi = () => {
    const accessToken = Cookies.get('memis-a');
    return axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
};

// API request with automatic token refresh
export const authenticatedRequest = async (method, endpoint, data = null) => {
    try {
        let api = getAuthenticatedApi();

        try {
            // Try the original request
            if (method === 'get') {
                return await api.get(endpoint);
            } else if (method === 'post') {
                return await api.post(endpoint, data);
            } else if (method === 'put') {
                return await api.put(endpoint, data);
            } else if (method === 'delete') {
                return await api.delete(endpoint);
            }
        } catch (error) {
            // If we get a 401 error, try to refresh the token
            if (error.response && error.response.status === 401) {
                const refreshResult = await refreshAccessToken();
                if (refreshResult.success) {
                    // Create a new API instance with the refreshed token
                    api = getAuthenticatedApi();

                    // Retry the request
                    if (method === 'get') {
                        return await api.get(endpoint);
                    } else if (method === 'post') {
                        return await api.post(endpoint, data);
                    } else if (method === 'put') {
                        return await api.put(endpoint, data);
                    } else if (method === 'delete') {
                        return await api.delete(endpoint);
                    }
                } else {
                    // If token refresh fails, redirect to login
                    window.location.href = '/login';
                    throw new Error('Authentication failed. Please log in again.');
                }
            } else {
                // If error is not related to authentication, re-throw it
                throw error;
            }
        }
    } catch (error) {
        console.error(`API Request Error (${endpoint}):`, error.response?.data || error);
        throw error;
    }
};

// Dashboard API Functions

// Get total equipment count
export const getTotalEquipment = async () => {
    try {
        const response = await authenticatedRequest('get', '/equipment/total/');
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.detail || 'Failed to fetch total equipment count'
        };
    }
};


// Get total inventory count
export const getTotalInventory = async () => {
    try {
      const response = await authenticatedRequest('get', '/inventory/total/');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch total inventory count'
      };
    }
  };

// Get equipment status summary
export const getEquipmentStatusSummary = async () => {
    try {
        const response = await authenticatedRequest('get', '/equipment-status/summary/');
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.detail || 'Failed to fetch equipment status summary'
        };
    }
};

// Get equipment types summary
export const getEquipmentTypesSummary = async () => {
    try {
        const response = await authenticatedRequest('get', '/equipment-type/summary/');
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.detail || 'Failed to fetch equipment types summary'
        };
    }
};

// Get maintenance activity overview
export const getMaintenanceActivityOverview = async () => {
    try {
        const response = await authenticatedRequest('get', '/maintenance-reports/overview/');
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.detail || 'Failed to fetch maintenance activity overview'
        };
    }
};

// Get upcoming maintenance schedules
export const getUpcomingMaintenanceSchedules = async () => {
    try {
        const response = await authenticatedRequest('get', '/maintenance/upcoming-schedules/');
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.detail || 'Failed to fetch upcoming maintenance schedules'
        };
    }
};


// Filter maintenance activity by date range
export const filterMaintenanceActivity = (activityData, timeRange) => {
    if (!activityData || !activityData.length) return [];

    const today = new Date();
    let startDate;

    switch (timeRange) {
        case 'Last 7 days':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            break;
        case 'Last 30 days':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 30);
            break;
        case 'Last 3 months':
        default:
            startDate = new Date(today);
            startDate.setMonth(today.getMonth() - 3);
            break;
    }

    // Filter data based on date range
    return activityData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= today;
    });
};

// Format maintenance activity data for charts
export const formatMaintenanceActivityForChart = (activityData) => {
    return activityData.map(item => ({
        date: formatDateForDisplay(item.date),
        preventive: item.preventive_maintenance,
        repair: item.repair,
        calibration: item.calibration
    }));
};

// Format date for display (YYYY-MM-DD to DD MMM)
export const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
};

// Format equipment types data for chart
export const formatEquipmentTypesForChart = (typesData) => {
    // Define type colors
    const typeColors = {
        diagnostic: '#3b82f6', // blue
        monitoring: '#10b981', // green
        life_support: '#f97316', // orange
        therapeutic: '#8b5cf6', // purple
        lab: '#ec4899', // pink
        hospital_industrial: '#6b7280', // gray
        safety_equipment: '#64748b', // slate
        other: '#1e293b' // dark slate
    };

    return Object.entries(typesData)
        .filter(([key]) => key !== 'total')
        .map(([key, value]) => ({
            type: formatEquipmentTypeName(key),
            count: value,
            color: typeColors[key] || '#6b7280' // default to gray if no color defined
        }));
};

// Format equipment type name for display
export const formatEquipmentTypeName = (typeName) => {
    // Convert snake_case to Title Case with spaces
    return typeName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Format equipment status data for pie chart
export const formatEquipmentStatusForPieChart = (statusData) => {
    return [
        { name: 'Functional', value: statusData.functional, color: '#4ade80' }, // green
        { name: 'Under Maintenance', value: statusData.under_maintenance, color: '#f97316' }, // orange
        { name: 'Non-functional', value: statusData.non_functional, color: '#ef4444' } // red
    ];
};

// Format upcoming maintenance schedules for display
export const formatUpcomingMaintenanceSchedules = (schedulesData) => {
    if (!schedulesData || !schedulesData.length) return [];
    
    return schedulesData.map(schedule => ({
        ...schedule,
        formattedDate: formatDateForDisplay(schedule.date),
        // Normalize activity type formatting
        activityType: schedule.activity_type 
            ? schedule.activity_type.charAt(0).toUpperCase() + schedule.activity_type.slice(1)
            : 'General Maintenance'
    }));
};

// Dashboard data fetch helper
export const fetchDashboardData = async () => {
    try {
        // Fetch all data in parallel
        const [
            totalEquipmentResponse,
            equipmentStatusResponse,
            equipmentTypesResponse,
            maintenanceActivityResponse,
            upcomingSchedulesResponse,
            totalInventoryResponse
        ] = await Promise.all([
            getTotalEquipment(),
            getEquipmentStatusSummary(),
            getEquipmentTypesSummary(),
            getMaintenanceActivityOverview(),
            getUpcomingMaintenanceSchedules(),
            getTotalInventory()
        ]);

        // Check for any failures
        if (!totalEquipmentResponse.success) {
            throw new Error(totalEquipmentResponse.error);
        }
        if (!equipmentStatusResponse.success) {
            throw new Error(equipmentStatusResponse.error);
        }
        if (!equipmentTypesResponse.success) {
            throw new Error(equipmentTypesResponse.error);
        }
        if (!maintenanceActivityResponse.success) {
            throw new Error(maintenanceActivityResponse.error);
        }
        if (!upcomingSchedulesResponse.success) {
            throw new Error(upcomingSchedulesResponse.error);
        }
        if (!totalInventoryResponse.success) {
            throw new Error(totalInventoryResponse.error);
          }

        // Prepare and format data
        const formattedMaintenanceActivity = formatMaintenanceActivityForChart(
            maintenanceActivityResponse.data
        );

        const formattedEquipmentTypes = formatEquipmentTypesForChart(
            equipmentTypesResponse.data
        );

        const formattedEquipmentStatus = formatEquipmentStatusForPieChart(
            equipmentStatusResponse.data
        );
        
        const formattedUpcomingSchedules = formatUpcomingMaintenanceSchedules(
            upcomingSchedulesResponse.data
        );

        return {
            success: true,
            data: {
                totalEquipment: totalEquipmentResponse.data.total_equipment,
                equipmentStatus: equipmentStatusResponse.data,
                equipmentTypes: equipmentTypesResponse.data,
                formattedEquipmentTypes,
                totalInventory: totalInventoryResponse.data.total_items,
                formattedEquipmentStatus,
                maintenanceActivity: maintenanceActivityResponse.data,
                formattedMaintenanceActivity,
                upcomingSchedules: upcomingSchedulesResponse.data,
                formattedUpcomingSchedules
            }
        };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch dashboard data'
        };
    }
};

// Get equipment list
export const getEquipmentList = async () => {
    try {
      const response = await authenticatedRequest('get', '/equipment/');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch equipment list'
      };
    }
  };
  
  // Get suppliers list
  export const getSuppliersList = async () => {
    try {
      const response = await authenticatedRequest('get', '/suppliers/');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch suppliers list'
      };
    }
  };
  
  // Format operational status for display
  export const formatOperationalStatus = (status) => {
    switch (status) {
      case 'functional':
        return { text: 'Functional', className: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs' };
        case 'non_functional':
        return { text: 'Non-Functional', className: 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs' };
      case 'under_maintenance':
        return { text: 'Under Maintenance', className: 'bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs' };
      case 'decommissioned':
        return { text: 'Decommissioned', className: 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs' };
      default:
        return { text: status, className: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs' };
    }
  };
  
  // Format device type for display
  export const formatDeviceType = (type) => {
    // Convert snake_case to Title Case
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') + ' Device';
  };
  
  // Format department name for display
  export const formatDepartment = (department) => {
    return department.charAt(0).toUpperCase() + department.slice(1);
  };


  // Create a new supplier
export const createSupplier = async (supplierData) => {
    try {
        const response = await authenticatedRequest('post', '/suppliers/', supplierData);
        return { 
            success: true, 
            data: response.data,
            status: response.status
        };
    } catch (error) {
        console.error('Create Supplier Error:', error.response?.data || error);
        return {
            success: false,
            error: error.response?.data || 'Failed to create supplier',
            status: error.response?.status
        };
    }
};

// Add this to utils/api.js
export const deleteSupplier = async (id) => {
    try {
      const response = await authenticatedRequest('delete', `/suppliers/${id}/`);
      return { 
        success: true, 
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error('Delete Supplier Error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data || 'Failed to delete supplier',
        status: error.response?.status
      };
    }
  };

  // Add this to utils/api.js
export const deleteEquipment = async (id) => {
    try {
      const response = await authenticatedRequest('delete', `/equipment/${id}/`);
      return { 
        success: true, 
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error('Delete Supplier Error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data || 'Failed to delete supplier',
        status: error.response?.status
      };
    }
  };

  export const updateSupplier = async (id, data) => {
    try {
      const response = await authenticatedRequest('put', `/suppliers/${id}/`, data);
      return { 
        success: true, 
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error('Update Supplier Error:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data || 'Failed to update supplier',
        status: error.response?.status
      };
    }
  };


    // Create a new Equipment
export const createEquipment = async (equipmentData) => {
    try {
        const response = await authenticatedRequest('post', '/equipment/', equipmentData);
        return { 
            success: true, 
            data: response.data,
            status: response.status
        };
    } catch (error) {
        console.error('Create Supplier Error:', error.response?.data || error);
        return {
            success: false,
            error: error.response?.data || 'Failed to create supplier',
            status: error.response?.status
        };
    }
};

    // Create a new Equipment
    export const updateEquipment = async (equipmentId, data) => {
        try {
            const response = await authenticatedRequest('put',`/suppliers/${equipmentId}/`, data);
            return { 
                success: true, 
                data: response.data,
                status: response.status
            };
        } catch (error) {
            console.error('Create Supplier Error:', error.response?.data || error);
            return {
                success: false,
                error: error.response?.data || 'Failed to create supplier',
                status: error.response?.status
            };
        }
    };

