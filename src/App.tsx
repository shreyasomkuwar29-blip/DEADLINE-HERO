import React, { useState, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Sparkles, 
  X, 
  MessageSquare, 
  ChevronUp, 
  Zap, 
  Bot,
  Send,
  Check
} from "lucide-react";

import { Task, CalendarEvent, Message, AiInsight, Achievement, FocusRecord, UserProfile } from "./types";
import { sendMessageToAi, analyzeTasksWithAi } from "./utils/ai";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import DashboardView from "./components/DashboardView";
import TasksView from "./components/TasksView";
import HeroAiView from "./components/HeroAiView";
import CalendarView from "./components/CalendarView";
import InsightsView from "./components/InsightsView";
import FocusModeView from "./components/FocusModeView";
import ProfileView from "./components/ProfileView";
import SettingsView from "./components/SettingsView";
import HeroRescueModal from "./components/HeroRescueModal";
import WelcomeView from "./components/WelcomeView";
import MissionModal from "./components/MissionModal";

interface ThemeConfig {
  bg: string;
  card: string;
  cardHover: string;
  primary: string;
  accent: string;
  highlight: string;
  text: string;
  textSecondary: string;
  glow: string;
  border: string;
  sidebarBg: string;
  gradient: string;
  navbarBg: string;
  accentText: string;
  badge: string;
  floatChatBg: string;
}

const THEMES: Record<string, ThemeConfig> = {
  dark: {
    bg: "bg-[#0F1117]",
    card: "bg-[#181C25]",
    cardHover: "hover:bg-[#1f2430]",
    primary: "bg-[#6D5EF8]",
    accent: "bg-[#22D3EE]",
    highlight: "bg-[#F5B942]",
    text: "text-[#F8FAFC]",
    textSecondary: "text-[#94A3B8]",
    glow: "shadow-[#6D5EF8]/10",
    border: "border-white/5",
    sidebarBg: "bg-[#181C25]",
    gradient: "from-[#6D5EF8]/15 via-[#22D3EE]/5 to-transparent",
    navbarBg: "bg-[#181C25]/85",
    accentText: "text-[#22D3EE]",
    badge: "bg-[#22D3EE]/10 border-[#22D3EE]/20 text-[#22D3EE]",
    floatChatBg: "bg-[#0e111b]"
  },
  light: {
    bg: "bg-[#F4F6F9]",
    card: "bg-[#FFFFFF]",
    cardHover: "hover:bg-[#F8FAFC]",
    primary: "bg-[#6D5EF8]",
    accent: "bg-[#0891B2]",
    highlight: "bg-[#D97706]",
    text: "text-[#0F1117]",
    textSecondary: "text-[#64748B]",
    glow: "shadow-gray-200/50",
    border: "border-slate-200",
    sidebarBg: "bg-[#FFFFFF]",
    gradient: "from-[#6D5EF8]/10 via-[#0891B2]/5 to-transparent",
    navbarBg: "bg-[#FFFFFF]/85",
    accentText: "text-[#0891B2]",
    badge: "bg-[#0891B2]/10 border-[#0891B2]/20 text-[#0891B2]",
    floatChatBg: "bg-[#FFFFFF]"
  },
  purple: {
    bg: "bg-[#120D1E]",
    card: "bg-[#1B142C]",
    cardHover: "hover:bg-[#231b38]",
    primary: "bg-[#A855F7]",
    accent: "bg-[#F472B6]",
    highlight: "bg-[#FBBF24]",
    text: "text-[#FAF5FF]",
    textSecondary: "text-[#C084FC]",
    glow: "shadow-[#A855F7]/10",
    border: "border-purple-500/10",
    sidebarBg: "bg-[#1B142C]",
    gradient: "from-[#A855F7]/15 via-[#F472B6]/5 to-transparent",
    navbarBg: "bg-[#1B142C]/85",
    accentText: "text-[#F472B6]",
    badge: "bg-[#F472B6]/10 border-[#F472B6]/20 text-[#F472B6]",
    floatChatBg: "bg-[#1B142C]"
  },
  forest: {
    bg: "bg-[#091A13]",
    card: "bg-[#0E2A1E]",
    cardHover: "hover:bg-[#143d2c]",
    primary: "bg-[#10B981]",
    accent: "bg-[#34D399]",
    highlight: "bg-[#FBBF24]",
    text: "text-[#F0FDF4]",
    textSecondary: "text-[#86EFAC]",
    glow: "shadow-[#10B981]/10",
    border: "border-emerald-500/10",
    sidebarBg: "bg-[#0E2A1E]",
    gradient: "from-[#10B981]/15 via-[#34D399]/5 to-transparent",
    navbarBg: "bg-[#0E2A1E]/85",
    accentText: "text-[#34D399]",
    badge: "bg-[#34D399]/10 border-[#34D399]/20 text-[#34D399]",
    floatChatBg: "bg-[#0E2A1E]"
  },
  ocean: {
    bg: "bg-[#0A192F]",
    card: "bg-[#112240]",
    cardHover: "hover:bg-[#173059]",
    primary: "bg-[#00B4D8]",
    accent: "bg-[#4EA8DE]",
    highlight: "bg-[#FBBF24]",
    text: "text-[#F0F8FF]",
    textSecondary: "text-[#90E0EF]",
    glow: "shadow-[#00B4D8]/10",
    border: "border-blue-500/10",
    sidebarBg: "bg-[#112240]",
    gradient: "from-[#00B4D8]/15 via-[#4EA8DE]/5 to-transparent",
    navbarBg: "bg-[#112240]/85",
    accentText: "text-[#4EA8DE]",
    badge: "bg-[#4EA8DE]/10 border-[#4EA8DE]/20 text-[#4EA8DE]",
    floatChatBg: "bg-[#112240]"
  },
  sunset: {
    bg: "bg-[#1C0D0D]",
    card: "bg-[#2A1414]",
    cardHover: "hover:bg-[#381b1b]",
    primary: "bg-[#F97316]",
    accent: "bg-[#FACC15]",
    highlight: "bg-[#FB923C]",
    text: "text-[#FFF7ED]",
    textSecondary: "text-[#FDBA74]",
    glow: "shadow-[#F97316]/10",
    border: "border-orange-500/10",
    sidebarBg: "bg-[#2A1414]",
    gradient: "from-[#F97316]/15 via-[#FACC15]/5 to-transparent",
    navbarBg: "bg-[#2A1414]/85",
    accentText: "text-[#FACC15]",
    badge: "bg-[#FACC15]/10 border-[#FACC15]/20 text-[#FACC15]",
    floatChatBg: "bg-[#2A1414]"
  }
};

