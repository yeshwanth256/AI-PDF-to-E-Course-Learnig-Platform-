import React, { useState, useMemo } from 'react';
import { UserStats, Course } from '../types';
import { 
  Briefcase, Award, CheckCircle2, Lock, Play, HelpCircle, 
  ChevronRight, BrainCircuit, ShieldAlert, Sparkles, Trophy, 
  Terminal, Database, Cpu, Smartphone, Activity, Zap
} from 'lucide-react';

interface CareerPathProps {
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  playSound?: (type: 'success' | 'fail' | 'click' | 'laser') => void;
}

export interface CareerNode {
  id: string;
  label: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: 'Language' | 'Database' | 'Architecture' | 'Framework' | 'Algorithm' | 'DevOps';
  desc: string;
  skills: string[];
  hours: number;
  xpReward: number;
  x: number; // Coordinate for SVG pathing (out of 800)
  y: number; // Coordinate for SVG pathing (out of 400)
  dependencies: string[];
  quiz: {
    question: string;
    options: string[];
    answer: number; // Correct index
    explanation: string;
  }[];
}

export interface CareerTrack {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string; // Tailwind tint
  accentColor: string; // RGB or HEX
  nodes: CareerNode[];
}

const CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'data-science',
    title: 'Data Science & AI Engineer',
    subtitle: 'Python, Relational Data, Neural Networks & Large Language Models',
    icon: <Database className="w-4 h-4 text-amber-400" />,
    color: 'amber',
    accentColor: '#fbbf24',
    nodes: [
      {
        id: 'ds-python',
        label: 'Python & R Foundations',
        level: 'Beginner',
        category: 'Language',
        desc: 'Master basic vectors, data frames, matrix calculations, list comprehensions, and functional generators in Python and R.',
        skills: ['Python core', 'R language syntax', 'Memory models', 'Functional Programming'],
        hours: 12,
        xpReward: 50,
        x: 100,
        y: 200,
        dependencies: [],
        quiz: [
          {
            question: 'Which list comprehension compiles a valid list of even squares in Python?',
            options: [
              '[x**2 for x in nums if x % 2 == 0]',
              '[for x in nums x**2 if x % 2 == 0]',
              '[x^2 for x in nums if x % 2 = 0]',
              'map(lambda x: x**2 if x % 2 == 0, nums)'
            ],
            answer: 0,
            explanation: 'In Python, the filter condition comes after the "for" statement, and exponentiation is indicated by "**".'
          },
          {
            question: 'In R, what is the default behavior when adding vectors of unequal lengths?',
            options: [
              'It throws a compile-time Segmentation Fault.',
              'It recycles the shorter vector elements from the beginning.',
              'It appends NA values to match the size.',
              'It throws a runtime OutOfBoundsException.'
            ],
            answer: 1,
            explanation: 'R uses vector recycling, meaning it will repeat the elements of the shorter vector until it matches the longer one.'
          }
        ]
      },
      {
        id: 'ds-sql',
        label: 'Relational DBs & Advanced SQL',
        level: 'Beginner',
        category: 'Database',
        desc: 'Perform complex joins, set operators, subqueries, and filter by grouped aggregations via the HAVING clause.',
        skills: ['Advanced SQL Joins', 'HAVING clause', 'Indexes & Keys', 'Window functions'],
        hours: 15,
        xpReward: 60,
        x: 260,
        y: 100,
        dependencies: ['ds-python'],
        quiz: [
          {
            question: 'Why does "SELECT dept, AVG(pay) FROM staff WHERE AVG(pay) > 50000 GROUP BY dept;" fail in SQL?',
            options: [
              'WHERE filters individual rows before grouping; use HAVING for aggregate filtering.',
              'AVG() cannot be called inside projection SELECT.',
              'GROUP BY must come before WHERE conditions.',
              'WHERE does not support uppercase functions.'
            ],
            answer: 0,
            explanation: 'The WHERE clause operates on individual rows prior to grouping. Aggregate calculations require the HAVING clause after GROUP BY.'
          }
        ]
      },
      {
        id: 'ds-eda',
        label: 'Exploratory Data Analysis',
        level: 'Beginner',
        category: 'Algorithm',
        desc: 'Clean structured sets, perform null values imputation, evaluate covariance, and render plots with D3.js and pandas.',
        skills: ['Pandas & NumPy', 'D3.js visualization', 'Statistical profiling', 'Data Cleansing'],
        hours: 18,
        xpReward: 60,
        x: 260,
        y: 300,
        dependencies: ['ds-python'],
        quiz: [
          {
            question: 'Which method represents a mathematically sound practice for imputing missing values in heavily skewed numerical columns?',
            options: [
              'Imputing with the median value (less affected by outliers).',
              'Imputing with 0 in all cases.',
              'Dropping the entire row whenever a null occurs.',
              'Imputing with the absolute maximum values.'
            ],
            answer: 0,
            explanation: 'The median is robust against extreme outliers, making it a safer imputation choice for skewed distributions compared to the mean.'
          }
        ]
      },
      {
        id: 'ds-supervised',
        label: 'Supervised Learning Models',
        level: 'Intermediate',
        category: 'Architecture',
        desc: 'Configure random forests, support vector machines, gradient boosters, and interpret ROC/AUC and confusion matrices.',
        skills: ['Scikit-Learn', 'Classifier evaluation', 'Cross Validation', 'Hyperparameter tuning'],
        hours: 24,
        xpReward: 80,
        x: 440,
        y: 100,
        dependencies: ['ds-sql', 'ds-eda'],
        quiz: [
          {
            question: 'What metric is optimized when a medical diagnostic system seeks to minimize false negatives (failing to detect disease)?',
            options: [
              'Precision',
              'Recall (Sensitivity)',
              'Specificity',
              'F1-Score'
            ],
            answer: 1,
            explanation: 'Recall is TP / (TP + FN). Minimizing False Negatives maximizes Recall, ensuring diseased patient cases are not missed.'
          }
        ]
      },
      {
        id: 'ds-unsupervised',
        label: 'Unsupervised & Clustering',
        level: 'Intermediate',
        category: 'Algorithm',
        desc: 'Implement K-Means clustering, DBSCAN, and apply PCA (Principal Component Analysis) for dimensional compression.',
        skills: ['K-Means clustering', 'PCA compression', 'Eigenvalue decomposition', 'Anomalies detection'],
        hours: 20,
        xpReward: 80,
        x: 440,
        y: 300,
        dependencies: ['ds-eda'],
        quiz: [
          {
            question: 'Why is it critical to apply feature scaling (e.g., StandardScaler) before performing PCA?',
            options: [
              'PCA is sensitive to variances; columns with larger scale raw numbers will dominate the principal components.',
              'PCA only accepts values bounded strictly between -1 and 1.',
              'Unscaled data throws compiler TypeErrors.',
              'Scaling converts non-linear relationships to linear fields automatically.'
            ],
            answer: 0,
            explanation: 'PCA maximizes variance. If one feature is on a scale of 1000s and another is 0-1, the first dominates the principal components purely due to its raw scale.'
          }
        ]
      },
      {
        id: 'ds-deep',
        label: 'Deep Learning & Transformers',
        level: 'Advanced',
        category: 'Architecture',
        desc: 'Understand neural weights, backpropagation gradients, build custom PyTorch layers, and analyze multi-head self-attention.',
        skills: ['PyTorch tensors', 'Backpropagation mechanics', 'Self-attention logic', 'Transformer architecture'],
        hours: 32,
        xpReward: 120,
        x: 620,
        y: 200,
        dependencies: ['ds-supervised', 'ds-unsupervised'],
        quiz: [
          {
            question: 'What is the purpose of the "Query, Key, and Value" vectors inside Multi-Head Self-Attention layers?',
            options: [
              'They compute database indexes for rapid token lookups.',
              'They perform linear projections to compute dynamic weight relationships (relevance) between all word tokens.',
              'They hash input bytes to prevent SQL Injection.',
              'They store neural weights on the graphics card memory static bus.'
            ],
            answer: 1,
            explanation: 'Self-attention maps Query and Key compatibility (dot-product) to assign weights, then applies those weights to values, allowing words to dynamically attend to context.'
          }
        ]
      },
      {
        id: 'ds-rag',
        label: 'LLMs, RAG, & Vector DBs',
        level: 'Advanced',
        category: 'Database',
        desc: 'Orchestrate Retrieval-Augmented Generation (RAG) using Pinecone, PgVector, embeddings, and context injection techniques.',
        skills: ['Embedding cosine similarity', 'Contextual prompt engineering', 'Vector indexing', 'RAG evaluation'],
        hours: 28,
        xpReward: 100,
        x: 760,
        y: 100,
        dependencies: ['ds-deep'],
        quiz: [
          {
            question: 'In RAG, what is the primary benefit of cross-encoder rerankers over simple vector dot-product similarity searches?',
            options: [
              'Rerankers are 100x faster and consume less memory.',
              'Rerankers evaluate joint query-document interactions, providing precise semantic relevance over raw word matches.',
              'Rerankers bypass the need for any embedding generation steps.',
              'Rerankers encrypt payload variables on client browsers.'
            ],
            answer: 1,
            explanation: 'While bi-encoders generate static vectors independently, cross-encoders process the query and document together, offering accurate deep semantic relevance scoring.'
          }
        ]
      },
      {
        id: 'ds-agents',
        label: 'AI Agent Loops & Swarms',
        level: 'Expert',
        category: 'DevOps',
        desc: 'Formulate autonomous agent routines, tool call boundaries, error loop prevention, and multi-agent coordination frameworks.',
        skills: ['Agent tool calling', 'Infinite loop safeguards', 'Swarm scheduling', 'Production tracing'],
        hours: 35,
        xpReward: 150,
        x: 760,
        y: 300,
        dependencies: ['ds-deep', 'ds-rag'],
        quiz: [
          {
            question: 'How do production agent frameworks safeguard against cascading API billing costs from infinite reasoning loops?',
            options: [
              'By enforcing strict maximum token budgets, iteration counters (Max Iterations), and timeout parameters.',
              'By compiling Python code down into C++ files.',
              'By using local string slices instead of remote APIs.',
              'By caching output answers on the client-side session storage.'
            ],
            answer: 0,
            explanation: 'Enforcing a strict ceiling on iteration cycles (e.g. max 10 loops) and maximum token costs ensures that runaway loops terminate safely before draining billing accounts.'
          }
        ]
      }
    ]
  },
  {
    id: 'mobile-dev',
    title: 'Mobile Application Architect',
    subtitle: 'Swift, Kotlin, Cross-Platform Flutter, Local databases, and CI/CD pipelines',
    icon: <Smartphone className="w-4 h-4 text-emerald-400" />,
    color: 'emerald',
    accentColor: '#10b981',
    nodes: [
      {
        id: 'mb-basics',
        label: 'Swift & Kotlin Foundations',
        level: 'Beginner',
        category: 'Language',
        desc: 'Analyze core strongly typed system features, Optionals, Null Safety, extensions, collections, and structured control flow.',
        skills: ['Swift optionals', 'Kotlin null safety', 'Type inference', 'Object Orientation'],
        hours: 10,
        xpReward: 50,
        x: 100,
        y: 200,
        dependencies: [],
        quiz: [
          {
            question: 'In Kotlin, which operator lets you safely call a method on a nullable variable without crashing?',
            options: [
              'The safe-call operator "?."',
              'The force-unwrap operator "!!"',
              'The ternary operator "?:"',
              'The pointer reference operator "->"'
            ],
            answer: 0,
            explanation: '"?." executes the action if the variable is non-null, returning null otherwise. "!!" forces evaluation and will crash if null.'
          }
        ]
      },
      {
        id: 'mb-layouts',
        label: 'Declarative UI Renderers',
        level: 'Beginner',
        category: 'Framework',
        desc: 'Build native responsive interfaces using SwiftUI stacks, state modifiers, and Jetpack Compose composables.',
        skills: ['SwiftUI @State/@Binding', 'Jetpack Compose state', 'Flex layouts', 'Component modularity'],
        hours: 14,
        xpReward: 60,
        x: 260,
        y: 100,
        dependencies: ['mb-basics'],
        quiz: [
          {
            question: 'In SwiftUI, what is the main difference between @State and @Binding annotations?',
            options: [
              '@State owns and stores value source-of-truth locally; @Binding provides read-write linkages to external parent states.',
              '@State is only for classes, @Binding is strictly for primitive integers.',
              '@Binding compiles code into asynchronous server background threads.',
              '@State acts as a static constant immutable value.'
            ],
            answer: 0,
            explanation: '@State instantiates local view-owned state. @Binding establishes a reference link back to a parent @State for multi-component editing.'
          }
        ]
      },
      {
        id: 'mb-cross',
        label: 'Dart & Flutter Engine',
        level: 'Beginner',
        category: 'Framework',
        desc: 'Configure Flutter widget trees, manage responsive layouts, and communicate with native system APIs via channels.',
        skills: ['Dart async/await', 'Flutter widget lifecycle', 'Platform Channels', 'Hot Reload optimization'],
        hours: 16,
        xpReward: 60,
        x: 260,
        y: 300,
        dependencies: ['mb-basics'],
        quiz: [
          {
            question: 'What mechanism does Flutter use to pass messages and commands between Dart code and native Swift/Kotlin APIs?',
            options: [
              'Platform Channels',
              'JSON-RPC over standard local ports',
              'Direct Assembly memory sharing',
              'Browser iframe postMessage protocols'
            ],
            answer: 0,
            explanation: 'Platform Channels act as a message bus to pass serialized values between Dart and native host controllers.'
          }
        ]
      },
      {
        id: 'mb-state',
        label: 'Client State Architecture',
        level: 'Intermediate',
        category: 'Architecture',
        desc: 'Orchestrate massive state flow structures with BloC, Redux, or Combine streams to keep state clean and deterministic.',
        skills: ['BLoc pattern', 'Unidirectional flows', 'RxDart / Combine streams', 'State side effects'],
        hours: 22,
        xpReward: 80,
        x: 440,
        y: 200,
        dependencies: ['mb-layouts', 'mb-cross'],
        quiz: [
          {
            question: 'Which principle defines Unidirectional Data Flow architectures?',
            options: [
              'Data flows exclusively in one direction (Action -> Reducer/State -> View), making events easy to track and debug.',
              'State can only be edited by direct DOM selectors.',
              'Data flows concurrently in multiple asynchronous threads without lockers.',
              'The server updates the browser without client actions.'
            ],
            answer: 0,
            explanation: 'Unidirectional flows prevent spaghetti code. Views trigger Actions, Actions update State, and updated State renders the View.'
          }
        ]
      },
      {
        id: 'mb-persistence',
        label: 'Local SQLite & Room DBs',
        level: 'Intermediate',
        category: 'Database',
        desc: 'Store data offline. Write clean schemas in CoreData or Android Room, handle migrations, and sync indexes.',
        skills: ['Room DB', 'CoreData structures', 'Database migrations', 'Secure local storage'],
        hours: 18,
        xpReward: 80,
        x: 620,
        y: 100,
        dependencies: ['mb-state'],
        quiz: [
          {
            question: 'When updating a mobile app database schema (e.g., adding a non-null column), why is a structured migration required?',
            options: [
              'To prevent the application from crashing on launch when opening database files with mismatched version numbers.',
              'To force the user to re-purchase the mobile app subscription.',
              'To compile the sqlite file into binary Assembly blocks.',
              'To bypass Apple sandbox filesystem restriction checkers.'
            ],
            answer: 0,
            explanation: 'Without a migration script specifying how to add the column, SQL engines reject schema inconsistencies and throw fatal launch errors.'
          }
        ]
      },
      {
        id: 'mb-network',
        label: 'APIs, WebSockets & Security',
        level: 'Intermediate',
        category: 'Database',
        desc: 'Implement HTTP/2 client calls, token interceptors, OAuth login popups, and secure WebSockets for messaging.',
        skills: ['OAuth OAuth flows', 'WebSocket client pipelines', 'SSL Pinning', 'Biometrics auth'],
        hours: 20,
        xpReward: 80,
        x: 620,
        y: 300,
        dependencies: ['mb-state'],
        quiz: [
          {
            question: 'What security technique prevents Man-in-the-Middle (MITM) attacks by rejecting rogue certificates, even if they are trusted by the device OS?',
            options: [
              'SSL/Certificate Pinning',
              'HTML Escaping',
              'API Key Base64 encoding',
              'Symmetric AES encryption'
            ],
            answer: 0,
            explanation: 'SSL Pinning embeds the expected host certificate public key in the app binary, rejecting handshakes with unexpected mock gateways.'
          }
        ]
      },
      {
        id: 'mb-deploy',
        label: 'App Store Deploy & CI/CD',
        level: 'Advanced',
        category: 'DevOps',
        desc: 'Manage provisioning profiles, code-signing certificates, testflight channels, and automate pipelines with Fastlane.',
        skills: ['Fastlane scripts', 'Code-signing profiles', 'TestFlight / Play Beta', 'Crash analytics'],
        hours: 25,
        xpReward: 120,
        x: 760,
        y: 200,
        dependencies: ['mb-persistence', 'mb-network'],
        quiz: [
          {
            question: 'What tool is widely used to automate compiling, screenshot creation, and beta deployments for iOS and Android via simple Ruby scripts?',
            options: [
              'Fastlane',
              'Jenkins Shell CLI',
              'Kubernetes Ingress API',
              'Xcode Interface Builder'
            ],
            answer: 0,
            explanation: 'Fastlane is an open-source tool written in Ruby that automates tedious deployment and code-signing steps for mobile projects.'
          }
        ]
      }
    ]
  },
  {
    id: 'systems',
    title: 'Systems & Enterprise Programmer',
    subtitle: 'Rust safety, Go microservices, C++ pointers, multi-threading, and consensus protocols',
    icon: <Cpu className="w-4 h-4 text-[#FFD700]" />,
    color: 'sky',
    accentColor: '#3b82f6',
    nodes: [
      {
        id: 'sys-pointers',
        label: 'C & C++ Pointer Core',
        level: 'Beginner',
        category: 'Language',
        desc: 'Understand raw addresses, dynamic heap allocation, double pointers, structs, alignment padding, and compilation.',
        skills: ['Pointer manipulation', 'Malloc/Free memory management', 'Struct byte alignment', 'Makefile scripts'],
        hours: 15,
        xpReward: 50,
        x: 100,
        y: 200,
        dependencies: [],
        quiz: [
          {
            question: 'In C, what is the size of a struct declared with "struct Packet { char id; int count; };" on a 64-bit aligned compiler?',
            options: [
              '8 bytes (due to 3 bytes alignment padding after the 1-byte char).',
              '5 bytes (exactly 1 byte + 4 bytes).',
              '16 bytes (always double the integer size).',
              '4 bytes (the char field is discarded).'
            ],
            answer: 0,
            explanation: 'To align the 4-byte integer to a multiple of its size in memory, 3 bytes of padding are added after the char.'
          }
        ]
      },
      {
        id: 'sys-rust',
        label: 'Rust Ownership & Lifetimes',
        level: 'Beginner',
        category: 'Language',
        desc: 'Conquer the Borrow Checker. Map out variables lifetime annotations, understand mutable reference limits, and heap wrappers.',
        skills: ['Ownership transfers', 'Borrow checker safety', 'Reference lifetimes', 'Smart pointers Box/Rc'],
        hours: 20,
        xpReward: 70,
        x: 260,
        y: 100,
        dependencies: ['sys-pointers'],
        quiz: [
          {
            question: 'Why does "let r1 = &s; let r2 = &mut s;" throw a compiler error in Rust?',
            options: [
              'The borrow checker prohibits active mutable references while immutable references remain in the same scope.',
              'Rust does not allow variables to begin with "r".',
              'Mutable pointers require unsafe wrapping blocks.',
              'Let variables are automatically constants.'
            ],
            answer: 0,
            explanation: 'To prevent data races at runtime, Rust restricts scopes to have either multiple immutable borrows OR exactly one mutable borrow.'
          }
        ]
      },
      {
        id: 'sys-go',
        label: 'Go Language Microservices',
        level: 'Beginner',
        category: 'Language',
        desc: 'Utilize structural interfaces, goroutines, channels, and compile highly performant API endpoints in Go.',
        skills: ['Go structs & interfaces', 'Goroutine routines', 'Channel communications', 'JSON network decoders'],
        hours: 16,
        xpReward: 60,
        x: 260,
        y: 300,
        dependencies: ['sys-pointers'],
        quiz: [
          {
            question: 'How do you prevent goroutine closure races when capturing shifting loop variables (e.g. variable i in a for-loop)?',
            options: [
              'Pass the variable as a parameter to the goroutine function (copying its value).',
              'Add a "defer recovery" block at the start.',
              'Sleep the main execution for 1 microsecond.',
              'Redeclare the variable with the "global" keyword.'
            ],
            answer: 0,
            explanation: 'Passing variables as arguments duplicates their value for each goroutine instance, preventing concurrent reading of the index pointer.'
          }
        ]
      },
      {
        id: 'sys-concurrency',
        label: 'Advanced Concurrency Mechanics',
        level: 'Intermediate',
        category: 'Algorithm',
        desc: 'Build thread pools, configure mutex locks, read-write locks, atomic flags, and analyze memory synchronization boundaries.',
        skills: ['Mutex synchronization', 'Thread scheduling', 'Atomic CPU operations', 'Memory fences/barriers'],
        hours: 25,
        xpReward: 80,
        x: 440,
        y: 200,
        dependencies: ['sys-rust', 'sys-go'],
        quiz: [
          {
            question: 'What is a core benefit of "Double-Checked Locking" in Singleton initialization, and why must the instance variable be volatile?',
            options: [
              'It avoids synchronization locks once initialized; volatile guarantees memory write orders across separate CPU threads.',
              'It doubles compiling speed; volatile speeds up disk access.',
              'It bypasses memory limits; volatile clears memory caches.',
              'It encrypts variables with hardware-based cryptographic keys.'
            ],
            answer: 0,
            explanation: 'Locking is expensive. Double checking avoids acquiring locks after instantiation, while volatile forces immediate memory visibility and blocks compiler instruction reordering.'
          }
        ]
      },
      {
        id: 'sys-architecture',
        label: 'Hardware Limits & Assembly',
        level: 'Intermediate',
        category: 'Architecture',
        desc: 'Deconstruct CPU cache locality (L1/L2/L3), assembly registers, virtual memory translation, and branch predictors.',
        skills: ['Cache locality lines', 'Virtual memory paging', 'Assembly instructions', 'SIMD vectorization'],
        hours: 22,
        xpReward: 90,
        x: 620,
        y: 100,
        dependencies: ['sys-concurrency'],
        quiz: [
          {
            question: 'Why is traversing a 2D array row-by-row substantially faster than column-by-column in C/C++?',
            options: [
              'C arrays are stored in row-major order; row traversal maximizes CPU cache hits by loading sequential memory lines.',
              'Row loops are optimized with native background compilers.',
              'Column loops trigger safety buffer overflows automatically.',
              'Rows use float registers while columns use integer buses.'
            ],
            answer: 0,
            explanation: 'C arrays are stored continuously row by row. Sequential access lets the CPU prefetch data into high-speed caches, avoiding expensive RAM accesses.'
          }
        ]
      },
      {
        id: 'sys-consensus',
        label: 'Consensus & gRPC APIs',
        level: 'Advanced',
        category: 'Architecture',
        desc: 'Investigate Protobuf schemas, build fast gRPC streams, and model Paxos/Raft distributed leader elections.',
        skills: ['gRPC serialization', 'Protobuf compilers', 'Raft leader states', 'Distributed logs sync'],
        hours: 30,
        xpReward: 120,
        x: 620,
        y: 300,
        dependencies: ['sys-concurrency'],
        quiz: [
          {
            question: 'What is the primary role of the "replicated state machine" in consensus protocols like Raft?',
            options: [
              'To ensure all nodes process identical commands in identical order, keeping database replicas fully synchronized.',
              'To generate user interface screens on web servers.',
              'To translate assembly into standard Go script files.',
              'To compress storage payloads with zip formats.'
            ],
            answer: 0,
            explanation: 'Consistent log replication ensures that if nodes process the same logs sequentially, they arrive at the exact same deterministic states.'
          }
        ]
      },
      {
        id: 'sys-containers',
        label: 'Containers & Cloud DevOps',
        level: 'Advanced',
        category: 'DevOps',
        desc: 'Isolate processes using Linux namespaces, configure Docker boundaries, write secure YAMLs, and map out Kubernetes pods.',
        skills: ['Docker image size optimization', 'Kubernetes pod clusters', 'Linux kernel namespaces', 'Secure container layers'],
        hours: 28,
        xpReward: 110,
        x: 760,
        y: 200,
        dependencies: ['sys-architecture', 'sys-consensus'],
        quiz: [
          {
            question: 'Which Linux kernel mechanism establishes process isolation (e.g. giving a container its own custom routing tables and PID tree)?',
            options: [
              'Namespaces (PID, Net, Mnt)',
              'Chroot jails solely',
              'CPU Clock cycles throttling',
              'Symmetric file partitions'
            ],
            answer: 0,
            explanation: 'Namespaces isolate system resources (networks, mount points, process IDs) from other container tasks. Cgroups control usage.'
          }
        ]
      }
    ]
  }
];

