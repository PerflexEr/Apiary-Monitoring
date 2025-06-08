// frontend/src/pages/DashboardPage.tsx
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  WarningAmber,
  DeviceThermostat,
  VolumeUp,
  Hive as HiveIcon,
} from '@mui/icons-material';
import { rootStore } from '../stores/RootStore';

const DashboardPage: React.FC = observer(() => {
  const { hiveStore, monitoringStore } = rootStore;

  useEffect(() => {
    const loadData = async () => {
      try {
        await hiveStore.fetchHives();
        await monitoringStore.fetchAlerts();
        await monitoringStore.fetchSensors();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadData();
  }, []);

  const getStatusColor = (severity: string) => {
    switch (severity) {
      case 'info':
        return '#2196f3';
      case 'warning':
        return '#ff9800';
      case 'critical':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const renderSensorCard = (title: string, value: number | null, unit: string, icon: JSX.Element) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value !== null ? `${value.toFixed(1)}${unit}` : 'N/A'}
        </Typography>
      </CardContent>
    </Card>
  );

  const activeAlerts = monitoringStore.getUnresolvedAlerts();
  const totalHives = hiveStore.hives.length;
  // Вспомогательная функция для поддержки старых и новых значений статуса
  const isHealthy = (status: string) => status === 'healthy';
  const isWarning = (status: string) => status === 'warning';
  const isCritical = (status: string) => status === 'critical';

  const healthyHives = hiveStore.hives.filter(h => isHealthy(h.status)).length;
  const criticalHives = hiveStore.hives.filter(h => isCritical(h.status)).length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {(hiveStore.loading || monitoringStore.loading) && <LinearProgress sx={{ mb: 2 }} />}

      {hiveStore.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {hiveStore.error}
        </Alert>
      )}

      {monitoringStore.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {monitoringStore.error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <HiveIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" gutterBottom>
                Total Hives
              </Typography>
            </Box>
            <Typography variant="h3">{totalHives}</Typography>
            <Typography variant="body2" color="text.secondary">
              {healthyHives} healthy, {criticalHives} critical
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WarningAmber color="error" sx={{ mr: 1 }} />
              <Typography variant="h6" gutterBottom>
                Active Alerts
              </Typography>
            </Box>
            <Typography variant="h3">{activeAlerts.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Unresolved alerts
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <DeviceThermostat color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" gutterBottom>
                Sensors
              </Typography>
            </Box>
            <Typography variant="h3">{monitoringStore.sensors.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Active sensors
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <VolumeUp color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" gutterBottom>
                Measurements
              </Typography>
            </Box>
            <Typography variant="h3">{monitoringStore.measurements.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Recent readings
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Hives */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Hives
            </Typography>
            {hiveStore.hives.slice(0, 5).map((hive) => (
              <Box
                key={hive.id}
                sx={{
                  p: 2,
                  mb: 1,
                  borderRadius: 1,
                  bgcolor: 'background.default',
                  borderLeft: 4,
                  borderColor: isHealthy(hive.status) ? 'success.main' :
                    isWarning(hive.status) ? 'warning.main' : 'error.main',
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {hive.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Location: {hive.location}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Health: {isHealthy(hive.status)
                    ? 'Healthy'
                    : isWarning(hive.status)
                    ? 'Warning'
                    : isCritical(hive.status)
                    ? 'Critical'
                    : 'Unknown'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(hive.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            ))}
            {hiveStore.hives.length === 0 && (
              <Typography color="text.secondary">
                No hives found. Create your first hive to get started!
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Alerts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Alerts
            </Typography>
            {activeAlerts.slice(0, 5).map((alert) => (
              <Box
                key={alert.id}
                sx={{
                  p: 2,
                  mb: 1,
                  borderRadius: 1,
                  bgcolor: alert.isRead ? 'background.default' : 'action.hover',
                  borderLeft: 4,
                  borderColor: getStatusColor(alert.severity),
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  {new Date(alert.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {alert.alertType}
                </Typography>
                <Typography variant="body2">
                  {alert.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Hive ID: {alert.hiveId} | Sensor ID: {alert.sensorId}
                </Typography>
              </Box>
            ))}
            {activeAlerts.length === 0 && (
              <Typography color="text.secondary">
                No active alerts. All systems running smoothly!
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Sensor Overview */}
        {monitoringStore.sensors.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Sensor Overview
              </Typography>
              <Grid container spacing={2}>
                {monitoringStore.sensors.slice(0, 4).map((sensor) => (
                  <Grid item xs={12} sm={6} md={3} key={sensor.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {sensor.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Type: {sensor.sensor_type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Hive ID: {sensor.hive_id}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={sensor.is_active ? 'success.main' : 'error.main'}
                        >
                          Status: {sensor.is_active ? 'Active' : 'Inactive'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {hiveStore.hives.filter(h => isHealthy(h.status)).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Healthy Hives
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="warning.main">
                    {hiveStore.hives.filter(h => isWarning(h.status)).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Warning Hives
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="error.main">
                    {hiveStore.hives.filter(h => isCritical(h.status)).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Critical Hives
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary.main">
                    {monitoringStore.sensors.filter(s => s.is_active).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Sensors
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
});

export default DashboardPage;