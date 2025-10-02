# MediSync AI - Interaction Flow Diagrams

## Overview

This document describes the key interaction flows in the MediSync AI application.

---

## 1. User Authentication Flow

```
┌─────────┐
│ Doctor  │
│ Login   │
└────┬────┘
     │
     ▼
┌─────────────────────────────┐
│ POST /api/auth/login        │
│ email + password            │
└────────────┬────────────────┘
             │
             ▼
        ┌────────┐
        │Success?│
        └───┬─┬──┘
            │ │
       Yes  │ │  No
            │ └────────┐
            ▼          ▼
    ┌────────────┐  ┌──────────────┐
    │ Store JWT  │  │ Show Error   │
    │ Token      │  │ Message      │
    └──────┬─────┘  └──────────────┘
           │
           ▼
    ┌────────────────┐
    │ Load Dashboard │
    │ Data           │
    └────────────────┘
```

---

## 2. Dashboard Load Flow

```
┌──────────────┐
│Page Load     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│ Parallel API Calls:              │
│ 1. GET /dashboard/stats          │
│ 2. GET /appointments             │
│ 3. GET /patients                 │
│ 4. GET /ai-suggestions           │
│ 5. GET /schedule-conflicts       │
│ 6. GET /notifications            │
└──────────────┬───────────────────┘
               │
               ▼
        ┌──────────────┐
        │ All Resolved?│
        └──────┬───────┘
               │
               ▼
        ┌──────────────────┐
        │ Update UI State  │
        │ - Stats cards    │
        │ - Calendar view  │
        │ - Timeline       │
        │ - AI assistant   │
        └──────┬───────────┘
               │
               ▼
        ┌──────────────────┐
        │ Connect WebSocket│
        │ for Real-time    │
        │ Updates          │
        └──────────────────┘
```

---

## 3. Appointment Drag-and-Drop Flow

```
┌──────────────┐
│ User Drags   │
│ Appointment  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ onDragStart      │
│ Store appt ID    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ User Drops on    │
│ New Time Slot    │
└──────┬───────────┘
       │
       ▼
┌──────────────────────────┐
│ Calculate New Times      │
│ - Maintain duration      │
│ - New date/time          │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ PUT /appointments/{id}   │
│ Update date & time       │
└──────┬───────────────────┘
       │
       ▼
    ┌─────────┐
    │Success? │
    └────┬─┬──┘
         │ │
    Yes  │ │  No
         │ └────────────┐
         ▼              ▼
 ┌───────────────┐  ┌────────────┐
 │ Update Local  │  │ Revert UI  │
 │ State         │  │ Show Error │
 │ Show Toast    │  └────────────┘
 └───────┬───────┘
         │
         ▼
 ┌───────────────────┐
 │ Check Conflicts   │
 │ via Backend       │
 └───────┬───────────┘
         │
         ▼
   ┌──────────┐
   │Conflicts?│
   └────┬─┬───┘
        │ │
   Yes  │ │  No
        │ └──────────┐
        ▼            ▼
 ┌──────────────┐  ┌────────┐
 │ Show Warning │  │ Done   │
 │ with Options │  └────────┘
 └──────────────┘
```

---

## 4. AI Suggestion Acceptance Flow

```
┌──────────────────┐
│ AI Suggestion    │
│ Displayed        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ User Reviews:    │
│ - Patient info   │
│ - Suggested time │
│ - AI reasoning   │
│ - Confidence     │
│ - Conflicts      │
└────────┬─────────┘
         │
         ▼
  ┌──────────────┐
  │ User Action? │
  └──┬────┬────┬─┘
     │    │    │
Accept│ Edit│ Reject
     │    │    │
     ▼    ▼    ▼
┌────────┐ ┌────────┐ ┌────────┐
│PUT     │ │Open    │ │PUT     │
│/accept │ │Editor  │ │/reject │
└────┬───┘ └────┬───┘ └────┬───┘
     │          │          │
     ▼          ▼          ▼
┌─────────────────────────────┐
│ Backend:                    │
│ 1. Update suggestion status │
│ 2. Create/Update appt       │
│ 3. Log audit trail          │
│ 4. Send notification        │
└──────────┬──────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Refresh UI:  │
    │ - Remove sug │
    │ - Update cal │
    │ - Show toast │
    └──────────────┘
```

