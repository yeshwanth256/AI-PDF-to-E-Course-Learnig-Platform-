import React, { useState } from 'react';
import { Course, UserStats } from '../types';
import { 
  BookOpen, Award, Flame, Zap, Trophy, History, ArrowRight, BookMarked, 
  BrainCircuit, Briefcase, ChevronRight, BarChart3, Users, Compass, 
  Sliders, Terminal, FileCheck, CheckCircle2, ShieldCheck, Heart, Sparkles, 
  TrendingUp, Activity, RefreshCw, FileText, Code2
} from 'lucide-react';
import { exportCourseOutlinePDF } from '../lib/pdfExport';
import { CodingGames } from './CodingGames';
import { CareerPath } from './CareerPath';
import { LearningGoalWidget } from './LearningGoalWidget';
import { ChallengeHub } from './ChallengeHub';
import { DsaArena } from './DsaArena';

interface DashboardProps {
  stats: UserStats;
  courses: Course[];
  token: string | null;
  onUpdateStats: (newStats: UserStats) => void;
  onSelectCourse: (courseId: string) => void;
  onNavigateToUpload: () => void;
  onNavigateToCertificates: () => void;
}

type DashboardTab = 'overview' | 'skill_tree' | 'career' | 'instructor' | 'coding_games' | 'dsa_playground';

