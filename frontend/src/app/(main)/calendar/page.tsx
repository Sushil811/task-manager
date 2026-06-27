"use client";
import { apiFetch } from "@/lib/api";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Clock } from "lucide-react";
import { AnimatedCard } from "@/components/ui/animated-card";
import { AnimatedButton } from "@/components/ui/animated-button";

interface Task {
  _id: string;
  title: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await apiFetch('/tasks');
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        }
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      }
    };
    loadTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await apiFetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          status: 'Todo',
          priority: 'Medium',
          dueDate: newTaskDueDate || new Date().toISOString()
        })
      });
      
      if (res.ok) {
        const createdTask = await res.json();
        setTasks([createdTask, ...tasks]);
        setIsModalOpen(false);
        setNewTaskTitle("");
        setNewTaskDueDate("");
      }
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Calendar logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  
  const blanks = Array.from({ length: firstDay }).map((_, i) => <div key={`blank-${i}`} className="p-2 min-h-[100px] border border-border/50 bg-muted/10"></div>);
  
  const days = Array.from({ length: daysInMonth }).map((_, i) => {
    const day = i + 1;
    
    // Find tasks for this day
    const dayTasks = tasks.filter(t => {
      if (!t.dueDate) return false;
      const tDate = new Date(t.dueDate);
      return tDate.getFullYear() === currentDate.getFullYear() &&
             tDate.getMonth() === currentDate.getMonth() &&
             tDate.getDate() === day;
    });

    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

    return (
      <div key={`day-${day}`} className={`p-2 min-h-[100px] border border-border/50 ${isToday ? 'bg-primary/5' : 'bg-card'} hover:bg-muted/30 transition-colors flex flex-col`}>
        <div className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-primary text-primary-foreground' : ''}`}>
          {day}
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
          {dayTasks.map(task => (
            <div key={task._id} className="text-xs p-1.5 rounded bg-muted border border-border truncate flex items-center gap-1" title={task.title}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${task.status === 'Done' ? 'bg-green-500' : task.status === 'In Progress' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
              {task.title}
            </div>
          ))}
        </div>
      </div>
    );
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight flex items-center gap-3"
          >
            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
              <CalendarIcon className="w-6 h-6" />
            </div>
            Calendar
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-2"
          >
            Your schedule at a glance.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1 mr-4">
            <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-background text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium px-2 min-w-[120px] text-center">
              {monthName} {currentDate.getFullYear()}
            </span>
            <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-background text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <AnimatedButton onClick={() => setIsModalOpen(true)} className="bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20">
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </AnimatedButton>
        </motion.div>
      </div>

      <AnimatedCard className="flex-1 overflow-hidden border-border bg-card/50 flex flex-col" hoverEffect={false}>
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-muted-foreground border-r border-border/50 last:border-0">
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
          {blanks}
          {days}
        </div>
      </AnimatedCard>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-red-500" />
                  Schedule Event
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateTask} className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Title</label>
                  <input
                    autoFocus
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="E.g., System Design Interview"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date & Time</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full px-3 py-2 pl-9 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    />
                    <Clock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <AnimatedButton type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </AnimatedButton>
                  <AnimatedButton type="submit" className="bg-red-500 text-white hover:bg-red-600">
                    Add to Calendar
                  </AnimatedButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
