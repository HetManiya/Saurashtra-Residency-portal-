import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, Button, IconButton, 
  Avatar, Chip, CircularProgress, Paper, useTheme, 
  Fade, Stack, Divider, TextField, InputAdornment,
  List, ListItem, ListItemAvatar, ListItemText
} from '@mui/material';
import { History, Clock, Search, Database, FileText, Settings, Key, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { AuditLogEntry } from '../types';
import { useLanguage } from '../components/LanguageContext';

const AuditLogs: React.FC = () => {
  const { t } = useLanguage();
  const theme = useTheme();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (retries = 0) => {
    if (retries === 0) setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
      setLoading(false);
    } catch (e: any) {
      if (e.message === 'SERVER_STARTING' && retries < 5) {
        setTimeout(() => fetchLogs(retries + 1), 2000);
        return;
      }
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'ALL' || log.action?.toUpperCase() === filterAction.toUpperCase();
    return matchesSearch && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'login': return <Key size={18} />;
      case 'create': return <Database size={18} />;
      case 'update': return <Settings size={18} />;
      case 'delete': return <FileText size={18} />;
      default: return <History size={18} />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'login': return 'success';
      case 'create': return 'info';
      case 'update': return 'warning';
      case 'delete': return 'error';
      default: return 'default';
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
            <Typography variant="h4" sx={{ fontWeight: 900, tracking: '-0.04em' }}>
              {t('saurashtra')} <Box component="span" sx={{ color: 'primary.main' }}>{t('audit')}</Box>
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
              {t('audit_desc')}
            </Typography>
          </Box>
          <Box sx={{ width: { xs: '100%', md: 320 } }}>
            <TextField 
              fullWidth
              placeholder={t('audit_search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 4, bgcolor: 'background.paper' }
              }}
            />
          </Box>
        </Box>

        <Paper sx={{ borderRadius: 8, overflow: 'hidden', border: '1px solid', borderColor: 'divider', boxShadow: 0 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover', display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {['ALL', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT'].map(a => (
              <Button 
                key={a}
                onClick={() => setFilterAction(a)}
                variant={filterAction === a ? 'contained' : 'text'}
                sx={{ 
                  borderRadius: 3, 
                  px: 3, 
                  py: 0.75, 
                  fontWeight: 900, 
                  textTransform: 'uppercase', 
                  fontSize: '0.65rem',
                  bgcolor: filterAction === a ? 'primary.main' : 'transparent',
                  color: filterAction === a ? 'white' : 'text.secondary',
                  '&:hover': { bgcolor: filterAction === a ? 'primary.dark' : 'action.selected' }
                }}
              >
                {a}
              </Button>
            ))}
          </Box>

          {loading ? (
            <Box sx={{ py: 20, textAlign: 'center' }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 2 }}>
                Retrieving Cloud Logs...
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {filteredLogs.map((log, index) => (
                <React.Fragment key={log.id}>
                  <ListItem 
                    sx={{ 
                      p: 4, 
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemAvatar sx={{ mr: 2 }}>
                      <Avatar sx={{ 
                        width: 48, height: 48, 
                        borderRadius: 4, 
                        bgcolor: 'action.hover', 
                        color: 'text.secondary',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}>
                        {getActionIcon(log.action)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{log.userName}</Typography>
                          <Chip 
                            label={log.action} 
                            size="small" 
                            color={getActionColor(log.action) as any}
                            sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', borderRadius: 1.5, height: 20 }} 
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.6 }}>
                          {log.details}
                        </Typography>
                      }
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.disabled', ml: 2 }}>
                      <Clock size={14} />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </ListItem>
                  {index < filteredLogs.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {filteredLogs.length === 0 && (
                <Box sx={{ py: 10, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase' }}>
                    No records found
                  </Typography>
                </Box>
              )}
            </List>
          )}
        </Paper>
      </Box>
    </Fade>
  );
};

export default AuditLogs;
