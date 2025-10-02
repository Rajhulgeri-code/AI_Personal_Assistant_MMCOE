/**
 * API Integration Layer
 * 
 * This file provides the API contract for integrating with your PostgreSQL backend.
 * All functions return Promises and use mock data for demonstration.
 * 
 * BACKEND IMPLEMENTATION GUIDE:
 * =============================
 * 
 * 1. Database Schema (PostgreSQL):
 * 
 *    CREATE TABLE doctors (
 *      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *      email VARCHAR(255) UNIQUE NOT NULL,
 *      name VARCHAR(255) NOT NULL,
 *      specialization VARCHAR(255),
 *      avatar_url TEXT,
 *      created_at TIMESTAMP DEFAULT NOW()
 *    );
 * 
 *    CREATE TABLE patients (
 *      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *      name VARCHAR(255) NOT NULL,
 *      age INTEGER,
 *      gender VARCHAR(20),
 *      condition VARCHAR(255),
 *      condition_summary TEXT,
 *      last_visit DATE,
 *      next_visit DATE,
 *      risk_level VARCHAR(20),
 *      phone VARCHAR(50),
 *      email VARCHAR(255),
 *      blood_type VARCHAR(10),
 *      allergies TEXT[],
 *      medications TEXT[],
 *      created_at TIMESTAMP DEFAULT NOW()
 *    );
 * 
 *    CREATE TABLE appointments (
 *      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *      patient_id UUID REFERENCES patients(id),
 *      doctor_id UUID REFERENCES doctors(id),
 *      date DATE NOT NULL,
 *      start_time TIME NOT NULL,
 *      end_time TIME NOT NULL,
 *      priority VARCHAR(20),
 *      status VARCHAR(20),
 *      type VARCHAR(50),
 *      notes TEXT,
 *      location VARCHAR(100),
 *      created_at TIMESTAMP DEFAULT NOW(),
 *      updated_at TIMESTAMP DEFAULT NOW()
 *    );
 * 
 *    CREATE TABLE ai_schedule_suggestions (
 *      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *      doctor_id UUID REFERENCES doctors(id),
 *      patient_id UUID REFERENCES patients(id),
 *      suggested_date DATE,
 *      suggested_start_time TIME,
 *      suggested_end_time TIME,
 *      priority VARCHAR(20),
 *      reason TEXT,
 *      confidence DECIMAL(3,2),
 *      status VARCHAR(20) DEFAULT 'pending',
 *      conflicts TEXT[],
 *      created_at TIMESTAMP DEFAULT NOW()
 *    );
 * 
 *    CREATE TABLE notifications (
 *      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *      doctor_id UUID REFERENCES doctors(id),
 *      type VARCHAR(20),
 *      title VARCHAR(255),
 *      message TEXT,
 *      read BOOLEAN DEFAULT FALSE,
 *      actionable BOOLEAN DEFAULT FALSE,
 *      action_link TEXT,
 *      related_patient_id UUID REFERENCES patients(id),
 *      related_appointment_id UUID REFERENCES appointments(id),
 *      created_at TIMESTAMP DEFAULT NOW()
 *    );
 * 
 *    CREATE TABLE nlp_commands (
 *      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *      doctor_id UUID REFERENCES doctors(id),
 *      input TEXT NOT NULL,
 *      parsed_action VARCHAR(100),
 *      parsed_entities JSONB,
 *      confidence DECIMAL(3,2),
 *      preview TEXT,
 *      status VARCHAR(20) DEFAULT 'pending',
 *      accepted_by UUID REFERENCES doctors(id),
 *      accepted_at TIMESTAMP,
 *      created_at TIMESTAMP DEFAULT NOW()
 *    );
 * 
 *    CREATE TABLE medical_documents (
 *      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *      patient_id UUID REFERENCES patients(id),
 *      file_name VARCHAR(255),
 *      file_type VARCHAR(50),
 *      file_url TEXT,
 *      file_size BIGINT,
 *      ai_flags JSONB,
 *      uploaded_at TIMESTAMP DEFAULT NOW()
 *    );
 * 
 *    CREATE TABLE audit_log (
 *      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *      doctor_id UUID REFERENCES doctors(id),
 *      action VARCHAR(100),
 *      details TEXT,
 *      source_type VARCHAR(20),
 *      source_id UUID,
 *      created_at TIMESTAMP DEFAULT NOW()
 *    );
 * 
 * 2. REST API Endpoints:
 * 
 *    Authentication:
 *    POST   /api/auth/login
 *    POST   /api/auth/logout
 *    GET    /api/auth/me
 * 
 *    Dashboard:
 *    GET    /api/dashboard/stats?doctorId={id}
 *    GET    /api/appointments?doctorId={id}&startDate={date}&endDate={date}
 *    GET    /api/patients?doctorId={id}
 * 
 *    Appointments:
 *    GET    /api/appointments/{id}
 *    POST   /api/appointments
 *    PUT    /api/appointments/{id}
 *    DELETE /api/appointments/{id}
 * 
 *    AI Suggestions:
 *    GET    /api/ai-suggestions?doctorId={id}&status={status}
 *    PUT    /api/ai-suggestions/{id}/accept
 *    PUT    /api/ai-suggestions/{id}/reject
 * 
 *    Patients:
 *    GET    /api/patients/{id}
 *    POST   /api/patients
 *    PUT    /api/patients/{id}
 * 
 *    Documents:
 *    GET    /api/patients/{patientId}/documents
 *    POST   /api/patients/{patientId}/documents/upload
 *    GET    /api/documents/{id}
 * 
 *    NLP Commands:
 *    POST   /api/nlp/parse
 *    POST   /api/nlp/execute
 *    GET    /api/nlp/audit-log?doctorId={id}
 * 
 *    Notifications:
 *    GET    /api/notifications?doctorId={id}
 *    PUT    /api/notifications/{id}/read
 * 
 * 3. WebSocket Events (for real-time updates):
 * 
 *    Connect to: ws://your-backend/ws?doctorId={id}
 * 
 *    Server -> Client events:
 *    - notification.new: New notification
 *    - appointment.updated: Appointment changed
 *    - ai.suggestion: New AI suggestion
 *    - health.alert: Critical patient alert
 *    - schedule.conflict: Schedule conflict detected
 * 
 * 4. Python Backend Example (FastAPI):
 * 
 *    from fastapi import FastAPI, WebSocket
 *    from sqlalchemy.orm import Session
 *    import openai  # or your Gen-AI library
 * 
 *    @app.get("/api/appointments")
 *    async def get_appointments(doctorId: str, db: Session):
 *        appointments = db.query(Appointment).filter(
 *            Appointment.doctor_id == doctorId
 *        ).all()
 *        return appointments
 * 
 *    @app.post("/api/nlp/parse")
 *    async def parse_nlp_command(command: str, doctorId: str):
 *        # Use OpenAI or custom NLP model
 *        response = openai.chat.completions.create(
 *            model="gpt-4",
 *            messages=[{
 *                "role": "system",
 *                "content": "Parse medical scheduling commands..."
 *            }, {
 *                "role": "user",
 *                "content": command
 *            }]
 *        )
 *        # Return parsed entities and preview
 *        return {
 *            "action": "reschedule",
 *            "entities": {...},
 *            "preview": "..."
 *        }
 */

