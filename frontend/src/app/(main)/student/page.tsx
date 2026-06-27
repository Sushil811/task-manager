"use client";
import { apiFetch } from "@/lib/api";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, Clock, TrendingUp, Plus, Trash2 } from "lucide-react";
import { AnimatedCard } from "@/components/ui/animated-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useRouter } from "next/navigation";

interface ClassSchedule {
  _id: string;
  course: string;
  type: string;
  room: string;
  time: string;
  credits: number;
  grade?: string;
  resourceLink?: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  category: string;
  dueDate?: string;
}

export default function StudentPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // New Class Form State
  const [newCourse, setNewCourse] = useState("");
  const [newType, setNewType] = useState("Lecture");
  const [newRoom, setNewRoom] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newCredits, setNewCredits] = useState<number>(3);
  const [newGrade, setNewGrade] = useState("");
  const [newLink, setNewLink] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, tasksRes] = await Promise.all([
          apiFetch('/student/classes'),
          apiFetch('/tasks')
        ]);
        
        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClasses(classesData);
        }
        
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
        }
      } catch (err) {
        console.error("Failed to load student data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.trim() || !newTime.trim()) return;
    
    try {
      const res = await apiFetch('/student/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          course: newCourse, 
          type: newType, 
          room: newRoom || 'TBD', 
          time: newTime,
          credits: newCredits,
          grade: newGrade || undefined,
          resourceLink: newLink || undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        setClasses([...classes, data]);
        setNewCourse("");
        setNewRoom("");
        setNewTime("");
        setNewType("Lecture");
        setNewCredits(3);
        setNewGrade("");
        setNewLink("");
        setIsCreating(false);
      }
    } catch (err) {
      console.error("Failed to create class", err);
    }
  };

  const handleDeleteClass = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await apiFetch(`/student/classes/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setClasses(classes.filter(c => c._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete class", err);
    }
  };

  // Find the most urgent study task
  const studyTasks = tasks.filter(t => t.status !== 'Done');
  
  // Sort tasks by due date
  const sortedTasks = [...studyTasks].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  const urgentTask = sortedTasks.length > 0 ? sortedTasks[0] : null;

  // Calculate dynamic GPA
  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    const gradeScale: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };

    classes.forEach(c => {
      if (c.grade && gradeScale[c.grade] !== undefined) {
        totalPoints += gradeScale[c.grade] * (c.credits || 3);
        totalCredits += (c.credits || 3);
      }
    });

    if (totalCredits === 0) return "N/A";
    return (totalPoints / totalCredits).toFixed(2);
  };

  const getCountdownString = (dateStr?: string) => {
    if (!dateStr) return null;
    const due = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = due - now;
    
    if (diff <= 0) return "Past Due!";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Due in ${days}d ${hours}h`;
    return `Due in ${hours}h`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight flex items-center gap-3"
          >
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <GraduationCap className="w-6 h-6" />
            </div>
            Student OS
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-2 max-w-2xl"
          >
            Manage your courses, assignments, and study sessions powered by AI.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatedButton onClick={() => router.push('/tasks')} className="bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
            View All Assignments
          </AnimatedButton>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedCard className="p-5 md:col-span-1 flex flex-col justify-between items-center text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold">{calculateGPA()}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Current GPA</div>
        </AnimatedCard>

        <AnimatedCard className="p-6 md:col-span-3 bg-gradient-to-r from-emerald-500/5 to-transparent border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-emerald-500 font-semibold">
              <Clock className="w-5 h-5" />
              Up Next
            </div>
            {urgentTask && urgentTask.dueDate && (
              <span className="text-xs font-medium px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full">
                {getCountdownString(urgentTask.dueDate)}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold">{urgentTask ? urgentTask.title : "No upcoming assignments!"}</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            {urgentTask && urgentTask.description ? urgentTask.description : "You're all caught up on your coursework. Great job!"}
          </p>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: urgentTask ? (urgentTask.status === 'In Progress' ? '50%' : '10%') : '100%' }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
          <div className="text-xs text-muted-foreground mt-2 text-right">
            {urgentTask ? (urgentTask.status === 'In Progress' ? 'In Progress' : 'Not Started') : 'Complete'}
          </div>
        </AnimatedCard>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Today&apos;s Schedule</h2>
          <AnimatedButton variant="outline" size="sm" onClick={() => setIsCreating(!isCreating)}>
            {isCreating ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Class</>}
          </AnimatedButton>
        </div>

        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <AnimatedCard className="p-4 border-emerald-500/20 bg-emerald-500/5">
                <form onSubmit={handleCreateClass} className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="text-xs font-medium mb-1 block">Course</label>
                      <input 
                        type="text" 
                        value={newCourse}
                        onChange={(e) => setNewCourse(e.target.value)}
                        placeholder="Computer Architecture" 
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <label className="text-xs font-medium mb-1 block">Time</label>
                      <input 
                        type="text" 
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        placeholder="09:00 AM" 
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div className="w-full md:w-32">
                      <label className="text-xs font-medium mb-1 block">Type</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option>Lecture</option>
                        <option>Tutorial</option>
                        <option>Lab</option>
                        <option>Focus</option>
                      </select>
                    </div>
                    <div className="flex-1 w-full">
                      <label className="text-xs font-medium mb-1 block">Room</label>
                      <input 
                        type="text" 
                        value={newRoom}
                        onChange={(e) => setNewRoom(e.target.value)}
                        placeholder="Bldg 4, Rm 204" 
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-32">
                      <label className="text-xs font-medium mb-1 block">Credits</label>
                      <input 
                        type="number"
                        min="1" max="6"
                        value={newCredits}
                        onChange={(e) => setNewCredits(parseInt(e.target.value) || 3)}
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="w-full md:w-32">
                      <label className="text-xs font-medium mb-1 block">Grade</label>
                      <select
                        value={newGrade}
                        onChange={(e) => setNewGrade(e.target.value)}
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">N/A</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="B-">B-</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="C-">C-</option>
                        <option value="D">D</option>
                        <option value="F">F</option>
                      </select>
                    </div>
                    <div className="flex-1 w-full">
                      <label className="text-xs font-medium mb-1 block">Resource Link</label>
                      <input 
                        type="url" 
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        placeholder="https://canvas.instructure.com/..." 
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <AnimatedButton type="submit" className="w-full md:w-auto h-9 bg-emerald-500 text-white mt-4 md:mt-0">
                      Save Class
                    </AnimatedButton>
                  </div>
                </form>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {loading ? (
             <div className="text-center py-8 text-muted-foreground">Loading schedule...</div>
          ) : classes.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-border border-dashed">
                Your schedule is empty. Add a class to get started!
             </div>
          ) : (
            classes.map((item) => (
              <AnimatedCard key={item._id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 group" hoverEffect={false}>
                <div className="w-24 font-mono text-sm font-medium text-muted-foreground">
                  {item.time}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-sm">{item.course}</h3>
                    {item.grade && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {item.grade}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{item.type}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                    <span>{item.room}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                    <span>{item.credits} Credits</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.resourceLink && (
                    <AnimatedButton variant="outline" size="sm" onClick={() => window.open(item.resourceLink, '_blank')} className="hidden sm:flex text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10">
                      Open Link
                    </AnimatedButton>
                  )}
                  <AnimatedButton variant="outline" size="sm" onClick={() => router.push('/notes')} className="hidden sm:flex">
                    Notes
                  </AnimatedButton>
                  <button 
                    onClick={(e) => handleDeleteClass(item._id, e)}
                    className="p-1.5 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </AnimatedCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
