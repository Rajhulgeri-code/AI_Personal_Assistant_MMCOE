# MediSync AI - PostgreSQL Database Schema

## Overview

This document provides the complete database schema for implementing the MediSync AI backend using PostgreSQL.

---

## Schema Diagram

```
doctors
  ├── appointments (doctor_id FK)
  ├── ai_schedule_suggestions (doctor_id FK)
  ├── notifications (doctor_id FK)
  ├── nlp_commands (doctor_id FK)
  └── audit_log (doctor_id FK)

patients
  ├── appointments (patient_id FK)
  ├── ai_schedule_suggestions (patient_id FK)
  ├── medical_documents (patient_id FK)
  ├── health_review_events (patient_id FK)
  └── notifications (related_patient_id FK)
```

---

## Tables

### doctors

Stores doctor account information.

```sql
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(50),
  license_number VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_doctors_email ON doctors(email);
CREATE INDEX idx_doctors_is_active ON doctors(is_active);
```

### patients

Stores patient information.

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  date_of_birth DATE,
  gender VARCHAR(20),
  condition VARCHAR(255),
  condition_summary TEXT,
  last_visit DATE,
  next_visit DATE,
  risk_level VARCHAR(20) CHECK (risk_level IN ('high', 'medium', 'low', 'none')),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  blood_type VARCHAR(10),
  allergies TEXT[],
  medications TEXT[],
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  insurance_provider VARCHAR(255),
  insurance_policy_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_risk_level ON patients(risk_level);
CREATE INDEX idx_patients_next_visit ON patients(next_visit);
CREATE INDEX idx_patients_email ON patients(email);
```

### appointments

Stores appointment information.

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  priority VARCHAR(20) CHECK (priority IN ('emergency', 'urgent', 'normal')),
  status VARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  type VARCHAR(100),
  notes TEXT,
  location VARCHAR(100),
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, date);
```

### ai_schedule_suggestions

Stores AI-generated scheduling suggestions.

```sql
CREATE TABLE ai_schedule_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  suggested_date DATE NOT NULL,
  suggested_start_time TIME NOT NULL,
  suggested_end_time TIME NOT NULL,
  priority VARCHAR(20) CHECK (priority IN ('emergency', 'urgent', 'normal')),
  reason TEXT NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  conflicts TEXT[],
  ml_model_version VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  processed_by UUID REFERENCES doctors(id)
);

CREATE INDEX idx_ai_suggestions_doctor_id ON ai_schedule_suggestions(doctor_id);
CREATE INDEX idx_ai_suggestions_status ON ai_schedule_suggestions(status);
CREATE INDEX idx_ai_suggestions_date ON ai_schedule_suggestions(suggested_date);
CREATE INDEX idx_ai_suggestions_confidence ON ai_schedule_suggestions(confidence);
```

### medical_documents

Stores uploaded medical documents and AI analysis results.

```sql
CREATE TABLE medical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES doctors(id),
  ai_processing_status VARCHAR(20) CHECK (ai_processing_status IN ('pending', 'processing', 'completed', 'failed')),
  ai_flags JSONB,
  extracted_text TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

CREATE INDEX idx_documents_patient_id ON medical_documents(patient_id);
CREATE INDEX idx_documents_uploaded_at ON medical_documents(uploaded_at);
CREATE INDEX idx_documents_processing_status ON medical_documents(ai_processing_status);
CREATE INDEX idx_documents_ai_flags ON medical_documents USING GIN(ai_flags);
```

**ai_flags JSONB structure:**
```json
{
  "hasEmergencyIndicators": boolean,
  "riskLevel": "high" | "medium" | "low" | "none",
  "extractedData": {
    "key": "value"
  },
  "summary": "AI-generated summary",
  "keywords": ["keyword1", "keyword2"],
  "confidence": 0.85
}
```

### health_review_events

Stores health monitoring events and device feeds.

```sql
CREATE TABLE health_review_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  type VARCHAR(50) CHECK (type IN ('vital', 'note', 'lab-result', 'device-feed')),
  data JSONB NOT NULL,
  ai_insight TEXT,
  flagged BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES doctors(id),
  reviewed_at TIMESTAMP,
  source VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_health_events_patient_id ON health_review_events(patient_id);
CREATE INDEX idx_health_events_timestamp ON health_review_events(timestamp);
CREATE INDEX idx_health_events_flagged ON health_review_events(flagged);
CREATE INDEX idx_health_events_type ON health_review_events(type);
CREATE INDEX idx_health_events_data ON health_review_events USING GIN(data);
```

