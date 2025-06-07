import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useStore } from './hooks/useStore';
import { theme } from './theme';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HivesPage from './pages/HivesPage';
import HiveDetailsPage from './pages/HiveDetailsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import { CircularProgress, Box } from '@mui/material';

// Компонент для защищенных маршрутов
const ProtectedRoute: React.FC = observer(() => {
  const { authStore } = useStore();

  console.log('ProtectedRoute check:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    loading: authStore.loading
  });

  if (authStore.loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!authStore.isAuthenticated || !authStore.user) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Layout />
    </>
  );
});

// Компонент для публичных маршрутов (логин)
const PublicRoute: React.FC = observer(() => {
  const { authStore } = useStore();

  console.log('PublicRoute check:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    loading: authStore.loading
  });

  if (authStore.loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (authStore.isAuthenticated && authStore.user) {
    console.log('Already authenticated, redirecting to dashboard');
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
});

const App: React.FC = observer(() => {
  const { authStore } = useStore();

  useEffect(() => {
    console.log('App mounted, checking auth...');
    const token = localStorage.getItem('token');
    if (token && !authStore.user && !authStore.loading) {
      authStore.checkAuth();
    }
  }, [authStore]);

  const router = createBrowserRouter([
    {
      path: '/login',
      element: <PublicRoute />
    },
    {
      path: '/',
      element: <ProtectedRoute />,
      children: [
        {
          index: true,
          element: <DashboardPage />
        },
        {
          path: 'hives',
          element: <HivesPage />
        },
        {
          path: 'hives/:id',
          element: <HiveDetailsPage />
        },
        {
          path: 'notifications',
          element: <NotificationsPage />
        },
        {
          path: 'settings',
          element: <SettingsPage />
        }
      ]
    }
  ]);

  return (
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
});

export default App;