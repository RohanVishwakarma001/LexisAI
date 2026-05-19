import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Gavel, Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const signInSchema = z.object({
  email: z.string().email("Please enter a valid professional email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function SignIn() {
  const navigate = useNavigate();
  const [show2FA, setShow2FA] = useState(false);
  const [mfaUserId, setMfaUserId] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useReactHookForm({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/auth/login', data);
      
      if (response.data?.status === '2fa_required') {
        setMfaUserId(response.data.data.userId);
        setShow2FA(true);
        toast.success('MFA Verification required');
        return;
      }

      if (response.data?.status === 'success' && response.data?.data?.user) {
        useAuthStore.setState({
          user: response.data.data.user,
          isAuthenticated: true,
        });
        toast.success('Successfully logged in');
        
        const user = response.data.data.user;
        if (user.role === 'ADMIN') {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    }
  };

  const handleVerify2FALogin = async (e) => {
    e.preventDefault();
    if (!mfaToken.trim()) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }
    
    setIsVerifying(true);
    const loadToast = toast.loading('Verifying MFA token...');
    try {
      const response = await api.post('/auth/login/2fa', {
        userId: mfaUserId,
        token: mfaToken,
      });
      
      if (response.data?.status === 'success' && response.data?.data?.user) {
        useAuthStore.setState({
          user: response.data.data.user,
          isAuthenticated: true,
        });
        toast.dismiss(loadToast);
        toast.success('Successfully authenticated with MFA!');
        
        const user = response.data.data.user;
        if (user.role === 'ADMIN') {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast.dismiss(loadToast);
      toast.error(error.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-background text-on-surface selection:bg-primary/30">
      {/* Left Section */}
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-surface-container-lowest border-r border-outline-variant/30 flex-col justify-between p-xl">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-secondary/5 blur-[150px]"></div>
        </div>
        
        <div className="relative z-10 flex items-center gap-md">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center border border-primary/20">
            <Gavel className="text-on-primary-container" size={24} />
          </div>
          <span className="font-headline-md font-bold tracking-tight text-on-surface">Proton Legal</span>
        </div>
        
        <div className="relative z-10 max-w-xl">
          <h1 className="font-display text-display mb-lg leading-tight">Precision in every brief. Intelligence in every argument.</h1>
          <p className="font-body-lg text-on-surface-variant max-w-md">
            Join over 5,000 elite legal professionals leveraging computational intelligence to automate discovery, research, and analysis.
          </p>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-lg">
            <span className="font-label-md text-on-surface-variant/70">Trusted by Global Tier-1 Law Firms</span>
          </div>
        </div>
      </section>

      {/* Right Section */}
      <section className="flex-1 flex flex-col justify-center items-center p-lg md:p-xl bg-background relative">
        <div className="w-full max-w-[420px] bg-surface-container-lowest p-xl rounded-xl shadow-2xl border border-outline-variant/30">
          {!show2FA ? (
            <>
              <div className="mb-xl text-center md:text-left">
                <h2 className="font-headline-lg mb-xs">Sign In</h2>
                <p className="font-body-md text-on-surface-variant">Enter your credentials to access your secure vault.</p>
              </div>

              <form className="space-y-lg" onSubmit={handleSubmit(onSubmit)}>
                <Input 
                  label="Professional Email"
                  id="email"
                  type="email"
                  placeholder="name@firm.com"
                  leftIcon={<Mail size={20} />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                
                <Input 
                  label="Password"
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock size={20} />}
                  error={errors.password?.message}
                  {...register('password')}
                />
                
                <div className="flex items-center justify-between ml-xs">
                  <div className="flex items-center gap-md">
                    <input className="w-4 h-4 rounded border-outline-variant bg-surface-container-low text-primary focus:ring-primary/40" id="remember" type="checkbox" />
                    <label className="font-body-md text-on-surface-variant" htmlFor="remember">Remember me</label>
                  </div>
                  <Link className="font-label-md text-primary hover:text-primary-fixed transition-colors" to="/forgot-password">Forgot Password?</Link>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-lg"
                  size="lg"
                  isLoading={isSubmitting}
                >
                  Sign In
                </Button>
              </form>

              <div className="mt-xl text-center">
                <p className="font-body-md text-on-surface-variant">
                  Don't have an account?{' '}
                  <Link className="text-primary font-bold hover:underline decoration-primary/30 underline-offset-4" to="/create-account">Sign up</Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-xl text-center md:text-left">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-md mx-auto md:mx-0">
                  <ShieldCheck size={28} />
                </div>
                <h2 className="font-headline-lg mb-xs">MFA Verification</h2>
                <p className="font-body-md text-on-surface-variant">Your account is protected by multi-factor authentication. Enter your 6-digit authenticator code below.</p>
              </div>

              <form className="space-y-lg" onSubmit={handleVerify2FALogin}>
                <Input 
                  label="Authenticator Code"
                  id="token"
                  placeholder="123456"
                  maxLength={6}
                  value={mfaToken}
                  onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, ''))}
                  required
                  className="text-center font-mono tracking-widest text-lg"
                />
                
                <Button 
                  type="submit" 
                  className="w-full mt-lg"
                  size="lg"
                  isLoading={isVerifying}
                >
                  Verify Code
                </Button>

                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setShow2FA(false);
                    setMfaToken('');
                  }}
                >
                  Back to Sign In
                </Button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
