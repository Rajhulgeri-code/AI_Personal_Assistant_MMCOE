import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { DoctorPreferences } from '../services/aiModel';
import { Clock, Calendar, Brain, Settings, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { motion } from 'motion/react';

interface DoctorSettingsPanelProps {
  initialPreferences: DoctorPreferences;
  onSave: (preferences: DoctorPreferences) => Promise<void>;
  onCancel: () => void;
}

export function DoctorSettingsPanel({
  initialPreferences,
  onSave,
  onCancel,
}: DoctorSettingsPanelProps) {
  const [preferences, setPreferences] = useState<DoctorPreferences>(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

  const handleWorkingHoursChange = (
    day: typeof days[number],
    field: 'start' | 'end' | 'enabled',
    value: string | boolean
  ) => {
    setPreferences(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }));
    setHasChanges(true);
  };

  const handleConstraintChange = (field: string, value: number) => {
    setPreferences(prev => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleAIPreferenceChange = (field: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      aiPreferences: {
        ...prev.aiPreferences,
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const addBreakTime = () => {
    setPreferences(prev => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        breakTimes: [
          ...prev.constraints.breakTimes,
          { start: '12:00', end: '13:00' },
        ],
      },
    }));
    setHasChanges(true);
  };

  const removeBreakTime = (index: number) => {
    setPreferences(prev => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        breakTimes: prev.constraints.breakTimes.filter((_, i) => i !== index),
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(preferences);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>AI Scheduling Configuration</CardTitle>
                <CardDescription>
                  Configure your preferences to train the AI scheduling model
                </CardDescription>
              </div>
            </div>
            {hasChanges && (
              <Badge variant="secondary" className="animate-pulse">
                Unsaved changes
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Brain className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm">
              These settings train the AI model to understand your scheduling preferences and
              generate optimal appointment suggestions based on your constraints.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="working-hours" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="working-hours">
                <Clock className="h-4 w-4 mr-2" />
                Working Hours
              </TabsTrigger>
              <TabsTrigger value="constraints">
                <Calendar className="h-4 w-4 mr-2" />
                Constraints
              </TabsTrigger>
              <TabsTrigger value="ai-preferences">
                <Brain className="h-4 w-4 mr-2" />
                AI Preferences
              </TabsTrigger>
            </TabsList>

            {/* Working Hours Tab */}
            <TabsContent value="working-hours">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Set your weekly working schedule. The AI will only suggest appointments during
                    these hours.
                  </p>
                  {days.map(day => (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: days.indexOf(day) * 0.05 }}
                      className="p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Label className="capitalize text-base">{day}</Label>
                        <Switch
                          checked={preferences.workingHours[day].enabled}
                          onCheckedChange={checked =>
                            handleWorkingHoursChange(day, 'enabled', checked)
                          }
                        />
                      </div>
                      {preferences.workingHours[day].enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm text-muted-foreground mb-2">Start Time</Label>
                            <Input
                              type="time"
                              value={preferences.workingHours[day].start}
                              onChange={e =>
                                handleWorkingHoursChange(day, 'start', e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground mb-2">End Time</Label>
                            <Input
                              type="time"
                              value={preferences.workingHours[day].end}
                              onChange={e => handleWorkingHoursChange(day, 'end', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Constraints Tab */}
            <TabsContent value="constraints">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  <div>
                    <Label>Maximum Patients Per Day</Label>
                    <Input
                      type="number"
                      value={preferences.constraints.maxPatientsPerDay}
                      onChange={e =>
                        handleConstraintChange('maxPatientsPerDay', parseInt(e.target.value))
                      }
                      min={1}
                      max={50}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      AI will not schedule more than this number per day
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Default Consultation (minutes)</Label>
                      <Input
                        type="number"
                        value={preferences.constraints.defaultConsultationDuration}
                        onChange={e =>
                          handleConstraintChange(
                            'defaultConsultationDuration',
                            parseInt(e.target.value)
                          )
                        }
                        min={5}
                        max={120}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Emergency Consultation (minutes)</Label>
                      <Input
                        type="number"
                        value={preferences.constraints.emergencyConsultationDuration}
                        onChange={e =>
                          handleConstraintChange(
                            'emergencyConsultationDuration',
                            parseInt(e.target.value)
                          )
                        }
                        min={5}
                        max={180}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>Buffer Between Appointments (minutes)</Label>
                    <Input
                      type="number"
                      value={preferences.constraints.bufferBetweenAppointments}
                      onChange={e =>
                        handleConstraintChange('bufferBetweenAppointments', parseInt(e.target.value))
                      }
                      min={0}
                      max={30}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Time gap between consecutive appointments
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Break Times</Label>
                      <Button size="sm" variant="outline" onClick={addBreakTime}>
                        Add Break
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {preferences.constraints.breakTimes.map((breakTime, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                        >
                          <Input
                            type="time"
                            value={breakTime.start}
                            onChange={e => {
                              const newBreakTimes = [...preferences.constraints.breakTimes];
                              newBreakTimes[index].start = e.target.value;
                              setPreferences(prev => ({
                                ...prev,
                                constraints: {
                                  ...prev.constraints,
                                  breakTimes: newBreakTimes,
                                },
                              }));
                              setHasChanges(true);
                            }}
                            className="flex-1"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={breakTime.end}
                            onChange={e => {
                              const newBreakTimes = [...preferences.constraints.breakTimes];
                              newBreakTimes[index].end = e.target.value;
                              setPreferences(prev => ({
                                ...prev,
                                constraints: {
                                  ...prev.constraints,
                                  breakTimes: newBreakTimes,
                                },
                              }));
                              setHasChanges(true);
                            }}
                            className="flex-1"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeBreakTime(index)}
                          >
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Minimum Notice (hours)</Label>
                      <Input
                        type="number"
                        value={preferences.constraints.minNoticeForAppointment}
                        onChange={e =>
                          handleConstraintChange('minNoticeForAppointment', parseInt(e.target.value))
                        }
                        min={0}
                        max={72}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Minimum hours before appointment
                      </p>
                    </div>
                    <div>
                      <Label>Max Advance Booking (days)</Label>
                      <Input
                        type="number"
                        value={preferences.constraints.maxAdvanceBooking}
                        onChange={e =>
                          handleConstraintChange('maxAdvanceBooking', parseInt(e.target.value))
                        }
                        min={7}
                        max={365}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        How far ahead patients can book
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* AI Preferences Tab */}
            <TabsContent value="ai-preferences">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  <Alert className="bg-purple-50 border-purple-200">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <AlertDescription className="text-sm">
                      These settings control how the AI model makes scheduling decisions and
                      recommendations.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <Label>Prioritize Urgent Cases</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          AI will suggest earlier slots for high-priority patients
                        </p>
                      </div>
                      <Switch
                        checked={preferences.aiPreferences.prioritizeUrgentCases}
                        onCheckedChange={checked =>
                          handleAIPreferenceChange('prioritizeUrgentCases', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <Label>Auto-Accept High Confidence Suggestions</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Automatically accept AI suggestions with &gt;90% confidence
                        </p>
                      </div>
                      <Switch
                        checked={preferences.aiPreferences.autoAcceptHighConfidenceSuggestions}
                        onCheckedChange={checked =>
                          handleAIPreferenceChange('autoAcceptHighConfidenceSuggestions', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <Label>Consider Patient History</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Use past appointment data to improve suggestions
                        </p>
                      </div>
                      <Switch
                        checked={preferences.aiPreferences.considerPatientHistory}
                        onCheckedChange={checked =>
                          handleAIPreferenceChange('considerPatientHistory', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <Label>Optimize for Minimal Wait Time</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Reduce patient wait times in scheduling algorithm
                        </p>
                      </div>
                      <Switch
                        checked={preferences.aiPreferences.optimizeForMinimalWaitTime}
                        onCheckedChange={checked =>
                          handleAIPreferenceChange('optimizeForMinimalWaitTime', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <Label>Allow Overbooking</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          AI can suggest overlapping appointments in emergencies
                        </p>
                      </div>
                      <Switch
                        checked={preferences.aiPreferences.allowOverbooking}
                        onCheckedChange={checked =>
                          handleAIPreferenceChange('allowOverbooking', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <Label>Notify on Conflicts</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Get real-time alerts when AI detects scheduling conflicts
                        </p>
                      </div>
                      <Switch
                        checked={preferences.aiPreferences.notifyOnConflicts}
                        onCheckedChange={checked =>
                          handleAIPreferenceChange('notifyOnConflicts', checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save & Train AI'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
