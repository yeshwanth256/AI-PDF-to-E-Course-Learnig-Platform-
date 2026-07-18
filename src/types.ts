export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number; // 0-based index of correct option
  explanation: string;
  hint: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  // Spaced repetition properties (SM-2)
  difficulty?: 'easy' | 'medium' | 'hard';
  interval?: number; // Days
  easeFactor?: number;
  repetitions?: number;
  nextReviewDate?: string; // ISO string
}

export interface MindMapNode {
  id: string;
  label: string;
  type: 'course' | 'chapter' | 'lesson' | 'concept';
}

export interface MindMapEdge {
  from: string;
  to: string;
}

export interface MindMapData {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

export interface Lesson {
  id: string;
  title: string;
  readingTime: string;
  content?: string; // Markdown formatted lesson content
  exercises?: string[];
  isCompleted?: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  quizzes: QuizQuestion[];
  flashcards: Flashcard[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  learningObjectives: string[];
  prerequisites: string[];
  skillsLearned: string[];
  tags: string[];
  categories: string[];
  mindMap: MindMapData;
  chapters: Chapter[];
  pdfUrl?: string; // Stored path or original file name
  pdfName?: string;
  pdfBase64?: string; // Store base64 data directly for RAG chat!
  createdAt: string;
}

export interface UserStats {
  learningHours: number;
  learningStreak: number;
  xpPoints: number;
  completedLessons: string[]; // List of lesson IDs
  completedCourses: string[]; // List of course IDs
  quizScores: { [quizId: string]: number }; // Score percentage out of 100
  badges: string[]; // Earned badges
  recentActivity: {
    id: string;
    type: 'lesson_complete' | 'quiz_complete' | 'course_start' | 'chat_message' | 'flashcard_review';
    title: string;
    timestamp: string;
    xp: number;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  citations?: {
    text: string;
    pageNumber?: number;
    referenceName?: string;
  }[];
}

export interface ChatHistory {
  id: string;
  courseId: string;
  messages: ChatMessage[];
}

export interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  userName: string;
  completionDate: string;
  verificationLink: string;
}
