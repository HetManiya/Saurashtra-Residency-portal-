
export type Language = 'en' | 'gu' | 'hi';

export enum FlatType {
  BHK1 = '1BHK',
  BHK2 = '2BHK'
}

export enum OccupancyType {
  OWNER = 'Owner',
  TENANT = 'Tenant'
}

export enum PaymentStatus {
  PAID = 'Paid',
  PENDING = 'Pending',
  OVERDUE = 'Overdue'
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: 'HOF' | 'Spouse' | 'Child' | 'Parent' | 'Other';
  phone: string;
  dob: string;
  profession: string;
}

export interface Flat {
  id: string;
  unitNumber: string;
  occupancyType: OccupancyType;
  members: FamilyMember[];
}

export interface WingCommittee {
  president: CommitteeMember;
  vicePresident: CommitteeMember;
  treasurer: CommitteeMember;
}

export interface Building {
  id: string;
  name: string;
  type: FlatType;
  totalFloors: number;
  flatsPerFloor: number;
  hasLift: boolean;
  parkingSpots: number;
  flats?: Flat[];
  wingCommittee?: WingCommittee;
}

export interface AmenityBooking {
  id: string;
  facilityId: number;
  userName: string;
  unitNumber: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendees: number;
  isPublic: boolean;
  status: 'Confirmed' | 'Pending';
}

export interface Builder {
  name: string;
  founded: string;
  projects: string[];
  vision: string;
  logo: string;
  phone: string;
  email: string;
}

export interface MaintenanceRecord {
  id: string;
  flatId: string;
  month: string;
  year: number;
  amount: number;
  status: PaymentStatus;
  occupancyType: OccupancyType;
  paidDate?: string;
  lastReminderSent?: string;
}

export interface FundRecord {
  id: string;
  purpose: string;
  date: string;
  totalCollected: number;
  targetAmount: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'Urgent' | 'General' | 'Event';
}

export interface CommitteeMember {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  imageUrl: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  details: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: 'General' | 'Urgent' | 'Celebration';
  rsvps: string[]; // Array of user IDs/Flat IDs
  createdBy: string;
}
