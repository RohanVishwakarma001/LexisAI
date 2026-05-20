import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Mic, FileText, Search, Scale, AlertCircle, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const INDIAN_LANGUAGES = [
  { code: 'en-IN', name: 'English (India)' },
  { code: 'hi-IN', name: 'हिन्दी (Hindi)' },
  { code: 'ta-IN', name: 'தமிழ் (Tamil)' },
  { code: 'te-IN', name: 'తెలుగు (Telugu)' },
  { code: 'bn-IN', name: 'বাংলা (Bengali)' },
  { code: 'mr-IN', name: 'मराठी (Marathi)' },
  { code: 'kn-IN', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'gu-IN', name: 'ગુજરાતી (Gujarati)' },
  { code: 'ml-IN', name: 'മലയാളം (Malayalam)' },
  { code: 'pa-IN', name: 'ਪੰਜਾਬੀ (Punjabi)' }
];

export default function AILegalAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello, Counsel. I am initialized with active firm files and standard appellate precedents. I can draft motions, analyze contract discrepancies, or retrieve citations. Select a case context above or type a query to begin.',
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [speechLanguage, setSpeechLanguage] = useState('en-IN');

  useEffect(() => {
    if (recognition) {
      recognition.lang = speechLanguage;
    }
  }, [speechLanguage, recognition]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = speechLanguage;
      
      rec.onstart = () => {
        setIsListening(true);
        toast.success('Listening. Speak your legal command...');
      };
      
      rec.onerror = (event) => {
        console.error('Speech recognition error', event);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access blocked. Enable permission in settings.');
        } else {
          toast.error('Voice dictation failed or timed out.');
        }
        setIsListening(false);
      };
      
      rec.onend = () => {
        setIsListening(false);
      };
      
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(prev => prev ? `${prev} ${transcript}` : transcript);
        }
      };
      
      setRecognition(rec);
    }
  }, []);

  const handleToggleListening = () => {
    if (!recognition) {
      toast.error('Web Speech API not supported. Please use Google Chrome or Microsoft Edge.');
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error(err);
      }
    }
  };


  // Fetch active cases to bind context
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await api.get('/cases?limit=1000');
        if (response.data?.status === 'success') {
          const casesData = response.data.data.cases || response.data.data.data || [];
          setCases(casesData);
        }
      } catch (error) {
        console.error('Error fetching cases in AI:', error);
      }
    };
    fetchCases();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle send message
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    // Add user message to chat list
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: text,
        caseId: selectedCaseId || undefined,
        language: speechLanguage,
      });

      if (response.data?.status === 'success') {
        const aiMsg = {
          role: 'assistant',
          content: response.data.data.response,
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error) {
      toast.error('AI assistant offline. Please try again.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ **System Error**: Connection to AI research clusters failed. Please verify your network parameters.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger from suggestion chip
  const handleChipClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  // Premium Custom Legal-Text Formatter
  const renderFormattedContent = (content) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Heading 3
      if (line.startsWith('### ')) {
        return (
          <h3 key={i} className="font-headline-md text-secondary border-b border-outline-variant/30 pb-xs mb-sm mt-md flex items-center gap-xs font-semibold text-[16px] md:text-[18px]">
            <Scale size={16} className="shrink-0 text-secondary" /> {line.replace('### ', '')}
          </h3>
        );
      }
      // Heading 4
      if (line.startsWith('#### ')) {
        return (
          <h4 key={i} className="font-label-lg font-bold text-on-surface mt-md mb-xs uppercase tracking-wider text-[11px] md:text-[12px] opacity-90">
            {line.replace('#### ', '')}
          </h4>
        );
      }
      // Bullet points
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const parsedLine = line.substring(2);
        return (
          <li key={i} className="ml-md list-disc text-on-surface-variant font-body-md leading-relaxed my-xs text-[13px] md:text-[14px]">
            {parseBoldText(parsedLine)}
          </li>
        );
      }
      // Number lists
      if (/^\d+\.\s+/.test(line)) {
        return (
          <div key={i} className="ml-sm flex gap-sm my-sm font-body-md leading-relaxed text-on-surface-variant text-[13px] md:text-[14px]">
            <span className="font-bold text-primary shrink-0">{line.match(/^\d+/)[0]}.</span>
            <span>{parseBoldText(line.replace(/^\d+\.\s+/, ''))}</span>
          </div>
        );
      }
      // Divider
      if (line.trim() === '---') {
        return <hr key={i} className="border-outline-variant/20 my-md" />;
      }
      // Regular paragraphs
      return (
        <p key={i} className="font-body-md text-on-surface-variant leading-relaxed my-sm text-[13px] md:text-[14px]">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  // Helper to parse **bold** text in markdown lines
  const parseBoldText = (text) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => 
      index % 2 === 1 ? <strong key={index} className="text-on-surface font-semibold">{part}</strong> : part
    );
  };

  return (
    <div className="max-w-container-max mx-auto h-[calc(100vh-140px)] lg:h-[calc(100vh-105px)] flex flex-col transition-all duration-300">
      
      {/* Title & Case Context Selection */}
      <div className="mb-md flex flex-col md:flex-row justify-between items-start md:items-center gap-md shrink-0">
        <div>
          <h1 className="font-headline-lg text-on-surface flex items-center gap-sm text-[22px] md:text-[28px] font-semibold tracking-tight">
            <Sparkles className="text-primary shrink-0" size={24} />
            AI Legal Assistant
          </h1>
          <p className="font-body-md text-on-surface-variant text-[13px] md:text-[14px]">Powered by advanced LLMs fine-tuned for legal context.</p>
        </div>

        {/* Case Context Dropdown */}
        <div className="flex items-center gap-sm bg-surface-container-high/40 border border-outline-variant/30 px-md py-sm rounded-lg w-full md:w-auto self-stretch md:self-auto justify-between">
          <span className="font-label-sm text-on-surface-variant whitespace-nowrap uppercase tracking-wider text-[10px]">Matter Context:</span>
          <select
            className="bg-transparent border-none text-on-surface font-label-md focus:outline-none cursor-pointer max-w-[220px] truncate text-[13px] pr-2"
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
          >
            <option value="" className="bg-surface-container-high text-on-surface">Global Precedent (All Cases)</option>
            {cases.map(c => (
              <option key={c.id} value={c.id} className="bg-surface-container-high text-on-surface">{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="flex-grow flex flex-col overflow-hidden bg-surface-container-lowest border border-outline-variant/30 shadow-xl relative">
        
        {/* Chat History */}
        <div className="flex-grow overflow-y-auto p-md md:p-lg space-y-lg scrollbar-thin">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both`}>
              <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-md md:p-lg shadow-sm border border-transparent transition-premium ${
                msg.role === 'user' 
                  ? 'bg-primary text-on-primary rounded-tr-sm shadow-md' 
                  : 'bg-surface-container-high/85 text-on-surface border-outline-variant/25 rounded-tl-sm glass-panel'
              }`}>
                {msg.role === 'user' ? (
                  <p className="font-body-md whitespace-pre-wrap text-[13px] md:text-[14px] leading-relaxed">{msg.content}</p>
                ) : (
                  <div className="space-y-xs">
                    {renderFormattedContent(msg.content)}
                  </div>
                )}
                
                {/* Suggestions chips only on the very first greeting card */}
                {msg.role === 'assistant' && i === 0 && (
                  <div className="mt-md flex flex-wrap gap-sm pt-sm border-t border-outline-variant/10">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleChipClick('Retrieve case law regarding breach of contract consequential damages')}
                      leftIcon={<Search size={12} />}
                      className="text-[11px] md:text-[12px] h-8 bg-surface-container-low/75 border-outline-variant/40 hover:bg-surface-container-highest transition-premium shadow-sm rounded-full"
                    >
                      Retrieve precedent
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleChipClick('Draft a motion to suppress digital evidence')}
                      leftIcon={<FileText size={12} />}
                      className="text-[11px] md:text-[12px] h-8 bg-surface-container-low/75 border-outline-variant/40 hover:bg-surface-container-highest transition-premium shadow-sm rounded-full"
                    >
                      Draft suppress motion
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* AI Loader */}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in duration-200">
              <div className="bg-surface-container-high/65 border border-outline-variant/20 rounded-2xl rounded-tl-sm p-md flex items-center gap-md max-w-[220px] shadow-sm glass-panel">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce delay-75 shrink-0"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce delay-150 shrink-0"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce delay-300 shrink-0"></span>
                </div>
                <span className="text-[11px] font-label-md text-on-surface-variant flex items-center gap-xs">
                  <Cpu size={12} className="animate-spin text-primary shrink-0" /> Co-counsel writing brief...
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Controls */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="p-sm md:p-md border-t border-outline-variant/30 bg-surface-container-high/40 backdrop-blur-sm shrink-0"
        >
          <div className="flex flex-col sm:flex-row items-center gap-sm w-full max-w-[900px] mx-auto">
            {/* Input Wrapper */}
            <div className="relative flex items-center w-full">
              <button 
                type="button"
                className={`absolute left-md md:left-5 p-2 rounded-full transition-all cursor-pointer ${
                  isListening 
                    ? 'text-error bg-error/15 animate-pulse border border-error/30 scale-110' 
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                }`}
                onClick={handleToggleListening}
                aria-label="Dictate brief command"
              >
                <Mic size={18} />
              </button>
              
              <input 
                type="text" 
                className="w-full bg-surface-container-low border border-outline-variant/45 rounded-full py-md pl-14 pr-16 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-premium text-[13px] md:text-[14px]"
                placeholder="Ask in Hindi, Tamil, English, etc. co-counsel replies in the same language..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
                required
              />
              
              <Button 
                size="icon" 
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="absolute right-2 md:right-2 rounded-full w-9 h-9 p-0 flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition-premium"
                aria-label="Dispatch message to AI research assistant"
              >
                <Send size={14} />
              </Button>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-xs bg-surface-container-low border border-outline-variant/40 rounded-full px-sm py-xs text-[11px] font-medium text-on-surface-variant select-none shrink-0 self-end sm:self-auto">
              <span>Dictate Lang:</span>
              <select
                value={speechLanguage}
                onChange={(e) => setSpeechLanguage(e.target.value)}
                className="bg-transparent border-none text-primary font-bold focus:outline-none cursor-pointer text-[11px]"
              >
                {INDIAN_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-surface-container-high text-on-surface">{lang.name}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-center mt-xs text-[9px] md:text-[10px] text-on-surface-variant/80 flex items-center justify-center gap-1 select-none">
            <AlertCircle size={10} className="shrink-0 text-on-surface-variant" />
            AI computational content must be reviewed by a licensed professional counsel prior to court filings.
          </p>
        </form>
      </Card>
    </div>
  );
}
