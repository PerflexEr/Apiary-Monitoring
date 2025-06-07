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
  const [inspectionData, setInspectionData] = useState<InspectionCreate>({
    temperature: 0,
    humidity: 0,
    weight: 0,
    notes: ''
  });

  useEffect(() => {
    // Загружаем список ульев при монтировании компонента
    hiveStore.fetchHives();
  }, []);

  const handleHiveChange = (event: SelectChangeEvent) => {
    setSelectedHiveId(event.target.value);
    if (event.target.value) {
      // Загружаем инспекции для выбранного улья
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
        notes: ''
      });
    } catch (error) {
      console.error('Failed to create inspection:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Инспекция улья
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="hive-select-label">Выберите улей</InputLabel>
                <Select
                  labelId="hive-select-label"
                  id="hive-select"
                  value={selectedHiveId}
                  label="Выберите улей"
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
                    label="Температура"
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
                    label="Влажность"
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
                    label="Вес"
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
                    label="Заметки"
                    name="notes"
                    multiline
                    rows={4}
                    value={inspectionData.notes}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                  >
                    Добавить инспекцию
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Список последних инспекций */}
      {selectedHiveId && hiveStore.inspections.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Последние инспекции
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
                      <strong>Температура:</strong> {'temperature' in inspection ? (inspection as any).temperature : '—'}°C
                    </Typography>
                    <Typography>
                      <strong>Влажность:</strong> {'humidity' in inspection ? (inspection as any).humidity : '—'}%
                    </Typography>
                    <Typography>
                      <strong>Вес:</strong> {'weight' in inspection ? (inspection as any).weight : '—'} кг
                    </Typography>
                    {inspection.notes && (
                      <Typography>
                        <strong>Заметки:</strong> {inspection.notes}
                      </Typography>
                    )}
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
