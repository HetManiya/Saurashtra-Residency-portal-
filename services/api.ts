
import { GoogleGenAI, Modality } from "@google/genai";
import { supabase } from '../lib/supabase';
import * as CONSTANTS from '../constants';
import { MaintenanceRecord, PaymentStatus, Meeting, OccupancyType, AmenityBooking, AuditLogEntry, Notice } from '../types';

/**
 * Helper to manage local fallback storage for demo stability
 */
const getLocalPending = () => {
  const data = localStorage.getItem('sr_demo_pending');
  return data ? JSON.parse(data) : [];
};

const setLocalPending = (data: any[]) => {
  localStorage.setItem('sr_demo_pending', JSON.stringify(data));
};

/**
 * audioUtils provides helper functions for Gemini Live API audio processing.
 */
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
  decodeAudioData: async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
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

const addAuditLog = async (action: string, entity: string, details: string) => {
  const userStr = localStorage.getItem('sr_user');
  const user = userStr ? JSON.parse(userStr) : { id: 'system', name: 'System' };
  
  try {
    const { error } = await supabase.from('audit_logs').insert({
      userId: user.id || user.email,
      userName: user.name,
      action,
      entity,
      details,
      timestamp: new Date().toISOString()
    });
    if (error) console.error('Error logging audit:', error);
  } catch (e) {
    console.warn("Audit logging skipped");
  }
};

