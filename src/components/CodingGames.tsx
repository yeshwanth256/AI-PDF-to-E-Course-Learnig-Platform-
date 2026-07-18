import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Play, RotateCcw, AlertCircle, CheckCircle2, ShieldCheck, 
  Trophy, Sparkles, Zap, BrainCircuit, Code2, Server, HelpCircle, 
  Layers, Flame, ArrowRight, Database, Globe, Cpu, ChevronRight, Volume2, VolumeX
} from 'lucide-react';
import { UserStats } from '../types';

interface CodingGamesProps {
  stats: UserStats;
  token: string | null;
  onUpdateStats: (newStats: UserStats) => void;
}

type GameType = 'syntax_strike' | 'dsa_dungeon' | 'system_architect';
type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

// GAME 1 DATA: Syntax Strike Challenges
interface SyntaxChallenge {
  id: string;
  language: string;
  level: DifficultyLevel;
  scenario: string;
  buggyCode: string;
  instructions: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  expectedConsole: string;
}

export interface LanguageCategory {
  name: string;
  languages: string[];
}

export const LANGUAGE_CATEGORIES: LanguageCategory[] = [
  {
    name: 'Web & Scripting',
    languages: ['Python', 'JavaScript', 'TypeScript', 'PHP', 'Ruby']
  },
  {
    name: 'Systems & Enterprise',
    languages: ['Java', 'C#', 'C++', 'C', 'Rust', 'Go (Golang)']
  },
  {
    name: 'Mobile Apps',
    languages: ['Swift', 'Kotlin', 'Dart']
  },
  {
    name: 'Data & Science',
    languages: ['SQL', 'R', 'MATLAB', 'Julia']
  },
  {
    name: 'Infrastructure',
    languages: ['Shell (Bash)', 'COBOL']
  }
];

