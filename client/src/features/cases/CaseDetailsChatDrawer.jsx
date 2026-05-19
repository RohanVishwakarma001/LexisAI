import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Send, X, Download, CheckSquare, Trash2, ChevronRight, ChevronLeft, Plus, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/Badge';

export default function CaseDetailsChatDrawer({ isOpen, caseData, onClose }) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'tasks'
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const fetchTasks = async () => {
    if (!caseData) return;
    try {
      const res = await api.get(`/tasks?caseId=${caseData.id}`);
      if (res.data?.status === 'success') {
        setTasks(res.data.data.tasks || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isOpen || !caseData) return;

    // Fetch initial tasks
    fetchTasks();

    // Socket.io initialization wrapper
    const socketUrl = 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      withCredentials: true,
    });

    setSocket(newSocket);

    // Join case room session
    newSocket.emit('join_case', caseData.id);

    // Load messages logs history from NeonDB
    api.get(`/cases/${caseData.id}/messages`)
      .then((res) => {
        if (res.data?.status === 'success') {
          setMessages(res.data.data.messages);
        }
      })
      .catch((err) => console.error('Failed to load chat history:', err));

    // Listen for real-time messages
    newSocket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      newSocket.emit('leave_case', caseData.id);
      newSocket.disconnect();
    };
  }, [isOpen, caseData]);

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !socket) return;

    socket.emit('send_message', {
      caseId: caseData.id,
      senderId: user.id,
      content: messageText,
    });

    setMessageText('');
  };

  const handleExportPDF = async () => {
    const toastId = toast.loading('Generating case briefing PDF...');
    try {
      const response = await api.get(`/cases/${caseData.id}/export`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Case-Brief-${caseData.title.replace(/\s+/g, '-')}.pdf`;
      link.click();
      toast.success('Briefing PDF downloaded!', { id: toastId });
    } catch (err) {
      console.error('PDF export failed:', err);
      toast.error('Failed to export PDF report', { id: toastId });
    }
  };

  // Task Handlers
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsCreatingTask(true);
    try {
      const res = await api.post('/tasks', {
        caseId: caseData.id,
        title: newTaskTitle,
        status: 'TODO',
      });
      if (res.data?.status === 'success') {
        toast.success('Task created successfully');
        setNewTaskTitle('');
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to create task');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleTransitionTask = async (taskId, currentStatus, direction) => {
    const statusOrder = ['TODO', 'IN_PROGRESS', 'DONE'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= statusOrder.length) nextIndex = statusOrder.length - 1;

    if (nextIndex === currentIndex) return;

    try {
      const res = await api.patch(`/tasks/${taskId}`, {
        status: statusOrder[nextIndex],
      });
      if (res.data?.status === 'success') {
        toast.success(`Task moved to ${statusOrder[nextIndex].replace('_', ' ')}`);
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task stage');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const res = await api.delete(`/tasks/${taskId}`);
      if (res.data?.status === 'success') {
        toast.success('Task deleted');
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete task');
    }
  };

  if (!isOpen || !caseData) return null;

  // Filter tasks into columns
  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const progressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter(t => t.status === 'DONE');

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-surface-container-high/95 backdrop-blur-md border-l border-outline-variant/30 shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300 text-on-surface">
      {/* Header */}
      <div className="p-lg border-b border-outline-variant/30 flex justify-between items-start">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary">Case Counselor Desk</span>
          <h3 className="font-headline-md text-[18px] text-on-surface line-clamp-1">{caseData.title}</h3>
          <p className="text-xs text-on-surface-variant line-clamp-2 mt-xs">{caseData.description || 'No case brief summary.'}</p>
        </div>
        <div className="flex gap-xs shrink-0 items-center">
          <button 
            onClick={handleExportPDF} 
            title="Download Case Brief PDF"
            className="p-1.5 rounded hover:bg-surface-container-highest text-primary transition-colors cursor-pointer"
          >
            <Download size={18} />
          </button>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Tabs Selection Row */}
      <div className="flex border-b border-outline-variant/20 bg-surface-container-low/30 px-md">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-sm font-label-md flex items-center justify-center gap-xs border-b-2 transition-all ${
            activeTab === 'chat'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <MessageSquare size={16} />
          Case Chat ({messages.length})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-sm font-label-md flex items-center justify-center gap-xs border-b-2 transition-all ${
            activeTab === 'tasks'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <CheckSquare size={16} />
          Kanban Tasks ({tasks.length})
        </button>
      </div>

      {/* Active Panel View */}
      {activeTab === 'chat' ? (
        <>
          {/* Chat messages listing */}
          <div className="flex-1 overflow-y-auto p-lg space-y-md bg-surface-container-low/20">
            {messages.map((msg) => {
              const isOwn = msg.senderId === user.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-xs text-[10px] text-on-surface-variant mb-1">
                    <span>{msg.sender?.firstName || 'User'} {msg.sender?.lastName || ''}</span>
                    <span className="px-xs bg-primary/15 text-primary text-[8px] uppercase tracking-wider rounded font-bold scale-90">{msg.sender?.role}</span>
                  </div>
                  <div className={`p-md rounded-lg max-w-[80%] text-sm leading-relaxed ${
                    isOwn ? 'bg-primary text-on-primary rounded-tr-none' : 'bg-surface-container-low text-on-surface rounded-tl-none border border-outline-variant/20'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-on-surface-variant/60 mt-xs">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                </div>
              );
            })}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-xl text-on-surface-variant/40 space-y-xs">
                <p className="text-sm font-semibold">No counselor updates yet</p>
                <p className="text-xs">Type a message below to start real-time coordination.</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Messaging form input controls */}
          <form onSubmit={handleSendMessage} className="p-lg border-t border-outline-variant/30 bg-surface-container-low/50 flex gap-sm items-center">
            <input
              type="text"
              placeholder="Send case counselor update..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 bg-surface-container-low border border-outline-variant/50 rounded-lg px-md py-md text-on-surface font-body-sm focus:outline-none focus:border-primary placeholder:text-on-surface-variant/40 text-sm"
            />
            <Button type="submit" size="md" leftIcon={<Send size={16} />} disabled={!messageText.trim()}>
              Send
            </Button>
          </form>
        </>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden bg-surface-container-low/20">
          {/* Add Task Quick Form */}
          <form onSubmit={handleCreateTask} className="p-md border-b border-outline-variant/20 bg-surface-container-low flex gap-sm items-center">
            <input
              type="text"
              placeholder="Add new task target..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-surface-container-low border border-outline-variant/50 rounded-lg px-md py-sm text-on-surface font-body-sm focus:outline-none focus:border-primary placeholder:text-on-surface-variant/40 text-xs"
            />
            <Button type="submit" size="sm" leftIcon={<Plus size={14} />} isLoading={isCreatingTask} disabled={!newTaskTitle.trim()}>
              Add
            </Button>
          </form>

          {/* Kanban Lanes Scroll View */}
          <div className="flex-1 overflow-y-auto p-md space-y-md">
            {/* TODO LANE */}
            <div className="space-y-sm">
              <div className="flex items-center justify-between px-xs">
                <span className="font-label-sm font-bold uppercase tracking-wider text-on-surface-variant">To Do ({todoTasks.length})</span>
                <Badge variant="secondary" className="scale-75">Backlog</Badge>
              </div>
              <div className="space-y-xs">
                {todoTasks.map(t => (
                  <TaskItem key={t.id} task={t} onTransition={handleTransitionTask} onDelete={handleDeleteTask} />
                ))}
                {todoTasks.length === 0 && <EmptyLaneState />}
              </div>
            </div>

            {/* IN PROGRESS LANE */}
            <div className="space-y-sm">
              <div className="flex items-center justify-between px-xs">
                <span className="font-label-sm font-bold uppercase tracking-wider text-primary">In Progress ({progressTasks.length})</span>
                <Badge variant="primary" className="scale-75">Active</Badge>
              </div>
              <div className="space-y-xs">
                {progressTasks.map(t => (
                  <TaskItem key={t.id} task={t} onTransition={handleTransitionTask} onDelete={handleDeleteTask} />
                ))}
                {progressTasks.length === 0 && <EmptyLaneState />}
              </div>
            </div>

            {/* DONE LANE */}
            <div className="space-y-sm">
              <div className="flex items-center justify-between px-xs">
                <span className="font-label-sm font-bold uppercase tracking-wider text-success">Done ({doneTasks.length})</span>
                <Badge variant="success" className="scale-75">Resolved</Badge>
              </div>
              <div className="space-y-xs">
                {doneTasks.map(t => (
                  <TaskItem key={t.id} task={t} onTransition={handleTransitionTask} onDelete={handleDeleteTask} />
                ))}
                {doneTasks.length === 0 && <EmptyLaneState />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Single task card
function TaskItem({ task, onTransition, onDelete }) {
  return (
    <div className="p-md bg-surface-container rounded-lg border border-outline-variant/30 shadow-sm flex items-center justify-between gap-sm group hover:border-primary/30 transition-colors">
      <div className="flex-1 min-w-0">
        <p className={`text-xs text-on-surface font-medium truncate ${task.status === 'DONE' ? 'line-through text-on-surface-variant/50' : ''}`}>
          {task.title}
        </p>
        <span className="text-[9px] text-on-surface-variant/50 flex items-center gap-2xs mt-xs">
          <Clock size={10} />
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="flex items-center gap-xs shrink-0">
        <button
          onClick={() => onTransition(task.id, task.status, -1)}
          disabled={task.status === 'TODO'}
          className="p-1 hover:bg-surface-container-high rounded text-on-surface-variant disabled:opacity-30 cursor-pointer"
          title="Move Back"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => onTransition(task.id, task.status, 1)}
          disabled={task.status === 'DONE'}
          className="p-1 hover:bg-surface-container-high rounded text-on-surface-variant disabled:opacity-30 cursor-pointer"
          title="Move Forward"
        >
          <ChevronRight size={14} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 hover:bg-error/10 hover:text-error rounded text-on-surface-variant/40 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
          title="Delete Task"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

function EmptyLaneState() {
  return (
    <div className="py-sm px-md text-center border border-dashed border-outline-variant/10 rounded-lg text-[10px] text-on-surface-variant/30">
      No tasks in this lane
    </div>
  );
}