export function Dashboard({ stats, courses, token, onUpdateStats, onSelectCourse, onNavigateToUpload, onNavigateToCertificates }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [careerSubTab, setCareerSubTab] = useState<'map' | 'resume'>('map');

  const dynamicCategories = React.useMemo(() => {
    const cats = new Set<string>();
    courses.forEach(course => {
      if (course.categories && Array.isArray(course.categories)) {
        course.categories.forEach(c => cats.add(c));
      } else if (course.tags && Array.isArray(course.tags)) {
        course.tags.forEach(t => cats.add(t));
      }
    });
    return ['All', ...Array.from(cats)];
  }, [courses]);

  const filteredCourses = React.useMemo(() => {
    if (selectedCategory === 'All') return courses;
    return courses.filter(course => {
      const cats = course.categories || course.tags || [];
      return cats.some(c => c.toLowerCase() === selectedCategory.toLowerCase());
    });
  }, [courses, selectedCategory]);
  
  // States for Resume Coach
  const [resumeText, setResumeText] = useState('');
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [resumeAnalysisResult, setResumeAnalysisResult] = useState<any | null>(null);

  // States for Instructor settings
  const [selectedTopicAnalysis, setSelectedTopicAnalysis] = useState('Supervised Learning');

  const triggerAnalyzeResume = () => {
    if (!resumeText.trim()) return;
    setAnalyzingResume(true);
    setTimeout(() => {
      setResumeAnalysisResult({
        score: 84,
        strengths: ["Strong technical vocabulary", "Clear action verbs", "Solid education background"],
        weaknesses: ["Lacks quantitative metrics for cloud systems", "Needs clearer definition of RAG pipelines", "No specific certifications listed"],
        recommendations: [
          "Add: 'Reduced query latency by 35% through cross-encoder reranking index'.",
          "Include a section for Google Cloud or AWS certifications.",
          "Link to a portfolio showcase displaying generated LLM pipelines."
        ]
      });
      setAnalyzingResume(false);
    }, 1200);
  };

  const renderOverview = () => {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Activity Statistics Gauge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metric Card 1: Experience & Level */}
          <div className="glass-panel p-6 relative overflow-hidden group hover:border-[#FFD700]/30 transition-all duration-300">
            <div className="relative z-10 font-mono">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Level Progress</p>
              <h3 className="text-4xl font-display font-extrabold mt-2 text-[#F8F7F4]">Lvl {Math.floor(stats.xpPoints / 100) + 1}</h3>
              <p className="text-xs text-[#F8F7F4]/60 mt-1 font-mono">{stats.xpPoints} / {Math.floor(stats.xpPoints / 100) * 100 + 100} XP</p>
            </div>
            <div className="w-full h-1.5 bg-white/10 mt-6 overflow-hidden">
              <div 
                className="h-full bg-[#FFD700] transition-all duration-500" 
                style={{ width: `${Math.min(((stats.xpPoints % 100) / 100) * 100, 100)}%` }} 
              />
            </div>
          </div>

          {/* Metric Card 2: Streak */}
          <div className="glass-panel p-6 relative overflow-hidden group hover:border-[#FFD700]/30 transition-all duration-300 font-mono">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Current Streak</p>
              <h3 className="text-4xl font-display font-extrabold mt-2 text-[#F8F7F4]">{String(stats.learningStreak).padStart(2, '0')} Days</h3>
              <p className="text-xs text-[#F8F7F4]/60 mt-1 uppercase tracking-widest">Days Active</p>
            </div>
            <div className="flex gap-1.5 mt-5">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                const active = idx < stats.learningStreak;
                return (
                  <div key={idx} className="flex-1 text-center">
                    <div className={`h-6 text-[10px] font-bold flex items-center justify-center border transition-all ${
                      active 
                        ? 'bg-amber-400/20 border-amber-400 text-[#FFD700]' 
                        : 'bg-white/5 border-white/10 text-[#F8F7F4]/30'
                    }`}>
                      {day}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metric Card 3: Study Hours */}
          <div className="glass-panel p-6 relative overflow-hidden group hover:border-[#FFD700]/30 transition-all duration-300 font-mono">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Study Time</p>
              <h3 className="text-4xl font-display font-extrabold mt-2 text-[#F8F7F4]">{String(stats.learningHours).padStart(2, '0')} Hrs</h3>
              <p className="text-xs text-[#F8F7F4]/60 mt-1">Total interactive hours</p>
            </div>
            <div className="space-y-1.5 mt-6">
              <div className="flex justify-between text-[10px] text-[#F8F7F4]/50">
                <span>Weekly Goal Progress</span>
                <span>{Math.round((stats.learningHours / 10) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 overflow-hidden">
                <div className="h-full bg-[#FFD700] transition-all duration-500" style={{ width: `${Math.min((stats.learningHours / 10) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Courses, Right Activity / Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Course Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono">
              <h2 className="text-sm font-bold text-[#F8F7F4] flex items-center gap-2 uppercase tracking-widest">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Active Knowledge Bases
              </h2>
              <span className="text-[9px] bg-white/5 text-[#F8F7F4] border border-[#F8F7F4]/15 px-2 py-0.5 font-bold">
                [{courses.length} COMPILED]
              </span>
            </div>

            {/* Category Filter Tabs */}
            {courses.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2 font-mono">
                {dynamicCategories.map((category) => {
                  const isActive = selectedCategory === category;
                  const count = category === 'All' 
                    ? courses.length 
                    : courses.filter(c => {
                        const cats = c.categories || c.tags || [];
                        return cats.some(cat => cat.toLowerCase() === category.toLowerCase());
                      }).length;

                  return (
                    <button
                      key={category}
                      id={`tab-category-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 border text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer rounded-sm flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-amber-400/10 border-amber-400 text-amber-400'
                          : 'border-white/10 hover:border-white/30 text-[#F8F7F4]/60 hover:text-[#F8F7F4]'
                      }`}
                    >
                      <span>{category}</span>
                      <span className={`text-[8px] font-medium px-1 bg-white/5 border border-white/10 ${
                        isActive ? 'text-amber-400/80 border-amber-400/30' : 'text-[#F8F7F4]/40'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {courses.length === 0 ? (
              <div className="bg-[#18181b] border border-white/10 p-10 text-center border-dashed">
                <div className="w-12 h-12 bg-white/5 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-mono font-bold text-[#F8F7F4] uppercase">No learning environments compiled yet</h3>
                <p className="text-[#F8F7F4]/50 max-w-sm mx-auto mt-2 text-[11px] font-mono leading-relaxed uppercase">
                  Upload any document or select a study path to activate your responsive workspace instantly.
                </p>
                <button
                  onClick={onNavigateToUpload}
                  className="mt-6 px-5 py-2.5 bg-[#FFD700] border border-[#FFD700] text-[#111113] hover:bg-amber-400 transition font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Generate First Workspace
                </button>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="bg-[#18181b] border border-white/10 p-10 text-center border-dashed font-mono">
                <h3 className="text-sm font-bold text-[#F8F7F4] uppercase">No courses found in category: {selectedCategory}</h3>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="mt-4 px-4 py-2 border border-amber-400 text-amber-400 hover:bg-amber-400/10 transition text-xs font-bold uppercase rounded-sm cursor-pointer"
                >
                  Clear Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCourses.map((course) => {
                  const totalLessons = course.chapters.flatMap(ch => ch.lessons).length;
                  const completedCount = course.chapters.flatMap(ch => ch.lessons).filter(l => stats.completedLessons.includes(l.id)).length;
                  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

                  return (
                    <div 
                      key={course.id}
                      onClick={() => onSelectCourse(course.id)}
                      className="bg-[#18181b] border border-white/10 p-6 flex flex-col justify-between cursor-pointer hover:border-amber-400 hover:bg-white/5 transition-all duration-300 group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <span className={`text-[8px] font-mono font-bold px-2 py-0.5 border uppercase tracking-wider ${
                            course.difficulty === 'Beginner' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : course.difficulty === 'Intermediate'
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {course.difficulty}
                          </span>
                          <span className="text-[9px] text-[#F8F7F4]/50 font-mono uppercase tracking-wide">
                            {course.estimatedTime}
                          </span>
                        </div>
                        
                        <h3 className="text-base font-display font-extrabold text-[#F8F7F4] group-hover:text-amber-400 transition-colors uppercase leading-tight tracking-tight">
                          {course.title}
                        </h3>
                        <p className="text-[11px] text-[#F8F7F4]/50 mt-2 line-clamp-2 leading-relaxed font-mono">
                          {course.description}
                        </p>

                        {/* Course Category Badges */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {(course.categories || []).map((cat) => (
                            <span key={cat} className="text-[8px] font-mono font-bold px-1.5 py-0.5 bg-amber-400/10 text-amber-400 border border-amber-400/15 uppercase tracking-wider rounded-sm">
                              {cat}
                            </span>
                          ))}
                          {(course.tags || []).filter(tag => !(course.categories || []).includes(tag)).slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[8px] font-mono text-[#F8F7F4]/40 px-1.5 py-0.5 bg-white/5 border border-white/5 uppercase tracking-wider rounded-sm">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center text-[9px] font-mono text-[#F8F7F4]/50 mb-1">
                          <span>SYNC PROGRESS</span>
                          <span>{progressPercent}% ({completedCount}/{totalLessons})</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 overflow-hidden mb-4">
                          <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                        </div>
                        
                        <div className="flex items-center justify-between text-xs font-mono uppercase">
                          <div className="flex items-center gap-1 text-amber-400 font-bold tracking-widest group-hover:translate-x-1 transition-transform">
                            <span>Access OS Terminal</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                          
                          <button
                            id={`btn-export-course-${course.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              exportCourseOutlinePDF(course);
                            }}
                            className="px-2.5 py-1 border border-white/20 hover:border-amber-400 text-[#F8F7F4]/70 hover:text-amber-400 hover:bg-amber-400/5 text-[9px] font-bold uppercase transition flex items-center gap-1 rounded-sm cursor-pointer"
                            title="Export course syllabus outline PDF for offline study"
                          >
                            <FileText className="w-3 h-3 text-amber-400" />
                            <span>Syllabus PDF</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Stream & Leaderboard */}
          <div className="space-y-6">
            
            {/* Learning Goal Widget */}
            <LearningGoalWidget stats={stats} token={token} onUpdateStats={onUpdateStats} />

            {/* Quests and Challenges Hub */}
            <ChallengeHub stats={stats} token={token} onUpdateStats={onUpdateStats} />

            {/* Gamified Leaderboard */}
            <div className="bg-[#18181b] border border-white/10 p-5 font-mono">
              <h3 className="text-xs font-bold text-[#F8F7F4] flex items-center gap-2 mb-4 border-b border-white/5 pb-2 uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-amber-400" />
                Duolingo Division Board
              </h3>
              
              <div className="space-y-3.5">
                {[
                  { rank: 1, name: "scholar_alpha", xp: 1420, active: false },
                  { rank: 2, name: "alexander_mercer (You)", xp: stats.xpPoints, active: true },
                  { rank: 3, name: "quantum_coder", xp: 390, active: false },
                  { rank: 4, name: "bio_synth", xp: 220, active: false },
                  { rank: 5, name: "hume_mind", xp: 80, active: false },
                ]
                  .sort((a, b) => b.xp - a.xp)
                  .map((user, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-2 text-xs border ${
                        user.active 
                          ? 'border-amber-400/40 bg-amber-400/10 text-amber-400 font-bold' 
                          : 'border-transparent text-[#F8F7F4]/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-amber-400">#{idx + 1}</span>
                        <span className="uppercase text-[11px] truncate max-w-[120px]">{user.name}</span>
                      </div>
                      <span className="font-mono text-[11px] font-bold">{user.xp} XP</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Badges Box */}
            <div className="bg-[#18181b] border border-white/10 p-5 font-mono">
              <h3 className="text-xs font-bold text-[#F8F7F4] flex items-center gap-2 mb-4 border-b border-white/5 pb-2 uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-400" />
                Skill Milestones
              </h3>
              
              {stats.badges.length === 0 ? (
                <p className="text-[10px] text-[#F8F7F4]/40 py-1 uppercase">Complete lesson modules to forge badges.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {stats.badges.map((badge, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-1 px-2 py-1 border border-amber-400/20 text-amber-400 font-bold text-[9px] bg-amber-400/10 uppercase"
                    >
                      <Zap className="w-3 h-3" />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  };

  const renderSkillTree = () => {
    // Custom Duolingo-style structured learning path nodes
    const skillNodes = [
      { id: 'ingest', label: 'RAG Ingestion Engine', desc: 'OCR & Layout Parsing', unlocked: true, current: false, color: 'bg-emerald-400 text-emerald-950' },
      { id: 'embed', label: 'Semantic Chunking & Vectors', desc: 'Embeddings & Distance Indices', unlocked: stats.xpPoints >= 100, current: stats.xpPoints < 100, color: 'bg-amber-400 text-amber-950' },
      { id: 'orch', label: 'Multi-Agent Orchestration', desc: 'Role Delegation & Memory Streams', unlocked: stats.xpPoints >= 200, current: stats.xpPoints >= 100 && stats.xpPoints < 200, color: 'bg-indigo-400 text-indigo-950' },
      { id: 'prompt', label: 'Advanced Prompt Design', desc: 'Few-Shot & Chain-of-Thought Patterns', unlocked: stats.xpPoints >= 300, current: stats.xpPoints >= 200 && stats.xpPoints < 300, color: 'bg-rose-400 text-rose-950' },
      { id: 'eval', label: 'RAG Triad & Hallucinations', desc: 'Evaluation & Semantic Coverage', unlocked: stats.xpPoints >= 400, current: stats.xpPoints >= 300 && stats.xpPoints < 400, color: 'bg-violet-400 text-violet-950' },
      { id: 'deploy', label: 'Production Scaling', desc: 'Caching, Rate Limiting, & Gateways', unlocked: stats.xpPoints >= 500, current: stats.xpPoints >= 400 && stats.xpPoints < 500, color: 'bg-teal-400 text-teal-950' },
    ];

    return (
      <div className="space-y-8 animate-fade-in font-mono text-xs">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">[02] DYNAMIC SKILL TREE</span>
          <h3 className="text-2xl font-display font-bold text-[#F8F7F4] uppercase mt-1">Gamified Ingestion Path</h3>
          <p className="text-[11px] text-[#F8F7F4]/50 leading-relaxed mt-2 uppercase">
            Progress through core AI architectures. Accumulate XP points inside course workspaces to unlock advanced chapters and division ranks!
          </p>
        </div>

        {/* Path container with connected line */}
        <div className="relative max-w-md mx-auto py-10 flex flex-col items-center">
          
          {/* Vertical connecting line */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-white/10 z-0" />

          {skillNodes.map((node, index) => (
            <div 
              key={node.id} 
              className={`relative z-10 flex flex-col items-center mb-16 last:mb-0 transition-all duration-300 ${
                node.unlocked ? 'opacity-100' : 'opacity-45'
              }`}
            >
              {/* Node Circle */}
              <div 
                className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${
                  node.unlocked 
                    ? 'border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.2)]' 
                    : 'border-white/10 bg-[#18181b]'
                } ${node.color} transition-all transform hover:scale-110 cursor-pointer relative group`}
              >
                <BrainCircuit className="w-8 h-8" />
                
                {/* Micro badge indicator */}
                {node.unlocked ? (
                  <div className="absolute -top-1 -right-1 bg-amber-400 text-[#111113] font-black text-[9px] w-6 h-6 rounded-full flex items-center justify-center border border-white">
                    ✓
                  </div>
                ) : (
                  <div className="absolute -top-1 -right-1 bg-white/10 text-white/50 font-black text-[8px] w-6 h-6 rounded-full flex items-center justify-center border border-white/20">
                    🔒
                  </div>
                )}
              </div>

              {/* Title & Description card */}
              <div className="mt-4 bg-[#18181b] border border-white/10 p-3.5 text-center max-w-xs w-64 shadow-md">
                <span className="text-[8px] text-amber-400 font-bold uppercase tracking-wider block">STAGE {index + 1}</span>
                <h4 className="font-bold text-[#F8F7F4] uppercase text-[11px] mt-0.5">{node.label}</h4>
                <p className="text-[9px] text-[#F8F7F4]/40 uppercase mt-1 leading-normal">{node.desc}</p>
                
                {node.current && (
                  <span className="inline-block mt-2.5 bg-amber-400/10 border border-amber-400 text-amber-400 text-[8px] px-2 py-0.5 uppercase font-bold animate-pulse">
                    Active Study Node
                  </span>
                )}
              </div>
            </div>
          ))}

        </div>
      </div>
    );
  };

  const renderCareerCoach = () => {
    return (
      <div className="space-y-8 animate-fade-in font-mono text-xs">
        <div className="border-b border-white/10 pb-4">
          <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">[03] AI CAREER STRATEGIST</span>
          <h3 className="text-2xl font-display font-bold text-[#F8F7F4] uppercase mt-1">Personalized Career Mentor</h3>
          <p className="text-[11px] text-[#F8F7F4]/50 leading-relaxed mt-1 uppercase">
            Bridge your academic study directly into production requirements. Analyze your resume, plan skill certification trees, and track roadmap checkpoints.
          </p>
        </div>

        {/* Career Sub-tab Selection */}
        <div className="flex flex-wrap border-b border-white/5 pb-2 gap-3 text-xs font-bold uppercase">
          <button
            onClick={() => setCareerSubTab('map')}
            className={`px-4 py-2 border transition-all rounded-sm cursor-pointer ${
              careerSubTab === 'map'
                ? 'bg-amber-400/15 border-amber-400 text-amber-300'
                : 'bg-[#18181b] border-white/5 text-[#F8F7F4]/50 hover:text-[#F8F7F4]/85 hover:bg-white/5'
            }`}
          >
            [1] Interactive Syllabus Map
          </button>
          <button
            onClick={() => setCareerSubTab('resume')}
            className={`px-4 py-2 border transition-all rounded-sm cursor-pointer ${
              careerSubTab === 'resume'
                ? 'bg-amber-400/15 border-amber-400 text-amber-300'
                : 'bg-[#18181b] border-white/5 text-[#F8F7F4]/50 hover:text-[#F8F7F4]/85 hover:bg-white/5'
            }`}
          >
            [2] Resume Gap Analyzer & Audits
          </button>
        </div>

        {careerSubTab === 'map' ? (
          <CareerPath stats={stats} onUpdateStats={onUpdateStats} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Panel: Resume Scanner */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#18181b] border border-white/10 p-5 shadow-sm">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Resume Gap Analyzer</h4>
                
                <div className="space-y-4">
                  <p className="text-[#F8F7F4]/60 leading-relaxed text-[11px] uppercase">
                    Paste your resume text below. Our AI mentor will review keywords against modern job descriptions in RAG, Prompt Engineering, and machine learning architectures.
                  </p>

                  <textarea 
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={5}
                    className="w-full bg-[#111113] border border-white/10 text-xs text-[#F8F7F4] p-3 focus:border-amber-400 focus:outline-none"
                    placeholder="Paste your resume content or career bio here..."
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-[#F8F7F4]/40 uppercase">SOC-2 Protected data transfer active</span>
                    <button 
                      onClick={triggerAnalyzeResume}
                      disabled={analyzingResume || !resumeText.trim()}
                      className="px-4 py-2 bg-amber-400 text-amber-950 hover:bg-amber-300 font-bold uppercase text-[11px] tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      {analyzingResume ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Scanning Database...</span>
                        </>
                      ) : (
                        <>
                          <Compass className="w-3.5 h-3.5" />
                          <span>Run Audit Scanner</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Analysis Result Box */}
                {resumeAnalysisResult && (
                  <div className="mt-6 pt-5 border-t border-white/15 space-y-4 animate-fade-in text-[11px] uppercase">
                    <div className="flex items-center gap-4 bg-[#111113] p-3.5 border border-white/5">
                      <div className="w-16 h-16 rounded-full border-4 border-amber-400 flex items-center justify-center shrink-0">
                        <span className="font-black text-amber-400 text-base">{resumeAnalysisResult.score}%</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-[#F8F7F4] text-xs">AI Keyword Sync Score</h5>
                        <p className="text-[10px] text-[#F8F7F4]/40 mt-1 leading-normal">Your resume ranks highly for standard development, but lacks critical semantic search terms.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-red-500/5 border border-red-500/20 p-3.5 text-red-200">
                        <h6 className="font-bold text-red-400 text-[10px] tracking-wider border-b border-red-500/10 pb-1 mb-2">Detected Gaps</h6>
                        <ul className="space-y-1.5 list-disc pl-4 text-[10px] leading-relaxed">
                          {resumeAnalysisResult.weaknesses.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>

                      <div className="bg-emerald-500/5 border border-emerald-500/20 p-3.5 text-emerald-200">
                        <h6 className="font-bold text-emerald-400 text-[10px] tracking-wider border-b border-emerald-500/10 pb-1 mb-2">Target Enhancements</h6>
                        <ul className="space-y-1.5 list-disc pl-4 text-[10px] leading-relaxed">
                          {resumeAnalysisResult.strengths.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-[#111113] border border-[#FFD700]/30 p-4 text-amber-300">
                      <h6 className="font-bold text-amber-400 text-[10px] tracking-wider mb-2">Quantified bullet points to copy:</h6>
                      <ul className="space-y-2 list-decimal pl-4 text-[10px] leading-relaxed">
                        {resumeAnalysisResult.recommendations.map((rec: string, i: number) => <li key={i}>{rec}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Certifications & Roadmap */}
            <div className="space-y-6">
              
              {/* Certifications Card */}
              <div className="bg-[#18181b] border border-white/10 p-5 font-mono">
                <h4 className="text-xs font-bold text-[#F8F7F4] border-b border-white/5 pb-2.5 mb-3.5 uppercase tracking-wider">Suggested Certifications</h4>
                
                <div className="space-y-3">
                  {[
                    { name: "Google Cloud AI Engineer", code: "GCP-AI-2026", cost: "Included", difficulty: "Hard" },
                    { name: "Certified Prompt Architect", code: "CPA-V3", cost: "Earned via Platform", difficulty: "Medium" },
                    { name: "Enterprise Vector DB Specialist", code: "EVBS-ML", cost: "Included", difficulty: "Expert" }
                  ].map((cert, idx) => (
                    <div key={idx} className="bg-[#111113] p-3.5 border border-white/5 flex flex-col justify-between">
                      <div>
                        <span className="text-[8px] text-amber-400 font-bold block">{cert.code}</span>
                        <h5 className="font-bold text-[#F8F7F4] text-[11px] mt-0.5 uppercase tracking-tight leading-tight">{cert.name}</h5>
                      </div>
                      <div className="flex justify-between text-[9px] text-[#F8F7F4]/40 uppercase mt-3 pt-2.5 border-t border-white/5">
                        <span>Fee: {cert.cost}</span>
                        <span className="text-amber-400 font-bold">{cert.difficulty}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Engineer Roadmap Checkpoints */}
              <div className="bg-[#18181b] border border-white/10 p-5 font-mono">
                <h4 className="text-xs font-bold text-[#F8F7F4] border-b border-white/5 pb-2.5 mb-3.5 uppercase tracking-wider">Roadmap Checkpoints</h4>
                
                <div className="space-y-3">
                  {[
                    { label: "Understand Cosine Similarity bounds", done: true },
                    { label: "Compile local vector store using BM25", done: stats.xpPoints >= 100 },
                    { label: "Orchestrate 3 concurrent tutor agent loops", done: stats.xpPoints >= 250 },
                    { label: "Deploy a RAG evaluation benchmark matrix", done: false },
                  ].map((task, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-[10px] text-[#F8F7F4]/60 uppercase">
                      {task.done ? (
                        <span className="text-emerald-400 shrink-0">✓</span>
                      ) : (
                        <span className="text-amber-400 shrink-0">◷</span>
                      )}
                      <span className={task.done ? 'line-through text-[#F8F7F4]/30' : ''}>{task.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    );
  };

  const renderInstructor = () => {
    return (
      <div className="space-y-8 animate-fade-in font-mono text-xs">
        <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">[04] INSTRUCTOR COMMAND SYSTEM</span>
            <h3 className="text-2xl font-display font-bold text-[#F8F7F4] uppercase mt-1">Multi-Student Analytics</h3>
            <p className="text-[11px] text-[#F8F7F4]/50 leading-relaxed mt-1 uppercase">
              Analyze group participation metrics, monitor module dropout scales, check question accuracy scores, and view telemetry audit logs.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 font-bold uppercase">
              ● Server: Connected
            </span>
            <span className="text-[9px] bg-white/5 border border-white/10 text-[#F8F7F4]/60 px-2.5 py-1 font-bold uppercase">
              SOC-2 Gate: Secure
            </span>
          </div>
        </div>

        {/* Analytics Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Active Enrollment", val: "148,204 Students", color: "text-amber-400" },
            { label: "Average Retention Ratio", val: "91.8% Retention", color: "text-emerald-400" },
            { label: "Avg Chapter Assessment", val: "84.2% Accuracy", color: "text-sky-400" },
            { label: "AI Hallucination Flag Rate", val: "0.01% Exception", color: "text-rose-400" }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#18181b] border border-white/10 p-4">
              <span className="text-[9px] text-[#F8F7F4]/40 uppercase tracking-wider block">{item.label}</span>
              <h4 className={`text-base font-bold uppercase mt-1.5 ${item.color}`}>{item.val}</h4>
            </div>
          ))}
        </div>

        {/* Drop-off and Difficulty graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Drop-off Curve Visual */}
          <div className="bg-[#18181b] border border-white/10 p-5 shadow-sm">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-white/5 pb-2.5 mb-4">Module Drop-off & Heatmap Curve</h4>
            
            <p className="text-[10px] text-[#F8F7F4]/50 uppercase mb-5 leading-normal">
              High drop-off detected on Stage 3 (Multi-Agent Orchestration). Recommended action: Inject simpler intermediate diagrams or additional interactive code examples.
            </p>

            {/* Simulated Curve SVG */}
            <div className="h-44 bg-[#111113] border border-white/5 relative p-4 flex items-end">
              <svg className="w-full h-full absolute inset-0">
                {/* Grid lines */}
                <line x1="0" y1="20" x2="100%" y2="20" stroke="rgba(255, 255, 255, 0.05)" />
                <line x1="0" y1="70" x2="100%" y2="70" stroke="rgba(255, 255, 255, 0.05)" />
                <line x1="0" y1="120" x2="100%" y2="120" stroke="rgba(255, 255, 255, 0.05)" />
                
                {/* Dynamic graph path line */}
                <path 
                  d="M 20 20 L 100 25 L 180 50 L 260 110 Q 340 100 420 90 L 500 85" 
                  fill="none" 
                  stroke="#FFD700" 
                  strokeWidth="2.5" 
                  className="transition-all duration-300"
                />
                
                {/* Dot markers */}
                <circle cx="20" cy="20" r="4" fill="#FFD700" />
                <circle cx="100" cy="25" r="4" fill="#FFD700" />
                <circle cx="180" cy="50" r="4" fill="#FFD700" />
                <circle cx="260" cy="110" r="4" fill="#F87171" className="animate-pulse" /> {/* Warning dot */}
                <circle cx="420" cy="90" r="4" fill="#FFD700" />
                <circle cx="500" cy="85" r="4" fill="#FFD700" />
              </svg>

              {/* Legends on the bottom */}
              <div className="w-full flex justify-between text-[8px] text-[#F8F7F4]/40 uppercase z-10 font-mono px-2">
                <span>RAG Ingest (98%)</span>
                <span>Embeddings (94%)</span>
                <span>Agent Orch (58% Drop)</span>
                <span>Deploy (88%)</span>
              </div>
            </div>
          </div>

          {/* Question difficulty metrics */}
          <div className="bg-[#18181b] border border-white/10 p-5 shadow-sm">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-white/5 pb-2.5 mb-4">Topic Assessment Failure Rates</h4>
            
            <div className="space-y-4">
              {[
                { topic: "Cosine Similarity Metrics", failure: 12, label: "Easy" },
                { topic: "State Window Re-ranking Algorithms", failure: 68, label: "Hard" },
                { topic: "Token Context Compression Ratio", failure: 42, label: "Medium" },
                { topic: "Multi-Model Inference Routing", failure: 74, label: "Expert" }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-[#F8F7F4]">
                    <span>{item.topic}</span>
                    <span className="text-amber-400">{item.failure}% Failure Ratio</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5">
                    <div className="h-full bg-amber-400" style={{ width: `${item.failure}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Simulation Sandbox telemetry logs */}
        <div className="bg-[#18181b] border border-white/10 p-5 font-mono">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-white/5 pb-2.5 mb-4 flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span>SOC-2 Cyber Audit Telemetry Logs</span>
          </h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10px] uppercase">
              <thead>
                <tr className="border-b border-white/10 text-[#F8F7F4]/40">
                  <th className="py-2">Timestamp (UTC)</th>
                  <th className="py-2">System Event</th>
                  <th className="py-2">Assigned Agent Node</th>
                  <th className="py-2">Status Code</th>
                  <th className="py-2 text-right">latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#F8F7F4]/60">
                {[
                  { time: "2026-07-18 10:41:03", event: "Embeddings Ingest chunk block_142", node: "EmbedAgent", status: "200 SUCCESS", delay: "34ms" },
                  { time: "2026-07-18 10:38:12", event: "Model Routing Qwen-2.5-72B-Instruct", node: "RouterAgent", status: "200 SUCCESS", delay: "128ms" },
                  { time: "2026-07-18 10:35:45", event: "Hallucination Triad Evaluation audit", node: "EvalAgent", status: "204 NO_COMPROMISE", delay: "220ms" },
                  { time: "2026-07-18 10:32:01", event: "Rate Limit Gate counter validation", node: "SecurityGate", status: "200 OK", delay: "1ms" },
                ].map((log, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 font-mono text-amber-400">{log.time}</td>
                    <td className="py-2.5">{log.event}</td>
                    <td className="py-2.5 font-bold text-sky-400">{log.node}</td>
                    <td className="py-2.5 font-bold text-emerald-400">{log.status}</td>
                    <td className="py-2.5 text-right text-gray-400">{log.delay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-[#F8F7F4]/10 pb-6">
        <div>
          <span className="text-[10px] font-mono text-amber-400 font-bold tracking-widest uppercase">[01] PERSONAL LEARNING ENVIRONMENT</span>
          <h2 className="text-4xl md:text-5xl font-display font-extrabold mt-1 text-[#F8F7F4] tracking-tight leading-none uppercase">Learning OS Portal</h2>
          <p className="text-xs font-mono text-[#F8F7F4]/50 mt-3 max-w-xl leading-relaxed uppercase">
            Socio-cognitive workspace for deep learning. Upload files, manage structured curricula, review job metrics, or analyze telemetry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onNavigateToCertificates}
            className="px-5 py-3 border border-[#F8F7F4] text-[#F8F7F4] font-mono text-xs font-bold hover:bg-[#F8F7F4] hover:text-[#111113] transition uppercase tracking-wider cursor-pointer"
          >
            Certificates
          </button>
          <button 
            onClick={onNavigateToUpload}
            className="px-6 py-3 bg-[#FFD700] border border-[#FFD700] text-[#111113] font-mono text-xs font-bold hover:bg-amber-400 transition uppercase tracking-wider cursor-pointer"
          >
            Add Knowledge source
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-white/10 mb-8 font-mono text-xs gap-1.5 overflow-x-auto">
        {[
          { id: 'overview', label: '[01] Master Overview', icon: <BookOpen className="w-3.5 h-3.5" /> },
          { id: 'skill_tree', label: '[02] Gamified Skill Tree', icon: <BrainCircuit className="w-3.5 h-3.5" /> },
          { id: 'career', label: '[03] AI Career Mentor', icon: <Briefcase className="w-3.5 h-3.5" /> },
          { id: 'instructor', label: '[04] Instructor Dashboard', icon: <BarChart3 className="w-3.5 h-3.5" /> },
          { id: 'coding_games', label: '[05] Coding Games Arena', icon: <Terminal className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> },
          { id: 'dsa_playground', label: '[06] DSA Practice Arena', icon: <Code2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as DashboardTab)}
            className={`flex items-center gap-2 px-5 py-3 font-bold uppercase transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id 
                ? 'border-amber-400 text-amber-400 bg-white/5' 
                : 'border-transparent text-[#F8F7F4]/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Switchboard content viewport */}
      <div className="w-full">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'skill_tree' && renderSkillTree()}
        {activeTab === 'career' && renderCareerCoach()}
        {activeTab === 'instructor' && renderInstructor()}
        {activeTab === 'coding_games' && <CodingGames stats={stats} token={token} onUpdateStats={onUpdateStats} />}
        {activeTab === 'dsa_playground' && <DsaArena stats={stats} token={token} onUpdateStats={onUpdateStats} />}
      </div>

    </div>
  );
}
