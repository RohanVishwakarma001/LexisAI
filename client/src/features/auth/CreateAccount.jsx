import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Gavel, Mail, Lock, User, Building } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

const signUpSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  organization: z.string().min(2, "Organization name is required"),
  email: z.string().email("Please enter a valid professional email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function CreateAccount() {
  const navigate = useNavigate();
  const registerAction = useAuthStore((state) => state.register);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data) => {
    try {
      await registerAction(data);
      toast.success('Account created successfully');
      
      const user = useAuthStore.getState().user;
      if (user && user.role === 'ADMIN') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create account');
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-background text-on-surface">
      {/* Right Section (Form) */}
      <section className="flex-1 flex flex-col justify-center items-center p-lg md:p-xl relative z-10">
        <div className="w-full max-w-[480px] bg-surface-container-lowest p-xl rounded-xl shadow-2xl border border-outline-variant/30">
          <div className="mb-xl text-center md:text-left">
            <h2 className="font-headline-lg mb-xs">Create Account</h2>
            <p className="font-body-md text-on-surface-variant">Set up your secure legal workspace.</p>
          </div>

          <form className="space-y-md" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-md">
              <Input 
                label="Full Name"
                placeholder="Jane Doe"
                leftIcon={<User size={20} />}
                error={errors.fullName?.message}
                {...register('fullName')}
              />
              <Input 
                label="Organization"
                placeholder="Firm LLC"
                leftIcon={<Building size={20} />}
                error={errors.organization?.message}
                {...register('organization')}
              />
            </div>
            
            <Input 
              label="Professional Email"
              type="email"
              placeholder="name@firm.com"
              leftIcon={<Mail size={20} />}
              error={errors.email?.message}
              {...register('email')}
            />
            
            <Input 
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={20} />}
              error={errors.password?.message}
              {...register('password')}
            />
            
            <Button 
              type="submit" 
              className="w-full mt-lg"
              size="lg"
              isLoading={isSubmitting}
            >
              Create Secure Account
            </Button>
          </form>

          <div className="mt-xl text-center">
            <p className="font-body-md text-on-surface-variant">
              Already have an account?{' '}
              <Link className="text-primary font-bold hover:underline" to="/sign-in">Sign in</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
