import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Patient } from '../types';
import { Search, User, Calendar, AlertCircle } from 'lucide-react';

interface PatientManagementPanelProps {
  patients: Patient[];
  onPatientClick: (patient: Patient) => void;
}

export function PatientManagementPanel({ patients, onPatientClick }: PatientManagementPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const riskLevelColors = {
    high: 'bg-red-500 hover:bg-red-600',
    medium: 'bg-amber-500 hover:bg-amber-600',
    low: 'bg-blue-500 hover:bg-blue-600',
    none: 'bg-gray-400 hover:bg-gray-500',
  };

  const riskLevelBorders = {
    high: 'border-l-red-500',
    medium: 'border-l-amber-500',
    low: 'border-l-blue-500',
    none: 'border-l-gray-400',
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by risk level (high first)
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const riskOrder = { high: 0, medium: 1, low: 2, none: 3 };
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
  });

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Patient Management</CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {sortedPatients.map(patient => (
              <div
                key={patient.id}
                onClick={() => onPatientClick(patient)}
                className={`p-4 border-l-4 ${riskLevelBorders[patient.riskLevel]} bg-card hover:bg-muted/50 rounded-r-lg cursor-pointer transition-colors`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="truncate">{patient.name}</p>
                      <Badge className={riskLevelColors[patient.riskLevel]}>
                        {patient.riskLevel}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {patient.age} years • {patient.condition}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Last: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                      </div>
                      {patient.nextVisit && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Next: {new Date(patient.nextVisit).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    {patient.allergies && patient.allergies.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <AlertCircle className="h-3 w-3 text-red-600" />
                        <span className="text-xs text-red-600">
                          Allergies: {patient.allergies.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {sortedPatients.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No patients found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
