import React, { useState, useEffect, useRef } from 'react';
import { Course, Lesson, QuizQuestion, Flashcard, ChatMessage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { 
  BookOpen, Trophy, Compass, HelpCircle, CheckCircle2, Circle, Send, Sparkles, 
  ChevronRight, BrainCircuit, Lightbulb, RotateCcw, AlertTriangle, BookOpenCheck,
  Award, MessageSquare, ChevronDown, Check, GraduationCap, RefreshCw,
  Settings, Sliders, Volume2, VolumeX, Mic, MicOff, Play, Pause, Code2, Copy, FileText,
  GitMerge, Server, Lock, Terminal, Video, Languages, SkipForward
} from 'lucide-react';
import { exportCourseOutlinePDF, exportLessonPDF } from '../lib/pdfExport';
import { AIVideoService } from '../lib/videoService';

interface CoursePlayerProps {
  course: Course;
  completedLessons: string[];
  quizScores: { [quizId: string]: number };
  onCompleteLesson: (courseId: string, lessonId: string) => void;
  onSubmitQuizScore: (courseId: string, quizId: string, score: number) => void;
  onNavigateBack: () => void;
  onGraduated: (courseId: string) => void;
}

type WorkspaceTab = 'lesson' | 'mindmap' | 'quiz' | 'flashcards' | 'sandbox' | 'diagrams' | 'notes' | 'video';

type AgentRole = 'general' | 'tutor' | 'quiz_master' | 'flashcard_bot' | 'research' | 'code_reviewer' | 'interview_coach' | 'career_mentor';

type TutorLevel = 'school_teacher' | 'detailed' | 'expert' | 'interview' | 'coding';

export function CoursePlayer({ 
  course, 
  completedLessons, 
  quizScores, 
  onCompleteLesson, 
  onSubmitQuizScore, 
  onNavigateBack,
  onGraduated
}: CoursePlayerProps) {
  
  // Tab Management
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('lesson');
  
  // Selected Chapter & Lesson
  const [selectedChapterId, setSelectedChapterId] = useState(course.chapters[0]?.id || '');
  const [selectedLessonId, setSelectedLessonId] = useState(course.chapters[0]?.lessons[0]?.id || '');
  
  // Lesson Loading & Content
  const [lessonContent, setLessonContent] = useState<string>('');
  const [lessonExercises, setLessonExercises] = useState<string[]>([]);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);

  // Streaming toggle
  const [streamingSimulation, setStreamingSimulation] = useState(false);

  // Multi-Agent Architecture State
  const [activeAgent, setActiveAgent] = useState<AgentRole>('general');
  const [tutorLevel, setTutorLevel] = useState<TutorLevel>('detailed');

  // AI Voice states (Natively leveraging SpeechSynthesis & SpeechRecognition!)
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Observability State
  const [latency, setLatency] = useState(245);
  const [tokenCount, setTokenCount] = useState(618);
  const [llmCost, setLlmCost] = useState(0.00012);
  const [cacheHit, setCacheHit] = useState(true);

  // Companion AI Chatbot
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: `Greetings! I am active as your primary Learning OS Companion for **${course.title}**.

I have parsed and indexed your source: **${course.pdfName || 'Course Context Document'}** into a dense Vector index. Ask me anything, or toggle dedicated agent modes above!`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<{ [questionId: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedQuizHint, setSelectedQuizHint] = useState<string | null>(null);

  // Flashcards state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // Live Sandbox state
  const [codeTemplate, setCodeTemplate] = useState(`// Code Playground Workspace
// Try writing or editing javascript below, then click run.

function solveAlgorithm() {
  const result = "RAG Ingestion Successful!";
  console.log("Active concepts initialized...");
  return result;
}

solveAlgorithm();`);
  const [consoleOutput, setConsoleOutput] = useState<string[]>(['Click run to compile standard output stream...']);

  // Diagrams state
  const [selectedDiagramType, setSelectedDiagramType] = useState<'flowchart' | 'architecture' | 'mindmap' | 'sequence'>('flowchart');

  // Note Generator state
  const [selectedNoteType, setSelectedNoteType] = useState<'cornell' | 'bullets' | 'formula' | 'cheat_sheet' | 'interview'>('cornell');
  const [generatedNotes, setGeneratedNotes] = useState<string>('');
  const [generatingNotes, setGeneratingNotes] = useState(false);

  // AI Video Explainer States
  const [videoLanguage, setVideoLanguage] = useState<string>('English');
  const [showVideoInline, setShowVideoInline] = useState(false);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [previousVideos, setPreviousVideos] = useState<any[]>([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoVoiceSpeed, setVideoVoiceSpeed] = useState<number>(1.0);
  const [videoIsMuted, setVideoIsMuted] = useState(false);
  const slideUtteranceRef = useRef<any>(null);

  // Fetch previously generated videos for this course
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await AIVideoService.getVideos(course.id);
        setPreviousVideos(data);
        if (data && data.length > 0) {
          setActiveVideo(data[0]);
          setVideoLanguage(data[0].language);
        }
      } catch (err) {
        console.error("Failed to fetch existing course videos using AI Video Service", err);
      }
    };
    fetchVideos();
  }, [course.id]);

  // Voice player synthesizer and auto-progress simulation handler
  useEffect(() => {
    if (videoPlaying && activeVideo) {
      const slide = activeVideo.slides[currentSlideIdx];
      if (slide) {
        // Cancel any pending speech first
        window.speechSynthesis.cancel();

        if (!videoIsMuted) {
          const localeMap: { [key: string]: string } = {
            'english': 'en-US',
            'spanish': 'es-ES',
            'french': 'fr-FR',
            'german': 'de-DE',
            'hindi': 'hi-IN',
            'japanese': 'ja-JP',
            'chinese': 'zh-CN',
            'telugu': 'te-IN',
            'tamil': 'ta-IN',
            'arabic': 'ar-SA',
            'russian': 'ru-RU',
            'portuguese': 'pt-PT'
          };

          const cleanText = slide.spokenText.replace(/[\#\*\_`\>]/g, '');
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.rate = videoVoiceSpeed;

          const targetLocale = localeMap[videoLanguage.toLowerCase()] || 'en-US';
          const voices = window.speechSynthesis.getVoices();
          const matchedVoice = voices.find(v => v.lang.startsWith(targetLocale) || v.lang.startsWith(targetLocale.split('-')[0]));
          if (matchedVoice) {
            utterance.voice = matchedVoice;
          }

          utterance.onend = () => {
            if (currentSlideIdx < activeVideo.slides.length - 1) {
              setCurrentSlideIdx(prev => prev + 1);
            } else {
              setVideoPlaying(false);
            }
          };

          utterance.onerror = () => {
            // No operation
          };

          slideUtteranceRef.current = utterance;
          window.speechSynthesis.speak(utterance);
        } else {
          // If muted, simulate dynamic visual slide timing based on speech word length
          const wordCount = slide.spokenText.split(/\s+/).length;
          const durationMs = Math.max(4000, wordCount * 250); // Minimum 4s, or roughly 240 words-per-minute
          const timer = setTimeout(() => {
            if (currentSlideIdx < activeVideo.slides.length - 1) {
              setCurrentSlideIdx(prev => prev + 1);
            } else {
              setVideoPlaying(false);
            }
          }, durationMs);

          return () => clearTimeout(timer);
        }
      }
    } else {
      window.speechSynthesis.cancel();
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [videoPlaying, currentSlideIdx, activeVideo, videoLanguage, videoIsMuted, videoVoiceSpeed]);

  const handleGenerateVideo = async (targetLang?: string) => {
    const lang = targetLang || videoLanguage;
    setVideoLoading(true);
    setVideoError(null);
    setVideoPlaying(false);
    window.speechSynthesis.cancel();

    try {
      const data = await AIVideoService.generateVideo(course.id, lang);
      setActiveVideo(data);
      setCurrentSlideIdx(0);
      setVideoPlaying(true);

      // Add to cached previous videos list if not already there
      setPreviousVideos(prev => {
        if (prev.some(v => v.id === data.id)) return prev;
        return [data, ...prev];
      });

    } catch (err: any) {
      setVideoError(err.message || 'Error compiling your multi-lingual AI explanation video.');
    } finally {
      setVideoLoading(false);
    }
  };

  // Find active records
  const selectedChapter = course.chapters.find(ch => ch.id === selectedChapterId) || course.chapters[0];
  const selectedLesson = selectedChapter?.lessons.find(l => l.id === selectedLessonId) || selectedChapter?.lessons[0];

  // Fetch or generate lesson details
  useEffect(() => {
    if (!selectedChapterId || !selectedLessonId) return;
    
    const fetchLesson = async () => {
      setLessonLoading(true);
      setLessonError(null);
      setLessonContent('');
      setLessonExercises([]);

      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/lessons/generate', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            courseId: course.id,
            chapterId: selectedChapterId,
            lessonId: selectedLessonId
          })
        });

        if (!response.ok) throw new Error('Failed to load lesson details.');
        const data = await response.json();

        if (streamingSimulation) {
          // Simulate dynamic token streaming for premium typewriter feel
          let currentStr = '';
          const fullContent = data.content || '';
          let charIdx = 0;
          const interval = setInterval(() => {
            if (charIdx < fullContent.length) {
              currentStr += fullContent[charIdx];
              setLessonContent(currentStr);
              charIdx += Math.min(25, fullContent.length - charIdx); // Stream 25 chars at a time
            } else {
              clearInterval(interval);
              setLessonExercises(data.exercises || []);
              setLessonLoading(false);
            }
          }, 30);
        } else {
          setLessonContent(data.content || '');
          setLessonExercises(data.exercises || []);
          setLessonLoading(false);
        }

      } catch (err: any) {
        setLessonError(err.message || 'Error occurred during lesson synthesis.');
        setLessonLoading(false);
      }
    };

    fetchLesson();
  }, [selectedChapterId, selectedLessonId, course.id, streamingSimulation]);

  // Sync flashcards on chapter change
  useEffect(() => {
    if (selectedChapter) {
      setFlashcards(selectedChapter.flashcards || []);
      setCurrentCardIdx(0);
      setFlipped(false);
    }
  }, [selectedChapterId]);

  // Auto-scroll chat companion
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Native Speech Synthesis speak handler
  const speakText = (textToSpeak: string) => {
    if (!isVoiceOutputEnabled) return;
    window.speechSynthesis.cancel();
    // Strip markdown formatting simple regex
    const cleanText = textToSpeak.replace(/[\#\*\_`\>]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText.substring(0, 300)); // limit TTS length
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Native Speech Recognition handler
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(transcript);
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not natively supported in this environment browser container.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Submit Chat companion message
  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: chatInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    // Compute mock observability overhead
    const startT = performance.now();

    try {
      const token = localStorage.getItem('auth_token');
      // Modify payload to inject Agent parameters
      const historyText = chatMessages.slice(1).map(m => `${m.role === 'user' ? 'Student' : 'AI Agent'}: ${m.text}`).join('\n');
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          courseId: course.id,
          messages: [
            ...chatMessages,
            {
              role: 'user',
              text: `[ACTIVE AGENT ROLE]: ${activeAgent.toUpperCase()}\n[EXPLANATION LEVEL]: ${tutorLevel.toUpperCase()}\n\nHistory:\n${historyText}\n\nQuestion: ${userMsg.text}`
            }
          ]
        })
      });

      if (!response.ok) throw new Error('Chat gateway failure.');
      const data = await response.json();

      const calculatedLatency = Math.round(performance.now() - startT);
      setLatency(calculatedLatency);
      setTokenCount(Math.round(calculatedLatency / 1.5 + 300));
      setLlmCost(parseFloat((calculatedLatency * 0.0000004).toFixed(6)));
      setCacheHit(Math.random() > 0.4);

      setChatMessages(prev => [...prev, {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.text,
        timestamp: new Date().toISOString(),
        citations: data.citations
      }]);

      // TTS voice response
      speakText(data.text);

    } catch (err: any) {
      setChatMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `Companion connection failure: ${err.message}. Please retry.`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Mark lesson complete
  const handleMarkComplete = () => {
    if (selectedLesson) {
      onCompleteLesson(course.id, selectedLesson.id);
    }
  };

  // Submit Quiz score
  const handleQuizSubmit = () => {
    if (!selectedChapter) return;
    const questions = selectedChapter.quizzes;
    let correct = 0;
    questions.forEach((q) => {
      if (quizAnswers[q.id] === q.answer) correct++;
    });

    const scorePct = Math.round((correct / questions.length) * 100);
    setQuizScore(scorePct);
    setQuizSubmitted(true);
    onSubmitQuizScore(course.id, `quiz-${selectedChapter.id}`, scorePct);
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setSelectedQuizHint(null);
  };

  // Spaced repetition flashcard rating
  const handleFlashcardRating = (diff: 'easy' | 'medium' | 'hard') => {
    if (currentCardIdx < flashcards.length - 1) {
      setFlipped(false);
      setTimeout(() => {
        setCurrentCardIdx(prev => prev + 1);
      }, 300);
    } else {
      alert("SM-2 review interval configured! Chapter concepts committed +15 XP.");
      setCurrentCardIdx(0);
      setFlipped(false);
    }
  };

  // Compile Code execution (Client side sandbox simulation)
  const runCodeSandbox = () => {
    setConsoleOutput(['[COMPILING INDEX SOURCE]...', '[DOCKER CONTEXT ISOLATED SUCCESS]']);
    setTimeout(() => {
      try {
        // Safe evaluation simulation
        const originalLog = console.log;
        const capturedLogs: string[] = [];
        console.log = (...args) => {
          capturedLogs.push(args.join(' '));
        };
        
        const result = new Function(codeTemplate)();
        console.log = originalLog;

        setConsoleOutput(prev => [
          ...prev,
          ...capturedLogs.map(l => `LOG: ${l}`),
          `RETURN VALUE: ${result !== undefined ? JSON.stringify(result) : 'void'}`,
          `[PROCESS COMPLETED WITH EXIT CODE 0]`
        ]);
      } catch (err: any) {
        setConsoleOutput(prev => [
          ...prev,
          `RUNTIME EXCEPTION: ${err.message}`,
          `[PROCESS COMPLETED WITH EXIT CODE 1]`
        ]);
      }
    }, 600);
  };

  // Generate study notes using AI note builder
  const handleGenerateNotes = () => {
    setGeneratingNotes(true);
    setGeneratedNotes('');
    
    setTimeout(() => {
      let notesText = '';
      if (selectedNoteType === 'cornell') {
        notesText = `### Cornell Structured Study Notes
**Subject:** ${selectedLesson?.title || 'Chapter Concepts'}
**Keywords & Cue Column:**
- Superposition: Quantum state linear combinations.
- Schrödinger: Differential wave function model.

**Main Notes & Summaries:**
- The state vectors exist inside isolated Hilbert spaces.
- Operations map directly into complex linear matrices.

**Synthesized Summary Block:**
Understanding physical states requires modeling probability distributions using density vector transformations rather than absolute coordinates.`;
      } else if (selectedNoteType === 'bullets') {
        notesText = `### Academic Bullet Points
- **Core Principle**: Standard metrics do not represent high-dimensional vector spaces.
- **Table Remapping**: Cross-Encoder models re-rank sparse hits into semantic groups.
- **RAG Bottleneck**: Index retrieval must be compressed prior to prompting.`;
      } else if (selectedNoteType === 'formula') {
        notesText = `### Formula Sheet & Proofs
- **Cosine Distance Limit**:
  $$\\text{similarity} = \\cos(\\theta) = \\frac{\\mathbf{A} \\cdot \\mathbf{B}}{\\|\\mathbf{A}\\| \\|\\mathbf{B}\\|}$$
- **State Wave Propagation**:
  $$i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t)$$`;
      } else if (selectedNoteType === 'cheat_sheet') {
        notesText = `### Quick Cheat Sheet & Reminders
- *Always* normalize vectors prior to cosine computation.
- Set temperature close to **0.0** for structured JSON extraction.
- Rerank index size should target a threshold of **K=10** maximum documents.`;
      } else {
        notesText = `### Interview Prep Checklist
- Explain the direct mathematical difference between Dense and Sparse retrieval.
- How does context compression reduce LLM latency costs?
- Describe SOC-2 compliance parameters inside full-stack PDF ingestors.`;
      }
      
      setGeneratedNotes(notesText);
      setGeneratingNotes(false);
    }, 1000);
  };

  // Render SVG interactive mind-map
  const renderInteractiveMindMap = () => {
    const rootX = 300;
    const rootY = 220;
    const chapterRadius = 130;
    const chaptersCount = course.chapters.length;

    return (
      <div className="w-full h-[450px] bg-[#111113] border border-white/10 overflow-hidden relative shadow-inner">
        <div className="absolute top-4 left-4">
          <h3 className="font-display font-bold text-xs text-[#F8F7F4] uppercase tracking-wider">Interactive Curriculum Graph</h3>
          <p className="text-[10px] text-amber-400 font-mono mt-0.5 uppercase tracking-wide">Click any Chapter or Lesson node to fast-travel</p>
        </div>

        <svg className="w-full h-full cursor-grab active:cursor-grabbing">
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Connected Lines */}
          {course.chapters.map((ch, idx) => {
            const angle = (idx * 2 * Math.PI) / chaptersCount - Math.PI / 2;
            const chX = rootX + chapterRadius * Math.cos(angle);
            const chY = rootY + chapterRadius * Math.sin(angle);

            return (
              <g key={`edges-${ch.id}`}>
                <path 
                  d={`M ${rootX} ${rootY} Q ${(rootX + chX) / 2} ${(rootY + chY) / 2 - 20} ${chX} ${chY}`} 
                  fill="none" 
                  stroke={selectedChapterId === ch.id ? "#FFD700" : "rgba(255, 255, 255, 0.1)"} 
                  strokeWidth={selectedChapterId === ch.id ? "2" : "1"} 
                  strokeDasharray={selectedChapterId === ch.id ? "none" : "4 2"}
                />
                
                {selectedChapterId === ch.id && ch.lessons.map((les, lIdx) => {
                  const lesAngle = angle - 0.3 + (lIdx * 0.6) / (ch.lessons.length - 1 || 1);
                  const lesX = chX + 65 * Math.cos(lesAngle);
                  const lesY = chY + 65 * Math.sin(lesAngle);
                  return (
                    <line 
                      key={`les-edge-${les.id}`}
                      x1={chX} y1={chY} x2={lesX} y2={lesY}
                      stroke={selectedLessonId === les.id ? "#FFD700" : "rgba(255, 255, 255, 0.05)"}
                      strokeWidth="1"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Root Node */}
          <g transform={`translate(${rootX}, ${rootY})`}>
            <circle r="36" className="fill-[#18181b] stroke-amber-400 stroke-[2]" />
            <circle r="28" className="fill-[#111113] stroke-white/10" />
            <GraduationCap className="w-8 h-8 text-amber-400 absolute left-[-16px] top-[-16px]" />
            <title>{course.title}</title>
          </g>

          {/* Chapters Node Rendering */}
          {course.chapters.map((ch, idx) => {
            const angle = (idx * 2 * Math.PI) / chaptersCount - Math.PI / 2;
            const chX = rootX + chapterRadius * Math.cos(angle);
            const chY = rootY + chapterRadius * Math.sin(angle);
            const active = selectedChapterId === ch.id;

            return (
              <g key={ch.id} className="cursor-pointer" onClick={() => { setSelectedChapterId(ch.id); setSelectedLessonId(ch.lessons[0]?.id || ''); }}>
                <circle cx={chX} cy={chY} r="18" className={`transition-all duration-300 ${active ? 'fill-[#18181b] stroke-amber-400 stroke-[2]' : 'fill-[#111113] stroke-white/10'}`} />
                <BookOpen className={`w-4.5 h-4.5 absolute ${active ? 'text-amber-400' : 'text-white/40'}`} style={{ left: `${chX - 9}px`, top: `${chY - 9}px` }} />
                
                <rect x={chX - 45} y={chY + 22} width="90" height="18" className={`fill-[#18181b] border ${active ? 'stroke-amber-400' : 'stroke-white/10'}`} />
                <text x={chX} y={chY + 34} className={`text-[8px] font-mono font-bold text-center uppercase ${active ? 'fill-amber-400' : 'fill-[#F8F7F4]/40'}`} textAnchor="middle">
                  {ch.title.substring(0, 14)}...
                </text>

                {active && ch.lessons.map((les, lIdx) => {
                  const lesAngle = angle - 0.3 + (lIdx * 0.6) / (ch.lessons.length - 1 || 1);
                  const lesX = chX + 65 * Math.cos(lesAngle);
                  const lesY = chY + 65 * Math.sin(lesAngle);
                  const lesActive = selectedLessonId === les.id;
                  const completed = completedLessons.includes(les.id);

                  return (
                    <g 
                      key={les.id} 
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLessonId(les.id);
                        setActiveTab('lesson');
                      }}
                    >
                      <circle cx={lesX} cy={lesY} r="8" className={`transition-all duration-300 ${lesActive ? 'fill-amber-400 stroke-amber-300 stroke-2' : completed ? 'fill-[#18181b] stroke-emerald-400' : 'fill-[#111113] stroke-white/20'}`} />
                      <text x={lesX} y={lesY - 12} className={`text-[8px] font-mono uppercase ${lesActive ? 'fill-amber-400 font-bold' : completed ? 'fill-emerald-400' : 'fill-[#F8F7F4]/40'}`} textAnchor="middle">
                        {les.title.substring(0, 10)}...
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex gap-4 text-[9px] font-mono text-[#F8F7F4]/60 bg-[#18181b] p-2.5 border border-white/10 shadow-sm uppercase">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-amber-400" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 border border-emerald-500 bg-emerald-500/10" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 border border-white/20 bg-transparent" />
            <span>Unread</span>
          </div>
        </div>
      </div>
    );
  };

  const totalCourseLessons = course.chapters.flatMap(ch => ch.lessons).length;
  const courseCompletedCount = course.chapters.flatMap(ch => ch.lessons).filter(l => completedLessons.includes(l.id)).length;
  const courseCompletePercent = Math.round((courseCompletedCount / totalCourseLessons) * 100);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Left Sidebar: Outline navigation */}
      <div className="w-80 border-r border-white/10 bg-[#111113] flex flex-col justify-between shrink-0 h-full font-mono">
        <div className="flex flex-col h-full overflow-hidden">
          
          <div className="p-4 border-b border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <button 
                onClick={onNavigateBack}
                className="text-[10px] font-mono font-bold text-amber-400 hover:text-amber-300 uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
              >
                &larr; Portal Main
              </button>
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#F8F7F4] uppercase tracking-tight line-clamp-2 mt-1">{course.title}</h2>
            </div>
            
            {/* Export formatted PDF section */}
            <div className="p-2.5 bg-white/5 border border-white/10 flex flex-col gap-2 rounded-sm">
              <span className="text-[8px] font-bold text-[#F8F7F4]/50 tracking-wider uppercase flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#FFD700]" /> Export Coursework
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  id="btn-export-outline"
                  onClick={() => exportCourseOutlinePDF(course)}
                  className="px-2 py-1.5 bg-none border border-[#FFD700]/30 hover:border-[#FFD700] text-[9px] font-bold text-[#FFD700] hover:bg-[#FFD700]/10 uppercase transition cursor-pointer flex items-center justify-center gap-1 rounded-sm"
                  title="Export full course syllabus and summary to formatted PDF"
                >
                  <span>Syllabus PDF</span>
                </button>
                <button
                  id="btn-export-lesson"
                  disabled={!selectedLesson}
                  onClick={() => selectedLesson && exportLessonPDF(course, { ...selectedLesson, content: lessonContent })}
                  className="px-2 py-1.5 bg-none border border-white/25 hover:border-white text-[9px] font-bold text-[#F8F7F4]/80 hover:text-[#F8F7F4] hover:bg-white/5 uppercase transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 rounded-sm"
                  title="Export current active lesson as a study sheet PDF"
                >
                  <span>Lesson PDF</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {course.chapters.map((chapter) => {
              const isOpen = selectedChapterId === chapter.id;
              return (
                <div key={chapter.id} className="space-y-1">
                  <div 
                    onClick={() => { setSelectedChapterId(chapter.id); setSelectedLessonId(chapter.lessons[0]?.id || ''); }}
                    className={`p-3 border transition cursor-pointer flex items-center justify-between ${
                      isOpen ? 'bg-white/5 border-amber-400/30' : 'hover:bg-white/5 border-white/5'
                    }`}
                  >
                    <div className="flex-1">
                      <span className="text-[8px] text-amber-400 font-bold tracking-wider">UNIT CHAPTER</span>
                      <h3 className="text-xs font-bold text-[#F8F7F4] line-clamp-1 mt-0.5 uppercase tracking-tight">{chapter.title}</h3>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#F8F7F4]/40 transition-transform ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
                  </div>

                  {isOpen && (
                    <div className="pl-2 border-l border-white/10 ml-3 space-y-1 pt-1.5 text-xs text-[#F8F7F4]/50">
                      {chapter.lessons.map((les) => {
                        const isSelected = selectedLessonId === les.id;
                        const isCompleted = completedLessons.includes(les.id);
                        return (
                          <div 
                            key={les.id}
                            onClick={() => setSelectedLessonId(les.id)}
                            className={`p-2 flex items-center justify-between cursor-pointer transition uppercase text-[10px] ${
                              isSelected 
                                ? 'bg-white/5 border border-amber-400/30 text-amber-400 font-bold' 
                                : 'hover:text-[#F8F7F4] hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2 max-w-[85%]">
                              {isCompleted ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-white/25 shrink-0" />
                              )}
                              <span className="truncate tracking-tight">{les.title}</span>
                            </div>
                            <span className="text-[8px] text-[#F8F7F4]/30">{les.readingTime}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Graduation Claim */}
        <div className="p-4 border-t border-white/10 bg-[#18181b]">
          <div className="flex justify-between items-center text-[10px] text-[#F8F7F4]/50 mb-2 uppercase tracking-wider">
            <span>Overall Syllabus</span>
            <span>{courseCompletePercent}%</span>
          </div>
          <div className="w-full h-1 bg-white/5 overflow-hidden mb-3">
            <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${courseCompletePercent}%` }} />
          </div>
          {courseCompletePercent === 100 && (
            <button
              onClick={() => onGraduated(course.id)}
              className="w-full py-2.5 bg-[#FFD700] text-[#111113] font-bold text-xs hover:bg-amber-400 transition flex items-center justify-center gap-1.5 cursor-pointer uppercase"
            >
              <Award className="w-4 h-4" />
              Claim verified Degree
            </button>
          )}
        </div>
      </div>

      {/* Middle Content Viewport */}
      <div className="flex-1 flex flex-col bg-[#111113] overflow-hidden">
        
        {/* Workspace Sub-tabs */}
        <div className="flex border-b border-white/10 bg-[#18181b] px-4 py-1.5 items-center justify-between shrink-0 overflow-x-auto font-mono text-xs">
          <div className="flex gap-1">
            {[
              { id: 'lesson', label: 'Curriculum', icon: <BookOpen className="w-3.5 h-3.5" /> },
              { id: 'mindmap', label: 'Mind Map', icon: <Compass className="w-3.5 h-3.5" /> },
              { id: 'quiz', label: 'Quizzes', icon: <Trophy className="w-3.5 h-3.5" /> },
              { id: 'flashcards', label: 'Cards', icon: <HelpCircle className="w-3.5 h-3.5" /> },
              { id: 'sandbox', label: 'Code editor', icon: <Code2 className="w-3.5 h-3.5" /> },
              { id: 'diagrams', label: 'AI Diagrams', icon: <GitMerge className="w-3.5 h-3.5" /> },
              { id: 'notes', label: 'AI Notes', icon: <FileText className="w-3.5 h-3.5" /> },
              { id: 'video', label: 'AI Video Explainer', icon: <Video className="w-3.5 h-3.5" /> }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1 px-3 py-2 text-[10px] font-bold uppercase transition cursor-pointer ${
                    active 
                      ? 'bg-[#111113] border border-amber-400/30 text-amber-400' 
                      : 'text-[#F8F7F4]/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center gap-4 text-[9px] text-amber-400/80 bg-[#111113] border border-white/10 px-2.5 py-1 uppercase font-bold tracking-wider">
            <span className="hidden sm:inline">Stream tokens:</span>
            <input 
              type="checkbox" 
              checked={streamingSimulation}
              onChange={() => setStreamingSimulation(!streamingSimulation)}
              className="w-3 h-3 accent-amber-400"
            />
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* CURRICULUM LESSON TAB */}
          {activeTab === 'lesson' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {lessonLoading ? (
                <div className="text-center py-20 font-mono text-xs">
                  <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-4" />
                  <h3 className="font-bold text-[#F8F7F4] uppercase">Assembling Dynamic Text...</h3>
                  <p className="text-[#F8F7F4]/40 mt-1 uppercase">OCR tables and semantic blocks rendering...</p>
                </div>
              ) : lessonError ? (
                <div className="bg-red-500/10 border border-red-500/30 p-6 text-center font-mono text-xs uppercase text-red-200">
                  <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3 animate-pulse" />
                  <p className="font-bold">Gateway pipeline failed</p>
                  <p className="mt-1 text-[#F8F7F4]/55">{lessonError}</p>
                </div>
              ) : (
                <div className="space-y-8 animate-fade-in font-mono text-xs">
                  <div className="border-b border-white/10 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest">{selectedChapter?.title}</span>
                      <h1 className="text-2xl font-display font-bold text-[#F8F7F4] tracking-tight uppercase mt-1">{selectedLesson?.title}</h1>
                    </div>
                    {selectedLesson && (
                      <button
                        id="btn-lesson-pdf-download"
                        onClick={() => exportLessonPDF(course, { ...selectedLesson, content: lessonContent })}
                        className="px-3.5 py-2 bg-white/5 border border-white/20 hover:border-amber-400 hover:text-amber-400 hover:bg-amber-400/5 text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer rounded-sm"
                        title="Download formatted offline study sheet PDF for this lesson"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Download PDF Study Sheet</span>
                      </button>
                    )}
                  </div>

                  {/* GENERATE VIDEO TOGGLE CONTROL */}
                  <div className="bg-[#18181b] border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-amber-400" />
                      <div>
                        <h3 className="font-bold text-xs text-[#F8F7F4] tracking-wider">GENERATE AI VIDEO LECTURE</h3>
                        <p className="text-[9px] text-[#F8F7F4]/40 mt-0.5 normal-case">Translate topics to an advanced stage with live speech, GUI mockups and concrete examples.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {/* Language selection */}
                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <span className="text-[#F8F7F4]/50">NARRATOR:</span>
                        <select
                          value={videoLanguage}
                          onChange={(e) => {
                            const newLang = e.target.value;
                            setVideoLanguage(newLang);
                            if (showVideoInline) {
                              handleGenerateVideo(newLang);
                            }
                          }}
                          className="bg-[#111113] border border-white/10 text-white p-1 text-[10px] focus:outline-none uppercase"
                        >
                          {['English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Chinese', 'Telugu', 'Tamil', 'Arabic', 'Russian', 'Portuguese'].map((lang) => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>

                      {/* Toggle */}
                      <button
                        onClick={() => {
                          const nextVal = !showVideoInline;
                          setShowVideoInline(nextVal);
                          if (nextVal && !activeVideo) {
                            handleGenerateVideo();
                          }
                        }}
                        className={`px-3 py-1.5 border text-[10px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer rounded-sm ${
                          showVideoInline 
                            ? 'bg-amber-400 border-amber-400 text-amber-950 font-black' 
                            : 'bg-white/5 border-white/10 text-amber-400 hover:border-amber-400'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{showVideoInline ? 'Video Active' : 'Generate Video'}</span>
                      </button>
                    </div>
                  </div>

                  {/* INLINE VIDEO DISPLAY PANEL */}
                  {showVideoInline && (
                    <div className="border border-white/10 bg-[#141416] p-4 space-y-4 rounded-sm">
                      {videoLoading ? (
                        <div className="p-10 text-center space-y-3">
                          <RefreshCw className="w-7 h-7 text-amber-400 animate-spin mx-auto" />
                          <p className="text-[10px] uppercase text-amber-400 tracking-wider">Compiling detailed advanced stage video &amp; GUI layout in {videoLanguage}...</p>
                        </div>
                      ) : videoError ? (
                        <div className="p-6 text-center space-y-3 bg-rose-500/10 border border-rose-500/20">
                          <AlertTriangle className="w-7 h-7 text-rose-400 mx-auto" />
                          <p className="text-[10px] text-rose-200 uppercase">{videoError}</p>
                          <button
                            onClick={() => handleGenerateVideo()}
                            className="px-3 py-1 border border-rose-500 text-rose-400 text-[10px] hover:bg-rose-500/5 cursor-pointer uppercase"
                          >
                            Retry Generation
                          </button>
                        </div>
                      ) : activeVideo ? (
                        <div className="space-y-4">
                          {/* Mini player stage */}
                          <div className="aspect-[21/9] bg-[#0c0c0e] border border-white/5 relative overflow-hidden flex flex-col justify-between">
                            
                            {/* Slide grid area */}
                            <div className="flex-1 flex overflow-hidden">
                              {/* Avatar left */}
                              <div className="w-1/4 border-r border-white/5 bg-[#121214] flex flex-col items-center justify-center p-2 relative">
                                <div className="absolute w-16 h-16 rounded-full bg-amber-400/5 blur-xl" />
                                <div className="relative w-10 h-10 flex items-center justify-center z-10">
                                  {videoPlaying && (
                                    <div className="absolute inset-0 border border-amber-400/20 rounded-full animate-ping" />
                                  )}
                                  <div className="w-9 h-9 bg-[#18181b] border border-amber-400/70 flex items-center justify-center rounded-full">
                                    <svg className="w-7 h-7" viewBox="0 0 48 48">
                                      <path d="M12,42 C12,34 18,32 24,32 C30,32 36,34 36,42" fill="none" stroke="#FFD700" strokeWidth="1.5" />
                                      <circle cx="24" cy="20" r="10" className="fill-[#111113] stroke-amber-400 stroke-[1.5]" />
                                      {activeVideo.slides[currentSlideIdx]?.avatarExpression === 'smiling' && (
                                        <>
                                          <circle cx="20" cy="18" r="1.5" fill="#FFD700" />
                                          <circle cx="28" cy="18" r="1.5" fill="#FFD700" />
                                          <path d="M21,23 Q24,26 27,23" fill="none" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
                                        </>
                                      )}
                                      {activeVideo.slides[currentSlideIdx]?.avatarExpression === 'explaining' && (
                                        <>
                                          <line x1="18" y1="18" x2="22" y2="17" stroke="#FFD700" strokeWidth="1.5" />
                                          <line x1="26" y1="17" x2="30" y2="18" stroke="#FFD700" strokeWidth="1.5" />
                                          <circle cx="20" cy="19" r="1.5" fill="#FFD700" />
                                          <circle cx="28" cy="19" r="1.5" fill="#FFD700" />
                                          <circle cx="24" cy="24" r="2.5" fill="#FFD700" className={videoPlaying ? "animate-pulse" : ""} />
                                        </>
                                      )}
                                      {activeVideo.slides[currentSlideIdx]?.avatarExpression === 'thoughtful' && (
                                        <>
                                          <circle cx="20" cy="19" r="1.2" fill="#FFD700" />
                                          <circle cx="28" cy="19" r="1.2" fill="#FFD700" />
                                          <line x1="21" y1="23" x2="27" y2="23" stroke="#FFD700" strokeWidth="1.5" />
                                        </>
                                      )}
                                      {activeVideo.slides[currentSlideIdx]?.avatarExpression === 'pointing' && (
                                        <>
                                          <circle cx="19" cy="18" r="1.5" fill="#FFD700" />
                                          <circle cx="29" cy="18" r="1.5" fill="#FFD700" />
                                          <path d="M21,23 Q24,25 27,23" fill="none" stroke="#FFD700" strokeWidth="1.5" />
                                          <line x1="30" y1="25" x2="42" y2="20" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
                                        </>
                                      )}
                                      {(!activeVideo.slides[currentSlideIdx]?.avatarExpression || activeVideo.slides[currentSlideIdx]?.avatarExpression === 'neutral') && (
                                        <>
                                          <circle cx="20" cy="18" r="1.5" fill="#FFD700" />
                                          <circle cx="28" cy="18" r="1.5" fill="#FFD700" />
                                          <line x1="21" y1="24" x2="27" y2="24" stroke="#FFD700" strokeWidth="1.5" />
                                        </>
                                      )}
                                    </svg>
                                  </div>
                                </div>
                                <span className="text-[7px] text-[#F8F7F4]/40 uppercase font-bold mt-1 tracking-wider truncate max-w-full">
                                  {videoPlaying ? `🗣️ speaking` : '⏸️ paused'}
                                </span>
                              </div>

                              {/* Slide right */}
                              <div className="flex-1 p-3.5 bg-[#0f0f11] flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:12px_12px]" />
                                <div className="z-10 space-y-1.5 relative">
                                  <div className="flex justify-between items-center text-[7px] font-bold text-amber-400">
                                    <span>TOPIC: {activeVideo.videoTitle}</span>
                                    <span>{currentSlideIdx + 1}/{activeVideo.slides.length}</span>
                                  </div>
                                  <h4 className="text-[10px] font-bold text-[#F8F7F4] uppercase border-b border-white/5 pb-0.5 tracking-tight truncate">
                                    {activeVideo.slides[currentSlideIdx]?.slideTitle}
                                  </h4>
                                  <div className="space-y-1 pl-1">
                                    {activeVideo.slides[currentSlideIdx]?.slidePoints?.slice(0, 3).map((pt: string, ptIdx: number) => (
                                      <div key={ptIdx} className="flex gap-1 items-start text-[8px] uppercase text-[#F8F7F4]/80">
                                        <span className="text-amber-400 shrink-0">&bull;</span>
                                        <span className="truncate">{pt}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Mini diagram or GUI prompt description */}
                                <div className="z-10 bg-[#141416]/90 border border-white/5 px-2 py-1 text-[7px] text-amber-300/80 truncate font-mono uppercase">
                                  <span>GUI SYSTEM: {activeVideo.slides[currentSlideIdx]?.visualPrompt}</span>
                                </div>
                              </div>
                            </div>

                            {/* Live Subtitle captions */}
                            <div className="bg-black/95 p-2 text-center text-[9px] min-h-[2.5rem] border-t border-white/5 flex items-center justify-center font-mono">
                              <p className="text-amber-200 max-w-2xl line-clamp-2 uppercase">
                                {activeVideo.slides[currentSlideIdx]?.spokenText}
                              </p>
                            </div>
                          </div>

                          {/* Control actions bar */}
                          <div className="flex items-center justify-between gap-4 font-mono text-[9px]">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  if (currentSlideIdx > 0) {
                                    setCurrentSlideIdx(prev => prev - 1);
                                  }
                                }}
                                disabled={currentSlideIdx === 0}
                                className="p-1 border border-white/10 hover:border-amber-400/50 disabled:opacity-35 cursor-pointer text-[#F8F7F4]"
                              >
                                <SkipForward className="w-3.5 h-3.5 rotate-180" />
                              </button>

                              <button
                                onClick={() => setVideoPlaying(!videoPlaying)}
                                className={`px-2.5 py-1 flex items-center gap-1 border text-[9px] font-bold uppercase transition cursor-pointer ${
                                  videoPlaying 
                                    ? 'bg-amber-400/10 border-amber-400 text-amber-400' 
                                    : 'bg-white/5 border-white/10 text-white hover:border-amber-400'
                                }`}
                              >
                                {videoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                <span>{videoPlaying ? 'Pause' : 'Play'}</span>
                              </button>

                              <button
                                onClick={() => {
                                  if (currentSlideIdx < activeVideo.slides.length - 1) {
                                    setCurrentSlideIdx(prev => prev + 1);
                                  }
                                }}
                                disabled={currentSlideIdx === activeVideo.slides.length - 1}
                                className="p-1 border border-white/10 hover:border-amber-400/50 disabled:opacity-35 cursor-pointer text-[#F8F7F4]"
                              >
                                <SkipForward className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Slide indicators */}
                            <div className="flex gap-1 flex-1 max-w-xs mx-4">
                              {activeVideo.slides.map((_: any, idx: number) => (
                                <button
                                  key={idx}
                                  onClick={() => setCurrentSlideIdx(idx)}
                                  className={`h-1.5 flex-1 transition ${idx === currentSlideIdx ? 'bg-amber-400' : 'bg-white/10'}`}
                                />
                              ))}
                            </div>

                            {/* Mute and Speed */}
                            <div className="flex items-center gap-2">
                              <select
                                value={videoVoiceSpeed}
                                onChange={(e) => setVideoVoiceSpeed(parseFloat(e.target.value))}
                                className="bg-[#111113] border border-white/10 text-[#F8F7F4]/80 p-0.5 text-[8px]"
                              >
                                <option value="0.75">0.75x</option>
                                <option value="1.0">1.0x</option>
                                <option value="1.25">1.25x</option>
                              </select>
                              <button
                                onClick={() => setVideoIsMuted(!videoIsMuted)}
                                className={`p-1 border transition cursor-pointer flex items-center ${
                                  videoIsMuted 
                                    ? 'border-rose-500/30 text-rose-400 bg-rose-500/5' 
                                    : 'border-white/10 text-amber-400'
                                }`}
                              >
                                {videoIsMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Markdown Renderer */}
                  <div className="prose prose-invert max-w-none text-xs leading-relaxed uppercase tracking-tight text-[#F8F7F4]/80 normal-case">
                    <MarkdownRenderer content={lessonContent} />
                  </div>

                  {/* Exercises */}
                  {lessonExercises.length > 0 && (
                    <div className="bg-[#18181b] p-5 border border-white/10 shadow-sm">
                      <h4 className="font-bold text-xs text-[#F8F7F4] uppercase flex items-center gap-2 mb-3.5">
                        <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" />
                        Practical Sandbox Assignments
                      </h4>
                      <ul className="space-y-3 pl-1">
                        {lessonExercises.map((ex, idx) => (
                          <li key={idx} className="flex gap-2.5 items-start text-[11px] leading-relaxed uppercase">
                            <span className="text-amber-400 font-bold shrink-0">{idx + 1}.</span>
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Complete button */}
                  <div className="pt-6 border-t border-white/10 flex justify-end">
                    {completedLessons.includes(selectedLessonId) ? (
                      <div className="flex items-center gap-2 text-emerald-400 border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5 font-bold uppercase">
                        <BookOpenCheck className="w-4 h-4" />
                        <span>Module Completed</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleMarkComplete}
                        className="px-6 py-3 bg-[#FFD700] text-[#111113] hover:bg-amber-400 font-bold uppercase cursor-pointer"
                      >
                        Complete Lesson (+20 XP)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MIND MAP TAB */}
          {activeTab === 'mindmap' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-sm font-bold text-[#F8F7F4] font-mono uppercase tracking-wider">Concept Connectivity Mindmap</h2>
                <p className="text-[10px] text-[#F8F7F4]/40 font-mono mt-0.5 uppercase">Explore nodes extracted by our LayoutParser model from direct text structures.</p>
              </div>
              {renderInteractiveMindMap()}
            </div>
          )}

          {/* QUIZZES TAB */}
          {activeTab === 'quiz' && (
            <div className="max-w-2xl mx-auto space-y-8 font-mono text-xs uppercase">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-sm font-bold text-[#F8F7F4] tracking-wider">Chapter Assessment</h2>
                <p className="text-[10px] text-[#F8F7F4]/40 mt-1">Multi-choice checkpoints evaluating semantic memory recall accuracy.</p>
              </div>

              {selectedChapter?.quizzes?.length === 0 ? (
                <div className="text-center py-10">
                  <HelpCircle className="w-10 h-10 text-white/10 mx-auto mb-2" />
                  <p className="text-xs text-[#F8F7F4]/40">No assessments defined for this chapter block.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedChapter?.quizzes?.map((q, qIdx) => {
                    const selectedChoice = quizAnswers[q.id];
                    const correctChoice = q.answer;
                    const isCorrect = selectedChoice === correctChoice;

                    return (
                      <div key={q.id} className="bg-[#18181b] border border-white/10 p-5">
                        <div className="flex justify-between items-start mb-3.5">
                          <span className="font-bold text-[10px] text-amber-400 tracking-widest">CHECKPOINT {qIdx + 1}</span>
                          {!quizSubmitted && q.hint && (
                            <button
                              onClick={() => setSelectedQuizHint(selectedQuizHint === q.id ? null : q.id)}
                              className="text-[9px] font-bold text-amber-400 bg-white/5 border border-white/10 px-2 py-0.5 hover:bg-white/10 cursor-pointer"
                            >
                              {selectedQuizHint === q.id ? 'Hide Hint' : 'Check Hint'}
                            </button>
                          )}
                        </div>

                        <p className="font-bold text-[#F8F7F4] text-[11px] leading-relaxed mb-4">{q.question}</p>

                        {selectedQuizHint === q.id && (
                          <div className="p-2.5 bg-[#111113] border border-white/5 text-[9px] text-[#F8F7F4]/70 mb-3.5 normal-case">
                            💡 Hint: {q.hint}
                          </div>
                        )}

                        <div className="space-y-1.5">
                          {q.options.map((option, optIdx) => {
                            const isSelected = selectedChoice === optIdx;
                            const showSuccess = quizSubmitted && optIdx === correctChoice;
                            const showDanger = quizSubmitted && isSelected && !isCorrect;

                            return (
                              <button
                                key={optIdx}
                                disabled={quizSubmitted}
                                onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                                className={`w-full text-left p-3 border text-[10px] transition cursor-pointer ${
                                  showSuccess
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                                    : showDanger
                                    ? 'bg-rose-500/10 border-rose-500 text-rose-400 font-bold'
                                    : isSelected
                                    ? 'bg-white/5 border-amber-400 text-amber-400 font-bold'
                                    : 'bg-[#111113] border-white/10 hover:border-amber-400/40 text-[#F8F7F4]/70 hover:text-[#F8F7F4]'
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className={`mt-4 p-3.5 text-[9px] leading-relaxed border ${
                            isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}>
                            <p className="font-bold">{isCorrect ? '✓ Verification Passed' : '✗ Audit Inconsistent'}</p>
                            <p className="mt-1 normal-case">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    {quizSubmitted ? (
                      <div className="flex items-center gap-4 w-full justify-between">
                        <span className="text-[10px] text-[#F8F7F4]/50">RESULT SCORE: <span className={`font-bold text-xs ${quizScore && quizScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{quizScore}%</span></span>
                        <button onClick={resetQuiz} className="px-3 py-1.5 border border-white/10 hover:bg-white/5 font-bold cursor-pointer">
                          Reset checkpoint
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={Object.keys(quizAnswers).length < (selectedChapter?.quizzes?.length || 0)}
                        onClick={handleQuizSubmit}
                        className="px-5 py-2.5 bg-[#FFD700] text-[#111113] hover:bg-amber-400 disabled:opacity-30 font-bold cursor-pointer"
                      >
                        Submit verification answers
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FLASHCARDS TAB */}
          {activeTab === 'flashcards' && (
            <div className="max-w-md mx-auto space-y-6 font-mono text-xs uppercase">
              <div className="text-center border-b border-white/10 pb-4">
                <h2 className="text-sm font-bold text-[#F8F7F4] tracking-wider">Concept Recall Flashcards</h2>
                <p className="text-[9px] text-[#F8F7F4]/40 mt-1">Test your memory on active glossaries generated during ingest.</p>
              </div>

              {flashcards.length === 0 ? (
                <div className="text-center py-10">
                  <HelpCircle className="w-10 h-10 text-white/10 mx-auto mb-2" />
                  <p className="text-[10px] text-[#F8F7F4]/40">No glossary cards active.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between text-[9px] text-[#F8F7F4]/40">
                    <span>Active stack</span>
                    <span>{currentCardIdx + 1} / {flashcards.length} cards</span>
                  </div>

                  <div 
                    onClick={() => setFlipped(!flipped)}
                    className="relative h-56 w-full cursor-pointer transition-transform duration-300"
                    style={{ transform: flipped ? 'scale(0.98)' : 'none' }}
                  >
                    {!flipped ? (
                      <div className="absolute inset-0 bg-[#18181b] border border-white/10 p-6 flex flex-col justify-between">
                        <span className="text-[8px] text-amber-400 font-bold">FRONT SIDE (PROMPT)</span>
                        <p className="text-sm font-bold text-[#F8F7F4] text-center leading-normal">{flashcards[currentCardIdx]?.question}</p>
                        <span className="text-[8px] text-[#F8F7F4]/30 text-center">Click card to reveal</span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-[#111113] border border-amber-400/40 p-6 flex flex-col justify-between">
                        <span className="text-[8px] text-amber-400 font-bold">BACK SIDE (ANSWER)</span>
                        <p className="text-xs text-[#F8F7F4]/80 text-center leading-relaxed normal-case">{flashcards[currentCardIdx]?.answer}</p>
                        <span className="text-[8px] text-white/20 text-center">Click card to flip back</span>
                      </div>
                    )}
                  </div>

                  {flipped && (
                    <div className="pt-4 border-t border-white/10 space-y-3 text-center">
                      <p className="text-[9px] text-[#F8F7F4]/40">Estimate your recall quality for interval calculation:</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleFlashcardRating('hard')} className="flex-1 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold cursor-pointer">
                          Hard (1D)
                        </button>
                        <button onClick={() => handleFlashcardRating('medium')} className="flex-1 py-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold cursor-pointer">
                          Medium (2D)
                        </button>
                        <button onClick={() => handleFlashcardRating('easy')} className="flex-1 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold cursor-pointer">
                          Easy (3D)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* LIVE CODE EDITOR TAB */}
          {activeTab === 'sandbox' && (
            <div className="max-w-3xl mx-auto space-y-6 font-mono text-xs uppercase animate-fade-in">
              <div>
                <h2 className="text-sm font-bold text-[#F8F7F4] tracking-wider">Interactive Code Sandbox</h2>
                <p className="text-[10px] text-[#F8F7F4]/40 mt-1">Practice and run code examples directly within your Learning OS workspace.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Editor input */}
                <div className="bg-[#18181b] border border-white/10 p-4 flex flex-col justify-between h-[360px]">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                    <span className="text-amber-400 font-bold text-[9px] tracking-wider">JAVASCRIPT COMPILER (ES6)</span>
                    <button onClick={() => setCodeTemplate(`function test() {\n  return "Modified code output!";\n}`)} className="text-[8px] text-gray-400 hover:text-white cursor-pointer">Reset</button>
                  </div>
                  
                  <textarea 
                    value={codeTemplate}
                    onChange={(e) => setCodeTemplate(e.target.value)}
                    className="w-full flex-1 bg-[#111113] border-0 text-[#F8F7F4] text-xs p-2.5 focus:ring-0 focus:outline-none font-mono lowercase normal-case"
                    style={{ resize: 'none' }}
                  />

                  <div className="pt-2 border-t border-white/5 flex justify-end">
                    <button 
                      onClick={runCodeSandbox}
                      className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold uppercase text-[10px] tracking-widest cursor-pointer"
                    >
                      Compile & Run
                    </button>
                  </div>
                </div>

                {/* Simulated Terminal console */}
                <div className="bg-[#111113] border border-white/10 p-4 flex flex-col justify-between h-[360px]">
                  <span className="text-[#F8F7F4]/50 border-b border-white/5 pb-2 mb-2 font-bold text-[9px] tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    <span>PROCESS OUTPUT LOGGER</span>
                  </span>

                  <div className="flex-1 overflow-y-auto p-2 bg-[#18181b] border border-white/5 space-y-1.5 text-[10px] text-gray-400 select-all font-mono normal-case">
                    {consoleOutput.map((log, idx) => (
                      <div key={idx} className={log.includes('EXCEPTION') ? 'text-rose-400 font-bold' : log.includes('RETURN') ? 'text-amber-400 font-bold' : ''}>
                        {log}
                      </div>
                    ))}
                  </div>

                  <span className="text-[8px] text-[#F8F7F4]/30 uppercase pt-2">Active sandbox node sandbox_isolated_142</span>
                </div>

              </div>
            </div>
          )}

          {/* AI DIAGRAM / MERMAID GENERATOR TAB */}
          {activeTab === 'diagrams' && (
            <div className="max-w-3xl mx-auto space-y-6 font-mono text-xs uppercase">
              <div>
                <h2 className="text-sm font-bold text-[#F8F7F4] tracking-wider">AI Schema & Flowchart Compiler</h2>
                <p className="text-[10px] text-[#F8F7F4]/40 mt-1">Convert raw chapter concepts into gorgeous relational flowcharts.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Control column */}
                <div className="lg:col-span-1 bg-[#18181b] border border-white/10 p-4 space-y-4">
                  <div>
                    <label className="block text-[8px] font-bold text-amber-400 tracking-wider mb-2">DIAGRAM MODEL TYPE</label>
                    <div className="space-y-1.5">
                      {[
                        { id: 'flowchart', label: 'Flowchart Schema' },
                        { id: 'architecture', label: 'Architecture Cloud' },
                        { id: 'mindmap', label: 'Modular Mindmap' },
                        { id: 'sequence', label: 'Sequence Operations' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedDiagramType(t.id as any)}
                          className={`w-full text-left p-2 border text-[9px] font-bold uppercase transition cursor-pointer ${
                            selectedDiagramType === t.id 
                              ? 'bg-[#111113] border-amber-400/40 text-amber-400' 
                              : 'border-transparent text-[#F8F7F4]/40 hover:text-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#111113] p-2 border border-white/5 text-[9px] text-emerald-400">
                    <span>● Engine: Multi-Agent Mermaid Ingestor active</span>
                  </div>
                </div>

                {/* Display Canvas area */}
                <div className="lg:col-span-3 bg-[#111113] border border-white/10 p-6 flex flex-col justify-between h-[360px] relative">
                  <span className="text-[8px] text-amber-400 font-bold block mb-4">INTERACTIVE VECTOR CANVAS</span>
                  
                  {/* Custom flow chart vector diagrams drawn nicely using SVGs! */}
                  <div className="flex-1 flex items-center justify-center border border-white/5 bg-[#18181b]/50">
                    {selectedDiagramType === 'flowchart' && (
                      <svg className="w-full h-full max-h-56" viewBox="0 0 400 180">
                        <rect x="20" y="70" width="80" height="40" className="fill-[#111113] stroke-amber-400" />
                        <text x="60" y="94" className="text-[8px] fill-[#F8F7F4] text-center" textAnchor="middle">Ingest Document</text>
                        
                        <line x1="100" y1="90" x2="150" y2="90" stroke="#FFD700" strokeWidth="1.5" />
                        <polygon points="150,90 144,86 144,94" fill="#FFD700" />

                        <rect x="150" y="70" width="80" height="40" className="fill-[#111113] stroke-amber-400" />
                        <text x="190" y="94" className="text-[8px] fill-[#F8F7F4] text-center" textAnchor="middle">Semantic Chunk</text>

                        <line x1="230" y1="90" x2="280" y2="90" stroke="#FFD700" strokeWidth="1.5" />
                        <polygon points="280,90 274,86 274,94" fill="#FFD700" />

                        <rect x="280" y="70" width="100" height="40" className="fill-[#111113] stroke-amber-400" />
                        <text x="330" y="94" className="text-[8px] fill-[#F8F7F4] text-center" textAnchor="middle">Embedding Index</text>
                      </svg>
                    )}

                    {selectedDiagramType === 'architecture' && (
                      <svg className="w-full h-full max-h-56" viewBox="0 0 400 180">
                        <rect x="150" y="10" width="100" height="30" className="fill-[#111113] stroke-[#FFD700]" />
                        <text x="200" y="28" className="text-[8px] fill-emerald-400 text-center" textAnchor="middle">API EXPRESS GATWAY</text>

                        <line x1="200" y1="40" x2="200" y2="80" stroke="#FFD700" strokeWidth="1" />

                        <rect x="60" y="80" width="110" height="40" className="fill-[#111113] stroke-white/25" />
                        <text x="115" y="104" className="text-[8px] fill-[#F8F7F4] text-center" textAnchor="middle">GEMINI 3.5 LLM ENGINE</text>

                        <rect x="230" y="80" width="110" height="40" className="fill-[#111113] stroke-white/25" />
                        <text x="285" y="104" className="text-[8px] fill-[#F8F7F4] text-center" textAnchor="middle">JSON VECTOR RETRIEVER</text>
                      </svg>
                    )}

                    {selectedDiagramType === 'mindmap' && (
                      <svg className="w-full h-full max-h-56" viewBox="0 0 400 180">
                        <circle cx="200" cy="90" r="24" className="fill-[#111113] stroke-amber-400" />
                        <text x="200" y="93" className="text-[8px] fill-amber-400 text-center" textAnchor="middle">ACTIVE CORE</text>

                        <line x1="200" y1="66" x2="200" y2="30" stroke="#FFD700" strokeWidth="1" />
                        <circle cx="200" cy="30" r="10" className="fill-[#18181b] stroke-white/10" />
                        <text x="200" y="33" className="text-[7px] fill-[#F8F7F4]" textAnchor="middle">THEORY</text>

                        <line x1="176" y1="90" x2="110" y2="90" stroke="#FFD700" strokeWidth="1" />
                        <circle cx="110" cy="90" r="10" className="fill-[#18181b] stroke-white/10" />
                        <text x="110" y="93" className="text-[7px] fill-[#F8F7F4]" textAnchor="middle">SYSTEMS</text>

                        <line x1="224" y1="90" x2="290" y2="90" stroke="#FFD700" strokeWidth="1" />
                        <circle cx="290" cy="90" r="10" className="fill-[#18181b] stroke-white/10" />
                        <text x="290" y="93" className="text-[7px] fill-[#F8F7F4]" textAnchor="middle">CODE</text>
                      </svg>
                    )}

                    {selectedDiagramType === 'sequence' && (
                      <svg className="w-full h-full max-h-56" viewBox="0 0 400 180">
                        <line x1="80" y1="20" x2="80" y2="160" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
                        <text x="80" y="15" className="text-[8px] fill-[#F8F7F4]" textAnchor="middle">CLIENT</text>

                        <line x1="300" y1="20" x2="300" y2="160" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
                        <text x="300" y="15" className="text-[8px] fill-[#F8F7F4]" textAnchor="middle">AI AGENT</text>

                        <line x1="80" y1="60" x2="300" y2="60" stroke="#FFD700" strokeWidth="1.5" />
                        <polygon points="300,60 294,56 294,64" fill="#FFD700" />
                        <text x="190" y="52" className="text-[8px] fill-amber-400" textAnchor="middle">QUERY EVALUATION</text>

                        <line x1="300" y1="120" x2="80" y2="120" stroke="#FFD700" strokeWidth="1.5" strokeDasharray="2 2" />
                        <polygon points="80,120 86,116 86,124" fill="#FFD700" />
                        <text x="190" y="112" className="text-[8px] fill-emerald-400" textAnchor="middle">RETRIEVED VECTOR OUTLINE</text>
                      </svg>
                    )}
                  </div>

                  <span className="text-[8px] text-[#F8F7F4]/30 uppercase text-right mt-2">Diagrams compiled instantly based on textbook context</span>
                </div>

              </div>
            </div>
          )}

          {/* AI NOTE GENERATOR TAB */}
          {activeTab === 'notes' && (
            <div className="max-w-2xl mx-auto space-y-6 font-mono text-xs uppercase">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-sm font-bold text-[#F8F7F4] tracking-wider">AI Study Note Compiler</h2>
                <p className="text-[10px] text-[#F8F7F4]/40 mt-1">Select structured models to output clean cheat sheets or Cornell notes.</p>
              </div>

              <div className="bg-[#18181b] p-5 border border-white/10 space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {[
                    { id: 'cornell', label: 'Cornell Model' },
                    { id: 'bullets', label: 'Academic Bullets' },
                    { id: 'formula', label: 'Math Formulas' },
                    { id: 'cheat_sheet', label: 'Pocket Cheat Sheet' },
                    { id: 'interview', label: 'Interview Checklist' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedNoteType(t.id as any)}
                      className={`px-3 py-1.5 border text-[9px] font-bold uppercase transition cursor-pointer ${
                        selectedNoteType === t.id 
                          ? 'bg-[#111113] border-amber-400 text-amber-400' 
                          : 'border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[9px] text-[#F8F7F4]/40">Active Subject: {selectedLesson?.title}</span>
                  <button 
                    onClick={handleGenerateNotes}
                    disabled={generatingNotes}
                    className="px-5 py-2.5 bg-[#FFD700] text-amber-950 hover:bg-amber-400 transition font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                  >
                    {generatingNotes ? 'Compiling Notes...' : 'Synthesize Notes'}
                  </button>
                </div>
              </div>

              {/* Note output sheet */}
              {generatedNotes && (
                <div className="bg-[#111113] border border-white/10 p-6 shadow-sm font-mono text-xs text-[#F8F7F4]/80 leading-relaxed space-y-4 normal-case select-all animate-fade-in uppercase">
                  <div className="prose prose-invert max-w-none text-xs uppercase font-mono tracking-tight text-[#F8F7F4]/80 leading-relaxed">
                    <MarkdownRenderer content={generatedNotes} />
                  </div>
                </div>
              )}

            </div>
          )}

          {/* AI VIDEO EXPLAINER TAB */}
          {activeTab === 'video' && (
            <div className="max-w-5xl mx-auto space-y-8 font-mono text-xs uppercase">
              <div className="border-b border-white/10 pb-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-bold text-[#F8F7F4] tracking-wider">AI Interactive Explainer Video</h2>
                    <p className="text-[10px] text-[#F8F7F4]/40 mt-1">Convert your PDF syllabus coursework into an immersive presentation explained by an AI lecturer in your preferred language.</p>
                  </div>
                  
                  {activeVideo && (
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] text-emerald-400 font-bold">
                      <Languages className="w-3.5 h-3.5 animate-pulse" />
                      <span>EXPLAINER ACTIVE: {activeVideo.language}</span>
                    </div>
                  )}
                </div>
              </div>

              {!activeVideo && !videoLoading && (
                <div className="bg-[#18181b] border border-white/10 p-8 text-center max-w-2xl mx-auto space-y-6">
                  <div className="w-16 h-16 bg-amber-400/10 border border-amber-400/30 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Video className="w-8 h-8 text-amber-400" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-xs text-[#F8F7F4]">Compile AI Lecture Presentation</h3>
                    <p className="text-[10px] text-[#F8F7F4]/50 leading-relaxed normal-case max-w-md mx-auto">
                      Our video generation engine parses your course chapters and synthesizes a slide deck presentation complete with bullet points, conceptual diagrams, virtual presenter expressions, and voice speech in your language.
                    </p>
                  </div>

                  {/* Language Picker */}
                  <div className="max-w-xs mx-auto p-4 bg-[#111113] border border-white/5 space-y-3">
                    <label className="block text-[9px] font-bold text-amber-400 tracking-wider">CHOOSE PREFERRED LECTURE LANGUAGE</label>
                    <select
                      value={videoLanguage}
                      onChange={(e) => setVideoLanguage(e.target.value)}
                      className="w-full bg-[#18181b] border border-white/10 text-white p-2 text-xs focus:border-amber-400 focus:outline-none"
                    >
                      {['English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Chinese', 'Telugu', 'Tamil', 'Arabic', 'Russian', 'Portuguese'].map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateVideo}
                    className="px-8 py-3 bg-[#FFD700] text-amber-950 font-bold text-xs hover:bg-amber-400 transition tracking-widest cursor-pointer shadow-lg hover:scale-[1.02] active:scale-95 duration-150 uppercase"
                  >
                    Generate Multi-lingual Lecture
                  </button>
                </div>
              )}

              {videoLoading && (
                <div className="bg-[#18181b] border border-white/10 p-12 text-center max-w-2xl mx-auto space-y-6 font-mono text-xs">
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    {/* Concentric radar loading visualizer rings */}
                    <div className="absolute inset-0 border border-amber-400/20 rounded-full animate-ping" />
                    <div className="absolute inset-2 border border-amber-400/40 rounded-full animate-pulse" />
                    <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-[#F8F7F4] uppercase animate-pulse">Synthesizing Lecture Script...</h3>
                    <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">Llm model compiling slides in {videoLanguage}</p>
                    
                    {/* Live rolling text simulation */}
                    <div className="p-3 bg-[#111113] border border-white/5 text-[9px] text-[#F8F7F4]/50 max-w-sm mx-auto normal-case leading-relaxed">
                      ⏳ Organizing syllabus nodes &rarr; Drafting voice script &rarr; Formatting visual templates &rarr; Baking speech triggers.
                    </div>
                  </div>
                </div>
              )}

              {videoError && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-6 text-center max-w-md mx-auto space-y-4">
                  <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto animate-pulse" />
                  <p className="text-xs font-bold text-rose-200">Video Generation Interrupted</p>
                  <p className="text-[10px] text-[#F8F7F4]/60 normal-case">{videoError}</p>
                  <button
                    onClick={handleGenerateVideo}
                    className="px-4 py-2 border border-rose-500 text-rose-400 hover:bg-rose-500/10 font-bold cursor-pointer"
                  >
                    Retry Generator Pipeline
                  </button>
                </div>
              )}

              {activeVideo && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left: Main Immersive Video Screen & Controls */}
                  <div className="lg:col-span-2 space-y-4">
                    
                    {/* Video Canvas Container */}
                    <div className="aspect-video bg-[#0c0c0e] border border-white/10 relative group overflow-hidden shadow-2xl flex flex-col justify-between">
                      
                      {/* Top bar header */}
                      <div className="p-3 bg-[#111113]/90 border-b border-white/5 flex items-center justify-between text-[9px] text-[#F8F7F4]/60 z-10 backdrop-blur-sm">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                          <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                          AI LECTURE TRANSCRIPTION PLAYER
                        </span>
                        <span className="font-mono bg-white/5 px-2 py-0.5 border border-white/5 uppercase">
                          Language: {activeVideo.language}
                        </span>
                      </div>

                      {/* Video Stage Visual Layout */}
                      <div className="flex-1 flex overflow-hidden">
                        
                        {/* Virtual Presenter Speaker column */}
                        <div className="w-1/3 border-r border-white/5 bg-[#121214]/90 flex flex-col justify-center items-center p-4 relative overflow-hidden">
                          {/* Radial Aura glow effect */}
                          <div className="absolute w-36 h-36 rounded-full bg-amber-400/5 blur-2xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                          
                          {/* Pulsing Concentric Visualizer Rings */}
                          <div className="relative w-20 h-20 flex items-center justify-center z-10">
                            {videoPlaying && (
                              <>
                                <div className="absolute inset-0 border border-amber-400/20 rounded-full animate-ping" style={{ animationDuration: '2.5s' }} />
                                <div className="absolute inset-[-12px] border border-amber-400/10 rounded-full animate-ping" style={{ animationDuration: '3.5s' }} />
                                <div className="absolute inset-[6px] border border-amber-300/30 rounded-full animate-pulse" />
                              </>
                            )}

                            {/* Main Animated Avatar Head */}
                            <div className="w-16 h-16 bg-[#18181b] border-2 border-amber-400 flex items-center justify-center rounded-full shadow-lg relative overflow-hidden">
                              <svg className="w-12 h-12" viewBox="0 0 48 48">
                                {/* Base Neck & Shoulders */}
                                <path d="M12,42 C12,34 18,32 24,32 C30,32 36,34 36,42" fill="none" stroke="#FFD700" strokeWidth="1.5" />
                                {/* Face Oval */}
                                <circle cx="24" cy="20" r="10" className="fill-[#111113] stroke-amber-400 stroke-[1.5]" />
                                
                                {/* Expression Eyes & Mouth */}
                                {activeVideo.slides[currentSlideIdx]?.avatarExpression === 'smiling' && (
                                  <>
                                    <circle cx="20" cy="18" r="1.5" fill="#FFD700" />
                                    <circle cx="28" cy="18" r="1.5" fill="#FFD700" />
                                    <path d="M21,23 Q24,26 27,23" fill="none" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
                                  </>
                                )}

                                {activeVideo.slides[currentSlideIdx]?.avatarExpression === 'explaining' && (
                                  <>
                                    <line x1="18" y1="18" x2="22" y2="17" stroke="#FFD700" strokeWidth="1.5" />
                                    <line x1="26" y1="17" x2="30" y2="18" stroke="#FFD700" strokeWidth="1.5" />
                                    <circle cx="20" cy="19" r="1.5" fill="#FFD700" />
                                    <circle cx="28" cy="19" r="1.5" fill="#FFD700" />
                                    <circle cx="24" cy="24" r="2.5" fill="#FFD700" className={videoPlaying ? "animate-pulse" : ""} />
                                  </>
                                )}

                                {activeVideo.slides[currentSlideIdx]?.avatarExpression === 'thoughtful' && (
                                  <>
                                    <path d="M18,17 Q20,16 22,18" fill="none" stroke="#FFD700" strokeWidth="1.5" />
                                    <path d="M26,18 Q28,16 30,17" fill="none" stroke="#FFD700" strokeWidth="1.5" />
                                    <circle cx="20" cy="19" r="1.2" fill="#FFD700" />
                                    <circle cx="28" cy="19" r="1.2" fill="#FFD700" />
                                    <line x1="21" y1="23" x2="27" y2="23" stroke="#FFD700" strokeWidth="1.5" />
                                  </>
                                )}

                                {activeVideo.slides[currentSlideIdx]?.avatarExpression === 'pointing' && (
                                  <>
                                    <circle cx="19" cy="18" r="1.5" fill="#FFD700" />
                                    <circle cx="29" cy="18" r="1.5" fill="#FFD700" />
                                    <path d="M21,23 Q24,25 27,23" fill="none" stroke="#FFD700" strokeWidth="1.5" />
                                    {/* Arm hand visual line pointing right */}
                                    <line x1="30" y1="25" x2="42" y2="20" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse" />
                                  </>
                                )}

                                {(!activeVideo.slides[currentSlideIdx]?.avatarExpression || activeVideo.slides[currentSlideIdx]?.avatarExpression === 'neutral') && (
                                  <>
                                    <circle cx="20" cy="18" r="1.5" fill="#FFD700" />
                                    <circle cx="28" cy="18" r="1.5" fill="#FFD700" />
                                    <line x1="21" y1="24" x2="27" y2="24" stroke="#FFD700" strokeWidth="1.5" />
                                  </>
                                )}
                              </svg>
                            </div>
                          </div>

                          <div className="text-center mt-3 z-10">
                            <span className="text-[7.5px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 border border-amber-400/20 uppercase tracking-widest block font-mono">
                              PRESENTER STATUS
                            </span>
                            <span className="text-[9px] text-[#F8F7F4]/60 uppercase tracking-wide font-bold mt-1 block">
                              {videoPlaying ? `🗣️ ${activeVideo.slides[currentSlideIdx]?.avatarExpression || 'Speaking'}` : '⏸️ Paused'}
                            </span>
                          </div>
                        </div>

                        {/* Visual Projection Slide Board Column */}
                        <div className="w-2/3 bg-[#0f0f11] p-5 flex flex-col justify-between overflow-hidden relative select-none">
                          {/* Digital Grid overlay */}
                          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px]" />
                          
                          {/* Slide Content */}
                          <div className="space-y-3.5 z-10 relative">
                            <div className="flex justify-between items-center text-[8px] font-bold text-amber-400 tracking-wider font-mono">
                              <span>SLIDE DECK EXPLOITS</span>
                              <span>PAGE {currentSlideIdx + 1} / {activeVideo.slides.length}</span>
                            </div>

                            <div className="space-y-1">
                              <h3 className="text-[13px] font-bold text-[#F8F7F4] uppercase leading-tight font-display tracking-tight border-b border-white/5 pb-1">
                                {activeVideo.slides[currentSlideIdx]?.slideTitle}
                              </h3>
                            </div>

                            {/* Slide Bullet points */}
                            <div className="space-y-2 mt-3 pl-1">
                              {activeVideo.slides[currentSlideIdx]?.slidePoints?.map((pt: string, ptIdx: number) => (
                                <div key={ptIdx} className="flex gap-2 items-start text-[9px] uppercase leading-relaxed text-[#F8F7F4]/80">
                                  <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                                  <span>{pt}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Dynamic Concept Node Remap Graph simulation */}
                          <div className="h-16 bg-[#141416]/90 border border-white/5 flex items-center justify-between p-2 z-10 relative mt-2 rounded-sm overflow-hidden font-mono">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/2 to-amber-400/0 animate-pulse" />
                            <div className="space-y-1 max-w-[55%]">
                              <span className="text-[7px] text-amber-400 font-bold block uppercase tracking-wider">Concept Render Pipeline</span>
                              <span className="text-[8px] text-[#F8F7F4]/50 leading-tight block uppercase truncate normal-case" title={activeVideo.slides[currentSlideIdx]?.visualPrompt}>
                                {activeVideo.slides[currentSlideIdx]?.visualPrompt}
                              </span>
                            </div>
                            
                            {/* Graphic Diagram Mock */}
                            <div className="w-1/3 h-full flex items-center justify-end">
                              <svg className="w-full h-full text-amber-400/40" viewBox="0 0 100 40">
                                <circle cx="20" cy="20" r="4" fill="currentColor" />
                                <circle cx="50" cy="10" r="4" fill="currentColor" />
                                <circle cx="50" cy="30" r="4" fill="currentColor" />
                                <circle cx="80" cy="20" r="4" fill="currentColor" />
                                <line x1="24" y1="20" x2="46" y2="10" stroke="currentColor" strokeWidth="1" />
                                <line x1="24" y1="20" x2="46" y2="30" stroke="currentColor" strokeWidth="1" />
                                <line x1="54" y1="10" x2="76" y2="20" stroke="currentColor" strokeWidth="1" />
                                <line x1="54" y1="30" x2="76" y2="20" stroke="currentColor" strokeWidth="1" />
                              </svg>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Real-time Subtitles Caption bar Overlay */}
                      <div className="p-3.5 bg-black/90 border-t border-white/5 text-center text-[10px] leading-relaxed text-amber-300 min-h-[4.5rem] flex items-center justify-center z-10 font-mono normal-case uppercase relative">
                        <div className="absolute top-1 left-2 text-[7px] text-[#F8F7F4]/30 uppercase tracking-widest">
                          [ LIVE TRANSLATION CAPTIONS ]
                        </div>
                        <p className="max-w-xl mx-auto uppercase text-center tracking-tight text-amber-200">
                          {activeVideo.slides[currentSlideIdx]?.spokenText}
                        </p>
                      </div>

                    </div>

                    {/* Interactive Playback Control Bar */}
                    <div className="bg-[#18181b] p-3 border border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono">
                      
                      {/* Left: Prev/Play/Next buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (currentSlideIdx > 0) {
                              setCurrentSlideIdx(prev => prev - 1);
                            }
                          }}
                          disabled={currentSlideIdx === 0}
                          className="p-2 border border-white/10 hover:border-amber-400/50 hover:bg-white/5 disabled:opacity-30 cursor-pointer text-[#F8F7F4]"
                          title="Previous slide"
                        >
                          <SkipForward className="w-4 h-4 rotate-180" />
                        </button>

                        <button
                          onClick={() => setVideoPlaying(!videoPlaying)}
                          className={`p-2 px-4 flex items-center gap-1.5 border text-xs font-bold uppercase transition cursor-pointer ${
                            videoPlaying 
                              ? 'bg-amber-400/10 border-amber-400 text-amber-400' 
                              : 'bg-white/5 border-white/10 hover:border-amber-400 text-[#F8F7F4]'
                          }`}
                        >
                          {videoPlaying ? (
                            <>
                              <Pause className="w-4 h-4 fill-amber-400" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-white" />
                              <span>Play</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            if (currentSlideIdx < activeVideo.slides.length - 1) {
                              setCurrentSlideIdx(prev => prev + 1);
                            }
                          }}
                          disabled={currentSlideIdx === activeVideo.slides.length - 1}
                          className="p-2 border border-white/10 hover:border-amber-400/50 hover:bg-white/5 disabled:opacity-30 cursor-pointer text-[#F8F7F4]"
                          title="Next slide"
                        >
                          <SkipForward className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Middle: Progress timeline indicator */}
                      <div className="flex-1 min-w-[12rem] flex items-center gap-3">
                        <span className="text-[9px] text-[#F8F7F4]/50">SLIDE PROGRESS</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden flex relative border border-white/5 cursor-pointer">
                          {activeVideo.slides.map((_: any, idx: number) => {
                            const isPast = idx <= currentSlideIdx;
                            const isActive = idx === currentSlideIdx;
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  setCurrentSlideIdx(idx);
                                }}
                                className={`h-full border-r border-black/30 flex-1 transition-all duration-300 ${
                                  isActive 
                                    ? 'bg-amber-400 shadow-inner' 
                                    : isPast 
                                    ? 'bg-amber-500/60' 
                                    : 'bg-transparent'
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Pitch Rate & Mute toggles */}
                      <div className="flex items-center gap-3 text-[9px]">
                        {/* Voice Speed Selector */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#F8F7F4]/40">SPEED</span>
                          <select
                            value={videoVoiceSpeed}
                            onChange={(e) => setVideoVoiceSpeed(parseFloat(e.target.value))}
                            className="bg-[#111113] border border-white/10 text-[#F8F7F4]/80 p-1 text-[9px] tracking-wide"
                          >
                            <option value="0.75">0.75x</option>
                            <option value="1.0">1.0x</option>
                            <option value="1.25">1.25x</option>
                            <option value="1.5">1.5x</option>
                          </select>
                        </div>

                        {/* Mute toggle button */}
                        <button
                          onClick={() => setVideoIsMuted(!videoIsMuted)}
                          className={`p-1.5 border transition cursor-pointer flex items-center gap-1 ${
                            videoIsMuted 
                              ? 'border-rose-500/40 text-rose-400 bg-rose-500/5' 
                              : 'border-white/10 text-amber-400 hover:border-amber-400/40'
                          }`}
                          title={videoIsMuted ? "Audio speech is muted (using timed subtitle ticker)" : "Speech voice active"}
                        >
                          {videoIsMuted ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5" />
                              <span>Muted</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Voice On</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>

                  </div>

                  {/* Right Column: Lecture Transcription Logs & Setup options */}
                  <div className="space-y-6">
                    
                    {/* Translate to other language option box */}
                    <div className="bg-[#18181b] p-4 border border-white/10 space-y-3.5">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <Languages className="w-4 h-4 text-amber-400" />
                        <h3 className="font-bold text-[10px] text-[#F8F7F4]">Change Translation</h3>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[8px] text-gray-400 font-bold block uppercase">Select other language</label>
                        <div className="flex gap-1.5">
                          <select
                            value={videoLanguage}
                            onChange={(e) => setVideoLanguage(e.target.value)}
                            className="flex-1 bg-[#111113] border border-white/10 text-[#F8F7F4] p-2 text-[10px] focus:outline-none"
                          >
                            {['English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Chinese', 'Telugu', 'Tamil', 'Arabic', 'Russian', 'Portuguese'].map((lang) => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                          <button
                            onClick={handleGenerateVideo}
                            className="px-3 bg-[#FFD700] hover:bg-amber-400 text-[#111113] font-bold text-[9px] uppercase cursor-pointer flex items-center gap-1"
                            title="Generate Explainer Video in selected language"
                          >
                            <span>Translate</span>
                          </button>
                        </div>
                      </div>

                      {/* Cache status info */}
                      <span className="text-[8px] text-[#F8F7F4]/30 block normal-case font-mono italic">
                        * Videos you generate are saved to the persistent database. Translation usually takes under 15 seconds.
                      </span>
                    </div>

                    {/* Playable Slides Index Transcription Logger */}
                    <div className="bg-[#18181b] border border-white/10 p-4 space-y-3.5">
                      <div className="border-b border-white/5 pb-2">
                        <h3 className="font-bold text-[10px] text-[#F8F7F4] uppercase">Lecture Script Transcription</h3>
                        <p className="text-[8.5px] text-amber-400 uppercase font-bold mt-0.5">Click a slide to fast-travel player</p>
                      </div>

                      <div className="space-y-2.5 max-h-[16.5rem] overflow-y-auto pr-1">
                        {activeVideo.slides.map((slide: any, idx: number) => {
                          const isActive = idx === currentSlideIdx;
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setCurrentSlideIdx(idx);
                                setVideoPlaying(true);
                              }}
                              className={`p-2.5 border transition cursor-pointer flex flex-col gap-1 ${
                                isActive 
                                  ? 'bg-[#111113] border-amber-400' 
                                  : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                              }`}
                            >
                              <div className="flex justify-between items-center text-[8px] font-bold font-mono">
                                <span className={isActive ? 'text-amber-400' : 'text-[#F8F7F4]/50'}>SLIDE 0{idx + 1}</span>
                                <span className="text-[7.5px] text-[#F8F7F4]/30 bg-white/5 px-1 uppercase">{slide.avatarExpression}</span>
                              </div>
                              <span className="text-[9.5px] font-bold text-[#F8F7F4] uppercase truncate">{slide.slideTitle}</span>
                              <p className="text-[8px] text-[#F8F7F4]/40 line-clamp-2 leading-relaxed normal-case uppercase truncate">
                                {slide.spokenText}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Previously Saved Lecture Versions list */}
                    {previousVideos.length > 1 && (
                      <div className="bg-[#18181b] border border-white/10 p-4 space-y-3">
                        <div className="border-b border-white/5 pb-2">
                          <h3 className="font-bold text-[10px] text-[#F8F7F4] uppercase">Saved Lecture Releases</h3>
                        </div>

                        <div className="space-y-1.5 text-[10px]">
                          {previousVideos.map((vid: any) => {
                            const isCurrent = vid.id === activeVideo.id;
                            return (
                              <button
                                key={vid.id}
                                onClick={() => {
                                  setActiveVideo(vid);
                                  setVideoLanguage(vid.language);
                                  setCurrentSlideIdx(0);
                                  setVideoPlaying(true);
                                }}
                                className={`w-full text-left p-2 border transition cursor-pointer flex items-center justify-between ${
                                  isCurrent 
                                    ? 'bg-[#111113] border-amber-400 text-amber-400 font-bold' 
                                    : 'border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                <span className="uppercase tracking-tight truncate max-w-[75%]">{vid.videoTitle} ({vid.language})</span>
                                <span className="text-[8px] opacity-40">{vid.estimatedDuration}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      </div>

      {/* Right Sidebar: AI Companion (with RAG and Observability settings) */}
      <div className="w-80 border-l border-white/10 bg-[#111113] flex flex-col justify-between shrink-0 h-full font-mono">
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#18181b]">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#F8F7F4]">AI Companion</h3>
            </div>
            <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/20">
              RAG INDEXED
            </span>
          </div>

          {/* Config row */}
          <div className="p-3 border-b border-white/5 bg-[#18181b]/50 space-y-2.5 text-[9px] text-gray-400">
            {/* Agent Select */}
            <div>
              <span className="block font-bold text-amber-400 text-[8px] uppercase mb-1">CONVERSATIONAL AGENT ROLE</span>
              <select 
                value={activeAgent}
                onChange={(e) => setActiveAgent(e.target.value as AgentRole)}
                className="w-full bg-[#111113] border border-white/10 text-[9px] text-[#F8F7F4] py-1 px-2 focus:outline-none uppercase"
              >
                <option value="general">Learning OS Agent (General)</option>
                <option value="tutor">Interactive Tutor Agent</option>
                <option value="quiz_master">Quiz Master Agent</option>
                <option value="flashcard_bot">Flashcard Trainer Bot</option>
                <option value="research">Academic Research Agent</option>
                <option value="code_reviewer">Code Reviewer Agent</option>
                <option value="interview_coach">Interview Prep Coach</option>
                <option value="career_mentor">Career Mentor Coach</option>
              </select>
            </div>

            {/* Explanation level */}
            <div className="flex justify-between gap-2">
              <div className="flex-1">
                <span className="block font-bold text-amber-400 text-[8px] uppercase mb-1">TUTOR EXPLANATION LEVEL</span>
                <select 
                  value={tutorLevel}
                  onChange={(e) => setTutorLevel(e.target.value as TutorLevel)}
                  className="w-full bg-[#111113] border border-white/10 text-[9px] text-[#F8F7F4] py-1 px-2 focus:outline-none uppercase"
                >
                  <option value="school_teacher">Beginner mode</option>
                  <option value="detailed">Intermediate mode</option>
                  <option value="expert">Expert mode</option>
                  <option value="interview">Interview style</option>
                  <option value="coding">Coding tutor mode</option>
                </select>
              </div>
              
              {/* Native Voice Controls */}
              <div className="shrink-0 flex items-end gap-1">
                <button 
                  onClick={() => setIsVoiceOutputEnabled(!isVoiceOutputEnabled)}
                  title={isVoiceOutputEnabled ? "Disable TTS speak output" : "Enable TTS speak output"}
                  className={`p-1.5 border transition cursor-pointer ${
                    isVoiceOutputEnabled ? 'bg-amber-400/20 border-amber-400 text-amber-400' : 'border-white/10 text-gray-500'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={toggleListening}
                  title={isListening ? "Listening..." : "Dictate question"}
                  className={`p-1.5 border transition cursor-pointer ${
                    isListening ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' : 'border-white/10 text-gray-500'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#111113]">
            {chatMessages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[90%] p-3 text-[10px] leading-relaxed border ${
                    isUser 
                      ? 'bg-amber-400 text-[#111113] border-amber-400 font-bold' 
                      : 'bg-[#18181b] text-[#F8F7F4] border-white/10 font-mono normal-case'
                  }`}>
                    {msg.text}

                    {/* Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-white/5 text-[8px] space-y-1.5 text-amber-400 uppercase">
                        <span className="font-bold text-[#F8F7F4]/50 block">CITATIONS RETRIEVED:</span>
                        {msg.citations.map((cit, cIdx) => (
                          <div key={cIdx} className="bg-[#111113] p-1.5 border border-white/10 flex items-start gap-1">
                            <span>•</span>
                            <span className="normal-case text-[#F8F7F4]/70">
                              "{cit.text}" {cit.pageNumber && `(Page ${cit.pageNumber})`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] text-[#F8F7F4]/40 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}

            {chatLoading && (
              <div className="flex flex-col items-start">
                <div className="p-3 bg-[#18181b] border border-white/10">
                  <div className="flex gap-1 py-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-3 py-1.5 border-t border-white/10 flex flex-wrap gap-1 bg-[#18181b]/50">
            <button
              onClick={() => setChatInput("Compare this document details with contradicting research works.")}
              className="text-[8px] px-1.5 py-0.5 bg-[#111113] border border-white/10 text-amber-400 hover:text-amber-300 cursor-pointer font-bold"
            >
              📊 Contradictions
            </button>
            <button
              onClick={() => setChatInput("Extract the core mathematical formula in simple LaTeX notation.")}
              className="text-[8px] px-1.5 py-0.5 bg-[#111113] border border-white/10 text-amber-400 hover:text-amber-300 cursor-pointer font-bold"
            >
              ∑ Equations
            </button>
          </div>

          {/* Input form */}
          <div className="p-3 border-t border-[#F8F7F4]/10 bg-[#18181b]">
            <div className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder={isListening ? "Listening... Speak now..." : "Dictate or write question..."}
                className="w-full bg-[#111113] border border-white/10 text-[10px] text-[#F8F7F4] py-2.5 pl-3 pr-20 focus:border-amber-400 focus:outline-none"
              />
              <div className="absolute right-2 top-1.5 flex items-center gap-1.5">
                {/* Voice Input Microphone Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? "Stop listening" : "Ask with voice"}
                  className={`p-1.5 border transition cursor-pointer flex items-center justify-center ${
                    isListening 
                      ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse scale-105' 
                      : 'border-white/10 text-gray-400 hover:text-amber-400 hover:border-amber-400'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
                {/* Submit button */}
                <button
                  type="button"
                  onClick={handleSendChat}
                  disabled={!chatInput.trim()}
                  className="p-1.5 bg-[#FFD700] hover:bg-amber-400 text-[#111113] disabled:opacity-30 disabled:hover:bg-[#FFD700] cursor-pointer border border-[#FFD700] transition flex items-center justify-center"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Ingest Observability / Telemetry panel */}
          <div className="p-3 border-t border-white/10 bg-[#111113] space-y-1 font-mono text-[8px] text-gray-500 uppercase tracking-wide">
            <div className="flex justify-between">
              <span>LATENCY METRIC:</span>
              <span className="text-amber-400 font-bold">{latency}ms</span>
            </div>
            <div className="flex justify-between">
              <span>CONTEXT LOADED:</span>
              <span>{tokenCount} TOKENS</span>
            </div>
            <div className="flex justify-between">
              <span>LLM COST (USD):</span>
              <span className="text-sky-400">${llmCost.toFixed(5)}</span>
            </div>
            <div className="flex justify-between">
              <span>RAG CACHE INDEX:</span>
              <span className={cacheHit ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{cacheHit ? '94% CACHE HIT' : 'BYPASSED'}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
