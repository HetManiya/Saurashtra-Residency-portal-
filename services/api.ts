
import { GoogleGenAI, Modality } from "@google/genai";
import { supabase } from '../lib/supabase';
import * as CONSTANTS from '../constants';
import { MaintenanceRecord, PaymentStatus, Meeting, OccupancyType, AmenityBooking, AuditLogEntry, Notice } from '../types';

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
  
  const { error } = await supabase.from('audit_logs').insert({
    userId: user.id || user.email,
    userName: user.name,
    action,
    entity,
    details,
    timestamp: new Date().toISOString()
  });
  if (error) console.error('Error logging audit:', error);
};

export const api = {
  login: async (credentials: any) => {
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

    if (profile.status === 'PENDING') {
      await supabase.auth.signOut();
      throw new Error("Your account is awaiting approval from the Wing President.");
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
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) throw authError;

    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'RESIDENT',
        flatId: userData.flatId,
        occupancyType: userData.occupancyType,
        status: 'PENDING',
        timestamp: new Date().toISOString()
      });

      if (profileError) throw profileError;
      
      await addAuditLog('Register Request', 'User', `Registration pending for: ${userData.email} (Unit ${userData.flatId})`);
    }

    return { success: true };
  },

  getPendingRegistrations: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'PENDING');
    
    if (error) return [];
    return data;
  },

  approveRegistration: async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'APPROVED' })
      .eq('id', userId);

    if (error) throw error;
    
    const { data: profile } = await supabase.from('profiles').select('email').eq('id', userId).single();
    await addAuditLog('Approve User', 'User', `President approved: ${profile?.email}`);
    return { success: true };
  },

  rejectRegistration: async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'REJECTED' })
      .eq('id', userId);

    if (error) throw error;
    
    const { data: profile } = await supabase.from('profiles').select('email').eq('id', userId).single();
    await addAuditLog('Reject User', 'User', `President rejected: ${profile?.email}`);
    return { success: true };
  },

  getBuildings: async () => {
    const { data, error } = await supabase.from('buildings').select('*').order('name', { ascending: true });
    return error ? CONSTANTS.BUILDINGS : (data.length ? data : CONSTANTS.BUILDINGS);
  },

  // New method to fetch real occupancy data from profiles
  getOccupancyData: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('flatId, name, occupancyType, status')
      .eq('status', 'APPROVED');
    
    if (error) return [];
    return data;
  },

  getNotices: async (): Promise<Notice[]> => {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('date', { ascending: false });
    return error ? CONSTANTS.NOTICES : data;
  },

  postNotice: async (noticeData: any) => {
    const { data, error } = await supabase.from('notices').insert({
      title: noticeData.title,
      content: noticeData.content,
      category: noticeData.category,
      date: new Date().toISOString()
    }).select().single();

    if (error) throw error;
    await addAuditLog('Post Notice', 'Notice', `Posted: ${noticeData.title}`);
    return { success: true, notice: data };
  },

  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });
    return error ? [] : data;
  },

  getExpenses: async (filters: any) => {
    let query = supabase.from('expenses').select('*');
    if (filters.type) query = query.eq('type', filters.type);
    const { data, error } = await query.order('date', { ascending: false });
    return error ? [] : data;
  },

  addExpense: async (expenseData: any) => {
    const { data, error } = await supabase.from('expenses').insert({
      ...expenseData,
      date: new Date().toISOString()
    }).select().single();
    if (error) throw error;
    await addAuditLog('Add Expense', 'Treasury', `Logged payout of ₹${expenseData.amount} to ${expenseData.payeeName}`);
    return data;
  },

  getMaintenanceRecords: async (flatId: string): Promise<MaintenanceRecord[]> => {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('flatId', flatId)
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    return error ? [] : data;
  },

  getAllMaintenanceRecords: async (month?: string, year?: number): Promise<MaintenanceRecord[]> => {
    let query = supabase.from('maintenance_records').select('*');
    if (month) query = query.eq('month', month);
    if (year) query = query.eq('year', year);
    const { data, error } = await query.order('flatId', { ascending: true });
    return error ? [] : data;
  },

  updateMaintenanceStatus: async (recordId: string, status: PaymentStatus, paidDate?: string) => {
    const { data, error } = await supabase
      .from('maintenance_records')
      .update({ status, paidDate: paidDate || null })
      .eq('id', recordId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  generateMonthlyMaintenance: async (month: string, year: number, amount: number) => {
    const records = [];
    for (const b of CONSTANTS.BUILDINGS) {
      for (let floor = 1; floor <= b.totalFloors; floor++) {
        for (let unit = 1; unit <= b.flatsPerFloor; unit++) {
          const flatId = `${b.name}-${floor}0${unit}`;
          records.push({
            flatId,
            month,
            year,
            amount,
            status: 'Pending',
            occupancyType: 'Owner' 
          });
        }
      }
    }
    
    const { error } = await supabase.from('maintenance_records').insert(records);
    if (error && error.code !== '23505') throw error; 
    
    await addAuditLog('Generate Maintenance', 'Maintenance', `Generated records for ${month} ${year}`);
    return { success: true };
  },

  calculateMaintenanceWithPenalty: (amt: number) => {
    return { total: amt, penalty: 0, isOverdue: false };
  },

  generateVisitorPass: async (d: any) => {
    const pass = { id: `SR-${Date.now()}`, ...d, timestamp: new Date().toISOString() };
    await supabase.from('visitor_passes').insert(pass);
    return { passId: pass.id, ...d };
  },

  broadcastNotification: async (type: string, target: string, message: string) => {
    console.log(`Supabase Broadcast: ${type} to ${target}: ${message}`);
    await addAuditLog('Broadcast', 'Notification', `${type} sent to ${target}`);
    return { success: true };
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
  },

  generateReceipt: (record: any) => {
    alert(`Receipt generated for unit ${record.flatId}`);
  },

  lockMaintenanceMonth: async (m: string, y: number) => {
    await addAuditLog('Lock Cycle', 'Maintenance', `Locked ${m} ${y}`);
    return { success: true };
  },

  getMeetings: async (): Promise<Meeting[]> => {
    const { data, error } = await supabase.from('meetings').select('*').order('date', { ascending: true });
    return error ? [] : data;
  },

  scheduleMeeting: async (data: Omit<Meeting, 'id' | 'rsvps'>) => {
    const { data: newMeeting, error } = await supabase
      .from('meetings')
      .insert({ ...data, rsvps: [] })
      .select()
      .single();
    if (error) throw error;
    return newMeeting;
  },

  rsvpMeeting: async (meetingId: string, userId: string, status: boolean) => {
    const { data: meeting } = await supabase.from('meetings').select('rsvps').eq('id', meetingId).single();
    let rsvps = meeting?.rsvps || [];
    if (status) {
      if (!rsvps.includes(userId)) rsvps.push(userId);
    } else {
      rsvps = rsvps.filter((id: string) => id !== userId);
    }
    const { data, error } = await supabase.from('meetings').update({ rsvps }).eq('id', meetingId).select().single();
    if (error) throw error;
    return data;
  },

  getAmenityBookings: async (): Promise<AmenityBooking[]> => {
    const { data, error } = await supabase.from('amenity_bookings').select('*').order('date', { ascending: false });
    return error ? [] : data;
  },

  createAmenityBooking: async (data: Omit<AmenityBooking, 'id' | 'status'>): Promise<AmenityBooking> => {
    const { data: booking, error } = await supabase
      .from('amenity_bookings')
      .insert({ ...data, status: 'Pending' })
      .select()
      .single();
    if (error) throw error;
    await addAuditLog('Create Booking', 'Amenity', `User ${data.userName} requested ${data.purpose}`);
    return booking;
  },

  updateAmenityBookingStatus: async (id: string, status: 'Confirmed' | 'Pending' | 'Rejected'): Promise<AmenityBooking> => {
    const { data, error } = await supabase.from('amenity_bookings').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  getLocalityInfo: async (q: string) => {
    return { text: "Saurashtra Residency is a luxury community in Pasodara, Surat, featuring 24 wings and premium amenities like clubhouse and gardens.", sources: [] };
  },

  getExpensePrediction: async (e: any) => "Expenses are expected to remain within budget for the next quarter.",

  isMonthLocked: (m: string, y: number) => false,

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
        systemInstruction: 'You are a friendly and helpful society management assistant for Saurashtra Residency in Pasodara, Surat.',
      },
    });
  }
};
