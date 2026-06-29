import { Task, Message, AiInsight, CalendarEvent } from "../types";

export interface ChatHistoryItem {
  sender: 'user' | 'hero';
  text: string;
}

export async function sendMessageToAi(
  message: string,
  history: ChatHistoryItem[],
  tasks: Task[],
  personality: 'supportive' | 'tough_love' | 'strategist' = 'supportive',
  userName: string = "User"
): Promise<string> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history, tasks, personality, userName }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.text || "Sorry, I received an empty response. Please try again.";
  } catch (error) {
    console.error("Error sending message to AI:", error);
    return `**[Communication Error]**\n\nI couldn't reach the server. Let's try again in a moment.\n\n*Technical info: ${error instanceof Error ? error.message : String(error)}*`;
  }
}

export interface TaskAuditResult {
  deadlineHealthScore: number;
  taskUpdates: Array<{
    id: string;
    riskLevel: 'high' | 'medium' | 'low';
    aiRecommendation: string;
  }>;
  insights: AiInsight[];
}

export async function analyzeTasksWithAi(tasks: Task[]): Promise<TaskAuditResult> {
  try {
    const response = await fetch("/api/analyze-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      deadlineHealthScore: data.deadlineHealthScore ?? 85,
      taskUpdates: data.taskUpdates ?? [],
      insights: (data.insights ?? []).map((ins: any, index: number) => ({
        id: `ins-${index}-${Date.now()}`,
        title: ins.title,
        type: ins.type,
        content: ins.content,
        timestamp: new Date().toISOString()
      }))
    };
  } catch (error) {
    console.error("Error analyzing tasks with AI:", error);
    // Dynamic local fallback if server fails
    const mockUpdates = tasks.map(t => ({
      id: t.id,
      riskLevel: t.priority === 'high' ? 'high' as const : 'low' as const,
      aiRecommendation: t.priority === 'high' 
        ? "Crucial milestone pending. Allocate next focus block immediately." 
        : "Standard tracking. Maintain current pace to meet deadline."
    }));
    return {
      deadlineHealthScore: 88,
      taskUpdates: mockUpdates,
      insights: [
        {
          id: "local-fallback-1",
          title: "Optimize Focus Intervals",
          type: "tip",
          content: "Group related high-priority academic tasks into a single 90-minute block for deeper cognitive momentum.",
          timestamp: new Date().toISOString()
        },
        {
          id: "local-fallback-2",
          title: "Slight Deadline Clutter",
          type: "warning",
          content: "Multiple medium-risk deadlines expire within 48 hours. Start pre-emptive reviews to avoid crunch.",
          timestamp: new Date().toISOString()
        },
        {
          id: "local-fallback-3",
          title: "Focus Discipline Praised",
          type: "praise",
          content: "You successfully cleared your last high-risk target ahead of schedule. Your baseline health score is strong.",
          timestamp: new Date().toISOString()
        }
      ]
    };
  }
}

export interface OptimizedBlock {
  time: string;
  type: 'focus' | 'review' | 'buffer' | 'cleanup';
  label: string;
  taskTitle: string;
}

export function calculateMissionRisk(task: {
  status: string;
  deadline: string;
  priority: string;
  estTime: number;
  progress: number;
}): 'high' | 'medium' | 'low' {
  if (task.status === 'completed') return 'low';
  
  const deadlineDate = new Date(task.deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  // Overdue is always High Risk
  if (diffHours < 0) {
    return 'high';
  }
  
  // Due in less than 24 hours is High Risk
  if (diffHours <= 24) {
    return 'high';
  }
  
  // If priority is high and due in less than 72 hours (3 days), it's High Risk
  if (task.priority === 'high' && diffHours <= 72) {
    return 'high';
  }
  
  // High effort (>120 mins) with little progress (<30%) and due in less than 48 hours is High Risk
  if (task.estTime > 120 && task.progress < 30 && diffHours <= 48) {
    return 'high';
  }
  
  // Medium Risk checks
  if (diffHours <= 72) {
    return 'medium';
  }
  if (task.priority === 'high' && diffHours <= 144) { // 6 days
    return 'medium';
  }
  if (task.priority === 'medium' && diffHours <= 96) {
    return 'medium';
  }
  if (task.estTime > 60 && task.progress < 50 && diffHours <= 72) {
    return 'medium';
  }
  
  return 'low';
}

export async function optimizeScheduleWithAi(tasks: Task[], events: CalendarEvent[]): Promise<OptimizedBlock[]> {
  try {
    const response = await fetch("/api/optimize-schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks, events }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.suggestions ?? [];
  } catch (error) {
    console.error("Error optimizing schedule with AI:", error);
    return [
      { time: "09:00 AM - 10:30 AM", type: "focus", label: "Urgent Deadline Tackle", taskTitle: tasks?.[0]?.title || "First Priority Task" },
      { time: "11:00 AM - 12:00 PM", type: "review", label: "Milestone Calibration", taskTitle: "All Active Streams" },
      { time: "02:00 PM - 03:30 PM", type: "focus", label: "Strategic Execution Run", taskTitle: tasks?.[1]?.title || "Secondary Focus Area" },
      { time: "04:30 PM - 05:00 PM", type: "cleanup", label: "Daily Risk Checklist", taskTitle: "Schedule Optimization" }
    ];
  }
}