import {
  Appointment,
  Patient,
  AIScheduleSuggestion,
  Notification,
  DashboardStats,
  NLPCommand,
  MedicalDocument,
  HealthReviewEvent,
  ScheduleConflict,
  AuditLogEntry,
  Doctor,
} from '../types';

// ============================================================================
// CONFIGURATION - UPDATE WITH YOUR BACKEND URL
// ============================================================================

// TODO: Update this URL to your backend API endpoint
// For local development: 'http://localhost:8000/api'
// For production: 'https://your-backend.com/api'
const API_BASE_URL = 'http://localhost:8000/api';

// Helper to get auth token
const getAuthToken = (): string => {
  return localStorage.getItem('authToken') || '';
};

// Helper to make authenticated requests
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

// ============================================================================
// AUTHENTICATION APIs
// ============================================================================

export async function login(email: string, password: string): Promise<{ token: string; doctor: Doctor }> {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentDoctor(): Promise<Doctor> {
  return apiRequest('/auth/me');
}

export async function logout(): Promise<void> {
  await apiRequest('/auth/logout', { method: 'POST' });
  localStorage.removeItem('authToken');
}

// ============================================================================
// DASHBOARD APIs
// ============================================================================

export async function getDashboardStats(doctorId: string): Promise<DashboardStats> {
  return apiRequest(`/dashboard/stats?doctorId=${doctorId}`);
}

// ============================================================================
// APPOINTMENT APIs
// ============================================================================

export async function getAppointments(
  doctorId: string,
  startDate: string,
  endDate: string
): Promise<Appointment[]> {
  return apiRequest(`/appointments?doctorId=${doctorId}&startDate=${startDate}&endDate=${endDate}`);
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  return apiRequest(`/appointments/${id}`);
}

export async function createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
  return apiRequest('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointment),
  });
}