const SYNTAX_CHALLENGES: SyntaxChallenge[] = [
  // 1. PYTHON
  {
    id: 'py-beg',
    language: 'Python',
    level: 'Beginner',
    scenario: 'List comprehension conditional syntax',
    buggyCode: `# Extract even squares from collection\nnumbers = [1, 2, 3, 4, 5, 6]\neven_squares = [x**2 for x in numbers if x % 2 = 0]`,
    instructions: 'In Python, list comprehensions use correct operators. Find the syntax bug.',
    options: [
      { text: 'Use double equals "==" instead of single "=" in the conditional suffix', isCorrect: true, explanation: 'In Python, "=" is used exclusively for variable assignments. Checking for equality requires "==".' },
      { text: 'Replace "for x in numbers" with "for each x in numbers"', isCorrect: false, explanation: 'There is no "for each" keyword in standard Python.' }
    ],
    expectedConsole: 'SyntaxError: invalid syntax. Line 3: "if x % 2 = 0"'
  },
  {
    id: 'py-int',
    language: 'Python',
    level: 'Intermediate',
    scenario: 'Mutable Default Argument Side Effect',
    buggyCode: `def append_to_list(val, my_list=[]):\n    my_list.append(val)\n    return my_list\n\n# Dynamic instantiations share state!`,
    instructions: 'Default parameters evaluate once at definition. Correct the function design.',
    options: [
      { text: 'Use "my_list=None" and initialize inside: "if my_list is None: my_list = []"', isCorrect: true, explanation: 'Using None as a default argument is the Pythonic way to implement optional mutable arguments.' },
      { text: 'Convert definition signature to: "my_list=list()"', isCorrect: false, explanation: 'Calling list() in the signature still instantiates the list object only once.' }
    ],
    expectedConsole: 'Unexpected mutable memory state persistence across calls.'
  },
  {
    id: 'py-adv',
    language: 'Python',
    level: 'Advanced',
    scenario: 'Metaclass Custom Class Constraint Validation',
    buggyCode: `class Meta(type):\n    def __new__(cls, name, bases, dct):\n        if "execute" not in dct:\n            raise TypeError("Required method \'execute\' missing")\n        return super().__new__(cls, name, bases, dct)`,
    instructions: 'Understand metaclass __new__ interceptors and namespace structures.',
    options: [
      { text: 'Metaclasses intercept class initialization; __new__ receives cls as the class namespace before instantiation', isCorrect: true, explanation: 'The __new__ method of a metaclass runs during type construction, allowing strict interface validation.' },
      { text: 'The __new__ method of a metaclass must return self', isCorrect: false, explanation: 'It must return the constructed type object via super().__new__.' }
    ],
    expectedConsole: 'TypeError: Required method \'execute\' missing'
  },

  // 2. JAVASCRIPT
  {
    id: 'js-beg',
    language: 'JavaScript',
    level: 'Beginner',
    scenario: 'Constant Variable Mutation Panic',
    buggyCode: `const userAge = 25;\nuserAge = 26; // Update user age\nconsole.log(userAge);`,
    instructions: 'Identify why this script crashes in runtime.',
    options: [
      { text: 'Reassigning a value to a "const" variable is illegal; use "let" instead', isCorrect: true, explanation: 'Variables declared with "const" are block-scoped and cannot be reassigned.' },
      { text: 'Change declaration to "define userAge = 25;"', isCorrect: false, explanation: 'There is no "define" keyword in JavaScript.' }
    ],
    expectedConsole: 'TypeError: Assignment to constant variable.'
  },
  {
    id: 'js-int',
    language: 'JavaScript',
    level: 'Intermediate',
    scenario: 'Asynchronous Event Loop Closure Capture',
    buggyCode: `for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}\n// Console prints: 3, 3, 3 (Not 0, 1, 2)`,
    instructions: 'Correct the scoping of "var" variable in loops.',
    options: [
      { text: 'Change "var i" declaration to block-scoped "let i"', isCorrect: true, explanation: '"let" creates a new binding for each loop iteration, whereas "var" is function-scoped and shares a single mutable binding.' },
      { text: 'Replace "setTimeout" callback with synchronous eval()', isCorrect: false, explanation: 'Using eval() is bad practice and doesn\'t fix asynchronous scoping.' }
    ],
    expectedConsole: 'Scoping Error: All timeout callbacks capture the final state of shared variable i.'
  },
  {
    id: 'js-adv',
    language: 'JavaScript',
    level: 'Advanced',
    scenario: 'Prototypical Inheritance Context Conflict',
    buggyCode: `function Animal() {}\nAnimal.prototype.speak = function() { return "Sound"; };\n\nfunction Dog() {}\nDog.prototype = Animal.prototype; // Mismatched reference mapping`,
    instructions: 'Point out the danger of direct prototype assignment.',
    options: [
      { text: 'Use Object.create(Animal.prototype) to inherit without sharing the same reference object', isCorrect: true, explanation: 'Direct prototype assignment makes Dog.prototype and Animal.prototype point to the same object. Any changes to Dog will corrupt Animal.' },
      { text: 'Decorate prototype mapping using static getters', isCorrect: false, explanation: 'Getters do not resolve standard class-level prototype chain linkages.' }
    ],
    expectedConsole: 'Reference Corruption: Overriding Dog prototype methods breaks the Animal prototype.'
  },

  // 3. TYPESCRIPT
  {
    id: 'ts-beg',
    language: 'TypeScript',
    level: 'Beginner',
    scenario: 'Mismatched Parameter Type assignment',
    buggyCode: `let score: number = 95;\nscore = "Passed"; // Try string assignment`,
    instructions: 'Identify how the TypeScript compiler prevents type errors.',
    options: [
      { text: 'TypeScript enforces static type safety; assigning a string to a number-typed variable causes compilation errors', isCorrect: true, explanation: 'Once declared as number, TypeScript prevents other types from being assigned to prevent runtime type errors.' },
      { text: 'Typecasting is done automatically using the "cast" prefix', isCorrect: false, explanation: 'TypeScript does not have an automatic runtime "cast" keyword.' }
    ],
    expectedConsole: 'Type \'string\' is not assignable to type \'number\'.'
  },
  {
    id: 'ts-int',
    language: 'TypeScript',
    level: 'Intermediate',
    scenario: 'Discriminated Unions Exhaustiveness',
    buggyCode: `interface Circle { kind: "circle"; radius: number; }\ninterface Square { kind: "square"; size: number; }\ntype Shape = Circle | Square;\n\nfunction getArea(s: Shape) {\n  switch(s.kind) {\n    case "circle": return Math.PI * s.radius ** 2;\n  }\n}`,
    instructions: 'The compiler warns that square isn\'t handled. Force exhaustiveness checking.',
    options: [
      { text: 'Add "case \'square\'" or handle the default fallback with an exhaustiveness check ("const _exhaustive: never = s")', isCorrect: true, explanation: 'Using the "never" type triggers a compilation error if any union case remains unhandled in your conditional switches.' },
      { text: 'Mark s parameter as optional ("s?: Shape")', isCorrect: false, explanation: 'Marking parameters as optional does not solve switch-case completeness checks.' }
    ],
    expectedConsole: 'Error: Function lacks ending return statement and return type excludes undefined.'
  },
  {
    id: 'ts-adv',
    language: 'TypeScript',
    level: 'Advanced',
    scenario: 'Advanced Conditional Type Utility Extraction',
    buggyCode: `type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;\n// Type constraint check validation`,
    instructions: 'Explain how TypeScript infers types in conditional types.',
    options: [
      { text: 'The "infer" keyword allows declaring a type variable inside the extends clause to extract dynamic generics on resolution', isCorrect: true, explanation: '"infer" is a powerful keyword in conditional types that lets TypeScript automatically figure out and capture generic argument parameters.' },
      { text: 'Infer can only be used with standard objects, not Promise interfaces', isCorrect: false, explanation: 'Infer is fully compatible with any wrapped generic class, interface, or function signature.' }
    ],
    expectedConsole: 'Infers and unwraps Promise type successfully: UnwrapPromise<Promise<string>> resolves to string.'
  },

  // 4. PHP
  {
    id: 'php-beg',
    language: 'PHP',
    level: 'Beginner',
    scenario: 'Missing Dollar Variable Sign',
    buggyCode: `<?php\nusername = "Admin";\necho username;\n?>`,
    instructions: 'PHP variables require specific syntax prefix identifiers. Spot the bug.',
    options: [
      { text: 'Prepend all variable identifiers with the "$" sign: "$username = \'Admin\';"', isCorrect: true, explanation: 'PHP syntax mandates that all variable names start with a dollar sign ($).' },
      { text: 'Replace "echo" with "print_r_string"', isCorrect: false, explanation: '"echo" is standard for outputting values in PHP; print_r_string is non-existent.' }
    ],
    expectedConsole: 'Parse error: syntax error, unexpected token "=" in line 2'
  },
  {
    id: 'php-int',
    language: 'PHP',
    level: 'Intermediate',
    scenario: 'SQL Injection via Concatenated String',
    buggyCode: `<?php\n$userId = $_GET["id"];\n$query = "SELECT * FROM users WHERE id = " . $userId;\n$db->query($query);\n?>`,
    instructions: 'SQL strings shouldn\'t be concatenated directly. Identify the best fix.',
    options: [
      { text: 'Use PDO Prepared Statements and bind params: "$stmt = $db->prepare(\'... id = :id\'); $stmt->execute([\'id\' => $userId]);"', isCorrect: true, explanation: 'Prepared statements isolate variables from the SQL structure, completely neutralizing SQL injection risks.' },
      { text: 'Wrap the query inside the "htmlspecialchars()" function', isCorrect: false, explanation: 'htmlspecialchars() sanitizes HTML tags for browser rendering, not raw SQL strings.' }
    ],
    expectedConsole: 'Security Risk: SQL Injection detected via unescaped client input parameters.'
  },
  {
    id: 'php-adv',
    language: 'PHP',
    level: 'Advanced',
    scenario: 'Strict Type Mode Declaration',
    buggyCode: `<?php\nfunction addNumbers(int $a, int $b): int {\n    return $a + $b;\n}\naddNumbers(1.5, 2.5); // PHP converts this implicitly if not in strict mode!`,
    instructions: 'How do you force strict type validations in PHP modern code?',
    options: [
      { text: 'Declare strict types at the very top of the script: "declare(strict_types=1);"', isCorrect: true, explanation: 'Adding this declaration forces PHP to throw TypeError when argument types do not match exactly, disabling implicit type coercions.' },
      { text: 'Decorate parameters with "static" prefix modifiers', isCorrect: false, explanation: '"static" alters variable persistence lifetimes, not strict validation criteria.' }
    ],
    expectedConsole: 'TypeError: Argument 1 passed to addNumbers() must be of type int, float given'
  },

  // 5. RUBY
  {
    id: 'ruby-beg',
    language: 'Ruby',
    level: 'Beginner',
    scenario: 'Implicit Block Invocation Error',
    buggyCode: `def perform_action\n  yield\nend\nperform_action # Raises error when no block is supplied!`,
    instructions: 'How do you prevent a LocalJumpError in block yields?',
    options: [
      { text: 'Check if block is given first: "yield if block_given?"', isCorrect: true, explanation: '"block_given?" is a built-in Ruby checker that validates whether a block was supplied to the function call.' },
      { text: 'Use "rescue LocalJumpError" in definition parameters', isCorrect: false, explanation: 'Using rescue is inefficient and computationally expensive compared to a simple guard clause.' }
    ],
    expectedConsole: 'LocalJumpError: no block given (yield)'
  },
  {
    id: 'ruby-int',
    language: 'Ruby',
    level: 'Intermediate',
    scenario: 'Metaprogramming method_missing safety',
    buggyCode: `class DynamicRunner\n  def method_missing(name, *args)\n    "Handled: #{name}"\n  end\nend`,
    instructions: 'When overriding method_missing, which matching utility should always be updated?',
    options: [
      { text: 'Always override "respond_to_missing?(method_name, include_private)" to maintain object reflection', isCorrect: true, explanation: 'If you override method_missing, you must also override respond_to_missing? so object.respond_to? reflects method availability correctly.' },
      { text: 'Override standard "method_exists?" class helper', isCorrect: false, explanation: 'Ruby doesn\'t use "method_exists?". It relies on "respond_to?".' }
    ],
    expectedConsole: 'Reflection Mismatch: Object responds with handles, but respond_to? returns false.'
  },
  {
    id: 'ruby-adv',
    language: 'Ruby',
    level: 'Advanced',
    scenario: 'Singleton class (Eigenclass) instance scoping',
    buggyCode: `class User\n  class << self\n    def fetch_records; "Fetched"; end\n  end\nend`,
    instructions: 'Identify what "class << self" accomplishes in Ruby class structures.',
    options: [
      { text: 'It opens the User class\'s Eigenclass/Singleton class, allowing definition of class-level methods', isCorrect: true, explanation: 'In Ruby, class << self shifts self to the singleton class of the current scope, establishing true class methods.' },
      { text: 'It instantiates an anonymous subclass subclassed from self', isCorrect: false, explanation: 'No subclassing occurs; it simply scopes dynamic actions on the static class context.' }
    ],
    expectedConsole: 'Configures class static accessor methods successfully.'
  },

  // 6. JAVA
  {
    id: 'java-beg',
    language: 'Java',
    level: 'Beginner',
    scenario: 'Mismatched Main Method Signature',
    buggyCode: `public class Main {\n    public void main(String args) {\n        System.out.println("Start");\n    }\n}`,
    instructions: 'Identify why the Java JVM runtime launcher fails to boot this class.',
    options: [
      { text: 'The entry point must be static and accept an array: "public static void main(String[] args)"', isCorrect: true, explanation: 'The JVM requires a very specific main method signature: public static void main, accepting a String array argument.' },
      { text: 'Change void to static and make arguments an object list', isCorrect: false, explanation: 'The JVM expects exactly a String array "String[]" or varargs "String..." to capture CLI arguments.' }
    ],
    expectedConsole: 'Error: Main method not found in class Main, please define the main method as...'
  },
  {
    id: 'java-int',
    language: 'Java',
    level: 'Intermediate',
    scenario: 'Generic Array Direct Instantiation',
    buggyCode: `public class Box<T> {\n    private T[] elements = new T[10]; // Compile Error!\n}`,
    instructions: 'Java uses Type Erasure. Identify why direct creation of a generic array fails.',
    options: [
      { text: 'Java arrays need concrete runtime types. Create Object array and cast: "(T[]) new Object[10]" or use Reflection', isCorrect: true, explanation: 'Due to Type Erasure, generic types are removed at compile-time. Hence, "new T[]" is prohibited.' },
      { text: 'Declare array elements as final without initialization', isCorrect: false, explanation: 'If it\'s final, it still needs initialization, which does not bypass type erasure limits.' }
    ],
    expectedConsole: 'Generic Exception: Cannot create a generic array of T'
  },
  {
    id: 'java-adv',
    language: 'Java',
    level: 'Advanced',
    scenario: 'Double-Checked Lock Volatile Barrier',
    buggyCode: `public class Cache {\n    private static Cache instance;\n    public static Cache get() {\n        if (instance == null) {\n            synchronized(Cache.class) {\n                if (instance == null) instance = new Cache();\n            }\n        }\n        return instance;\n    }\n}`,
    instructions: 'In multi-threaded environments, what is missing to make this double-checked lock thread-safe?',
    options: [
      { text: 'Declare instance variable as "volatile" to guarantee instruction ordering memory barriers', isCorrect: true, explanation: 'Without "volatile", other threads might see a partially constructed instance due to compiler optimization reordering.' },
      { text: 'Wrap synchronized blocks inside a static loop', isCorrect: false, explanation: 'Loops introduce high thread locks and connection delays, leaving the memory instruction order bug unresolved.' }
    ],
    expectedConsole: 'Concurrency Mismatch: Thread reads uninitialized memory address of cached instance.'
  },

  // 7. C#
  {
    id: 'cs-beg',
    language: 'C#',
    level: 'Beginner',
    scenario: 'Value types null assignment safety',
    buggyCode: `int userRank = null; // Compile error!\nConsole.WriteLine(userRank);`,
    instructions: 'In C#, standard primitive variables cannot hold null values. Solve it.',
    options: [
      { text: 'Declare as a nullable integer: "int? userRank = null;"', isCorrect: true, explanation: 'Appending a question mark to a value type (int?) creates a Nullable<T> wrapper allowing null assignment.' },
      { text: 'Assign default null using casting: "userRank = (int)null;"', isCorrect: false, explanation: 'Casting null to a non-nullable int will throw a compilation error.' }
    ],
    expectedConsole: 'Compiler Error CS0037: Cannot convert null to \'int\' because it is a non-nullable value type.'
  },
  {
    id: 'cs-int',
    language: 'C#',
    level: 'Intermediate',
    scenario: 'LINQ Query Deferred Side Effect',
    buggyCode: `var items = new List<int> { 1, 2, 3 };\nvar query = items.Where(x => x > 1);\nitems.Add(4);\nConsole.WriteLine(query.Count()); // Returns count 3, wait, we expected 2!`,
    instructions: 'Understand the concept of Deferred Execution in LINQ operations.',
    options: [
      { text: 'LINQ queries execute on evaluation, not on declaration. Call ".ToList()" to force immediate execution', isCorrect: true, explanation: 'LINQ uses lazy evaluation. Appending .ToList() compiles and stores the result immediately, locking in the state.' },
      { text: 'Mark items collection with static access', isCorrect: false, explanation: 'Static scope has no effect on LINQ deferred execution mechanisms.' }
    ],
    expectedConsole: 'Uncached evaluation counts dynamic list updates inside active stream loops.'
  },
  {
    id: 'cs-adv',
    language: 'C#',
    level: 'Advanced',
    scenario: 'Task Async Deadlocks on Sync Wait',
    buggyCode: `public async Task<string> FetchData() {\n    await Task.Delay(100);\n    return "done";\n}\npublic void UpdateUI() {\n    var res = FetchData().Result; // Deadlock risk!\n}`,
    instructions: 'Describe why calling ".Result" on async tasks inside a UI context creates deadlocks.',
    options: [
      { text: 'Blocking UI threads via ".Result" starves the SynchronizationContext callback scheduler. Use "await FetchData()"', isCorrect: true, explanation: 'Mixing sync blocking with async wait traps the task runner, as the callback queue is locked by the waiting main thread.' },
      { text: 'Increase thread priorities inside AppDomain', isCorrect: false, explanation: 'Thread priority changes do not resolve underlying thread deadlock synchronization blocks.' }
    ],
    expectedConsole: 'System Deadlock: Active thread blocks while waiting for delays on the same synchronization channel.'
  },

  // 8. C++
  {
    id: 'cpp-beg',
    language: 'C++',
    level: 'Beginner',
    scenario: 'Pointer Access Mismatched Syntax',
    buggyCode: `#include <iostream>\nint main() {\n    int val = 100;\n    int* ptr = val; // Mismatch!\n}`,
    instructions: 'C++ pointers must store memory addresses. Retrieve val\'s address.',
    options: [
      { text: 'Use reference address-of operator "&": "int* ptr = &val;"', isCorrect: true, explanation: 'Pointers store addresses. The address-of operator (&) extracts the memory location of variables.' },
      { text: 'Use dereference symbol: "int* ptr = *val;"', isCorrect: false, explanation: 'Dereferencing an integer value tries to treat its value as a memory pointer, causing severe segmentation crashes.' }
    ],
    expectedConsole: 'error: cannot convert \'int\' to \'int*\' in assignment'
  },
  {
    id: 'cpp-int',
    language: 'C++',
    level: 'Intermediate',
    scenario: 'Polymorphic Base Destructor Memory Leak',
    buggyCode: `class Base { public: ~Base() {} };\nclass Derived : public Base { int* data = new int[50]; };\nBase* b = new Derived();\ndelete b; // Only Base destructor is called! Memory leak!`,
    instructions: 'How do you ensure polymorphic subclass destructors run during cleanup?',
    options: [
      { text: 'Declare Base destructor as virtual: "virtual ~Base() {}"', isCorrect: true, explanation: 'Declaring the base class destructor virtual ensures that the derived class destructor is invoked first during polymorph deletions.' },
      { text: 'Make base class a static struct template', isCorrect: false, explanation: 'Making classes templates does not configure runtime virtual method dispatch table (vtable) rules.' }
    ],
    expectedConsole: 'Memory Leak: Destructor Derived class data arrays bypassed during polymorphic deletion.'
  },
  {
    id: 'cpp-adv',
    language: 'C++',
    level: 'Advanced',
    scenario: 'SFINAE (Substitution Failure Is Not An Error) constraints',
    buggyCode: `template <typename T>\ntypename T::type process(T t) { return typename T::type(); }\n// Custom overload resolution`,
    instructions: 'Describe the core compiler mechanism of templates under SFINAE guidelines.',
    options: [
      { text: 'SFINAE dictates that if a template parameter substitution yields an invalid signature, the compiler skips it silently instead of throwing errors', isCorrect: true, explanation: 'SFINAE allows overloading templates based on type characteristics, routing to successful substitutions automatically.' },
      { text: 'It enforces run-time polymorphism checks inside compiler registers', isCorrect: false, explanation: 'Template instantiation occurs strictly at compile-time; vtables handle run-time polymorphism.' }
    ],
    expectedConsole: 'Overload resolution completes without throwing compilation errors.'
  },

  // 9. C
  {
    id: 'c-beg',
    language: 'C',
    level: 'Beginner',
    scenario: 'Formatted Printf String specifier mismatch',
    buggyCode: `#include <stdio.h>\nint main() {\n    char* name = "C Lang";\n    printf("Welcome %d", name); // Mismatched specifier\n}`,
    instructions: 'Correct the format specifier to display a text string instead of integer decimal.',
    options: [
      { text: 'Use "%s" specifier for null-terminated strings: "printf(\'Welcome %s\', name);"', isCorrect: true, explanation: '"%d" is for integers; "%s" is the correct format specifier for strings.' },
      { text: 'Convert string using decimal conversion: "%c"', isCorrect: false, explanation: '"%c" represents only a single character, not an entire array of text characters.' }
    ],
    expectedConsole: 'Warning: format \'%d\' expects argument of type \'int\', but argument has type \'char*\''
  },
  {
    id: 'c-int',
    language: 'C',
    level: 'Intermediate',
    scenario: 'Buffer Overflow on Unsafe Input Copy',
    buggyCode: `#include <string.h>\nvoid copy(char* input) {\n    char buffer[8];\n    strcpy(buffer, input); // Danger buffer overflow!\n}`,
    instructions: 'Secure the C memory copying process to prevent stack corruption.',
    options: [
      { text: 'Use bounded copy helper: "strncpy(buffer, input, sizeof(buffer) - 1); buffer[7] = \'\\0\';"', isCorrect: true, explanation: 'strncpy restricts characters copied to buffer dimensions, protecting program boundaries.' },
      { text: 'Use dynamic pointer castings inside realloc()', isCorrect: false, explanation: 'Reallocation doesn\'t protect statically allocated stack arrays like char buffer[8].' }
    ],
    expectedConsole: 'Critical: Buffer Overflow / Stack Smashing detected. Executing crash handler.'
  },
  {
    id: 'c-adv',
    language: 'C',
    level: 'Advanced',
    scenario: 'Manual Memory Padding Alignment',
    buggyCode: `struct Packet {\n    char id;\n    int count;\n};\n// Size of struct Packet is 8 bytes, not 5 bytes!`,
    instructions: 'Explain why the size of this struct is larger than its component data types combined.',
    options: [
      { text: 'Compilers introduce memory alignment padding (typically 4-byte boundaries) for hardware reading efficiency', isCorrect: true, explanation: 'For CPU efficiency, data fields are aligned to native architecture word boundaries, padding smaller elements.' },
      { text: 'The struct keyword reserves extra system header flags', isCorrect: false, explanation: 'There are no "headers" inside C structs. The structure layout is purely raw memory.' }
    ],
    expectedConsole: 'Struct size mismatch: Padding bytes added to align member "count" to 4-byte boundaries.'
  },

  // 10. RUST
  {
    id: 'rust-beg',
    language: 'Rust',
    level: 'Beginner',
    scenario: 'Immutable variable write error',
    buggyCode: `fn main() {\n    let points = 100;\n    points = points + 50;\n}`,
    instructions: 'Rust variables are immutable by default. Allow mutation.',
    options: [
      { text: 'Prepend "mut" keyword: "let mut points = 100;"', isCorrect: true, explanation: 'In Rust, adding "mut" explicitly tells the compiler and other developers that a variable is intended to be altered.' },
      { text: 'Declare points as a global constant using "const"', isCorrect: false, explanation: 'Constants in Rust cannot be declared as standard local loop variables and cannot shadow values.' }
    ],
    expectedConsole: 'error[E0384]: cannot assign twice to immutable variable `points`'
  },
  {
    id: 'rust-int',
    language: 'Rust',
    level: 'Intermediate',
    scenario: 'Borrow Checker Reference lifetime conflict',
    buggyCode: `fn main() {\n    let mut val = String::from("Rust");\n    let r1 = &val;\n    let r2 = &mut val; // Mutable borrow occurs here\n    println!("{} - {}", r1, r2);\n}`,
    instructions: 'Address the safety constraints of the Rust borrow checker.',
    options: [
      { text: 'Avoid overlapping immutable references (r1) with active mutable references (r2)', isCorrect: true, explanation: 'Rust enforces that you can have any number of immutable borrows OR exactly one mutable borrow in scope.' },
      { text: 'De-allocate r1 manually by invoking drop()', isCorrect: false, explanation: 'Invoking drop() on references is not supported; lifetimes are resolved via compiler analysis scopes.' }
    ],
    expectedConsole: 'error[E0502]: cannot borrow `val` as mutable because it is also borrowed as immutable'
  },
  {
    id: 'rust-adv',
    language: 'Rust',
    level: 'Advanced',
    scenario: 'Missing Lifetime Specifier in returns',
    buggyCode: `fn longest(x: &str, y: &str) -> &str {\n    if x.len() > y.len() { x } else { y }\n}`,
    instructions: 'Help the compiler calculate reference survival scopes.',
    options: [
      { text: 'Add generic lifetime annotations: "fn longest<\'a>(x: &\'a str, y: &\'a str) -> &\'a str"', isCorrect: true, explanation: 'Adding explicit lifetimes informs the borrow checker that returned values share the same lifespan boundaries as inputs.' },
      { text: 'Add "unsafe" blocks inside return pathways', isCorrect: false, explanation: 'Unsafe blocks do not override or bypass compilation checks for missing reference scopes.' }
    ],
    expectedConsole: 'error[E0106]: missing lifetime specifier'
  },

  // 11. GO (GOLANG)
  {
    id: 'go-beg',
    language: 'Go (Golang)',
    level: 'Beginner',
    scenario: 'Unused local variable compiled error',
    buggyCode: `package main\nimport "fmt"\nfunc main() {\n    var score = 10\n    fmt.Println("Server online")\n}`,
    instructions: 'Go strictly prohibits unused local variables. Remove compiler alerts.',
    options: [
      { text: 'Actually use variable "fmt.Println(score)" or delete its assignment declaration', isCorrect: true, explanation: 'The Go compiler throws compile-time errors for unused local variables to prevent junk memory clutter.' },
      { text: 'Use a dynamic pointer assignment check instead', isCorrect: false, explanation: 'Unused pointers trigger the exact same compiler restrictions in Go.' }
    ],
    expectedConsole: 'score declared and not used'
  },
  {
    id: 'go-int',
    language: 'Go (Golang)',
    level: 'Intermediate',
    scenario: 'Goroutine closure capture race condition',
    buggyCode: `for i := 0; i < 3; i++ {\n    go func() {\n        fmt.Println(i) // Shared loop variable captured!\n    }()\n}`,
    instructions: 'Prevent asynchronous routines from sharing the shifting loop index counter.',
    options: [
      { text: 'Pass index i as an argument: "go func(val int) { fmt.Println(val) }(i)"', isCorrect: true, explanation: 'Passing variables as arguments duplicates memory contexts on execution, avoiding concurrency race triggers.' },
      { text: 'Introduce time.Sleep(1 * time.Second) inside goroutines', isCorrect: false, explanation: 'Sleep timers do not solve core concurrency race condition bugs.' }
    ],
    expectedConsole: 'Data Race: Concurrent goroutines print identical final value of variable i.'
  },
  {
    id: 'go-adv',
    language: 'Go (Golang)',
    level: 'Advanced',
    scenario: 'Nil interface vs Nil concrete value interface comparison',
    buggyCode: `var err error\nvar p *MyError = nil\nerr = p\nfmt.Println(err == nil) // Returns false!`,
    instructions: 'Explain why interface comparison against nil yields unexpected results here.',
    options: [
      { text: 'An interface in Go holds a tuple of (type, value). Because type *MyError is not nil, the interface comparison is false', isCorrect: true, explanation: 'Go interfaces are only truly nil if both type and value descriptors are unassigned.' },
      { text: 'Replace "err == nil" with "reflect.DeepEqual(err, nil)" to parse types', isCorrect: false, explanation: 'DeepEqual still validates internal tuple representations and is highly inefficient for nil checks.' }
    ],
    expectedConsole: 'Boolean output: false (Interface contains non-nil type pointer *MyError).'
  },

  // 12. SWIFT
  {
    id: 'swift-beg',
    language: 'Swift',
    level: 'Beginner',
    scenario: 'Forced Optional Unwrapping crash',
    buggyCode: `var username: String? = nil\nprint(username!) // Force unwrapping crash!`,
    instructions: 'Swift values use Optionals for safety. Unwrap "username" safely.',
    options: [
      { text: 'Use optional binding (if let): "if let name = username { print(name) }"', isCorrect: true, explanation: 'Optional binding safely unwraps optionals, executing code blocks only if a valid value is present.' },
      { text: 'Assign default value using coercion: "username as! String"', isCorrect: false, explanation: 'Forced casting (as!) on nil objects triggers the same fatal runtime exceptions.' }
    ],
    expectedConsole: 'Fatal error: Unexpectedly found nil while unwrapping an Optional value'
  },
  {
    id: 'swift-int',
    language: 'Swift',
    level: 'Intermediate',
    scenario: 'Strong reference retain cycles in closures',
    buggyCode: `class APIClient {\n    var handler: (() -> Void)?\n    func start() {\n        handler = { self.update() } // Retain cycle!\n    }\n}`,
    instructions: 'Identify how to break strong circular references inside escaping closures.',
    options: [
      { text: 'Declare weak self inside capturing list: "[weak self] in self?.update()"', isCorrect: true, explanation: 'Using "[weak self]" creates a weak reference, preventing self from being pinned by the closure and allowing proper garbage collection.' },
      { text: 'Decorate APIClient with static accessors', isCorrect: false, explanation: 'Static scope does not resolve memory leaks of dynamic object allocation lifecycles.' }
    ],
    expectedConsole: 'Memory leak: Strong reference cycle prevents ARC from de-allocating client instance.'
  },
  {
    id: 'swift-adv',
    language: 'Swift',
    level: 'Advanced',
    scenario: 'Swift Actor Data Race Protection',
    buggyCode: `actor BankAccount {\n    var balance = 100\n}\n// Attempting to mutate balance directly from outside!`,
    instructions: 'Explain the runtime synchronization constraints of Actors in Swift.',
    options: [
      { text: 'Actor mutable state is isolated; external access must occur asynchronously using the "await" keyword', isCorrect: true, explanation: 'Swift Actors guarantee thread-safe data synchronization by isolating their states. Modifying or calling them requires async awaits.' },
      { text: 'Declare actor properties as static inline variables', isCorrect: false, explanation: 'Static actor fields are shared global state and bypass safe compiler synchronization tracks.' }
    ],
    expectedConsole: 'error: actor-isolated property \'balance\' can only be referenced from inside the actor'
  },

  // 13. KOTLIN
  {
    id: 'kotlin-beg',
    language: 'Kotlin',
    level: 'Beginner',
    scenario: 'Nullability constraint assignment error',
    buggyCode: `var title: String = "SaaS"\ntitle = null // Compile Error!`,
    instructions: 'Kotlin is null-safe by default. Modify the type declaration to permit nulls.',
    options: [
      { text: 'Declare variable type as nullable using a question mark: "var title: String? = \'SaaS\'"', isCorrect: true, explanation: 'Appending a question mark to Kotlin types enables them to safely contain null references.' },
      { text: 'Cast assigning variable using "null as String"', isCorrect: false, explanation: 'Forced null castings throw immediate compilation type-mismatch exceptions.' }
    ],
    expectedConsole: 'Null can not be a value of a non-null type String'
  },
  {
    id: 'kotlin-int',
    language: 'Kotlin',
    level: 'Intermediate',
    scenario: 'Coroutine scope cancellation failure',
    buggyCode: `val job = CoroutineScope(Dispatchers.Default).launch {\n    while (true) {\n        // Blocking calculation without yield check\n    }\n}\njob.cancel() // Job keeps running!`,
    instructions: 'Kotlin coroutines are cooperative. How do we ensure execution honors cancellation triggers?',
    options: [
      { text: 'Check isActive property or call "yield()" inside active loop structures', isCorrect: true, explanation: 'Coroutine checks like isActive or yield() let workers yield execution cleanly upon cancellation.' },
      { text: 'Wrap block inside Thread.sleep() delays', isCorrect: false, explanation: 'Thread.sleep blocking stalls the underlying system execution thread, completely blocking cooperative coroutine scheduling.' }
    ],
    expectedConsole: 'Cancellation Exception: Job canceled, but calculation threads refuse to stop.'
  },
  {
    id: 'kotlin-adv',
    language: 'Kotlin',
    level: 'Advanced',
    scenario: 'Reified parameters type erasure limitations',
    buggyCode: `fun <T> checkType(value: Any) {\n    if (value is T) { } // Compile error: Cannot check for erased type T!\n}`,
    instructions: 'Solve compiler generic type erasure inside Kotlin helpers.',
    options: [
      { text: 'Declare inline function with reified generic parameter: "inline fun <reified T> checkType(value: Any)"', isCorrect: true, explanation: 'Marking a function "inline" with "reified T" preserves type parameters at compile-time, permitting runtime type queries.' },
      { text: 'Cast type casting explicitly using: "value as T"', isCorrect: false, explanation: 'Standard casting still encounters type erasure limits, causing runtime warning anomalies.' }
    ],
    expectedConsole: 'error: cannot check for instance of erased type: T'
  },

  // 14. DART
  {
    id: 'dart-beg',
    language: 'Dart',
    level: 'Beginner',
    scenario: 'Const variable runtime re-assignment error',
    buggyCode: `const PI = 3.14;\nPI = 3.14159; // Attempt update`,
    instructions: 'Dart const variables are immutable compile-time constants. Rectify.',
    options: [
      { text: 'Use "var" or "double" if reassignment is needed, or keep compile constants unmodified', isCorrect: true, explanation: '"const" values are frozen at compilation and can never be re-assigned in runtime.' },
      { text: 'Declare variables as "lazy const" structures', isCorrect: false, explanation: 'Dart has "late", but does not support "lazy const" definitions.' }
    ],
    expectedConsole: 'Error: Can\'t assign to the const variable \'PI\'.'
  },
  {
    id: 'dart-int',
    language: 'Dart',
    level: 'Intermediate',
    scenario: 'Late Initialization Exception triggers',
    buggyCode: `class User {\n    late String profile;\n}\nUser u = User();\nprint(u.profile); // Accessing before assigning!`,
    instructions: 'How do you prevent LateInitializationException in dynamic Dart codes?',
    options: [
      { text: 'Ensure the variable is initialized before access, or check safety using custom nullable fields', isCorrect: true, explanation: 'The late modifier guarantees initialized state later. Reading before initialization triggers exceptions.' },
      { text: 'Wrap fields in inline static getters', isCorrect: false, explanation: 'Static getters do not manage instance initialization lifecycle boundaries.' }
    ],
    expectedConsole: 'LateInitializationException: Field \'profile\' has not been initialized.'
  },
  {
    id: 'dart-adv',
    language: 'Dart',
    level: 'Advanced',
    scenario: 'Stream Controller memory leaks',
    buggyCode: `class EventBus {\n    final controller = StreamController<String>();\n}`,
    instructions: 'Every StreamController created must be properly disposed. Fix leaks.',
    options: [
      { text: 'Implement a dispose method and call "controller.close()" when tearing down', isCorrect: true, explanation: 'Stream controllers consume system descriptors. Calling .close() cleans up listeners and frees underlying resources.' },
      { text: 'Set stream instances to null inside garbage collector tracks', isCorrect: false, explanation: 'Assigning null handles does not close the controller descriptors, triggering memory leak warnings.' }
    ],
    expectedConsole: 'Leak warning: active stream listeners left open after object termination.'
  },

  // 15. SQL
  {
    id: 'sql-beg',
    language: 'SQL',
    level: 'Beginner',
    scenario: 'WHERE filter with Group Aggregates',
    buggyCode: `SELECT dept, AVG(pay) \nFROM staff \nWHERE AVG(pay) > 60000 \nGROUP BY dept;`,
    instructions: 'Understand compilation order in SQL queries. Filter by group aggregates.',
    options: [
      { text: 'Use the "HAVING" clause after GROUP BY: "GROUP BY dept HAVING AVG(pay) > 60000"', isCorrect: true, explanation: 'WHERE processes records individually before groupings occur. HAVING handles aggregate filtering post-grouping.' },
      { text: 'Re-arrange query using FILTER BY commands', isCorrect: false, explanation: '"FILTER BY" is syntactically invalid inside standard ISO SQL databases.' }
    ],
    expectedConsole: 'SQL Error: aggregate functions are not allowed in WHERE clause'
  },
  {
    id: 'sql-int',
    language: 'SQL',
    level: 'Intermediate',
    scenario: 'Left Outer Join null resolution',
    buggyCode: `SELECT c.name, o.id \nFROM clients c \nLEFT JOIN orders o ON c.id = o.client_id;`,
    instructions: 'Clients without orders yield NULL values. Substitute standard text placeholders.',
    options: [
      { text: 'Apply COALESCE evaluation: "COALESCE(o.id, \'No ID\')"', isCorrect: true, explanation: 'COALESCE returns its first non-null argument, resolving missing records elegantly.' },
      { text: 'Enforce standard DEFAULT constraints during projections', isCorrect: false, explanation: 'DEFAULT statements configure tables schema insertions, and cannot mutate outer join outputs.' }
    ],
    expectedConsole: 'Join results display "null" indicators on unlinked records.'
  },
  {
    id: 'sql-adv',
    language: 'SQL',
    level: 'Advanced',
    scenario: 'Recursive CTE Graph terminal limits',
    buggyCode: `WITH RECURSIVE chart AS (\n    SELECT id, lead_id FROM nodes WHERE lead_id IS NULL\n    UNION ALL\n    SELECT n.id, n.lead_id FROM nodes n JOIN chart c ON n.lead_id = c.id\n)\nSELECT * FROM chart;`,
    instructions: 'Explain the termination conditions of Recursive CTE loops.',
    options: [
      { text: 'Termination triggers naturally when the recursive JOIN generates zero new matching rows', isCorrect: true, explanation: 'CTEs iterate and append rows, terminating when an iteration produces an empty result.' },
      { text: 'A hardcoded LIMIT clause is syntactically required inside the UNION block', isCorrect: false, explanation: 'LIMIT clauses are generally forbidden or unsupported inside standard SQL UNION recursion terms.' }
    ],
    expectedConsole: 'Graph hierarchy resolves recursion and returns correctly.'
  },

  // 16. R
  {
    id: 'r-beg',
    language: 'R',
    level: 'Beginner',
    scenario: 'Index offset bounds index logic',
    buggyCode: `# Objective: Extract first item\nitems <- c("A", "B", "C")\nprint(items[0])`,
    instructions: 'Unlike most programming languages, R is 1-indexed. Extract the first item.',
    options: [
      { text: 'Reference index 1: "items[1]"', isCorrect: true, explanation: 'R uses 1-based indexing. Querying index 0 returns an empty vector of the same type.' },
      { text: 'Access using items[-1]', isCorrect: false, explanation: 'In R, negative indexes exclude elements. "items[-1]" returns everything except the first item.' }
    ],
    expectedConsole: 'vector output: character(0)'
  },
  {
    id: 'r-int',
    language: 'R',
    level: 'Intermediate',
    scenario: 'Matrix dimension reciclations',
    buggyCode: `val <- c(1, 2, 3)\nmatrix(val, nrow=2, ncol=2) // Vector recycling occurrence!`,
    instructions: 'Analyze R recycling behavior on uneven matrix generation sizes.',
    options: [
      { text: 'The compiler recycles the vector starting elements to fill vacant dimensions, warning of size mismatches', isCorrect: true, explanation: 'If dimensions are not multiples of vector lengths, R automatically recycles elements but warns of mismatch.' },
      { text: 'The matrix execution aborts and throws ArrayOutOfBoundsError', isCorrect: false, explanation: 'R rarely aborts on vector dimension mismatches, instead recycling values silently or with warnings.' }
    ],
    expectedConsole: 'Warning: data length [3] is not a sub-multiple or multiple of the number of rows [2]'
  },
  {
    id: 'r-adv',
    language: 'R',
    level: 'Advanced',
    scenario: 'Dynamic lazy evaluations of function closures',
    buggyCode: `f <- function(x) {\n  g <- function(y) { x + y }\n  x <- 10\n  g\n}\nres <- f(5)\nprint(res(5)) // Returns 15, not 10!`,
    instructions: 'Understand how R dynamic environments resolve variables under lazy evaluation.',
    options: [
      { text: 'Variables are evaluated inside execution environments when actually read (Lazy Evaluation). Writing "x <- 10" overrides 5', isCorrect: true, explanation: 'R does not resolve arguments instantly at call time. It evaluates them lazily inside function environments on execution.' },
      { text: 'R arguments are compiled eagerly by standard virtual engines', isCorrect: false, explanation: 'R uses lazy argument evaluations, postponing parsing until variable lookups occur.' }
    ],
    expectedConsole: 'Numeric output: 15'
  },

  // 17. MATLAB
  {
    id: 'matlab-beg',
    language: 'MATLAB',
    level: 'Beginner',
    scenario: 'Matrix Multiplications vs Element-by-element operators',
    buggyCode: `A = [1, 2; 3, 4];\nB = [2, 0; 1, 2];\nC = A * B; % Mismatched result if we wanted element product!`,
    instructions: 'If you want element-wise multiplication instead of algebraic matrix multiplication, identify the operator.',
    options: [
      { text: 'Use dot operator indicator: "C = A .* B;"', isCorrect: true, explanation: 'In MATLAB, prepending dot (".") to operators forces element-wise operations on arrays.' },
      { text: 'Configure operation using cross() helper methods', isCorrect: false, explanation: 'The cross() function calculates 3D vector cross-products, not element-wise array products.' }
    ],
    expectedConsole: 'Calculates standard matrix product instead of coordinate multiplication.'
  },
  {
    id: 'matlab-int',
    language: 'MATLAB',
    level: 'Intermediate',
    scenario: 'Loop Vectorization optimizations',
    buggyCode: `for i = 1:1000000\n    v(i) = sin(i);\nend`,
    instructions: 'MATLAB is highly optimized for vector calculations. Vectorize this loop.',
    options: [
      { text: 'Vectorize directly using array parameters: "v = sin(1:1000000);"', isCorrect: true, explanation: 'Vectorized commands run in optimized compiled C backends inside MATLAB, executing significantly faster than manual for-loops.' },
      { text: 'Wrap loop scopes inside a static thread-pool constructor', isCorrect: false, explanation: 'Creating thread-pools adds heavy orchestration overhead compared to simple vectorization.' }
    ],
    expectedConsole: 'Execution alert: Loop slow. Preallocating arrays or vectorizing is recommended.'
  },
  {
    id: 'matlab-adv',
    language: 'MATLAB',
    level: 'Advanced',
    scenario: 'MEX C Callback Interface bindings',
    buggyCode: `#include "mex.h"\nvoid mexFunction(int nlhs, mxArray *plhs[]) {} // Missing argument mappings`,
    instructions: 'Describe the complete standard signature of a MATLAB mex compile link.',
    options: [
      { text: 'The signature must capture dimensions and pointer lists: "void mexFunction(int nlhs, mxArray *plhs[], int nrhs, const mxArray *prhs[])"', isCorrect: true, explanation: 'MEX interfaces require exact left-hand-side and right-hand-side argument pointer counts to link correctly with MATLAB compile vectors.' },
      { text: 'Return status as static double integers', isCorrect: false, explanation: 'MEX entry points must return void, updating pointers directly.' }
    ],
    expectedConsole: 'Link error: entry point "mexFunction" has invalid signature parameters.'
  },

  // 18. JULIA
  {
    id: 'julia-beg',
    language: 'Julia',
    level: 'Beginner',
    scenario: 'Type Instabilities inside hot loops',
    buggyCode: `function sum_data(n)\n    s = 0 # Type is Int\n    for i in 1:n\n        s += i / 2 # Division yields Float64! Type mismatch!\n    end\n    return s\nend`,
    instructions: 'Julia relies on type stability for JIT compilation. Initialize s to support float inputs.',
    options: [
      { text: 'Initialize s as a float: "s = 0.0"', isCorrect: true, explanation: 'Initializing s as 0.0 preserves its type as Float64 throughout, enabling the JIT compiler to generate highly optimized machine code.' },
      { text: 'Convert s using runtime assertions "s::Float64"', isCorrect: false, explanation: 'Adding assertions forces compiler checks but does not prevent intermediate type mutation bottlenecks.' }
    ],
    expectedConsole: 'Type Instability Warning: compiler cannot optimize dynamic register switching.'
  },
  {
    id: 'julia-int',
    language: 'Julia',
    level: 'Intermediate',
    scenario: 'Multiple Dispatch Mismatch signatures',
    buggyCode: `process(x::Number) = "Numeric"\nprocess(x::Int) = "Integer"\nprocess(4.5) // Which method triggers?`,
    instructions: 'Julia uses Multiple Dispatch. Analyze method selection logic.',
    options: [
      { text: 'It invokes process(x::Number) because Float64 matches Number, the most specific signature', isCorrect: true, explanation: 'Julia routes arguments to the most specific type signature available at runtime.' },
      { text: 'It invokes the compiler backup default helper method', isCorrect: false, explanation: 'Julia matches signatures precisely. It only falls back to defaults if no matching type signature is found.' }
    ],
    expectedConsole: 'Returns: "Numeric" (Float64 is a subtype of Number, but not of Int).'
  },
  {
    id: 'julia-adv',
    language: 'Julia',
    level: 'Advanced',
    scenario: 'Macro AST evaluations constraints',
    buggyCode: `macro assert_eq(ex1, ex2)\n    return :( $ex1 == $ex2 )\nend`,
    instructions: 'Julia macros operate on Abstract Syntax Trees. Escape variables to prevent scope bleed.',
    options: [
      { text: 'Use "esc()" to preserve caller scope variables: "esc(ex1) == esc(ex2)"', isCorrect: true, explanation: 'Julia macro hygiene defaults to isolation. Use esc() to allow variables to resolve in the caller\'s local scope.' },
      { text: 'Wrap arguments in eval() functions inside return pipelines', isCorrect: false, explanation: 'Calling eval() inside macro generation compiles expressions in the global scope, breaking local scope variables.' }
    ],
    expectedConsole: 'Macro Hygiene warning: Variable references leak or fail to resolve in local scopes.'
  },

  // 19. SHELL (BASH)
  {
    id: 'sh-beg',
    language: 'Shell (Bash)',
    level: 'Beginner',
    scenario: 'Spaces around variable assignment operators',
    buggyCode: `#!/bin/bash\nUSER_ROLE = "Developer"\necho $USER_ROLE`,
    instructions: 'In Bash, spaces around "=" are interpreted as arguments. Correct the assignment.',
    options: [
      { text: 'Remove spaces: "USER_ROLE=\'Developer\'"', isCorrect: true, explanation: 'Bash uses whitespace to separate commands from arguments. Writing spaces around "=" makes Bash try to execute USER_ROLE as a command.' },
      { text: 'Enclose complete variable assignments inside parentheses: "(USER_ROLE = \'Developer\')"', isCorrect: false, explanation: 'Parentheses execute commands in subshells but do not fix the space parsing rules.' }
    ],
    expectedConsole: 'bash: USER_ROLE: command not found'
  },
  {
    id: 'sh-int',
    language: 'Shell (Bash)',
    level: 'Intermediate',
    scenario: 'Word splitting on unquoted directory variables',
    buggyCode: `#!/bin/bash\nDIR="My Documents"\nrm -rf $DIR // Word splitting occurs!`,
    instructions: 'Without quotes, space splits variables into separate arguments. Secure the deletion command.',
    options: [
      { text: 'Wrap variables in double quotes: "rm -rf \'$DIR\'"', isCorrect: true, explanation: 'Double quotes prevent word splitting and globbing, keeping variables with spaces intact as a single argument.' },
      { text: 'Prepend directory parameters with backslash characters', isCorrect: false, explanation: 'Escape slashes only work on hardcoded strings, not resolved variables.' }
    ],
    expectedConsole: 'System Alert: rm deletes "My" and "Documents" as two separate parameters!'
  },
  {
    id: 'sh-adv',
    language: 'Shell (Bash)',
    level: 'Advanced',
    scenario: 'Trap Signal process cleanup',
    buggyCode: `#!/bin/bash\ntrap clean EXIT\nfunction clean() {\n    rm -f /tmp/lock\n}\nwhile true; do sleep 1; done`,
    instructions: 'Explain trap triggers in systems scripts automation.',
    options: [
      { text: 'The trap command intercepts system signals (EXIT, SIGINT, SIGTERM) to run cleanups automatically', isCorrect: true, explanation: 'Trap registers signals on process runtime, ensuring resource cleanups are triggered even during abnormal exits.' },
      { text: 'Trap overrides operating system kernel parameters directly', isCorrect: false, explanation: 'Traps operate purely inside user-space shell execution tracks.' }
    ],
    expectedConsole: 'Correct: Lockfile cleared safely upon signal interrupt.'
  },

  // 20. COBOL
  {
    id: 'cobol-beg',
    language: 'COBOL',
    level: 'Beginner',
    scenario: 'Margin layout division rule errors',
    buggyCode: `      IDENTIFICATION DIVISION.\n      PROGRAM-ID. HELLO-WORLD.\n* Standard column limits restrictions`,
    instructions: 'COBOL has strict rules about margins. In which columns must Division headers start?',
    options: [
      { text: 'Division headers must start in Margin A (Columns 8 to 11)', isCorrect: true, explanation: 'Historically rooted in punched cards, COBOL Division, Section, and Paragraph headers must start in Area A (columns 8-11).' },
      { text: 'Division headers must start in Margin B (Columns 12 to 72)', isCorrect: false, explanation: 'Area B (columns 12-72) is reserved for standard procedural statements and variables.' }
    ],
    expectedConsole: 'COBOL Compiler Error: Statement starts outside allowed Area A margin boundaries.'
  },
  {
    id: 'cobol-int',
    language: 'COBOL',
    level: 'Intermediate',
    scenario: 'Picture clause numeric buffer bounds',
    buggyCode: `01  WS-BALANCE      PIC 999 VALUE 500.\nADD 600 TO WS-BALANCE.`,
    instructions: 'Analyze what happens when values exceed the PIC numeric bounds limit.',
    options: [
      { text: 'The value overflows, leading to truncation. Change PIC to PIC 9(4) or larger to accommodate larger integers', isCorrect: true, explanation: 'PIC 999 holds values only up to 999. Adding 600 to 500 (1100) causes decimal truncation without proper definitions.' },
      { text: 'The system halts and throws a hardware core exception', isCorrect: false, explanation: 'COBOL truncates values silently without interrupting execution, which is highly risky for financial calculations.' }
    ],
    expectedConsole: 'WS-BALANCE Output: 100 (Value truncated from 1100 due to PIC 999 size limits).'
  },
  {
    id: 'cobol-adv',
    language: 'COBOL',
    level: 'Advanced',
    scenario: 'COBOL File Status checking codes',
    buggyCode: `OPEN INPUT CUSTOMER-FILE.\n* Missing checking codes!`,
    instructions: 'How do you check for file accessibility status in enterprise COBOL architectures?',
    options: [
      { text: 'Map FILE-STATUS in SELECT statements and verify: "IF WS-FILE-STATUS = \'00\'"', isCorrect: true, explanation: 'Status code \'00\' indicates successful file open. Checking status values prevents unhandled hardware system execution crashes.' },
      { text: 'Call check_exist() directly inside the paragraph loops', isCorrect: false, explanation: 'Standard COBOL does not possess built-in "check_exist" functions.' }
    ],
    expectedConsole: 'System Panic: File open fail goes unhandled, corrupting memory records.'
  }
];

