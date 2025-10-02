import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment, CalendarView as ViewType } from '../types';
import { Badge } from './ui/badge';

interface CalendarViewProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onDateChange?: (date: Date) => void;
  onAppointmentDrop?: (appointmentId: string, newDate: string, newStartTime: string) => void;
}

export function CalendarView({
  appointments,
  onAppointmentClick,
  onDateChange,
  onAppointmentDrop,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('week');

  const priorityColors = {
    emergency: 'bg-red-100 border-red-500 text-red-900 hover:bg-red-200',
    urgent: 'bg-amber-100 border-amber-500 text-amber-900 hover:bg-amber-200',
    normal: 'bg-green-100 border-green-500 text-green-900 hover:bg-green-200',
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const getDateRange = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else if (view === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const filterAppointmentsByDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateStr);
  };

  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    e.dataTransfer.setData('appointmentId', appointment.id);
  };

  const handleDrop = (e: React.DragEvent, date: Date, timeSlot?: string) => {
    e.preventDefault();
    const appointmentId = e.dataTransfer.getData('appointmentId');
    const newDate = date.toISOString().split('T')[0];
    const newStartTime = timeSlot || '09:00';
    onAppointmentDrop?.(appointmentId, newDate, newStartTime);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const renderDayView = () => {
    const todayAppointments = filterAppointmentsByDate(currentDate);
    const timeSlots = Array.from({ length: 12 }, (_, i) => {
      const hour = i + 8; // 8 AM to 8 PM
      return `${hour.toString().padStart(2, '0')}:00`;
    });

    return (
      <div className="space-y-2">
        {timeSlots.map(time => {
          const aptsAtTime = todayAppointments.filter(
            apt => apt.startTime <= time && apt.endTime > time
          );
          return (
            <div
              key={time}
              className="flex gap-2 border-b border-border pb-2"
              onDrop={(e) => handleDrop(e, currentDate, time)}
              onDragOver={handleDragOver}
            >
              <div className="w-20 text-sm text-muted-foreground">{time}</div>
              <div className="flex-1 min-h-[60px]">
                {aptsAtTime.map(apt => (
                  <div
                    key={apt.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, apt)}
                    onClick={() => onAppointmentClick(apt)}
                    className={`p-2 mb-2 rounded-lg border-l-4 ${priorityColors[apt.priority]} cursor-move`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">{apt.patientName}</p>
                        <p className="text-xs text-muted-foreground">{apt.type}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {apt.startTime} - {apt.endTime}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => {
          const dayAppointments = filterAppointmentsByDate(day);
          const isToday = day.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[300px] p-2 border rounded-lg ${isToday ? 'border-primary bg-blue-50/30' : 'border-border'}`}
              onDrop={(e) => handleDrop(e, day)}
              onDragOver={handleDragOver}
            >
              <div className="text-center mb-2">
                <div className="text-sm text-muted-foreground">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg ${isToday ? 'text-primary' : ''}`}>
                  {day.getDate()}
                </div>
              </div>
              <div className="space-y-2">
                {dayAppointments.map(apt => (
                  <div
                    key={apt.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, apt)}
                    onClick={() => onAppointmentClick(apt)}
                    className={`p-2 rounded border-l-4 ${priorityColors[apt.priority]} cursor-move text-xs`}
                  >
                    <div className="truncate">{apt.patientName}</div>
                    <div className="text-muted-foreground">{apt.startTime}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const days = [];
    const currentIterDate = new Date(startDate);
    
    while (days.length < 35) {
      days.push(new Date(currentIterDate));
      currentIterDate.setDate(currentIterDate.getDate() + 1);
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm text-muted-foreground p-2">
            {day}
          </div>
        ))}
        {days.map(day => {
          const dayAppointments = filterAppointmentsByDate(day);
          const isCurrentMonth = day.getMonth() === month;
          const isToday = day.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[80px] p-2 border rounded-lg ${
                isToday ? 'border-primary bg-blue-50/30' : 'border-border'
              } ${!isCurrentMonth ? 'opacity-40' : ''}`}
              onDrop={(e) => handleDrop(e, day)}
              onDragOver={handleDragOver}
            >
              <div className={`text-sm mb-1 ${isToday ? 'text-primary' : ''}`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 2).map(apt => (
                  <div
                    key={apt.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, apt)}
                    onClick={() => onAppointmentClick(apt)}
                    className={`p-1 rounded text-xs truncate border-l-2 ${priorityColors[apt.priority]} cursor-move`}
                  >
                    {apt.patientName}
                  </div>
                ))}
                {dayAppointments.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayAppointments.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Calendar</CardTitle>
          <Tabs value={view} onValueChange={(v) => setView(v as ViewType)}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm">{getDateRange()}</div>
          <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}
      </CardContent>
    </Card>
  );
}
