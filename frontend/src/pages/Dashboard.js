import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LocalOffer as CouponIcon,
  Campaign as CampaignIcon,
  AccountBalance as BalanceIcon,
  History as HistoryIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  CardGiftcard as GiftIcon,
  Timer as TimerIcon,
  Notifications as NotificationIcon,
  Favorite as FavoriteIcon,
  ShoppingCart as CartIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDashboard } from '../hooks/useDashboard';

function Dashboard() {
  const { loading, error, dashboardData, refreshData } = useDashboard();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refreshData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const panels = [
    {
      title: 'Available Coupons',
      icon: <CouponIcon sx={{ fontSize: 40 }} />,
      content: (
        <Box>
          <Typography variant="h3">{dashboardData.availableCoupons}</Typography>
          <Button variant="contained" color="primary" sx={{ mt: 2 }}>
            View Coupons
          </Button>
        </Box>
      ),
    },
    {
      title: 'Active Campaigns',
      icon: <CampaignIcon sx={{ fontSize: 40 }} />,
      content: (
        <Box>
          <Typography variant="h3">{dashboardData.activeCampaigns}</Typography>
          <Button variant="contained" color="primary" sx={{ mt: 2 }}>
            View Campaigns
          </Button>
        </Box>
      ),
    },
    {
      title: 'Total Savings',
      icon: <BalanceIcon sx={{ fontSize: 40 }} />,
      content: (
        <Box>
          <Typography variant="h3">${dashboardData.totalSavings}</Typography>
          <Typography variant="body2" color="text.secondary">
            Lifetime savings
          </Typography>
        </Box>
      ),
    },
    {
      title: 'Recent Activity',
      icon: <HistoryIcon sx={{ fontSize: 40 }} />,
      content: (
        <Box>
          {dashboardData.recentActivity.slice(0, 3).map((activity, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="body2">{activity.description}</Typography>
              <Typography variant="caption" color="text.secondary">
                {activity.date}
              </Typography>
            </Box>
          ))}
        </Box>
      ),
    },
    {
      title: 'Membership Level',
      icon: <StarIcon sx={{ fontSize: 40 }} />,
      content: (
        <Box>
          <Typography variant="h4">{dashboardData.level}</Typography>
          <LinearProgress
            variant="determinate"
            value={(dashboardData.points / dashboardData.nextLevelPoints) * 100}
            sx={{ mt: 2 }}
          />
          <Typography variant="body2" sx={{ mt: 1 }}>
            {dashboardData.points} / {dashboardData.nextLevelPoints} points
          </Typography>
        </Box>
      ),
    },
    {
      title: 'Points Trend',
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      content: (
        <Box>
          <Typography variant="h3">+250</Typography>
          <Typography variant="body2" color="text.secondary">
            Points earned this month
          </Typography>
        </Box>
      ),
    },
    {
      title: 'Achievements',
      icon: <TrophyIcon sx={{ fontSize: 40 }} />,
      content: (
        <Box>
          <Chip label="Early Adopter" color="primary" sx={{ m: 0.5 }} />
          <Chip label="Loyal Customer" color="secondary" sx={{ m: 0.5 }} />
          <Chip label="Top Spender" color="success" sx={{ m: 0.5 }} />
        </Box>
      ),
    },
    {
      title: 'Rewards',
      icon: <GiftIcon sx={{ fontSize: 40 }} />,
      content: (
        <Box>
          <Typography variant="h6">Available Rewards</Typography>
          <Button variant="outlined" color="primary" sx={{ mt: 1 }}>
            Redeem Points
          </Button>
        </Box>
      ),
    },
    {
      title: 'Expiring Soon',
      icon: <TimerIcon sx={{ fontSize: 40 }} />,
      content: (
        <Box>
          {dashboardData.upcomingExpirations.slice(0, 2).map((item, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="body2">{item.name}</Typography>
              <Typography variant="caption" color="error">
                {item.daysLeft} days left
              </Typography>
            </Box>
          ))}
        </Box>
      ),
    },
    {
      title: 'Notifications',
      icon: <NotificationIcon sx={{ fontSize: 40 }} />,
      content: (
        <Box>
          {dashboardData.notifications.slice(0, 2).map((notification, index) => (
            <Typography key={index} variant="body2">
              {notification.message}
            </Typography>
          ))}
          <Button variant="text" color="primary" sx={{ mt: 1 }}>
            View All
          </Button>
        </Box>
      ),
    },
    {
      title: 'Favorite Categories',
      icon: <FavoriteIcon sx={{ fontSize: 40 }} />,
      content: (
        <Box>
          {dashboardData.favoriteCategories.map((category, index) => (
            <Chip
              key={index}
              label={category}
              variant="outlined"
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>
      ),
    },
    {
      title: 'Shopping Cart',
      icon: <CartIcon sx={{ fontSize: 40 }} />,
      content: (
        <Box>
          <Typography variant="h6">{dashboardData.cartItems} items</Typography>
          <Button variant="contained" color="primary" sx={{ mt: 1 }}>
            View Cart
          </Button>
        </Box>
      ),
    },
    {
      title: 'Payment Methods',
      icon: <MoneyIcon sx={{ fontSize: 40 }} />,
      content: (
        <Box>
          {dashboardData.paymentMethods.slice(0, 1).map((method, index) => (
            <Typography key={index} variant="body2">
              {method.type} ending in {method.last4}
            </Typography>
          ))}
          <Button variant="text" color="primary" sx={{ mt: 1 }}>
            Manage Cards
          </Button>
        </Box>
      ),
    },
    {
      title: 'Profile Settings',
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      content: (
        <Box>
          <Button variant="outlined" color="primary" sx={{ mt: 1 }}>
            Edit Profile
          </Button>
        </Box>
      ),
    },
    {
      title: 'Security',
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      content: (
        <Box>
          <Typography variant="body2">Last login: 2 hours ago</Typography>
          <Button variant="text" color="primary" sx={{ mt: 1 }}>
            Security Settings
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4">Welcome back, User!</Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={refreshData}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>
      <Grid container spacing={3}>
        {panels.map((panel, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s ease-in-out',
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  {panel.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {panel.title}
                  </Typography>
                </Box>
                {panel.content}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Dashboard; 