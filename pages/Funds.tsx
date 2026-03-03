import React from 'react';
import { 
  Box, Typography, Grid, Card, Button, IconButton, 
  Avatar, Chip, CircularProgress, Paper, useTheme, 
  Fade, Stack, Divider, TextField, InputAdornment,
  LinearProgress, Tooltip
} from '@mui/material';
import { HandCoins, Target, TrendingUp, Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { FUNDS } from '../constants';
import { useLanguage } from '../components/LanguageContext';

const Funds: React.FC = () => {
  const { t } = useLanguage();
  const theme = useTheme();

  return (
    <Fade in={true}>
      <Box sx={{ pb: 8 }}>
        <Box sx={{ mb: 6, pb: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, tracking: '-0.04em' }}>
            {t('special_funds')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
            Tracking collections for festivals and society improvements
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {FUNDS.map((fund) => {
            const progress = (fund.totalCollected / fund.targetAmount) * 100;
            return (
              <Grid item xs={12} lg={6} key={fund.id}>
                <Card 
                  sx={{ 
                    p: 4, 
                    borderRadius: 10, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    boxShadow: 0,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Box sx={{ 
                    position: 'absolute', bottom: -48, right: -48, 
                    width: 192, height: 192, 
                    bgcolor: 'primary.light', borderRadius: '50%', 
                    opacity: 0.1, transition: 'transform 0.5s ease',
                    '.MuiCard-root:hover &': { transform: 'scale(1.1)' }
                  }} />
                  
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                      <Avatar sx={{ 
                        width: 64, height: 64, borderRadius: 4, 
                        bgcolor: 'primary.light', color: 'primary.main',
                        transition: 'all 0.3s ease',
                        '.MuiCard-root:hover &': { bgcolor: 'primary.main', color: 'white' }
                      }}>
                        <Sparkles size={32} />
                      </Avatar>
                      <Chip 
                        label={progress >= 100 ? 'Target Achieved' : 'In Progress'} 
                        color={progress >= 100 ? 'success' : 'primary'}
                        variant="outlined"
                        sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', borderRadius: 2 }} 
                      />
                    </Box>
                    
                    <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>{fund.purpose}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.disabled', mb: 4 }}>
                      <Calendar size={16} />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {t('fund_starts')} {new Date(fund.date).toLocaleDateString()}
                      </Typography>
                    </Stack>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, borderRadius: 4, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <TrendingUp size={10} /> {t('fund_collected')}
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 900 }}>₹{fund.totalCollected.toLocaleString()}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, borderRadius: 4, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <Target size={10} /> {t('fund_target')}
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 900 }}>₹{fund.targetAmount.toLocaleString()}</Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Box sx={{ mb: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(progress, 100)} 
                        sx={{ 
                          height: 12, borderRadius: 6, 
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: progress >= 100 ? 'success.main' : 'primary.main',
                            borderRadius: 6
                          }
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled' }}>
                        {Math.round(progress)}% of goal reached
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.primary' }}>
                        ₹{(fund.targetAmount - fund.totalCollected) > 0 ? (fund.targetAmount - fund.totalCollected).toLocaleString() + ' left' : 'Goal met!'}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}

          {/* Contribution Info Card */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ 
              p: 5, borderRadius: 10, 
              bgcolor: 'text.primary', color: 'background.paper',
              height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
              boxShadow: 10
            }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', color: 'white', borderRadius: 4, mb: 4 }}>
                <HandCoins size={32} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>{t('fund_how')}</Typography>
              <Typography variant="body1" sx={{ color: 'text.disabled', lineHeight: 1.6, mb: 4 }}>
                Contributions can be made via UPI, Bank Transfer, or Cash at the society office. All festival funds are used exclusively for celebrations and resident activities.
              </Typography>
              <Stack spacing={3}>
                <Paper sx={{ p: 2, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'success.light', color: 'success.main', borderRadius: 3 }}>
                    <AlertCircle size={20} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Transparent Tracking</Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>Every rupee is accounted for</Typography>
                  </Box>
                </Paper>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="inherit"
                  sx={{ 
                    borderRadius: 4, py: 2, 
                    fontWeight: 900, textTransform: 'uppercase', 
                    bgcolor: 'background.paper', color: 'text.primary',
                    '&:hover': { bgcolor: 'primary.light', color: 'primary.main' }
                  }}
                >
                  {t('fund_contribute')}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default Funds;
