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
  Tooltip,
} from '@mui/material';
import {
  LocalOffer as CouponIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { couponService } from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [usageStats, setUsageStats] = useState(null);

  const columns = [
    { field: 'code', headerName: 'Code', width: 130 },
    { field: 'discount', headerName: 'Discount', width: 130 },
    { field: 'validUntil', headerName: 'Valid Until', width: 180 },
    { field: 'status', headerName: 'Status', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleCouponClick(params.row)}
        >
          View Details
        </Button>
      ),
    },
  ];

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await couponService.getAvailableCoupons();
      setCoupons(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleCouponClick = async (coupon) => {
    setSelectedCoupon(coupon);
    try {
      const response = await couponService.getCouponStats(coupon.id);
      setUsageStats(response.data);
    } catch (err) {
      console.error('Failed to fetch coupon stats:', err);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = usageStats
    ? {
        labels: usageStats.dates,
        datasets: [
          {
            label: 'Usage Count',
            data: usageStats.counts,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
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
            <Typography variant="h4">Available Coupons</Typography>
            <Box>
              <TextField
                size="small"
                placeholder="Search coupons..."
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
                rows={filteredCoupons}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                autoHeight
                disableSelectionOnClick
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Coupon Details Dialog */}
        <Dialog
          open={!!selectedCoupon}
          onClose={() => setSelectedCoupon(null)}
          maxWidth="md"
          fullWidth
        >
          {selectedCoupon && (
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
                    Coupon Details: {selectedCoupon.code}
                  </Typography>
                  <IconButton onClick={() => setSelectedCoupon(null)}>
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
                          Coupon Information
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body1">
                            <strong>Discount:</strong> {selectedCoupon.discount}
                          </Typography>
                          <Typography variant="body1">
                            <strong>Valid Until:</strong>{' '}
                            {new Date(selectedCoupon.validUntil).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body1">
                            <strong>Status:</strong>{' '}
                            <Chip
                              label={selectedCoupon.status}
                              color={
                                selectedCoupon.status === 'active'
                                  ? 'success'
                                  : 'error'
                              }
                              size="small"
                            />
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Usage Statistics
                        </Typography>
                        {usageStats && (
                          <Box sx={{ height: 300 }}>
                            <Line
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
                <Button onClick={() => setSelectedCoupon(null)}>Close</Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    // Handle coupon application
                    setSelectedCoupon(null);
                  }}
                >
                  Apply Coupon
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
          <DialogTitle>Filter Coupons</DialogTitle>
          <DialogContent>
            {/* Add filter options here */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setFilterDialogOpen(false)}>
              Apply Filters
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Container>
  );
}

export default Coupons; 