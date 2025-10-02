
# MediSync AI - Integration Guide

## 🚀 Quick Start

All hardcoded data has been removed. The application now integrates with your backend through clear API contracts and AI model integration points.

## 📁 Key Files for Integration

### 1. **AI Model Integration** (`/services/aiModel.ts`)
This is where you connect your Python AI scheduling model.

**Your AI Model Should:**
- Accept doctor preferences (working hours, constraints, priorities)
- Analyze patient data and urgency
- Generate optimal appointment suggestions
- Detect scheduling conflicts
- Process natural language commands

**Integration Example:**
```typescript
// In /services/aiModel.ts
export async function generateAIScheduleSuggestions(
  preferences: DoctorPreferences,
  currentAppointments: Appointment[],
  pendingPatients: Patient[]
): Promise<AIScheduleSuggestion[]> {
  // REPLACE THIS with your actual backend call
  const response = await fetch('http://your-backend.com/api/ai/generate-suggestions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      preferences,
      currentAppointments,
      pendingPatients,
    }),
  });
  
  return response.json();
}
```

### 2. **Backend API Integration** (`/lib/api.ts`)
All API calls are stubbed out with clear contracts.

**Update the base URL:**
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
```

**All functions are ready to connect to your PostgreSQL backend:**
- `getDashboardStats()` - Get doctor's dashboard statistics
- `getAppointments()` - Fetch appointments from database
- `getPatients()` - Fetch patient list
- `createAppointment()` - Create new appointment
- `uploadDocument()` - Upload medical document for AI analysis
- etc.

### 3. **Doctor Settings Panel** (`/components/DoctorSettingsPanel.tsx`)
This is the UI where doctors input their preferences to train your AI model.

**Data Collected:**
- Working hours for each day of the week
- Maximum patients per day
- Consultation durations (normal vs emergency)
- Break times
- Buffer between appointments
- AI behavior preferences

**Flow:**
1. Doctor fills out preferences
2. Frontend sends to `/api/doctors/{id}/preferences`
3. Backend saves to PostgreSQL
4. Backend triggers AI model training/configuration
5. AI model uses these preferences for all future suggestions

## 🔧 Setup Steps

### Step 1: Configure Environment Variables

Create a `.env` file:
```env
REACT_APP_API_URL=http://your-backend.com/api
REACT_APP_AI_MODEL_URL=http://your-ai-service.com/api/ai
```

### Step 2: Backend Setup (Python FastAPI Example)

```python
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import your_ai_model  # Your ML scheduling model

app = FastAPI()

@app.post("/api/ai/generate-suggestions")
async def generate_suggestions(
    preferences: DoctorPreferences,
    current_appointments: list,
    pending_patients: list,
    db: Session = Depends(get_db)
):
    """
    Your AI model logic here
    1. Load doctor preferences
    2. Analyze current schedule
    3. Consider patient priorities
    4. Generate optimal suggestions
    """
    suggestions = your_ai_model.schedule(
        doctor_prefs=preferences.dict(),
        appointments=current_appointments,
        patients=pending_patients
    )
    
    # Save suggestions to database
    for suggestion in suggestions:
        db.add(AIScheduleSuggestion(**suggestion))
    db.commit()
    
    return suggestions

@app.post("/api/nlp/parse")
async def parse_nlp_command(command: str, doctor_id: str):
    """
    Use OpenAI or your custom NLP model
    """
    import openai
    
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[{
            "role": "system",
            "content": "Parse medical scheduling commands..."
        }, {
            "role": "user",
            "content": command
        }]
    )
    
    # Extract structured data from response
    parsed = extract_entities(response.choices[0].message.content)
    
    return {
        "action": parsed.action,
        "entities": parsed.entities,
        "confidence": parsed.confidence,
        "preview": generate_preview(parsed)
    }
```

### Step 3: Database Setup

Use the schema from `/docs/DATABASE_SCHEMA.md`:

```sql
-- Create tables
CREATE TABLE doctors (...);
CREATE TABLE patients (...);
CREATE TABLE appointments (...);
CREATE TABLE ai_schedule_suggestions (...);

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY doctor_appointments_policy ON appointments
  FOR ALL USING (doctor_id = current_setting('app.current_doctor_id')::UUID);
```

### Step 4: AI Model Integration

Your AI model should accept this data structure:

```python
class DoctorPreferences:
    doctor_id: str
    working_hours: dict  # e.g., {"monday": {"start": "09:00", "end": "17:00", "enabled": True}}
    constraints: dict
    ai_preferences: dict

def generate_schedule(doctor_prefs, appointments, patients):
    """
    Your ML model logic
    - Consider urgency scores
    - Respect working hours
    - Optimize for minimal wait time
    - Balance workload across days
    """
    # Example: Rule-based + ML hybrid approach
    urgent_patients = [p for p in patients if p.risk_level == 'high']
    
    suggestions = []
    for patient in urgent_patients:
        optimal_slot = find_optimal_slot(
            doctor_prefs.working_hours,
            current_schedule=appointments,
            patient_priority=patient.risk_level
        )
        
        confidence = calculate_confidence(optimal_slot, patient)
        
        suggestions.append({
            'patient_id': patient.id,
            'suggested_date': optimal_slot.date,
            'suggested_time': optimal_slot.time,
            'confidence': confidence,
            'reason': f"Urgent case detected. {patient.condition} requires immediate attention."
        })
    
    return suggestions
