// frontend/src/pages/HivesPage.tsx
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarTodayIcon,
  GridOn as GridOnIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { rootStore } from '../stores/RootStore';

interface HiveFormData {
  name: string;
  location: string;
  queen_year: number;
  frames_count: number;
}

const HivesPage: React.FC = observer(() => {
  const navigate = useNavigate();
  const { hiveStore, monitoringStore } = rootStore;
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<HiveFormData>({
    name: '',
    location: '',
    queen_year: new Date().getFullYear(),
    frames_count: 10,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hiveToDelete, setHiveToDelete] = useState<number | null>(null);

  useEffect(() => {
    hiveStore.fetchHives();
    monitoringStore.fetchAlerts();
  }, []);

  const handleOpenDialog = () => {
    setFormData({
      name: '',
      location: '',
      queen_year: new Date().getFullYear(),
      frames_count: 10
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Убеждаемся что числовые поля действительно числа
      const hiveData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        queen_year: Number(formData.queen_year),
        frames_count: Number(formData.frames_count)
      };

      console.log('Submitting hive data:', hiveData);
      await hiveStore.createHive(hiveData);
      handleCloseDialog();
      // Обновляем список ульев после создания
      await hiveStore.fetchHives();
    } catch (error: any) {
      console.error('Failed to create hive:', error);
      // Ошибка уже обрабатывается в store, просто логируем
    }
  };

  const handleDeleteClick = (hiveId: number) => {
    setHiveToDelete(hiveId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (hiveToDelete) {
      try {
        await hiveStore.deleteHive(hiveToDelete);
        setDeleteDialogOpen(false);
        setHiveToDelete(null);
      } catch (error) {
        console.error('Failed to delete hive:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setHiveToDelete(null);
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getHiveAlerts = (hiveId: number) => {
    return monitoringStore.getAlertsByHive(hiveId).filter(alert => !alert.isResolved);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Hives</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Hive
        </Button>
      </Box>

      {hiveStore.loading && <LinearProgress sx={{ mb: 2 }} />}


      <Grid container spacing={3}>
        {hiveStore.hives.map((hive) => {
          const hiveAlerts = getHiveAlerts(hive.id);
          return (
            <Grid item xs={12} sm={6} md={4} key={hive.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {hive.name}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/hives/${hive.id}`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(hive.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon fontSize="small" />
                    {hive.location}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label={hive.status === 'healthy' ? 'Healthy' : hive.status === 'warning' ? 'Warning' : hive.status === 'critical' ? 'Critical' : 'Unknown'}
                      color={getStatusColor(hive.status)}
                      size="small"
                    />
                    {hiveAlerts.length > 0 && (
                      <Chip
                        icon={<WarningIcon />}
                        label={`${hiveAlerts.length} Alert${hiveAlerts.length > 1 ? 's' : ''}`}
                        color="warning"
                        size="small"
                      />
                    )}
                  </Box>

                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarTodayIcon fontSize="small" />
                      Queen Year: {hive.queen_year}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GridOnIcon fontSize="small" />
                      Frames Count: {hive.frames_count}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarTodayIcon fontSize="small" />
                      Created: {new Date(hive.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}

        {hiveStore.hives.length === 0 && !hiveStore.loading && (
          <Grid item xs={12}>
            <Typography variant="h6" textAlign="center" color="text.secondary">
              No hives found. Create your first hive to get started!
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Add Hive Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Hive</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Hive Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Location"
              fullWidth
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Queen Year"
              type="number"
              fullWidth
              required
              value={formData.queen_year}
              onChange={(e) => setFormData({
                ...formData,
                queen_year: parseInt(e.target.value) || new Date().getFullYear()
              })}
              inputProps={{ min: 2000, max: new Date().getFullYear() + 1 }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Frames Count"
              type="number"
              fullWidth
              required
              value={formData.frames_count}
              onChange={(e) => setFormData({
                ...formData,
                frames_count: parseInt(e.target.value) || 10
              })}
              inputProps={{ min: 1, max: 50 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={hiveStore.loading}>
              {hiveStore.loading ? 'Creating...' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Hive</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this hive? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={hiveStore.loading}
          >
            {hiveStore.loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default HivesPage;