### notifications

Stores system notifications for doctors.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('urgent', 'warning', 'info', 'success')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  actionable BOOLEAN DEFAULT FALSE,
  action_link TEXT,
  related_patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  related_appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_doctor_id ON notifications(doctor_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_doctor_unread ON notifications(doctor_id, read) WHERE read = FALSE;
```

### nlp_commands

Stores natural language commands and their parsed results.

```sql
CREATE TABLE nlp_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  parsed_action VARCHAR(100),
  parsed_entities JSONB,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  preview TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'failed')),
  accepted_by UUID REFERENCES doctors(id),
  accepted_at TIMESTAMP,
  error_message TEXT,
  nlp_model_version VARCHAR(50),
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_nlp_commands_doctor_id ON nlp_commands(doctor_id);
CREATE INDEX idx_nlp_commands_status ON nlp_commands(status);
CREATE INDEX idx_nlp_commands_created_at ON nlp_commands(created_at);
```

### audit_log

Stores audit trail of all actions in the system.

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details TEXT NOT NULL,
  source_type VARCHAR(20) CHECK (source_type IN ('manual', 'nlp', 'ai-suggestion', 'system')),
  source_id UUID,
  entity_type VARCHAR(50),
  entity_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_log_doctor_id ON audit_log(doctor_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_source_type ON audit_log(source_type);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
```

### schedule_conflicts

Stores detected schedule conflicts.

```sql
CREATE TABLE schedule_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  type VARCHAR(50) CHECK (type IN ('overlap', 'overbook', 'double-booking', 'gap-too-small')),
  appointment_ids UUID[] NOT NULL,
  description TEXT NOT NULL,
  suggested_resolution TEXT,
  severity VARCHAR(20) CHECK (severity IN ('high', 'medium', 'low')),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES doctors(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conflicts_doctor_id ON schedule_conflicts(doctor_id);
CREATE INDEX idx_conflicts_resolved ON schedule_conflicts(resolved);
CREATE INDEX idx_conflicts_severity ON schedule_conflicts(severity);
```

### sessions

