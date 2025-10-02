# MediSync AI - API Specification

## Overview

This document provides the complete API contract for integrating the MediSync AI frontend with your PostgreSQL backend.

## Base URL

```
https://your-backend-domain.com/api
```

## Authentication

All API requests require authentication using JWT tokens or session cookies.

```http
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### POST /auth/login

Login a doctor.

**Request Body:**
```json
{
  "email": "doctor@hospital.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "doctor": {
    "id": "uuid",
    "name": "Dr. Sarah Mitchell",
    "email": "doctor@hospital.com",
    "specialization": "Internal Medicine"
  }
}
```

### POST /auth/logout

Logout current doctor.

### GET /auth/me

Get current authenticated doctor.

---

## Dashboard Endpoints

### GET /dashboard/stats

Get dashboard statistics for a doctor.

**Query Parameters:**
- `doctorId` (required): Doctor's UUID

**Response:**
```json
{
  "totalPatientsToday": 4,
  "emergencyCases": 1,
  "pendingFollowUps": 6,
  "completedAppointments": 0,
  "upcomingAppointments": 4,
  "aiSuggestionsPending": 3
}
```

---

## Appointment Endpoints

### GET /appointments

Get appointments for a doctor within a date range.

**Query Parameters:**
- `doctorId` (required): Doctor's UUID
- `startDate` (required): ISO date string (YYYY-MM-DD)
- `endDate` (required): ISO date string (YYYY-MM-DD)
- `status` (optional): Filter by status

**Response:**
```json
[
  {
    "id": "uuid",
    "patientId": "uuid",
    "patientName": "John Anderson",
    "doctorId": "uuid",
    "date": "2025-10-02",
    "startTime": "09:00",
    "endTime": "09:30",
    "priority": "urgent",
    "status": "scheduled",
    "type": "Follow-up",
    "notes": "Review insulin dosage",
    "location": "Room 203"
  }
]
```

### GET /appointments/{id}

Get a specific appointment.

**Response:**
```json
{
  "id": "uuid",
  "patientId": "uuid",
  "patientName": "John Anderson",
  ...
}
```

### POST /appointments

Create a new appointment.

**Request Body:**
```json
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "date": "2025-10-05",
  "startTime": "14:00",
  "endTime": "14:30",
  "priority": "normal",
  "type": "Consultation",
  "notes": "Annual checkup",
  "location": "Room 203"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "scheduled",
  ...
}
```

### PUT /appointments/{id}

Update an existing appointment.

**Request Body:**
```json
{
  "date": "2025-10-06",
  "startTime": "10:00",
  "endTime": "10:30",
  "notes": "Rescheduled per patient request"
}
```

### DELETE /appointments/{id}

Cancel an appointment.

---

## Patient Endpoints

### GET /patients

Get all patients for a doctor.

**Query Parameters:**
- `doctorId` (required): Doctor's UUID
- `search` (optional): Search query
- `riskLevel` (optional): Filter by risk level

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Anderson",
    "age": 45,
    "gender": "male",
    "condition": "Hypertension",
    "conditionSummary": "Stage 2 hypertension...",
    "lastVisit": "2025-09-28",
    "nextVisit": "2025-10-05",
    "riskLevel": "medium",
    "phone": "+1-555-0101",
    "email": "j.anderson@email.com",
    "bloodType": "A+",
    "allergies": ["Penicillin"],
    "medications": ["Lisinopril 10mg"]
  }
]
```

### GET /patients/{id}

Get a specific patient.

### POST /patients

Create a new patient record.

### PUT /patients/{id}

Update patient information.

---

## AI Scheduling Endpoints

### GET /ai-suggestions

Get AI scheduling suggestions.

**Query Parameters:**
- `doctorId` (required): Doctor's UUID
- `status` (optional): pending | accepted | rejected

**Response:**
```json
[
  {
    "id": "uuid",
    "doctorId": "uuid",
    "patientId": "uuid",
    "patientName": "Priya Sharma",
    "suggestedDate": "2025-10-02",
    "suggestedStartTime": "16:00",
    "suggestedEndTime": "16:30",
    "priority": "urgent",
    "reason": "Blood sugar levels showing concerning trends...",
    "confidence": 0.92,
    "status": "pending",
    "conflicts": [],
    "createdAt": "2025-10-02T08:00:00Z"
  }
]
```

### PUT /ai-suggestions/{id}/accept

Accept an AI suggestion and create appointment.

**Response:**
```json
{
  "suggestion": {...},
  "appointment": {...}
}
```

### PUT /ai-suggestions/{id}/reject

Reject an AI suggestion.

### GET /schedule-conflicts

Get detected schedule conflicts.

