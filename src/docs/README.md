# MediSync AI - Doctor Dashboard

## Overview

MediSync AI is a comprehensive, AI-powered healthcare management dashboard for doctors. It integrates Gen-AI for intelligent scheduling, patient management, natural language command processing, and real-time health monitoring.

## Features

### 1. **Main Dashboard**
- **Calendar View**: Day/Week/Month toggles with color-coded priority appointments
- **Timeline Panel**: Upcoming appointments with priority badges
- **Overview Cards**: Quick stats (total patients, emergency cases, pending follow-ups)
- **Interactive**: Clickable appointments open patient profiles

### 2. **AI Scheduling Assistant**
- **Smart Recommendations**: AI suggests optimal scheduling based on:
  - Doctor availability
  - Patient urgency
  - Follow-up requirements
  - Historical patterns
- **Conflict Detection**: Identifies overlaps, overbooking, and scheduling gaps
- **Action Controls**: Accept, Edit, or Reject AI suggestions
- **Drag-and-Drop**: Reschedule appointments by dragging to new time slots

### 3. **Patient Management**
- **Patient Profiles**: Comprehensive patient information
- **Medical Documents**: Upload with AI-powered document analysis
- **Health Timeline**: Track vitals, lab results, and device feeds
- **Risk Assessment**: AI-generated risk levels with alerts
- **Search & Filter**: Quick patient lookup

### 4. **NLP Command Interface**
- **Natural Language**: Type commands in plain English
  - "Reschedule John's appointment to Thursday evening"
  - "Mark Priya as urgent"
  - "Find patients with postponed lab results"
- **Command Preview**: See what will happen before execution
- **Confidence Scores**: AI confidence in command interpretation
- **Audit Log**: Full history of executed commands

### 5. **Real-Time Updates**
- **WebSocket Integration**: Live updates for notifications and alerts
- **Push Notifications**: Urgent AI insights and scheduling conflicts
- **Health Monitoring**: Continuous vitals and device feed updates
- **Smart Alerts**: Emergency indicators from document analysis

## Technology Stack

### Frontend
- **React** with TypeScript
- **Tailwind CSS** v4 for styling
- **shadcn/ui** component library
- **Lucide React** for icons
- **Recharts** for data visualization
- **Sonner** for toast notifications

### Backend (Your Implementation)
- **PostgreSQL** database
- **Python** with FastAPI (recommended)
- **OpenAI API** for NLP and AI features
- **WebSocket** for real-time communication
- **JWT** authentication

## Project Structure

```
├── App.tsx                          # Main application component
├── components/
│   ├── AISchedulingAssistant.tsx    # AI suggestion panel
│   ├── AppointmentTimeline.tsx      # Upcoming appointments list
│   ├── CalendarView.tsx             # Calendar with drag-drop
│   ├── NLPCommandInterface.tsx      # Natural language commands
│   ├── NotificationPanel.tsx        # Notification center
│   ├── OverviewCards.tsx            # Dashboard stats cards
│   ├── PatientManagementPanel.tsx   # Patient list
│   ├── PatientProfileSheet.tsx      # Patient detail view
│   └── ui/                          # shadcn/ui components
├── types/
│   └── index.ts                     # TypeScript type definitions
├── lib/
│   ├── api.ts                       # API integration layer
│   └── mockData.ts                  # Sample data
├── docs/
│   ├── API_SPECIFICATION.md         # Complete API contract
│   ├── DATABASE_SCHEMA.md           # PostgreSQL schema
│   ├── INTERACTION_FLOW.md          # Interaction diagrams
│   └── README.md                    # This file
└── styles/
    └── globals.css                  # Global styles & theme
```

## Getting Started

### Frontend Setup

1. The application is already configured and running
2. Mock data is used for demonstration
3. All API calls are stubbed in `/lib/api.ts`

### Backend Integration

To connect your PostgreSQL backend:

1. **Database Setup**
   - Review `/docs/DATABASE_SCHEMA.md`
   - Run the SQL scripts to create tables
   - Set up Row Level Security (RLS) policies
   - Create indexes for performance

2. **API Implementation**
   - Review `/docs/API_SPECIFICATION.md`
   - Implement REST endpoints
   - Add WebSocket support for real-time updates
   - Integrate OpenAI for NLP/AI features

3. **Update Frontend API Calls**
   - Modify `/lib/api.ts` to point to your backend
   - Replace mock data with real API calls
   - Update WebSocket connection URL

