import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import { rootStore } from '../stores/RootStore';

const LoginPage: React.FC = observer(() => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { authStore } = rootStore;

  // Перенаправление при изменении состояния аутентификации
  useEffect(() => {
    if (authStore.isAuthenticated && authStore.user) {
      console.log('User authenticated, navigating to dashboard...');
      navigate('/', { replace: true });
    }
  }, [authStore.isAuthenticated, authStore.user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting login form...');

    const success = await authStore.login(email, password);
    console.log('Login result:', {
      success,
      isAuthenticated: authStore.isAuthenticated,
      user: authStore.user
    });

    // Дополнительная проверка и принудительная навигация
    if (success && authStore.isAuthenticated && authStore.user) {
      console.log('Force navigation after successful login');
      navigate('/', { replace: true });
    }
  };

  // Если пользователь уже аутентифицирован, показываем загрузку
  if (authStore.isAuthenticated && authStore.user) {
    return (
      <Container component="main" maxWidth="xs">
        <Box sx={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
          <Typography>Redirecting...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Apiary Monitor
          </Typography>
          {authStore.error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {authStore.error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!authStore.error}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!authStore.error}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={authStore.loading}
            >
              {authStore.loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
});

export default LoginPage;