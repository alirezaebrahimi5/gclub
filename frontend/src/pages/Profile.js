import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  Box,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Switch,
  FormControlLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Tooltip,
  Badge,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  Timeline as TimelineIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { userService } from '../services/api';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

function Profile() {
  const [stats, setStats] = useState({
    pointsHistory: [],
    rewardsEarned: [],
    activityDistribution: {},
  });
  const [achievements, setAchievements] = useState([]);
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  useEffect(() => {
    fetchProfileData();
    fetchActivityHistory();
    fetchUserStats();
    fetchAchievements();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await userService.getUserStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await userService.getAchievements();
      setAchievements(response.data);
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
    }
  };

  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
    setShowAchievementDialog(true);
  };

  const pointsChartData = {
    labels: stats.pointsHistory.map((point) => new Date(point.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Points Earned',
        data: stats.pointsHistory.map((point) => point.value),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const activityChartData = {
    labels: Object.keys(stats.activityDistribution),
    datasets: [
      {
        data: Object.values(stats.activityDistribution),
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab icon={<SettingsIcon />} label="Profile" />
                <Tab icon={<HistoryIcon />} label="Activity" />
                <Tab icon={<NotificationsIcon />} label="Preferences" />
                <Tab icon={<SecurityIcon />} label="Security" />
                <Tab icon={<TimelineIcon />} label="Stats" />
                <Tab icon={<TrophyIcon />} label="Achievements" />
              </Tabs>

              <TabPanel value={activeTab} index={4}>
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
                          Activity Distribution
                        </Typography>
                        <Box sx={{ height: 300 }}>
                          <Doughnut
                            data={activityChartData}
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
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Recent Rewards
                        </Typography>
                        <List>
                          {stats.rewardsEarned.map((reward) => (
                            <ListItem key={reward.id}>
                              <ListItemAvatar>
                                <Avatar>
                                  <CartIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={reward.name}
                                secondary={`Earned on ${new Date(
                                  reward.date
                                ).toLocaleDateString()}`}
                              />
                              <Chip
                                label={`${reward.points} points`}
                                color="primary"
                                size="small"
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={activeTab} index={5}>
                <Grid container spacing={2}>
                  {achievements.map((achievement) => (
                    <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.02)',
                          },
                        }}
                        onClick={() => handleAchievementClick(achievement)}
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
                            <Badge
                              badgeContent={achievement.progress}
                              color="primary"
                              sx={{ mb: 2 }}
                            >
                              <Avatar
                                sx={{
                                  width: 64,
                                  height: 64,
                                  bgcolor: achievement.completed
                                    ? 'success.main'
                                    : 'grey.300',
                                }}
                              >
                                <TrophyIcon />
                              </Avatar>
                            </Badge>
                            <Typography variant="h6" gutterBottom>
                              {achievement.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {achievement.description}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={(achievement.progress / achievement.target) * 100}
                              sx={{ mt: 2, width: '100%' }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={showAchievementDialog}
        onClose={() => setShowAchievementDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedAchievement && (
          <>
            <DialogTitle>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <TrophyIcon color="primary" />
                <Typography variant="h6">{selectedAchievement.title}</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" gutterBottom>
                  {selectedAchievement.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Progress: {selectedAchievement.progress} / {selectedAchievement.target}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(selectedAchievement.progress / selectedAchievement.target) * 100}
                  sx={{ mt: 2 }}
                />
                {selectedAchievement.rewards && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Rewards:
                    </Typography>
                    <List dense>
                      {selectedAchievement.rewards.map((reward, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={reward} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowAchievementDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}

export default Profile; 