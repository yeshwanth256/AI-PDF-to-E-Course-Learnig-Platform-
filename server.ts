import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Define port and setup express
const PORT = 3000;
const app = express();

// Set limits high for base64 PDF payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

import crypto from 'crypto';

// Setup Database Path
const DB_PATH = path.join(process.cwd(), 'db.json');

// JWT/Token Secret for secure authentication
const JWT_SECRET = process.env.JWT_SECRET || 'aistudio-super-secret-key-1337-abc';

// Helper: Hash password
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper: Generate Token
function generateToken(userId: string): string {
  const hash = crypto.createHmac('sha256', JWT_SECRET).update(userId).digest('hex');
  return `${userId}.${hash}`;
}

// Helper: Verify Token
function verifyToken(token: string): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [userId, hash] = parts;
  const expectedHash = crypto.createHmac('sha256', JWT_SECRET).update(userId).digest('hex');
  if (hash === expectedHash) {
    return userId;
  }
  return null;
}

// Authentication Middleware
function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  
  const token = authHeader.split(' ')[1];
  const userId = verifyToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
  }

  // Check if user still exists
  const db = getDB();
  const user = db.users?.find((u: any) => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: User not found' });
  }

  req.userId = userId;
  req.user = user;
  next();
}


// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper: Initialize/Read DB
function getDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initialDB = {
      courses: [
        {
          id: "prompt-eng-101",
          title: "Prompt Engineering Essentials",
          subtitle: "Master the art of instructing LLMs for production",
          description: "Learn core prompt engineering patterns including Few-Shot prompting, Chain of Thought, Structured Output, and ReAct framework to unlock the full potential of Large Language Models.",
          estimatedTime: "2 hours",
          difficulty: "Beginner",
          learningObjectives: [
            "Understand the mechanics of Large Language Models and tokenization",
            "Write robust system instructions and configure temperature/top-k parameters",
            "Implement Few-Shot, Chain-of-Thought, and Meta-Prompting patterns",
            "Format outputs reliably as JSON, markdown, or custom schemas"
          ],
          prerequisites: [
            "Basic understanding of software APIs",
            "Familiarity with general conversational AI tools"
          ],
          skillsLearned: [
            "Structured Prompting",
            "Chain of Thought",
            "Output Schema Engineering",
            "System Configuration"
          ],
          tags: ["AI", "Prompt Engineering", "LLM", "Developer Essentials"],
          categories: ["AI & ML", "Computer Science"],
          createdAt: new Date().toISOString(),
          mindMap: {
            nodes: [
              { id: "root", label: "Prompt Engineering Essentials", type: "course" },
              { id: "ch1", label: "Chapter 1: LLM Core Concepts", type: "chapter" },
              { id: "ch2", label: "Chapter 2: Prompting Patterns", type: "chapter" },
              { id: "l1_1", label: "1.1: Tokens & Generation Mechanics", type: "lesson" },
              { id: "l1_2", label: "1.2: System Instructions & Parameters", type: "lesson" },
              { id: "l2_1", label: "2.1: Few-Shot & Chain-of-Thought", type: "lesson" },
              { id: "l2_2", label: "2.2: Structured Output Engineering", type: "lesson" }
            ],
            edges: [
              { from: "root", to: "ch1" },
              { from: "root", to: "ch2" },
              { from: "ch1", to: "l1_1" },
              { from: "ch1", to: "l1_2" },
              { from: "ch2", to: "l2_1" },
              { from: "ch2", to: "l2_2" }
            ]
          },
          chapters: [
            {
              id: "ch1",
              title: "LLM Core Concepts",
              description: "Learn the foundational mechanisms under the hood of Large Language Models, including tokens, temperature, top_k, and context windows.",
              lessons: [
                {
                  id: "l1_1",
                  title: "Tokens & Generation Mechanics",
                  readingTime: "10 mins",
                  content: `### Introduction to Generation Mechanics

At their core, Large Language Models (LLMs) are statistical text predictors. They do not comprehend words in the way humans do; instead, they process information in numerical pieces called **tokens**.

> [!NOTE]
> A token is roughly equivalent to 4 characters or 0.75 words of English text. For example, the word "prompt" is typically a single token, whereas "unbelievable" might be split into "un", "believ", "able".

---

### How LLMs Generate Text

When you feed a prompt to an LLM, the model does the following:
1. **Tokenizes the Input**: Converts your characters into an array of token IDs.
2. **Contextual Evaluation**: Runs the tokens through billions of attention-mechanism parameters to analyze relationships between words.
3. **Probability Calculation**: Calculates the probability of every possible token in its vocabulary being the next suitable token.
4. **Sampling & Output**: Selects a token based on your sampling settings, appends it to the context, and repeats this cycle until an End-of-Sequence (EOS) token is reached.

---

### Key Generation Parameters

To write effective prompts, you must understand three critical variables that control sampling randomness:

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **Temperature** | float | 0.7 | Controls output creativity. Higher values (e.g. 1.2) cause wider sampling variance. Lower values (e.g. 0.1) force the model to select only the absolute highest probability tokens. |
| **Top-P** | float | 0.95 | Nucleus sampling. Filters the vocabulary down to the smallest set of tokens whose cumulative probability is at least P. |
| **Top-K** | integer | 40 | Limits selection to the top K most likely tokens. Reduces potential gibberish at high temperatures. |

> [!TIP]
> Use **low temperature (0.1 - 0.3)** for tasks requiring precision and reproducibility (such as mathematical computations, code syntax, or structured JSON extraction). Use **high temperature (0.8 - 1.2)** for brainstorming, creative writing, or diverse narrative outputs.`,
                  exercises: [
                    "Compare the output of a prompt generated at temperature 0.1 vs temperature 1.5",
                    "Calculate roughly how many tokens are in the sentence: 'Large Language Models are revolutionizing product design.'"
                  ]
                },
                {
                  id: "l1_2",
                  title: "System Instructions & Parameters",
                  readingTime: "12 mins",
                  content: `### The Power of System Instructions

A **System Instruction** (sometimes referred to as a System Prompt) is a high-priority, persistent instruction given to the LLM before any user conversation. It establishes the model's persona, boundaries, stylistic rules, and runtime constraints.

\`\`\`ts
// System instruction example
const systemInstruction = "You are a professional software architect. Speak concisely and use structured tables.";
\`\`\`

---

### Establishing Strong Persona Guidelines

When crafting system instructions, follow these rules:

1. **Be Precise**: Instead of saying "Don't write long code," say "Write at most 50 lines of code per file."
2. **Assign a Role**: Specify who the model is (e.g., "Senior QA Analyst", "Technical Illustrator").
3. **Set Tone and Style**: Instruct the model on how to speak (e.g., "Direct, scientific, and objective").
4. **Define Safeguards**: Set constraints to handle errors (e.g., "If you do not know the answer, respond with 'Information not present in source'").

> [!IMPORTANT]
> System instructions have a massive influence on the subsequent chat history. They are injected as an ambient guiding context that cannot easily be overridden by user inputs.`,
                  exercises: [
                    "Draft a system instruction designed to make a chatbot respond only in clean JSON.",
                    "Explain why setting boundaries in the system instruction is more effective than setting them in user prompts."
                  ]
                }
              ],
              quizzes: [
                {
                  id: "q1_1",
                  question: "What is roughly equivalent to 1 token in English text?",
                  options: [
                    "1 full page",
                    "Roughly 4 characters or 0.75 words",
                    "Exactly 1 syllable",
                    "A whole paragraph"
                  ],
                  answer: 1,
                  explanation: "A token is the base unit of text processed by an LLM, corresponding roughly to 4 characters or 0.75 words in English.",
                  hint: "It's smaller than a full word but larger than a single character."
                },
                {
                  id: "q1_2",
                  question: "Which parameter should you lower to make an LLM's responses more predictable and factual?",
                  options: [
                    "Top-K",
                    "Context Length",
                    "Temperature",
                    "Token Limit"
                  ],
                  answer: 2,
                  explanation: "Lowering the temperature decreases sampling randomness, forcing the model to pick highly probable tokens, which yields predictable and consistent outputs.",
                  hint: "Think about the thermodynamic scale—cooling down reduces molecular movement and randomness."
                }
              ],
              flashcards: [
                {
                  id: "f1_1",
                  question: "What is tokenization?",
                  answer: "The process of splitting text into smaller numerical units (tokens) so a Large Language Model can process and predict words."
                },
                {
                  id: "f1_2",
                  question: "What is the recommended Temperature for structured JSON generation?",
                  answer: "A low temperature, such as 0.0 to 0.2, to minimize randomness and guarantee structural compliance."
                }
              ]
            },
            {
              id: "ch2",
              title: "Prompting Patterns",
              description: "Explore advanced prompt design templates like Chain of Thought and Structured Outputs.",
              lessons: [
                {
                  id: "l2_1",
                  title: "Few-Shot & Chain-of-Thought",
                  readingTime: "15 mins",
                  content: `### Zero-Shot vs Few-Shot Prompting

- **Zero-Shot**: Asking the model to perform a task without giving any examples.
  *Example: "Classify this email as spam or ham: [email text]"*
- **Few-Shot**: Providing the model with 2 or more complete examples of inputs and desired outputs, showcasing the style, format, and reasoning expected.
  *Example: "Text: [A] -> Sentiment: Positive. Text: [B] -> Sentiment: Negative. Text: [C] -> Sentiment: "*

---

### Chain of Thought (CoT)

Chain of Thought is a prompting technique that instructs the model to explicitly list its step-by-step reasoning *before* outputting the final conclusion.

> [!IMPORTANT]
> LLMs compute linearly token-by-token. If you force a model to answer instantly, it has less 'cognitive workspace' to compute complex logic. Forcing it to output its reasoning step-by-step leverages intermediate tokens as scratchpad memory, significantly increasing logical and mathematical accuracy.

#### Typical Chain-of-Thought Structure:
\`\`\`
Prompt: "A company started with 10 employees, hired 5 more, and let go of 3. How many employees do they have? Think step-by-step."
Response:
1. Initial employees = 10
2. Hired 5: 10 + 5 = 15
3. Let go of 3: 15 - 3 = 12
The final answer is 12.
\`\`\``,
                  exercises: [
                    "Write a prompt using Few-Shot technique to classify reviews as positive, negative, or neutral with precise tone analysis.",
                    "Explain why Chain of Thought reduces mathematical calculation errors in LLMs."
                  ]
                }
              ],
              quizzes: [
                {
                  id: "q2_1",
                  question: "Why does Chain of Thought (CoT) prompting increase LLM reasoning accuracy?",
                  options: [
                    "It increases the vocabulary size of the model",
                    "It bypasses the temperature config",
                    "It provides a scratchpad memory in the form of intermediate output tokens",
                    "It stops the model from hallucinating completely"
                  ],
                  answer: 2,
                  explanation: "Because LLMs generate token-by-token, writing intermediate reasoning steps allows the model to calculate logical paths in its context memory before arriving at the conclusion.",
                  hint: "Think of it as showing your work in a math exam."
                }
              ],
              flashcards: [
                {
                  id: "f2_1",
                  question: "What is Few-Shot prompting?",
                  answer: "Providing the model with several exemplary input-output pairs to demonstrate the desired format, style, or task execution before requesting the final result."
                }
              ]
            }
          ]
        }
      ],
      stats: {
        learningHours: 1.2,
        learningStreak: 3,
        xpPoints: 120,
        completedLessons: [],
        completedCourses: [],
        quizScores: {},
        badges: ["Curious Explorer"],
        recentActivity: [
          {
            id: "act-1",
            type: "course_start",
            title: "Started Prompt Engineering Essentials",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            xp: 50
          }
        ]
      },
      chatHistories: {},
      certificates: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2));
  }
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  if (!db.users) db.users = [];
  if (!db.certificates) db.certificates = [];
  if (!db.courses) db.courses = [];
  return db;
}

