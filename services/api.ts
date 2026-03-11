
import { GoogleGenAI, Modality } from "@google/genai";
import * as CONSTANTS from '../constants';
import { MaintenanceRecord, PaymentStatus, Meeting, OccupancyType, AmenityBooking, AuditLogEntry, Notice } from '../types';

/**
 * Helper to manage local fallback storage for demo stability
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('sr_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response, retryCount = 0): Promise<any> => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (response.status === 401) {
    console.warn('🔒 Session expired or unauthorized. Logging out...');
    localStorage.removeItem('sr_token');
    localStorage.removeItem('sr_user');
    window.dispatchEvent(new Event('storage'));
    window.location.hash = '/login';
    throw new Error('Session expired. Please login again.');
  }

  // Handle temporary "Starting Server" HTML responses from the platform proxy or 503 from backend
  if (response.status === 503 || (!isJson && response.status === 200)) {
    const text = await response.clone().text().catch(() => '');
    if (text.includes('Starting Server...') || text.includes('<!doctype html>') || response.status === 503) {
      if (retryCount < 5) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        // We throw a specific error that the caller can catch to retry or use fallback
        throw new Error('SERVER_STARTING');
      }
      throw new Error('The server is currently starting up. Please wait a few seconds and try again.');
    }
  }

  let data;
  if (isJson) {
    try {
      data = await response.json();
    } catch (e) {
      console.error('Failed to parse JSON body even though content-type was application/json');
    }
  }

  if (!response.ok) {
    if (data && data.message) {
      throw new Error(data.message);
    }
    
    if (!isJson) {
      const text = await response.text().catch(() => '');
      if (text.includes('<!doctype html>') || text.includes('<html>')) {
        if (text.includes('Starting Server...')) {
          throw new Error('The server is currently starting up. Please wait a few seconds and try again.');
        }
        throw new Error(`API Route Not Found (404). The server returned the main HTML page instead of data.`);
      }
    }
    
    throw new Error(`Server Error: ${response.status} ${response.statusText}`);
  }

  if (!isJson) {
    const text = await response.text().catch(() => 'unavailable');
    if (text.includes('Starting Server...')) {
      throw new Error('The server is currently starting up. Please wait a few seconds and try again.');
    }
    console.error('Expected JSON but got:', text.substring(0, 200));
    throw new Error(`Server returned non-JSON response (${response.status} ${response.statusText}). Content-Type: ${contentType || 'none'}. Body starts with: ${text.substring(0, 50)}`);
  }

  return data;
};

export const api = {
  login: async (credentials: any) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await handleResponse(response);
    localStorage.setItem('sr_token', data.token);
    localStorage.setItem('sr_user', JSON.stringify(data.user));
    window.dispatchEvent(new Event('storage'));
    return data;
  },

  register: async (userData: any) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  updateProfile: async (userId: string, profilePictureUrl: string) => {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ userId, profilePictureUrl })
    });
    const data = await handleResponse(response);
    localStorage.setItem('sr_user', JSON.stringify(data.user));
    window.dispatchEvent(new Event('storage'));
    return data;
  },

  getBuildings: async () => {
    try {
      const response = await fetch('/api/society/buildings', {
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (e) {
      return CONSTANTS.BUILDINGS;
    }
  },

  getNotices: async (): Promise<Notice[]> => {
    try {
      const response = await fetch('/api/society/notices', {
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (e) {
      return [
        { id: '1', title: 'Welcome to Saurashtra Residency', content: 'Our digital portal is now live!', category: 'General', date: new Date().toISOString() }
      ];
    }
  },

  postNotice: async (noticeData: any) => {
    const response = await fetch('/api/society/notices', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(noticeData)
    });
    return handleResponse(response);
  },

  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    try {
      const response = await fetch('/api/v1/audit', {
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (e) {
      return [
        { id: '1', userName: 'System', action: 'STARTUP', details: 'Society digital portal initialized', timestamp: new Date().toISOString(), userId: 'system', entity: 'SYSTEM' }
      ];
    }
  },

  getNotifications: async () => {
    try {
      const response = await fetch('/api/v1/notifications', {
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (e) {
      return [];
    }
  },

  markNotificationRead: async (id: string) => {
    const response = await fetch(`/api/v1/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  markAllNotificationsRead: async () => {
    const response = await fetch('/api/v1/notifications/read-all', {
      method: 'PATCH',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  getMaintenanceRecords: async (flatId?: string, month?: string, year?: number): Promise<MaintenanceRecord[]> => {
    try {
      const params = new URLSearchParams();
      if (flatId) params.append('flatId', flatId);
      if (month) params.append('month', month);
      if (year) params.append('year', year.toString());

      const response = await fetch(`/api/society/maintenance?${params.toString()}`, {
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (e) {
      return [];
    }
  },

  getAllMaintenanceRecords: async (month?: string, year?: number): Promise<MaintenanceRecord[]> => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year.toString());

      const response = await fetch(`/api/society/maintenance?${params.toString()}`, {
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (e) {
      return [];
    }
  },

  updateMaintenanceStatus: async (recordId: string, status: PaymentStatus, paidDate?: string) => {
    const response = await fetch(`/api/society/maintenance/${recordId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ status, paidDate })
    });
    return handleResponse(response);
  },

  generateMonthlyMaintenance: async (month: string, year: number, amount: number) => {
    const response = await fetch('/api/society/maintenance/generate', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ month, year, amount })
    });
    return handleResponse(response);
  },

  getMeetings: async (): Promise<Meeting[]> => {
    try {
      const response = await fetch('/api/v1/meetings', {
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (e) {
      return [
        { id: '1', title: 'Annual General Meeting', description: 'Discussion on society redevelopment and maintenance', date: new Date().toISOString(), location: 'Clubhouse', rsvps: [], time: '10:00 AM', category: 'General', createdBy: 'Admin' }
      ];
    }
  },

  scheduleMeeting: async (data: Omit<Meeting, 'id' | 'rsvps'>) => {
    const response = await fetch('/api/v1/meetings', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  rsvpMeeting: async (meetingId: string, status: string) => {
    const response = await fetch(`/api/v1/meetings/${meetingId}/rsvp`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  getAmenities: async () => {
    try {
      const response = await fetch('/api/v1/amenities', {
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (e) {
      return CONSTANTS.SOCIETY_INFO.amenities;
    }
  },

  getAmenityBookings: async (): Promise<AmenityBooking[]> => {
    try {
      const response = await fetch('/api/v1/amenities/bookings', {
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (e) {
      return [];
    }
  },

  createAmenityBooking: async (data: any): Promise<AmenityBooking> => {
    const response = await fetch('/api/v1/amenities/bookings', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateAmenityBookingStatus: async (id: string, status: string): Promise<AmenityBooking> => {
    const response = await fetch(`/api/v1/amenities/bookings/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  getPendingRegistrations: async () => {
    try {
      const response = await fetch('/api/v1/admin/pending-registrations', {
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (e) {
      return [];
    }
  },

  approveRegistration: async (userId: string) => {
    const response = await fetch(`/api/v1/admin/approve-registration/${userId}`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  rejectRegistration: async (userId: string) => {
    const response = await fetch(`/api/v1/admin/reject-registration/${userId}`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  verifyPayment: async (paymentIntentId: string) => {
    const response = await fetch('/api/v1/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ paymentIntentId })
    });
    return handleResponse(response);
  },

  createPaymentOrder: async (maintenanceId: string) => {
    const response = await fetch('/api/v1/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ maintenanceId })
    });
    return handleResponse(response);
  },

  setupRecurringPayments: async () => {
    const response = await fetch('/api/v1/payments/setup-recurring', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    return handleResponse(response);
  },

  getPaymentDisputeHelp: async (transactionId: string, reason: string) => {
    const response = await fetch('/api/v1/payments/dispute-help', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ transactionId, reason })
    });
    return handleResponse(response);
  },

  getReminders: async () => {
    const response = await fetch('/api/v1/payments/reminders', {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  getAdminSummary: async () => {
    try {
      const response = await fetch('/api/v1/admin/summary', {
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (e) {
      return {
        summary: { totalCollected: 0, totalPending: 0, openComplaints: 0, activeVisitors: 0 },
        recentComplaints: []
      };
    }
  },

  resolveComplaint: async (complaintId: string) => {
    const response = await fetch(`/api/v1/admin/complaints/${complaintId}/resolve`, {
      method: 'PATCH',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  connectLiveAssistant: async (callbacks: any) => {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const ai = new GoogleGenAI({ apiKey });
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
  },

  exportToCSV: (data: any[], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + data.map(e => Object.values(e).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
  },

  generateReceipt: async (recordId: string) => {
    const response = await fetch(`/api/society/maintenance/${recordId}/receipt`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  calculatePenalties: async (month: string, year: number) => {
    const response = await fetch('/api/society/maintenance/calculate-penalties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ month, year })
    });
    return handleResponse(response);
  },

  async isMonthLocked(month: string, year: number) {
    const records = await this.getMaintenanceRecords(undefined, month, year);
    return records.length > 0;
  },

  async lockMaintenanceMonth(month: string, year: number, amount: number) {
    return this.generateMonthlyMaintenance(month, year, amount);
  },

  async getExpenses(filters: any = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.month) params.append('month', filters.month.toString());
      if (filters.year) params.append('year', filters.year.toString());
      if (filters.type) params.append('type', filters.type);
      const response = await fetch(`/api/expenses?${params.toString()}`, {
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (e) {
      return [];
    }
  },

  async addExpense(expenseData: any) {
    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(expenseData)
    });
    return handleResponse(response);
  },

  async getExpensePrediction(data: any) {
    try {
      const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on this society utility data: ${JSON.stringify(data)}, predict the next month's total expenditure and give one tip to save cost. Keep it under 20 words.`,
      });
      return response.text || "Stable consumption predicted.";
    } catch (e) {
      return "Unable to generate prediction at this time.";
    }
  },

  async getOccupancyData() {
    const buildings = await this.getBuildings();
    return buildings.map((b: any) => ({
      flatId: `${b.name}-101`, // Mocking some data
      name: 'Resident',
      occupancyType: 'Owner',
      status: 'Active'
    }));
  },

  async calculateMaintenanceWithPenalty(amount: number | string) {
    const base = typeof amount === 'string' ? parseInt(amount) : amount;
    return { total: base + 100 };
  },

  async broadcastNotification(type: string, target: string, title: string) {
    // In a real app, this would trigger external notification services
    console.log(`Broadcasting ${type} to ${target}: ${title}`);
    return { success: true };
  },

  async generateVisitorPass(visitorData: any) {
    const response = await fetch('/api/society/visitors/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(visitorData)
    });
    return handleResponse(response);
  },

  async verifyVisitorPass(passId: string) {
    const response = await fetch(`/api/society/visitors/verify/${passId}`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  async checkInVisitor(passId: string) {
    const response = await fetch(`/api/society/visitors/check-in/${passId}`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  async checkOutVisitor(visitorId: string) {
    const response = await fetch(`/api/society/visitors/check-out/${visitorId}`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  async getActiveVisitors() {
    const response = await fetch('/api/society/visitors/active', {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  async getVisitorHistory(startDate?: string, endDate?: string, search?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (search) params.append('search', search);

    const response = await fetch(`/api/society/visitors/history?${params.toString()}`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  async getVisitorAnalytics() {
    const response = await fetch('/api/society/visitors/analytics', {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  async getLocalityInfo(address?: string) {
    return {
      text: `Saurashtra Residency in Pasodara, Surat, is a premium residential society known for its well-planned infrastructure and community-driven management. Located near Pasodara Lake, it offers a serene environment with excellent connectivity to Surat city via the canal road. The society is equipped with modern amenities including a clubhouse, gym, and landscaped gardens.`,
      sources: [
        { web: { uri: 'https://www.google.com/maps/search/Pasodara+Surat', title: 'Pasodara Neighborhood Map' } }
      ]
    };
  },

  async getPackages() {
    const response = await fetch('/api/society/packages', {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  async logPackage(packageData: any) {
    const response = await fetch('/api/society/packages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(packageData)
    });
    return handleResponse(response);
  },

  async collectPackage(packageId: string) {
    const response = await fetch(`/api/society/packages/${packageId}/collect`, {
      method: 'PATCH',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  }
};

export const audioUtils = {
  playSuccess: () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    audio.play().catch(() => {});
  },
  playError: () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3');
    audio.play().catch(() => {});
  },
  speak: (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  },
  encode: (data: Uint8Array) => {
    return btoa(String.fromCharCode(...data));
  },
  decode: (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  },
  decodeAudioData: async (data: ArrayBuffer, context: AudioContext, sampleRate: number, channels: number) => {
    // This is a simplified version for raw PCM
    const int16 = new Int16Array(data);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;
    
    const buffer = context.createBuffer(channels, float32.length, sampleRate);
    buffer.getChannelData(0).set(float32);
    return buffer;
  }
};
