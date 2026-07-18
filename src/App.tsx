import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { UploadView } from './components/UploadView';
import { CoursePlayer } from './components/CoursePlayer';
import { Certificates } from './components/Certificates';
import { Course, UserStats, Certificate } from './types';
import { Brain, Zap, Flame, Trophy, Award, User, RefreshCw, Sparkles, Star } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'upload' | 'certificates' | 'player'>('dashboard');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>({
    learningHours: 0,
    learningStreak: 0,
    xpPoints: 0,
    completedLessons: [],
    completedCourses: [],
    quizScores: {},
    badges: [],
    recentActivity: []
  });
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  
  // App-level loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Graduation name dialog modal
  const [showGraduationModal, setShowGraduationModal] = useState(false);
  const [graduationCourseId, setGraduationCourseId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('Alexander Mercer');

  // Load stats, courses, and certificates on mount
  useEffect(() => {
    const loadAppData = async () => {
      try {
        setLoading(true);
        // Load Stats
        const statsRes = await fetch('/api/stats');
        if (!statsRes.ok) throw new Error('Could not connect to database.');
        const statsData = await statsRes.json();
        setStats(statsData);

        // Load Courses
        const coursesRes = await fetch('/api/courses');
        if (!coursesRes.ok) throw new Error('Could not retrieve courses.');
        const coursesData = await coursesRes.json();
        setCourses(coursesData);

        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error initializing application endpoints.');
      } finally {
        setLoading(false);
      }
    };

    loadAppData();
  }, []);

  // Update Stats in memory
  const updateStatsLocal = (newStats: UserStats) => {
    setStats(newStats);
  };

  // Complete a lesson handler
  const handleCompleteLesson = async (courseId: string, lessonId: string) => {
    try {
      const response = await fetch('/api/progress/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonId })
      });

      if (!response.ok) throw new Error('Failed to save completion progress.');
      const data = await response.json();
      updateStatsLocal(data.stats);

      // Re-fetch courses in background to update progress ratios
      const coursesRes = await fetch('/api/courses');
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
    }
  };

  // Submit quiz handler
  const handleSubmitQuizScore = async (courseId: string, quizId: string, score: number) => {
    try {
      const response = await fetch('/api/progress/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, quizId, score })
      });

      if (!response.ok) throw new Error('Failed to record assessment score.');
      const data = await response.json();
      updateStatsLocal(data.stats);
    } catch (err) {
      console.error('Error submitting quiz score:', err);
    }
  };

  // Newly generated course select handler
  const handleCourseGenerated = (newCourse: Course) => {
    setCourses(prev => [...prev, newCourse]);
    setSelectedCourseId(newCourse.id);
    setCurrentView('player');
  };

  // Selection handler from dashboard list
  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentView('player');
  };

  // Graduation certificate compilation trigger
  const handleTriggerGraduation = (courseId: string) => {
    setGraduationCourseId(courseId);
    setShowGraduationModal(true);
  };

  const handleClaimCertificateSubmit = async () => {
    if (!graduationCourseId) return;

    try {
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: graduationCourseId,
          userName: studentName
        })
      });

      if (!response.ok) throw new Error('Could not compile certificate credentials.');
      const certificate = await response.json();
      
      setCertificates(prev => [...prev, certificate]);
      setShowGraduationModal(false);
      setGraduationCourseId(null);
      setCurrentView('certificates');
    } catch (err) {
      console.error('Certification failed:', err);
      alert('Certification failed. Please retry shortly.');
    }
  };

  // Get selected course object
  const activeCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="min-h-screen flex flex-col bg-[#111113] text-[#F8F7F4] font-sans selection:bg-[#FFD700] selection:text-[#111113]">
      {/* 1. Global Navigation Header */}
      <header className="bg-[#111113] sticky top-0 z-50 px-6 py-5 flex items-center justify-between border-b-2 border-[#F8F7F4] max-w-[1400px] mx-auto w-full shrink-0">
        <div 
          onClick={() => { setCurrentView('dashboard'); setSelectedCourseId(null); }} 
          className="flex flex-col cursor-pointer group select-none"
        >
          <h1 className="font-display font-extrabold text-[#F8F7F4] text-2xl tracking-tighter leading-none group-hover:text-amber-400 transition-colors uppercase">
            E-Course AI
          </h1>
          <span className="text-[9px] font-mono text-[#F8F7F4]/60 tracking-widest mt-1.5 block uppercase">
            Enterprise Platform // v.2.4.0
          </span>
        </div>

        {/* Dynamic header metrics */}
        <div className="flex items-center gap-4">
          {/* XP Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-[#F8F7F4]/20 text-[#FFD700] font-mono text-xs font-bold bg-white/5">
            <span>[XP: {stats.xpPoints}]</span>
          </div>

          {/* Streak Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-[#F8F7F4]/20 text-[#F8F7F4] font-mono text-xs font-bold bg-white/5">
            <span>[STREAK: {stats.learningStreak} DAYS]</span>
          </div>

          {/* Profile pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 border border-[#F8F7F4] text-xs text-[#F8F7F4] font-bold font-mono bg-white/5">
            <span>[STUDENT]</span>
          </div>
        </div>
      </header>

      {/* 2. Main Content viewport switcher */}
      <main className="flex-1 overflow-y-auto w-full max-w-[1400px] mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-[#FFD700] rounded-full animate-spin" />
            </div>
            <h3 className="font-display font-bold text-[#F8F7F4] text-lg uppercase">Loading Platform Workspace</h3>
            <p className="text-xs text-[#F8F7F4]/50 mt-1 italic font-mono">Initializing file trees and compiling state charts...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto my-16 bg-[#18181b] border border-red-500/40 p-8 text-center shadow-xl">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <Sparkles className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-display font-bold text-[#F8F7F4] uppercase">Database Link Inconsistent</h3>
            <p className="text-xs text-red-400 mt-2 leading-relaxed font-mono">{error}</p>
            <button 
              id="btn-retry-app"
              onClick={() => window.location.reload()}
              className="mt-6 px-5 py-2.5 bg-none border border-[#F8F7F4] text-xs font-mono font-bold text-[#F8F7F4] hover:bg-white hover:text-[#111113] transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
              Reload application
            </button>
          </div>
        ) : (
          <div className="w-full h-full animate-fade-in">
            {currentView === 'dashboard' && (
              <Dashboard 
                stats={stats}
                courses={courses}
                onSelectCourse={handleSelectCourse}
                onNavigateToUpload={() => setCurrentView('upload')}
                onNavigateToCertificates={() => setCurrentView('certificates')}
              />
            )}

            {currentView === 'upload' && (
              <UploadView 
                onCourseGenerated={handleCourseGenerated}
                onNavigateBack={() => setCurrentView('dashboard')}
              />
            )}

            {currentView === 'player' && activeCourse && (
              <CoursePlayer 
                course={activeCourse}
                completedLessons={stats.completedLessons}
                quizScores={stats.quizScores}
                onCompleteLesson={handleCompleteLesson}
                onSubmitQuizScore={handleSubmitQuizScore}
                onNavigateBack={() => { setCurrentView('dashboard'); setSelectedCourseId(null); }}
                onGraduated={handleTriggerGraduation}
              />
            )}

            {currentView === 'certificates' && (
              <Certificates 
                certificates={certificates}
                onNavigateBack={() => setCurrentView('dashboard')}
              />
            )}
          </div>
        )}
      </main>

      {/* 3. Graduation Certificate Name dialog Modal */}
      {showGraduationModal && (
        <div className="fixed inset-0 bg-[#111113]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] p-8 max-w-md w-full border border-[#F8F7F4] shadow-2xl">
            <div className="flex items-center gap-2 mb-4 border-b border-[#F8F7F4]/20 pb-2">
              <Trophy className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#FFD700]">CLAIM GRADUATION CERTIFICATE</span>
            </div>
            
            <h3 className="text-xl font-display font-bold text-[#F8F7F4] tracking-tight uppercase">Enter Your Name</h3>
            <p className="text-xs text-[#F8F7F4]/60 mt-2 font-mono">Provide your full legal name to generate the verified completion credential.</p>
            
            <div className="mt-6 space-y-4 font-mono">
              <div>
                <label className="block text-[10px] font-bold text-[#F8F7F4]/60 uppercase">Student Legal Name</label>
                <input 
                  id="input-student-name"
                  type="text" 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-[#111113] border border-[#F8F7F4]/20 text-sm text-[#F8F7F4] py-3 px-4 focus:border-amber-400 focus:outline-none mt-2 font-bold uppercase"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  id="btn-close-grad-modal"
                  onClick={() => { setShowGraduationModal(false); setGraduationCourseId(null); }}
                  className="flex-1 py-3 text-xs font-bold text-[#F8F7F4] transition border border-[#F8F7F4]/40 hover:border-[#F8F7F4] uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-claim-cert"
                  onClick={handleClaimCertificateSubmit}
                  className="flex-1 py-3 text-xs font-bold bg-[#FFD700] text-[#111113] border border-[#FFD700] hover:bg-amber-400 transition uppercase flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Issue Certificate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
