import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Brain, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col justify-center items-center py-24 px-lg overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-secondary/10 rounded-full blur-[150px]"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-lg">
          <div className="inline-flex items-center gap-xs px-md py-sm rounded-full bg-surface-container-highest/50 border border-outline-variant/50 text-secondary mb-md">
            <Zap size={16} />
            <span className="font-label-md">Introducing LexisAI Pro 2.0</span>
          </div>
          
          <h1 className="font-display text-[48px] md:text-[72px] leading-[1.1] tracking-tight">
            The intelligent operating system for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">modern law firms</span>
          </h1>
          
          <p className="font-body-lg text-[20px] text-on-surface-variant max-w-2xl mx-auto">
            Automate discovery, synthesize case law, and predict litigation outcomes with secure, enterprise-grade artificial intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-md pt-md">
            <Link to="/create-account">
              <Button size="lg" rightIcon={<ArrowRight size={18} />}>
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Book a Demo
            </Button>
          </div>
          
          <p className="font-label-sm text-on-surface-variant/70 pt-sm">No credit card required • SOC2 Type II Certified</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-lg bg-surface-container-lowest border-t border-outline-variant/30">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-xl">
            <h2 className="font-headline-lg mb-md">Unprecedented capabilities</h2>
            <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">Built specifically for the rigorous demands of legal professionals.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
            <div className="space-y-md">
              <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center">
                <Brain className="text-on-primary-container" size={24} />
              </div>
              <h3 className="font-headline-md">Predictive Analytics</h3>
              <p className="font-body-md text-on-surface-variant">Analyze opposing counsel strategies and judge rulings to predict case outcomes with 84% historical accuracy.</p>
            </div>
            
            <div className="space-y-md">
              <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center">
                <Zap className="text-on-secondary-container" size={24} />
              </div>
              <h3 className="font-headline-md">Automated Discovery</h3>
              <p className="font-body-md text-on-surface-variant">Process millions of documents in minutes, instantly extracting key entities, dates, and contradiction points.</p>
            </div>
            
            <div className="space-y-md">
              <div className="w-12 h-12 bg-tertiary-container rounded-xl flex items-center justify-center">
                <Shield className="text-on-tertiary-container" size={24} />
              </div>
              <h3 className="font-headline-md">Ironclad Security</h3>
              <p className="font-body-md text-on-surface-variant">End-to-end encryption, on-premise deployment options, and strict adherence to client privilege protocols.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 px-lg bg-background">
        <div className="max-w-container-max mx-auto text-center space-y-xl">
          <h2 className="font-label-lg uppercase tracking-widest text-on-surface-variant">Trusted by leading practices</h2>
          <div className="flex flex-wrap justify-center items-center gap-xl opacity-50 grayscale">
            <div className="font-display text-2xl font-bold">Wright &amp; Partners</div>
            <div className="font-display text-2xl font-bold">GlobalLegal</div>
            <div className="font-display text-2xl font-bold">O'Brien Associates</div>
            <div className="font-display text-2xl font-bold">TechLaw LLC</div>
          </div>
        </div>
      </section>
    </div>
  );
}