export async function updateAppointment(
  id: string,
  updates: Partial<Appointment>
): Promise<Appointment> {
  return apiRequest(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteAppointment(id: string): Promise<void> {
  return apiRequest(`/appointments/${id}`, { method: 'DELETE' });
}

// ============================================================================
// PATIENT APIs
// ============================================================================

export async function getPatients(doctorId: string): Promise<Patient[]> {
  return apiRequest(`/patients?doctorId=${doctorId}`);
}

export async function getPatientById(id: string): Promise<Patient | null> {
  return apiRequest(`/patients/${id}`);
}

export async function createPatient(patient: Omit<Patient, 'id'>): Promise<Patient> {
  return apiRequest('/patients', {
    method: 'POST',
    body: JSON.stringify(patient),
  });
}

export async function updatePatient(
  id: string,
  updates: Partial<Patient>
): Promise<Patient> {
  return apiRequest(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// ============================================================================
// AI SCHEDULING APIs
// ============================================================================

export async function getAISuggestions(
  doctorId: string,
  status?: string
): Promise<AIScheduleSuggestion[]> {
  const query = status ? `?doctorId=${doctorId}&status=${status}` : `?doctorId=${doctorId}`;
  return apiRequest(`/ai-suggestions${query}`);
}

export async function acceptAISuggestion(id: string): Promise<AIScheduleSuggestion> {
  return apiRequest(`/ai-suggestions/${id}/accept`, { method: 'PUT' });
}

export async function rejectAISuggestion(id: string): Promise<AIScheduleSuggestion> {
  return apiRequest(`/ai-suggestions/${id}/reject`, { method: 'PUT' });
}

export async function getScheduleConflicts(doctorId: string): Promise<ScheduleConflict[]> {
  return apiRequest(`/schedule-conflicts?doctorId=${doctorId}`);
}

// ============================================================================
// DOCUMENT APIs
// ============================================================================

export async function getPatientDocuments(patientId: string): Promise<MedicalDocument[]> {
  return apiRequest(`/patients/${patientId}/documents`);
}

export async function uploadDocument(
  patientId: string,
  file: File
): Promise<MedicalDocument> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/documents/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Document upload failed');
  }

  return response.json();
}

// ============================================================================
// NLP APIs
// ============================================================================

export async function parseNLPCommand(
  command: string,
  doctorId: string
): Promise<NLPCommand> {
  return apiRequest('/nlp/parse', {
    method: 'POST',
    body: JSON.stringify({ command, doctorId }),
  });
}

export async function executeNLPCommand(commandId: string): Promise<void> {
  return apiRequest('/nlp/execute', {
    method: 'POST',
    body: JSON.stringify({ commandId }),
  });
}

export async function getAuditLog(doctorId: string): Promise<AuditLogEntry[]> {
  return apiRequest(`/nlp/audit-log?doctorId=${doctorId}`);
}

// ============================================================================
// NOTIFICATION APIs
// ============================================================================

export async function getNotifications(doctorId: string): Promise<Notification[]> {
  return apiRequest(`/notifications?doctorId=${doctorId}`);
}

export async function markNotificationAsRead(id: string): Promise<void> {
  return apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
}

// ============================================================================
// REAL-TIME APIs (WebSocket)
// ============================================================================

export interface WebSocketMessage {
  type: string;
  payload: any;
}

export function connectToRealtimeUpdates(
  doctorId: string,
  onMessage: (message: WebSocketMessage) => void
): () => void {
  // In real implementation, connect to WebSocket
  // ws://your-backend/ws?doctorId={doctorId}
  
  console.log(`[WebSocket] Connecting for doctor: ${doctorId}`);
  
  // Simulate periodic updates
  const interval = setInterval(() => {
    // Randomly send mock real-time events
    const eventTypes = [
      'notification.new',
      'appointment.updated',
      'ai.suggestion',
      'health.alert',
    ];
    
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    onMessage({
      type: randomEvent,
      payload: {
        timestamp: new Date().toISOString(),
        data: {},
      },
    });
  }, 30000); // Every 30 seconds

  // Return cleanup function
  return () => {
    console.log('[WebSocket] Disconnecting');
    clearInterval(interval);
  };
}

// ============================================================================
// HEALTH REVIEW APIs
// ============================================================================

export async function getHealthReviewEvents(patientId: string): Promise<HealthReviewEvent[]> {
  return apiRequest(`/patients/${patientId}/health-events`);
}

// ============================================================================
// DOCTOR PREFERENCES APIs
// ============================================================================

export async function getDoctorPreferences(doctorId: string): Promise<any> {
  return apiRequest(`/doctors/${doctorId}/preferences`);
}

export async function saveDoctorPreferences(doctorId: string, preferences: any): Promise<void> {
  return apiRequest(`/doctors/${doctorId}/preferences`, {
    method: 'PUT',
    body: JSON.stringify(preferences),
  });
}
