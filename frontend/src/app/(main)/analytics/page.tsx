"use client";
import { apiFetch } from "@/lib/api";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, TrendingUp, Activity, Award, CheckCircle2, ListTodo } from "lucide-react";
import { AnimatedCard } from "@/components/ui/animated-card";

interface GamificationStats {
  xp: number;
  level: number;
  streak: number;
}

interface Task {
  _id: string;
  title: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<GamificationStats>({ xp: 0, level: 1, streak: 0 });
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          apiFetch('/gamification'),
          apiFetch('/tasks')
        ]);
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
        }
      } catch (err) {
        console.error("Failed to load analytics data", err);
      }
    };
    loadData();
  }, []);

  // Compute metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const todoTasks = tasks.filter(t => t.status === 'Todo').length;
  
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // XP Progress Calculation
  const xpForNextLevel = stats.level * 100; // Formula used in backend: level = floor(xp/100) + 1. Next level is at (level) * 100
  const xpCurrentLevelBase = (stats.level - 1) * 100;
  const xpProgressInLevel = stats.xp - xpCurrentLevelBase;
  const xpProgressPercent = Math.min(100, Math.round((xpProgressInLevel / 100) * 100));

  // Category Distribution
  const categoryCounts = tasks.reduce((acc, task) => {
    const cat = task.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const maxCategoryCount = sortedCategories.length > 0 ? sortedCategories[0][1] : 0;

  // Daily Progress Calculation (Last 7 Days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  const dailyProgress = last7Days.map(dateStr => {
    const completedThatDay = tasks.filter(t => 
      t.status === 'Done' && 
      t.updatedAt && 
      t.updatedAt.startsWith(dateStr)
    ).length;

    const createdThatDay = tasks.filter(t => 
      t.createdAt && 
      t.createdAt.startsWith(dateStr)
    ).length;

    return {
      date: dateStr,
      label: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
      completed: completedThatDay,
      created: createdThatDay
    };
  });

  const maxDailyValue = Math.max(...dailyProgress.map(d => Math.max(d.completed, d.created, 1)));

  // Velocity Calculation (Last 14 Days)
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split('T')[0];
  });
  
  const velocityData = last14Days.map(dateStr => {
    return tasks.filter(t => t.status === 'Done' && t.updatedAt && t.updatedAt.startsWith(dateStr)).length;
  });
  
  const maxVelocity = Math.max(...velocityData, 4); // minimum 4 for visual scale
  
  // SVG points for velocity area chart
  const svgWidth = 600;
  const svgHeight = 150;
  const points = velocityData.map((val, index) => {
    const x = (index / (velocityData.length - 1)) * svgWidth;
    const y = svgHeight - (val / maxVelocity) * (svgHeight - 20) - 10;
    return `${x},${y}`;
  }).join(' ');
  const areaPoints = `0,${svgHeight} ${points} ${svgWidth},${svgHeight}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight flex items-center gap-3"
          >
            <div className="p-2 bg-pink-500/10 text-pink-500 rounded-lg">
              <PieChart className="w-6 h-6" />
            </div>
            Analytics & Gamification
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-2"
          >
            Track your productivity trends and level up.
          </motion.p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedCard className="p-6 bg-gradient-to-br from-pink-500/10 to-orange-500/10 border-pink-500/20 md:col-span-2 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">Level {stats.level} Scholar</h2>
            <p className="text-sm text-muted-foreground mb-4">You are making great progress! Keep completing tasks to level up.</p>
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium">{stats.xp} / {xpForNextLevel} Total XP</div>
            </div>
            <div className="w-full max-w-sm h-2 bg-muted rounded-full mt-2 overflow-hidden border border-background">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${xpProgressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-pink-500 to-orange-500 rounded-full"
              />
            </div>
          </div>
          <div className="hidden md:block">
            <Award className="w-24 h-24 text-pink-500 opacity-20" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6 flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
            <Activity className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-3xl font-bold">{stats.streak}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Day Streak</div>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Overview */}
        <AnimatedCard className="p-6 border-border flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-lg">Productivity Overview</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="bg-muted/30 rounded-xl p-4 flex flex-col items-center justify-center border border-border/50">
              <div className="text-4xl font-bold text-foreground mb-1">{totalTasks}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1">
                <ListTodo className="w-3.5 h-3.5" /> Total Tasks
              </div>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 flex flex-col items-center justify-center border border-border/50">
              <div className="text-4xl font-bold text-green-500 mb-1">{completionRate}%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completion Rate
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Task Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Done</span>
                <span className="font-medium">{completedTasks}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> In Progress</span>
                <span className="font-medium">{inProgressTasks}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> To Do</span>
                <span className="font-medium">{todoTasks}</span>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Task Distribution */}
        <AnimatedCard className="p-6 border-border flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-lg">Distribution by Category</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-4">
            {sortedCategories.length === 0 ? (
               <div className="text-center text-muted-foreground py-8">No tasks available to categorize.</div>
            ) : (
              sortedCategories.map(([category, count]) => {
                const widthPercent = Math.round((count / maxCategoryCount) * 100);
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{category}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Progress Graph */}
        <AnimatedCard className="p-6 border-border flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-lg">Daily Progress (Last 7 Days)</h3>
          </div>
          
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {dailyProgress.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-full relative">
                  {/* Created Bar */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.created / maxDailyValue) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="w-1/2 max-w-[20px] min-w-[6px] bg-muted/60 rounded-t-sm relative"
                  />
                  
                  {/* Completed Bar */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.completed / maxDailyValue) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className="w-1/2 max-w-[20px] min-w-[6px] bg-blue-500 rounded-t-sm relative"
                  />
                  
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs p-1.5 rounded shadow-lg whitespace-nowrap z-10 pointer-events-none">
                    <span className="font-medium">{day.completed}</span> done / <span className="font-medium">{day.created}</span> new
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground font-medium">{day.label}</div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 bg-muted/60 rounded-sm"></div>
              Created
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              Completed
            </div>
          </div>
        </AnimatedCard>

        {/* Task Velocity Area Chart */}
        <AnimatedCard className="p-6 border-border flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-lg">Task Velocity (Last 14 Days)</h3>
          </div>
          
          <div className="flex-1 relative w-full h-48 rounded-lg overflow-hidden border border-border/50 bg-muted/10 group">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              preserveAspectRatio="none" 
              className="w-full h-full absolute inset-0"
            >
              <defs>
                <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(249 115 22)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="rgb(249 115 22)" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              <motion.polygon 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                points={areaPoints} 
                fill="url(#velocityGradient)" 
              />
              <motion.polyline 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                points={points} 
                fill="none" 
                stroke="rgb(249 115 22)" 
                strokeWidth="4" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="absolute top-4 left-4 text-xs font-semibold text-orange-500 bg-orange-500/10 px-2 py-1 rounded">
              High: {Math.max(...velocityData)} Tasks
            </div>
          </div>
          
          <div className="flex justify-between mt-6 pt-6 border-t border-border/50 text-xs text-muted-foreground">
            <span>{new Date(last14Days[0]).toLocaleDateString()}</span>
            <span>{new Date(last14Days[13]).toLocaleDateString()}</span>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}
