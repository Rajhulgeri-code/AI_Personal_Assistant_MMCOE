import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Notification } from '../types';
import { Bell, AlertCircle, Info, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
}

export function NotificationPanel({
  notifications,
  onMarkAsRead,
  onNotificationClick,
}: NotificationPanelProps) {
  const [open, setOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          <div className="space-y-3 pr-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    getBgColor(notification.type)
                  } ${notification.read ? 'opacity-60' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm">{notification.title}</p>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                        {notification.actionable && (
                          <Badge variant="outline" className="text-xs">
                            Actionable
                          </Badge>
                        )}
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
