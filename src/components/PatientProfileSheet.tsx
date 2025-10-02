import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Patient, MedicalDocument, HealthReviewEvent, Appointment } from '../types';
import {
  User,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  FileText,
  Upload,
  Activity,
  Pill,
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';

interface PatientProfileSheetProps {
  patient: Patient | null;
  open: boolean;
  onClose: () => void;
  documents?: MedicalDocument[];
  healthEvents?: HealthReviewEvent[];
  appointments?: Appointment[];
  onUploadDocument?: (file: File) => void;
}

export function PatientProfileSheet({
  patient,
  open,
  onClose,
  documents = [],
  healthEvents = [],
  appointments = [],
  onUploadDocument,
}: PatientProfileSheetProps) {
  if (!patient) return null;

  const riskLevelColors = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-blue-500',
    none: 'bg-gray-400',
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadDocument) {
      onUploadDocument(file);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <SheetTitle>{patient.name}</SheetTitle>
              <SheetDescription>
                {patient.age} years • {patient.gender}
              </SheetDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={riskLevelColors[patient.riskLevel]}>
                  {patient.riskLevel} risk
                </Badge>
                <Badge variant="outline">{patient.condition}</Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{patient.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
              </div>
              {patient.nextVisit && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Next visit: {new Date(patient.nextVisit).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="text-sm mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Condition Summary
              </h3>
              <p className="text-sm text-muted-foreground">{patient.conditionSummary}</p>
            </div>

            {patient.bloodType && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm mb-2">Blood Type</h3>
                  <Badge variant="outline">{patient.bloodType}</Badge>
                </div>
              </>
            )}

            {patient.allergies && patient.allergies.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    Allergies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, idx) => (
                      <Badge key={idx} variant="destructive">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {patient.medications && patient.medications.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm mb-2 flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    Current Medications
                  </h3>
                  <ul className="space-y-1">
                    {patient.medications.map((med, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        • {med}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <Separator />

            <div>
              <h3 className="text-sm mb-3">Upcoming Appointments</h3>
              <div className="space-y-2">
                {appointments.length > 0 ? (
                  appointments.slice(0, 3).map(apt => (
                    <div key={apt.id} className="p-3 bg-muted rounded-lg text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p>{apt.type}</p>
                          <p className="text-muted-foreground">
                            {new Date(apt.date).toLocaleDateString()} at {apt.startTime}
                          </p>
                        </div>
                        <Badge variant="outline">{apt.status}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="space-y-4">
              <div>
                <label htmlFor="file-upload">
                  <Button variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </span>
                  </Button>
                </label>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {documents.map(doc => (
                    <div key={doc.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-primary mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{doc.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.uploadDate).toLocaleDateString()} •{' '}
                            {(doc.size / 1024).toFixed(1)} KB
                          </p>
                          {doc.aiFlags && (
                            <div className="mt-2">
                              {doc.aiFlags.hasEmergencyIndicators && (
                                <Alert className="mb-2 bg-red-50 border-red-200">
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                  <AlertDescription className="text-sm">
                                    Emergency indicators detected
                                  </AlertDescription>
                                </Alert>
                              )}
                              {doc.aiFlags.summary && (
                                <div className="bg-muted p-2 rounded text-xs">
                                  <p className="text-muted-foreground">AI Summary:</p>
                                  <p className="mt-1">{doc.aiFlags.summary}</p>
                                </div>
                              )}
                              <Badge
                                className={`mt-2 ${riskLevelColors[doc.aiFlags.riskLevel]}`}
                              >
                                {doc.aiFlags.riskLevel} risk
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No documents uploaded yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {healthEvents.map(event => (
                  <div
                    key={event.id}
                    className={`p-4 border-l-4 rounded-r-lg ${
                      event.flagged ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Activity className="h-5 w-5 text-primary mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm capitalize">{event.type.replace('-', ' ')}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded text-sm mb-2">
                          {Object.entries(event.data).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                        {event.aiInsight && (
                          <Alert
                            className={
                              event.flagged
                                ? 'bg-red-100 border-red-200'
                                : 'bg-blue-100 border-blue-200'
                            }
                          >
                            <AlertCircle
                              className={`h-4 w-4 ${event.flagged ? 'text-red-600' : 'text-blue-600'}`}
                            />
                            <AlertDescription className="text-sm">
                              {event.aiInsight}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {healthEvents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No health review events recorded</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
