import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { rootStore } from '../stores/RootStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`hive-tabpanel-${index}`}
      aria-labelledby={`hive-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const HiveDetailsPage: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const { hiveStore, monitoringStore } = rootStore;
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [inspectionData, setInspectionData] = useState({
    notes: '',
    health: 'good',
  });

  useEffect(() => {
    if (id) {
      const hiveId = parseInt(id);

      // Загружаем данные улья
      hiveStore.fetchHiveInspections(hiveId);

      // Загружаем сенсоры для улья
      monitoringStore.fetchHiveSensors(hiveId);

      // Загружаем алерты для улья
      monitoringStore.fetchAlerts(hiveId);
    }
  }, [id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = () => {
    setInspectionData({ notes: '', health: 'good' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      try {
        await hiveStore.addInspection(parseInt(id), {
          date: new Date().toISOString(),
          notes: inspectionData.notes,
          health: inspectionData.health as 'good' | 'warning' | 'critical',
        });
        handleCloseDialog();
      } catch (error) {
        console.error('Failed to add inspection:', error);
      }
    }
  };

  const hive = hiveStore.hives.find((h) => h.id === parseInt(id || ''));

  if (!hive) {
    return (
      <Box>
        <Typography variant="h6" color="error">
          Hive not found
        </Typography>
      </Box>
    );
  }

  const hiveSensors = monitoringStore.getSensorsByHive(hive.id);
  const hiveAlerts = monitoringStore.getAlertsByHive(hive.id);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{hive.name}</Typography>
        <Button variant="contained" onClick={handleOpenDialog}>
          Add Inspection
        </Button>
      </Box>

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

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Inspections" />
          <Tab label="Sensors" />
          <Tab label="Alerts" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Hive Information
                  </Typography>
                  <Typography>
                    <strong>Name:</strong> {hive.name}
                  </Typography>
                  <Typography>
                    <strong>Location:</strong> {hive.location}
                  </Typography>
                  <Typography>
                    <strong>Status:</strong> {hive.status}
                  </Typography>
                  <Typography>
                    <strong>Created:</strong> {new Date(hive.created_at).toLocaleDateString()}
                  </Typography>
                  {hive.lastInspection && (
                    <Typography>
                      <strong>Last Inspection:</strong> {new Date(hive.lastInspection).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sensors Overview
                  </Typography>
                  <Typography>
                    <strong>Total Sensors:</strong> {hiveSensors.length}
                  </Typography>
                  <Typography>
                    <strong>Active Sensors:</strong> {hiveSensors.filter(s => s.is_active).length}
                  </Typography>
                  <Typography>
                    <strong>Sensor Types:</strong> {Array.from(new Set(hiveSensors.map(s => s.sensor_type))).join(', ')}
                  </Typography>

                  {hiveSensors.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Recent Measurements
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Latest data available from {hiveSensors.filter(s => s.is_active).length} active sensors
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Timeline>
            {hiveStore.inspections.map((inspection) => (
              <TimelineItem key={inspection.id}>
                <TimelineSeparator>
                  <TimelineDot
                    color={
                      inspection.health === 'good' ? 'success' :
                        inspection.health === 'warning' ? 'warning' : 'error'
                    }
                  />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6" component="span">
                    {new Date(inspection.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Health: {inspection.health}
                  </Typography>
                  <Typography>{inspection.notes}</Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
            {hiveStore.inspections.length === 0 && (
              <Typography color="text.secondary">
                No inspections recorded yet. Add your first inspection to track hive health.
              </Typography>
            )}
          </Timeline>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={2}>
            {hiveSensors.map((sensor) => (
              <Grid item xs={12} md={6} key={sensor.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {sensor.name}
                    </Typography>
                    <Typography>
                      <strong>Type:</strong> {sensor.sensor_type}
                    </Typography>
                    <Typography>
                      <strong>Status:</strong> {sensor.is_active ? 'Active' : 'Inactive'}
                    </Typography>
                    <Typography>
                      <strong>Created:</strong> {new Date(sensor.created_at).toLocaleDateString()}
                    </Typography>
                    {sensor.updated_at && (
                      <Typography>
                        <strong>Last Updated:</strong> {new Date(sensor.updated_at).toLocaleDateString()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {hiveSensors.length === 0 && (
              <Grid item xs={12}>
                <Typography color="text.secondary">
                  No sensors found for this hive.
                </Typography>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {hiveAlerts.map((alert) => (
            <Paper
              key={alert.id}
              sx={{
                p: 2,
                mb: 2,
                borderLeft: 4,
                borderColor: alert.severity === 'critical' ? 'error.main' :
                  alert.severity === 'warning' ? 'warning.main' : 'info.main',
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {new Date(alert.timestamp).toLocaleString()}
              </Typography>
              <Typography variant="h6">{alert.alertType}</Typography>
              <Typography>{alert.message}</Typography>
              <Typography variant="caption" color="text.secondary">
                Sensor ID: {alert.sensorId} | Severity: {alert.severity}
                {alert.isResolved && ' | RESOLVED'}
              </Typography>
            </Paper>
          ))}
          {hiveAlerts.length === 0 && (
            <Typography color="text.secondary">
              No alerts for this hive. Everything looks good!
            </Typography>
          )}
        </TabPanel>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Inspection</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Notes"
              fullWidth
              multiline
              rows={4}
              required
              value={inspectionData.notes}
              onChange={(e) => setInspectionData({ ...inspectionData, notes: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              margin="dense"
              label="Health Status"
              fullWidth
              required
              value={inspectionData.health}
              onChange={(e) => setInspectionData({ ...inspectionData, health: e.target.value })}
            >
              <MenuItem value="good">Good</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={hiveStore.loading}>
              {hiveStore.loading ? 'Adding...' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
});

export default HiveDetailsPage;