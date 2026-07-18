# AI PDF to E-Course Learning Platform

An enterprise-grade e-learning system that parses PDFs and generates comprehensive structured courses, quizzes, interactive mind maps, flashcards, and study companions.

## Core Features

- **Dynamic AI Course Generation**: Instantly transform textbooks, slide decks, or papers into organized multi-chapter syllabus structures.
- **Interactive Course Player**: Integrated learning deck with slide-by-slide progress, custom quizzes, and comprehensive study sheets.
- **Category & Tag Filters**: Browse and organize generated coursework with intuitive filter tabs by domains or skills.
- **Aesthetic Mind Mapping**: Explore structural dependencies of topics visually with responsive network maps.
- **PDF Export Engine**: Generate polished, beautifully formatted syllabus outlines and offline study guides in PDF format.
- **OS Terminal Simulator**: Built-in shell for computer science courses and lab practices.

## Technologies Used

- **Frontend**: React, Tailwind CSS, Lucide React, Framer Motion
- **Backend**: Node.js, Express, Google Gen AI SDK
- **PDF Generation**: JSPdf

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or Bun

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000` to start using the platform.

### Environment Setup

Create a `.env` file in the root directory and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
