import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Container, Paper, IconButton, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../Contexts/AuthContext';
import { ApiService, LogEntry, CampaignPlayer } from '../../Services/api';

const actionToTitleMap: Record<string, string> = {
  "causado": "⚔️ Damage Dealt",
  "recebido": "🛡️ Damage Taken",
  "cura": "❤️ Healing",
  "eliminacao": "🎯 Kills",
  "jogador_caido": "💀 Times Downed",
  "critico_sucesso": "✨ Nat 20s",
  "critico_falha": "💥 Nat 1s",
};

const SessionDetailsPage: React.FC = () => {
  const { campaignId, sessionNumber } = useParams<{ campaignId: string; sessionNumber: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const sessionNum = parseInt(sessionNumber || '0');

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [players, setPlayers] = useState<CampaignPlayer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Edit State
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);

  // Add State
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newLogForm, setNewLogForm] = useState({
    characterName: '',
    action: 'causado',
    amount: 0
  });

  useEffect(() => {
    if (campaignId && sessionNum && token) {
      fetchData();
    }
  }, [campaignId, sessionNum, token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsData, playersData] = await Promise.all([
        ApiService.getSessionLogs(campaignId!, sessionNum, token || undefined),
        ApiService.getPlayers(campaignId!, token || undefined)
      ]);
      setLogs(logsData);
      setPlayers(playersData);
    } catch (err) {
      console.error(err);
      setError("Failed to load session data.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (log: LogEntry) => {
    setEditingLog({ ...log });
    setOpenEditDialog(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this log?')) {
      try {
        await ApiService.deleteLog(id, token || undefined);
        fetchData(); // Refresh logs
      } catch (err) {
        console.error(err);
        alert("Failed to delete log.");
      }
    }
  };

  const handleSaveEdit = async () => {
    if (editingLog) {
      try {
        await ApiService.updateLog(
          editingLog.id,
          editingLog.characterName,
          editingLog.action,
          editingLog.amount,
          token || undefined
        );
        fetchData(); // Refresh logs
        setOpenEditDialog(false);
        setEditingLog(null);
      } catch (err) {
        console.error(err);
        alert("Failed to update log.");
      }
    }
  };

  const handleAddLog = async () => {
    if (!campaignId) return;
    
    try {
      await ApiService.addLog(
        campaignId,
        sessionNum,
        newLogForm.characterName,
        newLogForm.action,
        newLogForm.amount,
        token || undefined
      );
      // Refresh logs
      const logsData = await ApiService.getSessionLogs(campaignId!, sessionNum, token || undefined);
      setLogs(logsData);
      setOpenAddDialog(false);
      // Reset form
      setNewLogForm({ characterName: '', action: 'causado', amount: 0 });
    } catch (err) {
      console.error(err);
      alert("Failed to add log.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, height: '100%', overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(`/logs/${campaignId}`)}
        >
          Back to Campaign
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Session {sessionNumber} Logs
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setOpenAddDialog(true)}
        >
          Add Log
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100% - 150px)', overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Character</TableCell>
                <TableCell>Action</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.characterName}</TableCell>
                    <TableCell>{actionToTitleMap[log.action] || log.action}</TableCell>
                    <TableCell align="right">{log.amount}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEditClick(log)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(log.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">No logs found for this session.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Log Entry</DialogTitle>
        <DialogContent>
          {editingLog && (
            <>
              <TextField
                select
                margin="dense"
                label="Character Name"
                fullWidth
                value={editingLog.characterName}
                onChange={(e) => setEditingLog({ ...editingLog, characterName: e.target.value })}
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
              <FormControl fullWidth margin="dense">
                <InputLabel>Action</InputLabel>
                <Select
                  value={editingLog.action}
                  label="Action"
                  onChange={(e) => setEditingLog({ ...editingLog, action: e.target.value })}
                >
                  {Object.entries(actionToTitleMap).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                label="Amount"
                type="number"
                fullWidth
                value={editingLog.amount}
                onChange={(e) => setEditingLog({ ...editingLog, amount: parseInt(e.target.value) || 0 })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Log</DialogTitle>
        <DialogContent>
          <TextField
            select
            autoFocus
            margin="dense"
            label="Character Name"
            fullWidth
            value={newLogForm.characterName}
            onChange={(e) => setNewLogForm({ ...newLogForm, characterName: e.target.value })}
            SelectProps={{
              native: true,
            }}
          >
            <option value="" disabled>Select Character</option>
            {players.map((player) => (
              <option key={player.id} value={player.characterName}>
                {player.characterName}
              </option>
            ))}
          </TextField>
          <FormControl fullWidth margin="dense">
            <InputLabel>Action</InputLabel>
            <Select
              value={newLogForm.action}
              label="Action"
              onChange={(e) => setNewLogForm({ ...newLogForm, action: e.target.value })}
            >
              {Object.entries(actionToTitleMap).map(([key, label]) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={newLogForm.amount}
            onChange={(e) => setNewLogForm({ ...newLogForm, amount: parseInt(e.target.value) || 0 })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddLog} variant="contained" disabled={!newLogForm.characterName}>Add</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SessionDetailsPage;