```

## 🎯 Data Flow

### Doctor Onboarding Flow:
```
1. Doctor logs in → getCurrentDoctor()
2. Check if hasCompletedSetup
3. If No → Show DoctorSettingsPanel
4. Doctor fills preferences → saveDoctorPreferences()
5. Backend saves to PostgreSQL
6. Backend configures AI model with preferences
7. Dashboard loads with AI-powered suggestions
```

### AI Suggestion Generation Flow:
```
1. Frontend: Doctor preferences + current appointments + pending patients
   ↓
2. POST /api/ai/generate-suggestions
   ↓
3. Your Python Backend:
   - Loads data from PostgreSQL
   - Calls your AI model
   - AI analyzes and generates suggestions
   ↓
4. Backend saves suggestions to database
   ↓
5. Frontend displays suggestions in AISchedulingAssistant
   ↓
6. Doctor accepts/rejects
   ↓
7. If accepted → Create appointment in database
```

### NLP Command Flow:
```
1. Doctor types: "Reschedule John's appointment to Thursday 3pm"
   ↓
2. POST /api/nlp/parse
   ↓
3. Backend calls OpenAI/NLP model
   ↓
4. Returns: {
     action: "reschedule_appointment",
     entities: { patient: "John Anderson", newTime: "Thursday 3pm" },
     confidence: 0.92
   }
   ↓
5. Frontend shows preview
   ↓
6. Doctor accepts → POST /api/nlp/execute
   ↓
7. Backend updates database
```

## 🔌 API Endpoints to Implement

See `/docs/API_SPECIFICATION.md` for full details.

**Critical Endpoints:**

1. **Authentication:**
   - `POST /api/auth/login`
   - `GET /api/auth/me`

2. **Doctor Preferences:**
   - `GET /api/doctors/{id}/preferences`
   - `PUT /api/doctors/{id}/preferences`

3. **AI Model:**
   - `POST /api/ai/generate-suggestions`
   - `POST /api/ai/detect-conflicts`
   - `POST /api/ai/parse-command`

4. **CRUD Operations:**
   - Appointments (GET, POST, PUT, DELETE)
   - Patients (GET, POST, PUT)
   - Documents (GET, POST)

## 🧪 Testing Your Integration

### 1. Test Doctor Setup
```bash
# Create a test doctor in your database
curl -X POST http://localhost:8000/api/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@doctor.com",
    "password": "testpass",
    "name": "Dr. Test",
    "specialization": "Internal Medicine"
  }'
```

### 2. Test AI Suggestions
```bash
# Generate AI suggestions
curl -X POST http://localhost:8000/api/ai/generate-suggestions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "preferences": {...},
    "currentAppointments": [],
    "pendingPatients": [...]
  }'
```

### 3. Test NLP Command
```bash
# Parse natural language
curl -X POST http://localhost:8000/api/nlp/parse \
  -H "Content-Type: application/json" \
  -d '{
    "command": "Schedule Emma for tomorrow at 2pm",
    "doctorId": "doctor-id-here"
  }'
```

## 📊 Monitoring Your AI Model

Add logging to track:
- Suggestion acceptance rate
- Average confidence scores
- Command parsing accuracy
- User feedback on AI suggestions

```python
# In your backend
import logging

logging.info(f"AI Suggestion generated: confidence={confidence}, patient={patient_id}")
logging.info(f"Suggestion accepted: id={suggestion_id}, doctor={doctor_id}")
logging.info(f"NLP Command parsed: action={action}, confidence={conf}")
```

## 🎨 Customization

### Change AI Behavior
Edit `/services/aiModel.ts` to customize how AI suggestions are generated.

### Add New Preferences
1. Update `DoctorPreferences` interface in `/services/aiModel.ts`
2. Add UI fields in `/components/DoctorSettingsPanel.tsx`
3. Update your AI model to use new preferences

### Modify Animations
Edit `/styles/globals.css` to customize animations and transitions.

## 📝 Next Steps

1. ✅ Set up your PostgreSQL database
2. ✅ Implement authentication endpoints
3. ✅ Connect doctor preferences API
4. ✅ Train/configure your AI model
5. ✅ Implement AI suggestion endpoints
6. ✅ Set up NLP processing (OpenAI or custom)
7. ✅ Test end-to-end flow
8. ✅ Deploy backend
9. ✅ Update frontend environment variables
10. ✅ Launch! 🚀

## 💡 Tips

- Start with a simple rule-based AI model, then enhance with ML
- Use OpenAI's GPT-4 for NLP initially (easy integration)
- Implement caching for frequently accessed preferences
- Add WebSocket support for real-time updates
- Monitor AI model performance and iterate

## 🆘 Support

- API Documentation: `/docs/API_SPECIFICATION.md`
- Database Schema: `/docs/DATABASE_SCHEMA.md`
- Interaction Flows: `/docs/INTERACTION_FLOW.md`

---

**Ready to integrate?** Start with Step 1 and work your way through. The frontend is fully prepared and waiting for your backend! 🎉
