import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Container, CircularProgress, Paper, Grid, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, IconButton, Tooltip, Fab, Alert, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import { ApiService, SessionSummary, LogEntry, MvpData, CampaignPlayer, Campaign } from '../../Services/api';

const CampaignDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams<{ campaignId: string }>();
  const { user, token } = useAuth();
  
  // --- State ---
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [summaries, setSummaries] = useState<SessionSummary[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [mvps, setMvps] = useState<MvpData[]>([]);
  const [players, setPlayers] = useState<CampaignPlayer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog States
  const [openSessionDialog, setOpenSessionDialog] = useState(false);
  const [openLogDialog, setOpenLogDialog] = useState(false);
  const [openLogsViewDialog, setOpenLogsViewDialog] = useState(false);

  // Form States
  const [sessionForm, setSessionForm] = useState<SessionSummary>({ sessionNumber: 0, title: '', description: '' });
  const [logForm, setLogForm] = useState<Omit<LogEntry, 'id'>>({ sessionNumber: 1, characterName: '', action: 'causado', amount: 0 });
  const [isEditingSession, setIsEditingSession] = useState(false);

  // --- Effects ---
  useEffect(() => {
    if (campaignId && token) {
      fetchCampaignData(campaignId);
    }
  }, [campaignId, token]);

  // --- API Calls ---
  const fetchCampaignData = async (id: string) => {
    setLoading(true);
    try {
      const [campData, summariesData, mvpsData, logsData, playersData] = await Promise.all([
        ApiService.getCampaign(id, token || undefined),
        ApiService.getSessionSummaries(id, token || undefined),
        ApiService.getMvps(id, token || undefined),
        ApiService.getAllLogs(id, token || undefined),
        ApiService.getPlayers(id, token || undefined)
      ]);
      setCampaign(campData);
      setSummaries(summariesData);
      setMvps(mvpsData);
      setLogs(logsData);
      setPlayers(playersData);
    } catch (err) {
      console.error(err);
      setError("Failed to load campaign data.");
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers ---
  const isGameMaster = () => {
    if (!user || !campaign) return false;
    return campaign.gameMasterId === user.email || campaign.gameMasterId === user.id || !campaign.gameMasterId;
  };

  // --- Handlers ---

  const handleSaveSession = async () => {
    if (!campaignId) return;
    try {
      await ApiService.createOrUpdateSession(
        campaignId, 
        sessionForm.sessionNumber, 
        sessionForm.title, 
        sessionForm.description, 
        token || undefined
      );
      // Refresh data
      fetchCampaignData(campaignId);
      setOpenSessionDialog(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save session");
    }
  };

  const handleAddLog = async () => {
    if (!campaignId) return;
    try {
      await ApiService.addLog(
        campaignId,
        logForm.sessionNumber,
        logForm.characterName,
        logForm.action,
        logForm.amount,
        token || undefined
      );
      // Refresh data
      fetchCampaignData(campaignId);
      setOpenLogDialog(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add log");
    }
  };

  const handleEditSessionClick = (e: React.MouseEvent, session: SessionSummary) => {
    e.stopPropagation(); 
    setSessionForm(session);
    setIsEditingSession(true);
    setOpenSessionDialog(true);
  };

  const handleDeleteSessionClick = async (e: React.MouseEvent, sessionNumber: number) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete Session ${sessionNumber}? This will delete all logs for this session.`)) {
      if (!campaignId) return;
      try {
        await ApiService.deleteSession(campaignId, sessionNumber, token || undefined);
        fetchCampaignData(campaignId);
      } catch (err) {
        console.error(err);
        alert("Failed to delete session.");
      }
    }
  };

  const handleNewSessionClick = () => {
    const nextSessionNum = summaries.length > 0 ? Math.max(...summaries.map(s => s.sessionNumber)) + 1 : 1;
    setSessionForm({ sessionNumber: nextSessionNum, title: '', description: '' });
    setIsEditingSession(false);
    setOpenSessionDialog(true);
  };

  const handleSessionClick = (sessionNumber: number) => {
    navigate(`/logs/${campaignId}/sessions/${sessionNumber}`);
  };

  // --- Render Helpers ---
  const actionToTitleMap: Record<string, string> = {
    "causado": "⚔️ Damage Dealt",
    "recebido": "🛡️ Damage Taken",
    "cura": "❤️ Healing",
    "eliminacao": "🎯 Kills",
    "jogador_caido": "💀 Times Downed",
    "critico_sucesso": "✨ Nat 20s",
    "critico_falha": "💥 Nat 1s",
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Please log in to view campaign details.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, height: '100%', overflowY: 'auto' }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/logs')}
        sx={{ mb: 2 }}
      >
        Back to Campaigns
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1">
          {campaign?.name || 'Campaign Details'}
        </Typography>
        <Button variant="outlined" onClick={() => setOpenLogsViewDialog(true)}>
          View All Logs
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {/* Hall of Fame / MVPs */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">Hall of Fame</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={() => setOpenLogDialog(true)}>
                  Add Log
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {mvps.length > 0 ? mvps.map((mvp) => (
                  <Box key={mvp.action} sx={{ p: 1, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="primary.main" fontWeight="bold">
                      {actionToTitleMap[mvp.action] || mvp.action}
                    </Typography>
                    <Typography variant="body1">
                      {mvp.players.join(', ')} <Typography component="span" color="text.secondary" variant="body2">({mvp.amount})</Typography>
                    </Typography>
                  </Box>
                )) : (
                  <Typography color="text.secondary" align="center">
                    No logs recorded yet.
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Session Summaries */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4">Chronicles</Typography>
              {isGameMaster() && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleNewSessionClick}>
                  New Session
                </Button>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {summaries.length > 0 ? summaries.map((session) => (
                <Paper 
                  key={session.sessionNumber} 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    position: 'relative', 
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => handleSessionClick(session.sessionNumber)}
                >
                  {isGameMaster() && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={(e) => handleEditSessionClick(e, session)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={(e) => handleDeleteSessionClick(e, session.sessionNumber)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                  <Typography variant="h6" color="primary">
                    Session {session.sessionNumber}: {session.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {session.description}
                  </Typography>
                </Paper>
              )) : (
                <Typography color="text.secondary">No sessions recorded for this campaign.</Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      )}

      {/* --- Dialogs --- */}

      {/* Session Dialog */}
      <Dialog open={openSessionDialog} onClose={() => setOpenSessionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditingSession ? 'Edit Session' : 'New Session'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Session Number"
            type="number"
            fullWidth
            value={sessionForm.sessionNumber}
            onChange={(e) => setSessionForm({ ...sessionForm, sessionNumber: parseInt(e.target.value) || 0 })}
            disabled={isEditingSession} // Usually don't change ID on edit
          />
          <TextField
            margin="dense"
            label="Title"
            fullWidth
            value={sessionForm.title}
            onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={sessionForm.description}
            onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSessionDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSession} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Add Log Dialog */}
      <Dialog open={openLogDialog} onClose={() => setOpenLogDialog(false)}>
        <DialogTitle>Add Session Log</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Session Number"
            type="number"
            fullWidth
            value={logForm.sessionNumber}
            onChange={(e) => setLogForm({ ...logForm, sessionNumber: parseInt(e.target.value) || 0 })}
          />
          <TextField
            select
            margin="dense"
            label="Character Name"
            fullWidth
            value={logForm.characterName}
            onChange={(e) => setLogForm({ ...logForm, characterName: e.target.value })}
            SelectProps={{
              native: true,
            }}
          >
            {players.map((player) => (
              <option key={player.id} value={player.characterName}>
                {player.characterName}
              </option>
            ))}
          </TextField>
          <TextField
            select
            margin="dense"
            label="Action"
            fullWidth
            value={logForm.action}
            onChange={(e) => setLogForm({ ...logForm, action: e.target.value })}
            SelectProps={{
              native: true,
            }}
          >
            {Object.entries(actionToTitleMap).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={logForm.amount}
            onChange={(e) => setLogForm({ ...logForm, amount: parseInt(e.target.value) || 0 })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogDialog(false)}>Cancel</Button>
          <Button onClick={handleAddLog} variant="contained">Add Log</Button>
        </DialogActions>
      </Dialog>

      {/* View All Logs Dialog */}
      <Dialog open={openLogsViewDialog} onClose={() => setOpenLogsViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>All Logs</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
            {logs.length === 0 ? (
              <Typography>No logs found.</Typography>
            ) : (
              logs.map((log) => (
                <Box key={log.id} sx={{ display: 'flex', justifyContent: 'space-between', p: 1, borderBottom: '1px solid #eee' }}>
                  <Typography>
                    <strong>Sess {log.sessionNumber}:</strong> {log.characterName}
                  </Typography>
                  <Typography>
                    {actionToTitleMap[log.action] || log.action}: <strong>{log.amount}</strong>
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogsViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default CampaignDetailsPage;
