
import React, { useState } from 'react';
import { 
  Box, Typography, Button, IconButton, TextField, 
  Grid, Card, CardContent, Avatar, Chip, Stack, 
  Paper, Divider, Dialog, DialogTitle, DialogContent, 
  DialogActions, useTheme, Fade, Stepper, Step, 
  StepLabel, StepIconProps, styled
} from '@mui/material';
import { 
  LifeBuoy, Plus, Clock, CheckCircle2, AlertCircle, 
  Send, X, MessageSquare, Wrench, Shield, Zap, 
  Droplets, Construction, ChevronRight 
} from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

interface Ticket {
  id: string;
  title: string;
  desc: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  category: 'Plumbing' | 'Electrical' | 'Security' | 'General';
  date: string;
}

const Helpdesk: React.FC = () => {
  const theme = useTheme();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 'T-1002', title: 'Water Leakage in Bathroom', desc: 'Slight seepage on the side wall.', status: 'In Progress', priority: 'High', category: 'Plumbing', date: '2024-05-22' },
    { id: 'T-1001', title: 'Lift Fan Not Working', desc: 'Fan in Wing A-3 lift is very slow.', status: 'Resolved', priority: 'Medium', category: 'Electrical', date: '2024-05-18' }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    category: 'General' as any
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'success';
      case 'In Progress': return 'info';
      default: return 'warning';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'error.main';
      case 'Medium': return 'warning.main';
      default: return 'text.secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Plumbing': return Droplets;
      case 'Electrical': return Zap;
      case 'Security': return Shield;
      default: return MessageSquare;
    }
  };

  const handleRaiseTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: Ticket = {
      id: `T-${1000 + tickets.length + 1}`,
      title: formData.title,
      desc: formData.desc,
      status: 'Pending',
      priority: formData.priority,
      category: formData.category,
      date: new Date().toISOString()
    };
    setTickets([newTicket, ...tickets]);
    setShowModal(false);
    setFormData({ title: '', desc: '', priority: 'Medium', category: 'General' });
  };

  return (
    <Box sx={{ maxWidth: '1000px', mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Fade in timeout={800}>
        <Box>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            gap: 3,
            mb: 8,
            pb: 4,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, tracking: '-0.04em' }}>
                {t('helpdesk')}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
                Report issues and track resolution status
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              size="large"
              startIcon={<Plus size={18} strokeWidth={3} />}
              onClick={() => setShowModal(true)}
              sx={{ borderRadius: 6, px: 4, py: 1.5, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, boxShadow: 10 }}
            >
              {t('raise_complaint')}
            </Button>
          </Box>

          <Stack spacing={4} sx={{ pb: 10 }}>
            {tickets.map((ticket) => {
              const Icon = getCategoryIcon(ticket.category);
              return (
                <Card key={ticket.id} sx={{ 
                  borderRadius: 10, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': { boxShadow: 12, transform: 'translateY(-4px)' },
                  overflow: 'hidden'
                }}>
                  <CardContent sx={{ p: { xs: 4, md: 6 } }}>
                    <Grid container spacing={4}>
                      <Grid size={{ xs: 12, lg: 8 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3, mb: 3 }}>
                          <Avatar sx={{ width: 48, height: 48, borderRadius: 4, bgcolor: 'action.hover', color: 'text.secondary', transition: 'all 0.3s ease' }}>
                            <Icon size={24} />
                          </Avatar>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="h5" sx={{ fontWeight: 900, tracking: '-0.02em' }}>
                                {ticket.title}
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 1 }}>
                                #{ticket.id}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 900, color: getPriorityColor(ticket.priority), textTransform: 'uppercase', letterSpacing: 1 }}>
                                {ticket.priority} Priority
                              </Typography>
                              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'divider' }} />
                              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                                {ticket.category}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, mb: 4, lineHeight: 1.6 }}>
                          {ticket.desc}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 1 }}>
                            <Clock size={14} /> {new Date(ticket.date).toLocaleDateString()}
                          </Typography>
                          <Chip 
                            label={ticket.status} 
                            color={getStatusColor(ticket.status) as any}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', borderRadius: 4, borderWeight: 2 }}
                          />
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12, lg: 4 }}>
                        <Box sx={{ 
                          height: '100%', 
                          pl: { lg: 4 }, 
                          borderLeft: { lg: '1px solid' }, 
                          borderColor: 'divider',
                          pt: { xs: 4, lg: 0 },
                          borderTop: { xs: '1px solid', lg: 'none' }
                        }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 2, mb: 3, display: 'block' }}>
                            Resolution Progress
                          </Typography>
                          <Stepper orientation="vertical" activeStep={ticket.status === 'Resolved' ? 3 : (ticket.status === 'In Progress' ? 2 : 1)} sx={{ '& .MuiStepConnector-line': { minHeight: 20 } }}>
                            {[
                              { label: 'Reported', active: true },
                              { label: 'Assigned', active: ticket.status !== 'Pending' },
                              { label: 'Resolved', active: ticket.status === 'Resolved' }
                            ].map((step, index) => (
                              <Step key={index} active={step.active}>
                                <StepLabel 
                                  StepIconComponent={() => (
                                    <Box sx={{ 
                                      width: 24, height: 24, 
                                      borderRadius: '50%', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center',
                                      bgcolor: step.active ? 'primary.main' : 'action.hover',
                                      color: step.active ? 'white' : 'text.disabled',
                                      border: '2px solid',
                                      borderColor: step.active ? 'primary.main' : 'divider',
                                      fontSize: 12
                                    }}>
                                      {step.active ? <CheckCircle2 size={12} /> : <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'currentColor' }} />}
                                    </Box>
                                  )}
                                >
                                  <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: step.active ? 'text.primary' : 'text.disabled' }}>
                                    {step.label}
                                  </Typography>
                                </StepLabel>
                              </Step>
                            ))}
                          </Stepper>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Box>
      </Fade>

      <Dialog 
        open={showModal} 
        onClose={() => setShowModal(false)}
        PaperProps={{ sx: { borderRadius: 10, p: 2, maxWidth: 600, width: '100%' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, tracking: '-0.04em' }}>New Ticket</Typography>
          <IconButton onClick={() => setShowModal(false)}>
            <X size={28} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', ml: 2, mb: 1, display: 'block' }}>
                Issue Category
              </Typography>
              <Grid container spacing={2}>
                {['Plumbing', 'Electrical', 'Security', 'General'].map(cat => (
                  <Grid size={6} key={cat}>
                    <Button 
                      fullWidth 
                      variant={formData.category === cat ? 'contained' : 'outlined'}
                      onClick={() => setFormData({...formData, category: cat as any})}
                      sx={{ 
                        py: 2, 
                        borderRadius: 4, 
                        fontWeight: 900, 
                        textTransform: 'uppercase', 
                        fontSize: '0.7rem',
                        bgcolor: formData.category === cat ? 'primary.main' : 'transparent',
                        color: formData.category === cat ? 'white' : 'text.secondary',
                        borderColor: formData.category === cat ? 'primary.main' : 'divider'
                      }}
                    >
                      {cat}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', ml: 2, mb: 1, display: 'block' }}>
                Priority Level
              </Typography>
              <Stack direction="row" spacing={2}>
                {['Low', 'Medium', 'High'].map(p => (
                  <Button 
                    key={p} 
                    fullWidth
                    variant={formData.priority === p ? 'contained' : 'outlined'}
                    onClick={() => setFormData({...formData, priority: p as any})}
                    sx={{ 
                      py: 2, 
                      borderRadius: 4, 
                      fontWeight: 900, 
                      textTransform: 'uppercase', 
                      fontSize: '0.7rem',
                      bgcolor: formData.priority === p ? 'primary.main' : 'transparent',
                      color: formData.priority === p ? 'white' : 'text.secondary',
                      borderColor: formData.priority === p ? 'primary.main' : 'divider'
                    }}
                  >
                    {p}
                  </Button>
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', ml: 2, mb: 0.5, display: 'block' }}>
                Subject
              </Typography>
              <TextField 
                fullWidth
                placeholder="Briefly describe the issue..."
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                InputProps={{ sx: { borderRadius: 6, bgcolor: 'action.hover' } }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', ml: 2, mb: 0.5, display: 'block' }}>
                Detailed Description
              </Typography>
              <TextField 
                fullWidth
                multiline
                rows={4}
                placeholder="Provide more details for the technician..."
                value={formData.desc}
                onChange={e => setFormData({...formData, desc: e.target.value})}
                InputProps={{ sx: { borderRadius: 6, bgcolor: 'action.hover' } }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <Button 
            fullWidth 
            variant="contained" 
            size="large"
            onClick={handleRaiseTicket}
            startIcon={<Send size={18} />}
            sx={{ py: 2, borderRadius: 6, fontWeight: 900, boxShadow: 10 }}
          >
            Raise Support Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Helpdesk;
