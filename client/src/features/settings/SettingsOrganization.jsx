import React from 'react';
import { Settings, User, Bell, Shield, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsOrganization() {
  return (
    <div className="space-y-lg max-w-container-max mx-auto flex flex-col md:flex-row gap-lg">
      
      {/* Settings Navigation */}
      <div className="w-full md:w-[240px] space-y-xs shrink-0">
        <h2 className="font-label-lg px-md pb-sm text-on-surface-variant uppercase tracking-wider">Settings</h2>
        <button className="w-full text-left px-md py-sm rounded-lg bg-surface-container-high text-on-surface font-label-md flex items-center gap-md border-l-4 border-primary">
          <Settings size={18} /> General
        </button>
        <button className="w-full text-left px-md py-sm rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md flex items-center gap-md transition-colors border-l-4 border-transparent">
          <User size={18} /> Account Profile
        </button>
        <button className="w-full text-left px-md py-sm rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md flex items-center gap-md transition-colors border-l-4 border-transparent">
          <Bell size={18} /> Notifications
        </button>
        <button className="w-full text-left px-md py-sm rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md flex items-center gap-md transition-colors border-l-4 border-transparent">
          <Shield size={18} /> Security & Privacy
        </button>
        <button className="w-full text-left px-md py-sm rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md flex items-center gap-md transition-colors border-l-4 border-transparent">
          <CreditCard size={18} /> Billing
        </button>
      </div>

      {/* Settings Content */}
      <div className="flex-1 space-y-lg">
        <div>
          <h1 className="font-headline-lg text-on-surface">Organization Settings</h1>
          <p className="font-body-md text-on-surface-variant">Update your firm's profile, preferences, and billing information.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Firm Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            <div className="flex items-center gap-md mb-lg border-b border-outline-variant/30 pb-md">
              <div className="w-16 h-16 bg-primary-container rounded-lg flex items-center justify-center">
                <span className="font-headline-md text-on-primary-container">PL</span>
              </div>
              <Button variant="outline">Change Logo</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <Input label="Organization Name" defaultValue="Proton Legal LLC" />
              <Input label="Registration Number" defaultValue="REG-2024-998" />
              <Input label="Support Email" type="email" defaultValue="support@protonlegal.com" />
              <Input label="Phone Number" type="tel" defaultValue="+1 (555) 000-0000" />
            </div>

            <div className="pt-md flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