// GAME 2 DATA: DSA Dungeon Crawler
interface DSALevel {
  id: string;
  levelName: string;
  difficulty: DifficultyLevel;
  objective: string;
  gridSize: { r: number, c: number };
  startPos: { r: number, c: number };
  targetPos: { r: number, c: number };
  obstacles: { r: number, c: number }[];
  algorithmOptions: string[];
  buggyPseudocode: string;
  quizQuestion: string;
  quizOptions: string[];
  correctQuizIdx: number;
}

const DSA_LEVELS: DSALevel[] = [
  {
    id: 'dsa-beg',
    levelName: 'Dungeon Room 1: Array Search & Boundaries',
    difficulty: 'Beginner',
    objective: 'Locate the exit key in a sorted linear array using Binary Search.',
    gridSize: { r: 1, c: 7 },
    startPos: { r: 0, c: 0 },
    targetPos: { r: 0, c: 5 },
    obstacles: [],
    algorithmOptions: ['Linear Search (O(N))', 'Binary Search (O(log N))'],
    buggyPseudocode: `function binarySearch(arr, key):\n  low = 0\n  high = len(arr) - 1\n  while low <= high:\n    mid = (low + high) // 2\n    if arr[mid] == key:\n      return mid\n    elif arr[mid] < key:\n      low = mid + 1\n    else:\n      high = mid - 1\n  return -1`,
    quizQuestion: 'In a sorted array of 1,000,000 items, what is the maximum number of comparisons needed for Binary Search?',
    quizOptions: ['About 1,000,000 comparisons', 'About 500,000 comparisons', 'Exactly 20 comparisons', 'Exactly 1 comparison'],
    correctQuizIdx: 2
  },
  {
    id: 'dsa-int',
    levelName: 'Dungeon Room 2: Graph Expansion & BFS vs DFS',
    difficulty: 'Intermediate',
    objective: 'Navigate a grid with stone pillars to find the Golden Chest. Choose Breadth-First Search (BFS) to guarantee the shortest path!',
    gridSize: { r: 5, c: 5 },
    startPos: { r: 0, c: 0 },
    targetPos: { r: 4, c: 4 },
    obstacles: [
      { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 },
      { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }
    ],
    algorithmOptions: ['Breadth-First Search (Queue)', 'Depth-First Search (Stack)'],
    buggyPseudocode: `function bfs(graph, start):\n  visited = set()\n  queue = [start]\n  while queue:\n    node = queue.pop(0) # FIFO queue pop\n    ...\n    for neighbor in graph[node]:\n      if neighbor not in visited:\n        visited.add(neighbor)\n        queue.append(neighbor)`,
    quizQuestion: 'Which data structure is essential to manage open nodes in BFS to guarantee shortest paths in unweighted graphs?',
    quizOptions: ['Stack (LIFO)', 'Queue (FIFO)', 'Priority Queue / Heap', 'Hash Set'],
    correctQuizIdx: 1
  },
  {
    id: 'dsa-adv',
    levelName: 'Dungeon Room 3: Dynamic Programming (DP) Coin Room',
    difficulty: 'Advanced',
    objective: 'Find the minimum number of steps or optimal grid path using the Knapsack / DP matrix algorithm.',
    gridSize: { r: 4, c: 4 },
    startPos: { r: 0, c: 0 },
    targetPos: { r: 3, c: 3 },
    obstacles: [{ r: 1, c: 2 }, { r: 2, c: 1 }],
    algorithmOptions: ['Memoized Recursion', 'Bottom-Up Tabulation Matrix'],
    buggyPseudocode: `dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])`,
    quizQuestion: 'What is the core difference between Memoization and Tabulation in Dynamic Programming?',
    quizOptions: [
      'Memoization is top-down (recursive with caching); Tabulation is bottom-up (iterative matrix filling)',
      'Memoization uses more time complexity than Tabulation',
      'Tabulation cannot handle overlapping subproblems',
      'There is no functional difference'
    ],
    correctQuizIdx: 0
  }
];

