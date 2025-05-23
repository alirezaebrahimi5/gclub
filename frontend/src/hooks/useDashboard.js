import { useState, useEffect } from 'react';
import {
  userService,
  couponService,
  campaignService,
  rewardService,
  notificationService,
  cartService,
  paymentService,
} from '../services/api';

export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    points: 0,
    level: '',
    availableCoupons: 0,
    activeCampaigns: 0,
    totalSavings: 0,
    nextLevelPoints: 0,
    recentActivity: [],
    favoriteCategories: [],
    upcomingExpirations: [],
    notifications: [],
    cartItems: 0,
    paymentMethods: [],
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        profileResponse,
        pointsResponse,
        couponsResponse,
        campaignsResponse,
        rewardsResponse,
        notificationsResponse,
        cartResponse,
        paymentMethodsResponse,
      ] = await Promise.all([
        userService.getProfile(),
        userService.getPoints(),
        couponService.getAvailableCoupons(),
        campaignService.getActiveCampaigns(),
        rewardService.getAvailableRewards(),
        notificationService.getNotifications(),
        cartService.getCart(),
        paymentService.getPaymentMethods(),
      ]);

      // Transform and combine the data
      setDashboardData({
        points: pointsResponse.data.points,
        level: profileResponse.data.membershipLevel,
        availableCoupons: couponsResponse.data.length,
        activeCampaigns: campaignsResponse.data.length,
        totalSavings: profileResponse.data.totalSavings,
        nextLevelPoints: profileResponse.data.nextLevelPoints,
        recentActivity: [
          ...couponsResponse.data.recentUsage,
          ...campaignsResponse.data.recentParticipation,
        ].sort((a, b) => new Date(b.date) - new Date(a.date)),
        favoriteCategories: profileResponse.data.favoriteCategories,
        upcomingExpirations: [
          ...couponsResponse.data.expiringSoon,
          ...campaignsResponse.data.expiringSoon,
        ],
        notifications: notificationsResponse.data,
        cartItems: cartResponse.data.items.length,
        paymentMethods: paymentMethodsResponse.data,
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refreshData = () => {
    fetchDashboardData();
  };

  return {
    loading,
    error,
    dashboardData,
    refreshData,
  };
};

export default useDashboard; 