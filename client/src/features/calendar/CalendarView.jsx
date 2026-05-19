import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, Calendar as CalendarIcon, MapPin, AlignLeft, Info, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarView() {
  const [hearings, setHearings] = useState([]);
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Form State
  const [caseId, setCaseId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHearingsAndCases = async () => {
    setIsLoading(true);
    try {
      const [hearingsRes, casesRes] = await Promise.all([
        api.get('/hearings'),
        api.get('/cases')
      ]);

      if (hearingsRes.data?.status === 'success') {
        setHearings(hearingsRes.data.data.hearings);
      }
      if (casesRes.data?.status === 'success') {
        setCases(casesRes.data.data.cases);
      }
    } catch (error) {
      console.error('Failed to load hearings & cases:', error);
      toast.error('Failed to load calendar records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHearingsAndCases();
  }, []);

  const handleCreateHearing = async (e) => {
    e.preventDefault();
    if (!caseId || !title.trim() || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/hearings', {
        caseId,
        title,
        date: new Date(date).toISOString(),
        location,
        notes,
      });

      if (response.data?.status === 'success') {
        toast.success('Hearing scheduled successfully');
        setIsModalOpen(false);
        // Reset form
        setCaseId('');
        setTitle('');
        setDate('');
        setLocation('');
        setNotes('');
        fetchHearingsAndCases();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule hearing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHearing = async (hearingId) => {
    if (!window.confirm('Are you sure you want to cancel this hearing?')) return;

    try {
      const response = await api.delete(`/hearings/${hearingId}`);
      if (response.status === 204 || response.data?.status === 'success') {
        toast.success('Hearing cancelled successfully');
        setIsDetailModalOpen(false);
        fetchHearingsAndCases();
      }
    } catch (error) {
      toast.error('Failed to cancel hearing');
    }
  };

  // Map database hearings to react-big-calendar events format
  const events = hearings.map((h) => ({
    id: h.id,
    title: `${h.case.title}: ${h.title}`,
    start: new Date(h.date),
    end: new Date(new Date(h.date).getTime() + 60 * 60 * 1000), // 1 hour duration approximation
    resource: h,
  }));

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
    setIsDetailModalOpen(true);
  };

  // Custom styling for calendar event blocks
  const eventPropGetter = () => {
    return {
      className: 'bg-primary/30 border-l-4 border-primary text-on-surface rounded p-1 text-[12px] font-label-md hover:bg-primary/45 transition-colors',
      style: {
        borderRadius: '6px',
      },
    };
  };

  return (
    <div className="space-y-lg max-w-container-max mx-auto h-[calc(100vh-80px)] flex flex-col relative text-on-surface">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h1 className="font-headline-lg text-on-surface flex items-center gap-sm">
            <CalendarIcon className="text-primary" size={32} /> Hearing Calendar
          </h1>
          <p className="font-body-md text-on-surface-variant">Track court hearings, litigation deadlines, and schedules.</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          Schedule Hearing
        </Button>
      </div>

      {/* Calendar Wrapper */}
      <div className="flex-1 bg-surface-container/20 border border-outline-variant/20 rounded-xl p-md backdrop-blur-md shadow-lg overflow-y-auto">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%', minHeight: '550px' }}
            eventPropGetter={eventPropGetter}
            onSelectEvent={handleSelectEvent}
            views={['month', 'week', 'day']}
            className="custom-calendar"
          />
        )}
      </div>

      {/* Custom Styles overrides for react-big-calendar to match Dark Glassmorphism */}
      <style>{`
        .rbc-calendar {
          color: var(--color-on-surface, #e6e1e5);
          font-family: 'Outfit', sans-serif;
        }
        .rbc-header {
          padding: 8px;
          font-weight: 600;
          color: var(--color-on-surface-variant, #cac4d0);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .rbc-month-view, .rbc-time-view {
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 8px;
          background: rgba(26, 28, 30, 0.4);
        }
        .rbc-day-bg + .rbc-day-bg, .rbc-month-row + .rbc-month-row {
          border-left: 1px solid rgba(255, 255, 255, 0.04) !important;
          border-top: 1px solid rgba(255, 255, 255, 0.04) !important;
        }
        .rbc-month-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
        }
        .rbc-off-range-bg {
          background: rgba(255, 255, 255, 0.02) !important;
        }
        .rbc-today {
          background: rgba(var(--color-primary-rgb, 103, 80, 164), 0.1) !important;
        }
        .rbc-toolbar button {
          color: var(--color-on-surface, #e6e1e5);
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          background: rgba(255, 255, 255, 0.02);
          font-size: 13px;
          padding: 6px 12px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .rbc-toolbar button:hover, .rbc-toolbar button:active, .rbc-toolbar button.rbc-active {
          background: rgba(var(--color-primary-rgb, 103, 80, 164), 0.2) !important;
          color: var(--color-primary, #d0bcff) !important;
          border-color: var(--color-primary, #d0bcff) !important;
        }
        .rbc-show-more {
          color: var(--color-primary, #d0bcff);
          font-weight: 500;
          font-size: 11px;
        }
      `}</style>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-md">
          <div className="w-full max-w-[500px] bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-xl shadow-2xl space-y-lg animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono uppercase bg-primary/20 text-primary px-sm py-[2px] rounded">
                  Hearing Details
                </span>
                <h3 className="font-headline-md text-on-surface mt-sm">{selectedEvent.title}</h3>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-md font-body-md text-on-surface-variant">
              <div className="flex items-center gap-sm">
                <CalendarIcon size={18} className="text-primary" />
                <span><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center gap-sm">
                <MapPin size={18} className="text-primary" />
                <span><strong>Location:</strong> {selectedEvent.location || 'Not Specified'}</span>
              </div>
              {selectedEvent.notes && (
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-md mt-md">
                  <div className="flex gap-xs items-center text-xs font-semibold text-on-surface pb-xs">
                    <AlignLeft size={14} /> Notes
                  </div>
                  <p className="text-sm whitespace-pre-line leading-relaxed">{selectedEvent.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-md border-t border-outline-variant/20">
              <Button 
                variant="outline" 
                className="text-error border-error/20 hover:bg-error/10 hover:text-error" 
                leftIcon={<Trash2 size={16} />}
                onClick={() => handleDeleteHearing(selectedEvent.id)}
              >
                Cancel Hearing
              </Button>
              <Button onClick={() => setIsDetailModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Hearing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-md">
          <div className="w-full max-w-[480px] bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-xl shadow-2xl space-y-lg animate-in fade-in zoom-in duration-200">
            <div>
              <h3 className="font-headline-md text-on-surface">Schedule Court Hearing</h3>
              <p className="font-body-md text-on-surface-variant">Schedule a hearing and send automatic email updates to participants.</p>
            </div>
            <form onSubmit={handleCreateHearing} className="space-y-md">
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant">Select Case *</label>
                <select
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg p-md text-on-surface font-body-md focus:outline-none focus:border-primary"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Case --</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <Input 
                label="Hearing Title / Forum *" 
                placeholder="First Hearing / Admission Stage" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <Input 
                label="Date & Time *" 
                type="datetime-local" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                required
              />

              <Input 
                label="Location / Courtroom" 
                placeholder="High Court Room 4 / Online VC Link" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
              />

              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant">Notes</label>
                <textarea
                  className="w-full min-h-[80px] bg-surface-container-low border border-outline-variant/50 rounded-lg p-md text-on-surface font-body-md focus:outline-none focus:border-primary"
                  placeholder="Specify list of documents, counsel directions, or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-md justify-end pt-md">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={isSubmitting}>Schedule</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
