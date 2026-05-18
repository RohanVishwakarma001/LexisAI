import React, { useState } from 'react';
import { Sparkles, Send, Mic, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

export default function AILegalAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello, Counsel. I am ready to assist with case research, brief generation, or document analysis. How can I help you today?',
    }
  ]);

  return (
    <div className="max-w-container-max mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-md">
        <h1 className="font-headline-lg text-on-surface flex items-center gap-sm">
          <Sparkles className="text-primary" size={24} />
          AI Legal Assistant
        </h1>
        <p className="font-body-md text-on-surface-variant">Powered by advanced LLMs fine-tuned for legal context.</p>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden bg-surface-container-lowest">
        <div className="flex-1 overflow-y-auto p-lg space-y-lg">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-md ${
                msg.role === 'user' 
                  ? 'bg-primary text-on-primary rounded-tr-sm' 
                  : 'bg-surface-container-high text-on-surface border border-outline-variant/30 rounded-tl-sm'
              }`}>
                <p className="font-body-md">{msg.content}</p>
                {msg.role === 'assistant' && i === 0 && (
                  <div className="mt-md flex flex-wrap gap-sm">
                    <Button variant="outline" size="sm" leftIcon={<Search size={14} />}>Summarize recent case law</Button>
                    <Button variant="outline" size="sm" leftIcon={<FileText size={14} />}>Draft a response to motion</Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-md border-t border-outline-variant/30 bg-surface-container">
          <div className="relative flex items-center">
            <button className="absolute left-md p-2 text-on-surface-variant hover:text-primary transition-colors">
              <Mic size={20} />
            </button>
            <input 
              type="text" 
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-full py-md pl-14 pr-16 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
              placeholder="Ask a legal question or request a draft..."
            />
            <Button size="icon" className="absolute right-2 rounded-full w-10 h-10 p-0">
              <Send size={18} />
            </Button>
          </div>
          <p className="text-center mt-sm text-[11px] text-on-surface-variant">AI-generated content should be reviewed by a qualified legal professional before use.</p>
        </div>
      </Card>
    </div>
  );
}
