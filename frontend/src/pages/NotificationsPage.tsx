import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Check as CheckIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { rootStore } from '../stores/RootStore';

const NotificationsPage: React.FC = observer(() => {
  const { notificationStore, authStore } = rootStore;
  const [tab, setTab] = useState(0);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    body: '',
    notification_type: 'email' as 'email' | 'sms' | 'push',
  });
  const [newNotification, setNewNotification] = useState({
    template_id: '',
    notification_type: 'email' as 'email' | 'sms' | 'push',
    priority: 'medium' as 'low' | 'medium' | 'high',
    subject: '',
    body: '',
  });
  const [newSettings, setNewSettings] = useState({
    email_enabled: true,
    sms_enabled: false,
    push_enabled: true,
    email_address: '',
    phone_number: '',
    min_priority: 'medium' as 'low' | 'medium' | 'high',
  });
  const isSuperuser = authStore.user?.is_superuser;

  useEffect(() => {
    notificationStore.fetchNotifications();
    notificationStore.fetchPreferences();
    if (isSuperuser) {
      notificationStore.fetchPendingNotifications();
      notificationStore.fetchTemplates();
    }
  }, [isSuperuser]);

  // --- Handlers ---
  const handleMarkAsRead = async (notificationId: number) => {
    await notificationStore.markAsRead(notificationId);
  };

  const handlePreferenceChange = async (field: string, value: any) => {
    if (notificationStore.preferences) {
      await notificationStore.updatePreferences({
        ...notificationStore.preferences,
        [field]: value,
      });
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    await notificationStore.createTemplate({
      ...newTemplate,
      notification_type: newTemplate.notification_type as 'email' | 'sms' | 'push',
    });
    setNewTemplate({
      name: '',
      subject: '',
      body: '',
      notification_type: 'email',
    });
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    await notificationStore.createNotification({
      ...newNotification,
      template_id: Number(newNotification.template_id), // преобразуем в число
      notification_type: newNotification.notification_type as 'email' | 'sms' | 'push',
      priority: newNotification.priority as 'low' | 'medium' | 'high',
    });
    setNewNotification({
      template_id: '',
      notification_type: 'email',
      priority: 'medium',
      subject: '',
      body: '',
    });
  };

  const handleCreateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await notificationStore.createPreferences(newSettings);
      notificationStore.fetchPreferences();
    } catch {}
  };

  // --- UI ---
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="My Notifications" />
        {isSuperuser && <Tab label="Pending" />}
        {isSuperuser && <Tab label="Templates" />}
        <Tab label="Settings" />
        {isSuperuser && <Tab label="Send Notification" />}
      </Tabs>
      {/* Notifications Tab */}
      {tab === 0 && (
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
                    primary={notification.subject || notification.title}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {notification.timestamp ? new Date(notification.timestamp).toLocaleString() : '—'}
                        </Typography>
                        <br />
                        {notification.body || notification.message}
                      </>
                    }
                    sx={{ opacity: notification.isRead ? 0.7 : 1 }}
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
      )}
      {/* Pending Tab */}
      {tab === 1 && isSuperuser && (
        <Paper sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Pending Notifications
          </Typography>
          <List>
            {notificationStore.pendingNotifications.map((n) => (
              <ListItem key={n.id}>
                <ListItemText
                  primary={n.subject || n.title}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {n.timestamp ? new Date(n.timestamp).toLocaleString() : '—'}
                      </Typography>
                      <br />
                      {n.body || n.message}
                    </>
                  }
                />
              </ListItem>
            ))}
            {notificationStore.pendingNotifications.length === 0 && (
              <ListItem>
                <ListItemText primary="No pending notifications" />
              </ListItem>
            )}
          </List>
        </Paper>
      )}
      {/* Templates Tab */}
      {tab === 2 && isSuperuser && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Notification Templates</Typography>
              <List>
                {notificationStore.templates.map((tpl) => (
                  <ListItem key={tpl.id}>
                    <ListItemText
                      primary={tpl.name}
                      secondary={
                        <>
                          <Typography variant="body2">
                            Type: {tpl.notification_type}
                          </Typography>
                          <Typography variant="body2">
                            Subject: {tpl.subject}
                          </Typography>
                          <Typography variant="body2">
                            Body: {tpl.body}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
                {notificationStore.templates.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No templates" />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Create Template</Typography>
              <form onSubmit={handleCreateTemplate}>
                <TextField
                  label="Name"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  value={newTemplate.name}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, name: e.target.value })
                  }
                />
                <TextField
                  label="Subject"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  value={newTemplate.subject}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, subject: e.target.value })
                  }
                />
                <TextField
                  label="Body"
                  fullWidth
                  required
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                  value={newTemplate.body}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, body: e.target.value })
                  }
                />
                <TextField
                  select
                  label="Type"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  value={newTemplate.notification_type}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      notification_type: e.target.value as 'email' | 'sms' | 'push',
                    })
                  }
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="push">Push</MenuItem>
                  <MenuItem value="sms">SMS</MenuItem>
                </TextField>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                >
                  Create
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      )}
      {/* Settings Tab */}
      {(tab === 3 || (!isSuperuser && tab === 1)) && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            {notificationStore.preferences ? (
              <form>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationStore.preferences.email_enabled}
                        onChange={(e) =>
                          handlePreferenceChange(
                            'email_enabled',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Email"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationStore.preferences.push_enabled}
                        onChange={(e) =>
                          handlePreferenceChange(
                            'push_enabled',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Push"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationStore.preferences.sms_enabled}
                        onChange={(e) =>
                          handlePreferenceChange(
                            'sms_enabled',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="SMS"
                  />
                </FormGroup>
                <TextField
                  label="Email Address"
                  fullWidth
                  sx={{ mt: 2 }}
                  value={notificationStore.preferences.email_address || ''}
                  onChange={(e) =>
                    handlePreferenceChange('email_address', e.target.value)
                  }
                />
                <TextField
                  label="Phone Number"
                  fullWidth
                  sx={{ mt: 2 }}
                  value={notificationStore.preferences.phone_number || ''}
                  onChange={(e) =>
                    handlePreferenceChange('phone_number', e.target.value)
                  }
                />
                <TextField
                  select
                  label="Min Priority"
                  fullWidth
                  sx={{ mt: 2 }}
                  value={notificationStore.preferences.min_priority}
                  onChange={(e) =>
                    handlePreferenceChange('min_priority', e.target.value)
                  }
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </TextField>
              </form>
            ) : (
              <form onSubmit={handleCreateSettings}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newSettings.email_enabled}
                        onChange={(e) =>
                          setNewSettings(s => ({ ...s, email_enabled: e.target.checked }))
                        }
                      />
                    }
                    label="Email"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newSettings.push_enabled}
                        onChange={(e) =>
                          setNewSettings(s => ({ ...s, push_enabled: e.target.checked }))
                        }
                      />
                    }
                    label="Push"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newSettings.sms_enabled}
                        onChange={(e) =>
                          setNewSettings(s => ({ ...s, sms_enabled: e.target.checked }))
                        }
                      />
                    }
                    label="SMS"
                  />
                </FormGroup>
                <TextField
                  label="Email Address"
                  fullWidth
                  sx={{ mt: 2 }}
                  value={newSettings.email_address}
                  onChange={(e) =>
                    setNewSettings(s => ({ ...s, email_address: e.target.value }))
                  }
                />
                <TextField
                  label="Phone Number"
                  fullWidth
                  sx={{ mt: 2 }}
                  value={newSettings.phone_number}
                  onChange={(e) =>
                    setNewSettings(s => ({ ...s, phone_number: e.target.value }))
                  }
                />
                <TextField
                  select
                  label="Min Priority"
                  fullWidth
                  sx={{ mt: 2 }}
                  value={newSettings.min_priority}
                  onChange={(e) =>
                    setNewSettings(s => ({ ...s, min_priority: e.target.value as 'low' | 'medium' | 'high' }))
                  }
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </TextField>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ mt: 2 }}
                >
                  Create notification settings
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}
      {/* Send Notification Tab (superuser) */}
      {tab === 4 && isSuperuser && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Send Notification
            </Typography>
            <form onSubmit={handleCreateNotification}>
              <TextField
                select
                label="Template"
                fullWidth
                required
                sx={{ mb: 2 }}
                value={newNotification.template_id}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    template_id: e.target.value,
                  })
                }
              >
                {notificationStore.templates.map((tpl) => (
                  <MenuItem key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Type"
                fullWidth
                required
                sx={{ mb: 2 }}
                value={newNotification.notification_type}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    notification_type: e.target.value as 'email' | 'sms' | 'push',
                  })
                }
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="push">Push</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
              </TextField>
              <TextField
                select
                label="Priority"
                fullWidth
                required
                sx={{ mb: 2 }}
                value={newNotification.priority}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    priority: e.target.value as 'low' | 'medium' | 'high',
                  })
                }
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
              <TextField
                label="Subject"
                fullWidth
                required
                sx={{ mb: 2 }}
                value={newNotification.subject}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    subject: e.target.value,
                  })
                }
              />
              <TextField
                label="Body"
                fullWidth
                required
                multiline
                rows={3}
                sx={{ mb: 2 }}
                value={newNotification.body}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    body: e.target.value,
                  })
                }
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
              >
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </Box>
  );
});

export default NotificationsPage;