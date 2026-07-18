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

// Setup Database Path
const DB_PATH = path.join(process.cwd(), 'db.json');

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
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function saveDB(db: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// Ensure database is initialized
getDB();

// API: Get user stats
app.get('/api/stats', (req, res) => {
  try {
    const db = getDB();
    res.json(db.stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get all courses
app.get('/api/courses', (req, res) => {
  try {
    const db = getDB();
    // Return course outlines (excluding base64 strings to save bandwidth)
    const coursesSummary = db.courses.map((c: any) => {
      const { pdfBase64, ...rest } = c;
      return rest;
    });
    res.json(coursesSummary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get single course
app.get('/api/courses/:id', (req, res) => {
  try {
    const db = getDB();
    const course = db.courses.find((c: any) => c.id === req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const { pdfBase64, ...rest } = course;
    res.json(rest);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Complete a lesson and earn XP
app.post('/api/progress/lesson', (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    if (!courseId || !lessonId) {
      return res.status(400).json({ error: 'Missing courseId or lessonId' });
    }

    const db = getDB();
    const stats = db.stats;

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
app.post('/api/progress/quiz', (req, res) => {
  try {
    const { courseId, quizId, score } = req.body; // score is percentage (0-100)
    if (!courseId || !quizId || score === undefined) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const db = getDB();
    const stats = db.stats;

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

// API: Generate / Read Lesson Content on demand
app.post('/api/lessons/generate', async (req, res) => {
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
app.post('/api/courses/generate', async (req, res) => {
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
    generatedCourse.pdfName = pdfName || 'uploaded-syllabus.pdf';
    generatedCourse.createdAt = new Date().toISOString();
    generatedCourse.pdfBase64 = pdfBase64; // Persist base64 PDF for RAG chat

    const db = getDB();
    db.courses.push(generatedCourse);

    // Update user stats
    db.stats.recentActivity.unshift({
      id: `act-${Date.now()}`,
      type: 'course_start',
      title: `Generated course: ${generatedCourse.title}`,
      timestamp: new Date().toISOString(),
      xp: 50
    });
    db.stats.xpPoints += 50;

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
app.post('/api/chat', async (req, res) => {
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
    
    // Add activity record
    db.stats.recentActivity.unshift({
      id: `act-${Date.now()}`,
      type: 'chat_message',
      title: `Asked AI Companion in ${course.title}`,
      timestamp: new Date().toISOString(),
      xp: 5
    });
    db.stats.xpPoints += 5;
    saveDB(db);

    res.json(result);
  } catch (error: any) {
    console.error('Chat companion failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Generate Certificates
app.post('/api/certificates', (req, res) => {
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