// GAME 3 DATA: System Architect Nodes
interface ArchitectLevel {
  id: string;
  scenarioTitle: string;
  difficulty: DifficultyLevel;
  incomingLoad: string; // e.g. "10,000 reqs/sec"
  loadDescription: string;
  baseNodesAllowed: { type: string, limit: number }[];
  targetStabilityScore: number;
  quizQuestion: string;
  quizOptions: string[];
  correctQuizIdx: number;
}

const SYSTEM_LEVELS: ArchitectLevel[] = [
  {
    id: 'sys-beg',
    scenarioTitle: 'Career Phase 1: Launching the MVP (Client-Server)',
    difficulty: 'Beginner',
    incomingLoad: '5,000 Users/Sec',
    loadDescription: 'A viral news blog post brings intense immediate traffic to a single relational database instance.',
    baseNodesAllowed: [
      { type: 'Static CDN', limit: 1 },
      { type: 'Application Server', limit: 2 },
      { type: 'Master Database', limit: 1 }
    ],
    targetStabilityScore: 80,
    quizQuestion: 'Where should static content (images, HTML) be cached to reduce original database load and improve latency globally?',
    quizOptions: ['Directly inside DB Blobs', 'In a Content Delivery Network (CDN) edge cache', 'Inside the application server memory', 'On client-side CPU registers'],
    correctQuizIdx: 1
  },
  {
    id: 'sys-int',
    scenarioTitle: 'Career Phase 2: High Traffic SaaS (Load Balancers & Cache)',
    difficulty: 'Intermediate',
    incomingLoad: '50,000 Users/Sec',
    loadDescription: 'A subscription streaming dashboard experience. High-frequency read queries threaten database crash.',
    baseNodesAllowed: [
      { type: 'Load Balancer', limit: 1 },
      { type: 'Application Server', limit: 3 },
      { type: 'Redis Cache Layer', limit: 2 },
      { type: 'Read Replica DB', limit: 2 }
    ],
    targetStabilityScore: 90,
    quizQuestion: 'To handle heavy read operations without bottlenecking the Primary Master DB, which design pattern is most effective?',
    quizOptions: [
      'Write data into local text files',
      'Deploy Read Replicas of the database and direct read queries to them',
      'Increase the clock speed of the single Master DB',
      'Implement multi-threading inside DB write locks'
    ],
    correctQuizIdx: 1
  },
  {
    id: 'sys-adv',
    scenarioTitle: 'Career Phase 3: Global Scale Microservices (Fault Tolerance)',
    difficulty: 'Advanced',
    incomingLoad: '250,000 Users/Sec',
    loadDescription: 'Black Friday flash sale. Millions of orders arriving at once. Database locks prevent transactions.',
    baseNodesAllowed: [
      { type: 'Load Balancer', limit: 2 },
      { type: 'Microservice Cluster', limit: 4 },
      { type: 'Kafka Message Queue', limit: 2 },
      { type: 'Distributed Cache', limit: 3 },
      { type: 'Sharded Database Cluster', limit: 3 }
    ],
    targetStabilityScore: 95,
    quizQuestion: 'When spikes of write transactions occur simultaneously, how do you prevent the database from collapsing due to connection saturation?',
    quizOptions: [
      'Throw immediate errors to 90% of buyers',
      'Buffer and throttle writes using an asynchronous distributed message queue (e.g. Apache Kafka)',
      'Run a synchronous recursion loop inside Express',
      'Configure automatic thread sleeps'
    ],
    correctQuizIdx: 1
  }
];

