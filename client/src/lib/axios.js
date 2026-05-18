import axios from 'axios';

// Create a configured axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Crucial for sending/receiving secure HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // You can add logic here before request is sent
    // For example, attaching an Authorization header if you were using localStorage (though we use cookies here)
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  async (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token using the refresh endpoint
        // This relies on the HttpOnly refresh token cookie being sent automatically
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // If successful, retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, the user needs to log in again
        // You could redirect to login page here or dispatch a logout action
        console.error('Session expired. Please log in again.');
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other global errors (e.g., 500, network errors)
    if (error.response?.status === 500) {
      console.error('Server error occurred');
    }

    return Promise.reject(error);
  }
);

export default api;
