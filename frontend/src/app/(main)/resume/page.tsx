"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { FileText, Briefcase, Zap, CheckCircle, AlertCircle, Sparkles, Loader2, ArrowLeft, UploadCloud, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface ReviewFeedback {
  atsScore: number;
  overallFeedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export default function ResumeReviewerPage() {
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<ReviewFeedback | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        setError("Only PDF files are supported at this time.");
        setResumeFile(null);
        return;
      }
      setError("");
      setResumeFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "application/pdf") {
        setError("Only PDF files are supported at this time.");
        setResumeFile(null);
        return;
      }
      setError("");
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode === "paste" && !resumeText.trim()) {
      setError("Please paste your resume text.");
      return;
    }
    if (inputMode === "upload" && !resumeFile) {
      setError("Please upload your PDF resume.");
      return;
    }
    
    setError("");
    setLoading(true);
    setFeedback(null);
    
    try {
      const formData = new FormData();
      if (inputMode === "upload" && resumeFile) {
        formData.append("resumeFile", resumeFile);
      } else {
        formData.append("resumeText", resumeText);
      }
      formData.append("jobDescription", jobDescription);

      const res = await apiFetch('/ai/review-resume', {
        method: 'POST',
        // Do not set Content-Type header when sending FormData; the browser sets it automatically with the boundary
        body: formData
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to get review from AI.");
      }
      
      setFeedback(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight flex items-center gap-2"
        >
          <FileText className="w-8 h-8 text-primary" />
          AI Resume Reviewer
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mt-2"
        >
          Upload your resume and an optional job description to get an AI-powered ATS score and actionable feedback.
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {!feedback ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <AnimatedCard className="p-6 col-span-1 lg:col-span-2 shadow-lg border-primary/10">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 border-b border-border pb-2">
                    <button 
                      type="button"
                      onClick={() => setInputMode("upload")}
                      className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${inputMode === "upload" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                      Upload PDF
                    </button>
                    <button 
                      type="button"
                      onClick={() => setInputMode("paste")}
                      className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${inputMode === "paste" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                      Paste Text
                    </button>
                  </div>

                  {inputMode === "upload" ? (
                    <div 
                      className={`w-full h-64 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors cursor-pointer ${resumeFile ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"}`}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => !resumeFile && fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        accept="application/pdf"
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                      />
                      {resumeFile ? (
                        <div className="flex flex-col items-center gap-2 text-primary">
                          <FileText className="w-12 h-12" />
                          <span className="font-semibold">{resumeFile.name}</span>
                          <span className="text-xs text-muted-foreground">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</span>
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                            className="mt-2 text-xs text-destructive hover:underline flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Remove File
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <UploadCloud className="w-12 h-12" />
                          <span className="font-medium">Click or drag & drop to upload</span>
                          <span className="text-xs">Supports PDF files only</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" /> Resume Content *
                      </label>
                      <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste your plain text resume here..."
                        className="w-full h-64 p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-y text-sm font-mono"
                        required={inputMode === "paste"}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-orange-500" /> Job Description (Optional)
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description to get a tailored ATS score..."
                    className="w-full h-32 p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-y text-sm"
                  />
                  <p className="text-xs text-muted-foreground">Adding a job description helps the AI evaluate your resume against specific keywords and requirements.</p>
                </div>
                
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <AnimatedButton 
                    type="submit" 
                    className="w-full md:w-auto bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium py-6 px-8"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Resume...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" /> Get ATS Score & Review
                      </>
                    )}
                  </AnimatedButton>
                </div>
              </form>
            </AnimatedCard>
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Review Results</h2>
              <AnimatedButton 
                variant="outline" 
                onClick={() => setFeedback(null)}
                className="rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Review Another
              </AnimatedButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* ATS Score Card */}
              <AnimatedCard className="p-6 md:col-span-1 flex flex-col items-center justify-center text-center bg-gradient-to-b from-primary/5 to-primary/10 border-primary/20">
                <h3 className="text-lg font-medium text-muted-foreground mb-4">ATS Match Score</h3>
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                    <motion.circle 
                      cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45}`}
                      animate={{ strokeDashoffset: `${2 * Math.PI * 45 * (1 - feedback.atsScore / 100)}` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                      className={
                        feedback.atsScore >= 80 ? "text-green-500" :
                        feedback.atsScore >= 60 ? "text-yellow-500" : "text-destructive"
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <motion.span 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 }}
                      className="text-4xl font-extrabold"
                    >
                      {feedback.atsScore}
                    </motion.span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                </div>
                <p className="mt-6 text-sm">
                  {feedback.atsScore >= 80 ? "Excellent match! Your resume is highly optimized." :
                   feedback.atsScore >= 60 ? "Good start, but room for optimization." : "Needs significant improvement for ATS."}
                </p>
              </AnimatedCard>

              {/* Feedback Details */}
              <div className="md:col-span-2 space-y-6">
                
                <AnimatedCard className="p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" /> Overall Feedback
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feedback.overallFeedback}
                  </p>
                </AnimatedCard>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <AnimatedCard className="p-6 border-green-500/20 bg-green-500/5">
                    <h3 className="text-md font-semibold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Strengths
                    </h3>
                    <ul className="space-y-3">
                      {feedback.strengths.map((item, idx) => (
                        <motion.li 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + (idx * 0.1) }}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="text-green-500 mt-0.5">•</span> {item}
                        </motion.li>
                      ))}
                    </ul>
                  </AnimatedCard>

                  <AnimatedCard className="p-6 border-red-500/20 bg-red-500/5">
                    <h3 className="text-md font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Weaknesses
                    </h3>
                    <ul className="space-y-3">
                      {feedback.weaknesses.map((item, idx) => (
                        <motion.li 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (idx * 0.1) }}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="text-red-500 mt-0.5">•</span> {item}
                        </motion.li>
                      ))}
                    </ul>
                  </AnimatedCard>
                </div>

                <AnimatedCard className="p-6 border-blue-500/20 bg-blue-500/5">
                  <h3 className="text-md font-semibold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Actionable Suggestions
                  </h3>
                  <ul className="space-y-3">
                    {feedback.suggestions.map((item, idx) => (
                      <motion.li 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + (idx * 0.1) }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-blue-500/10 text-sm"
                      >
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          {idx + 1}
                        </span> 
                        <span className="pt-0.5">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </AnimatedCard>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