**Query Parameters:**
- `doctorId` (required): Doctor's UUID

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "overlap",
    "appointments": ["uuid1", "uuid2"],
    "description": "Appointments overlap by 15 minutes",
    "suggestedResolution": "Move second appointment to 2:00 PM",
    "severity": "medium"
  }
]
```

---

## Document Management Endpoints

### GET /patients/{patientId}/documents

Get all documents for a patient.

**Response:**
```json
[
  {
    "id": "uuid",
    "patientId": "uuid",
    "fileName": "lab_results.pdf",
    "fileType": "pdf",
    "uploadDate": "2025-10-02T08:00:00Z",
    "size": 245678,
    "url": "https://storage.../lab_results.pdf",
    "aiFlags": {
      "hasEmergencyIndicators": true,
      "riskLevel": "high",
      "extractedData": {
        "troponin": "0.45 ng/mL (elevated)"
      },
      "summary": "Cardiac markers elevated..."
    }
  }
]
```

### POST /patients/{patientId}/documents/upload

Upload a medical document.

**Request:**
- Content-Type: multipart/form-data
- Body: file (PDF, JPG, PNG)

**Response:**
```json
{
  "id": "uuid",
  "fileName": "lab_results.pdf",
  "aiFlags": {...},
  "processingTime": 1234
}
```

### GET /documents/{id}

Download a specific document.

---

## NLP Command Endpoints

### POST /nlp/parse

Parse a natural language command.

**Request Body:**
```json
{
  "command": "Reschedule John's appointment to Thursday evening",
  "doctorId": "uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "input": "Reschedule John's appointment to Thursday evening",
  "parsed": {
    "action": "reschedule_appointment",
    "entities": {
      "patientName": "John",
      "newTime": "Thursday evening"
    },
    "confidence": 0.85
  },
  "preview": "Reschedule John Anderson's appointment to Thursday at 6:00 PM",
  "status": "pending"
}
```

### POST /nlp/execute

Execute a parsed NLP command.

**Request Body:**
```json
{
  "commandId": "uuid",
  "doctorId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "changes": {
    "appointmentUpdated": "uuid",
    "oldDate": "2025-10-02",
    "newDate": "2025-10-03"
  }
}
```

### GET /nlp/audit-log

Get audit log of NLP commands.

**Query Parameters:**
- `doctorId` (required): Doctor's UUID
- `limit` (optional): Number of entries (default: 50)

**Response:**
```json
[
  {
    "id": "uuid",
    "doctorId": "uuid",
    "action": "reschedule_appointment",
    "details": "Rescheduled John Anderson from 10:00 to 14:00",
    "timestamp": "2025-10-02T09:00:00Z",
    "sourceType": "nlp",
    "sourceId": "uuid"
  }
]
```

---

## Notification Endpoints

### GET /notifications

Get notifications for a doctor.

**Query Parameters:**
- `doctorId` (required): Doctor's UUID
- `unreadOnly` (optional): boolean

**Response:**
```json
[
  {
    "id": "uuid",
    "doctorId": "uuid",
    "type": "urgent",
    "title": "Emergency Appointment",
    "message": "Emma Williams reporting chest pain",
    "timestamp": "2025-10-02T08:45:00Z",
    "read": false,
    "actionable": true,
    "actionLink": "/appointments/uuid",
    "relatedPatientId": "uuid",
    "relatedAppointmentId": "uuid"
  }
]
```

### PUT /notifications/{id}/read

Mark notification as read.

---

## Health Review Endpoints

### GET /patients/{patientId}/health-events

Get health review events for a patient.

**Response:**
```json
[
  {
    "id": "uuid",
    "patientId": "uuid",
    "timestamp": "2025-10-02T08:15:00Z",
    "type": "device-feed",
    "data": {
      "heartRate": 98,
      "bloodPressure": "145/92"
    },
    "aiInsight": "Blood pressure elevated above baseline",
    "flagged": true
  }
]
```

---

## WebSocket Events

Connect to WebSocket for real-time updates:

```
ws://your-backend-domain.com/ws?doctorId={uuid}
```

### Server → Client Events

**notification.new**
```json
{
  "type": "notification.new",
  "payload": {
    "notification": {...}
  }
}
```

**appointment.updated**
```json
{
  "type": "appointment.updated",
  "payload": {
    "appointment": {...}
  }
}
```

**ai.suggestion**
```json
{
  "type": "ai.suggestion",
  "payload": {
    "suggestion": {...}
  }
}
```

**health.alert**
```json
{
  "type": "health.alert",
  "payload": {
    "patientId": "uuid",
    "severity": "high",
    "message": "Critical vital signs detected"
  }
}
```

**schedule.conflict**
```json
{
  "type": "schedule.conflict",
  "payload": {
    "conflict": {...}
  }
}
```

---

## Error Responses

All endpoints may return these error formats:

**400 Bad Request**
```json
{
  "error": "validation_error",
  "message": "Invalid date format",
  "field": "date"
}
```

**401 Unauthorized**
```json
{
  "error": "unauthorized",
  "message": "Invalid or expired token"
}
```

**403 Forbidden**
```json
{
  "error": "forbidden",
  "message": "Access denied to this resource"
}
```

**404 Not Found**
```json
{
  "error": "not_found",
  "message": "Appointment not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "internal_error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- Standard endpoints: 100 requests per minute per doctor
- AI/NLP endpoints: 20 requests per minute per doctor
- Document upload: 10 uploads per minute per doctor

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1633024800
```

---

## Pagination

For endpoints returning lists, use standard pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)

**Response Headers:**
```
X-Total-Count: 150
X-Page: 1
X-Per-Page: 50
Link: <url?page=2>; rel="next"
```