export function CareerPath({ stats, onUpdateStats, playSound }: CareerPathProps) {
  const [activeTrackId, setActiveTrackId] = useState<string>('data-science');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('ds-python');
  
  // Quiz evaluation states
  const [currentQuizQuestionIdx, setCurrentQuizQuestionIdx] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [quizErrorMsg, setQuizErrorMsg] = useState<string | null>(null);
  const [quizModeActive, setQuizModeActive] = useState<boolean>(false);

  // Fallback Audio Synthesizer
  const playFallbackSound = (type: 'success' | 'fail' | 'click' | 'laser') => {
    if (playSound) {
      playSound(type);
      return;
    }
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'fail') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'laser') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      // Audio Context might be restricted in sandbox iframe
    }
  };

  // Retrieve track object
  const track = useMemo(() => {
    return CAREER_TRACKS.find(t => t.id === activeTrackId) || CAREER_TRACKS[0];
  }, [activeTrackId]);

  // Determine if a node is completed based on stats completedCourses or stats badges, or some custom simulation state.
  // To keep it persistent and integrated, we map each module completed status to stats.completedLessons (using its node ID as unique identifier)
  const completedNodes = useMemo(() => {
    return new Set<string>(stats.completedLessons || []);
  }, [stats.completedLessons]);

  // Map out node availability states (locked, unlocked, active)
  const nodeStates = useMemo(() => {
    const states: { [nodeId: string]: 'locked' | 'unlocked' | 'active' | 'completed' } = {};

    track.nodes.forEach(node => {
      if (completedNodes.has(node.id)) {
        states[node.id] = 'completed';
      } else {
        // Check dependencies
        const depsResolved = node.dependencies.every(depId => completedNodes.has(depId));
        if (depsResolved) {
          // If dependencies are resolved, it's either unlocked (available to study) or active (the primary next one)
          // We can call it 'active' if it's the first available non-completed node
          states[node.id] = 'unlocked';
        } else {
          states[node.id] = 'locked';
        }
      }
    });

    // Pick the "first" unlocked node as the "active" study node to direct focus
    const firstUnlocked = track.nodes.find(node => states[node.id] === 'unlocked');
    if (firstUnlocked) {
      states[firstUnlocked.id] = 'active';
    }

    return states;
  }, [track, completedNodes]);

  const selectedNode = useMemo(() => {
    return track.nodes.find(n => n.id === selectedNodeId) || null;
  }, [track, selectedNodeId]);

  const handleTrackSelect = (trackId: string) => {
    playFallbackSound('click');
    setActiveTrackId(trackId);
    setQuizModeActive(false);
    setSelectedQuizOption(null);
    setQuizFinished(false);
    
    // Auto-select the first node of the track
    const firstNode = CAREER_TRACKS.find(t => t.id === trackId)?.nodes[0];
    setSelectedNodeId(firstNode ? firstNode.id : null);
  };

  const handleNodeClick = (nodeId: string) => {
    playFallbackSound('click');
    setSelectedNodeId(nodeId);
    setQuizModeActive(false);
    setSelectedQuizOption(null);
    setQuizFinished(false);
    setQuizScore(0);
    setCurrentQuizQuestionIdx(0);
    setQuizErrorMsg(null);
  };

  const startModuleQuiz = () => {
    playFallbackSound('laser');
    setQuizModeActive(true);
    setCurrentQuizQuestionIdx(0);
    setSelectedQuizOption(null);
    setQuizFinished(false);
    setQuizScore(0);
    setQuizErrorMsg(null);
  };

  const selectQuizOption = (optIdx: number) => {
    playFallbackSound('click');
    setSelectedQuizOption(optIdx);
  };

  const nextQuizQuestion = () => {
    if (selectedNode === null) return;
    const isCorrect = selectedQuizOption === selectedNode.quiz[currentQuizQuestionIdx].answer;
    
    let newScore = quizScore;
    if (isCorrect) {
      newScore += 1;
      setQuizScore(newScore);
    }

    if (currentQuizQuestionIdx + 1 < selectedNode.quiz.length) {
      setCurrentQuizQuestionIdx(prev => prev + 1);
      setSelectedQuizOption(null);
    } else {
      // Finished
      setQuizFinished(true);
      const passed = (newScore / selectedNode.quiz.length) >= 1.0; // Must get all correct to certify

      if (passed) {
        playFallbackSound('success');
        
        // Add module ID to completedLessons to unlock downstream nodes
        const updatedCompleted = [...(stats.completedLessons || [])];
        if (!updatedCompleted.includes(selectedNode.id)) {
          updatedCompleted.push(selectedNode.id);
        }

        // Add XP reward
        const updatedXp = stats.xpPoints + selectedNode.xpReward;
        
        // Check if track is fully completed to award a special Badge!
        const trackNodes = track.nodes.map(n => n.id);
        const allTrackPassed = trackNodes.every(nid => nid === selectedNode.id || completedNodes.has(nid));
        const updatedBadges = [...(stats.badges || [])];
        const trackBadge = `${track.title} Master`;
        if (allTrackPassed && !updatedBadges.includes(trackBadge)) {
          updatedBadges.push(trackBadge);
        }

        // Recent activity entry
        const updatedActivity = [
          {
            id: `act-${Date.now()}`,
            type: 'game_complete' as const,
            title: `Certified in ${selectedNode.label}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            xp: selectedNode.xpReward
          },
          ...(stats.recentActivity || [])
        ].slice(0, 10); // keep max 10

        // Call update state callback
        onUpdateStats({
          ...stats,
          completedLessons: updatedCompleted,
          xpPoints: updatedXp,
          badges: updatedBadges,
          recentActivity: updatedActivity
        });
      } else {
        playFallbackSound('fail');
      }
    }
  };

  // Calculate track progress percentage
  const trackProgress = useMemo(() => {
    const trackNodes = track.nodes.map(n => n.id);
    const completedCount = trackNodes.filter(id => completedNodes.has(id)).length;
    return {
      count: completedCount,
      total: trackNodes.length,
      percentage: Math.round((completedCount / trackNodes.length) * 100)
    };
  }, [track, completedNodes]);

  return (
    <div id="career-path-view" className="space-y-6 font-mono text-xs text-[#F8F7F4] animate-fade-in">
      
      {/* 1. Header with Cyberpunk Dashboard Metadata */}
      <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111113] p-4 border border-white/5 rounded-sm">
        <div>
          <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">[03] CORE CAREER PATH VISUALIZER</span>
          <h3 className="text-2xl font-display font-black text-[#F8F7F4] uppercase mt-1">Interactive Syllabus Map</h3>
          <p className="text-[11px] text-[#F8F7F4]/50 leading-relaxed mt-1 uppercase">
            Map your learning checkpoints, tackle mini certification quizzes, and unlock advanced nodes dynamically across specialized tracks.
          </p>
        </div>

        {/* Dynamic Progress Indicator bar */}
        <div className="bg-[#18181b] border border-white/10 p-3 rounded-sm font-mono flex items-center gap-4 shrink-0">
          <div>
            <span className="text-[8px] text-[#F8F7F4]/40 uppercase font-bold block">Current Track Progress</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-amber-400">{trackProgress.percentage}%</span>
              <span className="text-[9px] text-[#F8F7F4]/50">({trackProgress.count}/{trackProgress.total} Nodes Certified)</span>
            </div>
            <div className="w-32 h-1 bg-white/10 mt-1.5 overflow-hidden">
              <div 
                className="h-full bg-amber-400 transition-all duration-500" 
                style={{ width: `${trackProgress.percentage}%` }} 
              />
            </div>
          </div>
          {trackProgress.percentage === 100 && (
            <div className="bg-amber-400/10 border border-amber-400 px-2 py-1 text-center animate-pulse rounded-sm shrink-0">
              <Trophy className="w-4 h-4 text-amber-400 mx-auto" />
              <span className="text-[7px] font-bold text-amber-300 block uppercase">TRACK MASTER</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Track Selector Cyberdeck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {CAREER_TRACKS.map((t) => {
          const isActive = t.id === activeTrackId;
          const completedCount = t.nodes.filter(n => completedNodes.has(n.id)).length;
          return (
            <button
              key={t.id}
              onClick={() => handleTrackSelect(t.id)}
              className={`p-4 border transition-all text-left flex items-start gap-3.5 cursor-pointer rounded-sm relative overflow-hidden ${
                isActive 
                  ? 'bg-gradient-to-r from-white/[0.05] to-transparent border-amber-400/80 shadow-md' 
                  : 'bg-[#111113] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 w-12 h-12 bg-amber-400/10 rotate-45 translate-x-6 -translate-y-6 border-b border-amber-400/20" />
              )}
              
              <div className={`p-2.5 rounded-sm shrink-0 ${isActive ? 'bg-amber-400/10' : 'bg-[#18181b] border border-white/5'}`}>
                {t.icon}
              </div>

              <div className="space-y-1.5 min-w-0">
                <h4 className={`font-black uppercase text-[11px] truncate ${isActive ? 'text-amber-400' : 'text-[#F8F7F4]/80'}`}>
                  {t.title}
                </h4>
                <p className="text-[9px] text-[#F8F7F4]/40 uppercase tracking-tight leading-tight line-clamp-1">
                  {t.subtitle}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-16 h-1 bg-white/5 overflow-hidden">
                    <div 
                      className="h-full bg-white/30" 
                      style={{ width: `${Math.round((completedCount / t.nodes.length) * 100)}%` }} 
                    />
                  </div>
                  <span className="text-[8px] text-[#F8F7F4]/30 uppercase font-bold">{completedCount}/{t.nodes.length} Done</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Main Split View - SVG Node Graph + Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Node Graph Container */}
        <div className="lg:col-span-2 bg-[#111113] border border-white/10 rounded-sm relative overflow-hidden flex flex-col min-h-[460px]">
          
          {/* Cyber Decor Matrix Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          {/* Graph Title Watermark */}
          <div className="absolute top-4 left-4 z-10 select-none pointer-events-none font-mono">
            <span className="text-[8px] text-[#F8F7F4]/20 uppercase font-black block tracking-widest">MAP PIPELINE BOUNDS</span>
            <span className="text-[11px] text-amber-400/50 uppercase font-bold tracking-wider">{track.title} Graph</span>
          </div>

          <div className="absolute top-4 right-4 z-10 flex gap-2 select-none pointer-events-none text-[8px] font-bold">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> CERTIFIED</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" /> CURRENT</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-white/15 rounded-full" /> LOCKED</span>
          </div>

          {/* SVG canvas view */}
          <div className="flex-1 overflow-x-auto p-4 flex items-center justify-center">
            <div className="relative w-[800px] h-[400px] shrink-0">
              <svg 
                className="w-full h-full"
                viewBox="0 0 800 400"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* A. RENDER CONNECTION LINES */}
                {track.nodes.map((node) => {
                  return node.dependencies.map((depId) => {
                    const parent = track.nodes.find(n => n.id === depId);
                    if (!parent) return null;

                    const isUnlocked = completedNodes.has(depId);
                    const isFullyCompleted = completedNodes.has(node.id) && isUnlocked;
                    
                    // Draw clean Bezier curve for beautiful flow
                    const dx = node.x - parent.x;
                    const dy = node.y - parent.y;
                    const cX1 = parent.x + dx * 0.5;
                    const cY1 = parent.y;
                    const cX2 = parent.x + dx * 0.5;
                    const cY2 = node.y;

                    return (
                      <g key={`${depId}-${node.id}`}>
                        {/* Glow Layer */}
                        <path
                          d={`M ${parent.x} ${parent.y} C ${cX1} ${cY1}, ${cX2} ${cY2}, ${node.x} ${node.y}`}
                          fill="none"
                          stroke={isFullyCompleted ? '#10b981' : isUnlocked ? '#fbbf24' : 'rgba(255,255,255,0.04)'}
                          strokeWidth={isUnlocked ? 3 : 1.5}
                          strokeOpacity={isUnlocked ? 0.35 : 0.2}
                          className={isUnlocked && !isFullyCompleted ? "animate-pulse" : ""}
                        />
                        {/* Solid Line Layer */}
                        <path
                          d={`M ${parent.x} ${parent.y} C ${cX1} ${cY1}, ${cX2} ${cY2}, ${node.x} ${node.y}`}
                          fill="none"
                          stroke={isFullyCompleted ? '#10b981' : isUnlocked ? '#fbbf24' : 'rgba(255,255,255,0.06)'}
                          strokeWidth={isUnlocked ? 1.5 : 1}
                          strokeDasharray={!isUnlocked ? "3,3" : isFullyCompleted ? undefined : "6,4"}
                          className={isUnlocked && !isFullyCompleted ? "stroke-dash-move" : ""}
                        />
                      </g>
                    );
                  });
                })}

                {/* B. RENDER MODULE NODES */}
                {track.nodes.map((node) => {
                  const state = nodeStates[node.id] || 'locked';
                  const isSelected = selectedNodeId === node.id;
                  
                  let ringColor = 'rgba(255,255,255,0.15)';
                  let fillColor = '#111113';
                  let textColor = 'rgba(255,255,255,0.4)';
                  let iconColor = 'rgba(255,255,255,0.2)';

                  if (state === 'completed') {
                    ringColor = '#10b981';
                    fillColor = 'rgba(16,185,129,0.12)';
                    textColor = '#F8F7F4';
                    iconColor = '#10b981';
                  } else if (state === 'active') {
                    ringColor = '#fbbf24';
                    fillColor = 'rgba(251,191,36,0.15)';
                    textColor = '#fbbf24';
                    iconColor = '#fbbf24';
                  } else if (state === 'unlocked') {
                    ringColor = '#3b82f6';
                    fillColor = 'rgba(59,130,246,0.08)';
                    textColor = '#F8F7F4';
                    iconColor = '#3b82f6';
                  }

                  if (isSelected) {
                    ringColor = '#fbbf24';
                    textColor = '#F8F7F4';
                  }

                  return (
                    <g 
                      key={node.id} 
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer group"
                      onClick={() => handleNodeClick(node.id)}
                    >
                      {/* Outer Pulse aura for active next-up nodes */}
                      {state === 'active' && (
                        <circle
                          r="28"
                          fill="none"
                          stroke="#fbbf24"
                          strokeWidth="1.5"
                          strokeOpacity="0.4"
                          className="animate-ping"
                          style={{ animationDuration: '3s' }}
                        />
                      )}

                      {/* Selected Node background halo */}
                      {isSelected && (
                        <circle
                          r="26"
                          fill="none"
                          stroke="#fbbf24"
                          strokeWidth="2.5"
                          strokeOpacity="0.8"
                        />
                      )}

                      {/* Primary Node boundary */}
                      <circle
                        r="18"
                        fill={fillColor}
                        stroke={ringColor}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        className="transition-all duration-300 group-hover:stroke-amber-400 group-hover:scale-110"
                      />

                      {/* Inner Node status icon representation */}
                      {state === 'completed' ? (
                        <path 
                          d="M-5.5 -0.5 L-1.5 3.5 L5.5 -3.5" 
                          fill="none" 
                          stroke="#10b981" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        />
                      ) : state === 'locked' ? (
                        <g transform="translate(-5, -6)">
                          <rect x="0" y="4" width="10" height="8" rx="1.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                          <path d="M2.5 4 V2.5 A2.5 2.5 0 0 1 7.5 2.5 V4" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                        </g>
                      ) : state === 'active' ? (
                        <path 
                          d="M-3.5 -5.5 L4.5 -0.5 L-3.5 4.5 Z" 
                          fill="#fbbf24" 
                        />
                      ) : (
                        // Standard unlocked
                        <circle
                          r="4"
                          fill="#3b82f6"
                        />
                      )}

                      {/* Node Label Text */}
                      <text
                        y="34"
                        textAnchor="middle"
                        fill={textColor}
                        fontSize="9.5"
                        fontWeight={isSelected || state === 'active' ? 'bold' : 'normal'}
                        className="font-mono uppercase pointer-events-none tracking-tight select-none select-none-text drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                      >
                        {node.label}
                      </text>

                      {/* Category metadata microtext */}
                      <text
                        y="-26"
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.25)"
                        fontSize="7"
                        className="font-mono uppercase pointer-events-none tracking-widest select-none"
                      >
                        {node.category}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Micro Legend Description Footnote */}
          <div className="bg-[#18181b] border-t border-white/5 p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[9px] text-[#F8F7F4]/40 font-mono uppercase">
            <span>Graph Coordinates bounds: 0,0 to 800,400 inside SVG ViewPort</span>
            <span className="text-amber-400/60 font-bold">Interactive mesh: click nodes to auditalize dossiers</span>
          </div>

        </div>

        {/* 4. MODULE DOSSIER INSPECTION PANEL (Right) */}
        <div className="bg-[#18181b] border border-white/10 p-5 rounded-sm flex flex-col justify-between font-mono min-h-[460px]">
          {selectedNode ? (
            <div className="space-y-5 flex-1 flex flex-col justify-between">
              
              {/* Header section */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-start gap-2 border-b border-white/5 pb-3">
                  <div>
                    <span className="text-[8px] bg-white/10 text-white/60 border border-white/15 px-2 py-0.5 font-bold uppercase block w-max">
                      {selectedNode.level} • {selectedNode.category}
                    </span>
                    <h4 className="text-xs font-black text-[#F8F7F4] uppercase mt-1.5 leading-tight tracking-wide">
                      {selectedNode.label}
                    </h4>
                  </div>
                  
                  {/* Status Stamp Badge */}
                  <div>
                    {nodeStates[selectedNode.id] === 'completed' ? (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-1 font-bold uppercase rounded-sm block">
                        ✓ CERTIFIED
                      </span>
                    ) : nodeStates[selectedNode.id] === 'locked' ? (
                      <span className="text-[9px] bg-white/5 text-white/40 border border-white/10 px-2 py-1 font-bold uppercase rounded-sm block flex items-center gap-1">
                        <Lock className="w-3 h-3" /> LOCKED
                      </span>
                    ) : (
                      <span className="text-[9px] bg-amber-400/10 text-amber-400 border border-amber-400/25 px-2 py-1 font-bold uppercase rounded-sm block animate-pulse">
                        ◷ AVAILABLE
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Syllabus Description */}
                <div className="space-y-2">
                  <span className="text-[8px] text-amber-400 font-bold tracking-wider uppercase block">I. SYLLABUS OVERVIEW</span>
                  <p className="text-[10px] text-[#F8F7F4]/60 leading-relaxed uppercase">
                    {selectedNode.desc}
                  </p>
                </div>

                {/* Hours and Rewards stats */}
                <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#111113] p-2.5 border border-white/5 uppercase">
                  <div>
                    <span className="text-[#F8F7F4]/40 text-[8px] block">ESTIMATED HOURS</span>
                    <span className="font-bold text-[#F8F7F4] mt-0.5 block">{selectedNode.hours} hrs Study</span>
                  </div>
                  <div>
                    <span className="text-[#F8F7F4]/40 text-[8px] block">EXPERIENCE VALUE</span>
                    <span className="font-bold text-amber-400 mt-0.5 block">+{selectedNode.xpReward} XP Points</span>
                  </div>
                </div>

                {/* Core Skills Gained Tags list */}
                <div className="space-y-2">
                  <span className="text-[8px] text-amber-400 font-bold tracking-wider uppercase block">II. UNLOCKED SKILLS CAPABILITIES</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="text-[8.5px] bg-[#111113] border border-white/10 text-[#F8F7F4]/70 px-2 py-1 uppercase rounded-sm"
                      >
                        ✦ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dependency constraints block */}
                {selectedNode.dependencies.length > 0 && (
                  <div className="space-y-2 pt-2.5 border-t border-white/5 text-[9px]">
                    <span className="text-[8px] text-amber-400/80 font-bold uppercase block">PREREQUISITE UNLOCK CONSTRAINTS</span>
                    <div className="space-y-1">
                      {selectedNode.dependencies.map((depId) => {
                        const depNode = track.nodes.find(n => n.id === depId);
                        const isDone = completedNodes.has(depId);
                        return (
                          <div key={depId} className="flex items-center justify-between text-[#F8F7F4]/50">
                            <span className="truncate mr-2">↳ {depNode?.label || depId}</span>
                            <span className={isDone ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                              {isDone ? '✓ RESOLVED' : '◷ INCOMPLETE'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button & Quiz Section */}
              <div className="pt-4 border-t border-white/5 mt-4 space-y-4">
                
                {/* A. Not in Quiz Mode */}
                {!quizModeActive ? (
                  <div className="space-y-2">
                    {nodeStates[selectedNode.id] === 'locked' ? (
                      <div className="bg-red-500/5 border border-red-500/20 p-3 text-red-200 text-[10px] space-y-1">
                        <div className="flex items-center gap-1.5 text-red-400 font-bold">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>ACADEMIC CLEARANCE RESTRICTED</span>
                        </div>
                        <p className="leading-normal uppercase text-[9px] text-[#F8F7F4]/40">
                          Complete all precursor node checkpoints listed above to unlock this study module pipeline.
                        </p>
                      </div>
                    ) : nodeStates[selectedNode.id] === 'completed' ? (
                      <div className="space-y-3">
                        <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 text-emerald-200 text-[10px] space-y-1">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>CREDENTIAL SECURED</span>
                          </div>
                          <p className="leading-normal uppercase text-[9px] text-[#F8F7F4]/40">
                            This module has been fully compiled and added to your permanent dossier database logs.
                          </p>
                        </div>
                        <button 
                          onClick={startModuleQuiz}
                          className="w-full py-2 bg-transparent border border-white/10 hover:border-white/20 hover:bg-white/5 font-bold uppercase text-[10px] tracking-wider text-[#F8F7F4] cursor-pointer"
                        >
                          Retake Assessment (Review Mode)
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-amber-400/5 border border-amber-400/20 p-3 text-amber-200 text-[10px] space-y-1">
                          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>SYLLABUS UNLOCKED</span>
                          </div>
                          <p className="leading-normal uppercase text-[9px] text-[#F8F7F4]/40">
                            Launch the interactive assessment quiz below to verify skill competence and secure the accreditation badge.
                          </p>
                        </div>
                        <button 
                          onClick={startModuleQuiz}
                          className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black uppercase text-[10px] tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>COMMENCE PLACEMENT QUIZ</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  
                  /* B. In Quiz Mode */
                  <div className="bg-[#111113] border border-white/5 p-4 rounded-sm space-y-4">
                    
                    {/* Header Quiz Progress */}
                    <div className="flex justify-between items-center text-[8px] text-[#F8F7F4]/40 uppercase tracking-widest border-b border-white/5 pb-2">
                      <span>MODULE TEST ASSEMBLY</span>
                      <span className="font-bold text-amber-400">QUESTION {currentQuizQuestionIdx + 1} OF {selectedNode.quiz.length}</span>
                    </div>

                    {!quizFinished ? (
                      <div className="space-y-3">
                        {/* Question Text */}
                        <p className="text-[10px] text-[#F8F7F4] leading-relaxed uppercase font-bold">
                          {selectedNode.quiz[currentQuizQuestionIdx].question}
                        </p>

                        {/* Options Buttons */}
                        <div className="space-y-2 pt-1.5">
                          {selectedNode.quiz[currentQuizQuestionIdx].options.map((opt, oIdx) => {
                            const isSelected = selectedQuizOption === oIdx;
                            return (
                              <button
                                key={oIdx}
                                onClick={() => selectQuizOption(oIdx)}
                                className={`w-full p-2.5 border text-left text-[9px] uppercase transition-all rounded-sm cursor-pointer ${
                                  isSelected 
                                    ? 'bg-amber-400/10 border-amber-400 text-amber-300' 
                                    : 'bg-[#18181b] border-white/5 text-[#F8F7F4]/70 hover:bg-white/[0.02]'
                                }`}
                              >
                                <span className="mr-2 font-black">{String.fromCharCode(65 + oIdx)}.</span>
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {/* Next / Submit Button */}
                        <button
                          onClick={nextQuizQuestion}
                          disabled={selectedQuizOption === null}
                          className="w-full py-2 bg-white text-black hover:bg-white/95 font-bold uppercase text-[10px] tracking-wider disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Confirm & Next</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      
                      /* Quiz Completed Result State */
                      <div className="text-center space-y-4 py-2">
                        <div className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center mx-auto border border-amber-400/30">
                          {quizScore === selectedNode.quiz.length ? (
                            <Trophy className="w-6 h-6 text-amber-400 animate-pulse" />
                          ) : (
                            <ShieldAlert className="w-6 h-6 text-red-400" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <h5 className="font-bold uppercase text-[11px]">Assessment Results</h5>
                          <p className="text-lg font-black text-[#F8F7F4]">
                            {quizScore} / {selectedNode.quiz.length} Correct
                          </p>
                          <p className="text-[9px] text-[#F8F7F4]/40 uppercase">
                            Required Score to Pass: 100% (No Errors Allowed)
                          </p>
                        </div>

                        {quizScore === selectedNode.quiz.length ? (
                          <div className="space-y-2">
                            <p className="text-[10px] text-emerald-400 font-bold uppercase leading-relaxed">
                              ✦ EXCELLENT WORK! SECURED SECURITY CLEARANCE FOR DOWNSTREAM PIPELINES AND EARNED +{selectedNode.xpReward} XP.
                            </p>
                            <button
                              onClick={() => setQuizModeActive(false)}
                              className="w-full py-2 bg-amber-400 text-amber-950 hover:bg-amber-300 font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                            >
                              Exit Dossier Panel
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3.5">
                            <p className="text-[10px] text-red-400 leading-normal uppercase">
                              Verification failed. Review the study materials and retry the assessment.
                            </p>
                            <div className="text-left text-[8.5px] bg-[#18181b] p-2.5 border border-white/5 text-[#F8F7F4]/50 rounded-sm">
                              <span className="font-bold text-amber-400 block mb-1">EDUCATIONAL DECONSTRUCTION:</span>
                              {selectedNode.quiz[0].explanation}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={startModuleQuiz}
                                className="flex-1 py-2 bg-white/10 hover:bg-white/15 text-[#F8F7F4] font-bold uppercase text-[9px] tracking-wider cursor-pointer"
                              >
                                Retry Quiz
                              </button>
                              <button
                                onClick={() => setQuizModeActive(false)}
                                className="flex-1 py-2 bg-transparent border border-white/10 hover:bg-white/5 text-[#F8F7F4]/60 font-bold uppercase text-[9px] tracking-wider cursor-pointer"
                              >
                                Close Map
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}

              </div>

            </div>
          ) : (
            // Empty state view
            <div className="text-center py-16 space-y-3">
              <BrainCircuit className="w-8 h-8 text-[#F8F7F4]/20 mx-auto animate-pulse" />
              <h5 className="font-bold text-[#F8F7F4]/40 uppercase text-[10px]">Select Node from Map</h5>
              <p className="text-[9px] text-[#F8F7F4]/30 leading-normal max-w-xs mx-auto uppercase">
                Click any interactive circular module inside the network tree to load technical description matrices, acquired skills checklist, and pass certification assessments.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Embedded CSS Style injection for animating dynamic SVG lines cleanly */}
      <style>{`
        @keyframes strokeDashMove {
          to {
            stroke-dashoffset: -20;
          }
        }
        .stroke-dash-move {
          animation: strokeDashMove 1.5s linear infinite;
          stroke-dasharray: 6, 4;
        }
        .select-none-text {
          user-select: none;
          -webkit-user-select: none;
        }
      `}</style>

    </div>
  );
}
