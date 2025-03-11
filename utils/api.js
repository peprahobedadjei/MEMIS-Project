// utils/api.js
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'https://memis-90605b282646.herokuapp.com/api';

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
        const { refresh, access } = response.data;
        
        // Update stored tokens
        Cookies.set('memis-r', refresh, { secure: true, sameSite: 'Strict', expires: 7 });
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