Example API update:
```typescript
// In /lib/api.ts, replace:
export async function getAppointments(doctorId, startDate, endDate) {
  await delay(400);
  return mockAppointments;
}

// With:
export async function getAppointments(doctorId, startDate, endDate) {
  const response = await fetch(
    `https://your-backend.com/api/appointments?doctorId=${doctorId}&startDate=${startDate}&endDate=${endDate}`,
    {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      }
    }
  );
  return response.json();
}
```

## Key Features Implementation

### Drag-and-Drop Scheduling

The calendar supports native HTML5 drag-and-drop:

```typescript
// Appointment becomes draggable
<div 
  draggable 
  onDragStart={(e) => e.dataTransfer.setData('appointmentId', apt.id)}
>
  {/* Appointment content */}
</div>

// Time slot accepts drops
<div 
  onDrop={(e) => {
    const appointmentId = e.dataTransfer.getData('appointmentId');
    handleReschedule(appointmentId, newDate, newTime);
  }}
  onDragOver={(e) => e.preventDefault()}
>
  {/* Time slot */}
</div>
```

### AI Suggestion Integration

AI suggestions are fetched and displayed with confidence scores:

```typescript
const suggestions = await getAISuggestions(doctorId, 'pending');

// Each suggestion includes:
{
  patientName: "Priya Sharma",
  suggestedDate: "2025-10-02",
  suggestedStartTime: "16:00",
  reason: "Blood sugar levels showing concerning trends...",
  confidence: 0.92,  // 92% confident
  conflicts: []       // Any detected conflicts
}
```

### NLP Command Processing

Natural language commands are parsed and previewed:

```typescript
const command = await parseNLPCommand(
  "Reschedule John's appointment to Thursday evening",
  doctorId
);

// Returns:
{
  input: "Reschedule John's appointment to Thursday evening",
  parsed: {
    action: "reschedule_appointment",
    entities: {
      patientName: "John",
      newTime: "Thursday evening"
    },
    confidence: 0.85
  },
  preview: "Reschedule John Anderson's appointment to Thursday at 6:00 PM"
}

// User reviews and accepts/rejects
```

### Document AI Analysis

Uploaded documents are analyzed for emergency indicators:

```typescript
const document = await uploadDocument(patientId, file);

// AI analysis result:
{
  fileName: "lab_results.pdf",
  aiFlags: {
    hasEmergencyIndicators: true,
    riskLevel: "high",
    extractedData: {
      troponin: "0.45 ng/mL (elevated)"
    },
    summary: "Cardiac markers elevated. Immediate follow-up recommended."
  }
}
```

## Backend Implementation Guide

### Python FastAPI Example

```python
from fastapi import FastAPI, WebSocket
from sqlalchemy.orm import Session
import openai

app = FastAPI()

@app.get("/api/appointments")
async def get_appointments(doctorId: str, startDate: str, endDate: str, db: Session):
    appointments = db.query(Appointment).filter(
        Appointment.doctor_id == doctorId,
        Appointment.date >= startDate,
        Appointment.date <= endDate
    ).all()
    return appointments

@app.post("/api/nlp/parse")
async def parse_nlp_command(command: str, doctorId: str):
    # Use OpenAI to parse command
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[{
            "role": "system",
            "content": "You are a medical scheduling assistant. Parse commands and extract entities."
        }, {
            "role": "user",
            "content": command
        }]
    )
    
    # Parse response and return structured data
    return {
        "action": "reschedule_appointment",
        "entities": {...},
        "preview": "...",
        "confidence": 0.85
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, doctorId: str):
    await websocket.accept()
    
    # Subscribe to doctor's events
    async for event in subscribe_to_events(doctorId):
        await websocket.send_json({
            "type": event.type,
            "payload": event.data
        })
```

### PostgreSQL Setup

```sql
-- Create main tables
CREATE TABLE doctors (...);
CREATE TABLE patients (...);
CREATE TABLE appointments (...);
CREATE TABLE ai_schedule_suggestions (...);

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY doctor_appointments_policy ON appointments
  FOR ALL
  USING (doctor_id = current_setting('app.current_doctor_id')::UUID);

-- Create conflict detection trigger
CREATE TRIGGER check_appointment_conflicts
AFTER INSERT OR UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION detect_schedule_conflicts();
```

## UI Theme

The application uses a clean healthcare-themed color palette:

- **Primary**: Blue (`#2563eb`) - Trust, medical professionalism
- **Background**: Light gray (`#f8f9fb`) - Clean, clinical feel
- **Emergency**: Red - High-priority alerts
- **Urgent**: Amber - Medium-priority warnings
- **Normal**: Green - Standard appointments
- **Accents**: Light blue tints for highlights

## Accessibility

