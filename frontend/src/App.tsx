import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';
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
          height: '100vh',
          flexDirection: 'column'
        }}
      >
        <CircularProgress />
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          Checking authentication...
        </Box>
      </Box>
    );
  }

  if (!authStore.isAuthenticated || !authStore.user) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
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
          height: '100vh',
          flexDirection: 'column'
        }}
      >
        <CircularProgress />
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          Loading...
        </Box>
      </Box>
    );
  }

  if (authStore.isAuthenticated && authStore.user) {
    console.log('Already authenticated, redirecting to dashboard');
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
});

// Компонент для обработки ошибок
const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <React.Suspense
      fallback={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column'
          }}
        >
          <CircularProgress />
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            Loading application...
          </Box>
        </Box>
      }
    >
      {children}
    </React.Suspense>
  );
};

const App: React.FC = observer(() => {
  const { authStore } = useStore();

  useEffect(() => {
    console.log('App mounted, initializing auth...');
    
    const initializeAuth = async () => {
      try {
        await authStore.initialize();
        console.log('Auth initialization completed');
      } catch (error) {
        console.error('Auth initialization failed:', error);
      }
    };

    initializeAuth();
  }, [authStore]);

  // Обработка изменений в localStorage (например, при логауте в другой вкладке)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && e.newValue === null) {
        console.log('Token removed from localStorage, logging out...');
        authStore.logout();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [authStore]);

  const router = createBrowserRouter([
    {
      path: '/login',
      element: <PublicRoute />,
      errorElement: (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <h2>Something went wrong with the login page</h2>
          <button onClick={() => window.location.href = '/login'}>
            Try again
          </button>
        </Box>
      )
    },
    {
      path: '/',
      element: <ProtectedRoute />,
      errorElement: (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.href = '/'}>
            Go to dashboard
          </button>
        </Box>
      ),
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
    },
    {
      path: '*',
      element: (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column'
          }}
        >
          <h1>404 - Page Not Found</h1>
          <button onClick={() => window.location.href = '/'}>
            Go to dashboard
          </button>
        </Box>
      )
    }
  ]);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  );
});

export default App;