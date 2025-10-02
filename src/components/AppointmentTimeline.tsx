import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Appointment } from '../types';
import { Clock, MapPin } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface AppointmentTimelineProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}

export function AppointmentTimeline({ appointments, onAppointmentClick }: AppointmentTimelineProps) {
  const priorityColors = {
    emergency: 'bg-red-500 hover:bg-red-600',
    urgent: 'bg-amber-500 hover:bg-amber-600',
    normal: 'bg-green-500 hover:bg-green-600',
  };

  const priorityBorders = {
    emergency: 'border-l-red-500',
    urgent: 'border-l-amber-500',
    normal: 'border-l-green-500',
  };

  // Sort by time
  const sortedAppointments = [...appointments].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {sortedAppointments.map((appointment) => (
              <div
                key={appointment.id}
                onClick={() => onAppointmentClick(appointment)}
                className={`p-4 border-l-4 ${priorityBorders[appointment.priority]} bg-card hover:bg-muted/50 rounded-r-lg cursor-pointer transition-colors`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="truncate">{appointment.patientName}</p>
                      <Badge
                        className={priorityColors[appointment.priority]}
                      >
                        {appointment.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{appointment.type}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{appointment.startTime} - {appointment.endTime}</span>
                      </div>
                      {appointment.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{appointment.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {appointment.notes && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {appointment.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
