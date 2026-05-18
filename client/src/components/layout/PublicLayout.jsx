import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

function PublicNavbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/50 shadow-sm">
      <div className="flex justify-between items-center px-lg py-md max-w-container-max mx-auto h-16">
        <div className="flex items-center gap-xl">
          <Link to="/" className="font-headline-md font-bold text-on-surface">LexisAI</Link>
          <div className="hidden md:flex gap-lg">
            <Link className="text-primary font-bold border-b-2 border-primary pb-1 font-label-md" to="/">Solutions</Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors font-label-md" to="/">Platform</Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors font-label-md" to="/">Pricing</Link>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors font-label-md" to="/">Resources</Link>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <Link to="/sign-in" className="text-on-surface-variant hover:text-on-surface transition-colors px-md py-sm font-label-md">Log In</Link>
          <Link to="/create-account">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function PublicFooter() {
  return (
    <footer className="border-t border-outline-variant bg-surface-container-lowest mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-lg py-xl max-w-container-max mx-auto gap-xl">
        <div className="flex flex-col items-center md:items-start gap-md">
          <span className="font-headline-md text-on-surface font-bold">LexisAI</span>
          <p className="font-body-md text-on-surface-variant text-center md:text-left max-w-xs">
            Empowering legal professionals with computational intelligence and uncompromising security.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-lg">
          <Link className="text-on-surface-variant hover:text-primary transition-colors font-body-md hover:underline" to="/privacy">Privacy Policy</Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors font-body-md hover:underline" to="/terms">Terms of Service</Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors font-body-md hover:underline" to="/security">Security</Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors font-body-md hover:underline" to="/compliance">Compliance</Link>
        </div>
        <p className="text-on-surface-variant font-body-md opacity-80">© 2024 LexisAI Technologies Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  return (
    <div className="bg-background text-on-surface font-body-md selection:bg-secondary/30 min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="pt-16 flex-1 flex flex-col">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
