"use client";

import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedCard } from "@/components/ui/animated-card";
import { ArrowRight, Brain, Calendar, CheckCircle, Clock, Search, Sparkles, Target, Zap } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b-0 border-white/10 dark:border-black/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <CheckCircle className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">TaskFlow AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#demo" className="hover:text-foreground transition-colors">Demo</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <a href="/login" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">Log in</a>
            <Link href="/signup">
              <AnimatedButton className="rounded-full shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-primary/20 text-primary text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>TaskFlow AI 2.0 is here</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl mx-auto leading-tight"
        >
          The Ultimate <span className="gradient-heading">AI Productivity</span> Operating System
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Not just another todo app. A beautiful, intelligent workspace that plans your day, prepares you for interviews, and acts as your personal productivity coach.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/signup">
            <AnimatedButton size="lg" className="rounded-full h-14 px-8 text-lg shadow-2xl shadow-primary/30 w-full sm:w-auto">
              Start for free <ArrowRight className="w-5 h-5 ml-2" />
            </AnimatedButton>
          </Link>
          <a href="mailto:demo@taskflowai.com">
            <AnimatedButton size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg glass border-white/20 w-full sm:w-auto">
              Book a Demo
            </AnimatedButton>
          </a>
        </motion.div>

        {/* Floating Interactive Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 w-full max-w-5xl relative perspective-1000"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[2.5rem] blur-2xl opacity-20"></div>
          <div className="relative rounded-[2rem] border border-white/10 bg-background/50 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
            {/* Dashboard Mockup Header */}
            <div className="h-14 border-b border-white/5 flex items-center px-4 justify-between bg-black/5">
               <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                 <div className="w-3 h-3 rounded-full bg-green-400"></div>
               </div>
               <div className="flex-1 max-w-sm mx-4 bg-black/10 dark:bg-white/5 rounded-md h-8 flex items-center px-3 gap-2">
                 <Search className="w-4 h-4 text-muted-foreground" />
                 <span className="text-xs text-muted-foreground">Ask AI to &quot;Schedule my week&quot;...</span>
               </div>
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500"></div>
            </div>
            
            {/* Dashboard Mockup Body */}
            <div className="flex-1 flex p-6 gap-6 overflow-hidden">
              {/* Sidebar */}
              <div className="w-64 hidden md:flex flex-col gap-4">
                 <div className="h-8 w-3/4 bg-black/5 dark:bg-white/5 rounded-md"></div>
                 <div className="h-8 w-1/2 bg-black/5 dark:bg-white/5 rounded-md mt-4"></div>
                 <div className="h-8 w-2/3 bg-black/5 dark:bg-white/5 rounded-md"></div>
                 <div className="h-8 w-3/4 bg-black/5 dark:bg-white/5 rounded-md"></div>
              </div>
              
              {/* Main Content Area */}
              <div className="flex-1 flex flex-col gap-6">
                <div className="h-10 w-48 bg-black/5 dark:bg-white/5 rounded-lg mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <AnimatedCard className="h-32 p-4 flex flex-col justify-between hoverEffect={false}">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Focus Score</div>
                      <div className="text-2xl font-bold">94%</div>
                    </div>
                  </AnimatedCard>
                  <AnimatedCard className="h-32 p-4 flex flex-col justify-between hoverEffect={false}">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Productivity</div>
                      <div className="text-2xl font-bold">+12%</div>
                    </div>
                  </AnimatedCard>
                  <AnimatedCard className="h-32 p-4 flex flex-col justify-between hoverEffect={false}">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">AI Suggestions</div>
                      <div className="text-2xl font-bold">3 Tasks</div>
                    </div>
                  </AnimatedCard>
                </div>
                
                {/* Floating tasks */}
                <div className="flex-1 relative mt-4">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute top-4 left-4 right-1/4 h-16 rounded-xl glass p-4 flex items-center gap-4"
                  >
                     <div className="w-5 h-5 rounded-full border-2 border-primary"></div>
                     <div className="flex-1">
                       <div className="h-3 w-1/3 bg-foreground/20 rounded-full mb-2"></div>
                       <div className="h-2 w-1/4 bg-foreground/10 rounded-full"></div>
                     </div>
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                    className="absolute top-24 left-8 right-1/5 h-16 rounded-xl glass p-4 flex items-center gap-4"
                  >
                     <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                       <CheckCircle className="w-3 h-3 text-primary" />
                     </div>
                     <div className="flex-1">
                       <div className="h-3 w-1/2 bg-foreground/20 rounded-full mb-2"></div>
                       <div className="h-2 w-1/5 bg-foreground/10 rounded-full"></div>
                     </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Everything you need. <br /> <span className="text-muted-foreground">Powered by AI.</span></h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">TaskFlow AI replaces your todo list, calendar, notebook, and focus timer with a single, deeply integrated workspace.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Smart Task Management", desc: "AI automatically prioritizes your tasks and predicts missed deadlines before they happen.", icon: <CheckCircle className="w-6 h-6 text-primary" /> },
              { title: "Interview Prep Mode", desc: "Track job applications, generate mock questions, and analyze your mock interview scores.", icon: <Target className="w-6 h-6 text-purple-500" /> },
              { title: "Student OS", desc: "Generate study schedules, flashcards, and quizzes from your notes in one click.", icon: <Brain className="w-6 h-6 text-blue-500" /> },
              { title: "Focus Timer", desc: "Beautiful pomodoro timer with ambient sounds and deep focus analytics.", icon: <Clock className="w-6 h-6 text-green-500" /> },
              { title: "Automated Calendar", desc: "AI finds the perfect time for deep work and auto-schedules your week.", icon: <Calendar className="w-6 h-6 text-yellow-500" /> },
              { title: "Gamified Progress", desc: "Earn XP, unlock badges, and maintain daily streaks to stay motivated.", icon: <Zap className="w-6 h-6 text-orange-500" /> },
            ].map((feature, i) => (
              <AnimatedCard key={i} className="p-6">
                <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10 glass p-12 rounded-[3rem] border border-primary/20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to transform your workflow?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of students, engineers, and professionals who are already doing their best work with TaskFlow AI.
          </p>
          <Link href="/signup">
            <AnimatedButton size="lg" className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/30">
              Get Started for Free <ArrowRight className="w-5 h-5 ml-2" />
            </AnimatedButton>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center text-muted-foreground text-sm">
        <p>© 2026 TaskFlow AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
