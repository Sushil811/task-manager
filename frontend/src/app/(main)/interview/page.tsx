"use client";
import { apiFetch } from "@/lib/api";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Target, Briefcase, Brain, Clock, Plus, Trash2, Code2, CheckCircle2, X, Sparkles, Play, Save, Terminal, Wand2, Maximize2, Minimize2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { AnimatedCard } from "@/components/ui/animated-card";
import { AnimatedButton } from "@/components/ui/animated-button";

interface JobApplication {
  _id: string;
  company: string;
  role: string;
  status: 'Applied' | 'Phone Screen' | 'Take-home' | 'Onsite' | 'Offer' | 'Rejected';
  appliedDate: string;
}

interface CodingProblem {
  _id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'To Do' | 'Attempted' | 'Solved';
  solutionCode?: string;
  language?: string;
  description?: string;
}

export default function InterviewPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Application Form State
  const [isCreatingApp, setIsCreatingApp] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");

  // Code Review Modal State
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [code, setCode] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<{
    overall: string;
    explanation?: string;
    rating?: number;
    timeComplexity: string;
    spaceComplexity: string;
    suggestions: string[];
  } | null>(null);
  
  const [codeOutput, setCodeOutput] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript");
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const [aiTopic, setAiTopic] = useState("Random");
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Coding Problem Form State
  const [isCreatingProb, setIsCreatingProb] = useState(false);
  const [newProbTitle, setNewProbTitle] = useState("");
  const [newProbDiff, setNewProbDiff] = useState("Medium");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, probRes] = await Promise.all([
          apiFetch('/applications'),
          apiFetch('/coding')
        ]);
        
        if (appRes.ok) {
          const data = await appRes.json();
          setApplications(data);
        }
        if (probRes.ok) {
          const data = await probRes.json();
          setProblems(data);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim()) return;
    
    try {
      const res = await apiFetch('/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: newCompany, role: newRole, status: 'Applied' })
      });
      if (res.ok) {
        const data = await res.json();
        setApplications([data, ...applications]);
        setNewCompany("");
        setNewRole("");
        setIsCreatingApp(false);
      }
    } catch (err) {
      console.error("Failed to create application", err);
    }
  };

  const handleDeleteApp = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await apiFetch(`/applications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApplications(applications.filter(a => a._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete application", err);
    }
  };

  const handleCreateProb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProbTitle.trim()) return;
    
    try {
      const res = await apiFetch('/coding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newProbTitle, difficulty: newProbDiff, status: 'To Do' })
      });
      if (res.ok) {
        const data = await res.json();
        setProblems([data, ...problems]);
        setNewProbTitle("");
        setNewProbDiff("Medium");
        setIsCreatingProb(false);
      }
    } catch (err) {
      console.error("Failed to create problem", err);
    }
  };

  const handleDeleteProb = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await apiFetch(`/coding/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProblems(problems.filter(p => p._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete coding problem", err);
    }
  };

  const handleToggleProbStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Solved' ? 'To Do' : 'Solved';
    try {
      const res = await apiFetch(`/coding/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setProblems(problems.map(p => p._id === id ? { ...p, status: newStatus as 'To Do' | 'Attempted' | 'Solved' } : p));
      }
    } catch (err) {
      console.error("Failed to update problem", err);
    }
  };

  const handleReviewCode = async () => {
    if (!code.trim() || !selectedProblem) return;
    
    setIsReviewing(true);
    setReviewResult(null);
    try {
      const res = await apiFetch('/ai/review-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, problemTitle: selectedProblem.title, language: selectedLanguage })
      });
      if (res.ok) {
        const data = await res.json();
        setReviewResult(data);
      }
    } catch (err) {
      console.error("Failed to review code", err);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleGenerateProblem = async () => {
    setIsGeneratingProblem(true);
    try {
      // 1. Ask AI to generate a problem
      const aiRes = await apiFetch('/ai/generate-problem', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic })
      });
      if (aiRes.ok) {
        const generated = await aiRes.json();
        
        // 2. Save it to DB
        const res = await apiFetch('/coding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: generated.title, difficulty: generated.difficulty, status: 'To Do', description: generated.description })
        });
        if (res.ok) {
          const data = await res.json();
          setProblems([data, ...problems]);
        }
      }
    } catch (err) {
      console.error("Failed to generate problem", err);
    } finally {
      setIsGeneratingProblem(false);
    }
  };

  const handleRunCode = async () => {
    const output: string[] = [];
    
    if (selectedLanguage === 'JavaScript') {
      const originalConsoleLog = console.log;
      
      console.log = (...args: unknown[]) => {
        output.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        originalConsoleLog(...args);
      };

      try {
        const fn = new Function(code);
        fn();
        if (output.length === 0) {
          output.push("Execution completed. (No output)");
        }
      } catch (err: unknown) {
        output.push(`Error: ${err instanceof Error ? err.message : String(err)}`);
      }

      console.log = originalConsoleLog;
      setCodeOutput(output);
    } else {
      // Send to AI mock executor
      setCodeOutput(["Executing on AI server..."]);
      try {
        const res = await apiFetch('/ai/simulate-execution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language: selectedLanguage })
        });
        if (res.ok) {
          const data = await res.json();
          setCodeOutput(data.output);
        } else {
          setCodeOutput(["Error: Could not reach execution server."]);
        }
      } catch {
        setCodeOutput(["Error: Simulation failed."]);
      }
    }
  };

  const handleSaveSolution = async () => {
    if (!selectedProblem) return;
    setIsSaving(true);
    try {
      const res = await apiFetch(`/coding/${selectedProblem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solutionCode: code, status: 'Solved', language: selectedLanguage })
      });
      if (res.ok) {
        const updated = await res.json();
        setProblems(problems.map(p => p._id === updated._id ? updated : p));
        setSelectedProblem(null);
      }
    } catch (err) {
      console.error("Failed to save solution", err);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Offer': return { color: "text-green-500", bg: "bg-green-500/10" };
      case 'Onsite': return { color: "text-purple-500", bg: "bg-purple-500/10" };
      case 'Take-home': return { color: "text-orange-500", bg: "bg-orange-500/10" };
      case 'Phone Screen': return { color: "text-blue-500", bg: "bg-blue-500/10" };
      case 'Rejected': return { color: "text-red-500", bg: "bg-red-500/10" };
      default: return { color: "text-gray-500", bg: "bg-gray-500/10" }; // Applied
    }
  };

  const getDiffColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return "text-green-500 bg-green-500/10";
      case 'Medium': return "text-orange-500 bg-orange-500/10";
      case 'Hard': return "text-red-500 bg-red-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const activeApplications = applications.filter(a => a.status !== 'Rejected' && a.status !== 'Offer');
  
  const solvedProbs = problems.filter(p => p.status === 'Solved').length;
  const totalProbs = problems.length;
  const fillPercentage = totalProbs === 0 ? 0 : Math.round((solvedProbs / totalProbs) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight flex items-center gap-3"
          >
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Target className="w-6 h-6" />
            </div>
            Interview Workspace
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-2 max-w-2xl"
          >
            Track your job applications, prepare for mock interviews, and organize your coding practice.
          </motion.p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedCard className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-purple-500/20 md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Brain className="w-32 h-32" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Upcoming: Google SWE Mock</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md">
            System Design focus on Distributed Caching. Scheduled for tomorrow at 2:00 PM.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium bg-background/50 px-3 py-1.5 rounded-full border border-border">
              <Clock className="w-4 h-4 text-purple-500" />
              18h 45m 12s
            </div>
            <AnimatedButton onClick={() => router.push('/notes')} className="bg-purple-500 text-white shadow-lg shadow-purple-500/25">
              Review Materials
            </AnimatedButton>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6 flex flex-col justify-center items-center text-center">
          <div className="text-4xl font-bold text-blue-500 mb-1">{solvedProbs}</div>
          <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Problems Solved</div>
          <div className="w-full h-2 bg-muted rounded-full mt-4 overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${fillPercentage}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-blue-500 rounded-full absolute left-0 top-0" 
            />
          </div>
          <div className="text-xs text-muted-foreground mt-2 w-full flex justify-between">
            <span>Total: {totalProbs}</span>
            <span>Active Apps: {activeApplications.length}</span>
          </div>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Job Applications Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Applications</h2>
            <AnimatedButton variant="outline" size="sm" onClick={() => setIsCreatingApp(!isCreatingApp)}>
              {isCreatingApp ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add</>}
            </AnimatedButton>
          </div>
          
          <AnimatePresence>
            {isCreatingApp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <AnimatedCard className="p-4 border-primary/20 bg-primary/5">
                  <form onSubmit={handleCreateApp} className="flex flex-col gap-3">
                    <div>
                      <input 
                        type="text" 
                        value={newCompany}
                        onChange={(e) => setNewCompany(e.target.value)}
                        placeholder="Company (e.g. OpenAI)" 
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        autoFocus
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="Role (e.g. Frontend Engineer)" 
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <AnimatedButton type="submit" className="w-full h-9">
                      Save Application
                    </AnimatedButton>
                  </form>
                </AnimatedCard>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground text-sm">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-border border-dashed text-sm">
                No applications yet.
              </div>
            ) : (
              applications.map((app) => {
                const styles = getStatusColor(app.status);
                return (
                  <AnimatedCard key={app._id} className="p-4 flex items-center justify-between group cursor-pointer" hoverEffect={false}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{app.company}</h3>
                        <p className="text-xs text-muted-foreground">{app.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-wider ${styles.bg} ${styles.color}`}>
                        {app.status}
                      </span>
                      <button 
                        onClick={(e) => handleDeleteApp(app._id, e)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </AnimatedCard>
                );
              })
            )}
          </div>
        </div>

        {/* Coding Practice Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Coding Practice</h2>
            <div className="flex items-center gap-2">
              <select
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="bg-muted/50 border border-border rounded-md text-sm px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 text-muted-foreground transition-colors"
              >
                <option value="Random">Random Topic</option>
                <option value="Arrays">Arrays</option>
                <option value="Linked Lists">Linked Lists</option>
                <option value="Trees">Trees</option>
                <option value="Dynamic Programming">Dynamic Programming</option>
                <option value="Graphs">Graphs</option>
                <option value="Strings">Strings</option>
                <option value="Two Pointers">Two Pointers</option>
                <option value="Binary Search">Binary Search</option>
                <option value="Stack">Stack</option>
                <option value="Queue">Queue</option>
                <option value="Heap">Heap / Priority Queue</option>
                <option value="Greedy">Greedy</option>
                <option value="Backtracking">Backtracking</option>
                <option value="Bit Manipulation">Bit Manipulation</option>
                <option value="Trie">Trie</option>
                <option value="Matrix">Matrix</option>
              </select>
              <AnimatedButton variant="outline" size="sm" onClick={handleGenerateProblem} disabled={isGeneratingProblem} className="bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20">
                {isGeneratingProblem ? 'Generating...' : <><Wand2 className="w-4 h-4 mr-2" /> AI Generate</>}
              </AnimatedButton>
              <AnimatedButton variant="outline" size="sm" onClick={() => setIsCreatingProb(!isCreatingProb)}>
                {isCreatingProb ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add</>}
              </AnimatedButton>
            </div>
          </div>
          
          <AnimatePresence>
            {isCreatingProb && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <AnimatedCard className="p-4 border-blue-500/20 bg-blue-500/5">
                  <form onSubmit={handleCreateProb} className="flex flex-col gap-3">
                    <div>
                      <input 
                        type="text" 
                        value={newProbTitle}
                        onChange={(e) => setNewProbTitle(e.target.value)}
                        placeholder="Problem Title (e.g. Two Sum)" 
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                    </div>
                    <div>
                      <select 
                        value={newProbDiff}
                        onChange={(e) => setNewProbDiff(e.target.value)}
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    </div>
                    <AnimatedButton type="submit" className="w-full h-9 bg-blue-500 text-white">
                      Save Problem
                    </AnimatedButton>
                  </form>
                </AnimatedCard>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground text-sm">Loading problems...</div>
            ) : problems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-border border-dashed text-sm">
                No coding problems yet. Start practicing!
              </div>
            ) : (
              problems.map((prob) => {
                const diffColor = getDiffColor(prob.difficulty);
                const isSolved = prob.status === 'Solved';
                return (
                  <AnimatedCard 
                    key={prob._id} 
                    className={`p-4 flex items-center justify-between group cursor-pointer ${isSolved ? 'opacity-60' : ''}`} 
                    hoverEffect={false}
                  >
                    <div className="flex items-center gap-4 flex-1" onClick={() => { setSelectedProblem(prob); setCode(prob.solutionCode || ""); setSelectedLanguage(prob.language || "JavaScript"); setReviewResult(null); setCodeOutput([]); }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleProbStatus(prob._id, prob.status); }}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSolved ? 'bg-blue-500 border-blue-500 text-white' : 'border-muted-foreground text-transparent hover:border-blue-500'}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <div>
                        <h3 className={`font-semibold text-sm ${isSolved ? 'line-through text-muted-foreground' : ''}`}>{prob.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Code2 className="w-3 h-3 text-muted-foreground" />
                          <span className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider ${diffColor}`}>
                            {prob.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => handleDeleteProb(prob._id, e)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </AnimatedCard>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* AI Code Editor Modal */}
      <AnimatePresence>
        {selectedProblem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center ${isFullScreen ? 'p-0' : 'p-4 sm:p-6'}`}
            onClick={() => { setSelectedProblem(null); setIsFullScreen(false); }}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full text-white bg-black/40 backdrop-blur-3xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.15)] ring-1 ring-white/10 ${
                isFullScreen 
                  ? 'h-full max-w-none rounded-none' 
                  : 'max-w-7xl max-h-[90vh] rounded-2xl'
              }`}
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-500/10 via-transparent to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="font-bold">{selectedProblem.title}</h2>
                    <span className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider inline-block mt-1 ${getDiffColor(selectedProblem.difficulty)}`}>
                      {selectedProblem.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
                  >
                    {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => { setSelectedProblem(null); setIsFullScreen(false); }}
                    className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col h-full gap-6">
                <div className={`grid grid-cols-1 ${isFullScreen ? 'lg:grid-cols-2' : 'lg:grid-cols-2'} gap-6 h-full`}>
                  
                  {/* Left Pane: Problem Description */}
                  <div className="flex flex-col h-full bg-black/30 rounded-xl border border-white/5 shadow-inner overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
                    <div className="bg-white/5 border-b border-white/5 p-3 flex items-center justify-between relative z-10">
                      <label className="text-sm font-semibold flex items-center gap-2 text-white">
                        <Target className="w-4 h-4 text-purple-400" />
                        Problem Statement
                      </label>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto prose prose-invert prose-p:text-gray-200 prose-headings:text-white prose-a:text-purple-400 prose-code:text-purple-300 prose-code:bg-purple-500/10 prose-strong:text-white prose-ul:text-gray-200 prose-ol:text-gray-200 prose-li:marker:text-gray-400 prose-li:text-gray-200 max-w-none text-sm text-gray-200 relative z-10">
                      {selectedProblem.description ? (
                        <ReactMarkdown>{selectedProblem.description}</ReactMarkdown>
                      ) : (
                        <p className="text-gray-400 italic">No description available for this problem.</p>
                      )}
                    </div>
                  </div>

                  {/* Right Pane: Code Editor and Output */}
                  <div className="flex flex-col h-full gap-6">
                    {/* Code Editor */}
                    <div className="flex flex-col flex-1">
                      <label className="text-sm font-medium mb-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          Your Solution
                          <select 
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="bg-black border border-white/10 rounded text-xs px-2 py-1 ml-2 focus:outline-none focus:border-purple-500 text-gray-300"
                          >
                            <option value="JavaScript">JavaScript (Node)</option>
                            <option value="Python">Python 3</option>
                            <option value="Java">Java</option>
                            <option value="C++">C++</option>
                            <option value="Go">Go</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={handleRunCode}
                            disabled={!code.trim()}
                            className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 px-4 py-1.5 rounded transition-all shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:shadow-[0_0_25px_rgba(52,211,153,0.5)] disabled:opacity-50 disabled:shadow-none font-medium"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Run
                          </button>
                          <button 
                            onClick={handleSaveSolution}
                            disabled={isSaving || !code.trim()}
                            className="flex items-center gap-1.5 text-xs bg-white/10 text-white hover:bg-white/20 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {isSaving ? 'Saving...' : 'Save & Close'}
                          </button>
                        </div>
                      </label>
                      <div className="relative flex-1 min-h-[250px]">
                        <textarea 
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder={`// Write or paste your ${selectedLanguage} code here...`}
                          className={`w-full bg-[#0d0d0d] text-[#e5e5e5] font-mono text-sm p-4 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none shadow-inner transition-all ${isFullScreen ? 'h-full' : 'h-full min-h-[250px]'}`}
                          spellCheck="false"
                        />
                      </div>
                    </div>

                    {/* Output Pane */}
                    <div className="flex flex-col h-48 shrink-0">
                      <label className="text-sm font-medium mb-2 flex items-center gap-2 text-white/80">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        Terminal
                      </label>
                      <div className="flex-1 bg-[#050505] text-emerald-400 font-mono text-sm p-4 rounded-xl border border-emerald-500/20 overflow-y-auto shadow-[inset_0_0_20px_rgba(52,211,153,0.05)]">
                        {codeOutput.length === 0 ? (
                          <div className="text-muted-foreground opacity-50 italic">Output will appear here...</div>
                        ) : (
                          codeOutput.map((out, idx) => (
                            <div key={idx} className={out.startsWith("Error:") ? "text-red-500" : ""}>
                              {out}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-border pt-4 mt-auto">
                  <AnimatedButton 
                    onClick={handleReviewCode} 
                    disabled={isReviewing || !code.trim()}
                    className="bg-blue-500 text-white shadow-lg shadow-blue-500/25 flex items-center gap-2"
                  >
                    {isReviewing ? (
                      <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Sparkles className="w-4 h-4" /></motion.div> AI Reviewing...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> AI Tutor Review</>
                    )}
                  </AnimatedButton>
                </div>

                {/* AI Review Results */}
                <AnimatePresence>
                  {reviewResult && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-6 rounded-xl space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-blue-500/10">
                          <div className="flex items-center gap-2 text-blue-500 font-semibold">
                            <Brain className="w-5 h-5" />
                            AI Feedback
                          </div>
                          {reviewResult.rating !== undefined && (
                            <div className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm border ${
                              reviewResult.rating >= 8 ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                              reviewResult.rating >= 5 ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                              'bg-red-500/20 text-red-500 border-red-500/30'
                            }`}>
                              Rating: {reviewResult.rating}/10
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium">{reviewResult.overall}</p>
                        
                        {reviewResult.explanation && (
                          <div className="bg-background/50 p-4 rounded-lg border border-border mt-4">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Code Analysis</div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{reviewResult.explanation}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                          <div className="bg-background/50 p-3 rounded-lg border border-border">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Time Complexity</div>
                            <div className="text-sm font-medium">{reviewResult.timeComplexity}</div>
                          </div>
                          <div className="bg-background/50 p-3 rounded-lg border border-border">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Space Complexity</div>
                            <div className="text-sm font-medium">{reviewResult.spaceComplexity}</div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Suggestions & Edge Cases</div>
                          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                            {reviewResult.suggestions.map((s: string, i: number) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
