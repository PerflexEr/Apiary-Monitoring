import React, { useState, useEffect } from 'react';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useStore } from '../hooks/useStore';
import type { Hive } from '../types/stores';
import type { InspectionCreate } from '../stores/HiveStore';

const InspectionsPage: React.FC = () => {
  const { hiveStore } = useStore();
  const [selectedHiveId, setSelectedHiveId] = useState<string>('');
  const [inspectionData, setInspectionData] = useState<Omit<InspectionCreate, 'hive_id'>>({
    temperature: 0,
    humidity: 0,
    weight: 0,
    notes: '',
    status: 'healthy',
  });

  useEffect(() => {
    // Load the list of hives on component mount
    hiveStore.fetchHives();
  }, []);

  const handleHiveChange = (event: SelectChangeEvent) => {
    setSelectedHiveId(event.target.value);
    if (event.target.value) {
      // Load inspections for the selected hive
      hiveStore.fetchHiveInspections(parseInt(event.target.value));
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setInspectionData(prev => ({
      ...prev,
      [name]: name === 'notes' ? value : Number(value)
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedHiveId) return;
    try {
      await hiveStore.createInspection(parseInt(selectedHiveId), inspectionData);
      setInspectionData({
        temperature: 0,
        humidity: 0,
        weight: 0,
        notes: '',
        status: 'healthy',
      });
    } catch (error) {
      console.error('Failed to create inspection:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Hive Inspection
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="hive-select-label">Select Hive</InputLabel>
                <Select
                  labelId="hive-select-label"
                  id="hive-select"
                  value={selectedHiveId}
                  label="Select Hive"
                  onChange={handleHiveChange}
                >
                  {hiveStore.hives.map((hive: Hive) => (
                    <MenuItem key={hive.id} value={hive.id}>
                      {hive.name} - {hive.location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {selectedHiveId && (
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Temperature"
                    name="temperature"
                    type="number"
                    value={inspectionData.temperature}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Humidity"
                    name="humidity"
                    type="number"
                    value={inspectionData.humidity}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Weight"
                    name="weight"
                    type="number"
                    value={inspectionData.weight}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    multiline
                    rows={4}
                    value={inspectionData.notes}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="status-select-label">Status</InputLabel>
                    <Select
                      labelId="status-select-label"
                      id="status-select"
                      name="status"
                      value={inspectionData.status}
                      label="Status"
                      onChange={(e) => setInspectionData(prev => ({ ...prev, status: e.target.value as 'healthy' | 'warning' | 'critical' }))}
                      required
                    >
                      <MenuItem value="healthy">Healthy</MenuItem>
                      <MenuItem value="warning">Warning</MenuItem>
                      <MenuItem value="critical">Critical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                  >
                    Add Inspection
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List of recent inspections */}
      {selectedHiveId && hiveStore.inspections.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Recent Inspections
          </Typography>
          <Grid container spacing={2}>
            {hiveStore.inspections.map((inspection) => (
              <Grid item xs={12} md={6} key={inspection.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {inspection.created_at ? new Date(inspection.created_at).toLocaleDateString() : '—'}
                    </Typography>
                    <Typography>
                      <strong>Temperature:</strong> {inspection.temperature ?? '—'}°C
                    </Typography>
                    <Typography>
                      <strong>Humidity:</strong> {inspection.humidity ?? '—'}%
                    </Typography>
                    <Typography>
                      <strong>Weight:</strong> {inspection.weight ?? '—'} kg
                    </Typography>
                    {inspection.notes && (
                      <Typography>
                        <strong>Notes:</strong> {inspection.notes}
                      </Typography>
                    )}
                    <Typography>
                      <strong>Status:</strong> {
                        inspection.status === 'healthy' ? 'Healthy' :
                        inspection.status === 'warning' ? 'Warning' :
                        inspection.status === 'critical' ? 'Critical' : 'Unknown'
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default observer(InspectionsPage);
