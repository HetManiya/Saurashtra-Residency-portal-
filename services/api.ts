
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import * as CONSTANTS from '../constants';
import { MaintenanceRecord, PaymentStatus, Meeting, OccupancyType } from '../types';

const API_BASE = (window as any).VITE_API_URL || 'http://localhost:5000/api';

const getLoggedUser = () => {
  const user = localStorage.getItem('sr_user');
  return user ? JSON.parse(user) : { id: 'system', name: 'System' };
};

const addAuditLog = (action: string, entity: string, details: string) => {
  const user = getLoggedUser();
  const logs = JSON.parse(localStorage.getItem('sr_audit_logs') || '[]');
  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id || user.email,
    userName: user.name,
    action,
    entity,
    details
  };
  logs.unshift(newLog);
  localStorage.setItem('sr_audit_logs', JSON.stringify(logs.slice(0, 1000)));
};

export const audioUtils = {
  encode: (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },
  decode: (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  },
  async decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
};

export const api = {
  login: async (credentials: any) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      
      localStorage.setItem('sr_token', data.token);
      localStorage.setItem('sr_user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('storage'));
      return data;
    } catch (error) {
      const fallbackUsers = [
        { 
          email: 'admin@residency.com', 
          password: 'admin123', 
          user: { name: 'System Admin', role: 'ADMIN', flatId: 'A-1-Office' } 
        },
        { 
          email: 'resident@residency.com', 
          password: 'resident123', 
          user: { name: 'Kishan Patel', role: 'RESIDENT', flatId: 'A-1-204' } 
        }
      ];

      const found = fallbackUsers.find(u => u.email === credentials.email && u.password === credentials.password);
      if (found) {
        const data = { token: 'demo-token-' + Date.now(), user: found.user };
        localStorage.setItem('sr_token', data.token);
        localStorage.setItem('sr_user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('storage'));
        return data;
      }
      throw new Error('Invalid credentials');
    }
  },

  register: async (userData: any) => {
    addAuditLog('Register', 'User', `Registration attempt: ${userData.email}`);
    return { success: true };
  },

  getBuildings: async () => JSON.parse(localStorage.getItem('sr_buildings') || JSON.stringify(CONSTANTS.BUILDINGS)),
  
  getNotices: async () => {
    const local = localStorage.getItem('sr_notices');
    if (local) return JSON.parse(local);
    localStorage.setItem('sr_notices', JSON.stringify(CONSTANTS.NOTICES));
    return CONSTANTS.NOTICES;
  },

  getAuditLogs: () => JSON.parse(localStorage.getItem('sr_audit_logs') || '[]'),
  getExpenses: (f: any) => [],
  getLocalityInfo: async (q: string) => ({ text: "Saurashtra Residency is a luxury community...", sources: [] }),
  getExpensePrediction: async (e: any) => "Expenses are stable.",
  calculateMaintenanceWithPenalty: (amt: number) => ({ total: amt, penalty: 0, isOverdue: false }),
  
  getMaintenanceRecords: async (id: string) => {
    const allRecords: MaintenanceRecord[] = JSON.parse(localStorage.getItem('sr_maintenance') || JSON.stringify(CONSTANTS.MAINTENANCE_SAMPLES));
    const records = allRecords.filter(r => r.flatId === id);
    
    if (records.length === 0) {
      return [
        { id: `hist-${id}-1`, flatId: id, month: 'April', year: 2024, amount: 700, status: PaymentStatus.PAID, occupancyType: OccupancyType.OWNER, paidDate: '2024-04-05' },
        { id: `hist-${id}-2`, flatId: id, month: 'March', year: 2024, amount: 700, status: PaymentStatus.PAID, occupancyType: OccupancyType.OWNER, paidDate: '2024-03-02' },
        { id: `hist-${id}-3`, flatId: id, month: 'February', year: 2024, amount: 700, status: PaymentStatus.PAID, occupancyType: OccupancyType.OWNER, paidDate: '2024-02-10' },
      ];
    }
    return records;
  },

  generateVisitorPass: async (d: any) => ({ passId: 'SR-123', ...d }),
  isMonthLocked: (m: string, y: number) => false,
  broadcastNotification: async (type: string, target: string, message: string) => {
    console.log(`Broadcasting ${type} to ${target}: ${message}`);
    addAuditLog('Broadcast', 'Notification', `${type} sent to ${target}`);
    return { success: true };
  },

  postNotice: async (data: any) => {
    try {
      // Local demo persistence
      const notices = await api.getNotices();
      const newNotice = {
        id: `notice-${Date.now()}`,
        ...data,
        date: new Date().toISOString()
      };
      notices.unshift(newNotice);
      localStorage.setItem('sr_notices', JSON.stringify(notices));

      // Network attempt
      fetch(`${API_BASE}/society/notices`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sr_token')}`
        },
        body: JSON.stringify(data)
      }).catch(() => {});

      addAuditLog('Post Notice', 'Notice', `Posted: ${data.title}`);
      return { success: true, notice: newNotice };
    } catch (e) {
      return { success: false };
    }
  },

  exportToCSV: (data: any[], filename: string) => {
    if (!data || !data.length) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0]).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog('Export', 'CSV', `Exported ${filename}`);
  },

  generateReceipt: (record: any) => {
    console.log("Generating receipt for", record);
    alert(`Receipt generated for unit ${record.flatId}`);
    addAuditLog('Receipt', 'Maintenance', `Generated for ${record.flatId}`);
  },

  lockMaintenanceMonth: async (m: string, y: number) => {
    addAuditLog('Lock Cycle', 'Maintenance', `Locked ${m} ${y}`);
    return { success: true };
  },

  connectLiveAssistant: async (callbacks: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: 'You are a friendly and helpful society management assistant for Saurashtra Residency in Pasodara, Surat. You help residents with maintenance questions, wing directions, and community news.',
      },
    });
  },

  getMeetings: async (): Promise<Meeting[]> => {
    const local = localStorage.getItem('sr_meetings');
    if (local) return JSON.parse(local);
    const seed: Meeting[] = [{
      id: 'm-1',
      title: 'Annual General Meeting (AGM) 2024',
      date: '2024-06-15',
      time: '10:00 AM',
      location: 'Vasant Vatika Garden',
      description: 'Discussion on annual accounts and selection of new committee members.',
      category: 'General',
      rsvps: [],
      createdBy: 'admin@residency.com'
    }];
    localStorage.setItem('sr_meetings', JSON.stringify(seed));
    return seed;
  },

  scheduleMeeting: async (data: Omit<Meeting, 'id' | 'rsvps'>) => {
    const meetings = await api.getMeetings();
    const newMeeting: Meeting = {
      ...data,
      id: `m-${Date.now()}`,
      rsvps: []
    };
    meetings.push(newMeeting);
    meetings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    localStorage.setItem('sr_meetings', JSON.stringify(meetings));
    
    api.broadcastNotification('WHATSAPP', 'ALL_RESIDENTS', `New Meeting Scheduled: ${data.title}`);
    addAuditLog('Schedule', 'Meeting', `Created meeting: ${data.title}`);
    return newMeeting;
  },

  rsvpMeeting: async (meetingId: string, userId: string, status: boolean) => {
    const meetings = await api.getMeetings();
    const idx = meetings.findIndex(m => m.id === meetingId);
    if (idx > -1) {
      const currentRsvps = new Set(meetings[idx].rsvps);
      if (status) {
        currentRsvps.add(userId);
      } else {
        currentRsvps.delete(userId);
      }
      meetings[idx].rsvps = Array.from(currentRsvps);
      localStorage.setItem('sr_meetings', JSON.stringify(meetings));
      return meetings[idx];
    }
    throw new Error('Meeting not found');
  }
};
