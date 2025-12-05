import { useState, useEffect } from 'react';
import { Bell, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ReminderSettings {
  enabled: boolean;
  time: string;
  days: string[];
}

const defaultSettings: ReminderSettings = {
  enabled: false,
  time: '09:00',
  days: ['mon', 'tue', 'wed', 'thu', 'fri']
};

const dayOptions = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
];

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return { value: `${hour}:00`, label: `${hour}:00` };
});

export function StudyReminder() {
  const [settings, setSettings] = useState<ReminderSettings>(defaultSettings);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem('study-reminder-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications are not supported in this browser');
      return false;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      toast.success('Notifications enabled!');
      return true;
    } else {
      toast.error('Notification permission denied');
      return false;
    }
  };

  const handleToggle = async (enabled: boolean) => {
    if (enabled && notificationPermission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }

    const newSettings = { ...settings, enabled };
    setSettings(newSettings);
    localStorage.setItem('study-reminder-settings', JSON.stringify(newSettings));

    if (enabled) {
      toast.success('Study reminders enabled!');
    }
  };

  const handleTimeChange = (time: string) => {
    const newSettings = { ...settings, time };
    setSettings(newSettings);
    localStorage.setItem('study-reminder-settings', JSON.stringify(newSettings));
  };

  const handleDayToggle = (day: string) => {
    const newDays = settings.days.includes(day)
      ? settings.days.filter(d => d !== day)
      : [...settings.days, day];
    
    const newSettings = { ...settings, days: newDays };
    setSettings(newSettings);
    localStorage.setItem('study-reminder-settings', JSON.stringify(newSettings));
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Study Reminders</h3>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={handleToggle}
            aria-label="Enable study reminders"
          />
        </div>

        {settings.enabled && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-4">
              <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Remind me at
              </Label>
              <Select value={settings.time} onValueChange={handleTimeChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                On these days
              </Label>
              <div className="flex flex-wrap gap-2">
                {dayOptions.map(day => (
                  <Button
                    key={day.value}
                    variant={settings.days.includes(day.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDayToggle(day.value)}
                    className="w-10"
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              You'll receive a browser notification to remind you to study. Make sure to keep this tab open.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
