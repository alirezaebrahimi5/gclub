import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Divider,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { notificationService } from '../services/api';

function Notifications() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    inApp: true,
    marketing: false,
  });

  useEffect(() => {
    fetchNotifications();
    // Set up WebSocket connection for real-time notifications
    const ws = new WebSocket('ws://localhost:8000/ws/notifications');
    ws.onmessage = (event) => {
      const newNotification = JSON.parse(event.data);
      handleNewNotification(newNotification);
    };
    return () => ws.close();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications();
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message || 'Failed to mark notification as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev =>
        notifications.find(n => n.id === notificationId)?.read
          ? prev
          : Math.max(0, prev - 1)
      );
    } catch (err) {
      setError(err.message || 'Failed to delete notification');
    }
  };

  const handleSettingsChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <NotificationsIcon />;
    }
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h4">
              Notifications
              {unreadCount > 0 && (
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  sx={{ ml: 2 }}
                >
                  <NotificationsActiveIcon />
                </Badge>
              )}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setSettingsDialogOpen(true)}
            >
              Settings
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <List>
                {notifications.map((notification) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        bgcolor: notification.read ? 'inherit' : 'action.hover',
                        '&:hover': {
                          bgcolor: 'action.selected',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar>{getNotificationIcon(notification.type)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Typography variant="subtitle1">
                              {notification.title}
                            </Typography>
                            {!notification.read && (
                              <Chip
                                label="New"
                                color="primary"
                                size="small"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {notification.message}
                            </Typography>
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block' }}
                            >
                              {new Date(notification.timestamp).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        {!notification.read && (
                          <IconButton
                            edge="end"
                            onClick={() => handleMarkAsRead(notification.id)}
                            sx={{ mr: 1 }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        )}
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <Dialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ListItemText
                primary="Email Notifications"
                secondary="Receive notifications via email"
              />
              <IconButton
                onClick={() => handleSettingsChange('email')}
                color={notificationSettings.email ? 'primary' : 'default'}
              >
                {notificationSettings.email ? (
                  <NotificationsActiveIcon />
                ) : (
                  <NotificationsOffIcon />
                )}
              </IconButton>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Push Notifications"
                secondary="Receive push notifications"
              />
              <IconButton
                onClick={() => handleSettingsChange('push')}
                color={notificationSettings.push ? 'primary' : 'default'}
              >
                {notificationSettings.push ? (
                  <NotificationsActiveIcon />
                ) : (
                  <NotificationsOffIcon />
                )}
              </IconButton>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="In-App Notifications"
                secondary="Show notifications in the app"
              />
              <IconButton
                onClick={() => handleSettingsChange('inApp')}
                color={notificationSettings.inApp ? 'primary' : 'default'}
              >
                {notificationSettings.inApp ? (
                  <NotificationsActiveIcon />
                ) : (
                  <NotificationsOffIcon />
                )}
              </IconButton>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Marketing Notifications"
                secondary="Receive marketing updates"
              />
              <IconButton
                onClick={() => handleSettingsChange('marketing')}
                color={notificationSettings.marketing ? 'primary' : 'default'}
              >
                {notificationSettings.marketing ? (
                  <NotificationsActiveIcon />
                ) : (
                  <NotificationsOffIcon />
                )}
              </IconButton>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              // Save settings
              setSettingsDialogOpen(false);
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Notifications; 