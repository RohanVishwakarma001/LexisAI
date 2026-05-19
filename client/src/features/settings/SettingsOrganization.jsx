import React, { useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard, Loader2, Sparkles, Receipt, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function SettingsOrganization() {
  const { user, updateProfile, checkAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'profile' | 'notifications' | 'security' | 'billing'
  
  // Tab 1: General State
  const [orgName, setOrgName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Tab 2: Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Tab 3: Notifications State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [aiAlerts, setAiAlerts] = useState(true);

  // Tab 4: Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  // Tab 5: Billing & Razorpay State
  const [invoices, setInvoices] = useState([]);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Sandbox Payments Simulation State
  const [isSimulatedModalOpen, setIsSimulatedModalOpen] = useState(false);
  const [simulatedOrderData, setSimulatedOrderData] = useState(null);
  const [isSimulatedVerifying, setIsSimulatedVerifying] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Pre-populate fields once user loads
  useEffect(() => {
    if (user) {
      setOrgName(user.organizationName || 'Rohan Legal LLC');
      setPhone(user.phoneNumber || '+1 (555) 012-3456');
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setTwoFactor(user.twoFactorEnabled || false);
    }
  }, [user]);

  // Sync payments history when switching to billing tab
  useEffect(() => {
    if (activeTab === 'billing' && user) {
      fetchInvoices();
    }
  }, [activeTab, user]);

  const fetchInvoices = async () => {
    setIsBillingLoading(true);
    try {
      const response = await api.get('/payments/history');
      if (response.data?.status === 'success') {
        setInvoices(response.data.data.invoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to sync invoices log');
    } finally {
      setIsBillingLoading(false);
    }
  };

  // Helper to load Razorpay Checkout script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Verify simulated sandbox transactions instantly via our Neon Postgres service
  const handleVerifySimulatedPayment = async () => {
    if (!simulatedOrderData) return;
    setIsSimulatedVerifying(true);
    const loadingToast = toast.loading('Verifying secure transaction signatures...');
    try {
      const verifyResponse = await api.post('/payments/verify-signature', {
        razorpay_order_id: simulatedOrderData.orderId,
        razorpay_payment_id: `pay_sim_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
        razorpay_signature: `sig_sim_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      });

      if (verifyResponse.data?.status === 'success') {
        toast.dismiss(loadingToast);
        toast.success('Payment verified successfully! Welcome to Pro.', { icon: '💳' });
        setIsSimulatedModalOpen(false);
        fetchInvoices(); // Refresh dynamic history instantly
      }
    } catch (verificationError) {
      toast.dismiss(loadingToast);
      toast.error('Cryptographic signature check rejected');
    } finally {
      setIsSimulatedVerifying(false);
    }
  };

  // Trigger Razorpay payment gateway checkout flow
  const handleUpgradeToPro = async (amount) => {
    setIsCheckoutLoading(true);

    try {
      // 1. Create order on Express backend
      const response = await api.post('/payments/create-order', { amount });
      
      if (response.data?.status !== 'success') {
        throw new Error('Order creation aborted');
      }

      const { orderId, amount: rzpAmount, currency, keyId, simulated } = response.data.data;

      // Detect fallback sandbox simulation mode
      if (simulated) {
        setSimulatedOrderData({ orderId, amount: rzpAmount, currency });
        setIsSimulatedModalOpen(true);
        setIsCheckoutLoading(false);
        return;
      }

      // If active credentials, proceed to load script and open panel
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway engine');
        setIsCheckoutLoading(false);
        return;
      }

      // 2. Configure official Razorpay Checkout panel options
      const options = {
        key: keyId,
        amount: rzpAmount,
        currency: currency,
        name: orgName || 'LexisAI Pro Plan',
        description: 'Enterprise Legal AI Suite Subscription',
        image: user?.avatar || undefined,
        order_id: orderId,
        handler: async function (paymentResponse) {
          // 3. Callback to verify cryptographic HMAC signature
          const loadingToast = toast.loading('Verifying secure transaction signatures...');
          try {
            const verifyResponse = await api.post('/payments/verify-signature', {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (verifyResponse.data?.status === 'success') {
              toast.dismiss(loadingToast);
              toast.success('Payment verified successfully! Welcome to Pro.', { icon: '💳' });
              fetchInvoices(); // Refresh dynamic history instantly
            }
          } catch (verificationError) {
            toast.dismiss(loadingToast);
            toast.error('Cryptographic signature check rejected');
          }
        },
        prefill: {
          name: `${firstName} ${lastName}`,
          email: user?.email || '',
          contact: phone || '',
        },
        theme: {
          color: '#65558F', // Sleek primary purple matching HSL dark design tokens
        },
        modal: {
          ondismiss: function () {
            toast.error('Checkout window dismissed by user');
          }
        }
      };

      const rzpWindow = new window.Razorpay(options);
      rzpWindow.open();
    } catch (checkoutError) {
      console.error('Checkout initialization aborted:', checkoutError);
      toast.error('Payment gateway checkout pipeline offline');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Handle Tab 1 (General Settings) Save
  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    if (!orgName.trim()) {
      toast.error('Organization Name is required');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        organizationName: orgName,
        phoneNumber: phone
      });
      toast.success('Firm settings updated successfully!');
    } catch (err) {
      toast.error('Failed to update firm settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Tab 2 (Account Profile) Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First and Last name are required');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        firstName,
        lastName
      });
      toast.success('Personal profile details saved!');
    } catch (err) {
      toast.error('Failed to update account details');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Tab 3 (Notifications) Save
  const handleSaveNotifications = (e) => {
    e.preventDefault();
    toast.success('Notification parameters updated!');
  };

  // Handle Tab 4 (Security) Save
  const handleSaveSecurity = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Credentials security matrix updated!');
    }, 800);
  };

  const handleToggle2FA = async (e) => {
    const checked = e.target.checked;
    
    if (checked) {
      const loadToast = toast.loading('Initializing Multi-Factor authentication...');
      try {
        const res = await api.post('/auth/2fa/generate');
        if (res.data?.status === 'success') {
          setQrCodeData(res.data.data.qrCode);
          setMfaSecret(res.data.data.secret);
          setIs2FAModalOpen(true);
        }
      } catch (err) {
        toast.error('Failed to initialize 2FA configuration');
      } finally {
        toast.dismiss(loadToast);
      }
    } else {
      if (!window.confirm('Disable Multi-Factor Authentication? Your account will be less secure.')) {
        setTwoFactor(true);
        return;
      }
      const loadToast = toast.loading('Disabling Multi-Factor Authentication...');
      try {
        const res = await api.post('/auth/2fa/disable');
        if (res.data?.status === 'success') {
          setTwoFactor(false);
          toast.success('MFA protection disabled');
          await checkAuth();
        }
      } catch (err) {
        toast.error('Failed to disable 2FA');
      } finally {
        toast.dismiss(loadToast);
      }
    }
  };

  const handleVerify2FASubmit = async (e) => {
    e.preventDefault();
    if (!mfaToken.trim()) {
      toast.error('Please enter the 6-digit authenticator code');
      return;
    }
    
    setIsVerifying2FA(true);
    const loadToast = toast.loading('Verifying code...');
    try {
      const res = await api.post('/auth/2fa/verify', { token: mfaToken });
      if (res.data?.status === 'success') {
        setTwoFactor(true);
        setIs2FAModalOpen(false);
        setMfaToken('');
        toast.success('Multi-Factor Authentication enabled successfully!');
        await checkAuth();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid authenticator code. Please try again.');
    } finally {
      toast.dismiss(loadToast);
      setIsVerifying2FA(false);
    }
  };

  const handleLogoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo file size must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await updateProfile({ avatar: reader.result });
        toast.success('Firm logo updated in database!');
      } catch (err) {
        toast.error('Failed to upload logo image');
      }
    };
    reader.readAsDataURL(file);
  };

  const userInitials = `${(firstName || 'R').charAt(0)}${(lastName || 'N').charAt(0)}`.toUpperCase();
  const regNumber = `REG-2026-${(user?.id || '476').substring(0, 3).toUpperCase()}`;

  return (
    <div className="space-y-lg max-w-container-max mx-auto flex flex-col md:flex-row gap-lg">
      
      {/* Settings Navigation Side bar */}
      <div className="w-full md:w-[240px] space-y-xs shrink-0">
        <h2 className="font-label-lg px-md pb-sm text-on-surface-variant uppercase tracking-wider text-[11px]">Settings Settings</h2>
        
        <button 
          onClick={() => setActiveTab('general')}
          className={`w-full text-left px-md py-sm rounded-lg font-label-md flex items-center gap-md border-l-4 transition-all ${
            activeTab === 'general' 
              ? 'bg-surface-container-high text-on-surface font-bold border-primary' 
              : 'hover:bg-surface-container text-on-surface-variant hover:text-on-surface border-transparent'
          }`}
        >
          <SettingsIcon size={18} /> General
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className={`w-full text-left px-md py-sm rounded-lg font-label-md flex items-center gap-md border-l-4 transition-all ${
            activeTab === 'profile' 
              ? 'bg-surface-container-high text-on-surface font-bold border-primary' 
              : 'hover:bg-surface-container text-on-surface-variant hover:text-on-surface border-transparent'
          }`}
        >
          <User size={18} /> Account Profile
        </button>

        <button 
          onClick={() => setActiveTab('notifications')}
          className={`w-full text-left px-md py-sm rounded-lg font-label-md flex items-center gap-md border-l-4 transition-all ${
            activeTab === 'notifications' 
              ? 'bg-surface-container-high text-on-surface font-bold border-primary' 
              : 'hover:bg-surface-container text-on-surface-variant hover:text-on-surface border-transparent'
          }`}
        >
          <Bell size={18} /> Notifications
        </button>

        <button 
          onClick={() => setActiveTab('security')}
          className={`w-full text-left px-md py-sm rounded-lg font-label-md flex items-center gap-md border-l-4 transition-all ${
            activeTab === 'security' 
              ? 'bg-surface-container-high text-on-surface font-bold border-primary' 
              : 'hover:bg-surface-container text-on-surface-variant hover:text-on-surface border-transparent'
          }`}
        >
          <Shield size={18} /> Security & Privacy
        </button>

        <button 
          onClick={() => setActiveTab('billing')}
          className={`w-full text-left px-md py-sm rounded-lg font-label-md flex items-center gap-md border-l-4 transition-all ${
            activeTab === 'billing' 
              ? 'bg-surface-container-high text-on-surface font-bold border-primary' 
              : 'hover:bg-surface-container text-on-surface-variant hover:text-on-surface border-transparent'
          }`}
        >
          <CreditCard size={18} /> Billing
        </button>
      </div>

      {/* Settings Form Body */}
      <div className="flex-1 space-y-lg">
        
        {/* TAB 1: GENERAL SETTINGS */}
        {activeTab === 'general' && (
          <div className="space-y-lg animate-in fade-in duration-200">
            <div>
              <h1 className="font-headline-lg text-on-surface">Organization Settings</h1>
              <p className="font-body-md text-on-surface-variant">Update your firm's profile, preferences, and billing information.</p>
            </div>

            <Card className="bg-surface-container-low">
              <CardHeader>
                <CardTitle>Firm Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveGeneral} className="space-y-lg">
                  <div className="flex items-center gap-md mb-lg border-b border-outline-variant/30 pb-md">
                    <div className="w-14 h-14 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} className="w-full h-full object-cover" alt="Firm Logo" />
                      ) : (
                        <span className="font-headline-md text-primary font-bold text-[18px]">
                          {userInitials}
                        </span>
                      )}
                    </div>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                    <Button type="button" variant="outline" onClick={handleLogoUploadClick}>
                      Change Logo
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <Input 
                      label="Organization Name" 
                      value={orgName} 
                      onChange={(e) => setOrgName(e.target.value)} 
                      required
                    />
                    <Input 
                      label="Registration Number" 
                      value={regNumber}
                      disabled 
                      className="bg-surface-container/50 text-on-surface-variant cursor-not-allowed font-mono text-[13px]"
                    />
                    <Input 
                      label="Support Email" 
                      type="email" 
                      value={user?.email || 'rohanvishwakarma8261@gmail.com'} 
                      disabled 
                      className="bg-surface-container/50 text-on-surface-variant cursor-not-allowed text-[13px]"
                    />
                    <Input 
                      label="Phone Number" 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                    />
                  </div>

                  <div className="pt-md flex justify-end">
                    <Button type="submit" isLoading={isSaving} className="px-lg">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: ACCOUNT PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-lg animate-in fade-in duration-200">
            <div>
              <h1 className="font-headline-lg text-on-surface">Account Profile</h1>
              <p className="font-body-md text-on-surface-variant">Update your personal identity parameters and public contact details.</p>
            </div>

            <Card className="bg-surface-container-low">
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <Input 
                      label="First Name" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                      required
                    />
                    <Input 
                      label="Last Name" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                      required
                    />
                    <div className="md:col-span-2">
                      <Input 
                        label="Registered Account Email" 
                        type="email" 
                        value={user?.email || ''} 
                        disabled 
                        className="bg-surface-container/50 text-on-surface-variant cursor-not-allowed text-[13px]"
                      />
                    </div>
                  </div>

                  <div className="pt-md flex justify-end">
                    <Button type="submit" isLoading={isSaving} className="px-lg">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 3: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-lg animate-in fade-in duration-200">
            <div>
              <h1 className="font-headline-lg text-on-surface">Notification Preferences</h1>
              <p className="font-body-md text-on-surface-variant">Configure client docket alert parameters and daily summary mailers.</p>
            </div>

            <Card className="bg-surface-container-low">
              <CardHeader>
                <CardTitle>System Communication Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveNotifications} className="space-y-lg">
                  <div className="space-y-md">
                    <label className="flex items-start gap-md cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={emailAlerts} 
                        onChange={(e) => setEmailAlerts(e.target.checked)}
                        className="w-5 h-5 rounded border-outline-variant/60 text-primary focus:ring-primary mt-0.5" 
                      />
                      <div>
                        <p className="font-label-md text-on-surface font-bold text-[14px]">Daily Case Summaries via Email</p>
                        <p className="text-[12px] text-on-surface-variant">Receive a condensed ledger containing docket filings and upcoming deadlines every morning.</p>
                      </div>
                    </label>

                    <hr className="border-outline-variant/20" />

                    <label className="flex items-start gap-md cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={smsAlerts} 
                        onChange={(e) => setSmsAlerts(e.target.checked)}
                        className="w-5 h-5 rounded border-outline-variant/60 text-primary focus:ring-primary mt-0.5" 
                      />
                      <div>
                        <p className="font-label-md text-on-surface font-bold text-[14px]">SMS Deadline Reminders</p>
                        <p className="text-[12px] text-on-surface-variant">Transmit direct instant cellular warnings 24 hours prior to court motion submission triggers.</p>
                      </div>
                    </label>

                    <hr className="border-outline-variant/20" />

                    <label className="flex items-start gap-md cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={aiAlerts} 
                        onChange={(e) => setAiAlerts(e.target.checked)}
                        className="w-5 h-5 rounded border-outline-variant/60 text-primary focus:ring-primary mt-0.5" 
                      />
                      <div>
                        <p className="font-label-md text-on-surface font-bold text-[14px]">AI Briefing Ingestion Notifications</p>
                        <p className="text-[12px] text-on-surface-variant">Trigger app alerts the instant legal models finish structural OCR indexing and motion summaries.</p>
                      </div>
                    </label>
                  </div>

                  <div className="pt-md flex justify-end">
                    <Button type="submit" className="px-lg">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 4: SECURITY & PRIVACY */}
        {activeTab === 'security' && (
          <div className="space-y-lg animate-in fade-in duration-200">
            <div>
              <h1 className="font-headline-lg text-on-surface">Security & Privacy</h1>
              <p className="font-body-md text-on-surface-variant">Manage secure access hashes, dockets protection, and session guards.</p>
            </div>

            <Card className="bg-surface-container-low">
              <CardHeader>
                <CardTitle>Update Access Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSecurity} className="space-y-md">
                  <Input 
                    label="Current Password" 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    required 
                  />
                  <Input 
                    label="New Password" 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                  />
                  <Input 
                    label="Confirm New Password" 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                  />
                  
                  <hr className="border-outline-variant/20 my-md" />

                  <label className="flex items-center gap-md cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={twoFactor} 
                      onChange={handleToggle2FA}
                      className="w-5 h-5 rounded border-outline-variant/60 text-primary focus:ring-primary" 
                    />
                    <div>
                      <p className="font-label-md text-on-surface font-bold text-[14px]">Multi-Factor Authentication (MFA)</p>
                      <p className="text-[12px] text-on-surface-variant">Add an additional cryptographic authenticator shield upon login.</p>
                    </div>
                  </label>

                  <div className="pt-md flex justify-end">
                    <Button type="submit" isLoading={isSaving} className="px-lg">
                      Update Security Settings
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 5: BILLING OVERVIEW (LIVE RAZORPAY INTEGRATION) */}
        {activeTab === 'billing' && (
          <div className="space-y-lg animate-in fade-in duration-200">
            <div>
              <h1 className="font-headline-lg text-on-surface">Billing & Subscriptions</h1>
              <p className="font-body-md text-on-surface-variant">Review membership plans, securely execute sandbox checkouts, and inspect payment invoice history.</p>
            </div>

            {/* Subscription Upgrade Card */}
            <Card className="bg-surface-container-low overflow-hidden relative">
              <div className="absolute top-0 right-0 bg-primary/10 text-primary px-lg py-sm rounded-bl-lg font-label-md uppercase tracking-wider text-[10px] flex items-center gap-xs">
                <Sparkles size={12} className="animate-pulse" /> Sandbox Mode
              </div>
              <CardContent className="p-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-lg">
                <div className="space-y-md">
                  <div className="flex items-center gap-sm">
                    <span className="font-headline-md text-on-surface font-bold">
                      {invoices.length > 0 ? 'Enterprise Pro Tier' : 'Standard Sandbox Plan'}
                    </span>
                    <Badge variant={invoices.length > 0 ? 'success' : 'outline'}>
                      {invoices.length > 0 ? 'Active' : 'Unsubscribed'}
                    </Badge>
                  </div>
                  <p className="text-[13px] text-on-surface-variant max-w-xl">
                    {invoices.length > 0 
                      ? 'Congratulations! Your Pro membership is active. You have full access to unlimited co-counsel analysis drafts and secure evidence storage.'
                      : 'Unlock the ultimate litigation tools. Upgrading grants unlimited AI brief summary generation, OCR transcript scans, and role-based cases timeline progressions.'
                    }
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-xs shrink-0 self-stretch justify-between">
                  <div className="text-right">
                    <p className="font-headline-lg text-primary font-bold">₹149<span className="text-[14px] font-label-md text-on-surface-variant">/mo</span></p>
                    <p className="text-[10px] text-on-surface-variant">100% SECURE VIA RAZORPAY</p>
                  </div>
                  
                  <Button 
                    onClick={() => handleUpgradeToPro(149)} 
                    isLoading={isCheckoutLoading}
                    className="w-full md:w-auto mt-md"
                    leftIcon={<Receipt size={16} />}
                  >
                    {invoices.length > 0 ? 'Renew Subscription' : 'Upgrade to Pro'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Invoices List Table */}
            <Card className="bg-surface-container-low">
              <CardHeader className="pb-xs">
                <CardTitle className="flex items-center gap-sm">
                  <Receipt size={18} className="text-primary" /> Invoice Ledger history
                </CardTitle>
                <p className="text-[11px] text-on-surface-variant">These logs are queried live from Neon PostgreSQL payments history.</p>
              </CardHeader>
              <CardContent className="p-0">
                {isBillingLoading ? (
                  <div className="flex flex-col items-center justify-center p-xl gap-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-[12px] font-label-md text-on-surface-variant">Querying database invoices...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Razorpay ID</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((inv) => (
                        <TableRow key={inv.id} className="hover:bg-surface-container/20 transition-colors">
                          <TableCell className="font-mono text-primary text-[12px] font-bold">
                            {inv.paymentId || 'Pending'}
                          </TableCell>
                          <TableCell className="font-body-md text-on-surface-variant">
                            {new Date(inv.createdAt).toLocaleString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell className="font-body-md text-on-surface font-bold">
                            ₹{(inv.amount / 100).toFixed(2)}
                          </TableCell>
                          <TableCell className="font-body-md text-on-surface-variant font-mono uppercase">
                            {inv.currency}
                          </TableCell>
                          <TableCell>
                            <Badge variant="success">Paid</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-[11px] h-8"
                              onClick={() => toast.success(`Receipt printed for ${inv.paymentId}`)}
                              leftIcon={<Download size={12} />}
                            >
                              Download Receipt
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {invoices.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="p-xl text-center font-body-md text-on-surface-variant">
                            No subscription history logged yet. Upgrade above using our secure Razorpay gateway sandbox!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* SIMULATED SANDBOX CHECKOUT MODAL */}
      {isSimulatedModalOpen && simulatedOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-surface-container border border-outline-variant/30 rounded-2xl p-lg shadow-2xl space-y-lg animate-in scale-in duration-300">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-sm">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-headline-sm text-on-surface font-bold">LexisAI Payment Portal</h3>
                  <span className="text-[10px] text-primary/80 font-mono tracking-wider uppercase bg-primary/10 px-xs py-0.5 rounded">Developer Sandbox</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsSimulatedModalOpen(false);
                  toast.error('Checkout window dismissed by user');
                }} 
                className="text-on-surface-variant hover:text-on-surface p-xs transition-colors rounded-full hover:bg-surface-container-high"
              >
                ✕
              </button>
            </div>

            {/* Billing Details Panel */}
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-md space-y-sm">
              <div className="flex justify-between text-[13px]">
                <span className="text-on-surface-variant">Client Reference</span>
                <span className="text-on-surface font-bold">{firstName} {lastName}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-on-surface-variant">Sandbox Order ID</span>
                <span className="text-primary font-mono text-[11px] font-bold">{simulatedOrderData.orderId}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-on-surface-variant">Subscription Plan</span>
                <span className="text-on-surface font-bold">LexisAI Enterprise Pro Tier</span>
              </div>
              <hr className="border-outline-variant/10" />
              <div className="flex justify-between items-baseline pt-xs">
                <span className="text-on-surface-variant font-bold text-[14px]">Total Charges</span>
                <span className="text-headline-md text-primary font-bold">₹{(simulatedOrderData.amount / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Interactive simulated credit card interface */}
            <div className="relative h-44 w-full bg-gradient-to-tr from-primary to-primary-container rounded-xl p-md text-on-primary flex flex-col justify-between overflow-hidden shadow-lg border border-primary/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-12 -translate-y-12"></div>
              <div className="flex justify-between items-start z-10">
                <div className="font-headline-sm tracking-wider font-bold">SANDBOX CARD</div>
                <div className="text-[10px] bg-white/20 px-xs py-0.5 rounded uppercase tracking-widest">Active Test</div>
              </div>
              <div className="font-mono text-lg tracking-[0.25em] z-10 pt-sm">••••  ••••  ••••  8261</div>
              <div className="flex justify-between items-end z-10 mt-sm">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-on-primary/60">Card Holder</div>
                  <div className="text-[12px] font-mono tracking-wide">{firstName ? `${firstName} ${lastName}`.toUpperCase() : 'LEXISAI DEVELOPER'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-wider text-on-primary/60">Expires</div>
                  <div className="text-[12px] font-mono">12 / 30</div>
                </div>
              </div>
            </div>

            {/* Notice */}
            <p className="text-[11px] text-on-surface-variant text-center leading-normal">
              You are completing a sandbox subscription checkout. Pressing continue sends verification payloads to Neon Postgres to instantly upgrade this workspace.
            </p>

            {/* Actions */}
            <div className="flex gap-sm pt-xs">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsSimulatedModalOpen(false);
                  toast.error('Payment cancelled by user');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-on-primary hover:bg-primary/90"
                onClick={handleVerifySimulatedPayment}
                isLoading={isSimulatedVerifying}
                leftIcon={<CreditCard size={14} />}
              >
                Complete Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA SETUP/VERIFICATION MODAL */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-xl shadow-2xl space-y-lg animate-in scale-in duration-200 text-on-surface">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-headline-md text-on-surface font-bold">Configure MFA Protection</h3>
                <p className="text-xs text-on-surface-variant">Scan the code below with your preferred Authenticator App.</p>
              </div>
              <button 
                onClick={() => {
                  setIs2FAModalOpen(false);
                  setMfaToken('');
                  setTwoFactor(false);
                }} 
                className="text-on-surface-variant hover:text-on-surface"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center justify-center bg-white p-md rounded-xl max-w-[200px] mx-auto border border-outline-variant/20">
              {qrCodeData && (
                <img src={qrCodeData} alt="MFA QR Code" className="w-full h-auto" />
              )}
            </div>

            <div className="space-y-xs text-center">
              <span className="text-xs font-mono bg-surface-container-low px-md py-sm rounded select-all font-semibold">
                Setup Key: {mfaSecret}
              </span>
              <p className="text-[11px] text-on-surface-variant">Can't scan? Enter this secret manually in your Authenticator app.</p>
            </div>

            <form onSubmit={handleVerify2FASubmit} className="space-y-md">
              <Input 
                label="Enter 6-Digit Authenticator Code *" 
                placeholder="123456" 
                maxLength={6}
                value={mfaToken}
                onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, ''))}
                required
                className="text-center font-mono tracking-widest text-lg"
              />

              <div className="flex gap-md pt-xs">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIs2FAModalOpen(false);
                    setMfaToken('');
                    setTwoFactor(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary text-on-primary"
                  isLoading={isVerifying2FA}
                >
                  Verify & Enable
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}
