"use client";
import { apiFetch } from "@/lib/api";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LayoutGrid, List, Calendar as CalendarIcon, MoreVertical, X, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedCard } from "@/components/ui/animated-card";

interface Task {
  _id: string;
  title: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<'Todo'|'In Progress'|'Done'>("Todo");
  const [newTaskPriority, setNewTaskPriority] = useState<'Low'|'Medium'|'High'>("Medium");

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
          status: newTaskStatus,
          priority: newTaskPriority
        })
      });
      
      if (res.ok) {
        const createdTask = await res.json();
        setTasks([createdTask, ...tasks]);
        setIsModalOpen(false);
        setNewTaskTitle("");
      }
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await apiFetch(`/tasks/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setTasks(tasks.filter(t => t._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const handleUpdateTaskStatus = async (task: Task, newStatus: 'Todo' | 'In Progress' | 'Done') => {
    try {
      const res = await apiFetch(`/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: newStatus })
      });
      if (res.ok) {
        setTasks(tasks.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
        
        // Award XP if task is completed
        if (newStatus === 'Done') {
          try {
            await apiFetch('/gamification/award-xp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: 10 })
            });
          } catch (err) {
            console.error("Failed to award XP", err);
          }
        }
      }
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const todoTasks = tasks.filter(t => t.status === 'Todo');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const doneTasks = tasks.filter(t => t.status === 'Done');

  const renderTaskCard = (task: Task) => (
    <AnimatedCard key={task._id} className="p-4 group relative hover:border-primary/50 transition-colors" hoverEffect={false}>
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${task.status === 'Todo' ? 'bg-blue-500/10 text-blue-500' : task.status === 'In Progress' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
          {task.status}
        </span>
        <span className="text-xs text-muted-foreground font-medium">{task.priority}</span>
      </div>
      <h3 className="text-sm font-medium leading-tight mb-3 pr-6">{task.title}</h3>
      
      <div className="absolute bottom-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {task.status !== 'Todo' && (
          <button 
            onClick={(e) => { e.stopPropagation(); handleUpdateTaskStatus(task, task.status === 'Done' ? 'In Progress' : 'Todo'); }}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        )}
        {task.status !== 'Done' && (
          <button 
            onClick={(e) => { e.stopPropagation(); handleUpdateTaskStatus(task, task.status === 'Todo' ? 'In Progress' : 'Done'); }}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ml-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </AnimatedCard>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight"
          >
            All Tasks
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-1"
          >
            Organize your work and track progress.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <div className="flex bg-muted/50 rounded-lg p-1 mr-2">
            <button className="p-1.5 rounded-md bg-background shadow-sm text-foreground">
              <List className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground">
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
          
          <AnimatedButton onClick={() => setIsModalOpen(true)} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </AnimatedButton>
        </motion.div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {/* To Do Column */}
        <div className="flex flex-col h-full rounded-xl bg-muted/30 border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">To Do</span>
              <span className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-xs font-medium border border-border">
                {todoTasks.length}
              </span>
            </div>
            <button className="text-muted-foreground hover:text-foreground">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {todoTasks.map(renderTaskCard)}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="flex flex-col h-full rounded-xl bg-muted/30 border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">In Progress</span>
              <span className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-xs font-medium border border-border">
                {inProgressTasks.length}
              </span>
            </div>
            <button className="text-muted-foreground hover:text-foreground">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {inProgressTasks.map(renderTaskCard)}
          </div>
        </div>

        {/* Done Column */}
        <div className="flex flex-col h-full rounded-xl bg-muted/30 border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Done</span>
              <span className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-xs font-medium border border-border">
                {doneTasks.length}
              </span>
            </div>
            <button className="text-muted-foreground hover:text-foreground">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {doneTasks.map(renderTaskCard)}
          </div>
        </div>
      </div>

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
                <h2 className="text-lg font-semibold">Create New Task</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateTask} className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Task Title</label>
                  <input
                    autoFocus
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="E.g., Design the new landing page"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select
                      value={newTaskStatus}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewTaskStatus(e.target.value as 'Todo' | 'In Progress' | 'Done')}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="Todo">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewTaskPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <AnimatedButton type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </AnimatedButton>
                  <AnimatedButton type="submit" className="bg-primary text-primary-foreground">
                    Create Task
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
