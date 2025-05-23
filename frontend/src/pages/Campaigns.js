import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  LinearProgress,
  Avatar,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { campaignService } from '../services/api';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [participationStats, setParticipationStats] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateRange: {
      start: null,
      end: null,
    },
  });

  const columns = [
    { field: 'name', headerName: 'Campaign Name', width: 200 },
    { field: 'type', headerName: 'Type', width: 130 },
    { field: 'startDate', headerName: 'Start Date', width: 180 },
    { field: 'endDate', headerName: 'End Date', width: 180 },
    { field: 'status', headerName: 'Status', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleCampaignClick(params.row)}
        >
          View Details
        </Button>
      ),
    },
  ];

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignService.getActiveCampaigns();
      setCampaigns(response.data);
      setFilteredCampaigns(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignClick = async (campaign) => {
    setSelectedCampaign(campaign);
    try {
      const response = await campaignService.getCampaignStats(campaign.id);
      setParticipationStats(response.data);
    } catch (err) {
      console.error('Failed to fetch campaign stats:', err);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateRangeChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value,
      },
    }));
  };

  const applyFilters = () => {
    let filtered = [...campaigns];

    if (filters.type) {
      filtered = filtered.filter((campaign) => campaign.type === filters.type);
    }

    if (filters.status) {
      filtered = filtered.filter((campaign) => campaign.status === filters.status);
    }

    if (filters.dateRange.start) {
      filtered = filtered.filter(
        (campaign) => new Date(campaign.startDate) >= filters.dateRange.start
      );
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter(
        (campaign) => new Date(campaign.endDate) <= filters.dateRange.end
      );
    }

    setFilteredCampaigns(filtered);
    setFilterDialogOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      type: '',
      status: '',
      dateRange: {
        start: null,
        end: null,
      },
    });
    setFilteredCampaigns(campaigns);
  };

  const chartData = participationStats
    ? {
        labels: participationStats.categories,
        datasets: [
          {
            label: 'Participation Count',
            data: participationStats.counts,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1,
          },
        ],
      }
    : null;

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h4">Active Campaigns</Typography>
            <Box>
              <TextField
                size="small"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ mr: 2 }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setFilterDialogOpen(true)}
              >
                Filter
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <DataGrid
                rows={filteredCampaigns}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                autoHeight
                disableSelectionOnClick
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Campaign Details Dialog */}
        <Dialog
          open={!!selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          maxWidth="md"
          fullWidth
        >
          {selectedCampaign && (
            <>
              <DialogTitle>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="h6">
                    Campaign Details: {selectedCampaign.name}
                  </Typography>
                  <IconButton onClick={() => setSelectedCampaign(null)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Campaign Information
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body1">
                            <strong>Type:</strong>{' '}
                            <Chip
                              label={selectedCampaign.type}
                              color="primary"
                              size="small"
                            />
                          </Typography>
                          <Typography variant="body1">
                            <strong>Start Date:</strong>{' '}
                            {new Date(selectedCampaign.startDate).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body1">
                            <strong>End Date:</strong>{' '}
                            {new Date(selectedCampaign.endDate).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body1">
                            <strong>Status:</strong>{' '}
                            <Chip
                              label={selectedCampaign.status}
                              color={
                                selectedCampaign.status === 'active'
                                  ? 'success'
                                  : 'error'
                              }
                              size="small"
                            />
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" gutterBottom>
                              Progress
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={selectedCampaign.progress}
                              sx={{ height: 10, borderRadius: 5 }}
                            />
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {selectedCampaign.progress}% Complete
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Participation Statistics
                        </Typography>
                        {participationStats && (
                          <Box sx={{ height: 300 }}>
                            <Bar
                              data={chartData}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'top',
                                  },
                                },
                              }}
                            />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedCampaign(null)}>Close</Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    // Handle campaign participation
                    setSelectedCampaign(null);
                  }}
                >
                  Participate
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Filter Dialog */}
        <Dialog
          open={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Filter Campaigns</Typography>
              <IconButton onClick={() => setFilterDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Campaign Type</InputLabel>
                <Select
                  value={filters.type}
                  label="Campaign Type"
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="discount">Discount</MenuItem>
                  <MenuItem value="points">Points</MenuItem>
                  <MenuItem value="referral">Referral</MenuItem>
                  <MenuItem value="special">Special Offer</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="ended">Ended</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="subtitle2" gutterBottom>
                Date Range
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Start Date"
                      value={filters.dateRange.start}
                      onChange={(date) => handleDateRangeChange('start', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="End Date"
                      value={filters.dateRange.end}
                      onChange={(date) => handleDateRangeChange('end', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetFilters}>Reset</Button>
            <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={applyFilters}>
              Apply Filters
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Container>
  );
}

export default Campaigns; 