---

## 5. NLP Command Processing Flow

```
┌──────────────────┐
│ User Types       │
│ Natural Language │
│ Command          │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ POST /nlp/parse          │
│ {                        │
│   command: "...",        │
│   doctorId: "..."        │
│ }                        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Backend AI Processing:   │
│ 1. OpenAI/NLP service    │
│ 2. Extract entities      │
│ 3. Identify action       │
│ 4. Calculate confidence  │
│ 5. Generate preview      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Return Parsed Result:    │
│ {                        │
│   action: "...",         │
│   entities: {...},       │
│   preview: "...",        │
│   confidence: 0.85       │
│ }                        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Display Preview to User: │
│ - What was said          │
│ - What AI understood     │
│ - What will happen       │
│ - Confidence score       │
└────────┬─────────────────┘
         │
         ▼
    ┌────────────┐
    │User Action?│
    └──┬──────┬──┘
       │      │
  Accept│   Reject
       │      │
       ▼      ▼
┌────────────┐ ┌────────┐
│POST        │ │Discard │
│/nlp/execute│ └────────┘
└──────┬─────┘
       │
       ▼
┌──────────────────────────┐
│ Backend Executes:        │
│ - Update database        │
│ - Create audit log       │
│ - Send notifications     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ UI Updates:              │
│ - Refresh affected data  │
│ - Add to command history │
│ - Show success message   │
└──────────────────────────┘
```

---

## 6. Patient Profile View Flow

```
┌──────────────────┐
│ User Clicks      │
│ Patient Card     │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ Open Side Sheet          │
│ Show Loading State       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Parallel API Calls:      │
│ 1. GET /patients/{id}    │
│ 2. GET /documents        │
│ 3. GET /health-events    │
│ 4. GET /appointments     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Display Tabs:            │
│ ┌────────────────────┐   │
│ │ Overview           │   │
│ │ - Demographics     │   │
│ │ - Allergies        │   │
│ │ - Medications      │   │
│ │ - Upcoming appts   │   │
│ └────────────────────┘   │
│ ┌────────────────────┐   │
│ │ Documents          │   │
│ │ - Upload button    │   │
│ │ - Document list    │   │
│ │ - AI analysis      │   │
│ └────────────────────┘   │
│ ┌────────────────────┐   │
│ │ Timeline           │   │
│ │ - Health events    │   │
│ │ - AI insights      │   │
│ │ - Vitals history   │   │
│ └────────────────────┘   │
└──────────────────────────┘
```

---

## 7. Document Upload & AI Analysis Flow

```
┌──────────────────┐
│ User Selects     │
│ File to Upload   │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ POST /documents/upload   │
│ multipart/form-data      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Backend Processing:      │
│ 1. Validate file         │
│ 2. Store in S3/storage   │
│ 3. Create DB record      │
│ 4. Queue AI analysis     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ AI Analysis (Async):     │
│ 1. OCR / Text extract    │
│ 2. Entity recognition    │
│ 3. Risk assessment       │
│ 4. Emergency detection   │
│ 5. Generate summary      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Update DB with Results:  │
│ {                        │
│   aiFlags: {             │
│     hasEmergency: bool,  │
│     riskLevel: "...",    │
│     summary: "...",      │
│     extractedData: {...} │
│   }                      │
│ }                        │
└────────┬─────────────────┘
         │
         ▼
   ┌────────────┐
   │Emergency?  │
   └──┬────────┬┘
      │        │
  Yes │      No│
      │        │
      ▼        ▼
┌───────────┐ ┌──────────┐
│Send       │ │Update    │
│Urgent     │ │UI        │
│Notif      │ │Show      │
│           │ │Results   │
└─────┬─────┘ └────┬─────┘
      │            │
      └────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ WebSocket    │
    │ Push Update  │
    │ to Frontend  │
    └──────────────┘
```

---

## 8. Real-Time Notification Flow

