const BASE_URL = '/api'; // Assumes proxy or Nginx setup

// --- Types ---
export enum RpgSystem {
  DnD2024 = 0,
  DnD5 = 1,
  Daggerheart = 2,
  ReinosDeFerro = 3
}

export interface Campaign {
  id: string;
  name: string;
  guildId: string;
  gameMasterId: string;
  isActive: boolean;
  system: RpgSystem;
}

export interface CampaignPlayer {
  id: string;
  campaignId: string;
  characterName: string;
}

export interface SessionSummary {
  sessionNumber: number;
  title: string;
  description: string;
  date?: string;
}

export interface LogEntry {
  id: string;
  sessionNumber: number;
  characterName: string;
  action: string;
  amount: number;
  timestamp?: string;
}

export interface MvpData {
  action: string;
  players: string[];
  amount: number;
}

// --- API Service ---

const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const ApiService = {
  // --- Campaigns ---
  getCampaigns: async (guildId: string, token?: string): Promise<Campaign[]> => {
    const response = await fetch(`${BASE_URL}/Campaign/all`, {
      headers: getHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch campaigns');
    return response.json();
  },

  getCampaign: async (campaignId: string, token?: string): Promise<Campaign> => {
    const response = await fetch(`${BASE_URL}/Campaign/details/${campaignId}`, {
      headers: getHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch campaign details');
    return response.json();
  },

  createCampaign: async (guildId: string, name: string, system: RpgSystem, gameMasterId?: string, token?: string): Promise<Campaign> => {
    const response = await fetch(`${BASE_URL}/Campaign`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ guildId, name, system, gameMasterId }),
    });
    if (!response.ok) throw new Error('Failed to create campaign');
    return response.json();
  },

  deleteCampaign: async (campaignId: string, token?: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/Campaign/${campaignId}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to delete campaign');
  },

  setActiveCampaign: async (guildId: string, campaignId: string, token?: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/Campaign/active`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ guildId, campaignId }),
    });
    if (!response.ok) throw new Error('Failed to set active campaign');
  },

  getPlayers: async (campaignId: string, token?: string): Promise<CampaignPlayer[]> => {
    const response = await fetch(`${BASE_URL}/Campaign/players/${campaignId}`, {
      headers: getHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch players');
    return response.json();
  },

  addPlayer: async (campaignId: string, characterName: string, token?: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/Campaign/players`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ campaignId, characterName }),
    });
    if (!response.ok) throw new Error('Failed to add player');
  },

  // --- Sessions ---
  getSessionSummaries: async (campaignId: string, token?: string): Promise<SessionSummary[]> => {
    const response = await fetch(`${BASE_URL}/Session/summaries/${campaignId}`, {
      headers: getHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch session summaries');
    return response.json();
  },

  createOrUpdateSession: async (
    campaignId: string, 
    sessionNumber: number, 
    title: string, 
    description: string, 
    token?: string
  ): Promise<void> => {
    const response = await fetch(`${BASE_URL}/Session/end`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ campaignId, sessionNumber, title, description }),
    });
    if (!response.ok) throw new Error('Failed to save session');
  },

  deleteSession: async (campaignId: string, sessionNumber: number, token?: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/Session/${campaignId}/${sessionNumber}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to delete session');
  },

  // --- Logs ---
  addLog: async (
    campaignId: string, 
    sessionNumber: number, 
    characterName: string, 
    action: string, 
    amount: number, 
    token?: string
  ): Promise<void> => {
    const response = await fetch(`${BASE_URL}/Session/log`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ campaignId, sessionNumber, characterName, action, amount }),
    });
    if (!response.ok) throw new Error('Failed to add log');
  },

  updateLog: async (
    logId: string,
    characterName: string,
    action: string,
    amount: number,
    token?: string
  ): Promise<void> => {
    const response = await fetch(`${BASE_URL}/Session/log/${logId}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ characterName, action, amount }),
    });
    if (!response.ok) throw new Error('Failed to update log');
  },

  deleteLog: async (logId: string, token?: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/Session/log/${logId}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to delete log');
  },

  getMvps: async (campaignId: string, token?: string): Promise<MvpData[]> => {
    const response = await fetch(`${BASE_URL}/Session/mvp/${campaignId}`, {
      headers: getHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch MVPs');
    return response.json();
  },

  getAllLogs: async (campaignId: string, token?: string): Promise<LogEntry[]> => {
    const response = await fetch(`${BASE_URL}/Session/logs/${campaignId}`, {
      headers: getHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch all logs');
    return response.json();
  },

  getSessionLogs: async (campaignId: string, sessionNumber: number, token?: string): Promise<LogEntry[]> => {
    const response = await fetch(`${BASE_URL}/Session/logs/${campaignId}/${sessionNumber}`, {
      headers: getHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch session logs');
    return response.json();
  }
};