export default function App() {
  const [activePage, setActivePage] = useState<string>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [isRescueOpen, setIsRescueOpen] = useState<boolean>(false);
  
  const [activeTheme, setActiveTheme] = useState<string>(() => localStorage.getItem("deadline_hero_theme") || "dark");
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => localStorage.getItem("deadline_hero_onboarded") === "true");
  
  // Floating AI Assistant Widget state
  const [isFloatingOpen, setIsFloatingOpen] = useState<boolean>(false);
  const [floatInput, setFloatInput] = useState<string>("");
  const [floatHistory, setFloatHistory] = useState<Array<{sender: 'user' | 'hero', text: string}>>([]);

  // Seed tasks
  const defaultTasks: Task[] = [];

  // Seed calendar events
  const defaultEvents: CalendarEvent[] = [];

  // Seed achievements
  const defaultAchievements: Achievement[] = [
    { id: "a-1", title: "Deep Flow Pioneer", description: "Successfully complete your first 25-minute quiet Pomodoro focus sprint.", unlocked: false, icon: "Award" },
    { id: "a-2", title: "Deadline Crusher", description: "Clear a high-priority mission at least 24 hours ahead of schedule.", unlocked: false, icon: "Flame" },
    { id: "a-3", title: "Overdue Shield Active", description: "Maintain an overall Deadline Health score above 90% during an AI audit.", unlocked: false, icon: "ShieldCheck" }
  ];

  // Core States (loads from LocalStorage or defaults)
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("deadline_hero_tasks");
    return saved ? JSON.parse(saved) : defaultTasks;
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem("deadline_hero_events");
    return saved ? JSON.parse(saved) : defaultEvents;
  });

  const [focusRecords, setFocusRecords] = useState<FocusRecord[]>(() => {
    const saved = localStorage.getItem("deadline_hero_focus");
    return saved ? JSON.parse(saved) : [];
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem("deadline_hero_achievements");
    return saved ? JSON.parse(saved) : defaultAchievements;
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("deadline_hero_profile");
    return saved ? JSON.parse(saved) : {
      name: "Shreya",
      email: "shreyasomkuwar29@gmail.com",
      streakCount: 5,
      connectedGoogleCalendar: true,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
      preferences: {
        notifInterval: 30,
        focusTheme: "space",
        heroPersonality: "supportive"
      }
    };
  });

  const [chatMessages, setChatMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("deadline_hero_chat");
    return saved ? JSON.parse(saved) : [];
  });

  const [aiInsights, setAiInsights] = useState<AiInsight[]>(() => {
    const saved = localStorage.getItem("deadline_hero_insights");
    return saved ? JSON.parse(saved) : [
      {
        id: "in-1",
        title: "Urgent Milestones Overlay",
        type: "warning",
        content: "High priority exam prep deadline lands close to the Figma design sync meet on Tuesday. Clear work milestones early.",
        timestamp: new Date().toISOString()
      },
      {
        id: "in-2",
        title: "Peak Energy Slot",
        type: "tip",
        content: "You log the longest uninterrupted focus blocks between 6:00 PM and 8:00 PM. Reserve this slot for neural networks exam prep.",
        timestamp: new Date().toISOString()
      },
      {
        id: "in-3",
        title: "Streaks Milestones Praised",
        type: "praise",
        content: "Brilliant! You maintained a 5-day active execution streak. Your overall baseline focus hours increased by 14% this week.",
        timestamp: new Date().toISOString()
      }
    ];
  });

  const [healthScore, setHealthScore] = useState<number>(() => {
    const saved = localStorage.getItem("deadline_hero_health");
    return saved ? Number(saved) : 92;
  });

  const [activeFocusMission, setActiveFocusMission] = useState<Task | null>(null);

  // Mission Modal and Toast States
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [preselectedDate, setPreselectedDate] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Sync to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem("deadline_hero_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("deadline_hero_events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("deadline_hero_focus", JSON.stringify(focusRecords));
  }, [focusRecords]);

  useEffect(() => {
    localStorage.setItem("deadline_hero_achievements", JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem("deadline_hero_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("deadline_hero_chat", JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem("deadline_hero_insights", JSON.stringify(aiInsights));
  }, [aiInsights]);

  useEffect(() => {
    localStorage.setItem("deadline_hero_health", String(healthScore));
  }, [healthScore]);

  const getFloatingAiGreeting = (userName: string, tasksList: Task[]): string => {
    const hour = new Date().getHours();
    
    // 1. Check if all tasks are caught up (completed)
    const incompleteTasks = tasksList.filter(t => t.status !== "completed");
    if (incompleteTasks.length === 0) {
      return `🎉 You're all caught up, ${userName}! Enjoy your free time or create a new mission.`;
    }
    
    // 2. Check if a high-priority deadline is approaching (due within 36 hours)
    const highPriorityApproaching = incompleteTasks.find(t => {
      if (t.priority !== "high") return false;
      const deadlineTime = new Date(t.deadline).getTime();
      const nowTime = Date.now();
      const diffHours = (deadlineTime - nowTime) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 36;
    });
    
    if (highPriorityApproaching) {
      const titleClean = highPriorityApproaching.title.length > 35 
        ? highPriorityApproaching.title.slice(0, 32) + "..."
        : highPriorityApproaching.title;
      return `⚠️ ${userName}, your ${titleClean} is due tomorrow. Would you like me to create a rescue plan?`;
    }
    
    // 3. Time of day based greetings
    if (hour >= 5 && hour < 12) {
      return `☀️ Good Morning, ${userName}! Let's make today productive.`;
    } else if (hour >= 12 && hour < 17) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const todaysMissions = incompleteTasks.filter(t => t.deadline.startsWith(todayStr));
      if (todaysMissions.length > 0) {
        return `👋 Hi ${userName}! You have ${todaysMissions.length} ${todaysMissions.length === 1 ? 'mission' : 'missions'} planned today.`;
      }
      return `👋 Hi ${userName}! Ready to start a new mission?`;
    } else {
      return `🌙 Good Evening, ${userName}! Let's finish today's most important mission.`;
    }
  };

  useEffect(() => {
    if (profile?.name && floatHistory.length === 0) {
      setFloatHistory([
        { sender: "hero", text: getFloatingAiGreeting(profile.name, tasks) }
      ]);
    }
  }, [profile?.name, tasks, floatHistory.length]);

  // AI ACTIONS
  // 1. Audit tasks for updated risk assessment
  const handleAiHealthAudit = async () => {
    if (isAiAnalyzing) return;
    setIsAiAnalyzing(true);
    try {
      const result = await analyzeTasksWithAi(tasks);
      
      // Map recommendations and risks back to tasks
      setTasks(prev => prev.map(t => {
        const update = result.taskUpdates.find(u => u.id === t.id);
        if (update) {
          return {
            ...t,
            riskLevel: update.riskLevel,
            aiRecommendation: update.aiRecommendation
          };
        }
        return t;
      }));

      // Update Health score and Insights
      setHealthScore(result.deadlineHealthScore);
      setAiInsights(result.insights);

      // Trigger achievement unlock if health is > 90%
      if (result.deadlineHealthScore >= 90) {
        setAchievements(prev => prev.map(a => {
          if (a.id === "a-3" && !a.unlocked) {
            return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
          }
          return a;
        }));
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // 2. Chat messaging integration
  const handleSendMessageToAi = async (text: string) => {
    if (!text.trim() || isAiThinking) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsAiThinking(true);

    try {
      // Map history
      const history = chatMessages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const aiReply = await sendMessageToAi(text, history, tasks, profile.preferences.heroPersonality, profile.name);

      const heroMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "hero",
        text: aiReply,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, heroMsg]);

      // Unlock first chat achievement
      setAchievements(prev => prev.map(a => {
        if (a.id === "a-1" && !a.unlocked) {
          return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        return a;
      }));

    } catch (err) {
      console.error(err);
    } finally {
      setIsAiThinking(false);
    }
  };

  // 3. Floating Quick Chat handler
  const handleSendFloatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!floatInput.trim() || isAiThinking) return;

    const userText = floatInput;
    setFloatInput("");

    setFloatHistory(prev => [...prev, { sender: "user", text: userText }]);
    setIsAiThinking(true);

    try {
      const history = floatHistory.map(m => ({ sender: m.sender, text: m.text }));
      const aiReply = await sendMessageToAi(userText, history, tasks, profile.preferences.heroPersonality, profile.name);
      setFloatHistory(prev => [...prev, { sender: "hero", text: aiReply }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiThinking(false);
    }
  };

  // TASK OPERATIONS
  const handleAddTask = (newTask: Omit<Task, "id" | "createdAt" | "riskLevel" | "aiRecommendation" | "progress" | "status">) => {
    const task: Task = {
      ...newTask,
      id: `t-${Date.now()}`,
      createdAt: new Date().toISOString(),
      progress: 0,
      status: "todo",
      riskLevel: newTask.priority === "high" ? "high" : "low",
      aiRecommendation: "AI scheduled for auditing sync. Run Health Audit."
    };
    setTasks(prev => [task, ...prev]);

    // Also insert as a tentative event in calendar list
    const newEvent: CalendarEvent = {
      id: `e-${Date.now()}`,
      title: `${task.title} (Due)`,
      start: task.deadline,
      end: task.deadline,
      taskId: task.id,
      category: task.category
    };
    setEvents(prev => [...prev, newEvent]);

    // Automatically trigger health audit when task is added to keep state accurate!
    setTimeout(() => {
      handleAiHealthAudit();
    }, 1000);
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    let completedTrigger = false;
    setTasks(prev => {
      const original = prev.find(t => t.id === id);
      const isFinishing = original && original.status !== "completed" && updates.status === "completed";
      if (isFinishing) {
        completedTrigger = true;
      }

      const updatedList = prev.map(t => (t.id === id ? { ...t, ...updates } : t));
      const wasCompleted = updatedList.find(t => t.id === id)?.status === "completed" && prev.find(t => t.id === id)?.status !== "completed";
      
      if (wasCompleted) {
        // Check if there are any remaining incomplete tasks
        const remainingIncomplete = updatedList.filter(t => t.status !== "completed").length;
        if (remainingIncomplete === 0) {
          showToast(`Amazing work, ${profile.name}! 🎉 You completed every mission today. Take a break—you've earned it.`);
        } else {
          showToast(`🎉 Mission Accomplished, ${profile.name}! Excellent work! Deadline Health has improved.`);
        }

        // Unlock achievement for completing high priority
        const completedTask = prev.find(t => t.id === id);
        if (completedTask?.priority === "high") {
          setAchievements(prevAch => prevAch.map(a => {
            if (a.id === "a-2" && !a.unlocked) {
              return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
            }
            return a;
          }));
        }
      }
      return updatedList;
    });

    if (completedTrigger) {
      setFloatHistory(prevFloat => [
        ...prevFloat,
        { sender: "hero", text: `🎉 Great job, ${profile.name}! You're making excellent progress.` }
      ]);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setEvents(prev => prev.filter(e => e.taskId !== id));
    showToast("I've removed that mission for you. Keep up the great work!");
  };

  const handleOpenMissionModal = (dateStr?: string | null, taskToEdit?: Task | null) => {
    setEditingTask(taskToEdit || null);
    setPreselectedDate(dateStr || null);
    setIsMissionModalOpen(true);
  };

  const handleSaveMission = (taskData: {
    title: string;
    description: string;
    category: 'work' | 'personal' | 'academic' | 'finance' | 'other';
    priority: 'high' | 'medium' | 'low';
    estTime: number;
    deadline: string;
  }) => {
    if (editingTask) {
      // Editing existing task
      handleUpdateTask(editingTask.id, taskData);
      showToast("Your mission is updated and ready! 🎉");
    } else {
      // Adding new task
      handleAddTask(taskData);
      showToast("Your mission is ready! 🎉");
    }
    setIsMissionModalOpen(false);
    setEditingTask(null);
    setPreselectedDate(null);
  };

  // FOCUS SESSIONS
  const handleLogFocusSession = (taskId: string | undefined, duration: number) => {
    const newRecord: FocusRecord = {
      id: `rec-${Date.now()}`,
      taskId,
      duration,
      timestamp: new Date().toISOString(),
      completed: true
    };
    setFocusRecords(prev => [newRecord, ...prev]);

    // Update target progress if selected task
    if (taskId) {
      const targetTask = tasks.find(t => t.id === taskId);
      if (targetTask) {
        const nextProgress = Math.min(100, targetTask.progress + 30); // Increment progress on focus blocks
        handleUpdateTask(taskId, { 
          progress: nextProgress,
          status: nextProgress === 100 ? "completed" : "in_progress"
        });
      }
    }

    // Dynamic streaks increments
    setProfile(prev => {
      const nextStreak = prev.streakCount + 1;
      showToast(`🎉 Awesome, ${prev.name}! Your productivity streak is now ${nextStreak} days! Keep it going!`);
      return {
        ...prev,
        streakCount: nextStreak
      };
    });
  };

  const handleLogOut = () => {
    localStorage.removeItem("deadline_hero_onboarded");
    localStorage.removeItem("deadline_hero_profile");
    setHasOnboarded(false);
    setActivePage("dashboard");
    showToast("Logged out successfully! See you again soon.");
  };

  // Nav page router helper
  const renderActiveView = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <DashboardView 
            tasks={tasks}
            profile={profile}
            insights={aiInsights}
            healthScore={healthScore}
            isAiAnalyzing={isAiAnalyzing}
            onAiSync={handleAiHealthAudit}
            onNavigateToPage={setActivePage}
            onSelectHeroMission={setActiveFocusMission}
            onOpenRescueModal={() => setIsRescueOpen(true)}
            onOpenMissionModal={handleOpenMissionModal}
            onAddEvent={(e) => {
              setEvents(prev => [...prev, { ...e, id: `e-${Date.now()}` }]);
            }}
          />
        );
      case "tasks":
        return (
          <TasksView 
            tasks={tasks}
            profile={profile}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onNavigateToPage={setActivePage}
            onSelectHeroMission={setActiveFocusMission}
            onOpenMissionModal={handleOpenMissionModal}
          />
        );
      case "hero-ai":
        return (
          <HeroAiView 
            messages={chatMessages}
            onSendMessage={handleSendMessageToAi}
            tasks={tasks}
            profile={profile}
            isAiThinking={isAiThinking}
            onSetAiPersonality={(p) => {
              setProfile(prev => ({
                ...prev,
                preferences: { ...prev.preferences, heroPersonality: p }
              }));
            }}
            onOpenMissionModal={handleOpenMissionModal}
          />
        );
      case "calendar":
        return (
          <CalendarView 
            tasks={tasks}
            events={events}
            profile={profile}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onOpenMissionModal={handleOpenMissionModal}
            activeTheme={activeTheme}
          />
        );
      case "insights":
        return (
          <InsightsView 
            tasks={tasks}
            focusRecords={focusRecords}
            healthScore={healthScore}
          />
        );
      case "focus":
        return (
          <FocusModeView 
            tasks={tasks}
            activeMission={activeFocusMission}
            profile={profile}
            onLogFocusSession={handleLogFocusSession}
          />
        );
      case "profile":
        return (
          <ProfileView 
            profile={profile}
            onUpdateProfile={(updates) => {
              setProfile(prev => ({ ...prev, ...updates }));
            }}
            achievements={achievements}
            tasks={tasks}
          />
        );
      case "settings":
        return (
          <SettingsView 
            profile={profile}
            onUpdateProfile={(updates) => {
              setProfile(prev => ({ ...prev, ...updates }));
            }}
            activeTheme={activeTheme}
            onChangeTheme={setActiveTheme}
            onAiSync={handleAiHealthAudit}
          />
        );
      default:
        return <div className="text-white">View not found</div>;
    }
  };

  if (!hasOnboarded) {
    return (
      <WelcomeView 
        onCompleteOnboarding={(name) => {
          setProfile(prev => ({ 
            ...prev, 
            name,
            avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80` 
          }));
          setHasOnboarded(true);
          localStorage.setItem("deadline_hero_onboarded", "true");
        }}
      />
    );
  }

  const themeConfig = THEMES[activeTheme] || THEMES.dark;

  return (
    <div className={`flex ${themeConfig.bg} ${themeConfig.text} font-sans min-h-screen relative overflow-x-hidden`}>
      
      {/* GLOWING AMBIENT GRAPHICS BACKGROUND */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-200px] left-[10%] w-[500px] h-[500px] bg-[#6D5EF8]/6 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-100px] right-[15%] w-[450px] h-[450px] bg-[#22D3EE]/4 rounded-full blur-[140px]" />
      </div>

      {/* Responsive Left Sidebar Drawer layout */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        activeTheme={activeTheme}
      />

      {/* Main Viewport panel */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        
        <Navbar 
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onQuickAddTask={() => {
            setActivePage("tasks");
          }}
          profile={profile}
          healthScore={healthScore}
          isAiAnalyzing={isAiAnalyzing}
          onAiSync={handleAiHealthAudit}
          activeTheme={activeTheme}
          onNavigateToPage={setActivePage}
          onLogOut={handleLogOut}
        />

        {/* Core Main content view wrapper */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="h-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* FLOATING AI ASSISTANT WIDGET */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        
        {/* Expanded Floating Chat Panel */}
        <AnimatePresence>
          {isFloatingOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 25, scale: 0.92 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-80 md:w-96 bg-[#0e111b] border border-[#6D5EF8]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[400px]"
            >
              {/* Widget Header */}
              <div className="p-4 bg-gradient-to-r from-[#6D5EF8]/20 to-[#22D3EE]/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#6D5EF8] to-[#22D3EE] flex items-center justify-center shadow-md">
                    <Bot className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Hero Companion</span>
                    <span className="text-[9px] font-mono text-[#22D3EE] uppercase tracking-wider block">Real-time sync</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsFloatingOpen(false)}
                  className="p-1 hover:bg-[#050608]/50 rounded-lg text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Widget Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar">
                {floatHistory.map((m, idx) => (
                  <div key={idx} className={`flex items-start gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center shrink-0 border text-[10px] ${
                      m.sender === "hero" ? "bg-[#6D5EF8]/10 border-[#6D5EF8]/30 text-[#22D3EE]" : "bg-[#0e111b] border-white/5 text-white"
                    }`}>
                      {m.sender === "hero" ? <Bot className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 opacity-0" />}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl p-3 text-[11px] leading-relaxed font-medium ${
                      m.sender === "hero" ? "bg-[#050608] border border-white/5 text-[#94A3B8]" : "bg-[#6D5EF8] text-white"
                    }`}>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                ))}
                
                {isAiThinking && (
                  <div className="flex items-start gap-2.5 animate-pulse">
                    <div className="w-6.5 h-6.5 rounded-lg bg-[#6D5EF8]/10 border border-[#6D5EF8]/30 flex items-center justify-center shrink-0 text-[#22D3EE]">
                      <Bot className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <div className="bg-[#050608] border border-white/5 rounded-2xl p-3 text-[10px] text-[#94A3B8] font-mono">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>

              {/* Widget Input row */}
              <form onSubmit={handleSendFloatMessage} className="p-3 border-t border-white/5 bg-[#050608]/30 flex gap-2">
                <input
                  type="text"
                  value={floatInput}
                  onChange={(e) => setFloatInput(e.target.value)}
                  placeholder="Ask floating companion..."
                  className="flex-1 bg-[#050608] border border-white/5 focus:border-[#6D5EF8]/50 focus:outline-none rounded-xl px-3 py-2 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/30"
                />
                <button
                  type="submit"
                  disabled={!floatInput.trim() || isAiThinking}
                  className="bg-[#6D5EF8] hover:bg-[#6D5EF8]/90 text-white px-3 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glowing Orb Trigger Button */}
        <button
          onClick={() => setIsFloatingOpen(!isFloatingOpen)}
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6D5EF8] via-[#22D3EE] to-[#F5B942] hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-xl shadow-[#6D5EF8]/20 cursor-pointer border border-white/10 group relative"
          title="Open AI Companion"
        >
          {/* Internal rotating core overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#F5B942] to-[#6D5EF8] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
          <MessageSquare className="w-5.5 h-5.5 text-white z-10 transition-transform group-hover:rotate-12" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#22D3EE] rounded-full flex items-center justify-center text-[8px] font-bold text-black z-10 animate-bounce glow-accent">
            AI
          </span>
        </button>

      </div>

      {/* CINEMATIC HERO RESCUE MODE OVERLAY */}
      <HeroRescueModal
        isOpen={isRescueOpen}
        onClose={() => setIsRescueOpen(false)}
        tasks={tasks}
        onAddEvent={(e) => {
          setEvents(prev => [...prev, { ...e, id: `e-${Date.now()}` }]);
        }}
        onNavigateToPage={setActivePage}
        onSelectHeroMission={setActiveFocusMission}
      />

      {/* GLOBAL MISSION MODAL POPUP */}
      <MissionModal
        isOpen={isMissionModalOpen}
        onClose={() => {
          setIsMissionModalOpen(false);
          setEditingTask(null);
          setPreselectedDate(null);
        }}
        onSave={handleSaveMission}
        task={editingTask}
        preselectedDate={preselectedDate}
        activeTheme={activeTheme}
      />

      {/* FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-[#120D1E] border border-purple-500/20 rounded-2xl p-4 shadow-2xl flex items-center gap-3.5 max-w-sm"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] text-[#22D3EE] font-mono uppercase tracking-widest leading-none font-bold">Tactical Update</p>
              <p className="text-xs text-white font-bold mt-1.5 leading-normal">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