export const api = {
  login: async (credentials: any) => {
    // DEMO BYPASS
    if (credentials.email === 'admin@residency.com' && credentials.password === 'admin123') {
      const userData = {
        id: 'demo-admin-uuid',
        name: 'System Administrator',
        email: 'admin@residency.com',
        role: 'ADMIN',
        flatId: 'A-1-Office',
        occupancyType: 'Owner'
      };
      localStorage.setItem('sr_token', 'demo-token-123');
      localStorage.setItem('sr_user', JSON.stringify(userData));
      window.dispatchEvent(new Event('storage'));
      return { token: 'demo-token-123', user: userData };
    }

    if (credentials.email === 'resident@residency.com' && credentials.password === 'resident123') {
      const userData = {
        id: 'demo-resident-uuid',
        name: 'John Doe',
        email: 'resident@residency.com',
        role: 'RESIDENT',
        flatId: 'A-1-101',
        occupancyType: 'Owner'
      };
      localStorage.setItem('sr_token', 'demo-token-456');
      localStorage.setItem('sr_user', JSON.stringify(userData));
      window.dispatchEvent(new Event('storage'));
      return { token: 'demo-token-456', user: userData };
    }

    // Check Local Fallback first (if a user was registered locally and approved)
    const localPending = getLocalPending();
    const localUser = localPending.find((u: any) => u.email === credentials.email && u.status === 'APPROVED');
    
    if (localUser) {
      // Simulate login for locally approved user
      const userData = { ...localUser, id: localUser.email };
      localStorage.setItem('sr_token', 'local-demo-token');
      localStorage.setItem('sr_user', JSON.stringify(userData));
      window.dispatchEvent(new Event('storage'));
      return { token: 'local-demo-token', user: userData };
    }

    // Standard Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError) throw authError;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("User profile not found. Please contact administration.");
    }

    const userData = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      flatId: profile.flatId,
      occupancyType: profile.occupancyType
    };

    localStorage.setItem('sr_token', authData.session.access_token);
    localStorage.setItem('sr_user', JSON.stringify(userData));
    window.dispatchEvent(new Event('storage'));

    return { token: authData.session.access_token, user: userData };
  },

  register: async (userData: any) => {
    const newRequest = {
      id: userData.email, // Use email as unique ID for demo
      email: userData.email,
      name: userData.name,
      role: userData.role || 'RESIDENT',
      flatId: userData.flatId,
      occupancyType: userData.occupancyType,
      status: 'PENDING',
      timestamp: new Date().toISOString()
    };

    try {
      // Attempt Supabase
      const { error } = await supabase.from('profiles').upsert(newRequest, { onConflict: 'email' });
      
      if (error) {
        console.warn("Supabase registration failed, using local fallback:", error.message);
        // Save locally if DB fails
        const current = getLocalPending();
        const filtered = current.filter((u: any) => u.email !== userData.email);
        setLocalPending([...filtered, newRequest]);
      }
    } catch (e) {
      console.warn("Network error during registration, using local fallback");
      const current = getLocalPending();
      const filtered = current.filter((u: any) => u.email !== userData.email);
      setLocalPending([...filtered, newRequest]);
    }

    await addAuditLog('Register Request', 'User', `Registration pending for: ${userData.email}`);
    return { success: true };
  },

  updatePassword: async (userId: string, data: any) => {
    // In a real app, this would use Supabase Auth updatePassword
    // For demo, we just return success
    await addAuditLog('Password Update', 'User', `Credentials updated for user: ${userId}`);
    return { success: true };
  },

  getPendingRegistrations: async () => {
    let dbData: any[] = [];
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'PENDING');
      if (!error && data) dbData = data;
    } catch (e) {}

    // Merge with Local Fallback
    const localData = getLocalPending().filter((u: any) => u.status === 'PENDING');
    
    // De-duplicate by email
    const combined = [...dbData];
    localData.forEach((lu: any) => {
      if (!combined.some(du => du.email === lu.email)) {
        combined.push(lu);
      }
    });

    return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  approveRegistration: async (userId: string) => {
    // Approve in Supabase
    try {
      await supabase.from('profiles').update({ status: 'APPROVED' }).or(`id.eq.${userId},email.eq.${userId}`);
    } catch (e) {}

    // Approve in Local
    const local = getLocalPending();
    const updated = local.map((u: any) => (u.id === userId || u.email === userId) ? { ...u, status: 'APPROVED' } : u);
    setLocalPending(updated);

    return { success: true };
  },

  rejectRegistration: async (userId: string) => {
    // Reject in Supabase
    try {
      await supabase.from('profiles').update({ status: 'REJECTED' }).or(`id.eq.${userId},email.eq.${userId}`);
    } catch (e) {}

    // Reject in Local
    const local = getLocalPending();
    const updated = local.map((u: any) => (u.id === userId || u.email === userId) ? { ...u, status: 'REJECTED' } : u);
    setLocalPending(updated);

    return { success: true };
  },

  getBuildings: async () => {
    return CONSTANTS.BUILDINGS;
  },

  getOccupancyData: async () => {
    return [{
      flatId: 'A-1-101',
      name: 'John Doe',
      occupancyType: 'Owner',
      status: 'APPROVED'
    }];
  },

  getNotices: async (): Promise<Notice[]> => {
    try {
      const { data, error } = await supabase.from('notices').select('*').order('date', { ascending: false });
      return error || !data || data.length === 0 ? CONSTANTS.NOTICES : data;
    } catch (e) {
      return CONSTANTS.NOTICES;
    }
  },

  postNotice: async (noticeData: any) => {
    try {
      await supabase.from('notices').insert({
        title: noticeData.title,
        content: noticeData.content,
        category: noticeData.category,
        date: new Date().toISOString()
      });
    } catch (e) {}
    return { success: true };
  },

  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    try {
      const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
      return error ? [] : data;
    } catch (e) {
      return [];
    }
  },

  getExpenses: async (filters: any) => {
    return [];
  },

  addExpense: async (expenseData: any) => {
    return { success: true };
  },

  getMaintenanceRecords: async (flatId: string): Promise<MaintenanceRecord[]> => {
    // Demo Mock: Return some historical records for the unit
    return [
      { id: '1', flatId, month: 'May', year: 2024, amount: 700, status: PaymentStatus.PENDING, occupancyType: OccupancyType.OWNER },
      { id: '2', flatId, month: 'April', year: 2024, amount: 700, status: PaymentStatus.PAID, occupancyType: OccupancyType.OWNER, paidDate: '2024-04-05' },
      { id: '3', flatId, month: 'March', year: 2024, amount: 700, status: PaymentStatus.PAID, occupancyType: OccupancyType.OWNER, paidDate: '2024-03-08' },
    ];
  },

  getAllMaintenanceRecords: async (month?: string, year?: number): Promise<MaintenanceRecord[]> => {
    return [];
  },

  updateMaintenanceStatus: async (recordId: string, status: PaymentStatus, paidDate?: string) => {
    return { success: true };
  },

  generateMonthlyMaintenance: async (month: string, year: number, amount: number) => {
    return { success: true };
  },

  calculateMaintenanceWithPenalty: (amt: number) => {
    return { total: amt, penalty: 0, isOverdue: false };
  },

  generateVisitorPass: async (d: any) => {
    return { passId: `SR-${Date.now()}`, ...d };
  },

  broadcastNotification: async (type: string, target: string, message: string) => {
    return { success: true };
  },

  exportToCSV: (data: any[], filename: string) => {
    console.log("CSV Export triggered");
  },

  generateReceipt: (record: any) => {
    alert(`Receipt generated for unit ${record.flatId}`);
  },

  lockMaintenanceMonth: async (m: string, y: number) => {
    return { success: true };
  },

  getMeetings: async (): Promise<Meeting[]> => {
    return [];
  },

  scheduleMeeting: async (data: Omit<Meeting, 'id' | 'rsvps'>) => {
    return { ...data, id: 'mock-id', rsvps: [] };
  },

  rsvpMeeting: async (meetingId: string, userId: string, status: boolean) => {
    return { id: meetingId, rsvps: [] };
  },

  getAmenityBookings: async (): Promise<AmenityBooking[]> => {
    return [];
  },

  createAmenityBooking: async (data: Omit<AmenityBooking, 'id' | 'status'>): Promise<AmenityBooking> => {
    return { ...data, id: 'mock-id', status: 'Pending' };
  },

  updateAmenityBookingStatus: async (id: string, status: 'Confirmed' | 'Pending' | 'Rejected'): Promise<AmenityBooking> => {
    return { id, status } as any;
  },

  getLocalityInfo: async (q: string) => {
    return { text: "Saurashtra Residency is a luxury community in Pasodara, Surat.", sources: [] };
  },

  getExpensePrediction: async (e: any) => "Stability expected.",

  isMonthLocked: (m: string, y: number) => false,

  connectLiveAssistant: async (callbacks: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks,
      config: {
        responseModalities: ['AUDIO' as any],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: 'You are a helpful society assistant for Saurashtra Residency.',
      },
    });
  }
};