Stores user session data (if not using JWT).

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_doctor_id ON sessions(doctor_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

---

## Views

### v_upcoming_appointments

View for easily querying upcoming appointments with patient details.

```sql
CREATE VIEW v_upcoming_appointments AS
SELECT 
  a.id,
  a.doctor_id,
  a.patient_id,
  p.name as patient_name,
  p.age as patient_age,
  p.risk_level,
  a.date,
  a.start_time,
  a.end_time,
  a.priority,
  a.status,
  a.type,
  a.location,
  a.notes
FROM appointments a
JOIN patients p ON a.patient_id = p.id
WHERE a.date >= CURRENT_DATE
  AND a.status = 'scheduled'
ORDER BY a.date, a.start_time;
```

### v_patient_summary

View for patient overview with latest appointment info.

```sql
CREATE VIEW v_patient_summary AS
SELECT 
  p.*,
  (SELECT COUNT(*) FROM appointments WHERE patient_id = p.id AND status = 'completed') as total_visits,
  (SELECT date FROM appointments WHERE patient_id = p.id AND status = 'scheduled' ORDER BY date LIMIT 1) as next_appointment_date,
  (SELECT COUNT(*) FROM medical_documents WHERE patient_id = p.id) as document_count
FROM patients p;
```

### v_doctor_dashboard_stats

View for dashboard statistics.

```sql
CREATE VIEW v_doctor_dashboard_stats AS
SELECT 
  doctor_id,
  COUNT(*) FILTER (WHERE date = CURRENT_DATE) as total_patients_today,
  COUNT(*) FILTER (WHERE date = CURRENT_DATE AND priority = 'emergency') as emergency_cases,
  COUNT(*) FILTER (WHERE date >= CURRENT_DATE AND type LIKE '%Follow%') as pending_follow_ups,
  COUNT(*) FILTER (WHERE date = CURRENT_DATE AND status = 'completed') as completed_appointments,
  COUNT(*) FILTER (WHERE date >= CURRENT_DATE AND status = 'scheduled') as upcoming_appointments
FROM appointments
GROUP BY doctor_id;
```

---

## Functions and Triggers

### Update timestamp trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at column
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Auto-detect schedule conflicts

```sql
CREATE OR REPLACE FUNCTION detect_schedule_conflicts()
RETURNS TRIGGER AS $$
DECLARE
  conflict_count INTEGER;
  conflict_appointments UUID[];
BEGIN
  -- Check for overlapping appointments
  SELECT COUNT(*), ARRAY_AGG(id)
  INTO conflict_count, conflict_appointments
  FROM appointments
  WHERE doctor_id = NEW.doctor_id
    AND date = NEW.date
    AND status = 'scheduled'
    AND id != NEW.id
    AND (
      (start_time < NEW.end_time AND end_time > NEW.start_time)
    );
  
  IF conflict_count > 0 THEN
    INSERT INTO schedule_conflicts (
      doctor_id, type, appointment_ids, description, severity
    ) VALUES (
      NEW.doctor_id,
      'overlap',
      conflict_appointments || NEW.id,
      'Appointment overlaps with ' || conflict_count || ' other appointment(s)',
      'high'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_appointment_conflicts
AFTER INSERT OR UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION detect_schedule_conflicts();
```

### Generate AI suggestions (placeholder for background job)

```sql
CREATE OR REPLACE FUNCTION generate_ai_suggestions(p_doctor_id UUID)
RETURNS void AS $$
BEGIN
  -- This would be called by your AI service
  -- Placeholder for AI logic
  -- In production, this would be handled by Python backend
  RAISE NOTICE 'AI suggestion generation triggered for doctor %', p_doctor_id;
END;
$$ LANGUAGE plpgsql;
```

---

## Row Level Security (RLS)

Enable RLS to ensure doctors only see their own data:

```sql
-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_schedule_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlp_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY doctor_appointments_policy ON appointments
  FOR ALL
  USING (doctor_id = current_setting('app.current_doctor_id')::UUID);

CREATE POLICY doctor_suggestions_policy ON ai_schedule_suggestions
  FOR ALL
  USING (doctor_id = current_setting('app.current_doctor_id')::UUID);

CREATE POLICY doctor_notifications_policy ON notifications
  FOR ALL
  USING (doctor_id = current_setting('app.current_doctor_id')::UUID);

CREATE POLICY doctor_nlp_commands_policy ON nlp_commands
  FOR ALL
  USING (doctor_id = current_setting('app.current_doctor_id')::UUID);

CREATE POLICY doctor_audit_log_policy ON audit_log
  FOR ALL
  USING (doctor_id = current_setting('app.current_doctor_id')::UUID);
```

Set current doctor in your application:
```sql
SET app.current_doctor_id = 'uuid-here';
```

---

## Sample Data

See `/lib/mockData.ts` in the frontend code for sample data structure.

---

## Indexes for Performance

Key indexes for optimal query performance:

1. **Composite indexes for common queries:**
   - (doctor_id, date) on appointments
   - (doctor_id, read) on notifications
   - (patient_id, timestamp) on health_review_events

2. **JSONB GIN indexes:**
   - ai_flags on medical_documents
   - data on health_review_events
   - parsed_entities on nlp_commands

3. **Partial indexes:**
   - Unread notifications: `WHERE read = FALSE`
   - Active appointments: `WHERE status = 'scheduled'`
   - Pending AI suggestions: `WHERE status = 'pending'`

---

## Backup and Maintenance

Recommended maintenance tasks:

```sql
-- Vacuum tables regularly
VACUUM ANALYZE appointments;
VACUUM ANALYZE notifications;

-- Archive old audit logs (older than 1 year)
CREATE TABLE audit_log_archive (LIKE audit_log INCLUDING ALL);

-- Delete old notifications (older than 30 days and read)
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '30 days' 
  AND read = TRUE;

-- Clean up expired sessions
DELETE FROM sessions WHERE expires_at < NOW();
```

---

## Migration Scripts

Use a migration tool like Flyway or Alembic. Sample migration:

**V1__initial_schema.sql**
```sql
-- Create all tables in order of dependencies
-- (tables shown above)
```

**V2__add_indexes.sql**
```sql
-- Create all indexes
-- (indexes shown above)
```

**V3__add_triggers.sql**
```sql
-- Create all triggers and functions
-- (triggers shown above)
```
