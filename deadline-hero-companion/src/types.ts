export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'work' | 'personal' | 'academic' | 'finance' | 'other';
  priority: 'high' | 'medium' | 'low';
  estTime: number; // in minutes
  deadline: string; // ISO-8601 or YYYY-MM-DD string
  progress: number; // 0 - 100
  status: 'todo' | 'in_progress' | 'completed';
  riskLevel: 'high' | 'medium' | 'low';
  aiRecommendation: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // YYYY-MM-DDTHH:mm:ss
  end: string;
  taskId?: string;
  category: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'hero';
  text: string;
  timestamp: string; // ISO string
}

export interface AiInsight {
  id: string;
  title: string;
  type: 'warning' | 'tip' | 'praise';
  content: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
}

export interface FocusRecord {
  id: string;
  taskId?: string;
  duration: number; // in minutes
  timestamp: string;
  completed: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  streakCount: number;
  connectedGoogleCalendar: boolean;
  avatar: string;
  preferences: {
    notifInterval: number;
    focusTheme: 'space' | 'ocean' | 'forest' | 'zen';
    heroPersonality: 'supportive' | 'tough_love' | 'strategist';
  };
}
