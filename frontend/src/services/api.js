import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
  },
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getPoints: () => api.get('/users/points'),
  getMembershipLevel: () => api.get('/users/membership-level'),
};

export const couponService = {
  getAvailableCoupons: () => api.get('/coupons/available'),
  getCouponHistory: () => api.get('/coupons/history'),
  applyCoupon: (code) => api.post('/coupons/apply', { code }),
};

export const campaignService = {
  getActiveCampaigns: () => api.get('/campaigns/active'),
  getCampaignHistory: () => api.get('/campaigns/history'),
  participateInCampaign: (campaignId) =>
    api.post(`/campaigns/${campaignId}/participate`),
};

export const rewardService = {
  getAvailableRewards: () => api.get('/rewards/available'),
  redeemReward: (rewardId) => api.post(`/rewards/${rewardId}/redeem`),
  getRewardHistory: () => api.get('/rewards/history'),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (notificationId) =>
    api.put(`/notifications/${notificationId}/read`),
};

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (item) => api.post('/cart/items', item),
  removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}`),
  updateCartItem: (itemId, quantity) =>
    api.put(`/cart/items/${itemId}`, { quantity }),
};

export const paymentService = {
  getPaymentMethods: () => api.get('/payments/methods'),
  addPaymentMethod: (method) => api.post('/payments/methods', method),
  removePaymentMethod: (methodId) =>
    api.delete(`/payments/methods/${methodId}`),
};

export default api; 