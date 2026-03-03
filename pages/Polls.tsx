import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, Button, IconButton, 
  Avatar, Chip, CircularProgress, Paper, useTheme, 
  Fade, Stack, Divider, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress, Tooltip, AvatarGroup
} from '@mui/material';
import { PieChart, Plus, CheckCircle2, Clock, X, Send, BarChart3, Users, Lock } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  status: 'Active' | 'Closed';
  endDate: string;
  userVoted?: string; // ID of the option user voted for
}

const Polls: React.FC = () => {
  const { t } = useLanguage();
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: 'P-101',
      question: 'Should we install solar panels on Wing A & B terrace?',
      options: [
        { id: '1', text: 'Yes, absolutely', votes: 45 },
        { id: '2', text: 'No, too expensive', votes: 12 },
        { id: '3', text: 'Need more info', votes: 8 }
      ],
      totalVotes: 65,
      status: 'Active',
      endDate: '2024-06-15'
    },
    {
      id: 'P-100',
      question: 'Preferred date for Annual Cultural Fest?',
      options: [
        { id: '1', text: 'Dec 24-25', votes: 88 },
        { id: '2', text: 'Dec 30-31', votes: 42 }
      ],
      totalVotes: 130,
      status: 'Closed',
      endDate: '2024-05-10'
    }
  ]);

  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', '']
  });

  const handleVote = (pollId: string, optionId: string) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId && poll.status === 'Active' && !poll.userVoted) {
        const updatedOptions = poll.options.map(opt => 
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );
        return {
          ...poll,
          options: updatedOptions,
          totalVotes: poll.totalVotes + 1,
          userVoted: optionId
        };
      }
      return poll;
    }));
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    const poll: Poll = {
      id: `P-${100 + polls.length + 1}`,
      question: newPoll.question,
      options: newPoll.options.filter(o => o.trim()).map((o, i) => ({ id: String(i + 1), text: o, votes: 0 })),
      totalVotes: 0,
      status: 'Active',
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    setPolls([poll, ...polls]);
    setShowModal(false);
    setNewPoll({ question: '', options: ['', ''] });
  };

  return (
    <Fade in={true}>
      <Box sx={{ maxWidth: 900, mx: 'auto', pb: 8 }}>
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
            <Typography variant="h3" sx={{ fontWeight: 900, tracking: '-0.04em' }}>
              Community <Box component="span" sx={{ color: 'primary.main' }}>Polls</Box>
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
              Your voice matters. Vote on society decisions.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Plus size={18} strokeWidth={3} />}
            onClick={() => setShowModal(true)}
            sx={{ 
              borderRadius: 6, px: 4, py: 1.5, 
              fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem',
              boxShadow: 10,
              '&:active': { transform: 'scale(0.95)' }
            }}
          >
            Create Poll
          </Button>
        </Box>

        <Stack spacing={6}>
          {polls.map((poll) => (
            <Card 
              key={poll.id} 
              sx={{ 
                p: { xs: 4, md: 6 }, 
                borderRadius: 12, 
                border: '1px solid', 
                borderColor: 'divider', 
                boxShadow: 0,
                position: 'relative',
                overflow: 'hidden',
                opacity: poll.status === 'Closed' ? 0.7 : 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 10
                }
              }}
            >
              {poll.status === 'Closed' && (
                <Box sx={{ 
                  position: 'absolute', top: 24, right: 24, 
                  display: 'flex', alignItems: 'center', gap: 1, 
                  px: 2, py: 0.5, bgcolor: 'action.hover', borderRadius: 10,
                  border: '1px solid', borderColor: 'divider'
                }}>
                  <Lock size={12} color={theme.palette.text.disabled} />
                  <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.disabled', fontSize: '0.6rem' }}>Closed</Typography>
                </Box>
              )}
              
              <Box sx={{ mb: 6 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ width: 40, height: 40, borderRadius: 3, bgcolor: 'primary.light', color: 'primary.main' }}>
                    <PieChart size={20} />
                  </Avatar>
                  <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.disabled', letterSpacing: 1 }}>
                    #{poll.id} • {poll.totalVotes} Votes
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 900, tracking: '-0.02em', lineHeight: 1.2 }}>
                  {poll.question}
                </Typography>
              </Box>

              <Stack spacing={3}>
                {poll.options.map((option) => {
                  const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                  const isSelected = poll.userVoted === option.id;
                  
                  return (
                    <Button
                      key={option.id}
                      disabled={poll.status === 'Closed' || !!poll.userVoted}
                      onClick={() => handleVote(poll.id, option.id)}
                      sx={{
                        width: '100%',
                        p: 0,
                        borderRadius: 4,
                        border: '2px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'primary.light' : 'transparent',
                        overflow: 'hidden',
                        display: 'block',
                        textAlign: 'left',
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: isSelected ? 'primary.light' : 'action.hover'
                        }
                      }}
                    >
                      <Box sx={{ position: 'relative', p: 3 }}>
                        <Box sx={{ 
                          position: 'absolute', left: 0, top: 0, bottom: 0, 
                          width: `${percentage}%`, bgcolor: isSelected ? 'primary.main' : 'action.hover', 
                          opacity: isSelected ? 0.1 : 0.5, transition: 'width 1s ease' 
                        }} />
                        
                        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ 
                              width: 24, height: 24, border: '2px solid', 
                              borderColor: isSelected ? 'primary.main' : 'divider',
                              bgcolor: isSelected ? 'primary.main' : 'transparent',
                              color: 'white'
                            }}>
                              {isSelected && <CheckCircle2 size={14} />}
                            </Avatar>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: isSelected ? 'primary.main' : 'text.primary' }}>
                              {option.text}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled' }}>{option.votes}</Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{percentage}%</Typography>
                          </Stack>
                        </Box>
                      </Box>
                    </Button>
                  );
                })}
              </Stack>

              <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.disabled' }}>
                    <Clock size={14} />
                    <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase' }}>
                      Ends {new Date(poll.endDate).toLocaleDateString()}
                    </Typography>
                 </Stack>
                 <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.6rem', fontWeight: 900, border: '2px solid', borderColor: 'background.paper' } }}>
                    {[1,2,3,4,5].map(i => (
                      <Avatar key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + poll.id}`} />
                    ))}
                 </AvatarGroup>
              </Box>
            </Card>
          ))}
        </Stack>

        {/* Create Poll Modal */}
        <Dialog 
          open={showModal} 
          onClose={() => setShowModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 10, p: 0, overflow: 'hidden' } }}
        >
          <DialogTitle sx={{ p: 4, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, tracking: '-0.04em' }}>New Poll</Typography>
            <IconButton onClick={() => setShowModal(false)}>
              <X size={28} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Stack spacing={4} component="form" onSubmit={handleCreatePoll} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Question</Typography>
                <TextField 
                  fullWidth 
                  multiline
                  rows={3}
                  placeholder="What would you like to ask the community?" 
                  required
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({...newPoll, question: e.target.value})}
                  InputProps={{ sx: { borderRadius: 8, bgcolor: 'action.hover' } }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Options</Typography>
                <Stack spacing={2}>
                  {newPoll.options.map((opt, i) => (
                    <Box key={i} sx={{ position: 'relative' }}>
                      <TextField 
                        fullWidth 
                        placeholder={`Option ${i + 1}`} 
                        required
                        value={opt}
                        onChange={(e) => {
                          const updated = [...newPoll.options];
                          updated[i] = e.target.value;
                          setNewPoll({...newPoll, options: updated});
                        }}
                        InputProps={{ sx: { borderRadius: 8, bgcolor: 'action.hover' } }}
                      />
                      {newPoll.options.length > 2 && (
                        <IconButton 
                          onClick={() => setNewPoll({...newPoll, options: newPoll.options.filter((_, idx) => idx !== i)})}
                          sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                        >
                          <X size={16} />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    onClick={() => setNewPoll({...newPoll, options: [...newPoll.options, '']})}
                    sx={{ 
                      borderRadius: 8, py: 2, 
                      borderStyle: 'dashed',
                      fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem',
                      color: 'text.disabled',
                      '&:hover': { borderColor: 'primary.main', color: 'primary.main' }
                    }}
                  >
                    + Add Option
                  </Button>
                </Stack>
              </Box>

              <Button 
                fullWidth 
                variant="contained" 
                size="large"
                type="submit"
                startIcon={<Send size={18} />}
                sx={{ 
                  borderRadius: 10, py: 2, 
                  fontWeight: 900, textTransform: 'uppercase', 
                  letterSpacing: 1.5,
                  boxShadow: 10,
                  '&:active': { transform: 'scale(0.95)' }
                }}
              >
                Launch Community Poll
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default Polls;
