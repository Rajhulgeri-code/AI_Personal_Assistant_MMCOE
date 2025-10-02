import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { DashboardStats } from '../types';

interface OverviewCardsProps {
  stats: DashboardStats;
}

export function OverviewCards({ stats }: OverviewCardsProps) {
  const cards = [
    {
      title: 'Total Patients Today',
      value: stats.totalPatientsToday,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Emergency Cases',
      value: stats.emergencyCases,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Pending Follow-ups',
      value: stats.pendingFollowUps,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Completed',
      value: stats.completedAppointments,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
