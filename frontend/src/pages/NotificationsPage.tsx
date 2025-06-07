import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Paper,
  Divider,
  FormControlLabel,
  Switch,
  FormGroup,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { rootStore } from '../stores/RootStore';

const NotificationsPage: React.FC = observer(() => {
  const { notificationStore } = rootStore;

  useEffect(() => {
    notificationStore.fetchNotifications();
    notificationStore.fetchPreferences();
  }, []);

  const handleMarkAsRead = async (notificationId: number) => {
    await notificationStore.markAsRead(notificationId);
  };

  const handlePreferenceChange = async (type: 'email' | 'push') => {
    if (notificationStore.preferences) {
      await notificationStore.updatePreferences({
        ...notificationStore.preferences,
        type,
        enabled: !notificationStore.preferences.enabled,
      });
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper>
            <List>
              {notificationStore.notifications.map((notification) => (
                <Box key={notification.id}>
                  <ListItem
                    secondaryAction={
                      !notification.isRead && (
                        <IconButton
                          edge="end"
                          aria-label="mark as read"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <CheckIcon />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemIcon>
                      {notification.isRead ? (
                        <NotificationsIcon color="disabled" />
                      ) : (
                        <NotificationsActiveIcon color="primary" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                            {new Date(notification.timestamp).toLocaleString()}
                          </Typography>
                          <br />
                          {notification.message}
                        </>
                      }
                      sx={{
                        opacity: notification.isRead ? 0.7 : 1,
                      }}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </Box>
              ))}
              {notificationStore.notifications.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No notifications"
                    secondary="You're all caught up!"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={
                        notificationStore.preferences?.type === 'email' &&
                        notificationStore.preferences?.enabled
                      }
                      onChange={() => handlePreferenceChange('email')}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={
                        notificationStore.preferences?.type === 'push' &&
                        notificationStore.preferences?.enabled
                      }
                      onChange={() => handlePreferenceChange('push')}
                    />
                  }
                  label="Push Notifications"
                />
              </FormGroup>

              {notificationStore.preferences?.alertTypes && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Alert Types
                  </Typography>
                  <FormGroup>
                    {notificationStore.preferences.alertTypes.map((type) => (
                      <FormControlLabel
                        key={type}
                        control={<Switch checked disabled />}
                        label={type.charAt(0).toUpperCase() + type.slice(1)}
                      />
                    ))}
                  </FormGroup>
                </>
              )}

              {notificationStore.preferences?.minSeverity && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Minimum Severity
                  </Typography>
                  <Typography>
                    {notificationStore.preferences.minSeverity.charAt(0).toUpperCase() +
                      notificationStore.preferences.minSeverity.slice(1)}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
});

export default NotificationsPage;