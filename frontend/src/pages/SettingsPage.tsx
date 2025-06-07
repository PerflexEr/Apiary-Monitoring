// frontend/src/pages/SettingsPage.tsx
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import { rootStore } from '../stores/RootStore';

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const SettingsPage: React.FC = observer(() => {
  const { authStore } = rootStore;
  const [passwordData, setPasswordData] = useState<PasswordChange>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      // TODO: Implement password change in AuthStore
      await authStore.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setSuccess('Password successfully changed');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography color="text.secondary" gutterBottom>
                  Email
                </Typography>
                <Typography>{authStore.user?.email}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography color="text.secondary" gutterBottom>
                  Username
                </Typography>
                <Typography>{authStore.user?.username}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography color="text.secondary" gutterBottom>
                  Account Status
                </Typography>
                <Typography>
                  {authStore.user?.is_active ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography color="text.secondary" gutterBottom>
                  Account Type
                </Typography>
                <Typography>
                  {authStore.user?.is_superuser ? 'Administrator' : 'Regular User'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}
              <form onSubmit={handlePasswordChange}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ mt: 3 }}
                >
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Danger Zone
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography color="error" gutterBottom>
                Delete Account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Once you delete your account, there is no going back. Please be
                certain.
              </Typography>
              <Button variant="outlined" color="error">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
});

export default SettingsPage;