function saveDB(db: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// Ensure database is initialized
getDB();

// API: Auth - Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required registration details' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = getDB();

    const existingUser = db.users.find((u: any) => u.email === cleanEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const userId = `usr-${Date.now()}`;
    const newUser = {
      id: userId,
      email: cleanEmail,
      name: name.trim(),
      passwordHash: hashPassword(password),
      provider: 'email',
      stats: {
        learningHours: 0,
        learningStreak: 1,
        xpPoints: 10,
        completedLessons: [],
        completedCourses: [],
        quizScores: {},
        badges: ['Fresh Mind'],
        recentActivity: [
          {
            id: `act-${Date.now()}`,
            type: 'course_start',
            title: 'Registered as E-Course Scholar',
            timestamp: new Date().toISOString(),
            xp: 10
          }
        ]
      }
    };

    db.users.push(newUser);
    saveDB(db);

    const token = generateToken(userId);
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ token, user: userWithoutPassword });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Auth - Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = getDB();

    const user = db.users.find((u: any) => u.email === cleanEmail);
    if (!user || user.provider !== 'email') {
      return res.status(400).json({ error: 'Invalid email or password combination' });
    }

    const passHash = hashPassword(password);
    if (user.passwordHash !== passHash) {
      return res.status(400).json({ error: 'Invalid email or password combination' });
    }

    // Check / Increment Streak
    const lastActivity = user.stats.recentActivity[0];
    if (lastActivity) {
      const lastDate = new Date(lastActivity.timestamp).toDateString();
      const today = new Date().toDateString();
      if (lastDate !== today) {
        user.stats.learningStreak = (user.stats.learningStreak || 0) + 1;
        user.stats.recentActivity.unshift({
          id: `act-${Date.now()}`,
          type: 'course_start',
          title: 'Daily learning streak continued!',
          timestamp: new Date().toISOString(),
          xp: 15
        });
        user.stats.xpPoints += 15;
        saveDB(db);
      }
    }

    const token = generateToken(user.id);
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Auth - OAuth (Google / GitHub simulation buttons)
app.post('/api/auth/oauth', (req, res) => {
  try {
    const { provider, email, name } = req.body;
    if (!provider || !email || !name) {
      return res.status(400).json({ error: 'Missing OAuth parameters' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = getDB();

    let user = db.users.find((u: any) => u.email === cleanEmail);

    if (!user) {
      const userId = `usr-oauth-${Date.now()}`;
      user = {
        id: userId,
        email: cleanEmail,
        name: name.trim(),
        provider: provider,
        passwordHash: '',
        stats: {
          learningHours: 0,
          learningStreak: 1,
          xpPoints: 20,
          completedLessons: [],
          completedCourses: [],
          quizScores: {},
          badges: ['Digital Scholar'],
          recentActivity: [
            {
              id: `act-${Date.now()}`,
              type: 'course_start',
              title: `Signed up securely via ${provider === 'google' ? 'Google' : 'GitHub'}`,
              timestamp: new Date().toISOString(),
              xp: 20
            }
          ]
        }
      };

      db.users.push(user);
      saveDB(db);
    } else {
      const lastActivity = user.stats.recentActivity[0];
      if (lastActivity) {
        const lastDate = new Date(lastActivity.timestamp).toDateString();
        const today = new Date().toDateString();
        if (lastDate !== today) {
          user.stats.learningStreak = (user.stats.learningStreak || 0) + 1;
          user.stats.recentActivity.unshift({
            id: `act-${Date.now()}`,
            type: 'course_start',
            title: `Logged in securely via ${provider === 'google' ? 'Google' : 'GitHub'}`,
            timestamp: new Date().toISOString(),
            xp: 15
          });
          user.stats.xpPoints += 15;
          saveDB(db);
        }
      }
    }

    const token = generateToken(user.id);
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Auth - Me
app.get('/api/auth/me', authenticate, (req: any, res) => {
  const { passwordHash: _, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
});

// API: Auth - Logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});


// API: Get user stats
app.get('/api/stats', authenticate, (req: any, res) => {
  try {
    const db = getDB();
    const userIndex = db.users.findIndex((u: any) => u.id === req.userId);
    if (userIndex !== -1) {
      const stats = db.users[userIndex].stats;
      let mutated = false;
      if (stats.dailyStudyTarget === undefined) {
        stats.dailyStudyTarget = 30;
        mutated = true;
      }
      if (stats.dailyStudyProgress === undefined) {
        stats.dailyStudyProgress = 0;
        mutated = true;
      }
      if (!stats.lastStudyDate) {
        stats.lastStudyDate = new Date().toISOString().split('T')[0];
        mutated = true;
      }
      if (!stats.completedDsa) {
        stats.completedDsa = [];
        mutated = true;
      }
      if (!stats.completedDaily) {
        stats.completedDaily = [];
        mutated = true;
      }
      if (!stats.completedWeekly) {
        stats.completedWeekly = [];
        mutated = true;
      }
      if (!stats.lastChallengeResetDate) {
        stats.lastChallengeResetDate = new Date().toISOString().split('T')[0];
        mutated = true;
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (stats.lastStudyDate !== todayStr) {
        stats.dailyStudyProgress = 0;
        stats.lastStudyDate = todayStr;
        mutated = true;
      }
      if (stats.lastChallengeResetDate !== todayStr) {
        stats.completedDaily = [];
        stats.lastChallengeResetDate = todayStr;
        mutated = true;
      }

      if (mutated) {
        saveDB(db);
      }
      res.json(stats);
    } else {
      res.json(req.user.stats);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Update study time and goal settings
app.post('/api/progress/study-time', authenticate, (req: any, res) => {
  try {
    const { dailyStudyTarget, additionalSeconds, manualMinutes } = req.body;
    const db = getDB();
    const userIndex = db.users.findIndex((u: any) => u.id === req.userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    const stats = db.users[userIndex].stats;
    
    // Ensure default study fields are initialized
    if (stats.dailyStudyTarget === undefined) stats.dailyStudyTarget = 30;
    if (stats.dailyStudyProgress === undefined) stats.dailyStudyProgress = 0;
    if (!stats.lastStudyDate) stats.lastStudyDate = new Date().toISOString().split('T')[0];

    // Daily reset check
    const todayStr = new Date().toISOString().split('T')[0];
    if (stats.lastStudyDate !== todayStr) {
      stats.dailyStudyProgress = 0;
      stats.lastStudyDate = todayStr;
    }

    // 1. Update Target if specified
    if (dailyStudyTarget !== undefined && typeof dailyStudyTarget === 'number') {
      stats.dailyStudyTarget = dailyStudyTarget;
    }

    // 2. Update Progress
    let secondsAdded = 0;
    if (additionalSeconds !== undefined && typeof additionalSeconds === 'number') {
      secondsAdded = additionalSeconds;
    }
    if (manualMinutes !== undefined && typeof manualMinutes === 'number') {
      secondsAdded += manualMinutes * 60;
    }

    if (secondsAdded > 0) {
      const prevProgress = stats.dailyStudyProgress;
      stats.dailyStudyProgress += secondsAdded;
      
      // Update overall learning hours (round to 2 decimal places)
      const hoursAdded = secondsAdded / 3600;
      stats.learningHours = parseFloat((stats.learningHours + hoursAdded).toFixed(2));

      // Check if daily study goal has just been completed/crossed
      const targetSeconds = stats.dailyStudyTarget * 60;
      if (prevProgress < targetSeconds && stats.dailyStudyProgress >= targetSeconds) {
        // Just achieved target! Award 50 XP bonus & record activity
        stats.xpPoints += 50;
        stats.recentActivity.unshift({
          id: `act-${Date.now()}-goal`,
          type: 'daily_goal_complete',
          title: `Achieved daily study target of ${stats.dailyStudyTarget} mins!`,
          timestamp: new Date().toISOString(),
          xp: 50
        });
      }
    }

    saveDB(db);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Submit a completed DSA Problem
app.post('/api/stats/dsa', authenticate, (req: any, res) => {
  try {
    const { challengeId, title, xpReward } = req.body;
    if (!challengeId || !title) {
      return res.status(400).json({ error: 'Missing challengeId or title' });
    }

    const db = getDB();
    const userIndex = db.users.findIndex((u: any) => u.id === req.userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = db.users[userIndex].stats;
    if (!stats.completedDsa) stats.completedDsa = [];
    
    const isNew = !stats.completedDsa.includes(challengeId);
    if (isNew) {
      stats.completedDsa.push(challengeId);
      
      const xp = xpReward || 30;
      stats.xpPoints += xp;
      
      if (!stats.recentActivity) stats.recentActivity = [];
      stats.recentActivity.unshift({
        id: `act-${Date.now()}-dsa`,
        type: 'dsa_complete',
        title: `Solved DSA Problem: ${title}!`,
        timestamp: new Date().toISOString(),
        xp: xp
      });

      // Check for custom badge
      if (!stats.badges) stats.badges = [];
      if (stats.completedDsa.length >= 3 && !stats.badges.includes('DSA Practitioner')) {
        stats.badges.push('DSA Practitioner');
      }
      if (stats.completedDsa.length >= 5 && !stats.badges.includes('Algorithm Master')) {
        stats.badges.push('Algorithm Master');
      }
    }

    saveDB(db);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Claim Daily Challenge or Weekly Quest Reward
app.post('/api/stats/challenge', authenticate, (req: any, res) => {
  try {
    const { type, id, title, xpReward } = req.body; // type: 'daily' | 'weekly'
    if (!type || !id || !title) {
      return res.status(400).json({ error: 'Missing type, id, or title' });
    }

    const db = getDB();
    const userIndex = db.users.findIndex((u: any) => u.id === req.userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = db.users[userIndex].stats;
    if (!stats.completedDaily) stats.completedDaily = [];
    if (!stats.completedWeekly) stats.completedWeekly = [];

    const list = type === 'daily' ? stats.completedDaily : stats.completedWeekly;
    const isNew = !list.includes(id);

    if (isNew) {
      list.push(id);
      
      const xp = xpReward || 20;
      stats.xpPoints += xp;
      
      if (!stats.recentActivity) stats.recentActivity = [];
      stats.recentActivity.unshift({
        id: `act-${Date.now()}-challenge`,
        type: type === 'daily' ? 'challenge_complete' : 'quest_complete',
        title: `${type === 'daily' ? 'Daily Challenge' : 'Weekly Quest'} Complete: ${title}`,
        timestamp: new Date().toISOString(),
        xp: xp
      });

      // Check badges for completing quests
      const questBadge = 'Grand Quester';
      if (!stats.badges) stats.badges = [];
      if (type === 'weekly' && stats.completedWeekly.length >= 2 && !stats.badges.includes(questBadge)) {
        stats.badges.push(questBadge);
      }
    }

    saveDB(db);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get AI DSA Code Review
app.post('/api/dsa/review', authenticate, async (req: any, res) => {
  try {
    const { challengeId, challengeTitle, code, userPrompt } = req.body;
    if (!challengeId || !code) {
      return res.status(400).json({ error: 'Missing challengeId or code' });
    }

    const promptText = `
You are an expert DSA (Data Structures & Algorithms) Technical Coach and Interviewer at top-tier companies like Google.
Provide a highly professional, detailed, and constructive review of the student's solution to the DSA problem: "${challengeTitle}".

The user's code:
\`\`\`javascript
${code}
\`\`\`

${userPrompt ? `The user also asked: "${userPrompt}"` : ''}

Format your response in a visually gorgeous, clean, and structured Markdown layout utilizing:
1. **Performance Metrics**: Direct estimations of Time Complexity and Space Complexity in Big-O notation.
2. **Critique & edge-cases**: Analyze whether the solution is fully correct, sub-optimal, or has bugs. What happens with empty inputs, duplicates, or extreme sizes?
3. **Actionable Suggestions**: 2-3 precise bullet points with recommended changes.
4. **Optimized Solution**: A reference, fully commented, production-grade JavaScript/TypeScript implementation showing how a Senior Staff Engineer would write this. Use appropriate spacing and modern clean code conventions.
5. **Interview Tip**: A short tactical interview advice related to this data structure or pattern.

Be friendly, technical, clear, and encouraging. Use standard Markdown styling.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
    });

    const feedback = response.text || "Unable to generate review at this moment.";
    res.json({ feedback });
  } catch (error: any) {
    console.error("Gemini DSA review error:", error);
    res.status(500).json({ error: error.message || 'Failed to generate code review from Gemini.' });
  }
});

// API: Get all courses
app.get('/api/courses', authenticate, (req: any, res) => {
  try {
    const db = getDB();
    const userId = req.userId;
    // Return course outlines (excluding base64 strings to save bandwidth)
    // Only return courses that are public (no createdBy) OR created by current user
    const userCourses = db.courses.filter((c: any) => !c.createdBy || c.createdBy === userId);
    const coursesSummary = userCourses.map((c: any) => {
      const { pdfBase64, ...rest } = c;
      return rest;
    });
    res.json(coursesSummary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get single course
app.get('/api/courses/:id', authenticate, (req: any, res) => {
  try {
    const db = getDB();
    const course = db.courses.find((c: any) => c.id === req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (course.createdBy && course.createdBy !== req.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this course' });
    }
    const { pdfBase64, ...rest } = course;
    res.json(rest);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Complete a lesson and earn XP
app.post('/api/progress/lesson', authenticate, (req: any, res) => {
  try {
    const { courseId, lessonId } = req.body;
    if (!courseId || !lessonId) {
      return res.status(400).json({ error: 'Missing courseId or lessonId' });
    }

    const db = getDB();
    const userIndex = db.users.findIndex((u: any) => u.id === req.userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    const stats = db.users[userIndex].stats;

    if (!stats.completedLessons.includes(lessonId)) {
      stats.completedLessons.push(lessonId);
      stats.xpPoints += 20; // 20 XP per completed lesson
      
      // Update learning hours
      stats.learningHours = parseFloat((stats.learningHours + 0.2).toFixed(1));

      // Record activity
      stats.recentActivity.unshift({
        id: `act-${Date.now()}`,
        type: 'lesson_complete',
        title: `Completed lesson in ${courseId === 'prompt-eng-101' ? 'Prompt Engineering' : 'Course'}`,
        timestamp: new Date().toISOString(),
        xp: 20
      });

      // Check if course completed
      const course = db.courses.find((c: any) => c.id === courseId);
      if (course) {
        const allLessonIds = course.chapters.flatMap((ch: any) => ch.lessons.map((l: any) => l.id));
        const completedInCourse = allLessonIds.filter((id: string) => stats.completedLessons.includes(id));
        
        if (completedInCourse.length === allLessonIds.length && !stats.completedCourses.includes(courseId)) {
          stats.completedCourses.push(courseId);
          stats.xpPoints += 100; // 100 XP for course completion
          stats.badges.push(`${course.title} Scholar`);
          stats.recentActivity.unshift({
            id: `act-${Date.now()}-course`,
            type: 'quiz_complete', // reuse as landmark
            title: `Graduated from: ${course.title}!`,
            timestamp: new Date().toISOString(),
            xp: 100
          });
        }
      }

      saveDB(db);
    }

    res.json({ stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Submit quiz and get scores
app.post('/api/progress/quiz', authenticate, (req: any, res) => {
  try {
    const { courseId, quizId, score } = req.body; // score is percentage (0-100)
    if (!courseId || !quizId || score === undefined) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const db = getDB();
    const userIndex = db.users.findIndex((u: any) => u.id === req.userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    const stats = db.users[userIndex].stats;

    const previousBest = stats.quizScores[quizId] || 0;
    if (score > previousBest) {
      stats.quizScores[quizId] = score;
      // Add XP based on score
      const xpEarned = Math.round(score / 5);
      stats.xpPoints += xpEarned;

      stats.recentActivity.unshift({
        id: `act-${Date.now()}`,
        type: 'quiz_complete',
        title: `Scored ${score}% on Chapter Quiz`,
        timestamp: new Date().toISOString(),
        xp: xpEarned
      });

      saveDB(db);
    }

    res.json({ stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Log completed game results and award XP/badges
app.post('/api/progress/game', authenticate, (req: any, res) => {
  try {
    const { gameId, gameTitle, difficulty, score, xpEarned, badgeEarned } = req.body;
    if (!gameId || !gameTitle || xpEarned === undefined) {
      return res.status(400).json({ error: 'Missing game parameters' });
    }

    const db = getDB();
    const userIndex = db.users.findIndex((u: any) => u.id === req.userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    const stats = db.users[userIndex].stats;

    stats.xpPoints += xpEarned;
    
    // Add learning hours as a bonus (0.5 hours for playing a game)
    stats.learningHours = parseFloat((stats.learningHours + 0.5).toFixed(1));

    // Record activity
    stats.recentActivity.unshift({
      id: `act-${Date.now()}`,
      type: 'game_complete',
      title: `PLAYED ${gameTitle.toUpperCase()} (${difficulty.toUpperCase()}): SCORED ${score} PTS`,
      timestamp: new Date().toISOString(),
      xp: xpEarned
    });

    // Award badge if any
    if (badgeEarned && !stats.badges.includes(badgeEarned)) {
      stats.badges.push(badgeEarned);
    }

    saveDB(db);
    res.json({ stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Generate / Read Lesson Content on demand
app.post('/api/lessons/generate', authenticate, async (req: any, res) => {
  try {
    const { courseId, chapterId, lessonId } = req.body;
    if (!courseId || !chapterId || !lessonId) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const db = getDB();
    const courseIndex = db.courses.findIndex((c: any) => c.id === courseId);
    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = db.courses[courseIndex];
    const chapter = course.chapters.find((ch: any) => ch.id === chapterId);
    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const lesson = chapter.lessons.find((l: any) => l.id === lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // If already generated, return it
    if (lesson.content) {
      return res.json({ content: lesson.content, exercises: lesson.exercises });
    }

    // Otherwise, generate using Gemini!
    const pdfBase64 = course.pdfBase64;
    const prompt = `You are a high-quality academic textbook publisher.
Generate the complete, highly detailed lesson content for the topic: "${lesson.title}"
which is part of the Chapter: "${chapter.title}" of the Course: "${course.title}".

The lesson content MUST be comprehensive (approx 800-1200 words), professional, and easy to read.
Use rich GitHub-Flavored Markdown. Include:
1. **Introduction**: A clear overview of the topic.
2. **Core Concepts & deep dive explanation**: Deep and technical explanations.
3. **Examples / Code snippets (where appropriate)**: Provide concrete code or numerical examples.
4. **Real World Applications**: Show how this is applied in industry or research.
5. **Key Takeaways & Summary**: Clear, bulleted summaries of what was learned.

Use custom callout blocks such as:
> [!NOTE]
> For general useful notes
> [!TIP]
> For professional advice and tips
> [!IMPORTANT]
> For critical, must-remember details

You must return the response as a JSON object matching this schema:
{
  "content": "Full markdown text...",
  "exercises": ["Exercise 1 description...", "Exercise 2 description..."]
}`;

    let contentsPayload: any[] = [prompt];
    // If we have the PDF context, use it!
    if (pdfBase64) {
      contentsPayload.unshift({
        inlineData: {
          data: pdfBase64,
          mimeType: 'application/pdf'
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contentsPayload,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            exercises: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["content", "exercises"]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    
    // Save to DB
    lesson.content = parsed.content;
    lesson.exercises = parsed.exercises;
    saveDB(db);

    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating lesson content:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Parse PDF and Generate Course structure (TOC)
app.post('/api/courses/generate', authenticate, async (req: any, res) => {
  try {
    const { pdfBase64, pdfName } = req.body;
    if (!pdfBase64) {
      return res.status(400).json({ error: 'Missing pdfBase64 payload' });
    }

    console.log(`Starting course generation for PDF: ${pdfName || 'Unnamed'}`);

    const prompt = `You are an elite educational instructional designer.
Analyze the attached PDF and design a fully comprehensive E-Learning course.
The course should be structured logically, following academic and industrial standards (similar to Coursera or Udemy).

Your response must be a JSON object that contains ALL metadata, chapter headers, lessons structure, mind map data, quizzes, and flashcards.
Do NOT write full lesson content for all lessons yet (leave lesson content empty, it will be generated on demand), BUT you must generate full detailed quiz questions and flashcards for each chapter.
For the FIRST lesson of the FIRST chapter, generate the full content immediately so the user can start learning right away!

The JSON must follow this exact schema structure:
{
  "title": "A compelling, premium course title",
  "subtitle": "An elegant subtitle summarizing the value",
  "description": "An engaging description of what the course covers (150-250 words)",
  "estimatedTime": "Total reading/completion time (e.g., '6 hours')",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "learningObjectives": ["Objective 1...", "Objective 2..."],
  "prerequisites": ["Prerequisite 1..."],
  "skillsLearned": ["Skill 1...", "Skill 2..."],
  "tags": ["Tag1", "Tag2"],
  "categories": ["Category 1", "Category 2"],
  "mindMap": {
    "nodes": [
      { "id": "root", "label": "Course Name", "type": "course" },
      { "id": "ch1", "label": "Chapter 1", "type": "chapter" },
      { "id": "l1_1", "label": "Lesson 1.1", "type": "lesson" }
    ],
    "edges": [
      { "from": "root", "to": "ch1" },
      { "from": "ch1", "to": "l1_1" }
    ]
  },
  "chapters": [
    {
      "id": "ch1",
      "title": "Chapter 1 Title",
      "description": "Brief summary of what this chapter covers",
      "lessons": [
        {
          "id": "l1_1",
          "title": "Lesson 1.1 Title",
          "readingTime": "e.g. 10 mins",
          "content": "Markdown text for the first lesson of the first chapter ONLY. Use beautiful formatting, tips, note blocks. Leave other lessons' content undefined.",
          "exercises": ["Exercise 1...", "Exercise 2..."]
        },
        {
          "id": "l1_2",
          "title": "Lesson 1.2 Title",
          "readingTime": "e.g. 12 mins"
        }
      ],
      "quizzes": [
        {
          "id": "q1_1",
          "question": "A multiple-choice question testing chapter knowledge?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": 0, // 0-based correct index
          "explanation": "Detailed explanation of why A is correct",
          "hint": "A short hint"
        }
      ],
      "flashcards": [
        {
          "id": "f1_1",
          "question": "Key concept definition?",
          "answer": "The core answer details"
        }
      ]
    }
  ]
}

Ensure you generate 3-4 chapters, with 2-3 lessons per chapter.
Ensure each chapter has at least 2 highly engaging quiz questions and 2 flashcards.
Create logical mindMap nodes and edges representing the complete course architecture.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          inlineData: {
            data: pdfBase64,
            mimeType: 'application/pdf'
          }
        },
        prompt
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            description: { type: Type.STRING },
            estimatedTime: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            learningObjectives: { type: Type.ARRAY, items: { type: Type.STRING } },
            prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
            skillsLearned: { type: Type.ARRAY, items: { type: Type.STRING } },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            categories: { type: Type.ARRAY, items: { type: Type.STRING } },
            mindMap: {
              type: Type.OBJECT,
              properties: {
                nodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      type: { type: Type.STRING }
                    },
                    required: ["id", "label", "type"]
                  }
                },
                edges: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      from: { type: Type.STRING },
                      to: { type: Type.STRING }
                    },
                    required: ["from", "to"]
                  }
                }
              },
              required: ["nodes", "edges"]
            },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  lessons: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        readingTime: { type: Type.STRING },
                        content: { type: Type.STRING },
                        exercises: { type: Type.ARRAY, items: { type: Type.STRING } }
                      },
                      required: ["id", "title", "readingTime"]
                    }
                  },
                  quizzes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.INTEGER },
                        explanation: { type: Type.STRING },
                        hint: { type: Type.STRING }
                      },
                      required: ["id", "question", "options", "answer", "explanation", "hint"]
                    }
                  },
                  flashcards: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        question: { type: Type.STRING },
                        answer: { type: Type.STRING }
                      },
                      required: ["id", "question", "answer"]
                    }
                  }
                },
                required: ["id", "title", "description", "lessons", "quizzes", "flashcards"]
              }
            }
          },
          required: ["title", "subtitle", "description", "estimatedTime", "difficulty", "learningObjectives", "prerequisites", "skillsLearned", "tags", "categories", "mindMap", "chapters"]
        }
      }
    });

    const generatedCourse = JSON.parse(response.text || '{}');
    
    // Enrich with id, dates, and pdf context
    const courseId = `course-${Date.now()}`;
    generatedCourse.id = courseId;
    generatedCourse.createdBy = req.userId; // Securely link to current user!
    generatedCourse.pdfName = pdfName || 'uploaded-syllabus.pdf';
    generatedCourse.createdAt = new Date().toISOString();
    generatedCourse.pdfBase64 = pdfBase64; // Persist base64 PDF for RAG chat

    const db = getDB();
    db.courses.push(generatedCourse);

    // Update user stats
    const userIndex = db.users.findIndex((u: any) => u.id === req.userId);
    if (userIndex !== -1) {
      const stats = db.users[userIndex].stats;
      stats.recentActivity.unshift({
        id: `act-${Date.now()}`,
        type: 'course_start',
        title: `Generated course: ${generatedCourse.title}`,
        timestamp: new Date().toISOString(),
        xp: 50
      });
      stats.xpPoints += 50;
    }

    saveDB(db);

    // Don't return base64 string to client to prevent payload bloat
    const { pdfBase64: _, ...clientCourse } = generatedCourse;
    res.json(clientCourse);
  } catch (error: any) {
    console.error('Course generation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Companion AI Chat Bot (RAG with Conversation History)
app.post('/api/chat', authenticate, async (req: any, res) => {
  try {
    const { courseId, messages } = req.body; // messages: Array of chat history
    if (!courseId || !messages || !messages.length) {
      return res.status(400).json({ error: 'Missing courseId or messages' });
    }

    const db = getDB();
    const course = db.courses.find((c: any) => c.id === courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const pdfBase64 = course.pdfBase64;
    const lastUserMessage = messages[messages.length - 1].text;

    // Build standard chat format for Gemini connection
    const conversationPrompt = `You are a highly supportive and expert AI Learning Companion for the course: "${course.title}".
Your objective is to help the student master the concepts within the course material, and specifically, the uploaded source document.

Analyze the attached PDF context, the conversation history, and answer the user's latest query accurately.
- Provide a clear, pedagogical explanation. Use clear analogies where appropriate.
- ALWAYS supply citations or referenced page/section details if the knowledge came from the source document.
- Propose follow-up questions or check-for-understanding quizzes when completing an explanation.
- Speak in a friendly, encouraging mentor tone.

You must reply with a structured JSON response matching this schema:
{
  "text": "Your markdown-formatted message answer content here...",
  "citations": [
    {
      "text": "Exact snippet or key concept referenced",
      "pageNumber": 3 // (approximate page if known, optional)
    }
  ]
}`;

    // Compile recent history
    const historyText = messages.slice(0, -1).map((m: any) => `${m.role === 'user' ? 'Student' : 'AI Companion'}: ${m.text}`).join('\n');
    const fullUserQuery = `
[CONVERSATION HISTORY]
${historyText}

[NEW STUDENT QUESTION]
${lastUserMessage}
`;

    let contentsPayload: any[] = [conversationPrompt, fullUserQuery];
    if (pdfBase64) {
      contentsPayload.unshift({
        inlineData: {
          data: pdfBase64,
          mimeType: 'application/pdf'
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contentsPayload,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            citations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  pageNumber: { type: Type.INTEGER }
                },
                required: ["text"]
              }
            }
          },
          required: ["text"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    // Add activity record for authenticated user
    const userIndex = db.users.findIndex((u: any) => u.id === req.userId);
    if (userIndex !== -1) {
      const stats = db.users[userIndex].stats;
      stats.recentActivity.unshift({
        id: `act-${Date.now()}`,
        type: 'chat_message',
        title: `Asked AI Companion in ${course.title}`,
        timestamp: new Date().toISOString(),
        xp: 5
      });
      stats.xpPoints += 5;
    }
    saveDB(db);

    res.json(result);
  } catch (error: any) {
    console.error('Chat companion failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Generate Certificates
app.post('/api/certificates', authenticate, (req: any, res) => {
  try {
    const { courseId, userName } = req.body;
    if (!courseId || !userName) {
      return res.status(400).json({ error: 'Missing courseId or userName' });
    }

    const db = getDB();
    const course = db.courses.find((c: any) => c.id === courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const certId = `CERT-${courseId.replace('course-', '').toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const certificate = {
      id: certId,
      userId: req.userId, // Link certificate to authenticated user!
      courseId,
      courseName: course.title,
      userName,
      completionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      verificationLink: `https://verify.ecourseai.build/${certId}`
    };

    db.certificates.push(certificate);
    saveDB(db);

    res.json(certificate);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get My Certificates
app.get('/api/certificates', authenticate, (req: any, res) => {
  try {
    const db = getDB();
    const userCerts = db.certificates.filter((cert: any) => cert.userId === req.userId);
    res.json(userCerts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Generate AI Video Explainer for a course in a preferred language
app.post('/api/video/generate', authenticate, async (req: any, res) => {
  try {
    const { courseId, language } = req.body;
    if (!courseId) {
      return res.status(400).json({ error: 'Missing courseId parameter' });
    }
    const targetLang = language || 'English';

    const db = getDB();
    const course = db.courses.find((c: any) => c.id === courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if we already have this exact video generated to save API quota
    db.videos = db.videos || [];
    const existingVideo = db.videos.find((v: any) => v.courseId === courseId && v.language.toLowerCase() === targetLang.toLowerCase() && v.userId === req.userId);
    if (existingVideo) {
      return res.json(existingVideo);
    }

    // Prepare structure outline
    const courseContext = {
      title: course.title,
      description: course.description,
      chapters: course.chapters.map((ch: any) => ({
        title: ch.title,
        description: ch.description,
        lessons: ch.lessons.map((l: any) => l.title)
      }))
    };

    const prompt = `You are an expert AI Video Producer and Educator.
Your task is to take the following course outline and convert it into a professional, engaging, slide-by-slide AI Explainer Video script.
The video represents an immersive multi-media lesson where a virtual AI presenter reads out a detailed explanation, accompanied by gorgeous visual slides.

CRITICAL INSTRUCTION: All student-facing content, slide titles, slide bullet points, and the voiceover speech (spokenText) MUST be written entirely in the requested language: "${targetLang}".

In the video explanation, you must:
1. Explain every topic in thorough detail, going from fundamental principles up to an ADVANCED stage.
2. Include at least one concrete, real-time real-world example in each slide's explanation/narrative.
3. Use and describe a real-time GUI simulation or interactive visual layout in the "visualPrompt" field for each slide to represent the concepts visually.

Course outline context:
${JSON.stringify(courseContext, null, 2)}

Please generate a sequence of 5 highly structured slides that explain the core themes, objectives, and modules of this course.
Your response MUST be a single clean JSON object matching this schema:
{
  "videoTitle": "A catchy, motivating video title in ${targetLang}",
  "estimatedDuration": "A simulated duration, e.g. '5 mins 20 secs'",
  "slides": [
    {
      "slideNumber": 1,
      "slideTitle": "Welcome & Headline (in ${targetLang})",
      "slidePoints": ["Point 1 in ${targetLang}", "Point 2", "Point 3"],
      "visualPrompt": "Detailed visual layout description for the slide showing GUI mockups, real-time graphics or active flowcharts (e.g. 'A high-fidelity modern dashboard GUI showing live metric streams and system architecture in real-time')",
      "spokenText": "Thorough, detailed, and advanced stage narrative speech in ${targetLang} explaining the concepts with a real-time example. (100-150 words).",
      "avatarExpression": "smiling"
    }
  ]
}

Make sure you write detailed, professional slidePoints and spokenText (must be valid, natural educational text in ${targetLang}). Do NOT mix English into the slidePoints or spokenText unless it is a standard technical term.
Valid avatarExpression values are: "smiling", "thoughtful", "explaining", "pointing", "neutral".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            videoTitle: { type: Type.STRING },
            estimatedDuration: { type: Type.STRING },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slideNumber: { type: Type.INTEGER },
                  slideTitle: { type: Type.STRING },
                  slidePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                  visualPrompt: { type: Type.STRING },
                  spokenText: { type: Type.STRING },
                  avatarExpression: { type: Type.STRING }
                },
                required: ['slideNumber', 'slideTitle', 'slidePoints', 'visualPrompt', 'spokenText', 'avatarExpression']
              }
            }
          },
          required: ['videoTitle', 'estimatedDuration', 'slides']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    
    // Create database entry
    const videoId = `vid-${Date.now()}`;
    const newVideo = {
      id: videoId,
      userId: req.userId,
      courseId,
      language: targetLang,
      videoTitle: parsedData.videoTitle || `${course.title} Explainer`,
      estimatedDuration: parsedData.estimatedDuration || '3 minutes',
      slides: parsedData.slides || [],
      createdAt: new Date().toISOString()
    };

    db.videos.push(newVideo);
    saveDB(db);

    res.json(newVideo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get My Videos for a course
app.get('/api/video/course/:courseId', authenticate, (req: any, res) => {
  try {
    const db = getDB();
    db.videos = db.videos || [];
    const userVideos = db.videos.filter((v: any) => v.courseId === req.params.courseId && v.userId === req.userId);
    res.json(userVideos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Setup Vite Dev Server / Serve Static Files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Learning Platform full-stack server running at http://localhost:${PORT}`);
  });
}

startServer();
