import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-md text-center">
      <div className="max-w-md w-full space-y-lg ai-glow p-lg rounded-2xl bg-surface-container-lowest/40 backdrop-blur-md border border-outline-variant/30 transition-premium hover:border-primary/20">
        
        {/* Error Icon Graphic */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-error/20 blur-xl rounded-full scale-150 animate-pulse"></div>
            <div className="relative w-16 h-16 bg-error-container/20 border border-error/30 rounded-full flex items-center justify-center text-error animate-bounce">
              <AlertCircle size={32} />
            </div>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-sm">
          <h1 className="font-headline-lg text-[48px] font-extrabold tracking-tight text-on-surface select-none">
            404
          </h1>
          <h2 className="font-headline-sm text-[20px] font-semibold text-on-surface">
            Case Folder Not Found
          </h2>
          <p className="font-body-md text-on-surface-variant max-w-sm mx-auto leading-relaxed text-[14px]">
            The legal brief, document, or route you are looking for has been archived, moved, or does not exist in our system.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-md justify-center pt-md">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-xs px-md py-sm bg-primary text-on-primary font-label-lg rounded-xl hover:bg-primary/95 transition-premium shadow-md shadow-primary/10"
          >
            <Home size={16} />
            <span>Dashboard</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-xs px-md py-sm bg-surface-container text-on-surface border border-outline-variant/30 font-label-lg rounded-xl hover:bg-surface-container-high transition-premium"
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
      
      <p className="mt-xl text-[11px] text-on-surface-variant font-mono uppercase tracking-widest font-semibold select-none">
        LexisAI Secure Sandbox
      </p>
    </div>
  );
}
