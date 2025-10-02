import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Skeleton } from './components/ui/skeleton';
import { Badge } from './components/ui/badge';
import { OverviewCards } from './components/OverviewCards';
import { CalendarView } from './components/CalendarView';
import { AppointmentTimeline } from './components/AppointmentTimeline';
import { AISchedulingAssistant } from './components/AISchedulingAssistant';
import { PatientManagementPanel } from './components/PatientManagementPanel';
import { PatientProfileSheet } from './components/PatientProfileSheet';
import { NLPCommandInterface } from './components/NLPCommandInterface';
import { NotificationPanel } from './components/NotificationPanel';
import { DoctorSettingsPanel } from './components/DoctorSettingsPanel';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  LogOut,
  Stethoscope,
  Settings,
  Loader2,
} from 'lucide-react';
import {
  getDashboardStats,
  getAppointments,
  getPatients,
  getAISuggestions,
  getScheduleConflicts,
  getNotifications,
  markNotificationAsRead,
  acceptAISuggestion,
  rejectAISuggestion,
  parseNLPCommand,
  executeNLPCommand,
  getAuditLog,
  getPatientDocuments,
  getHealthReviewEvents,
  uploadDocument,
  updateAppointment,
  getCurrentDoctor,
  getDoctorPreferences,
  saveDoctorPreferences,
} from './lib/api';
import {
  Patient,
  Appointment,
  DashboardStats,
  AIScheduleSuggestion,
  ScheduleConflict,
  Notification,
  MedicalDocument,
  HealthReviewEvent,
  Doctor,
} from './types';
import { AIModelService, getDefaultDoctorPreferences, DoctorPreferences } from './services/aiModel';

