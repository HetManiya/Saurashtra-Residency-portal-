
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, Container, Paper, Typography, TextField, 
  Button, IconButton, InputAdornment, Alert, 
  CircularProgress, Link as MuiLink, Stack, Chip,
  Fade, useTheme, Stepper, Step, StepLabel,
  FormControl, InputLabel, Select, MenuItem,
  Grid, Avatar, CardActionArea, Card
} from '@mui/material';
import { 
  UserPlus, Mail, Lock, User, Shield, Home, ArrowRight, 
  Loader2, CheckCircle, ChevronLeft, MapPin, Users,
  Star, Briefcase, Key, ChevronDown, Clock, AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { BUILDINGS } from '../constants';

const Register: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'RESIDENT', 
    position: 'Resident', 
    wing: 'A-1',
    flatNo: '101',
    occupancyType: 'Owner'
  });

  const wings = BUILDINGS.map(b => b.name);
  const flats = Array.from({ length: 5 }, (_, floor) => 
    Array.from({ length: 4 }, (_, unit) => `${(floor + 1) * 100 + (unit + 1)}`)
  ).flat();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const backendData = {
        ...formData,
        flatId: `${formData.wing}-${formData.flatNo}`,
        role: formData.role // Using role directly from selection
      };
      
      await api.register(backendData);
      
      navigate('/login', { 
        state: { 
          registered: true, 
          email: formData.email,
          message: "Registration requested! Your Wing President will verify and approve your account shortly. You will be able to log in once approved."
        } 
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roleCategories = [
    { 
      id: 'RESIDENT', 
      label: 'Flat Resident', 
      icon: Home, 
      desc: 'Owner or tenant living in the society',
      positions: ['Resident']
    },
    { 
      id: 'COMMITTEE', 
      label: 'Society Committee', 
      icon: Shield, 
      desc: 'Elected members managing the society',
      positions: ['President', 'Secretary', 'Treasurer']
    },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      bgcolor: 'background.default',
      position: 'relative',
      overflow: 'hidden',
      p: 3
    }}>
      {/* Decorative Background Elements */}
      <Box sx={{ 
        position: 'absolute', top: 0, left: 0, 
        width: 600, height: 600, 
        bgcolor: 'primary.main', opacity: 0.05, 
        borderRadius: '50%', filter: 'blur(120px)',
        ml: -24, mt: -24
      }} />
      <Box sx={{ 
        position: 'absolute', bottom: 0, right: 0, 
        width: 600, height: 600, 
        bgcolor: 'secondary.main', opacity: 0.05, 
        borderRadius: '50%', filter: 'blur(120px)',
        mr: -24, mb: -24
      }} />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={800}>
          <Paper sx={{ 
            p: { xs: 5, md: 8 }, 
            borderRadius: 10, 
            boxShadow: 24,
            border: '1px solid',
            borderColor: 'divider',
            position: 'relative',
            overflow: 'hidden'
          }}>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 6 }}>
              <IconButton 
                onClick={() => step > 1 ? setStep(step - 1) : navigate('/login')}
                sx={{ 
                  bgcolor: 'action.hover', 
                  borderRadius: 4,
                  '&:hover': { bgcolor: 'primary.light', color: 'white' }
                }}
              >
                <ChevronLeft size={24} />
              </IconButton>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[1, 2, 3].map(s => (
                  <Box 
                    key={s} 
                    sx={{ 
                      height: 6, 
                      width: 48, 
                      borderRadius: 3, 
                      bgcolor: step >= s ? 'primary.main' : 'action.hover',
                      transition: 'all 0.5s ease'
                    }} 
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, tracking: '-0.02em' }}>
                Saurashtra Membership
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
                Digital access registration for residents
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" icon={<AlertTriangle size={20} />} sx={{ mb: 4, borderRadius: 4, fontWeight: 700 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleRegister}>
              {step === 1 && (
                <Stack spacing={3} sx={{ animation: 'fadeInRight 0.5s ease' }}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', ml: 2, mb: 0.5, display: 'block' }}>
                      Full Name
                    </Typography>
                    <TextField 
                      fullWidth
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <User size={20} color={theme.palette.text.secondary} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 6, bgcolor: 'action.hover' }
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', ml: 2, mb: 0.5, display: 'block' }}>
                      Email Address
                    </Typography>
                    <TextField 
                      fullWidth
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Mail size={20} color={theme.palette.text.secondary} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 6, bgcolor: 'action.hover' }
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', ml: 2, mb: 0.5, display: 'block' }}>
                      Password
                    </Typography>
                    <TextField 
                      fullWidth
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock size={20} color={theme.palette.text.secondary} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 6, bgcolor: 'action.hover' }
                      }}
                    />
                  </Box>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    size="large"
                    onClick={() => setStep(2)}
                    endIcon={<ArrowRight size={18} />}
                    sx={{ py: 2, mt: 2, borderRadius: 6, bgcolor: 'grey.900', '&:hover': { bgcolor: 'grey.800' } }}
                  >
                    Continue to Role Selection
                  </Button>
                </Stack>
              )}

              {step === 2 && (
                <Stack spacing={4} sx={{ animation: 'fadeInRight 0.5s ease' }}>
                  <Box>
                    {roleCategories.map((cat) => (
                      <Box key={cat.id} sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <cat.icon size={16} color={theme.palette.primary.main} />
                          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                            {cat.label}
                          </Typography>
                        </Box>
                        <Stack spacing={2}>
                          {cat.positions.map(pos => (
                            <Card 
                              key={pos} 
                              variant="outlined"
                              sx={{ 
                                borderRadius: 6, 
                                borderColor: formData.position === pos ? 'primary.main' : 'divider',
                                bgcolor: formData.position === pos ? 'primary.light' : 'background.paper',
                                transition: 'all 0.3s ease',
                                '&:hover': { borderColor: 'primary.main' }
                              }}
                            >
                              <CardActionArea 
                                onClick={() => setFormData({...formData, position: pos, role: cat.id})}
                                sx={{ p: 3 }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Avatar sx={{ 
                                      width: 48, height: 48, 
                                      bgcolor: formData.position === pos ? 'primary.main' : 'action.hover',
                                      color: formData.position === pos ? 'white' : 'text.secondary',
                                      borderRadius: 4
                                    }}>
                                      {pos === 'Resident' ? <Home size={24} /> : <Shield size={24} />}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: formData.position === pos ? 'primary.main' : 'text.primary' }}>
                                        {pos}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                                        {cat.desc}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  {formData.position === pos && <CheckCircle size={22} color={theme.palette.primary.main} />}
                                </Box>
                              </CardActionArea>
                            </Card>
                          ))}
                        </Stack>
                      </Box>
                    ))}
                  </Box>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    size="large"
                    onClick={() => setStep(3)}
                    endIcon={<ArrowRight size={18} />}
                    sx={{ py: 2, borderRadius: 6, bgcolor: 'grey.900', '&:hover': { bgcolor: 'grey.800' } }}
                  >
                    Configure Property Mapping
                  </Button>
                </Stack>
              )}

              {step === 3 && (
                <Stack spacing={4} sx={{ animation: 'fadeInRight 0.5s ease' }}>
                  <Paper elevation={0} sx={{ p: 3, bgcolor: 'primary.light', borderRadius: 6, border: '1px solid', borderColor: 'primary.main', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', borderRadius: 4, boxShadow: 6 }}>
                      {formData.position === 'Resident' ? <Home size={28} /> : <Shield size={28} />}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Identity Profile
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {formData.position}
                      </Typography>
                    </Box>
                  </Paper>

                  <Grid container spacing={2}>
                    <Grid size={6}>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', ml: 2, mb: 0.5, display: 'block' }}>
                        Building Wing
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={formData.wing}
                          onChange={e => setFormData({...formData, wing: e.target.value as string})}
                          sx={{ borderRadius: 6, bgcolor: 'action.hover' }}
                        >
                          {wings.map(w => <MenuItem key={w} value={w}>Wing {w}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', ml: 2, mb: 0.5, display: 'block' }}>
                        Flat Number
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={formData.flatNo}
                          onChange={e => setFormData({...formData, flatNo: e.target.value as string})}
                          sx={{ borderRadius: 6, bgcolor: 'action.hover' }}
                        >
                          {flats.map(f => <MenuItem key={f} value={f}>Flat {f}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', ml: 2, mb: 1, display: 'block' }}>
                      Occupancy Status
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      {['Owner', 'Tenant'].map(type => (
                        <Button 
                          key={type} 
                          fullWidth
                          variant={formData.occupancyType === type ? 'contained' : 'outlined'}
                          onClick={() => setFormData({...formData, occupancyType: type})}
                          sx={{ 
                            py: 2, 
                            borderRadius: 6, 
                            fontWeight: 900, 
                            fontSize: '0.75rem',
                            bgcolor: formData.occupancyType === type ? 'primary.main' : 'transparent',
                            color: formData.occupancyType === type ? 'white' : 'text.secondary',
                            borderColor: formData.occupancyType === type ? 'primary.main' : 'divider'
                          }}
                        >
                          {type}
                        </Button>
                      ))}
                    </Stack>
                  </Box>

                  <Button 
                    fullWidth 
                    variant="contained" 
                    size="large"
                    type="submit"
                    disabled={loading}
                    endIcon={!loading && <CheckCircle size={18} />}
                    sx={{ py: 2, borderRadius: 6, boxShadow: 10 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Registration'}
                  </Button>
                </Stack>
              )}
            </form>
          </Paper>
        </Fade>
      </Container>
      
      <style>{`
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </Box>
  );
};

export default Register;