- ✅ Keyboard navigation support
- ✅ ARIA labels on interactive elements
- ✅ Sufficient color contrast (WCAG AA)
- ✅ Screen reader compatible
- ✅ Focus indicators visible
- ✅ Semantic HTML structure

## Performance Optimizations

- **Lazy Loading**: Documents and images loaded on demand
- **Pagination**: Large lists paginated (50 items/page)
- **Debouncing**: Search inputs debounced (300ms)
- **Caching**: Frequently accessed data cached
- **Code Splitting**: Components loaded as needed
- **Optimistic Updates**: UI updates before API confirms

## Security Considerations

⚠️ **Important**: This is a demonstration application. For production:

1. **HIPAA Compliance**: Ensure backend infrastructure is HIPAA-compliant
2. **No PII in Frontend**: Sensitive data should be encrypted
3. **Secure Authentication**: Use OAuth 2.0 / JWT with refresh tokens
4. **Audit Logging**: Log all data access and modifications
5. **Data Encryption**: Encrypt at rest and in transit
6. **Input Sanitization**: Prevent SQL injection and XSS
7. **Rate Limiting**: Prevent abuse of API endpoints
8. **Session Management**: Secure session handling

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Responsive Design

- **Desktop**: Full-featured experience (1024px+)
- **Tablet**: Optimized layout (768px - 1023px)
- **Mobile**: Essential features (< 768px)

## Example Workflows

### 1. Accepting an AI Suggestion

1. AI analyzes patient data and detects urgent follow-up needed
2. Suggestion appears in AI Scheduling Assistant with reasoning
3. Doctor reviews: patient info, suggested time, confidence score
4. Doctor clicks "Accept"
5. Appointment automatically created
6. Calendar updates in real-time
7. Patient notified (backend responsibility)

### 2. Using NLP Commands

1. Doctor types: "Reschedule John's appointment to Thursday at 3pm"
2. AI parses command and identifies:
   - Action: reschedule_appointment
   - Patient: John Anderson
   - New time: Thursday 3:00 PM
3. Preview shown: "Reschedule John Anderson from Oct 2 at 10:00 AM to Oct 3 at 3:00 PM"
4. Doctor reviews and accepts
5. Appointment updated
6. Audit log created
7. Confirmation shown

### 3. Document Upload with AI Analysis

1. Doctor opens patient profile
2. Uploads lab results PDF
3. Backend performs OCR and AI analysis
4. AI detects elevated cardiac markers
5. Emergency indicator flagged
6. Risk level updated to "high"
7. Urgent notification sent to doctor
8. Suggested: immediate follow-up appointment

## API Integration Checklist

- [ ] Set up PostgreSQL database
- [ ] Implement authentication endpoints
- [ ] Create appointment CRUD endpoints
- [ ] Implement AI suggestion generation
- [ ] Add NLP command parsing (OpenAI integration)
- [ ] Set up document storage (S3/similar)
- [ ] Implement document AI analysis
- [ ] Create WebSocket server for real-time updates
- [ ] Add notification system
- [ ] Implement audit logging
- [ ] Set up Row Level Security
- [ ] Add conflict detection triggers
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerting

## Testing

Recommended testing approach:

```typescript
// Component tests
import { render, screen } from '@testing-library/react';
import { CalendarView } from './components/CalendarView';

test('displays appointments in calendar', () => {
  render(<CalendarView appointments={mockAppointments} />);
  expect(screen.getByText('John Anderson')).toBeInTheDocument();
});

// API tests
test('fetches appointments correctly', async () => {
  const appointments = await getAppointments('doc-001', '2025-10-01', '2025-10-31');
  expect(appointments).toHaveLength(4);
});
```

## Future Enhancements

Potential features for production:

- 📱 Mobile app (React Native)
- 🔔 SMS/Email notifications
- 📊 Advanced analytics dashboard
- 🗣️ Voice commands (speech-to-text)
- 📅 Patient self-scheduling portal
- 💊 Prescription management
- 🔬 Lab result integration
- 📸 Telemedicine video calls
- 📈 Predictive analytics for patient outcomes
- 🌐 Multi-language support

## Support & Documentation

- **API Specification**: `/docs/API_SPECIFICATION.md`
- **Database Schema**: `/docs/DATABASE_SCHEMA.md`
- **Interaction Flows**: `/docs/INTERACTION_FLOW.md`
- **Type Definitions**: `/types/index.ts`

## License

This is a demonstration application. Consult with legal counsel before deploying in a healthcare production environment.

## Contact

For questions about implementation or integration, refer to the documentation files in `/docs/`.

---

**Note**: This application is designed to work hand-in-hand with your PostgreSQL backend. All API endpoints are documented, and the frontend is ready to integrate once your backend is implemented.