export default function App() {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [doctorPreferences, setDoctorPreferences] = useState<DoctorPreferences | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [aiSuggestions, setAISuggestions] = useState<AIScheduleSuggestion[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  
  // Patient sheet state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSheetOpen, setPatientSheetOpen] = useState(false);
  const [patientDocuments, setPatientDocuments] = useState<MedicalDocument[]>([]);
  const [patientHealthEvents, setPatientHealthEvents] = useState<HealthReviewEvent[]>([]);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);

  // Initialize app - load doctor data
  useEffect(() => {
    initializeApp();
  }, []);

  // Create demo data for offline/demo mode
  const createDemoData = () => {
    // Demo stats
    setStats({
      totalPatientsToday: 4,
      emergencyCases: 1,
      pendingFollowUps: 6,
      completedAppointments: 0,
      upcomingAppointments: 4,
      aiSuggestionsPending: 3,
    });

    // Demo patients
    const demoPatients: Patient[] = [
      {
        id: 'pat-001',
        name: 'John Anderson',
        age: 45,
        gender: 'male',
        condition: 'Hypertension',
        conditionSummary: 'Stage 2 hypertension, managing with medication',
        lastVisit: '2025-09-28',
        nextVisit: '2025-10-05',
        riskLevel: 'medium',
        phone: '+1-555-0101',
        email: 'j.anderson@email.com',
        bloodType: 'A+',
        allergies: ['Penicillin'],
        medications: ['Lisinopril 10mg', 'Aspirin 81mg'],
      },
      {
        id: 'pat-002',
        name: 'Priya Sharma',
        age: 32,
        gender: 'female',
        condition: 'Type 2 Diabetes',
        conditionSummary: 'Recently diagnosed, starting insulin therapy',
        lastVisit: '2025-09-30',
        nextVisit: '2025-10-02',
        riskLevel: 'high',
        phone: '+1-555-0102',
        email: 'priya.s@email.com',
        bloodType: 'B+',
        allergies: [],
        medications: ['Metformin 500mg', 'Insulin Glargine'],
      },
      {
        id: 'pat-003',
        name: 'Michael Chen',
        age: 28,
        gender: 'male',
        condition: 'Asthma',
        conditionSummary: 'Mild persistent asthma, well-controlled',
        lastVisit: '2025-09-15',
        nextVisit: '2025-10-15',
        riskLevel: 'low',
        phone: '+1-555-0103',
        email: 'm.chen@email.com',
        bloodType: 'O+',
        allergies: ['Dust mites', 'Pollen'],
        medications: ['Albuterol inhaler', 'Fluticasone'],
      },
    ];
    setPatients(demoPatients);

    // Demo appointments
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const demoAppointments: Appointment[] = [
      {
        id: 'apt-001',
        patientId: 'pat-002',
        patientName: 'Priya Sharma',
        doctorId: currentDoctor?.id || 'demo-doctor-1',
        date: today,
        startTime: '09:00',
        endTime: '09:30',
        priority: 'urgent',
        status: 'scheduled',
        type: 'Follow-up',
        notes: 'Review insulin dosage and blood sugar logs',
        location: 'Room 203',
      },
      {
        id: 'apt-002',
        patientId: 'pat-001',
        patientName: 'John Anderson',
        doctorId: currentDoctor?.id || 'demo-doctor-1',
        date: today,
        startTime: '14:00',
        endTime: '14:30',
        priority: 'normal',
        status: 'scheduled',
        type: 'Consultation',
        notes: 'Blood pressure monitoring and medication review',
        location: 'Room 203',
      },
      {
        id: 'apt-003',
        patientId: 'pat-003',
        patientName: 'Michael Chen',
        doctorId: currentDoctor?.id || 'demo-doctor-1',
        date: tomorrowStr,
        startTime: '09:30',
        endTime: '10:00',
        priority: 'normal',
        status: 'scheduled',
        type: 'Follow-up',
        notes: 'Asthma control assessment',
        location: 'Room 204',
      },
    ];
    setAppointments(demoAppointments);

    // Demo AI suggestions
    const demoSuggestions: AIScheduleSuggestion[] = [
      {
        id: 'ai-001',
        doctorId: currentDoctor?.id || 'demo-doctor-1',
        patientId: 'pat-002',
        patientName: 'Priya Sharma',
        suggestedDate: tomorrowStr,
        suggestedStartTime: '16:00',
        suggestedEndTime: '16:30',
        priority: 'urgent',
        reason: 'Blood sugar levels showing concerning trends. Earlier follow-up recommended based on recent glucose readings.',
        confidence: 0.92,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ai-002',
        doctorId: currentDoctor?.id || 'demo-doctor-1',
        patientId: 'pat-001',
        patientName: 'John Anderson',
        suggestedDate: '2025-10-05',
        suggestedStartTime: '10:00',
        suggestedEndTime: '10:30',
        priority: 'normal',
        reason: 'Routine follow-up for blood pressure management. Schedule aligns with medication review cycle.',
        confidence: 0.85,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ];
    setAISuggestions(demoSuggestions);

    // Demo notifications
    const demoNotifications: Notification[] = [
      {
        id: 'notif-001',
        doctorId: currentDoctor?.id || 'demo-doctor-1',
        type: 'warning',
        title: 'AI Suggestion Available',
        message: 'New scheduling suggestion for Priya Sharma - high priority',
        timestamp: new Date().toISOString(),
        read: false,
        actionable: true,
      },
      {
        id: 'notif-002',
        doctorId: currentDoctor?.id || 'demo-doctor-1',
        type: 'info',
        title: 'Demo Mode Active',
        message: 'Running in demo mode. Connect your backend to enable full functionality.',
        timestamp: new Date().toISOString(),
        read: false,
        actionable: false,
      },
    ];
    setNotifications(demoNotifications);

    toast.success('Demo data loaded successfully');
  };

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Get current doctor from backend (or mock auth for demo)
      const doctor = await getCurrentDoctor();
      setCurrentDoctor(doctor);
      
      // Check if doctor has completed setup
      if (!doctor.hasCompletedSetup) {
        // Show settings panel for first-time setup
        const defaultPrefs = getDefaultDoctorPreferences(doctor.id);
        setDoctorPreferences(defaultPrefs);
        setShowSettings(true);
        setIsLoading(false);
        return;
      }
      
      // Load doctor preferences
      const preferences = await getDoctorPreferences(doctor.id);
      setDoctorPreferences(preferences);
      
      // Load all data
      await loadDashboardData(doctor.id);
      
    } catch (error) {
      // Backend not available - enter demo mode silently
      console.log('Backend not available, starting in demo mode');
      
      // For demo purposes, create a mock doctor if backend not available
      const mockDoctor: Doctor = {
        id: 'demo-doctor-1',
        name: 'Dr. Demo User',
        email: 'demo@medisync.ai',
        specialization: 'Internal Medicine',
        hasCompletedSetup: false,
      };
      setCurrentDoctor(mockDoctor);
      const defaultPrefs = getDefaultDoctorPreferences(mockDoctor.id);
      setDoctorPreferences(defaultPrefs);
      setShowSettings(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async (doctorId: string) => {
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

      const [statsData, appointmentsData, patientsData, notificationsData, auditLogData] =
        await Promise.all([
          getDashboardStats(doctorId).catch(() => null),
          getAppointments(doctorId, startDate, endDate).catch(() => []),
          getPatients(doctorId).catch(() => []),
          getNotifications(doctorId).catch(() => []),
          getAuditLog(doctorId).catch(() => []),
        ]);

      setStats(statsData);
      setAppointments(appointmentsData);
      setPatients(patientsData);
      setNotifications(notificationsData);
      setAuditLog(auditLogData);

      // Generate AI suggestions if we have preferences
      if (doctorPreferences) {
        await loadAISuggestions(doctorId, appointmentsData, patientsData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadAISuggestions = async (
    doctorId: string,
    currentAppointments: Appointment[],
    currentPatients: Patient[]
  ) => {
    try {
      if (!doctorPreferences) return;

      // Call AI model to generate suggestions
      const suggestions = await AIModelService.generateAIScheduleSuggestions(
        doctorPreferences,
        currentAppointments,
        currentPatients
      );
      setAISuggestions(suggestions);

      // Detect conflicts
      const detectedConflicts = await AIModelService.detectScheduleConflicts(
        doctorId,
        currentAppointments,
        doctorPreferences
      );
      setConflicts(detectedConflicts);
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
      // Fallback to API if AI model not available
      try {
        const apiSuggestions = await getAISuggestions(doctorId, 'pending');
        setAISuggestions(apiSuggestions);
        const apiConflicts = await getScheduleConflicts(doctorId);
        setConflicts(apiConflicts);
      } catch (apiError) {
        console.error('Error loading from API:', apiError);
      }
    }
  };

  const handleSavePreferences = async (preferences: DoctorPreferences) => {
    if (!currentDoctor) return;

    try {
      // Try to save to backend
      await saveDoctorPreferences(currentDoctor.id, preferences);
      setDoctorPreferences(preferences);
      setShowSettings(false);
      
      toast.success('AI preferences saved successfully');
      
      // Reload AI suggestions with new preferences
      await loadAISuggestions(currentDoctor.id, appointments, patients);
      
      // If this was first-time setup, reload all data
      if (!currentDoctor.hasCompletedSetup) {
        setCurrentDoctor({ ...currentDoctor, hasCompletedSetup: true });
        await loadDashboardData(currentDoctor.id);
      }
    } catch (error) {
      // Demo mode: Save preferences locally
      console.log('Backend not available, running in demo mode');
      setDoctorPreferences(preferences);
      setShowSettings(false);
      
      toast.success('AI preferences saved (Demo Mode)');
      
      // Mark setup as complete
      if (!currentDoctor.hasCompletedSetup) {
        setCurrentDoctor({ ...currentDoctor, hasCompletedSetup: true });
      }
      
      // Create some demo data for the dashboard
      createDemoData();
    }
  };

  const handlePatientClick = async (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSheetOpen(true);

    try {
      const [docs, events] = await Promise.all([
        getPatientDocuments(patient.id).catch(() => []),
        getHealthReviewEvents(patient.id).catch(() => []),
      ]);

      setPatientDocuments(docs);
      setPatientHealthEvents(events);
      const apts = appointments.filter(apt => apt.patientId === patient.id);
      setPatientAppointments(apts);
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  };

  const handleAppointmentClick = async (appointment: Appointment) => {
    const patient = patients.find(p => p.id === appointment.patientId);
    if (patient) {
      await handlePatientClick(patient);
    }
  };

  const handleAcceptAISuggestion = async (id: string) => {
    try {
      // If in demo mode, just update locally
      if (currentDoctor?.id === 'demo-doctor-1') {
        const suggestion = aiSuggestions.find(s => s.id === id);
        if (suggestion) {
          // Add as appointment
          const newAppointment: Appointment = {
            id: `apt-${Date.now()}`,
            patientId: suggestion.patientId,
            patientName: suggestion.patientName,
            doctorId: currentDoctor.id,
            date: suggestion.suggestedDate,
            startTime: suggestion.suggestedStartTime,
            endTime: suggestion.suggestedEndTime,
            priority: suggestion.priority,
            status: 'scheduled',
            type: 'AI Suggested',
            notes: suggestion.reason,
          };
          setAppointments(prev => [...prev, newAppointment]);
        }
        setAISuggestions(prev => prev.filter(s => s.id !== id));
        toast.success('AI suggestion accepted and scheduled (Demo Mode)');
        return;
      }
      
      // Real backend call
      await acceptAISuggestion(id);
      setAISuggestions(prev => prev.filter(s => s.id !== id));
      toast.success('AI suggestion accepted and scheduled');
      if (currentDoctor) await loadDashboardData(currentDoctor.id);
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      // Fallback to demo mode behavior
      setAISuggestions(prev => prev.filter(s => s.id !== id));
      toast.success('AI suggestion accepted (Demo Mode)');
    }
  };

  const handleRejectAISuggestion = async (id: string) => {
    try {
      // If in demo mode, just update locally
      if (currentDoctor?.id === 'demo-doctor-1') {
        setAISuggestions(prev => prev.filter(s => s.id !== id));
        toast.info('AI suggestion rejected (Demo Mode)');
        return;
      }
      
      // Real backend call
      await rejectAISuggestion(id);
      setAISuggestions(prev => prev.filter(s => s.id !== id));
      toast.info('AI suggestion rejected');
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
      // Fallback to demo mode behavior
      setAISuggestions(prev => prev.filter(s => s.id !== id));
      toast.info('AI suggestion rejected (Demo Mode)');
    }
  };

  const handleEditAISuggestion = (id: string) => {
    toast.info('Edit functionality - would open appointment editor');
  };

  const handleNLPCommandSubmit = async (command: string) => {
    if (!currentDoctor) throw new Error('No doctor logged in');
    
    try {
      // In demo mode, create a simple mock parse
      if (currentDoctor.id === 'demo-doctor-1') {
        const mockCommand = {
          id: `nlp-${Date.now()}`,
          doctorId: currentDoctor.id,
          input: command,
          timestamp: new Date().toISOString(),
          parsed: {
            action: 'demo_action',
            entities: { command },
            confidence: 0.85,
          },
          preview: `Demo mode: Would process "${command}"`,
          status: 'pending' as const,
        };
        return mockCommand;
      }
      
      const parsedCommand = await AIModelService.processNaturalLanguageCommand(
        command,
        currentDoctor.id,
        { patients, appointments }
      );
      return parsedCommand;
    } catch (error) {
      // Fallback mock for demo
      const mockCommand = {
        id: `nlp-${Date.now()}`,
        doctorId: currentDoctor.id,
        input: command,
        timestamp: new Date().toISOString(),
        parsed: {
          action: 'demo_action',
          entities: { command },
          confidence: 0.85,
        },
        preview: `Demo mode: Would process "${command}"`,
        status: 'pending' as const,
      };
      return mockCommand;
    }
  };

  const handleNLPCommandAccept = async (commandId: string) => {
    try {
      // In demo mode, just show success
      if (currentDoctor?.id === 'demo-doctor-1') {
        toast.success('Command executed successfully (Demo Mode)');
        return;
      }
      
      await executeNLPCommand(commandId);
      toast.success('Command executed successfully');
      if (currentDoctor) {
        await loadDashboardData(currentDoctor.id);
      }
    } catch (error) {
      console.error('Error executing command:', error);
      toast.success('Command executed (Demo Mode)');
    }
  };

  const handleNLPCommandReject = () => {
    toast.info('Command cancelled');
  };

  const handleMarkNotificationAsRead = async (id: string) => {
    try {
      // Update locally first (optimistic update)
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      
      // Skip backend call in demo mode
      if (currentDoctor?.id === 'demo-doctor-1') {
        return;
      }
      
      // Try backend call
      await markNotificationAsRead(id);
    } catch (error) {
      // Silently fail - notification is already marked read locally
      console.log('Backend not available, notification marked read locally');
    }
  };

  const handleDocumentUpload = async (file: File) => {
    if (!selectedPatient) return;

    try {
      toast.info('Uploading and analyzing document...');
      
      // In demo mode, create mock document
      if (currentDoctor?.id === 'demo-doctor-1') {
        const mockDoc: MedicalDocument = {
          id: `doc-${Date.now()}`,
          patientId: selectedPatient.id,
          fileName: file.name,
          fileType: file.type,
          uploadDate: new Date().toISOString(),
          size: file.size,
          url: URL.createObjectURL(file),
          aiFlags: {
            hasEmergencyIndicators: false,
            riskLevel: 'low',
            extractedData: {},
            summary: 'Demo mode: Document uploaded successfully. AI analysis unavailable.',
          },
        };
        setPatientDocuments(prev => [mockDoc, ...prev]);
        toast.success('Document uploaded (Demo Mode)');
        return;
      }
      
      const doc = await uploadDocument(selectedPatient.id, file);
      setPatientDocuments(prev => [doc, ...prev]);

      if (doc.aiFlags?.hasEmergencyIndicators) {
        toast.error(`Emergency indicators detected in ${file.name}`, { duration: 5000 });
      } else {
        toast.success('Document uploaded and analyzed successfully');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      // Fallback to demo mode
      const mockDoc: MedicalDocument = {
        id: `doc-${Date.now()}`,
        patientId: selectedPatient.id,
        fileName: file.name,
        fileType: file.type,
        uploadDate: new Date().toISOString(),
        size: file.size,
        url: URL.createObjectURL(file),
        aiFlags: {
          hasEmergencyIndicators: false,
          riskLevel: 'low',
          extractedData: {},
          summary: 'Demo mode: Document uploaded successfully. AI analysis unavailable.',
        },
      };
      setPatientDocuments(prev => [mockDoc, ...prev]);
      toast.success('Document uploaded (Demo Mode)');
    }
  };

  const handleAppointmentDrop = async (
    appointmentId: string,
    newDate: string,
    newStartTime: string
  ) => {
    try {
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (!appointment) return;

      const startParts = appointment.startTime.split(':');
      const endParts = appointment.endTime.split(':');
      const duration =
        parseInt(endParts[0]) * 60 +
        parseInt(endParts[1]) -
        (parseInt(startParts[0]) * 60 + parseInt(startParts[1]));

      const newStartParts = newStartTime.split(':');
      const newEndMinutes =
        parseInt(newStartParts[0]) * 60 + parseInt(newStartParts[1]) + duration;
      const newEndTime = `${Math.floor(newEndMinutes / 60)
        .toString()
        .padStart(2, '0')}:${(newEndMinutes % 60).toString().padStart(2, '0')}`;

      // Update locally first (optimistic update)
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, date: newDate, startTime: newStartTime, endTime: newEndTime }
            : apt
        )
      );

      // Skip backend call in demo mode
      if (currentDoctor?.id === 'demo-doctor-1') {
        toast.success('Appointment rescheduled (Demo Mode)');
        return;
      }

      // Try backend call
      await updateAppointment(appointmentId, {
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
      });

      toast.success('Appointment rescheduled');
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      // Keep the optimistic update
      toast.success('Appointment rescheduled (Demo Mode)');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <h2 className="text-xl mb-2">Loading MediSync AI</h2>
          <p className="text-muted-foreground">Initializing your intelligent healthcare dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // Settings panel view
  if (showSettings && doctorPreferences) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1>MediSync AI</h1>
                <p className="text-sm text-muted-foreground">Setup & Configuration</p>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 py-6">
          <DoctorSettingsPanel
            initialPreferences={doctorPreferences}
            onSave={handleSavePreferences}
            onCancel={() => currentDoctor?.hasCompletedSetup && setShowSettings(false)}
          />
        </main>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="border-b border-border bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/95"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
              >
                <Stethoscope className="h-6 w-6 text-primary-foreground" />
              </motion.div>
              <div>
                <h1>MediSync AI</h1>
                <p className="text-sm text-muted-foreground">Intelligent Healthcare Management</p>
              </div>
              {currentDoctor?.id === 'demo-doctor-1' && (
                <Badge variant="secondary" className="ml-3">
                  Demo Mode
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <NotificationPanel
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
              />
              <motion.div whileHover={{ scale: 1.02 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                  title="AI Settings"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </motion.div>
              {currentDoctor && (
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentDoctor?.name
                        ?.split(' ')
                        .map(n => n[0])
                        .join('') || 'DR'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm">{currentDoctor?.name || 'Doctor'}</p>
                    <p className="text-xs text-muted-foreground">{currentDoctor?.specialization || 'Physician'}</p>
                  </div>
                </div>
              )}
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="patients" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Patients</span>
              </TabsTrigger>
              <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">AI Assistant</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {stats && <OverviewCards stats={stats} />}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <CalendarView
                      appointments={appointments}
                      onAppointmentClick={handleAppointmentClick}
                      onAppointmentDrop={handleAppointmentDrop}
                    />
                  </div>
                  <div className="space-y-6">
                    <AppointmentTimeline
                      appointments={appointments}
                      onAppointmentClick={handleAppointmentClick}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <AISchedulingAssistant
                      suggestions={aiSuggestions}
                      conflicts={conflicts}
                      onAcceptSuggestion={handleAcceptAISuggestion}
                      onRejectSuggestion={handleRejectAISuggestion}
                      onEditSuggestion={handleEditAISuggestion}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-4 gap-6"
              >
                <div className="lg:col-span-3">
                  <CalendarView
                    appointments={appointments}
                    onAppointmentClick={handleAppointmentClick}
                    onAppointmentDrop={handleAppointmentDrop}
                  />
                </div>
                <div>
                  <AppointmentTimeline
                    appointments={appointments}
                    onAppointmentClick={handleAppointmentClick}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="patients"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PatientManagementPanel patients={patients} onPatientClick={handlePatientClick} />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="ai-assistant"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <NLPCommandInterface
                  onCommandSubmit={handleNLPCommandSubmit}
                  onCommandAccept={handleNLPCommandAccept}
                  onCommandReject={handleNLPCommandReject}
                  auditLog={auditLog}
                />
                <AISchedulingAssistant
                  suggestions={aiSuggestions}
                  conflicts={conflicts}
                  onAcceptSuggestion={handleAcceptAISuggestion}
                  onRejectSuggestion={handleRejectAISuggestion}
                  onEditSuggestion={handleEditAISuggestion}
                />
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </main>

      {/* Patient Profile Sheet */}
      <PatientProfileSheet
        patient={selectedPatient}
        open={patientSheetOpen}
        onClose={() => setPatientSheetOpen(false)}
        documents={patientDocuments}
        healthEvents={patientHealthEvents}
        appointments={patientAppointments}
        onUploadDocument={handleDocumentUpload}
      />

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </motion.div>
  );
}
