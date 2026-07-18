import React, { useState, useEffect, useRef } from 'react';
import { UserStats } from '../types';
import { 
  Code2, Play, CheckCircle2, ShieldAlert, Sparkles, RefreshCw, Trophy, 
  HelpCircle, ChevronRight, Zap, Terminal, Send, MessageSquareCode, Flame, HelpCircle as HintIcon, Info, RotateCcw
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer'; // We can use the existing MarkdownRenderer component!

interface DsaArenaProps {
  stats: UserStats;
  token: string | null;
  onUpdateStats: (newStats: UserStats) => void;
}

interface DsaProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Arrays' | 'Strings' | 'Stacks' | 'Linked Lists' | 'Searching' | 'Trees';
  xpReward: number;
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: string;
  // Dynamic runner verification parameters
  testCases: {
    args: any[];
    expected: any;
  }[];
  // Function to serialize arguments and run test
  testRunner: (fnStr: string, testCase: { args: any[], expected: any }, index: number) => {
    passed: boolean;
    actual: any;
    error?: string;
    logs: string[];
  };
}

// Linked List helpers for test runner
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val: number = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

function arrayToList(arr: number[]): ListNode | null {
  if (!arr || arr.length === 0) return null;
  const head = new ListNode(arr[0]);
  let current = head;
  for (let i = 1; i < arr.length; i++) {
    current.next = new ListNode(arr[i]);
    current = current.next;
  }
  return head;
}

function listToArray(head: ListNode | null): number[] {
  const arr: number[] = [];
  let current = head;
  while (current !== null) {
    arr.push(current.val);
    current = current.next;
  }
  return arr;
}

const DSA_PROBLEMS: DsaProblem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays',
    xpReward: 30,
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.
You can return the answer in any order.`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]'
      }
    ],
    starterCode: `function twoSum(nums, target) {
  // Write your code here
  // Your code must return an array, e.g. [index1, index2]
  
}`,
    testCases: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1] }
    ],
    testRunner: (fnStr, testCase, index) => {
      const logs: string[] = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };
      
      try {
        // Create function
        const userFn = new Function(`return (${fnStr})`)();
        const actual = userFn(testCase.args[0], testCase.args[1]);
        
        console.log = originalConsoleLog;

        const expectedSorted = [...testCase.expected].sort();
        const actualSorted = Array.isArray(actual) ? [...actual].sort() : [];
        const passed = Array.isArray(actual) && 
                       actualSorted.length === expectedSorted.length && 
                       actualSorted.every((val, i) => val === expectedSorted[i]);

        return { passed, actual, logs };
      } catch (err: any) {
        console.log = originalConsoleLog;
        return { passed: false, actual: null, error: err.message, logs };
      }
    }
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stacks',
    xpReward: 30,
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses characters only: "()[]{}"'
    ],
    examples: [
      {
        input: 's = "()"',
        output: 'true'
      },
      {
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        input: 's = "(]"',
        output: 'false'
      }
    ],
    starterCode: `function isValid(s) {
  // Use a stack to track opening brackets
  
}`,
    testCases: [
      { args: ["()"], expected: true },
      { args: ["()[]{}"], expected: true },
      { args: ["(]"], expected: false },
      { args: ["([)]"], expected: false },
      { args: ["{[]}"], expected: true }
    ],
    testRunner: (fnStr, testCase, index) => {
      const logs: string[] = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };
      
      try {
        const userFn = new Function(`return (${fnStr})`)();
        const actual = userFn(testCase.args[0]);
        console.log = originalConsoleLog;
        
        const passed = actual === testCase.expected;
        return { passed, actual, logs };
      } catch (err: any) {
        console.log = originalConsoleLog;
        return { passed: false, actual: null, error: err.message, logs };
      }
    }
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'Medium',
    category: 'Linked Lists',
    xpReward: 45,
    description: `Given the head of a singly linked list, reverse the list, and return its reversed list.

