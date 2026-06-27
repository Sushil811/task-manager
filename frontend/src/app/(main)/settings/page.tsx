"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, User, Bell, Shield, Palette, Loader2, Check } from "lucide-react";
import { AnimatedCard } from "@/components/ui/animated-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiFetch } from "@/lib/api";

type TabType = 'account' | 'appearance' | 'notifications' | 'privacy';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await apiFetch('/auth/me');
        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setEmail(data.email || "");
          setAvatar(data.avatar || "");
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await apiFetch('/auth/me', {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, avatar })
      });
      if (res.ok) {
        setMessage({ text: "Profile updated successfully!", type: 'success' });
      } else {
        const data = await res.json();
        setMessage({ text: data.msg || "Failed to update profile", type: 'error' });
      }
    } catch (error) {
      setMessage({ text: "An error occurred", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight flex items-center gap-3"
          >
            <div className="p-2 bg-muted text-foreground rounded-lg">
              <Settings className="w-6 h-6" />
            </div>
            Settings
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-2"
          >
            Manage your account preferences and application settings.
          </motion.p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-6">
          {activeTab === 'account' && (
            <AnimatedCard className="p-6">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 shadow-sm border border-border flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        name ? name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium bg-muted/50 hover:bg-muted px-3 py-1.5 rounded-md transition-colors cursor-pointer inline-block">
                        Change Avatar
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setAvatar(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                      />
                    </div>
                  </div>

                  {message && (
                    <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {message.type === 'success' && <Check className="w-4 h-4" />}
                      {message.text}
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </AnimatedCard>
          )}

          {activeTab === 'appearance' && (
            <AnimatedCard className="p-6">
              <h2 className="text-xl font-semibold mb-4">Appearance</h2>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                <div>
                  <h3 className="font-medium text-sm">Theme Preference</h3>
                  <p className="text-xs text-muted-foreground mt-1">Switch between Light, Dark, or System theme.</p>
                </div>
                <ThemeToggle />
              </div>
            </AnimatedCard>
          )}

          {(activeTab === 'notifications' || activeTab === 'privacy') && (
            <AnimatedCard className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === 'notifications' ? <Bell className="w-8 h-8 text-muted-foreground" /> : <Shield className="w-8 h-8 text-muted-foreground" />}
              </div>
              <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                These settings will be available in a future update. We&apos;re actively working on expanding this functionality.
              </p>
            </AnimatedCard>
          )}
        </div>
      </div>
    </div>
  );
}
