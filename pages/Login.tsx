
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Box, Container, Paper, Typography, TextField, 
  Button, IconButton, InputAdornment, Alert, 
  CircularProgress, Link as MuiLink, Stack, Chip,
  Fade, useTheme, Avatar
} from '@mui/material';
import { 
  Lock, Mail, Loader2, Shield, CheckCircle, AlertTriangle, 
  UserPlus, Info, ShieldCheck, Home, ArrowRight, User, 
  ShieldAlert 
} from 'lucide-react';
import { api } from '../services/api';

const Login: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state && (location.state as any).registered) {
      setSuccess((location.state as any).message || 'Account created successfully!');
      if ((location.state as any).email) setEmail((location.state as any).email);
    }
  }, [location.state]);

  const handleAuth = async (e?: React.FormEvent, customCreds?: {e: string, p: string}) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const targetEmail = customCreds ? customCreds.e : email;
    const targetPass = customCreds ? customCreds.p : password;

    try {
      const response = await api.login({ email: targetEmail, password: targetPass });
      if (response && (response.token || response.user)) {
        setSuccess('Login successfully! Redirecting to dashboard...');
        window.dispatchEvent(new Event('storage'));
        
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please use the Quick Demo access below.");
    } finally {
      if (!success) setLoading(false);
    }
  };

  const quickDemoLogin = (role: 'admin' | 'resident') => {
    if (role === 'admin') {
      handleAuth(undefined, { e: 'admin@residency.com', p: 'admin123' });
    } else {
      handleAuth(undefined, { e: 'resident@residency.com', p: 'resident123' });
    }
  };

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
        position: 'absolute', top: 0, right: 0, 
        width: 800, height: 800, 
        bgcolor: 'primary.main', opacity: 0.05, 
        borderRadius: '50%', filter: 'blur(120px)',
        mr: -40, mt: -40
      }} />
      <Box sx={{ 
        position: 'absolute', bottom: 0, left: 0, 
        width: 800, height: 800, 
        bgcolor: 'secondary.main', opacity: 0.05, 
        borderRadius: '50%', filter: 'blur(120px)',
        ml: -40, mb: -40
      }} />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={800}>
          <Paper sx={{ 
            p: { xs: 5, md: 8 }, 
            borderRadius: 10, 
            boxShadow: 24,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Avatar sx={{ 
                width: 64, height: 64, 
                bgcolor: 'primary.main', 
                mx: 'auto', mb: 3,
                boxShadow: 10,
                transform: 'rotate(5deg)'
              }}>
                <Shield size={32} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, tracking: '-0.02em' }}>
                Saurashtra Residency <Box component="span" sx={{ color: 'primary.main' }}>Portal</Box>
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 2 }}>
                Premium Community Access
              </Typography>
            </Box>

            {success && (
              <Alert severity="success" icon={<CheckCircle size={20} />} sx={{ mb: 4, borderRadius: 4, fontWeight: 700 }}>
                {success}
              </Alert>
            )}
            {error && (
              <Alert severity="error" icon={<AlertTriangle size={20} />} sx={{ mb: 4, borderRadius: 4, fontWeight: 700 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleAuth}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', ml: 2, mb: 0.5, display: 'block' }}>
                    User ID
                  </Typography>
                  <TextField 
                    fullWidth
                    placeholder="name@residency.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading || !!success}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={18} color={theme.palette.text.secondary} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 4, bgcolor: 'action.hover' }
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
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading || !!success}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={18} color={theme.palette.text.secondary} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 4, bgcolor: 'action.hover' }
                    }}
                  />
                </Box>

                <Button 
                  fullWidth 
                  variant="contained" 
                  size="large"
                  type="submit"
                  disabled={loading || !!success}
                  sx={{ py: 2, mt: 2, borderRadius: 6, fontSize: '1rem' }}
                >
                  {loading && !success ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                </Button>
              </Stack>
            </form>

            {/* Demo Access Panel */}
            <Paper elevation={0} sx={{ mt: 6, p: 3, bgcolor: 'action.hover', borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
                <ShieldCheck size={14} color={theme.palette.primary.main} /> Demo Suite Access
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="warning" 
                  onClick={() => quickDemoLogin('admin')}
                  startIcon={<ShieldAlert size={14} />}
                  sx={{ borderRadius: 3, fontSize: '0.65rem' }}
                >
                  System Admin
                </Button>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  onClick={() => quickDemoLogin('resident')}
                  startIcon={<User size={14} />}
                  sx={{ borderRadius: 3, fontSize: '0.65rem', bgcolor: 'background.paper' }}
                >
                  Live Resident
                </Button>
              </Stack>
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'text.secondary', fontStyle: 'italic', fontSize: '0.6rem' }}>
                Note: Admin access is restricted to verified committee credentials in production.
              </Typography>
            </Paper>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <MuiLink 
                component={Link} 
                to="/register" 
                sx={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 900, 
                  textTransform: 'uppercase', 
                  color: 'text.secondary',
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                New to residency? <Box component="span" sx={{ color: 'primary.main' }}>Register Property</Box>
              </MuiLink>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;
