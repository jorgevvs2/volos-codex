import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Container, Grid, Card, CardContent, CardMedia, 
  CardActionArea, IconButton, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Fab, Tooltip, Chip, Stack, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import { ApiService, Campaign, RpgSystem } from '../../Services/api';

// Placeholder image for campaigns
const CAMPAIGN_IMAGE = "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";

const systemLabels: Record<number, string> = {
  [RpgSystem.DnD2024]: 'D&D 2024',
  [RpgSystem.DnD5]: 'D&D 5e',
  [RpgSystem.Daggerheart]: 'Daggerheart',
  [RpgSystem.ReinosDeFerro]: 'Iron Kingdoms',
};

const CampaignTrackPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const guildId = user?.email || 'default-guild';

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Create/Edit Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState<Partial<Campaign>>({ name: '', system: RpgSystem.DnD5 });
  const [playersInput, setPlayersInput] = useState<string>(''); // Comma separated for now
  const [gmEmailInput, setGmEmailInput] = useState<string>('');

  useEffect(() => {
    if (token) {
      fetchCampaigns();
    }
  }, [token, guildId]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getCampaigns(guildId, token || undefined);
      setCampaigns(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setIsEditing(false);
    setCurrentCampaign({ name: '', system: RpgSystem.DnD5 });
    setPlayersInput('');
    setGmEmailInput(user?.email || '');
    setOpenDialog(true);
  };

  const handleEditClick = (e: React.MouseEvent, campaign: Campaign) => {
    e.stopPropagation();
    setIsEditing(true);
    setCurrentCampaign(campaign);
    // Fetch players for this campaign to populate input
    fetchPlayers(campaign.id);
    setOpenDialog(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent, campaignId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      try {
        await ApiService.deleteCampaign(campaignId, token || undefined);
        fetchCampaigns(); // Refresh
      } catch (err) {
        console.error(err);
        alert("Failed to delete campaign.");
      }
    }
  };

  const fetchPlayers = async (campaignId: string) => {
    try {
      const players = await ApiService.getPlayers(campaignId, token || undefined);
      setPlayersInput(players.map(p => p.characterName).join(', '));
    } catch (err) {
      console.error("Failed to fetch players", err);
      setPlayersInput('');
    }
  };

  const handleSave = async () => {
    try {
      const players = playersInput.split(',').map(s => s.trim()).filter(s => s);

      if (isEditing && currentCampaign.id) {
        // Edit Mode: Add new players
        for (const player of players) {
          try {
            await ApiService.addPlayer(currentCampaign.id, player, token || undefined);
          } catch (e) {
            console.log(`Skipping player ${player} (likely exists)`);
          }
        }
      } else {
        // Create Mode
        const newCamp = await ApiService.createCampaign(
          guildId, 
          currentCampaign.name || 'New Campaign', 
          currentCampaign.system ?? RpgSystem.DnD5, 
          gmEmailInput || undefined,
          token || undefined
        );
        
        // Add Players
        for (const player of players) {
          try {
            await ApiService.addPlayer(newCamp.id, player, token || undefined);
          } catch (e) {
             console.error(`Failed to add player ${player}`, e);
          }
        }
        
        setCampaigns([...campaigns, newCamp]);
      }
      setOpenDialog(false);
      fetchCampaigns(); // Refresh
    } catch (err) {
      console.error(err);
      alert("Failed to save campaign.");
    }
  };

  const handleCardClick = (campaignId: string) => {
    navigate(`/logs/${campaignId}`);
  };

  const isGameMaster = (campaign: Campaign) => {
    if (!user) return false;
    // Check strictly against email
    return campaign.gameMasterId === user.email;
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Please log in to manage your campaigns.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
          Campaign Track
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleCreateClick}
          size="large"
        >
          New Campaign
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {campaigns.map((campaign) => (
            <Grid item xs={12} sm={6} md={4} key={campaign.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardActionArea onClick={() => handleCardClick(campaign.id)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={CAMPAIGN_IMAGE}
                    alt={campaign.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {campaign.name}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={systemLabels[campaign.system] || 'Unknown System'} 
                        size="small" 
                        variant="outlined" 
                      /> 
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      GM: {campaign.gameMasterId}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                
                {isGameMaster(campaign) && (
                  <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.8)', borderRadius: '50%' }}>
                      <IconButton size="small" onClick={(e) => handleEditClick(e, campaign)}>
                        <EditIcon color="primary" />
                      </IconButton>
                    </Box>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.8)', borderRadius: '50%' }}>
                      <IconButton size="small" onClick={(e) => handleDeleteClick(e, campaign.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
          
          {campaigns.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No campaigns found.
                </Typography>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={handleCreateClick}>
                  Create your first campaign
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Campaign' : 'New Campaign'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Campaign Name"
            fullWidth
            variant="outlined"
            value={currentCampaign.name}
            onChange={(e) => setCurrentCampaign({ ...currentCampaign, name: e.target.value })}
            sx={{ mb: 2 }}
            disabled={isEditing}
            helperText={isEditing ? "Campaign name cannot be changed yet." : ""}
          />
          
          {!isEditing && (
            <>
              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel>RPG System</InputLabel>
                <Select
                  value={currentCampaign.system ?? RpgSystem.DnD5}
                  label="RPG System"
                  onChange={(e) => setCurrentCampaign({ ...currentCampaign, system: Number(e.target.value) })}
                >
                  {Object.entries(systemLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                margin="dense"
                label="Game Master Email"
                fullWidth
                variant="outlined"
                value={gmEmailInput}
                onChange={(e) => setGmEmailInput(e.target.value)}
                helperText="The email of the user who will manage this campaign."
                sx={{ mb: 2 }}
              />
            </>
          )}

          <TextField
            margin="dense"
            label="Players / Characters (comma separated)"
            fullWidth
            variant="outlined"
            value={playersInput}
            onChange={(e) => setPlayersInput(e.target.value)}
            helperText="Add new characters separated by commas. Existing characters are preserved."
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CampaignTrackPage;