```
┌──────────────────┐
│ Event Occurs:    │
│ - New appt       │
│ - AI suggestion  │
│ - Emergency      │
│ - Conflict       │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ Backend Creates          │
│ Notification Record      │
│ in Database              │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Send via WebSocket       │
│ {                        │
│   type: "notification",  │
│   payload: {...}         │
│ }                        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Frontend Receives:       │
│ 1. Add to notif list     │
│ 2. Update badge count    │
│ 3. Show toast (urgent)   │
│ 4. Play sound (optional) │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ User Clicks Notification │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ PUT /notifications/read  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Navigate to Related:     │
│ - Patient profile        │
│ - Appointment            │
│ - AI suggestion          │
└──────────────────────────┘
```

---

## 9. Schedule Conflict Detection Flow

```
┌──────────────────┐
│ Appointment      │
│ Created/Updated  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ Database Trigger Fires   │
│ detect_schedule_conflicts│
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Check for:               │
│ 1. Time overlaps         │
│ 2. Double bookings       │
│ 3. Gaps too small        │
│ 4. Overbooked slots      │
└────────┬─────────────────┘
         │
         ▼
    ┌────────────┐
    │Conflict    │
    │Found?      │
    └──┬──────┬──┘
       │      │
   Yes │    No│
       │      └──────┐
       ▼             ▼
┌────────────────┐ ┌──────┐
│Create Conflict │ │Done  │
│Record          │ └──────┘
└──────┬─────────┘
       │
       ▼
┌────────────────────────┐
│Send Notification       │
│to Doctor               │
└──────┬─────────────────┘
       │
       ▼
┌────────────────────────┐
│AI Suggests Resolution: │
│- Move appointment      │
│- Extend time           │
│- Split into two        │
└──────┬─────────────────┘
       │
       ▼
┌────────────────────────┐
│Display in AI Assistant │
│with Action Buttons     │
└────────────────────────┘
```

---

## 10. WebSocket Connection Flow

```
┌──────────────────┐
│ App Initializes  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ Connect WebSocket        │
│ ws://backend/ws          │
│ ?doctorId={uuid}         │
└────────┬─────────────────┘
         │
         ▼
    ┌────────────┐
    │Connected?  │
    └──┬──────┬──┘
       │      │
   Yes │    No│
       │      └────────────┐
       ▼                   ▼
┌────────────────┐  ┌──────────────┐
│Register        │  │Retry with    │
│Event Handlers  │  │Backoff       │
└──────┬─────────┘  └──────────────┘
       │
       ▼
┌────────────────────────┐
│Listen for Events:      │
│- notification.new      │
│- appointment.updated   │
│- ai.suggestion         │
│- health.alert          │
│- schedule.conflict     │
└──────┬─────────────────┘
       │
       ▼
┌────────────────────────┐
│On Message Received:    │
│1. Parse event type     │
│2. Update local state   │
│3. Trigger UI updates   │
│4. Show notifications   │
└──────┬─────────────────┘
       │
       ▼
┌────────────────────────┐
│On Disconnect:          │
│- Attempt reconnect     │
│- Show offline indicator│
│- Queue pending actions │
└────────────────────────┘
```

---

## Key Interaction Principles

1. **Optimistic Updates**: UI updates immediately, reverts on error
2. **Real-time Sync**: WebSocket for instant updates across tabs
3. **Error Handling**: Clear error messages with recovery options
4. **Loading States**: Skeleton screens and spinners for async operations
5. **Undo Actions**: Critical actions (delete, reschedule) have undo option
6. **Accessibility**: Keyboard navigation, ARIA labels, screen reader support
7. **Offline Support**: Queue actions when offline, sync when reconnected
8. **Audit Trail**: All actions logged for compliance

---

## Performance Considerations

- **Debouncing**: Search inputs debounced by 300ms
- **Pagination**: Lists paginated at 50 items
- **Lazy Loading**: Documents and images loaded on demand
- **Caching**: Frequently accessed data cached client-side
- **Batch Requests**: Multiple related requests bundled
- **WebSocket Throttling**: Max 10 messages/second processed

---

## Security Measures

- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: RLS policies enforce data isolation
- **Input Validation**: All inputs sanitized server-side
- **Rate Limiting**: API throttling per doctor
- **Audit Logging**: All actions logged with IP and user agent
- **Encryption**: Sensitive data encrypted at rest and in transit
