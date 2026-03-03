import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, Button, IconButton, 
  Avatar, Chip, CircularProgress, Paper, useTheme, 
  Fade, Stack, Divider, TextField, InputAdornment,
  Tabs, Tab, useMediaQuery
} from '@mui/material';
import { 
  Siren, 
  Flame, 
  Stethoscope, 
  PhoneCall, 
  Zap, 
  Droplets, 
  ShieldAlert, 
  ArrowUpCircle, 
  Phone, 
  MessageSquare,
  AlertTriangle,
  HeartPulse,
  Wrench,
  Construction,
  Search,
  User,
  Building2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

interface Contact {
  name: string;
  number: string;
  icon: React.ElementType;
  color: string;
  desc?: string;
  critical?: boolean;
}

interface Resident {
  id: string;
  name: string;
  unit: string;
  phone: string;
  role: string;
}

const Emergency: React.FC = () => {
  const { t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const emergencySections = [
    {
      title: "Public Safety",
      contacts: [
        { name: "Police Emergency", number: "100", icon: Siren, color: "info.main", critical: true, desc: "Pasodara Police Station Dispatch" },
        { name: "Fire Department", number: "101", icon: Flame, color: "error.main", critical: true, desc: "Kamrej Fire Brigade Services" },
        { name: "Child Helpline", number: "1098", icon: HeartPulse, color: "success.main", desc: "National Child Protection Services" },
      ]
    },
    {
      title: "Medical & Hospitals",
      contacts: [
        { name: "Ambulance", number: "108", icon: PhoneCall, color: "error.light", critical: true, desc: "24/7 Medical Emergency Response" },
        { name: "Suncity Hospital", number: "+91 261 270 8000", icon: Stethoscope, color: "primary.main", desc: "Nearest Multi-speciality Hospital" },
        { name: "Lifeline Clinic", number: "+91 99044 12345", icon: Stethoscope, color: "primary.light", desc: "Primary Care near Residency" },
      ]
    },
    {
      title: "Society Support",
      contacts: [
        { name: "Main Security (Gate 1)", number: "0261-4040-1", icon: ShieldAlert, color: "text.primary", desc: "Visitor entry & Security Head" },
        { name: "Security (Gate 2)", number: "0261-4040-2", icon: ShieldAlert, color: "text.primary", desc: "Canal road gate monitoring" },
        { name: "Society Manager", number: "+91 98765 43210", icon: Phone, color: "primary.main", desc: "Admin & Office complaints" },
      ]
    }
  ];

  const residents: Resident[] = [
    { id: '1', name: 'Rajesh Patel', unit: 'A-101', phone: '+91 98765 43210', role: 'Chairman' },
    { id: '2', name: 'Amit Shah', unit: 'A-102', phone: '+91 98765 43211', role: 'Secretary' },
    { id: '3', name: 'Suresh Mehta', unit: 'B-201', phone: '+91 98765 43212', role: 'Resident' },
    { id: '4', name: 'Vijay Kumar', unit: 'C-305', phone: '+91 98765 43213', role: 'Resident' },
    { id: '5', name: 'Deepak Jha', unit: 'D-402', phone: '+91 98765 43214', role: 'Resident' },
  ];

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSOS = () => {
    if (confirm("Trigger SOS Alert? This will notify security and emergency contacts immediately.")) {
      alert("SOS Alert Sent! Security is on the way.");
    }
  };

  return (
    <Fade in={true}>
      <Box sx={{ pb: 8 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { md: 'flex-end' }, 
          gap: 3, 
          mb: 6,
          pb: 4,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Chip 
                icon={<ShieldAlert size={14} className="animate-pulse" />}
                label="Immediate Response Only" 
                size="small" 
                color="error" 
                variant="outlined"
                sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', borderRadius: 2 }} 
              />
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 900, tracking: '-0.04em' }}>
              Digital Intercom
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
              Quick access to emergency services and resident directory
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="error"
            size="large"
            startIcon={<AlertTriangle size={20} fill="currentColor" />}
            onClick={handleSOS}
            sx={{ 
              borderRadius: 8, px: 5, py: 2, 
              fontWeight: 900, textTransform: 'uppercase', 
              boxShadow: 10,
              '&:active': { transform: 'scale(0.95)' }
            }}
          >
            Trigger SOS
          </Button>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, val) => setActiveTab(val)}
            sx={{ 
              bgcolor: 'action.hover', 
              borderRadius: 8, 
              p: 0.5,
              minHeight: 'auto',
              width: 'fit-content',
              '& .MuiTabs-indicator': { display: 'none' }
            }}
          >
            <Tab 
              label="Emergency" 
              sx={{ 
                borderRadius: 6, px: 4, py: 1.5, 
                fontWeight: 900, fontSize: '0.65rem', 
                textTransform: 'uppercase', letterSpacing: 1,
                minHeight: 'auto',
                color: 'text.secondary',
                '&.Mui-selected': { bgcolor: 'background.paper', color: 'primary.main', boxShadow: 2 }
              }} 
            />
            <Tab 
              label="Resident Directory" 
              sx={{ 
                borderRadius: 6, px: 4, py: 1.5, 
                fontWeight: 900, fontSize: '0.65rem', 
                textTransform: 'uppercase', letterSpacing: 1,
                minHeight: 'auto',
                color: 'text.secondary',
                '&.Mui-selected': { bgcolor: 'background.paper', color: 'primary.main', boxShadow: 2 }
              }} 
            />
          </Tabs>
        </Box>

        {activeTab === 0 ? (
          <Grid container spacing={6}>
            {emergencySections.map((section, sIdx) => (
              <Grid item xs={12} md={6} key={sIdx}>
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 6, height: 24, bgcolor: 'primary.main', borderRadius: 3 }} />
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>{section.title}</Typography>
                </Box>
                
                <Stack spacing={3}>
                  {section.contacts.map((contact, cIdx) => (
                    <Card 
                      key={cIdx} 
                      sx={{ 
                        p: 3, 
                        borderRadius: 8, 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        boxShadow: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.3s ease',
                        borderLeft: contact.critical ? '4px solid' : '1px solid',
                        borderLeftColor: contact.critical ? 'error.main' : 'divider',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar sx={{ 
                          width: 56, height: 56, borderRadius: 4, 
                          bgcolor: 'action.hover', color: contact.color,
                          transition: 'all 0.3s ease',
                          '.MuiCard-root:hover &': { transform: 'scale(1.1)' }
                        }}>
                          <contact.icon size={24} />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.2 }}>{contact.name}</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 1 }}>
                            {contact.desc}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Button 
                        component="a"
                        href={`tel:${contact.number.replace(/\s+/g, '')}`}
                        variant="contained"
                        color={contact.critical ? 'error' : 'primary'}
                        startIcon={<Phone size={14} fill="currentColor" />}
                        sx={{ 
                          borderRadius: 4, px: 3, py: 1, 
                          fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem',
                          boxShadow: 4
                        }}
                      >
                        {contact.number}
                      </Button>
                    </Card>
                  ))}
                </Stack>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box>
            <Box sx={{ maxWidth: 600, mb: 6 }}>
              <TextField 
                fullWidth
                placeholder="Search by name or unit number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 8, bgcolor: 'background.paper', p: 1 }
                }}
              />
            </Box>

            <Grid container spacing={4}>
              {filteredResidents.map(resident => (
                <Grid item xs={12} sm={6} lg={4} key={resident.id}>
                  <Card 
                    sx={{ 
                      p: 4, 
                      borderRadius: 10, 
                      border: '1px solid', 
                      borderColor: 'divider', 
                      boxShadow: 0,
                      transition: 'all 0.3s ease',
                      '&:hover': { borderColor: 'primary.main', boxShadow: 6 }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                      <Avatar sx={{ 
                        width: 56, height: 56, borderRadius: 4, 
                        bgcolor: 'action.hover', color: 'text.disabled',
                        transition: 'all 0.3s ease',
                        '.MuiCard-root:hover &': { bgcolor: 'primary.main', color: 'white' }
                      }}>
                        <User size={28} />
                      </Avatar>
                      <Chip 
                        label={resident.unit} 
                        size="small" 
                        color="primary" 
                        sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', borderRadius: 2 }} 
                      />
                    </Box>
                    
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>{resident.name}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 1 }}>
                        {resident.role}
                      </Typography>
                    </Box>

                    <Button 
                      fullWidth 
                      variant="text" 
                      component="a"
                      href={`tel:${resident.phone}`}
                      startIcon={<Phone size={14} />}
                      sx={{ 
                        borderRadius: 4, py: 1.5, 
                        fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem',
                        bgcolor: 'action.hover', color: 'text.secondary',
                        '&:hover': { bgcolor: 'primary.main', color: 'white' }
                      }}
                    >
                      Call Resident
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Fade>
  );
};

export default Emergency;