export function CodingGames({ stats, token, onUpdateStats }: CodingGamesProps) {
  const [activeGame, setActiveGame] = useState<GameType>('syntax_strike');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Beginner');

  // Categorized Language Selector states
  const [selectedCategory, setSelectedCategory] = useState<string>('Web & Scripting');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Python');

  // Audio mute state
  const [isMuted, setIsMuted] = useState(false);

  // Common UI states
  const [gameScore, setGameScore] = useState(0);
  const [gameResult, setGameResult] = useState<'idle' | 'success' | 'failed'>('idle');
  const [simulating, setSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [submittingProgress, setSubmittingProgress] = useState(false);
  const [badgeWonThisTurn, setBadgeWonThisTurn] = useState<string | null>(null);

  // GAME 1 STATES: Syntax Strike
  const [selectedSyntaxOption, setSelectedSyntaxOption] = useState<number | null>(null);
  const [syntaxConsole, setSyntaxConsole] = useState<string>('COMPILER: STANDBY. AWAITING INPUT...');

  // GAME 2 STATES: DSA Dungeon Crawler
  const [dsaSelectedAlg, setDsaSelectedAlg] = useState<string>('');
  const [dsaQuizAnswer, setDsaQuizAnswer] = useState<number | null>(null);
  const [dsaCellStates, setDsaCellStates] = useState<'normal' | 'searching' | 'found'>('normal');
  const [visitedNodesList, setVisitedNodesList] = useState<{ r: number, c: number }[]>([]);
  const [currentNodeStep, setCurrentNodeStep] = useState<{ r: number, c: number } | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // GAME 3 STATES: System Architect Grid
  const [architectQuizAnswer, setArchitectQuizAnswer] = useState<number | null>(null);
  const [deployedNodes, setDeployedNodes] = useState<{ id: string, type: string, health: number }[]>([]);
  const [simulatedMetrics, setSimulatedMetrics] = useState<{ latency: number, requestsPerSec: number, failureRate: number }>({ latency: 0, requestsPerSec: 0, failureRate: 0 });

  // Get current game datasets based on difficulty and selected language
  const currentSyntaxChallenge = SYNTAX_CHALLENGES.find(c => 
    c.language.toLowerCase() === selectedLanguage.toLowerCase() && c.level === difficulty
  ) || SYNTAX_CHALLENGES.find(c => 
    c.language.toLowerCase() === selectedLanguage.toLowerCase()
  ) || SYNTAX_CHALLENGES[0];

  const currentDsaLevel = DSA_LEVELS.find(l => l.difficulty === difficulty) || DSA_LEVELS[0];
  const currentSystemLevel = SYSTEM_LEVELS.find(l => l.difficulty === difficulty) || SYSTEM_LEVELS[0];

  // Clean-up timers on unmount
  useEffect(() => {
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, []);

  // Reset local game states on difficulty / game change
  useEffect(() => {
    setGameScore(0);
    setGameResult('idle');
    setSimulating(false);
    setSimulationLogs([]);
    setBadgeWonThisTurn(null);

    // Syntax Strike Reset
    setSelectedSyntaxOption(null);
    setSyntaxConsole('COMPILER: READY. SELECT A SYNTAX FIX TO PARSE.');

    // DSA Reset
    setDsaSelectedAlg('');
    setDsaQuizAnswer(null);
    setDsaCellStates('normal');
    setVisitedNodesList([]);
    setCurrentNodeStep(null);
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }

    // Architect Reset
    setArchitectQuizAnswer(null);
    setDeployedNodes([]);
    setSimulatedMetrics({ latency: 0, requestsPerSec: 0, failureRate: 0 });
  }, [activeGame, difficulty, selectedLanguage]);

  // Audio sound feedback synthesizer helper
  const playSound = (type: 'success' | 'fail' | 'click' | 'laser') => {
    if (isMuted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
        osc.frequency.setValueAtTime(329.63, ctx.currentTime + 0.1); // E4
        osc.frequency.setValueAtTime(392.00, ctx.currentTime + 0.2); // G4
        osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.3); // C5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'fail') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220.00, ctx.currentTime);
        osc.frequency.setValueAtTime(147.00, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (type === 'click') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } else if (type === 'laser') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
        osc.start();
        osc.stop(ctx.currentTime + 0.23);
      }
    } catch (e) {
      // AudioContext might be blocked or unsupported in iframe
    }
  };

  // Log game play and update userStats via backend call
  const submitGameProgressToBackend = async (score: number, xpEarned: number, badge: string | null) => {
    if (!token) return;
    setSubmittingProgress(true);
    try {
      const response = await fetch('/api/progress/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gameId: `${activeGame}-${difficulty.toLowerCase()}`,
          gameTitle: activeGame === 'syntax_strike' ? 'Syntax Strike Arena' : activeGame === 'dsa_dungeon' ? 'DSA Dungeon' : 'System Architect Grid',
          difficulty,
          score,
          xpEarned,
          badgeEarned: badge
        })
      });

      if (response.ok) {
        const data = await response.json();
        onUpdateStats(data.stats);
        if (badge) {
          setBadgeWonThisTurn(badge);
        }
      }
    } catch (err) {
      console.error('Failed to log game progress to database', err);
    } finally {
      setSubmittingProgress(false);
    }
  };

  // GAME 1 EXECUTE: Syntax Strike Compiler Run
  const handleRunCompiler = () => {
    if (selectedSyntaxOption === null) {
      playSound('fail');
      setSyntaxConsole('COMPILER ERROR: NO FIX TOKENS SELECTED. CODE REMAINS BROKEN.');
      return;
    }

    setSimulating(true);
    playSound('laser');
    setSyntaxConsole('INITIATING TRANSPILE SCHEME...\nRUNNING SYSTEM TEST SUITE...\n');

    setTimeout(() => {
      const selected = currentSyntaxChallenge.options[selectedSyntaxOption];
      if (selected.isCorrect) {
        playSound('success');
        setSyntaxConsole(prev => prev + `SUCCESS: Build Complete.\nPASS Case 1: Variable binding check.\nPASS Case 2: Boundary validation.\nSTABILITY SCORE: 100%\nSTATUS: Operational.`);
        setGameResult('success');
        setGameScore(100);
        
        // Award Badge
        const badgeName = `${currentSyntaxChallenge.language} Master`;
        submitGameProgressToBackend(100, 30, badgeName);
      } else {
        playSound('fail');
        setSyntaxConsole(prev => prev + `FAIL: Compilation syntax mismatch!\n${currentSyntaxChallenge.expectedConsole}\nHELP: ${selected.explanation}`);
        setGameResult('failed');
        setGameScore(0);
        submitGameProgressToBackend(0, 5, null); // 5 XP participation reward
      }
      setSimulating(false);
    }, 1200);
  };

  // GAME 2 EXECUTE: DSA Dungeon Crawler BFS/DFS Explorer Simulation
  const handleStartDungeonPathfinder = () => {
    if (!dsaSelectedAlg) {
      setSimulationLogs(['ERROR: Must select algorithm strategy (DFS vs BFS) to engage.']);
      return;
    }
    if (dsaQuizAnswer === null) {
      setSimulationLogs(['ERROR: Theoretical verification mandatory! Choose an answer to compiled quiz.']);
      return;
    }

    setSimulating(true);
    setDsaCellStates('searching');
    setSimulationLogs(['Initializing Dijkstra-Dungeon Engine...', `Selected path strategy: ${dsaSelectedAlg}`]);

    // Theoretical answer check
    const quizCorrect = dsaQuizAnswer === currentDsaLevel.correctQuizIdx;

    // Simulate stepping through nodes in a real visual timeline
    let steps: { r: number, c: number }[] = [];
    if (dsaSelectedAlg.includes('BFS') || dsaSelectedAlg.includes('Queue')) {
      // BFS expansion steps
      steps = [
        { r: 0, c: 1 }, { r: 1, c: 0 },
        { r: 0, c: 2 }, { r: 2, c: 0 },
        { r: 0, c: 3 }, { r: 3, c: 0 },
        { r: 0, c: 4 }, { r: 4, c: 0 },
        { r: 1, c: 4 }, { r: 4, c: 1 },
        { r: 2, c: 4 }, { r: 4, c: 2 },
        { r: 3, c: 4 }, { r: 4, c: 3 },
        { r: 4, c: 4 }
      ].filter(s => s.r < currentDsaLevel.gridSize.r && s.c < currentDsaLevel.gridSize.c && 
        !currentDsaLevel.obstacles.some(o => o.r === s.r && o.c === s.c));
    } else {
      // DFS lineage steps
      steps = [
        { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 },
        { r: 1, c: 4 }, { r: 2, c: 4 }, { r: 3, c: 4 }, { r: 4, c: 4 }
      ].filter(s => s.r < currentDsaLevel.gridSize.r && s.c < currentDsaLevel.gridSize.c && 
        !currentDsaLevel.obstacles.some(o => o.r === s.r && o.c === s.c));
    }

    let i = 0;
    setVisitedNodesList([]);

    stepTimerRef.current = setInterval(() => {
      if (i < steps.length) {
        const node = steps[i];
        setCurrentNodeStep(node);
        setVisitedNodesList(prev => [...prev, node]);
        playSound('click');
        setSimulationLogs(prev => [
          ...prev, 
          `Step ${i + 1}: Visited index node [Row ${node.r}, Col ${node.c}] // Stack/Queue count: ${steps.length - i}`
        ]);
        i++;
      } else {
        clearInterval(stepTimerRef.current!);
        stepTimerRef.current = null;
        setSimulating(false);

        if (quizCorrect) {
          playSound('success');
          setDsaCellStates('found');
          setSimulationLogs(prev => [...prev, '✓ Destination acquired!', '✓ Conceptual assessment verified 100%.']);
          setGameResult('success');
          setGameScore(100);
          
          const badgeName = `${difficulty} Algorithms Champion`;
          submitGameProgressToBackend(100, 40, badgeName);
        } else {
          playSound('fail');
          setSimulationLogs(prev => [
            ...prev, 
            '✕ Algorithm path resolved, but conceptual validation failed!', 
            `Expected answer to theory quiz was: "${currentDsaLevel.quizOptions[currentDsaLevel.correctQuizIdx]}"`
          ]);
          setGameResult('failed');
          setGameScore(30);
          submitGameProgressToBackend(30, 10, null);
        }
      }
    }, 250);
  };

  // GAME 3 EXECUTE: System Architect Simulation
  const handleDeployAndLoadTest = () => {
    if (deployedNodes.length === 0) {
      setSimulationLogs(['ERROR: Architecture is empty! Drag or click nodes above to deploy services first.']);
      return;
    }
    if (architectQuizAnswer === null) {
      setSimulationLogs(['ERROR: System Design credential checklist requires theoretical validation first. Answer the design quiz.']);
      return;
    }

    setSimulating(true);
    setSimulationLogs(['Initializing High-Fidelity Server Farm...', 'Directing traffic gateway streams...', `Target Load: ${currentSystemLevel.incomingLoad}`]);

    let i = 0;
    const interval = setInterval(() => {
      if (i < 4) {
        playSound('click');
        setSimulationLogs(prev => [...prev, `Stress Test Stream Phase ${i+1}/4: Pumping synthetic RPC requests...`]);
        i++;
      } else {
        clearInterval(interval);
        setSimulating(false);

        const hasCDN = deployedNodes.some(n => n.type === 'Static CDN');
        const hasReplica = deployedNodes.some(n => n.type === 'Read Replica DB');
        const hasCache = deployedNodes.some(n => n.type === 'Redis Cache Layer');
        const hasQueue = deployedNodes.some(n => n.type === 'Kafka Message Queue');
        const totalServers = deployedNodes.filter(n => n.type.includes('Server') || n.type.includes('Microservice')).length;

        // Calculate stability metrics
        let baseStability = 50;
        if (difficulty === 'Beginner') {
          if (hasCDN) baseStability += 20;
          if (totalServers >= 2) baseStability += 30;
        } else if (difficulty === 'Intermediate') {
          if (hasCache) baseStability += 20;
          if (hasReplica) baseStability += 20;
          if (totalServers >= 3) baseStability += 10;
        } else {
          if (hasQueue) baseStability += 20;
          if (hasCache) baseStability += 10;
          if (totalServers >= 4) baseStability += 20;
        }

        const isQuizCorrect = architectQuizAnswer === currentSystemLevel.correctQuizIdx;
        const finalStability = isQuizCorrect ? Math.min(baseStability, 100) : Math.max(baseStability - 40, 20);

        setSimulatedMetrics({
          latency: finalStability >= 80 ? 45 : 320,
          requestsPerSec: parseInt(currentSystemLevel.incomingLoad.replace(/[^0-9]/g, '')),
          failureRate: 100 - finalStability
        });

        if (finalStability >= currentSystemLevel.targetStabilityScore && isQuizCorrect) {
          playSound('success');
          setSimulationLogs(prev => [
            ...prev,
            `✓ STRESS TEST COMPLETED SUCCESSFULLY!`,
            `✓ Stability Rating: ${finalStability}% (Goal: >=${currentSystemLevel.targetStabilityScore}%)`,
            `✓ Peak Latency: 45ms // 0% Connection drops.`
          ]);
          setGameResult('success');
          setGameScore(finalStability);

          const badgeName = `${difficulty} System Architect`;
          submitGameProgressToBackend(finalStability, 50, badgeName);
        } else {
          playSound('fail');
          setSimulationLogs(prev => [
            ...prev,
            `✕ CRITICAL ALARM: ARCHITECTURE COLLAPSED UNDER TRAFFIC LOAD!`,
            `✕ Stability Rating: ${finalStability}% (Goal: >=${currentSystemLevel.targetStabilityScore}%)`,
            !isQuizCorrect ? '✕ Quiz failure: System security validation mismatch occurred.' : '✕ Service exhaustion: Build server clustering or caching nodes to ease primary database IO bottleneck.'
          ]);
          setGameResult('failed');
          setGameScore(30);
          submitGameProgressToBackend(30, 15, null);
        }
      }
    }, 400);
  };

  const handleAddArchitectNode = (nodeType: string) => {
    playSound('click');
    const limitObj = currentSystemLevel.baseNodesAllowed.find(n => n.type === nodeType);
    const alreadyDeployedCount = deployedNodes.filter(n => n.type === nodeType).length;

    if (limitObj && alreadyDeployedCount >= limitObj.limit) {
      setSimulationLogs(prev => [...prev, `LIMIT MET: Cannot deploy more than ${limitObj.limit} instance(s) of ${nodeType} in this level.`]);
      return;
    }

    setDeployedNodes(prev => [
      ...prev,
      { id: `${nodeType}-${Date.now()}`, type: nodeType, health: 100 }
    ]);
    setSimulationLogs(prev => [...prev, `[DEPLOYED]: Booted ${nodeType.toUpperCase()} node instance.`]);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#F8F7F4] font-mono">
      
      {/* Game Stage Selection Header */}
      <div className="bg-[#18181b] border-2 border-white/10 p-6 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase block">[05] INTERACTIVE LAB GAMES</span>
          <h2 className="text-2xl font-display font-extrabold text-white mt-1 uppercase">CODING GAMES ARENA</h2>
          <p className="text-[11px] text-[#F8F7F4]/50 leading-relaxed uppercase mt-1">
            Learn syntaxes, algorithm structures, and scalable systems in three custom simulation game workspaces.
          </p>
        </div>

        {/* Audio control & Selection info */}
        <div className="flex items-center gap-3 self-end md:self-auto text-[10px]">
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className="p-2 border border-white/10 hover:border-amber-400 text-amber-400 rounded-sm cursor-pointer transition-colors"
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          <div className="bg-[#111113] border border-white/5 p-2 rounded-sm text-amber-300">
            CURRENT XP: <span className="font-bold text-[#FFD700]">{stats.xpPoints} XP</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Game switch tabs and Level difficulties */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Side Controls */}
        <div className="space-y-4">
          <div className="bg-[#18181b] border border-white/10 p-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-3">SELECT GAME MODALITY</h3>
            <div className="space-y-1.5 text-xs">
              {[
                { id: 'syntax_strike', title: 'SYNTAX STRIKE', desc: 'Syntax fix compiler challenge', icon: <Code2 className="w-4 h-4" /> },
                { id: 'dsa_dungeon', title: 'DSA DUNGEON', desc: 'Visual algorithm pathfinder', icon: <BrainCircuit className="w-4 h-4" /> },
                { id: 'system_architect', title: 'SYSTEM ARCHITECT', desc: 'System design load simulator', icon: <Server className="w-4 h-4" /> }
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => { playSound('click'); setActiveGame(g.id as GameType); }}
                  className={`w-full text-left p-3 border transition-all flex items-start gap-3 rounded-sm cursor-pointer ${
                    activeGame === g.id
                      ? 'bg-amber-400/10 border-amber-400 text-amber-400 font-bold'
                      : 'border-transparent hover:bg-white/5 text-[#F8F7F4]/60 hover:text-white'
                  }`}
                >
                  <div className="mt-0.5">{g.icon}</div>
                  <div>
                    <span className="block uppercase text-[11px] font-extrabold">{g.title}</span>
                    <span className="text-[9px] text-[#F8F7F4]/40 font-mono normal-case mt-0.5 block">{g.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#18181b] border border-white/10 p-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-3">LEVEL DIFFICULTY</h3>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => { playSound('click'); setDifficulty(lvl as DifficultyLevel); }}
                  className={`py-2 text-center border transition cursor-pointer ${
                    difficulty === lvl
                      ? 'bg-amber-400 border-amber-400 text-amber-950 font-black'
                      : 'bg-[#111113] border-white/10 text-[#F8F7F4]/50 hover:text-white hover:border-white/25'
                  }`}
                >
                  {lvl.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Gamified Achievements Box */}
          <div className="bg-[#18181b] border border-white/10 p-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-3">EARNED BADGES</h3>
            {stats.badges.length === 0 ? (
              <p className="text-[9px] text-[#F8F7F4]/40 uppercase py-2 leading-relaxed">Play and score 100% in games to receive specialized learning credentials.</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {stats.badges.map((b, idx) => (
                  <span key={idx} className="bg-amber-400/10 border border-amber-400/20 text-amber-400 font-black text-[8px] px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                    🏆 {b}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Main Interactive Game Interface */}
        <div className="lg:col-span-3 space-y-6">

          {/* 1. SYNTAX STRIKE GAMEBOARD */}
          {activeGame === 'syntax_strike' && (
            <div className="bg-[#18181b] border border-white/10 p-6 rounded-sm space-y-6">
              
              {/* Category & Language Selectors */}
              <div className="space-y-4 bg-[#111113] p-4 border border-white/5 rounded-sm">
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-2">1. LANGUAGE DOMAIN CATEGORIES</span>
                  <div className="flex flex-wrap gap-1.5">
                    {LANGUAGE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => {
                          playSound('click');
                          setSelectedCategory(cat.name);
                          const matchingLang = cat.languages[0];
                          setSelectedLanguage(matchingLang);
                        }}
                        className={`px-3 py-1.5 text-[10px] font-bold border transition-all rounded-sm uppercase cursor-pointer ${
                          selectedCategory === cat.name
                            ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                            : 'bg-[#18181b] border-white/5 text-[#F8F7F4]/40 hover:text-[#F8F7F4]/80 hover:border-white/10'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-2">2. CHOOSE TARGET LANGUAGE ({LANGUAGE_CATEGORIES.find(c => c.name === selectedCategory)?.languages.length || 0} AVAILABLE)</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                    {(LANGUAGE_CATEGORIES.find(c => c.name === selectedCategory)?.languages || []).map((lang) => {
                      const isCompleted = stats.badges.includes(`${lang} Master`);
                      return (
                        <button
                          key={lang}
                          onClick={() => {
                            playSound('click');
                            setSelectedLanguage(lang);
                          }}
                          className={`px-3 py-2 text-center text-[10px] font-bold border transition-all rounded-sm uppercase cursor-pointer flex items-center justify-center gap-1.5 ${
                            selectedLanguage === lang
                              ? 'bg-amber-400 border-amber-400 text-amber-950 font-black'
                              : 'bg-[#18181b] border-white/5 text-[#F8F7F4]/60 hover:bg-white/5'
                          }`}
                        >
                          <span className="truncate">{lang}</span>
                          {isCompleted && <span className="text-amber-400 shrink-0 text-[8px]" title="Dossier Credential Earned">🏆</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border-b border-white/5 pb-3">
                <span className="text-[9px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 font-bold uppercase">
                  Language target: {currentSyntaxChallenge.language} ({currentSyntaxChallenge.level})
                </span>
                <h3 className="text-sm font-bold text-[#F8F7F4] uppercase mt-2">{currentSyntaxChallenge.scenario}</h3>
                <p className="text-[11px] text-[#F8F7F4]/50 normal-case mt-1">{currentSyntaxChallenge.instructions}</p>
              </div>

              {/* Pseudo IDE editor container */}
              <div className="bg-[#0f0f11] border border-white/5 rounded-sm p-4 font-mono text-[11px] overflow-hidden relative shadow-inner">
                <div className="absolute top-2 right-2 flex gap-1">
                  <div className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                </div>
                
                <span className="text-[#F8F7F4]/30 block text-[9px] mb-2 font-bold select-none uppercase">// COMPILER IDE GRID STACK</span>
                <pre className="text-amber-200/90 whitespace-pre-wrap leading-relaxed select-none">
                  {currentSyntaxChallenge.buggyCode}
                </pre>
              </div>

              {/* Multiple Choice fixer options */}
              <div className="space-y-2">
                <span className="text-[10px] text-[#F8F7F4]/40 font-bold uppercase tracking-wider block">AVAILABLE CODE PATCHES</span>
                {currentSyntaxChallenge.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => { playSound('click'); setSelectedSyntaxOption(oIdx); }}
                    className={`w-full text-left p-3.5 border text-xs leading-relaxed transition-all rounded-sm flex gap-3 items-start cursor-pointer ${
                      selectedSyntaxOption === oIdx
                        ? 'bg-amber-400/5 border-amber-400 text-amber-300'
                        : 'bg-[#111113] border-white/5 hover:border-white/20 text-[#F8F7F4]/70 hover:text-white'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${selectedSyntaxOption === oIdx ? 'border-amber-400 bg-amber-400 text-black' : 'border-white/20'}`}>
                      {selectedSyntaxOption === oIdx && <span className="text-[8px] font-black">✓</span>}
                    </div>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>

              {/* Console & controls */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#F8F7F4]/40 font-bold uppercase tracking-wider">CONSOLE OUTPUT FEEDBACK</span>
                  {gameResult === 'success' && (
                    <span className="text-emerald-400 text-[10px] font-bold uppercase">● RUNTIME SUCCESS (+30 XP)</span>
                  )}
                  {gameResult === 'failed' && (
                    <span className="text-rose-400 text-[10px] font-bold uppercase">● COMPILATION PANIC</span>
                  )}
                </div>

                <div className="bg-black text-[#a1a1aa] p-3 rounded-sm font-mono text-[10px] min-h-[4.5rem] whitespace-pre-wrap border border-white/5 uppercase">
                  {syntaxConsole}
                </div>

                {badgeWonThisTurn && (
                  <div className="bg-amber-400/10 border-2 border-amber-400 p-4 rounded-sm flex items-center gap-3 animate-pulse">
                    <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-[#FFD700] text-xs uppercase">CREDENTIAL FORGED!</h4>
                      <p className="text-[9px] text-[#F8F7F4]/80 uppercase mt-0.5">You unlocked the "{badgeWonThisTurn}" badge on your public career dossier!</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setSelectedSyntaxOption(null);
                      setGameResult('idle');
                      setSyntaxConsole('COMPILER REBOOTED. INPUT STACK REFRESHED.');
                    }}
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:border-amber-400 hover:text-amber-400 text-[11px] font-bold uppercase cursor-pointer"
                  >
                    Reset Challenge
                  </button>
                  <button
                    onClick={handleRunCompiler}
                    disabled={simulating || submittingProgress || selectedSyntaxOption === null}
                    className="px-6 py-2 bg-amber-400 border border-amber-400 text-amber-950 hover:bg-amber-300 font-bold uppercase text-[11px] tracking-wider cursor-pointer disabled:opacity-40"
                  >
                    {simulating ? 'Parsing System...' : 'EXECUTE COMPILER'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. DSA DUNGEON CRAWLER */}
          {activeGame === 'dsa_dungeon' && (
            <div className="bg-[#18181b] border border-white/10 p-6 rounded-sm space-y-6">
              
              <div className="border-b border-white/5 pb-3">
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 font-bold uppercase">
                  DSA STUDY LEVEL: {currentDsaLevel.difficulty}
                </span>
                <h3 className="text-sm font-bold text-[#F8F7F4] uppercase mt-2">{currentDsaLevel.levelName}</h3>
                <p className="text-[11px] text-[#F8F7F4]/50 normal-case mt-1">{currentDsaLevel.objective}</p>
              </div>

              {/* Game Stage Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual Dungeon Board Map */}
                <div className="bg-[#0f0f11] border border-white/5 p-4 flex flex-col justify-between items-center rounded-sm min-h-[220px]">
                  <span className="text-[#F8F7F4]/30 block text-[9px] self-start mb-3 font-bold uppercase">// LIVE PATHFINDER GRID</span>
                  
                  {/* Grid generation */}
                  <div className="flex-1 flex items-center justify-center">
                    <div 
                      className="grid gap-1.5" 
                      style={{ 
                        gridTemplateColumns: `repeat(${currentDsaLevel.gridSize.c}, minmax(0, 1fr))`,
                        width: '240px'
                      }}
                    >
                      {Array.from({ length: currentDsaLevel.gridSize.r * currentDsaLevel.gridSize.c }).map((_, index) => {
                        const r = Math.floor(index / currentDsaLevel.gridSize.c);
                        const c = index % currentDsaLevel.gridSize.c;
                        
                        const isStart = currentDsaLevel.startPos.r === r && currentDsaLevel.startPos.c === c;
                        const isTarget = currentDsaLevel.targetPos.r === r && currentDsaLevel.targetPos.c === c;
                        const isObstacle = currentDsaLevel.obstacles.some(o => o.r === r && o.c === c);
                        const isVisited = visitedNodesList.some(v => v.r === r && v.c === c);
                        const isActive = currentNodeStep?.r === r && currentNodeStep?.c === c;

                        let cellClass = 'bg-[#18181b] border border-white/5';
                        let symbol = ' ';
                        
                        if (isStart) {
                          cellClass = 'bg-amber-400 border-amber-300 text-black font-extrabold shadow-[0_0_10px_rgba(255,215,0,0.4)]';
                          symbol = '@';
                        } else if (isTarget) {
                          cellClass = 'bg-emerald-500 border-emerald-400 text-black font-extrabold animate-pulse';
                          symbol = '★';
                        } else if (isObstacle) {
                          cellClass = 'bg-rose-500/10 border-rose-500/30 text-rose-500';
                          symbol = '🧱';
                        } else if (isActive) {
                          cellClass = 'bg-sky-400 border-sky-300 text-[#0c0c0e] font-black scale-110';
                          symbol = 'O';
                        } else if (isVisited) {
                          cellClass = 'bg-amber-400/20 border-amber-400/40 text-amber-400';
                          symbol = '•';
                        }

                        return (
                          <div 
                            key={index} 
                            className={`w-8 h-8 rounded-sm flex items-center justify-center font-mono text-[11px] transition-all duration-150 ${cellClass}`}
                            title={`[Row ${r}, Col ${c}]`}
                          >
                            {symbol}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Legends */}
                  <div className="w-full flex justify-between text-[8px] text-[#F8F7F4]/40 uppercase mt-4">
                    <span>@ Hero (Start)</span>
                    <span>★ Exit Key</span>
                    <span>• Visited Set</span>
                    <span>🧱 Blockers</span>
                  </div>
                </div>

                {/* Alg Config Options & Code Block */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-[#F8F7F4]/40 font-bold uppercase tracking-wider block mb-2">CHOOSE SEARCH STRATEGY</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      {currentDsaLevel.algorithmOptions.map((alg) => (
                        <button
                          key={alg}
                          onClick={() => { playSound('click'); setDsaSelectedAlg(alg); }}
                          className={`p-2 border rounded-sm text-left transition cursor-pointer ${
                            dsaSelectedAlg === alg
                              ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-bold'
                              : 'bg-[#111113] border-white/5 hover:border-white/20 text-[#F8F7F4]/60'
                          }`}
                        >
                          {alg.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Algorithm Pseudocode */}
                  <div className="bg-[#0f0f11] border border-white/5 p-3 rounded-sm font-mono text-[10px] leading-relaxed">
                    <span className="text-[#F8F7F4]/30 block text-[8px] mb-1 font-bold uppercase">// TARGET PSUEDOCODE MATRIX</span>
                    <pre className="text-amber-200/80 overflow-x-auto whitespace-pre">
                      {currentDsaLevel.buggyPseudocode}
                    </pre>
                  </div>
                </div>

              </div>

              {/* Verification Quiz (DSA Theory) */}
              <div className="bg-[#111113] border border-white/5 p-4 rounded-sm space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <HelpCircle className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">COMPILING THEORETICAL CREDENTIAL</span>
                </div>
                <p className="text-xs text-[#F8F7F4] uppercase leading-snug">{currentDsaLevel.quizQuestion}</p>
                
                <div className="grid grid-cols-1 gap-1.5 pt-1.5 text-xs">
                  {currentDsaLevel.quizOptions.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => { playSound('click'); setDsaQuizAnswer(oIdx); }}
                      className={`w-full text-left p-3 border text-[11px] leading-relaxed transition-all rounded-sm flex items-center gap-2.5 cursor-pointer ${
                        dsaQuizAnswer === oIdx
                          ? 'bg-amber-400/5 border-amber-400 text-amber-300'
                          : 'bg-[#18181b] border-white/5 hover:border-white/25 text-[#F8F7F4]/75 hover:text-white'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${dsaQuizAnswer === oIdx ? 'border-amber-400 bg-amber-400 text-black' : 'border-white/20'}`}>
                        {dsaQuizAnswer === oIdx && <span className="text-[7px] font-black">✓</span>}
                      </div>
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulation logs & Actions */}
              <div className="space-y-3">
                <span className="text-[10px] text-[#F8F7F4]/40 font-bold uppercase tracking-wider block">DIAGNOSTIC TELEMETRY</span>
                
                <div className="bg-black text-[#a1a1aa] p-3 rounded-sm font-mono text-[9px] h-24 overflow-y-auto whitespace-pre-wrap border border-white/5 uppercase">
                  {simulationLogs.length === 0 ? 'ENGINE STANDBY. SELECT CODE CONFIGS AND LAUNCH RUNNER.' : simulationLogs.join('\n')}
                </div>

                {badgeWonThisTurn && (
                  <div className="bg-amber-400/10 border-2 border-amber-400 p-4 rounded-sm flex items-center gap-3 animate-pulse">
                    <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-[#FFD700] text-xs uppercase">BADGE EARNED!</h4>
                      <p className="text-[9px] text-[#F8F7F4]/80 uppercase mt-0.5">Unlocked Badge: "{badgeWonThisTurn}" on your profile!</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setDsaSelectedAlg('');
                      setDsaQuizAnswer(null);
                      setVisitedNodesList([]);
                      setCurrentNodeStep(null);
                      setSimulationLogs([]);
                      setGameResult('idle');
                    }}
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:border-amber-400 hover:text-amber-400 text-[11px] font-bold uppercase cursor-pointer"
                  >
                    Reset Map
                  </button>
                  <button
                    onClick={handleStartDungeonPathfinder}
                    disabled={simulating || submittingProgress || !dsaSelectedAlg || dsaQuizAnswer === null}
                    className="px-6 py-2 bg-amber-400 border border-amber-400 text-amber-950 hover:bg-amber-300 font-bold uppercase text-[11px] tracking-wider cursor-pointer disabled:opacity-40"
                  >
                    {simulating ? 'Pathfinding...' : 'Simulate Algorithm'}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* 3. SYSTEM ARCHITECT GRID */}
          {activeGame === 'system_architect' && (
            <div className="bg-[#18181b] border border-white/10 p-6 rounded-sm space-y-6">
              
              <div className="border-b border-white/5 pb-3">
                <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 font-bold uppercase">
                  CAREER ARCHITECT: {currentSystemLevel.difficulty}
                </span>
                <h3 className="text-sm font-bold text-[#F8F7F4] uppercase mt-2">{currentSystemLevel.scenarioTitle}</h3>
                <p className="text-[11px] text-[#F8F7F4]/50 normal-case mt-1">{currentSystemLevel.loadDescription}</p>
              </div>

              {/* Top: Nodes Palette Deployer */}
              <div className="bg-[#111113] border border-white/5 p-4 rounded-sm">
                <span className="text-[10px] text-[#F8F7F4]/40 font-bold uppercase tracking-wider block mb-3">DEPLOY NODES PALETTE (LIMIT QUANTITY BOUND)</span>
                <div className="flex flex-wrap gap-2">
                  {currentSystemLevel.baseNodesAllowed.map((node) => {
                    const currentCount = deployedNodes.filter(n => n.type === node.type).length;
                    return (
                      <button
                        key={node.type}
                        onClick={() => handleAddArchitectNode(node.type)}
                        className={`px-3 py-2 border text-[10px] font-bold uppercase flex items-center gap-2 cursor-pointer transition rounded-sm ${
                          currentCount >= node.limit
                            ? 'bg-white/5 border-white/5 text-[#F8F7F4]/20 cursor-not-allowed'
                            : 'bg-[#18181b] border-white/10 text-sky-400 hover:border-sky-400 hover:bg-sky-500/5'
                        }`}
                        disabled={currentCount >= node.limit}
                      >
                        <span>+ {node.type}</span>
                        <span className="bg-[#0f0f11] text-[9px] px-1 border border-white/10">
                          {currentCount}/{node.limit}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid: Topology View & Live Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Visual Architecture Topology */}
                <div className="md:col-span-2 bg-[#0f0f11] border border-white/5 p-4 rounded-sm flex flex-col min-h-[220px]">
                  <span className="text-[#F8F7F4]/30 block text-[9px] mb-3 font-bold uppercase">// SYSTEM ARCHITECTURE CANVAS</span>
                  
                  {deployedNodes.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/5 text-[#F8F7F4]/30 text-[10px] uppercase text-center p-6 space-y-2">
                      <Layers className="w-8 h-8 text-[#F8F7F4]/20" />
                      <span>Topology Canvas is Empty</span>
                      <p className="text-[8px] normal-case max-w-xs">Click instances from the palette above to compile load balancer, databases, and microservices into your active framework.</p>
                    </div>
                  ) : (
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 p-2">
                      {deployedNodes.map((node) => (
                        <div 
                          key={node.id} 
                          className="bg-[#18181b] border border-white/10 p-3 flex flex-col justify-between items-center text-center relative group"
                        >
                          {/* Close node button */}
                          <button
                            onClick={() => {
                              playSound('fail');
                              setDeployedNodes(prev => prev.filter(n => n.id !== node.id));
                              setSimulationLogs(prev => [...prev, `[TERMINATED]: Destroyed ${node.type.toUpperCase()} node instance.`]);
                            }}
                            className="absolute top-1 right-1 text-[#F8F7F4]/35 hover:text-rose-500 font-bold text-[8px] uppercase px-1 border border-transparent hover:border-rose-500/20 cursor-pointer"
                          >
                            ✖
                          </button>

                          <div className="w-8 h-8 bg-sky-500/10 border border-sky-400/40 rounded-full flex items-center justify-center mb-2">
                            {node.type.includes('Database') || node.type.includes('DB') ? (
                              <Database className="w-4 h-4 text-sky-400" />
                            ) : node.type.includes('Balancer') ? (
                              <Cpu className="w-4 h-4 text-sky-400" />
                            ) : node.type.includes('CDN') ? (
                              <Globe className="w-4 h-4 text-sky-400" />
                            ) : (
                              <Server className="w-4 h-4 text-sky-400" />
                            )}
                          </div>

                          <div>
                            <span className="block font-bold uppercase text-[9px] text-[#F8F7F4] leading-tight truncate max-w-[120px]">{node.type}</span>
                            <span className="text-[8px] text-emerald-400 font-mono tracking-widest block uppercase mt-1">● ONLINE</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Simulated Real-Time Metric Monitors */}
                <div className="bg-[#0f0f11] border border-white/5 p-4 rounded-sm flex flex-col justify-between">
                  <span className="text-[#F8F7F4]/30 block text-[9px] mb-3 font-bold uppercase">// LIVE METRIC ANALYTICS</span>
                  
                  <div className="space-y-4 flex-1 flex flex-col justify-center">
                    <div>
                      <span className="text-[8px] text-[#F8F7F4]/40 uppercase tracking-widest block mb-1">NETWORK LATENCY (PEAK)</span>
                      <h4 className={`text-2xl font-extrabold uppercase font-display ${simulatedMetrics.latency >= 150 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                        {simulatedMetrics.latency === 0 ? 'N/A' : `${simulatedMetrics.latency} ms`}
                      </h4>
                    </div>

                    <div>
                      <span className="text-[8px] text-[#F8F7F4]/40 uppercase tracking-widest block mb-1">INCOMING REQUEST STREAM</span>
                      <h4 className="text-xl font-extrabold text-white font-display uppercase">
                        {simulatedMetrics.requestsPerSec === 0 ? '0' : `${simulatedMetrics.requestsPerSec.toLocaleString()} REQ/S`}
                      </h4>
                    </div>

                    <div>
                      <span className="text-[8px] text-[#F8F7F4]/40 uppercase tracking-widest block mb-1">EXCEPTION / DROP RATIO</span>
                      <h4 className={`text-xl font-extrabold uppercase font-display ${simulatedMetrics.failureRate > 20 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                        {simulatedMetrics.latency === 0 ? '0.0%' : `${simulatedMetrics.failureRate}% ERROR`}
                      </h4>
                    </div>
                  </div>
                </div>

              </div>

              {/* Quiz verification (System design conceptual check) */}
              <div className="bg-[#111113] border border-white/5 p-4 rounded-sm space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">SYSTEM ENGINEERING ASSIGNED QUIZ</span>
                </div>
                <p className="text-xs text-[#F8F7F4] uppercase leading-snug">{currentSystemLevel.quizQuestion}</p>
                
                <div className="grid grid-cols-1 gap-1.5 pt-1.5 text-xs">
                  {currentSystemLevel.quizOptions.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => { playSound('click'); setArchitectQuizAnswer(oIdx); }}
                      className={`w-full text-left p-3 border text-[11px] leading-relaxed transition-all rounded-sm flex items-center gap-2.5 cursor-pointer ${
                        architectQuizAnswer === oIdx
                          ? 'bg-amber-400/5 border-amber-400 text-amber-300'
                          : 'bg-[#18181b] border-white/5 hover:border-white/25 text-[#F8F7F4]/75 hover:text-white'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${architectQuizAnswer === oIdx ? 'border-amber-400 bg-amber-400 text-black' : 'border-white/20'}`}>
                        {architectQuizAnswer === oIdx && <span className="text-[7px] font-black">✓</span>}
                      </div>
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action logs and buttons */}
              <div className="space-y-3">
                <span className="text-[10px] text-[#F8F7F4]/40 font-bold uppercase tracking-wider block">STRESS GATEWAY TELEMETRY TERMINAL</span>
                
                <div className="bg-black text-[#a1a1aa] p-3 rounded-sm font-mono text-[9px] h-24 overflow-y-auto whitespace-pre-wrap border border-white/5 uppercase">
                  {simulationLogs.length === 0 ? 'GATEWAY READY. STAGE HARDWARE TOPOLOGY AND SUBMIT COMPLIANCE CHECKLIST.' : simulationLogs.join('\n')}
                </div>

                {badgeWonThisTurn && (
                  <div className="bg-amber-400/10 border-2 border-amber-400 p-4 rounded-sm flex items-center gap-3 animate-pulse">
                    <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-[#FFD700] text-xs uppercase">CREDENTIAL SYNC COMPLETED!</h4>
                      <p className="text-[9px] text-[#F8F7F4]/80 uppercase mt-0.5">Assigned Badge: "{badgeWonThisTurn}" is successfully committed!</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setDeployedNodes([]);
                      setArchitectQuizAnswer(null);
                      setSimulationLogs([]);
                      setSimulatedMetrics({ latency: 0, requestsPerSec: 0, failureRate: 0 });
                      setGameResult('idle');
                    }}
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:border-amber-400 hover:text-amber-400 text-[11px] font-bold uppercase cursor-pointer"
                  >
                    Clear Canvas
                  </button>
                  <button
                    onClick={handleDeployAndLoadTest}
                    disabled={simulating || submittingProgress || deployedNodes.length === 0 || architectQuizAnswer === null}
                    className="px-6 py-2 bg-[#FFD700] border border-[#FFD700] text-[#111113] hover:bg-amber-400 font-bold uppercase text-[11px] tracking-wider cursor-pointer disabled:opacity-40"
                  >
                    {simulating ? 'Pumping Reqs...' : 'Simulate Traffic Load'}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
