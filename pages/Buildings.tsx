import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Grid, Card, Button, IconButton, 
  Avatar, Chip, CircularProgress, Paper, useTheme, 
  Fade, Stack, Divider, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  useMediaQuery, LinearProgress, Tooltip
} from '@mui/material';
import { 
  Search, Building2, ChevronRight, Zap, Droplets, MapPin, 
  LayoutGrid, Home, Loader2, Users, X, User, Phone, 
  Calendar, Briefcase, Info, Edit3, Save, CheckCircle2, 
  Trash2, PlusCircle, Star, ShieldCheck, Wallet, CreditCard, 
  ArrowRight, MessageSquare, AlertCircle, History, Receipt, 
  Ghost, FileText, ClipboardCheck, Filter, Download 
} from 'lucide-react';
import { api } from '../services/api';
import { SOCIETY_INFO, BUILDINGS as WING_CONSTANTS } from '../constants';
import { FlatType, Building, Flat, FamilyMember, OccupancyType, PaymentStatus, MaintenanceRecord } from '../types';
import { useLanguage } from '../components/LanguageContext';

const Buildings: React.FC = () => {
  const { t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFlat, setSelectedFlat] = useState<any | null>(null);
  const [registeredUnits, setRegisteredUnits] = useState<any[]>([]); 
  const [user, setUser] = useState<any>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [totalMaintenance, setTotalMaintenance] = useState(2500);
  
  useEffect(() => {
    const stored = localStorage.getItem('sr_user');
    if (stored) setUser(JSON.parse(stored));
    loadBuildingsAndOccupancy();
  }, []);

  useEffect(() => {
    const fetchMaintenance = async () => {
      const { total } = await api.calculateMaintenanceWithPenalty(SOCIETY_INFO.maintenanceAmount);
      setTotalMaintenance(total);
    };
    fetchMaintenance();
  }, []);

  const loadBuildingsAndOccupancy = async (retries = 0) => {
    if (retries === 0) setLoading(true);
    try {
      const [bData, oData] = await Promise.all([
        api.getBuildings(),
        api.getOccupancyData()
      ]);
      setBuildings(bData);
      setRegisteredUnits(oData);
      setLoading(false);
    } catch (e: any) {
      if (e.message === 'SERVER_STARTING' && retries < 5) {
        setTimeout(() => loadBuildingsAndOccupancy(retries + 1), 2000);
        return;
      }
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';

  const vacancyReport = useMemo(() => {
    const report: Record<string, string[]> = {};
    let totalVacant = 0;

    WING_CONSTANTS.forEach(wing => {
      const vacantInWing: string[] = [];
      for (let floor = 1; floor <= 5; floor++) {
        for (let unit = 1; unit <= 4; unit++) {
          const unitNo = `${floor}0${unit}`;
          const flatId = `${wing.name}-${unitNo}`;
          const isRegistered = registeredUnits.some(p => p.flatId === flatId);
          if (!isRegistered) {
            vacantInWing.push(unitNo);
            totalVacant++;
          }
        }
      }
      if (vacantInWing.length > 0) {
        report[wing.name] = vacantInWing;
      }
    });

    return { report, totalVacant };
  }, [registeredUnits]);

  const filteredBuildings = buildings.filter(b => {
    const name = b.name || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalUnits = 480;
  const occupiedCount = registeredUnits.length;
  const vacantCount = totalUnits - occupiedCount;

  const renderFloorGrid = (building: Building) => {
    const floors = [5, 4, 3, 2, 1];
    const unitsPerFloor = [1, 2, 3, 4];
    
    return floors.map(floor => (
      <Box key={floor} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 }, mb: 2 }}>
        <Box sx={{ width: 60, textAlign: 'right' }}>
          <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.disabled', letterSpacing: 1 }}>
            Floor {floor}
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ flex: 1 }}>
          {unitsPerFloor.map(unit => {
            const unitNo = `${floor}0${unit}`;
            const flatId = `${building.name}-${unitNo}`;
            const profile = registeredUnits.find(p => p.flatId === flatId);
            const isOccupied = !!profile;

            return (
              <Grid item xs={3} key={unitNo}>
                <Button
                  fullWidth
                  onClick={() => setSelectedFlat({ unitNumber: unitNo, profile })}
                  sx={{
                    aspectRatio: '16/10',
                    borderRadius: 4,
                    border: '2px solid',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: !isOccupied 
                      ? 'action.hover' 
                      : profile.occupancyType === 'Owner'
                        ? 'success.light'
                        : 'info.light',
                    borderColor: !isOccupied 
                      ? 'divider' 
                      : profile.occupancyType === 'Owner'
                        ? 'success.main'
                        : 'info.main',
                    borderStyle: !isOccupied ? 'dashed' : 'solid',
                    opacity: !isOccupied ? 0.6 : 1,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      bgcolor: !isOccupied 
                        ? 'action.selected' 
                        : profile.occupancyType === 'Owner'
                          ? 'success.light'
                          : 'info.light',
                    }
                  }}
                >
                  <Box sx={{ 
                    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                    bgcolor: !isOccupied ? 'text.disabled' : profile.occupancyType === 'Owner' ? 'success.main' : 'info.main'
                  }} />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 900, 
                    color: !isOccupied ? 'text.disabled' : 'text.primary',
                    fontSize: { xs: '0.8rem', md: '1.25rem' }
                  }}>
                    {unitNo}
                  </Typography>
                  {isOccupied && (
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                      <User size={10} color={theme.palette.primary.main} />
                      <Typography variant="caption" sx={{ 
                        fontWeight: 900, 
                        fontSize: '0.5rem', 
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        maxWidth: 40,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {profile.name.split(' ')[0]}
                      </Typography>
                    </Stack>
                  )}
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    ));
  };

  if (loading) {
    return (
      <Box sx={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 2 }}>
          Auditing Society Assets...
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in={true}>
      <Box sx={{ pb: 8 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { md: 'center' }, 
          gap: 3, 
          mb: 6,
          pb: 4,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, tracking: '-0.04em' }}>
              {t('residential_infra')}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
              Real-time occupancy tracking for Pasodara portal
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
            <Stack direction="row" spacing={2}>
              <Paper sx={{ px: 3, py: 1.5, borderRadius: 4, textAlign: 'center', border: '1px solid', borderColor: 'success.light', bgcolor: 'success.light', opacity: 0.8 }}>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'success.main', textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.5 }}>Registered</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'success.main', lineHeight: 1 }}>{occupiedCount}</Typography>
              </Paper>
              <Paper sx={{ px: 3, py: 1.5, borderRadius: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.5 }}>Vacant</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', lineHeight: 1 }}>{vacantCount}</Typography>
              </Paper>
            </Stack>
            {isAdmin && (
              <Button 
                variant="contained" 
                color="inherit"
                startIcon={<FileText size={18} />}
                onClick={() => setShowAuditModal(true)}
                sx={{ 
                  borderRadius: 6, px: 4, py: 1.5, 
                  fontWeight: 900, textTransform: 'uppercase', 
                  boxShadow: 6, bgcolor: 'text.primary', color: 'background.paper',
                  '&:hover': { bgcolor: 'primary.main' }
                }}
              >
                Vacancy Report
              </Button>
            )}
          </Stack>
        </Box>

        <Grid container spacing={4}>
          {filteredBuildings.map((building, index) => {
            const wingOccupied = registeredUnits.filter(p => p.flatId.startsWith(building.name)).length;
            return (
              <Grid item xs={12} sm={6} lg={4} xl={3} key={building.id || index}>
                <Card 
                  onClick={() => setSelectedBuilding(building)}
                  sx={{ 
                    borderRadius: 8, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    boxShadow: 0,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Box sx={{ height: 10, bgcolor: building.type === '1BHK' ? 'info.main' : 'primary.main' }} />
                  <Box sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                      <Avatar sx={{ 
                        width: 56, height: 56, borderRadius: 4, 
                        bgcolor: 'action.hover', color: 'text.secondary',
                        transition: 'all 0.3s ease',
                        '.MuiCard-root:hover &': { bgcolor: 'primary.main', color: 'white' }
                      }}>
                        <Building2 size={28} />
                      </Avatar>
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip 
                          label={building.type} 
                          size="small" 
                          sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', borderRadius: 2, mb: 1 }} 
                        />
                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 900, color: 'primary.main', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                          {wingOccupied}/20 Registered
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="h4" sx={{ fontWeight: 900, mb: 3 }}>Wing {building.name}</Typography>

                    <Grid container spacing={2} sx={{ mb: 4 }}>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, borderRadius: 4, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <LayoutGrid size={10} /> Floors
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 900 }}>5</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, borderRadius: 4, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <Home size={10} /> Parking
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 900 }}>{building.parkingSpots || 20}</Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="inherit"
                      endIcon={<ChevronRight size={18} />}
                      sx={{ 
                        borderRadius: 4, py: 1.5, 
                        fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem',
                        bgcolor: 'text.primary', color: 'background.paper',
                        '&:hover': { bgcolor: 'primary.main' }
                      }}
                    >
                      {t('view_wing_mgmt')}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Vacancy Audit Modal */}
        <Dialog 
          open={showAuditModal} 
          onClose={() => setShowAuditModal(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 10, p: 0, overflow: 'hidden' } }}
        >
          <DialogTitle sx={{ p: 4, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'text.primary', borderRadius: 4 }}>
                <ClipboardCheck size={32} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>Detailed Occupancy Audit</Typography>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase' }}>
                  Listing {vacancyReport.totalVacant} Unregistered units across 24 wings
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField 
                size="small"
                placeholder="Search Wing..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3, bgcolor: 'action.hover' }
                }}
              />
              <IconButton onClick={() => setShowAuditModal(false)}>
                <X size={24} />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ p: 4, bgcolor: 'action.hover' }}>
            <Stack spacing={3}>
              {Object.entries(vacancyReport.report)
                .filter(([wing]) => wing.toLowerCase().includes(auditSearch.toLowerCase()))
                .map(([wing, flats]: [string, string[]]) => (
                <Paper key={wing} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ width: 40, height: 40, borderRadius: 3, bgcolor: 'action.hover', color: 'text.disabled', fontWeight: 900 }}>
                        {wing}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>Wing {wing} Vacancies</Typography>
                    </Stack>
                    <Chip 
                      label={`${flats.length} Missing Profiles`} 
                      size="small" 
                      color="error" 
                      sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', borderRadius: 2 }} 
                    />
                  </Box>
                  <Grid container spacing={1}>
                    {flats.map((f: string) => (
                      <Grid item xs={3} sm={2} md={1.5} key={f}>
                        <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'action.hover', border: '1px solid', borderColor: 'transparent', '&:hover': { borderColor: 'primary.main' } }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', display: 'block' }}>{f}</Typography>
                          <Ghost size={12} style={{ opacity: 0.3 }} />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
              <AlertCircle size={16} color={theme.palette.warning.main} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>Units listed here have no entry in the digital profiles table.</Typography>
            </Stack>
            <Button 
              variant="contained" 
              startIcon={<Download size={18} />}
              onClick={() => {
                api.exportToCSV(
                  Object.entries(vacancyReport.report).flatMap(([wing, flats]: [string, string[]]) => flats.map((f: string) => ({ Wing: wing, Flat: f }))),
                  'Saurashtra_Vacancy_Report'
                );
              }}
              sx={{ borderRadius: 4, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem' }}
            >
              Download List
            </Button>
          </DialogActions>
        </Dialog>

        {/* Wing Map Modal */}
        <Dialog 
          open={!!selectedBuilding} 
          onClose={() => setSelectedBuilding(null)}
          maxWidth="lg"
          fullWidth
          PaperProps={{ sx: { borderRadius: 10, p: 0, overflow: 'hidden' } }}
        >
          <DialogTitle sx={{ p: 4, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', borderRadius: 4, boxShadow: 6 }}>
                <Building2 size={32} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>Wing {selectedBuilding?.name}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase' }}>Real-Time Occupancy Map</Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setSelectedBuilding(null)} sx={{ p: 2 }}>
              <X size={32} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 4, bgcolor: 'action.hover' }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <LayoutGrid size={24} color={theme.palette.primary.main} />
                <Typography variant="h6" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>{t('floor_map')}</Typography>
              </Stack>
              <Stack direction="row" spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.disabled', fontSize: '0.6rem' }}>Registered Owner</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: 'info.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.disabled', fontSize: '0.6rem' }}>Registered Tenant</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, border: '2px dashed', borderColor: 'divider', bgcolor: 'background.paper' }} />
                  <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.disabled', fontSize: '0.6rem' }}>Unregistered / Vacant</Typography>
                </Box>
              </Stack>
            </Box>

            <Paper sx={{ p: 6, borderRadius: 8, border: '1px solid', borderColor: 'divider', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
              <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                {selectedBuilding && renderFloorGrid(selectedBuilding)}
                <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Box sx={{ width: 60 }} />
                  <Box sx={{ flex: 1, height: 12, bgcolor: 'action.hover', borderRadius: 6, position: 'relative' }}>
                    <Chip 
                      label="Lobby Entrance" 
                      size="small" 
                      sx={{ 
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem',
                        bgcolor: 'text.primary', color: 'background.paper'
                      }} 
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </DialogContent>
        </Dialog>

        {/* Flat & Residents Details Modal */}
        <Dialog 
          open={!!selectedFlat} 
          onClose={() => setSelectedFlat(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 10, p: 0, overflow: 'hidden' } }}
        >
          <DialogTitle sx={{ p: 4, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 48, height: 48, bgcolor: 'text.primary', borderRadius: 4 }}>
                <Home size={24} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>{t('unit')} {selectedFlat?.unitNumber}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase' }}>
                  {selectedFlat?.profile ? 'Registered Occupant' : 'Unregistered Profile'}
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setSelectedFlat(null)}>
              <X size={28} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 4, bgcolor: 'action.hover' }}>
            {selectedFlat?.profile ? (
              <Stack spacing={4}>
                <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Avatar 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedFlat.profile.name}`}
                      sx={{ width: 80, height: 80, borderRadius: 6, bgcolor: 'primary.light' }}
                    />
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>{selectedFlat.profile.name}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <Chip label={selectedFlat.profile.occupancyType} size="small" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', borderRadius: 1.5 }} />
                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase' }}>{selectedFlat.profile.status} Member</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>

                <Paper sx={{ p: 4, borderRadius: 8, border: '1px solid', borderColor: 'divider', boxShadow: 6, position: 'relative', overflow: 'hidden' }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 4 }}>
                      <CreditCard size={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>{t('maintenance')} Summary</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase' }}>Society Dues</Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ mb: 4 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>Standard Maintenance</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 900 }}>₹{totalMaintenance}</Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                      sx={{ borderRadius: 8, px: 5, py: 2, fontWeight: 900, textTransform: 'uppercase', boxShadow: 10 }}
                    >
                      {t('pay_now')}
                    </Button>
                  </Box>
                </Paper>
              </Stack>
            ) : (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <Avatar sx={{ width: 120, height: 120, borderRadius: 8, bgcolor: 'action.hover', border: '4px dashed', borderColor: 'divider', mx: 'auto', mb: 4 }}>
                  <Ghost size={64} style={{ opacity: 0.2 }} />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.disabled', mb: 1 }}>No Active Registration</Typography>
                <Typography variant="body2" sx={{ color: 'text.disabled', maxWidth: 300, mx: 'auto', mb: 4 }}>
                  This unit has no registered users in the digital portal. Dues are tracked against the property.
                </Typography>
                <Button variant="contained" color="inherit" sx={{ borderRadius: 4, fontWeight: 900, textTransform: 'uppercase', bgcolor: 'text.primary', color: 'background.paper' }}>
                  Initiate Offline Ledger
                </Button>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default Buildings;
