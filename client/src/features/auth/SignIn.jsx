import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Gavel, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

const signInSchema = z.object({
  email: z.string().email("Please enter a valid professional email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function SignIn() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useReactHookForm({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success('Successfully logged in');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Invalid credentials');
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
        </div>
      </section>
    </main>
  );
}
