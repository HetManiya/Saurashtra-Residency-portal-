
import React, { useState, useRef } from 'react';
import { 
  Box, Typography, Button, IconButton, TextField, 
  Grid, Card, CardContent, Avatar, Chip, Stack, 
  Paper, Divider, useTheme, Fade, FormControl, 
  InputLabel, Select, MenuItem, CircularProgress,
  Tooltip
} from '@mui/material';
import { 
  User, Phone, ClipboardList, Clock, ShieldCheck, 
  QrCode, Share2, Download, CheckCircle2, Loader2, 
  ArrowRight 
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../components/LanguageContext';
import { QRCodeCanvas } from 'qrcode.react';

const VisitorPass: React.FC = () => {
  const theme = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [passData, setPassData] = useState<any>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    purpose: '',
    validity: '4 hours'
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.generateVisitorPass({
        ...formData,
        type: formData.purpose.includes('Delivery') ? 'DELIVERY' : 
              formData.purpose.includes('Service') ? 'SERVICE' : 'GUEST'
      });
      setPassData(result);
    } catch (err) {
      alert("Pass generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const shareToWhatsApp = () => {
    if (!passData) return;
    const text = `Saurashtra Residency - Visitor Pass\n\nName: ${passData.name}\nPass ID: ${passData.passId}\nPurpose: ${passData.purpose}\nValidity: ${passData.validity}\n\nPlease show this pass at the main gate.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const downloadPass = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `VisitorPass_${passData.name}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <Box sx={{ maxWidth: '1000px', mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Fade in timeout={800}>
        <Box>
          <Box sx={{ 
            textAlign: { xs: 'center', md: 'left' },
            mb: 8,
            pb: 4,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="h3" sx={{ fontWeight: 900, tracking: '-0.04em' }}>
              {t('visitors')}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
              Generate instant QR passes for your guests
            </Typography>
          </Box>

          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 10, border: '1px solid', borderColor: 'divider', boxShadow: 4 }}>
                <form onSubmit={handleGenerate}>
                  <Stack spacing={4}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', ml: 2, mb: 0.5, display: 'block' }}>
                        {t('visitor_name')}
                      </Typography>
                      <TextField 
                        fullWidth
                        placeholder="Guest Full Name"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        InputProps={{
                          startAdornment: <User size={18} style={{ marginRight: 12, opacity: 0.5 }} />,
                          sx: { borderRadius: 4, bgcolor: 'action.hover' }
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', ml: 2, mb: 0.5, display: 'block' }}>
                        {t('visitor_phone')}
                      </Typography>
                      <TextField 
                        fullWidth
                        placeholder="+91 00000 00000"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        InputProps={{
                          startAdornment: <Phone size={18} style={{ marginRight: 12, opacity: 0.5 }} />,
                          sx: { borderRadius: 4, bgcolor: 'action.hover' }
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', ml: 2, mb: 0.5, display: 'block' }}>
                        {t('visitor_purpose')}
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={formData.purpose}
                          onChange={e => setFormData({...formData, purpose: e.target.value})}
                          displayEmpty
                          startAdornment={<ClipboardList size={18} style={{ marginRight: 12, opacity: 0.5 }} />}
                          sx={{ borderRadius: 4, bgcolor: 'action.hover' }}
                        >
                          <MenuItem value="">Select Purpose</MenuItem>
                          <MenuItem value="Personal Guest">Personal Guest</MenuItem>
                          <MenuItem value="Delivery / Courier">Delivery / Courier</MenuItem>
                          <MenuItem value="Maintenance Work">Maintenance Work</MenuItem>
                          <MenuItem value="Home Service">Home Service</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', ml: 2, mb: 1, display: 'block' }}>
                        {t('visitor_validity')}
                      </Typography>
                      <Grid container spacing={2}>
                        {['4 hours', '24 hours'].map(v => (
                          <Grid size={6} key={v}>
                            <Button 
                              fullWidth 
                              variant={formData.validity === v ? 'contained' : 'outlined'}
                              onClick={() => setFormData({...formData, validity: v})}
                              sx={{ 
                                py: 2, 
                                borderRadius: 4, 
                                fontWeight: 900, 
                                textTransform: 'uppercase', 
                                fontSize: '0.7rem',
                                bgcolor: formData.validity === v ? 'primary.main' : 'transparent',
                                color: formData.validity === v ? 'white' : 'text.secondary',
                                borderColor: formData.validity === v ? 'primary.main' : 'divider'
                              }}
                            >
                              {v}
                            </Button>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      size="large"
                      type="submit"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <QrCode size={18} />}
                      sx={{ py: 2, borderRadius: 6, fontWeight: 900, boxShadow: 10 }}
                    >
                      {loading ? 'Authorizing Access...' : t('visitor_generate')}
                    </Button>
                  </Stack>
                </form>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {passData ? (
                <Box sx={{ 
                  width: '100%', 
                  bgcolor: '#0F172A', 
                  p: 6, 
                  borderRadius: 12, 
                  color: 'white', 
                  boxShadow: 20, 
                  position: 'relative', 
                  overflow: 'hidden',
                  textAlign: 'center'
                }}>
                  <Box sx={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, bgcolor: 'primary.main', opacity: 0.1, borderRadius: '50%', filter: 'blur(40px)', mr: -8, mt: -8 }} />
                  <Stack spacing={4} sx={{ position: 'relative', zIndex: 1 }} ref={qrRef}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', mx: 'auto' }}>
                      <ShieldCheck size={14} color={theme.palette.success.main} />
                      <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {t('visitor_auth')}
                      </Typography>
                    </Box>
                    
                    <Paper sx={{ p: 4, bgcolor: 'white', borderRadius: 8, width: 'fit-content', mx: 'auto', boxShadow: 10 }}>
                       <QRCodeCanvas 
                        value={JSON.stringify({ id: passData.passId, name: passData.name, expires: passData.validity })}
                        size={180}
                        level="H"
                        includeMargin={true}
                       />
                    </Paper>

                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 900, tracking: '-0.02em' }}>
                        {passData.name}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.light', textTransform: 'uppercase', letterSpacing: 2 }}>
                        {passData.passId}
                      </Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ pt: 4, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <Grid size={6} sx={{ textAlign: 'left' }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 1 }}>
                          {t('visitor_purpose')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {passData.purpose}
                        </Typography>
                      </Grid>
                      <Grid size={6} sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 1 }}>
                          Expires In
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {passData.validity}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Stack direction="row" spacing={2}>
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        onClick={shareToWhatsApp}
                        startIcon={<Share2 size={14} />}
                        sx={{ 
                          py: 1.5, 
                          borderRadius: 4, 
                          fontWeight: 900, 
                          textTransform: 'uppercase', 
                          fontSize: '0.7rem',
                          color: 'white',
                          borderColor: 'rgba(255,255,255,0.1)',
                          bgcolor: 'rgba(255,255,255,0.05)',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }
                        }}
                      >
                        {t('visitor_share')}
                      </Button>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        onClick={downloadPass}
                        startIcon={<Download size={14} />}
                        sx={{ py: 1.5, borderRadius: 4, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem' }}
                      >
                        {t('visitor_download')}
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', maxWidth: 300 }}>
                   <Avatar sx={{ 
                     width: 96, height: 96, 
                     bgcolor: 'action.hover', 
                     color: 'text.disabled', 
                     mx: 'auto', mb: 3, 
                     borderRadius: 10,
                     border: '4px dashed',
                     borderColor: 'divider'
                   }}>
                     <ShieldCheck size={48} />
                   </Avatar>
                   <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 2, display: 'block' }}>
                     Awaiting Authorization
                   </Typography>
                   <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
                     Fill guest details to generate an encrypted digital entry key.
                   </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
};

export default VisitorPass;
