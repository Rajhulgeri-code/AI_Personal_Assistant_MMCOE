// Core type definitions for the Doctor Dashboard

export type Priority = 'emergency' | 'urgent' | 'normal';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';
export type CalendarView = 'day' | 'week' | 'month';
export type RiskLevel = 'high' | 'medium' | 'low' | 'none';
export type ActionStatus = 'pending' | 'accepted' | 'rejected';

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  avatar?: string;
  phone?: string;
  hasCompletedSetup?: boolean;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  condition: string;
  conditionSummary: string;
  lastVisit: string;
  nextVisit: string | null;
  riskLevel: RiskLevel;
  phone: string;
  email: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  avatar?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  priority: Priority;
  status: AppointmentStatus;
  type: string; // e.g., "Consultation", "Follow-up", "Emergency"
  notes?: string;
  location?: string;
}

export interface AIScheduleSuggestion {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  suggestedDate: string;
  suggestedStartTime: string;
  suggestedEndTime: string;
  priority: Priority;
  reason: string; // AI explanation for the suggestion
  confidence: number; // 0-1
  status: ActionStatus;
  conflicts?: string[];
  createdAt: string;
}

export interface MedicalDocument {
  id: string;
  patientId: string;
  fileName: string;
  fileType: string; // 'pdf' | 'image' | 'lab-result' etc.
  uploadDate: string;
  size: number;
  url: string;
  aiFlags?: {
    hasEmergencyIndicators: boolean;
    riskLevel: RiskLevel;
    extractedData?: Record<string, any>;
    summary?: string;
  };
}

export interface HealthReviewEvent {
  id: string;
  patientId: string;
  timestamp: string;
  type: 'vital' | 'note' | 'lab-result' | 'device-feed';
  data: Record<string, any>;
  aiInsight?: string;
  flagged: boolean;
}

export interface Notification {
  id: string;
  doctorId: string;
  type: 'urgent' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  actionLink?: string;
  relatedPatientId?: string;
  relatedAppointmentId?: string;
}

export interface NLPCommand {
  id: string;
  doctorId: string;
  input: string;
  timestamp: string;
  parsed: {
    action: string;
    entities: Record<string, any>;
    confidence: number;
  };
  preview?: string; // Human-readable preview of what will happen
  status: ActionStatus;
  acceptedBy?: string;
  acceptedAt?: string;
}

export interface DashboardStats {
  totalPatientsToday: number;
  emergencyCases: number;
  pendingFollowUps: number;
  completedAppointments: number;
  upcomingAppointments: number;
  aiSuggestionsPending: number;
}

export interface ScheduleConflict {
  id: string;
  type: 'overlap' | 'overbook' | 'double-booking' | 'gap-too-small';
  appointments: string[]; // appointment IDs involved
  description: string;
  suggestedResolution?: string;
  severity: 'high' | 'medium' | 'low';
}

export interface AuditLogEntry {
  id: string;
  doctorId: string;
  action: string;
  details: string;
  timestamp: string;
  sourceType: 'manual' | 'nlp' | 'ai-suggestion';
  sourceId?: string;
}