Singly linked list nodes are structured as:
\`\`\`javascript
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}
\`\`\``,
    constraints: [
      'The number of nodes in the list is in the range [0, 5000].',
      '-5000 <= Node.val <= 5000'
    ],
    examples: [
      {
        input: 'head = [1,2,3,4,5]',
        output: '[5,4,3,2,1]'
      },
      {
        input: 'head = [1,2]',
        output: '[2,1]'
      }
    ],
    starterCode: `function reverseList(head) {
  // head is a ListNode structure (contains head.val and head.next)
  // return the head of the reversed list
  
}`,
    testCases: [
      { args: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { args: [[1, 2]], expected: [2, 1] },
      { args: [[]], expected: [] }
    ],
    testRunner: (fnStr, testCase, index) => {
      const logs: string[] = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };
      
      try {
        // Convert input array to ListNode chain
        const listHead = arrayToList(testCase.args[0]);
        
        const userFn = new Function('ListNode', `return (${fnStr})`)(ListNode);
        const actualResult = userFn(listHead);
        
        console.log = originalConsoleLog;

        // Convert returned ListNode chain back to array for comparison
        const actualArr = listToArray(actualResult);
        
        const passed = JSON.stringify(actualArr) === JSON.stringify(testCase.expected);
        return { passed, actual: actualArr, logs };
      } catch (err: any) {
        console.log = originalConsoleLog;
        return { passed: false, actual: null, error: err.message, logs };
      }
    }
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    category: 'Searching',
    xpReward: 30,
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. 
If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All the integers in nums are unique.',
      'nums is sorted in ascending order.'
    ],
    examples: [
      {
        input: 'nums = [-1,0,3,5,9,12], target = 9',
        output: '4',
        explanation: '9 exists in nums and its index is 4'
      },
      {
        input: 'nums = [-1,0,3,5,9,12], target = 2',
        output: '-1',
        explanation: '2 does not exist in nums so we return -1'
      }
    ],
    starterCode: `function search(nums, target) {
  // Implement O(log n) binary search with low, high bounds
  
}`,
    testCases: [
      { args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { args: [[5], 5], expected: 0 }
    ],
    testRunner: (fnStr, testCase, index) => {
      const logs: string[] = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };
      
      try {
        const userFn = new Function(`return (${fnStr})`)();
        const actual = userFn(testCase.args[0], testCase.args[1]);
        console.log = originalConsoleLog;
        
        const passed = actual === testCase.expected;
        return { passed, actual, logs };
      } catch (err: any) {
        console.log = originalConsoleLog;
        return { passed: false, actual: null, error: err.message, logs };
      }
    }
  },
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    category: 'Arrays',
    xpReward: 45,
    description: `Given an array of \`intervals\` where \`intervals[i] = [starti, endi]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= starti <= endi <= 10^4'
    ],
    examples: [
      {
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].'
      },
      {
        input: 'intervals = [[1,4],[4,5]]',
        output: '[[1,5]]',
        explanation: 'Intervals [1,4] and [4,5] are considered overlapping.'
      }
    ],
    starterCode: `function merge(intervals) {
  // Sort intervals by start value first!
  
}`,
    testCases: [
      { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
      { args: [[[1, 4], [0, 4]]], expected: [[0, 4]] }
    ],
    testRunner: (fnStr, testCase, index) => {
      const logs: string[] = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };
      
      try {
        const userFn = new Function(`return (${fnStr})`)();
        const actual = userFn(testCase.args[0]);
        console.log = originalConsoleLog;
        
        const passed = JSON.stringify(actual) === JSON.stringify(testCase.expected);
        return { passed, actual, logs };
      } catch (err: any) {
        console.log = originalConsoleLog;
        return { passed: false, actual: null, error: err.message, logs };
      }
    }
  }
];

export function DsaArena({ stats, token, onUpdateStats }: DsaArenaProps) {
  const [selectedProblemId, setSelectedProblemId] = useState(DSA_PROBLEMS[0].id);
  const activeProblem = DSA_PROBLEMS.find(p => p.id === selectedProblemId) || DSA_PROBLEMS[0];
  
  // Code editor states
  const [code, setCode] = useState(activeProblem.starterCode);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [allPassed, setAllPassed] = useState<boolean | null>(null);
  
  // AI Mentor States
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [loadingAiReview, setLoadingAiReview] = useState(false);
  const [userChatPrompt, setUserChatPrompt] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  // Synchronize starter code on problem switch
  useEffect(() => {
    setCode(activeProblem.starterCode);
    setTestResults(null);
    setAllPassed(null);
    setAiReview(null);
  }, [selectedProblemId, activeProblem]);

  const runCodeTests = () => {
    setIsEvaluating(true);
    setTestResults(null);
    setAllPassed(null);

    setTimeout(() => {
      const results = activeProblem.testCases.map((tc, idx) => {
        return activeProblem.testRunner(code, tc, idx);
      });
      
      setTestResults(results);
      const passedAll = results.every(r => r.passed);
      setAllPassed(passedAll);
      setIsEvaluating(false);

      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          if (passedAll) {
            // High double success chime
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          } else {
            // Error low buzz
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(250, ctx.currentTime);
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.2);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
          }
        }
      } catch (e) {}

    }, 300);
  };

  const submitCodeToBackend = async () => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/stats/dsa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          challengeId: activeProblem.id,
          title: activeProblem.title,
          xpReward: activeProblem.xpReward
        })
      });

      if (res.ok) {
        const updatedStats = await res.json();
        onUpdateStats(updatedStats);
        setShowCelebration(true);
        
        try {
          // Sci-Fi celebratory chord
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const frequencies = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
            frequencies.forEach((f, idx) => {
              const o = ctx.createOscillator();
              const g = ctx.createGain();
              o.connect(g);
              g.connect(ctx.destination);
              o.type = 'sine';
              o.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.08);
              g.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.08);
              g.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + idx * 0.08 + 0.4);
              o.start(ctx.currentTime + idx * 0.08);
              o.stop(ctx.currentTime + idx * 0.08 + 0.4);
            });
          }
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed to submit solution:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGeminiReview = async () => {
    if (!token) return;
    setLoadingAiReview(true);
    setAiReview(null);
    try {
      const res = await fetch('/api/dsa/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          challengeId: activeProblem.id,
          challengeTitle: activeProblem.title,
          code: code,
          userPrompt: userChatPrompt.trim() || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiReview(data.feedback);
        setUserChatPrompt('');
      } else {
        setAiReview("✕ Failed to fetch review. Please verify server endpoints are active.");
      }
    } catch (err) {
      console.error('AI code review request failed:', err);
      setAiReview("✕ Failed to contact Gemini AI Reviewer.");
    } finally {
      setLoadingAiReview(false);
    }
  };

  const isAlreadySolved = (stats.completedDsa || []).includes(activeProblem.id);

  return (
    <div className="space-y-6 animate-fade-in text-[#F8F7F4] font-mono">
      
      {/* Title Header Block */}
      <div className="bg-[#18181b] border-2 border-white/10 p-6 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase block">[06] DSA PRACTICE MATRIX</span>
          <h2 className="text-2xl font-display font-extrabold text-white mt-1 uppercase flex items-center gap-2">
            <Code2 className="w-6 h-6 text-emerald-400" />
            <span>ALGORITHMIC PLAYGROUND (LEETCODE MODE)</span>
          </h2>
          <p className="text-[11px] text-[#F8F7F4]/50 leading-relaxed uppercase mt-1">
            Build clean, highly optimized logic. Run test suites locally in-browser, inspect variables, and consult Gemini for full complexity reviews.
          </p>
        </div>
        
        <div className="bg-[#111113] border border-white/5 p-3 rounded-sm text-[10px] space-y-1 self-end md:self-auto text-emerald-400 font-bold">
          <div>SOLVED PROBLEMS: {stats.completedDsa?.length || 0} / {DSA_PROBLEMS.length}</div>
          <div className="text-[#FFD700]">BADGE: {stats.badges.includes('Algorithm Master') ? 'Algorithm Master 🏆' : stats.badges.includes('DSA Practitioner') ? 'DSA Practitioner 🏆' : 'Novice' }</div>
        </div>
      </div>

      {/* Main Grid: Left Selector & Problem Details, Right Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Section (Column Span 5): Selection List and Problem Specifications */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Problem Selector Panel */}
          <div className="bg-[#18181b] border border-white/10 p-4">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-3">// SELECT TARGET PROBLEM</span>
            <div className="space-y-1 text-xs">
              {DSA_PROBLEMS.map((prob) => {
                const isSelected = prob.id === selectedProblemId;
                const isSolved = (stats.completedDsa || []).includes(prob.id);

                return (
                  <button
                    key={prob.id}
                    onClick={() => setSelectedProblemId(prob.id)}
                    className={`w-full text-left p-3 border transition-all flex items-center justify-between rounded-sm cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-400/10 border-emerald-400 text-emerald-400 font-bold' 
                        : 'border-transparent hover:bg-white/5 text-[#F8F7F4]/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="shrink-0 text-[10px]">
                        {isSolved ? (
                          <span className="text-emerald-400 font-black">✓</span>
                        ) : (
                          <span className="text-[#F8F7F4]/30">•</span>
                        )}
                      </div>
                      <div className="truncate">
                        <span className="font-extrabold block uppercase text-[11px] truncate">{prob.title}</span>
                        <span className="text-[9px] font-medium text-[#F8F7F4]/40 uppercase mt-0.5 block">{prob.category} // +{prob.xpReward} XP</span>
                      </div>
                    </div>

                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 shrink-0 ${
                      prob.difficulty === 'Easy' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {prob.difficulty}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Problem Specs */}
          <div className="bg-[#18181b] border border-white/10 p-5 space-y-5">
            <div className="border-b border-white/5 pb-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-white uppercase">{activeProblem.title}</h3>
                {isAlreadySolved && (
                  <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 font-bold uppercase">
                    Solved & Logged
                  </span>
                )}
              </div>
              <div className="flex gap-2 text-[9px] text-[#F8F7F4]/40 mt-1.5 uppercase font-bold">
                <span>Category: {activeProblem.category}</span>
                <span>•</span>
                <span className={activeProblem.difficulty === 'Easy' ? 'text-emerald-400' : 'text-amber-400'}>
                  Difficulty: {activeProblem.difficulty}
                </span>
              </div>
            </div>

            {/* Description Render */}
            <div className="text-xs text-[#F8F7F4]/80 leading-relaxed uppercase space-y-2 whitespace-pre-wrap">
              {activeProblem.description}
            </div>

            {/* Examples block */}
            <div className="space-y-3.5">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">// EXAMPLE USE CASES</span>
              {activeProblem.examples.map((ex, i) => (
                <div key={i} className="bg-[#111113] p-3.5 border border-white/5 space-y-1.5 text-[11px]">
                  <p className="text-white/40 font-bold">Example {i + 1}:</p>
                  <div>
                    <span className="text-[#F8F7F4]/50 block">Input:</span>
                    <code className="text-amber-300 block bg-black/30 p-1 font-mono text-[10px] mt-0.5">{ex.input}</code>
                  </div>
                  <div className="mt-2">
                    <span className="text-[#F8F7F4]/50 block">Output:</span>
                    <code className="text-emerald-400 block bg-black/30 p-1 font-mono text-[10px] mt-0.5">{ex.output}</code>
                  </div>
                  {ex.explanation && (
                    <p className="text-[#F8F7F4]/40 text-[10px] mt-2 italic leading-relaxed">
                      Explanation: {ex.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">// ARCHITECTURAL CONSTRAINTS</span>
              <ul className="list-inside list-disc text-[10px] text-[#F8F7F4]/50 uppercase space-y-1">
                {activeProblem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Right Section (Column Span 7): The Interactive IDE Code Workspace */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Editor Header with Reset button */}
          <div className="bg-[#18181b] border border-white/10 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wide text-white">JavaScript Code Workspace</span>
            </div>
            
            <button
              onClick={() => {
                if (window.confirm("Reset current editor code back to standard starter template?")) {
                  setCode(activeProblem.starterCode);
                  setTestResults(null);
                  setAllPassed(null);
                }
              }}
              className="px-2.5 py-1 text-[9px] border border-white/10 hover:border-amber-400 text-white/50 hover:text-amber-400 font-bold uppercase flex items-center gap-1 cursor-pointer transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Starter Template</span>
            </button>
          </div>

          {/* Interactive Code Editor (Text Area with Sidebar lines simulation) */}
          <div className="bg-[#111113] border border-white/10 flex relative font-mono text-xs shadow-md">
            
            {/* Simulation Line Numbers column */}
            <div className="bg-[#18181b] text-white/15 px-3 py-4 select-none border-r border-white/5 text-right w-11 space-y-0.5 leading-[1.65]">
              {Array.from({ length: Math.max(16, code.split('\n').length + 5) }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Real Textarea editor */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 bg-transparent text-amber-100/90 p-4 focus:outline-none resize-y min-h-[350px] font-mono leading-[1.65] font-semibold selection:bg-emerald-400 selection:text-black placeholder-white/15"
              spellCheck={false}
              placeholder="// Insert your functional DSA logic here..."
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const start = e.currentTarget.selectionStart;
                  const end = e.currentTarget.selectionEnd;
                  const target = e.currentTarget;
                  setCode(prev => prev.substring(0, start) + "  " + prev.substring(end));
                  setTimeout(() => {
                    target.selectionStart = target.selectionEnd = start + 2;
                  }, 0);
                }
              }}
            />
          </div>

          {/* Workspace Action Bar */}
          <div className="flex flex-wrap gap-2 justify-between items-center bg-[#18181b] border border-white/10 p-4">
            
            <div className="flex gap-2">
              <button
                onClick={runCodeTests}
                disabled={isEvaluating}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 text-[#F8F7F4]/90 font-bold uppercase text-[10px] tracking-wider transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
              >
                {isEvaluating ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <Play className="w-3.5 h-3.5 fill-white stroke-none" />}
                <span>Run Code Tests</span>
              </button>

              {allPassed && (
                <button
                  onClick={submitCodeToBackend}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-400 text-emerald-950 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-300 transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(52,211,153,0.1)]"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>SUBMIT SOLUTION</span>
                </button>
              )}
            </div>

            <span className="text-[9px] text-[#F8F7F4]/30 uppercase font-bold">In-Browser JS Compiler (Sandboxed)</span>
          </div>

          {/* Test Case Outputs Panel */}
          {testResults && (
            <div className="bg-[#18181b] border border-white/10 p-5 font-mono space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Test suite metrics</span>
                </span>
                
                {allPassed ? (
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 font-bold uppercase animate-bounce" style={{ animationDuration: '3s' }}>
                    ✓ ALL TEST CASES PASSED (+{activeProblem.xpReward} XP READY)
                  </span>
                ) : (
                  <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 font-bold uppercase">
                    ✕ FAILURES DETECTED IN LOGIC
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {testResults.map((res, i) => {
                  const tc = activeProblem.testCases[i];
                  return (
                    <div key={i} className={`p-3 border text-xs ${res.passed ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'border-red-500/20 bg-red-500/[0.02]'}`}>
                      <div className="flex justify-between items-center mb-2 font-bold">
                        <span className="uppercase text-[10px]">Test Case {i + 1}</span>
                        <span className={res.passed ? 'text-emerald-400' : 'text-red-400'}>
                          {res.passed ? '✓ PASSED' : '✕ FAILED'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-[#F8F7F4]/50 uppercase mt-2 border-t border-white/5 pt-2">
                        <div>
                          <span>Input params:</span>
                          <span className="text-[#F8F7F4]/80 block font-semibold truncate bg-black/20 p-1 mt-0.5">
                            {JSON.stringify(tc.args)}
                          </span>
                        </div>
                        <div>
                          <span>Expected Return:</span>
                          <span className="text-emerald-400 block font-semibold truncate bg-black/20 p-1 mt-0.5">
                            {JSON.stringify(tc.expected)}
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] text-[#F8F7F4]/50 uppercase mt-2">
                        <span>Actual Return:</span>
                        <span className={`block font-semibold truncate bg-black/20 p-1 mt-0.5 ${res.passed ? 'text-emerald-400' : 'text-red-400 font-bold'}`}>
                          {res.error ? `Error: ${res.error}` : JSON.stringify(res.actual)}
                        </span>
                      </div>

                      {/* Display captured console.logs if any */}
                      {res.logs && res.logs.length > 0 && (
                        <div className="mt-2.5 bg-black/50 border border-white/5 p-2.5 rounded-sm">
                          <p className="text-[8px] text-white/30 uppercase font-black tracking-wider mb-1">Captured stdout console.log:</p>
                          <div className="space-y-0.5 max-h-16 overflow-y-auto text-[9px] text-[#F8F7F4]/60 font-mono">
                            {res.logs.map((log, lIdx) => (
                              <div key={lIdx}>&gt; {log}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI DSA Mentor Panel */}
          <div className="bg-[#18181b] border border-white/10 p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <MessageSquareCode className="w-4 h-4 text-amber-400" />
                <span>AI DSA COACH (GEMINI-2.5-FLASH)</span>
              </span>
              
              <span className="text-[8px] border border-white/10 text-white/40 px-1.5 py-0.5 uppercase">
                Enterprise AI active
              </span>
            </div>

            <p className="text-[10px] text-[#F8F7F4]/50 uppercase leading-relaxed">
              Stuck? Request a deep algorithmic code review! Gemini will inspect your variables, identify hidden boundary bugs, calculate big-O performance, and draft a clean Senior reference solution.
            </p>

            {/* Custom AI Chat prompts */}
            <div className="flex gap-2">
              <input
                type="text"
                value={userChatPrompt}
                onChange={(e) => setUserChatPrompt(e.target.value)}
                className="flex-1 bg-[#111113] border border-white/10 text-xs text-white p-2.5 focus:border-amber-400 focus:outline-none"
                placeholder="Ask AI Coach a question, e.g. 'How can I solve this in O(1) space?'..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    getGeminiReview();
                  }
                }}
              />
              <button
                onClick={getGeminiReview}
                disabled={loadingAiReview}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black uppercase text-[10px] tracking-wider transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
              >
                {loadingAiReview ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>ASK AI</span>
              </button>
            </div>

            {/* AI Review Result rendering with MarkdownRenderer */}
            {aiReview ? (
              <div className="bg-[#111113] border border-white/5 p-4 mt-2 max-h-[500px] overflow-y-auto relative animate-fade-in text-xs leading-relaxed text-[#F8F7F4]/90 uppercase">
                <div className="absolute top-2 right-2 text-[8px] bg-white/5 border border-white/10 text-[#F8F7F4]/40 px-1.5 py-0.5 font-bold uppercase">
                  Gemini Code feedback
                </div>
                
                {/* Visual rendering of AI analysis */}
                <div className="prose prose-invert max-w-none text-left">
                  <MarkdownRenderer content={aiReview} />
                </div>
              </div>
            ) : (
              loadingAiReview && (
                <div className="bg-[#111113] border border-white/5 p-8 text-center text-xs text-[#F8F7F4]/50 animate-pulse uppercase">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-2" />
                  <span>Decompiling abstract syntax trees // Reviewing big-O scaling metrics with Gemini...</span>
                </div>
              )
            )}

          </div>

        </div>

      </div>

      {/* Confetti / Celebration Modal on Solution Submit Success */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in font-mono text-center">
          <div className="bg-[#18181b] border-2 border-emerald-400 max-w-md w-full p-8 shadow-[0_0_35px_rgba(52,211,153,0.2)] relative">
            
            {/* Absolute close button */}
            <button 
              onClick={() => setShowCelebration(false)} 
              className="absolute top-3 right-3 text-white/40 hover:text-white text-xs cursor-pointer"
            >
              [X] CLOSE
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
              <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>

            <span className="text-[9px] text-emerald-400 font-bold tracking-widest uppercase block mb-1">CONGRATULATIONS WARRIOR</span>
            <h3 className="text-xl font-display font-black text-white uppercase mb-2">CHALLENGE SOLVED SUCCESSFULLY!</h3>
            
            <p className="text-[10px] text-[#F8F7F4]/50 leading-relaxed uppercase mb-5">
              Your solution to **{activeProblem.title}** has compiled correctly and completed all validation cases within expected time margins.
            </p>

            <div className="bg-[#111113] border border-white/5 p-4 mb-6 flex justify-around items-center text-left">
              <div>
                <span className="text-[8px] text-[#F8F7F4]/40 block uppercase">REWARD RECEIVED</span>
                <span className="text-sm font-extrabold text-[#FFD700] uppercase mt-0.5">+{activeProblem.xpReward} XP POINTS</span>
              </div>
              <div className="border-l border-white/10 h-8" />
              <div>
                <span className="text-[8px] text-[#F8F7F4]/40 block uppercase">CURRENT LEVEL</span>
                <span className="text-sm font-extrabold text-[#F8F7F4] uppercase mt-0.5">LVL {Math.floor(stats.xpPoints / 100) + 1}</span>
              </div>
            </div>

            <button
              onClick={() => setShowCelebration(false)}
              className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black uppercase text-xs tracking-wider transition-all cursor-pointer"
            >
              CONTINUE JOURNEY
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
