"use client";
import { apiFetch } from "@/lib/api";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, Clock, TrendingUp, Plus, Trash2, Edit2, Play } from "lucide-react";
import { AnimatedCard } from "@/components/ui/animated-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useRouter } from "next/navigation";
import { FocusTimer } from "@/components/features/focus-timer";

interface ClassSchedule {
  _id: string;
  course: string;
  type: string;
  room: string;
  time: string;
  days: string[];
  color: string;
  credits: number;
  grade: string;
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
  
  // Class Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState("");
  const [newType, setNewType] = useState("Lecture");
  const [newRoom, setNewRoom] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDays, setNewDays] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("bg-emerald-500");
  const [newCredits, setNewCredits] = useState(3);
  const [newGrade, setNewGrade] = useState("N/A");
  const [showTimer, setShowTimer] = useState(false);

  // Helper for GPA calculation
  const calculateGPA = () => {
    const gradePoints: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    
    let totalPoints = 0;
    let totalCredits = 0;

    classes.forEach(c => {
      if (c.grade && c.grade !== 'N/A' && gradePoints[c.grade] !== undefined) {
        totalPoints += (gradePoints[c.grade] * (c.credits || 3));
        totalCredits += (c.credits || 3);
      }
    });

    return totalCredits === 0 ? "N/A" : (totalPoints / totalCredits).toFixed(2);
  };

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

  const resetForm = () => {
    setEditingId(null);
    setNewCourse("");
    setNewRoom("");
    setNewTime("");
    setNewType("Lecture");
    setNewDays([]);
    setNewColor("bg-emerald-500");
    setNewCredits(3);
    setNewGrade("N/A");
    setIsCreating(false);
  };

  const handleEditClass = (c: ClassSchedule) => {
    setEditingId(c._id);
    setNewCourse(c.course);
    setNewRoom(c.room || "");
    setNewTime(c.time);
    setNewType(c.type);
    setNewDays(c.days || []);
    setNewColor(c.color || "bg-emerald-500");
    setNewCredits(c.credits || 3);
    setNewGrade(c.grade || "N/A");
    setIsCreating(true);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.trim() || !newTime.trim()) return;
    
    const payload = { 
      course: newCourse, 
      type: newType, 
      room: newRoom || 'TBD', 
      time: newTime,
      days: newDays,
      color: newColor,
      credits: newCredits,
      grade: newGrade
    };

    try {
      if (editingId) {
        const res = await apiFetch(`/student/classes/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          setClasses(classes.map(c => c._id === editingId ? data : c));
          resetForm();
        }
      } else {
        const res = await apiFetch('/student/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          setClasses([...classes, data]);
          resetForm();
        }
      }
    } catch (err) {
      console.error("Failed to save class", err);
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
  const urgentTask = studyTasks.length > 0 ? studyTasks[0] : null;

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
          <div className="text-4xl font-bold">{calculateGPA()}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Current GPA</div>
        </AnimatedCard>

        <AnimatedCard className="p-6 md:col-span-3 bg-gradient-to-r from-emerald-500/5 to-transparent border-emerald-500/20">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 text-emerald-500 font-semibold mb-2">
                <Clock className="w-5 h-5" />
                Up Next
              </div>
              <h2 className="text-xl font-bold">{urgentTask ? urgentTask.title : "No upcoming assignments!"}</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                {urgentTask && urgentTask.description ? urgentTask.description : "You're all caught up on your coursework. Great job!"}
              </p>
            </div>
            <AnimatedButton 
              variant="outline" 
              className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
              onClick={() => setShowTimer(!showTimer)}
            >
              <Play className="w-4 h-4 mr-2" />
              {showTimer ? "Hide Timer" : "Study Now"}
            </AnimatedButton>
          </div>

          <AnimatePresence>
            {showTimer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4 pt-4 border-t border-border"
              >
                <FocusTimer />
              </motion.div>
            )}
          </AnimatePresence>

          {!showTimer && (
            <>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: urgentTask ? (urgentTask.status === 'In Progress' ? '50%' : '10%') : '100%' }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
              <div className="text-xs text-muted-foreground mt-2 text-right">
                {urgentTask ? (urgentTask.status === 'In Progress' ? 'In Progress' : 'Not Started') : 'Complete'}
              </div>
            </>
          )}
        </AnimatedCard>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Your Classes</h2>
          <AnimatedButton variant="outline" size="sm" onClick={() => { if(isCreating) resetForm(); else setIsCreating(true); }}>
            {isCreating ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Class</>}
          </AnimatedButton>
        </div>

        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <AnimatedCard className="p-5 border-emerald-500/20 bg-emerald-500/5">
                <form onSubmit={handleCreateClass} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium mb-1 block">Course Name</label>
                      <input 
                        type="text" 
                        value={newCourse}
                        onChange={(e) => setNewCourse(e.target.value)}
                        placeholder="e.g. Data Structures" 
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
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
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Color Label</label>
                      <select
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option value="bg-emerald-500">Emerald</option>
                        <option value="bg-blue-500">Blue</option>
                        <option value="bg-purple-500">Purple</option>
                        <option value="bg-rose-500">Rose</option>
                        <option value="bg-amber-500">Amber</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
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
                    <div>
                      <label className="text-xs font-medium mb-1 block">Days (e.g. Mon, Wed)</label>
                      <input 
                        type="text" 
                        value={newDays.join(', ')}
                        onChange={(e) => setNewDays(e.target.value.split(',').map(d => d.trim()).filter(Boolean))}
                        placeholder="Mon, Wed" 
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Room</label>
                      <input 
                        type="text" 
                        value={newRoom}
                        onChange={(e) => setNewRoom(e.target.value)}
                        placeholder="Bldg 4, Rm 204" 
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <label className="text-xs font-medium mb-1 block">Credits</label>
                        <input 
                          type="number" 
                          min="0"
                          max="6"
                          value={newCredits}
                          onChange={(e) => setNewCredits(Number(e.target.value))}
                          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="text-xs font-medium mb-1 block">Grade</label>
                        <select
                          value={newGrade}
                          onChange={(e) => setNewGrade(e.target.value)}
                          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        >
                          <option>N/A</option>
                          <option>A+</option><option>A</option><option>A-</option>
                          <option>B+</option><option>B</option><option>B-</option>
                          <option>C+</option><option>C</option><option>C-</option>
                          <option>D+</option><option>D</option><option>F</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <AnimatedButton type="submit" className="w-full md:w-auto h-9 bg-emerald-500 text-white">
                      {editingId ? "Save Changes" : "Add Class"}
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
              <AnimatedCard key={item._id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 group relative overflow-hidden" hoverEffect={false}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.color || 'bg-emerald-500'}`} />
                <div className="w-24 font-mono text-sm font-medium text-muted-foreground pl-2">
                  {item.time}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base">{item.course}</h3>
                    {item.grade && item.grade !== 'N/A' && (
                      <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium border border-border">
                        {item.grade}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {item.type}
                    </span>
                    {item.days && item.days.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {item.days.join(', ')}
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/50">
                      {item.room}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <AnimatedButton variant="outline" size="sm" onClick={() => router.push('/notes')} className="hidden sm:flex mr-2">
                    Notes
                  </AnimatedButton>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEditClass(item); }}
                    className="p-1.5 text-muted-foreground hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-emerald-500/10"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
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
