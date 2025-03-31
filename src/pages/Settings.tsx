
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { 
  Settings as SettingsIcon, 
  Bell, 
  User, 
  Shield, 
  Cloud, 
  Laptop, 
  Moon, 
  Sun, 
  Vibrate 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const Settings = () => {
  const { toast } = useToast();
  const { userRole, user } = useAuth();
  const [defaultTab] = useState<string>('profile');
  
  // State for various settings
  const [theme, setTheme] = useState<string>('system');
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [pushNotifications, setPushNotifications] = useState<boolean>(true);
  const [offlineMode, setOfflineMode] = useState<boolean>(true);
  const [syncFrequency, setSyncFrequency] = useState<number>(15);
  
  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notification preferences saved",
      description: "Your notification preferences have been updated",
    });
  };
  
  const handleSaveAppearance = () => {
    toast({
      title: "Appearance settings saved",
      description: "Your appearance settings have been updated",
    });
  };
  
  const handleSaveOfflineSettings = () => {
    toast({
      title: "Offline settings saved",
      description: "Your offline settings have been updated",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Settings</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="appearance">
                <Moon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="offline">
                <Cloud className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Offline</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue={user?.email || ''}
                    disabled 
                  />
                  <p className="text-sm text-muted-foreground">
                    Your email address is managed by your account
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input 
                    id="full-name" 
                    defaultValue="John Doe" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{userRole}</span>
                  </div>
                </div>
                
                <Button onClick={handleSaveProfile}>
                  Save Profile
                </Button>
              </div>
            </TabsContent>
            
            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important events
                    </p>
                  </div>
                  <Switch 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive in-app notifications
                    </p>
                  </div>
                  <Switch 
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-base">Notification Events</Label>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2" htmlFor="report-submitted">
                        <span>Report Submitted</span>
                      </Label>
                      <Switch id="report-submitted" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2" htmlFor="report-reviewed">
                        <span>Report Reviewed</span>
                      </Label>
                      <Switch id="report-reviewed" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2" htmlFor="system-updates">
                        <span>System Updates</span>
                      </Label>
                      <Switch id="system-updates" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <Button onClick={handleSaveNotifications}>
                  Save Notification Settings
                </Button>
              </div>
            </TabsContent>
            
            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <RadioGroup defaultValue={theme} onValueChange={setTheme}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="theme-light" />
                      <Label htmlFor="theme-light" className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="theme-dark" />
                      <Label htmlFor="theme-dark" className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="theme-system" />
                      <Label htmlFor="theme-system" className="flex items-center gap-2">
                        <Laptop className="h-4 w-4" />
                        System
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <RadioGroup defaultValue="medium">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="small" id="font-small" />
                      <Label htmlFor="font-small">Small</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="font-medium" />
                      <Label htmlFor="font-medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="large" id="font-large" />
                      <Label htmlFor="font-large">Large</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Button onClick={handleSaveAppearance}>
                  Save Appearance Settings
                </Button>
              </div>
            </TabsContent>
            
            {/* Offline Tab */}
            <TabsContent value="offline" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Offline Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable offline functionality for report creation
                    </p>
                  </div>
                  <Switch 
                    checked={offlineMode}
                    onCheckedChange={setOfflineMode}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Sync Frequency</Label>
                    <span className="text-sm text-muted-foreground">{syncFrequency} minutes</span>
                  </div>
                  <Slider
                    defaultValue={[syncFrequency]}
                    min={5}
                    max={60}
                    step={5}
                    onValueChange={(value) => setSyncFrequency(value[0])}
                  />
                  <p className="text-sm text-muted-foreground">
                    How often to sync offline reports when connection is restored
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Storage Limit</Label>
                  <Select defaultValue="500">
                    <SelectTrigger>
                      <SelectValue placeholder="Select storage limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 MB</SelectItem>
                      <SelectItem value="250">250 MB</SelectItem>
                      <SelectItem value="500">500 MB</SelectItem>
                      <SelectItem value="1000">1 GB</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Maximum storage for offline reports and photos
                  </p>
                </div>
                
                <Button onClick={handleSaveOfflineSettings}>
                  Save Offline Settings
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
