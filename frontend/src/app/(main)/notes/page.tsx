"use client";
import { apiFetch } from "@/lib/api";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, FileText, Search, Plus, Trash2, Save } from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";

interface Note {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const res = await apiFetch('/notes');
        if (res.ok) {
          const data = await res.json();
          setNotes(data);
          if (data.length > 0) {
            setSelectedNote(data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch notes", err);
      }
    };
    loadNotes();
  }, []);

  const handleCreateNote = async () => {
    try {
      const res = await apiFetch('/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Note',
          content: 'Start writing...'
        })
      });
      if (res.ok) {
        const newNote = await res.json();
        setNotes([newNote, ...notes]);
        setSelectedNote(newNote);
      }
    } catch (err) {
      console.error("Failed to create note", err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    setIsSaving(true);
    try {
      const res = await apiFetch(`/notes/${selectedNote._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedNote.title,
          content: selectedNote.content
        })
      });
      if (res.ok) {
        const updatedNote = await res.json();
        setNotes(notes.map(n => n._id === updatedNote._id ? updatedNote : n));
      }
    } catch (err) {
      console.error("Failed to save note", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await apiFetch(`/notes/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const newNotes = notes.filter(n => n._id !== id);
        setNotes(newNotes);
        if (selectedNote?._id === id) {
          setSelectedNote(newNotes.length > 0 ? newNotes[0] : null);
        }
      }
    } catch (err) {
      console.error("Failed to delete note", err);
    }
  };

  const handleEnhanceNote = async () => {
    if (!selectedNote) return;
    setIsEnhancing(true);
    try {
      const res = await apiFetch(`/ai/enhance-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: selectedNote.content })
      });
      if (res.ok) {
        const data = await res.json();
        // Update the state locally, user still needs to save
        setSelectedNote({ ...selectedNote, content: data.enhancedContent });
      }
    } catch (err) {
      console.error("Failed to enhance note", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight flex items-center gap-3"
          >
            <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            AI Notes
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-2"
          >
            Capture your thoughts and let AI organize, summarize, and enhance them.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatedButton onClick={handleCreateNote} className="bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg shadow-yellow-500/20">
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </AnimatedButton>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-[600px]">
        {/* Sidebar for Notes */}
        <div className="w-full md:w-80 flex flex-col gap-4 border-r border-border pr-6 h-[600px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..." 
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
            {filteredNotes.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-10">
                No notes found. Create one!
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div 
                  key={note._id} 
                  onClick={() => setSelectedNote(note)}
                  className={`p-3 rounded-xl cursor-pointer transition-colors group relative ${selectedNote?._id === note._id ? 'bg-muted/80 border border-border/50' : 'hover:bg-muted/50 border border-transparent'}`}
                >
                  <h4 className="text-sm font-semibold truncate pr-6">{note.title}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">{note.content || "Empty note..."}</span>
                    <span className="text-[10px] text-muted-foreground/70">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteNote(note._id); }}
                    className="absolute right-2 top-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive rounded-md transition-all text-muted-foreground"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-card/50 rounded-2xl border border-border overflow-hidden h-[600px]">
          {selectedNote ? (
            <>
              <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <input
                    value={selectedNote.title}
                    onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                    className="text-sm font-medium bg-transparent border-none focus:outline-none w-64 text-foreground"
                    placeholder="Note Title"
                  />
                </div>
                <div className="flex gap-2">
                  <AnimatedButton 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSaveNote}
                    className="h-8 text-xs bg-muted hover:bg-muted/80 border-border"
                  >
                    <Save className="w-3 h-3 mr-1.5" />
                    {isSaving ? "Saving..." : "Save"}
                  </AnimatedButton>
                  <AnimatedButton 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEnhanceNote}
                    disabled={isEnhancing}
                    className={`h-8 text-xs bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-purple-500/20 text-purple-500 hover:text-purple-400 ${isEnhancing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Sparkles className={`w-3 h-3 mr-1.5 ${isEnhancing ? 'animate-pulse' : ''}`} />
                    {isEnhancing ? "Enhancing..." : "AI Enhance"}
                  </AnimatedButton>
                </div>
              </div>
              
              <div className="flex-1 p-0 overflow-hidden flex flex-col">
                <textarea
                  value={selectedNote.content}
                  onChange={(e) => setSelectedNote({ ...selectedNote, content: e.target.value })}
                  placeholder="Start typing your note here..."
                  className="w-full h-full p-8 bg-transparent border-none focus:outline-none resize-none custom-scrollbar text-muted-foreground leading-relaxed"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
              <BookOpen className="w-16 h-16 mb-4 opacity-10" />
              <h2 className="text-xl font-semibold mb-2">No Note Selected</h2>
              <p className="max-w-xs text-sm">Select a note from the sidebar or create a new one to start writing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
