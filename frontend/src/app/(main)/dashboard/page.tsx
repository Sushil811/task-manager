"use client";
import { apiFetch } from "@/lib/api";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";
import { CheckCircle, Clock, Target, Zap, Play } from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";
import Link from "next/link";

interface Task {
  _id: string;
  title: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  category: string;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  
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

  const handleCompleteTask = async (task: Task) => {
    try {
      const res = await apiFetch(`/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: 'Done' })
      });
      if (res.ok) {
        setTasks(tasks.map(t => t._id === task._id ? { ...t, status: 'Done' } : t));
        
        // Award XP
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
    } catch (err) {
      console.error("Failed to complete task", err);
    }
  };

  const completedTasksCount = tasks.filter(t => t.status === 'Done').length;
  const totalTasksCount = tasks.length;
  const pendingTasks = tasks.filter(t => t.status !== 'Done');
  
  // Get the most urgent task
  const upNextTask = pendingTasks.find(t => t.priority === 'High') || pendingTasks[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight"
          >
            Good Morning, Sushil!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-1"
          >
            Here&apos;s what AI has planned for you today.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatedButton className="rounded-full shadow-lg shadow-primary/20 bg-primary text-primary-foreground">
            <Zap className="w-4 h-4 mr-2" />
            AI Auto-Schedule
          </AnimatedButton>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnimatedCard className="p-5 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold">{completedTasksCount} / {totalTasksCount === 0 ? 1 : totalTasksCount}</div>
            <div className="text-sm text-muted-foreground">Tasks Completed</div>
          </div>
        </AnimatedCard>
        
        <AnimatedCard className="p-5 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
            <Target className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <div className="text-2xl font-bold">{totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}%</div>
            <div className="text-sm text-muted-foreground">Focus Score</div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-5 flex flex-col justify-between md:col-span-2 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-purple-500/20">
          <div className="flex justify-between items-start mb-2">
             <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <div className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
              Up Next
            </div>
          </div>
          <div>
            <div className="text-xl font-bold">{upNextTask ? upNextTask.title : "No tasks remaining! Great job!"}</div>
            {upNextTask && (
              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <span>{upNextTask.priority} Priority</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                <span>{upNextTask.category}</span>
              </div>
            )}
          </div>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Today&apos;s Tasks</h2>
            <Link href="/tasks">
              <AnimatedButton variant="ghost" size="sm" className="text-primary">
                View All
              </AnimatedButton>
            </Link>
          </div>
          
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <AnimatedCard className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <CheckCircle className="w-12 h-12 mb-4 opacity-20" />
                <p>You&apos;re all caught up!</p>
              </AnimatedCard>
            ) : (
              pendingTasks.slice(0, 5).map((task) => (
                <AnimatedCard key={task._id} className="p-4 flex items-center gap-4 hoverEffect={false} group">
                  <button 
                    onClick={() => handleCompleteTask(task)}
                    className="w-6 h-6 rounded-md border-2 border-muted-foreground/30 flex items-center justify-center group-hover:border-primary transition-colors focus:outline-none"
                  >
                    <CheckCircle className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{task.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{task.category}</span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{task.priority} Priority</span>
                    </div>
                  </div>
                  <AnimatedButton variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Play className="w-4 h-4" />
                  </AnimatedButton>
                </AnimatedCard>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">AI Insights</h2>
          
          <AnimatedCard className="p-5 bg-gradient-to-b from-blue-500/5 to-transparent border-blue-500/20">
            <p className="text-sm leading-relaxed">
              <span className="font-semibold text-blue-500">TaskFlow AI:</span> You&apos;ve been extremely productive this morning! Based on your focus patterns, I suggest tackling your High Priority tasks now while your energy is peak.
            </p>
            <div className="mt-4 flex gap-2">
              <AnimatedButton size="sm" className="bg-blue-500 hover:bg-blue-600 text-white text-xs">
                Start Focus Session
              </AnimatedButton>
              <AnimatedButton size="sm" variant="outline" className="text-xs glass">
                Reschedule
              </AnimatedButton>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}
