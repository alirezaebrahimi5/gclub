import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  LinearProgress,
  Avatar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  ShoppingBag as BagIcon,
  History as HistoryIcon,
  Close as CloseIcon,
  LocalOffer as OfferIcon,
} from '@mui/icons-material';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { rewardService } from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ padding: '20px 0' }}>
      {value === index && children}
    </div>
  );
}

function Rewards() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [stats, setStats] = useState({
    pointsHistory: [],
    rewardsByCategory: {},
    redemptionHistory: [],
  });

  useEffect(() => {
    fetchRewards();
    fetchRewardStats();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await rewardService.getAvailableRewards();
      setRewards(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch rewards');
    } finally {
      setLoading(false);
    }
  };

  const fetchRewardStats = async () => {
    try {
      const response = await rewardService.getRewardStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch reward stats:', err);
    }
  };

  const handleRedeemReward = async (reward) => {
    setSelectedReward(reward);
    setShowRedeemDialog(true);
  };

  const handleConfirmRedeem = async () => {
    try {
      await rewardService.redeemReward(selectedReward.id);
      setShowRedeemDialog(false);
      fetchRewards();
      fetchRewardStats();
    } catch (err) {
      setError(err.message || 'Failed to redeem reward');
    }
  };

  const pointsChartData = {
    labels: stats.pointsHistory.map((point) => new Date(point.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Points Balance',
        data: stats.pointsHistory.map((point) => point.value),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(stats.rewardsByCategory),
    datasets: [
      {
        data: Object.values(stats.rewardsByCategory),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

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
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab icon={<BagIcon />} label="Available Rewards" />
                <Tab icon={<HistoryIcon />} label="Redemption History" />
                <Tab icon={<StarIcon />} label="Stats" />
              </Tabs>

              <TabPanel value={activeTab} index={0}>
                <Grid container spacing={3}>
                  {rewards.map((reward) => (
                    <Grid item xs={12} sm={6} md={4} key={reward.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.02)',
                          },
                        }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              textAlign: 'center',
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 64,
                                height: 64,
                                bgcolor: 'primary.main',
                                mb: 2,
                              }}
                            >
                              <OfferIcon />
                            </Avatar>
                            <Typography variant="h6" gutterBottom>
                              {reward.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {reward.description}
                            </Typography>
                            <Chip
                              label={`${reward.points} points`}
                              color="primary"
                              sx={{ mt: 1 }}
                            />
                            <Button
                              variant="contained"
                              fullWidth
                              sx={{ mt: 2 }}
                              onClick={() => handleRedeemReward(reward)}
                              disabled={reward.points > stats.pointsHistory[0]?.value}
                            >
                              Redeem
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <List>
                  {stats.redemptionHistory.map((redemption) => (
                    <React.Fragment key={redemption.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <BagIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={redemption.rewardName}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                Redeemed on {new Date(redemption.date).toLocaleDateString()}
                              </Typography>
                              <br />
                              <Typography component="span" variant="caption">
                                {redemption.points} points
                              </Typography>
                            </>
                          }
                        />
                        <Chip
                          label={redemption.status}
                          color={redemption.status === 'completed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Points History
                        </Typography>
                        <Box sx={{ height: 300 }}>
                          <Line
                            data={pointsChartData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'top',
                                },
                              },
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Rewards by Category
                        </Typography>
                        <Box sx={{ height: 300 }}>
                          <Doughnut
                            data={categoryChartData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'top',
                                },
                              },
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Redeem Dialog */}
      <Dialog
        open={showRedeemDialog}
        onClose={() => setShowRedeemDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedReward && (
          <>
            <DialogTitle>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6">Redeem Reward</Typography>
                <IconButton onClick={() => setShowRedeemDialog(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedReward.name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedReward.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Points Required: {selectedReward.points}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your Points Balance: {stats.pointsHistory[0]?.value || 0}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowRedeemDialog(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleConfirmRedeem}
                disabled={selectedReward.points > stats.pointsHistory[0]?.value}
              >
                Confirm Redemption
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}

export default Rewards; 