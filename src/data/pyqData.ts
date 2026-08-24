import { ChapterCategoryInfo, EraInfo, PYQuestion, VolumeInfo } from '../types';

export const GATE_PYQ_ERAS: EraInfo[] = [
  { id: 'all', label: 'All Eras (1987 – 2026)', minYear: 1987, maxYear: 2026 },
  { id: 'modern', label: 'Modern Era (2018 – 2026)', minYear: 2018, maxYear: 2026 },
  { id: 'golden', label: 'Golden Era (2008 – 2017)', minYear: 2008, maxYear: 2017 },
  { id: 'classic', label: 'Classic Era (1998 – 2007)', minYear: 1998, maxYear: 2007 },
  { id: 'vintage', label: 'Vintage Era (1987 – 1997)', minYear: 1987, maxYear: 1997 },
];

export const GATE_VOLUMES: VolumeInfo[] = [
  {
    volume: 1,
    name: 'GATE CSE PYQs (1987 – 2026) — Volume 1: Mathematics & Aptitude',
    shortName: 'Vol 1: Mathematics & GA',
    category: 'Mathematics & General Aptitude',
    subjects: [
      'Discrete Mathematics',
      'Engineering Mathematics',
      'General Aptitude',
    ],
    totalQuestions: 1125,
    pdfFileName: 'GATE-CSE-PYQs-1987-2026-Volume-1.pdf',
  },
  {
    volume: 2,
    name: 'GATE CSE PYQs (1987 – 2026) — Volume 2: Core Computer Science',
    shortName: 'Vol 2: Core CS',
    category: 'Core Computer Science',
    subjects: [
      'Algorithms',
      'Programming and Data Structures',
      'Theory of Computation',
      'Compiler Design',
    ],
    totalQuestions: 1263,
    pdfFileName: 'GATE-CSE-PYQs-1987-2026-Volume-2.pdf',
  },
  {
    volume: 3,
    name: 'GATE CSE PYQs (1987 – 2026) — Volume 3: Computer Systems',
    shortName: 'Vol 3: Systems',
    category: 'Computer Systems',
    subjects: [
      'Operating Systems',
      'Computer Organization and Architecture',
      'Databases',
      'Computer Networks',
      'Digital Logic',
    ],
    totalQuestions: 1450,
    pdfFileName: 'GATE-CSE-PYQs-1987-2026-Volume-3.pdf',
  },
];

export const GATE_CHAPTER_CATEGORIES: ChapterCategoryInfo[] = [
  // --- VOLUME 1 CATEGORIES ---
  {
    id: 'vol1-discrete-math',
    volume: 1,
    subject: 'Discrete Mathematics',
    categoryName: 'Discrete Mathematics',
    description: 'Combinatorics, Graph Theory, Mathematical Logic, Sets, Relations, Functions & Groups',
    totalQuestions: 390,
    chapters: [
      { id: 'ch-dm-comb', title: 'Combinatorics & Generating Functions', questionCount: 51, keyConcepts: ['Pigeonhole Principle', 'Inclusion-Exclusion', 'Recurrence Relations', 'Generating Functions'] },
      { id: 'ch-dm-graph', title: 'Graph Theory, Matching & Planarity', questionCount: 88, keyConcepts: ['Handshaking Lemma', 'Planar Graphs (Euler Formula)', 'Bipartite Matching', 'Graph Coloring'] },
      { id: 'ch-dm-logic', title: 'Propositional & First-Order Logic', questionCount: 78, keyConcepts: ['Tautology', 'Quantifiers', 'Inference Rules', 'Equivalence Laws'] },
      { id: 'ch-dm-sets', title: 'Set Theory, Relations, Functions & Lattices', questionCount: 173, keyConcepts: ['Equivalence Relations', 'Posets & Hasse Diagrams', 'Lattices', 'Group Theory'] },
    ],
  },
  {
    id: 'vol1-engg-math',
    volume: 1,
    subject: 'Engineering Mathematics',
    categoryName: 'Engineering Mathematics',
    description: 'Linear Algebra, Probability, Statistics & Calculus',
    totalQuestions: 306,
    chapters: [
      { id: 'ch-em-la', title: 'Linear Algebra (Matrices, Eigenvalues & Rank)', questionCount: 112, keyConcepts: ['Eigenvalues & Eigenvectors', 'Cayley-Hamilton Theorem', 'System of Linear Equations', 'Matrix Rank'] },
      { id: 'ch-em-prob', title: 'Probability & Distributions', questionCount: 125, keyConcepts: ['Bayes Theorem', 'Conditional Probability', 'Poisson & Exponential Distribution', 'Expectation & Variance'] },
      { id: 'ch-em-calc', title: 'Calculus (Limits, Continuity & Maxima-Minima)', questionCount: 69, keyConcepts: ['L Hopital Rule', 'Mean Value Theorems', 'Maxima and Minima', 'Definite Integrals'] },
    ],
  },
  {
    id: 'vol1-aptitude',
    volume: 1,
    subject: 'General Aptitude',
    categoryName: 'General Aptitude',
    description: 'Quantitative, Verbal, Analytical & Spatial Aptitude',
    totalQuestions: 429,
    chapters: [
      { id: 'ch-ga-quant', title: 'Quantitative Aptitude', questionCount: 197, keyConcepts: ['Percentages & Ratios', 'Time, Speed & Distance', 'Work & Time', 'Permutation & Combination'] },
      { id: 'ch-ga-verbal', title: 'Verbal Aptitude & Comprehension', questionCount: 165, keyConcepts: ['Vocabulary & Grammar', 'Reading Comprehension', 'Sentence Completion', 'Critical Reasoning'] },
      { id: 'ch-ga-analytic', title: 'Analytical & Logical Reasoning', questionCount: 48, keyConcepts: ['Syllogisms', 'Deductive Logic', 'Data Interpretation', 'Seating Arrangements'] },
      { id: 'ch-ga-spatial', title: 'Spatial Aptitude', questionCount: 19, keyConcepts: ['Paper Folding & Cutting', 'Mirror Images', 'Pattern Assembly', '2D/3D Rotations'] },
    ],
  },

  // --- VOLUME 2 CATEGORIES ---
  {
    id: 'vol2-algorithms',
    volume: 2,
    subject: 'Algorithms',
    categoryName: 'Algorithms Design & Analysis',
    description: 'Asymptotics, Recurrences, Sorting, Greedy, Dynamic Programming & Graph Algorithms',
    totalQuestions: 358,
    chapters: [
      { id: 'ch-algo-asymp', title: 'Asymptotic Analysis & Recurrence Relations', questionCount: 85, keyConcepts: ['Master Theorem', 'Big-O, Big-Omega, Theta', 'Substitution Method', 'Recursion Trees'] },
      { id: 'ch-algo-sort', title: 'Sorting, Searching & Order Statistics', questionCount: 72, keyConcepts: ['QuickSort & MergeSort Invariants', 'HeapSort', 'Lower Bound on Comparison Sorts', 'Binary Search'] },
      { id: 'ch-algo-greedy', title: 'Greedy Algorithms (MST & Huffman)', questionCount: 64, keyConcepts: ['Kruskal & Prim MST', 'Huffman Coding', 'Activity Selection', 'Fractional Knapsack'] },
      { id: 'ch-algo-dp', title: 'Dynamic Programming (0/1 Knapsack, LCS)', questionCount: 75, keyConcepts: ['Optimal Substructure', 'Longest Common Subsequence', 'Matrix Chain Multiplication', '0/1 Knapsack'] },
      { id: 'ch-algo-graphs', title: 'Graph Algorithms (Shortest Paths, Traversals)', questionCount: 62, keyConcepts: ['BFS & DFS Applications', 'Dijkstra Algorithm', 'Bellman-Ford', 'Floyd-Warshall'] },
    ],
  },
  {
    id: 'vol2-pds',
    volume: 2,
    subject: 'Programming and Data Structures',
    categoryName: 'Programming & Data Structures',
    description: 'C Programming, Pointers, Recursion, Stacks, Queues, Trees, Heaps & Hashing',
    totalQuestions: 370,
    chapters: [
      { id: 'ch-pds-c', title: 'C Programming, Pointers & Recursion', questionCount: 132, keyConcepts: ['Pointer Arithmetic', 'Parameter Passing (Value vs Reference)', 'Recursion Stack Tracing', 'Static & Scope Rules'] },
      { id: 'ch-pds-linear', title: 'Linear Data Structures (Stacks, Queues, Lists)', questionCount: 78, keyConcepts: ['Infix to Postfix Conversion', 'Queue using Stacks', 'Singly & Doubly Linked Lists', 'Circular Queues'] },
      { id: 'ch-pds-trees', title: 'Trees, BST, AVL & Binary Heaps', questionCount: 110, keyConcepts: ['Tree Traversals (Inorder/Preorder)', 'BST Insertion/Deletion', 'AVL Balance Factor', 'Min/Max Heap Operations'] },
      { id: 'ch-pds-hash', title: 'Hashing & Hash Tables', questionCount: 50, keyConcepts: ['Linear Probing', 'Quadratic Probing', 'Double Hashing', 'Chaining & Load Factor'] },
    ],
  },
  {
    id: 'vol2-toc',
    volume: 2,
    subject: 'Theory of Computation',
    categoryName: 'Theory of Computation',
    description: 'Automata Theory, Regular Languages, Grammars, PDA, Turing Machines & Decidability',
    totalQuestions: 293,
    chapters: [
      { id: 'ch-toc-fa', title: 'Finite Automata & Regular Languages', questionCount: 98, keyConcepts: ['DFA Minimization (Myhill-Nerode)', 'NFA to DFA Conversion', 'Regular Expressions', 'Pumping Lemma for Regular Languages'] },
      { id: 'ch-toc-cfg', title: 'Context-Free Grammars & Pushdown Automata', questionCount: 82, keyConcepts: ['Ambiguity in CFGs', 'Deterministic PDA vs NPDA', 'Closure Properties of CFLs', 'CYK Algorithm'] },
      { id: 'ch-toc-tm', title: 'Turing Machines & Chomsky Hierarchy', questionCount: 63, keyConcepts: ['Turing Machine Variants', 'Recursive vs Recursively Enumerable', 'Chomsky Normal Form', 'Grammar Classes'] },
      { id: 'ch-toc-decide', title: 'Decidability, Undecidability & Rice Theorem', questionCount: 50, keyConcepts: ['Halting Problem', 'Rice Theorem Applications', 'Post Correspondence Problem (PCP)', 'Reduction Techniques'] },
    ],
  },
  {
    id: 'vol2-compiler',
    volume: 2,
    subject: 'Compiler Design',
    categoryName: 'Compiler Design',
    description: 'Lexical Analysis, Parsing (LL/LR), SDT, Intermediate Code & Optimization',
    totalQuestions: 242,
    chapters: [
      { id: 'ch-cd-lex', title: 'Lexical Analysis & Tokenization', questionCount: 45, keyConcepts: ['Regular Expressions in Lex', 'Token Identification', 'Lexical Errors', 'Buffer Pairs'] },
      { id: 'ch-cd-parse', title: 'Parsing: LL(1), LR(0), SLR(1), LALR(1), CLR(1)', questionCount: 92, keyConcepts: ['FIRST and FOLLOW Computation', 'LL(1) Conflict Resolution', 'LR Parser Action/Goto Tables', 'Shift-Reduce & Reduce-Reduce Conflicts'] },
      { id: 'ch-cd-sdt', title: 'Syntax Directed Translation (SDT)', questionCount: 45, keyConcepts: ['S-Attributed Definitions', 'L-Attributed Definitions', 'Inherited vs Synthesized Attributes', 'Parse Tree Annotations'] },
      { id: 'ch-cd-opt', title: 'Intermediate Code & Code Optimization', questionCount: 60, keyConcepts: ['3-Address Code', 'Basic Blocks & Flow Graphs', 'Common Subexpression Elimination', 'Loop Invariant Motion'] },
    ],
  },

  // --- VOLUME 3 CATEGORIES ---
  {
    id: 'vol3-os',
    volume: 3,
    subject: 'Operating Systems',
    categoryName: 'Operating Systems',
    description: 'CPU Scheduling, Synchronization, Semaphores, Deadlocks, Paging & File Systems',
    totalQuestions: 358,
    chapters: [
      { id: 'ch-os-cpu', title: 'CPU Scheduling & Process Management', questionCount: 82, keyConcepts: ['FCFS, SJF, Round Robin, SRTF', 'Average Turnaround & Waiting Time', 'Gantt Chart Evaluation', 'Process State Transitions'] },
      { id: 'ch-os-sync', title: 'Process Synchronization & Semaphores', questionCount: 78, keyConcepts: ['Peterson Algorithm', 'Counting & Binary Semaphores', 'Producer-Consumer Problem', 'Dining Philosophers'] },
      { id: 'ch-os-deadlock', title: 'Deadlock Prevention, Avoidance & Recovery', questionCount: 64, keyConcepts: ['Banker Algorithm', 'Resource Allocation Graph (RAG)', 'Safe Sequence Verification', 'Deadlock Prevention Rules'] },
      { id: 'ch-os-mem', title: 'Memory Management, Paging & Virtual Memory', questionCount: 84, keyConcepts: ['Multi-level Paging', 'TLB Hit Ratio & Effective Access Time', 'Page Replacement (FIFO, LRU, Optimal, Belady)', 'Inverted Page Tables'] },
      { id: 'ch-os-disk', title: 'File Systems & Disk Scheduling', questionCount: 50, keyConcepts: ['FCFS, SSTF, SCAN, C-SCAN, LOOK', 'Inode Structure & File Allocation', 'Disk Seek Time Optimization', 'RAID Levels'] },
    ],
  },
  {
    id: 'vol3-coa',
    volume: 3,
    subject: 'Computer Organization and Architecture',
    categoryName: 'Computer Organization & Architecture',
    description: 'Addressing Modes, Cache Memory, Instruction Pipelining & Computer Arithmetic',
    totalQuestions: 251,
    chapters: [
      { id: 'ch-coa-modes', title: 'Addressing Modes & Machine Instructions', questionCount: 68, keyConcepts: ['Direct, Indirect, Relative, Indexed Modes', 'Instruction Format & Opcode Decoding', 'Zero/One/Two Address Machines', 'RISC vs CISC'] },
      { id: 'ch-coa-cache', title: 'Memory Hierarchy & Cache Mapping', questionCount: 86, keyConcepts: ['Direct, Set-Associative & Fully Associative', 'Tag, Set-Index & Word-Offset Bits', 'Hit Ratio & Average Memory Access Time', 'Write-Through vs Write-Back'] },
      { id: 'ch-coa-pipe', title: 'Instruction Pipelining & Hazard Resolution', questionCount: 54, keyConcepts: ['Structural, Data (RAW/WAR/WAW) Hazards', 'Control Hazards & Branch Stalls', 'Pipeline Speedup, Efficiency & Throughput', 'Operand Forwarding'] },
      { id: 'ch-coa-io', title: 'I/O Interfacing, Interrupts & DMA', questionCount: 25, keyConcepts: ['Programmed I/O vs Interrupt Driven', 'DMA Controller Burst & Cycle Stealing', 'Daisy Chaining & Priority Interrupts', 'Vectored Interrupts'] },
      { id: 'ch-coa-arith', title: 'Computer Arithmetic & IEEE-754 Representation', questionCount: 18, keyConcepts: ['IEEE-754 Single & Double Precision', 'Booth Algorithm for Signed Multiplication', 'Restoring & Non-Restoring Division', 'Overflow Conditions'] },
    ],
  },
  {
    id: 'vol3-dbms',
    volume: 3,
    subject: 'Databases',
    categoryName: 'Databases (DBMS)',
    description: 'ER Model, Relational Algebra, SQL, Normalization, Transactions & B+ Trees',
    totalQuestions: 302,
    chapters: [
      { id: 'ch-dbms-rel', title: 'Relational Model & Relational Algebra', questionCount: 55, keyConcepts: ['Selection, Projection, Join (Theta, Natural, Outer)', 'Tuple Relational Calculus (TRC)', 'Domain Relational Calculus (DRC)', 'Set Operations'] },
      { id: 'ch-dbms-sql', title: 'SQL Queries, Joins & Subqueries', questionCount: 65, keyConcepts: ['GROUP BY & HAVING Clauses', 'Nested & Correlated Subqueries', 'EXISTS / NOT EXISTS Operations', 'Integrity Constraints & Triggers'] },
      { id: 'ch-dbms-norm', title: 'Functional Dependencies & Normalization (1NF to BCNF)', questionCount: 70, keyConcepts: ['Attribute Closure & Candidate Keys', 'Lossless Join & Dependency Preservation', '2NF, 3NF, BCNF Verification', 'Canonical Cover Computation'] },
      { id: 'ch-dbms-trans', title: 'Transactions, Concurrency Control & Recovery', questionCount: 67, keyConcepts: ['Conflict & View Serializability', 'Two-Phase Locking (Strict/Rigorous 2PL)', 'Timestamp Ordering Protocol', 'Deadlock Detection & Wait-Die/Wound-Wait'] },
      { id: 'ch-dbms-index', title: 'Storage, Indexing & B+ Trees', questionCount: 45, keyConcepts: ['B-Tree & B+ Tree Order, Height & Block Size', 'Primary, Secondary & Clustered Indexes', 'Dense vs Sparse Indexing', 'Record Allocation & Hashing'] },
    ],
  },
  {
    id: 'vol3-cn',
    volume: 3,
    subject: 'Computer Networks',
    categoryName: 'Computer Networks',
    description: 'Data Link, CSMA/CD, IPv4/IPv6, Routing Protocols, TCP/UDP & Application Protocols',
    totalQuestions: 226,
    chapters: [
      { id: 'ch-cn-datalink', title: 'Data Link Layer & Flow Control', questionCount: 48, keyConcepts: ['Stop-and-Wait ARQ Efficiency', 'Go-Back-N ARQ & Window Sizes', 'Selective Repeat ARQ', 'CRC Error Detection & Hamming Distance'] },
      { id: 'ch-cn-mac', title: 'MAC Sublayer, CSMA/CD & Ethernet', questionCount: 35, keyConcepts: ['1-Persistent, p-Persistent CSMA', 'CSMA/CD Minimum Frame Size', 'Binary Exponential Backoff Algorithm', 'Token Ring Efficiency'] },
      { id: 'ch-cn-ip', title: 'Network Layer: IPv4/IPv6 Addressing & Subnetting', questionCount: 52, keyConcepts: ['Classless Inter-Domain Routing (CIDR)', 'Subnet Masks & IP Address Allocation', 'IPv4 Header Fields (TTL, Fragmentation, Checksum)', 'NAT & Private IP Ranges'] },
      { id: 'ch-cn-routing', title: 'Routing Protocols: Distance Vector & Link State', questionCount: 32, keyConcepts: ['Bellman-Ford & Count to Infinity Problem', 'Dijkstra Link State & OSPF', 'Split Horizon & Poison Reverse', 'BGP Exterior Gateway Routing'] },
      { id: 'ch-cn-tcp', title: 'Transport Layer: TCP Flow & Congestion Control', questionCount: 40, keyConcepts: ['Slow Start & Congestion Avoidance (AIMD)', 'Three-Way Handshake & Connection Teardown', 'TCP Window Size & Silly Window Syndrome', 'UDP Header & Checksum'] },
      { id: 'ch-cn-app', title: 'Application Layer & Network Security', questionCount: 19, keyConcepts: ['DNS Resolution & Hierarchy', 'HTTP 1.0 vs 1.1 Persistent Connections', 'SMTP, POP3, IMAP Email Protocols', 'RSA Encryption & Digital Signatures'] },
    ],
  },
  {
    id: 'vol3-digital',
    volume: 3,
    subject: 'Digital Logic',
    categoryName: 'Digital Logic & Design',
    description: 'Boolean Algebra, K-Maps, Combinational & Sequential Circuits, Counters & Number Systems',
    totalQuestions: 313,
    chapters: [
      { id: 'ch-dig-bool', title: 'Boolean Algebra & Logic Gate Minimization', questionCount: 58, keyConcepts: ['De Morgan Laws', 'Dual & Complement of Functions', 'Universal Gates (NAND/NOR Implementation)', 'SOP and POS Canonical Forms'] },
      { id: 'ch-dig-kmap', title: 'Karnaugh Maps (K-Maps) & Implicants', questionCount: 48, keyConcepts: ['Prime Implicants (PI)', 'Essential Prime Implicants (EPI)', 'Don t Care Conditions', 'Static & Dynamic Hazards'] },
      { id: 'ch-dig-comb', title: 'Combinational Circuits: Adders, MUX & Decoders', questionCount: 82, keyConcepts: ['Half & Full Adder / Subtractor', 'Lookahead Carry Adder Delay', 'Multiplexers (MUX) as Universal Function Generators', 'Priority Encoders & Decoders'] },
      { id: 'ch-dig-seq', title: 'Sequential Circuits: Flip-Flops & Registers', questionCount: 65, keyConcepts: ['SR, JK, D, T Flip-Flop Characteristic Equations', 'Master-Slave JK Flip-Flop & Race-Around Condition', 'Setup Time & Hold Time Constraints', 'Shift Registers & Johnson Counter'] },
      { id: 'ch-dig-counter', title: 'Synchronous & Asynchronous Counters', questionCount: 40, keyConcepts: ['Mod-N Counter Design', 'Ripple Counter Propagation Delay', 'Ring Counter vs Johnson Counter Sequence', 'State Reduction & Implication Table'] },
      { id: 'ch-dig-num', title: 'Number Systems & Fixed-Point Representation', questionCount: 20, keyConcepts: ['1 s & 2 s Complement Arithmetic', 'Range of Signed & Unsigned Numbers', 'Base Conversions (Binary, Octal, Hex)', 'Signed Overflow Rules'] },
    ],
  },
];

export const GATE_40_YEARS_PYQS: PYQuestion[] = [
  // ==========================================
  // VOLUME 1: MATHEMATICS & APTITUDE
  // ==========================================
  {
    id: 'vol1-dm-2024-q1',
    volume: 1,
    category: 'Discrete Mathematics',
    chapter: 'Combinatorics & Generating Functions',
    subject: 'Discrete Mathematics',
    topic: 'Combinatorics & Generating Functions',
    subtopic: 'Generating Functions & Recurrences',
    year: 2024,
    examTag: 'GATE CSE 2024 (Set-1)',
    marks: 2,
    type: 'MCQ',
    questionText: `Let $a_n$ be the number of binary strings of length $n$ that do not contain two consecutive 0s. Which of the following recurrence relations and generating function $G(x) = \sum_{n=0}^{\infty} a_n x^n$ correctly describes $a_n$ with initial conditions $a_0 = 1, a_1 = 2$?`,
    options: [
      { key: 'A', text: '$a_n = a_{n-1} + a_{n-2}$ for $n \ge 2$ with $G(x) = \frac{1 + x}{1 - x - x^2}$' },
      { key: 'B', text: '$a_n = 2a_{n-1} - a_{n-2}$ for $n \ge 2$ with $G(x) = \frac{1}{1 - 2x}$' },
      { key: 'C', text: '$a_n = a_{n-1} + 2a_{n-2}$ for $n \ge 2$ with $G(x) = \frac{1 + 2x}{1 - x - 2x^2}$' },
      { key: 'D', text: '$a_n = a_{n-1} + a_{n-2}$ for $n \ge 2$ with $G(x) = \frac{1}{1 - x - x^2}$' },
    ],
    correctAnswer: 'A',
    explanation: `1. Case 1: If the string ends with '1', the remaining $(n-1)$ prefix has $a_{n-1}$ valid choices.
2. Case 2: If the string ends with '0', the previous character must be '1' (cannot have '00'), so the remaining $(n-2)$ prefix has $a_{n-2}$ valid choices.
Thus, $a_n = a_{n-1} + a_{n-2}$ for $n \ge 2$.
Base cases: $a_0 = 1$ (empty string), $a_1 = 2$ ('0', '1'), $a_2 = 3$ ('01', '10', '11').
Generating function derivation:
$\sum_{n=2}^{\infty} a_n x^n = \sum_{n=2}^{\infty} a_{n-1} x^n + \sum_{n=2}^{\infty} a_{n-2} x^n$
$G(x) - a_0 - a_1 x = x(G(x) - a_0) + x^2 G(x)$
$G(x) - 1 - 2x = x(G(x) - 1) + x^2 G(x)$
$G(x)(1 - x - x^2) = 1 + 2x - x = 1 + x \implies G(x) = \frac{1 + x}{1 - x - x^2}$.`,
    conceptTested: 'Binary String Recurrence & Generating Function Derivation',
    difficulty: 'Medium',
    referenceUrl: 'https://gateoverflow.in',
    relatedChapterKeywords: ['Combinatorics', 'Generating Functions', 'Recurrence Relations', 'Fibonacci', 'Binary Strings'],
  },
  {
    id: 'vol1-dm-2023-q2',
    volume: 1,
    category: 'Discrete Mathematics',
    chapter: 'Graph Theory, Matching & Planarity',
    subject: 'Discrete Mathematics',
    topic: 'Graph Theory, Matching & Planarity',
    subtopic: 'Euler Planar Formula & Graph Coloring',
    year: 2023,
    examTag: 'GATE CSE 2023',
    marks: 2,
    type: 'MCQ',
    questionText: `Let $G$ be a connected planar simple graph with $V \ge 3$ vertices and $E$ edges. If every face in $G$ is bounded by a cycle of length at least 4 (i.e. triangle-free), which of the following inequalities is always TRUE?`,
    options: [
      { key: 'A', text: '$E \le 2V - 4$' },
      { key: 'B', text: '$E \le 3V - 6$' },
      { key: 'C', text: '$E \le \frac{3}{2}V - 3$' },
      { key: 'D', text: '$E \ge 2V - 4$' },
    ],
    correctAnswer: 'A',
    explanation: `For any planar graph with $F$ faces:
1. By Handshaking theorem on faces: $\sum_{f} \text{deg}(f) = 2E$.
2. Since every face has length $\ge 4$, $2E = \sum \text{deg}(f) \ge 4F \implies F \le \frac{E}{2}$.
3. By Euler's formula for connected planar graphs: $V - E + F = 2$.
$V - E + \frac{E}{2} \ge 2 \implies V - \frac{E}{2} \ge 2 \implies \frac{E}{2} \le V - 2 \implies E \le 2V - 4$.`,
    conceptTested: 'Euler Planar Graph Face-Edge Inequality',
    difficulty: 'Medium',
    referenceUrl: 'https://gateoverflow.in',
    relatedChapterKeywords: ['Planar Graph', 'Euler Formula', 'Faces', 'Graph Theory', 'Handshaking'],
  },
  {
    id: 'vol1-em-2024-q3',
    volume: 1,
    category: 'Engineering Mathematics',
    chapter: 'Linear Algebra (Matrices, Eigenvalues & Rank)',
    subject: 'Engineering Mathematics',
    topic: 'Linear Algebra (Matrices, Eigenvalues & Rank)',
    subtopic: 'Cayley-Hamilton & Characteristic Equation',
    year: 2024,
    examTag: 'GATE CSE 2024 (Set-2)',
    marks: 2,
    type: 'MCQ',
    questionText: `Consider the matrix $A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$. Using the Cayley-Hamilton theorem, which of the following expressions is equal to $A^4$?`,
    options: [
      { key: 'A', text: '$40A - 39I$' },
      { key: 'B', text: '$56A - 45I$' },
      { key: 'C', text: '$32A - 31I$' },
      { key: 'D', text: '$20A - 19I$' },
    ],
    correctAnswer: 'A',
    explanation: `1. Characteristic equation of $A$: $\det(A - \lambda I) = (2-\lambda)^2 - 1 = \lambda^2 - 4\lambda + 3 = 0$.
2. Eigenvalues are $\lambda_1 = 1, \lambda_2 = 3$.
3. By Cayley-Hamilton theorem: $A^2 - 4A + 3I = 0 \implies A^2 = 4A - 3I$.
4. Multiply by $A$: $A^3 = 4A^2 - 3A = 4(4A - 3I) - 3A = 13A - 12I$.
5. Multiply by $A$ again: $A^4 = 13A^2 - 12A = 13(4A - 3I) - 12A = (52 - 12)A - 39I = 40A - 39I$.`,
    conceptTested: 'Cayley-Hamilton Theorem & Matrix Powers',
    difficulty: 'Medium',
    referenceUrl: 'https://gateoverflow.in',
    relatedChapterKeywords: ['Linear Algebra', 'Cayley Hamilton', 'Eigenvalues', 'Matrix Powers'],
  },
  {
    id: 'vol1-ga-2025-q4',
    volume: 1,
    category: 'General Aptitude',
    chapter: 'Quantitative Aptitude',
    subject: 'General Aptitude',
    topic: 'Quantitative Aptitude',
    subtopic: 'Work, Time and Pipes',
    year: 2025,
    examTag: 'GATE CSE 2025',
    marks: 1,
    type: 'MCQ',
    questionText: `Pipe A can fill a tank in 6 hours, while Pipe B can fill it in 8 hours. Pipe C can empty the full tank in 12 hours. If all three pipes are opened simultaneously when the tank is empty, how many hours will it take to fill the tank completely?`,
    options: [
      { key: 'A', text: '4.8 hours' },
      { key: 'B', text: '5.2 hours' },
      { key: 'C', text: '4.0 hours' },
      { key: 'D', text: '6.0 hours' },
    ],
    correctAnswer: 'A',
    explanation: `1. Rate of Pipe A = $\frac{1}{6}$ tank/hour.
2. Rate of Pipe B = $\frac{1}{8}$ tank/hour.
3. Rate of Pipe C = $-\frac{1}{12}$ tank/hour.
4. Combined Net Rate = $\frac{1}{6} + \frac{1}{8} - \frac{1}{12} = \frac{4 + 3 - 2}{24} = \frac{5}{24}$ tank/hour.
5. Total Time = $\frac{1}{5/24} = \frac{24}{5} = 4.8$ hours.`,
    conceptTested: 'Time and Work Unit Fraction Method',
    difficulty: 'Easy',
    referenceUrl: 'https://gateoverflow.in',
    relatedChapterKeywords: ['Quantitative Aptitude', 'Pipes and Cisterns', 'Time and Work'],
  },

  // ==========================================
  // VOLUME 2: CORE COMPUTER SCIENCE
  // ==========================================
  {
    id: 'vol2-algo-2024-q5',
    volume: 2,
    category: 'Algorithms',
    chapter: 'Asymptotic Analysis & Recurrence Relations',
    subject: 'Algorithms',
    topic: 'Asymptotic Analysis & Recurrence Relations',
    subtopic: 'Master Theorem Extended Case',
    year: 2024,
    examTag: 'GATE CSE 2024',
    marks: 2,
    type: 'MCQ',
    questionText: `Consider the recurrence relation $T(n) = 4T(n/2) + n^2 \log n$ with $T(1) = \Theta(1)$. What is the asymptotic time complexity of $T(n)$?`,
    options: [
      { key: 'A', text: '$\Theta(n^2 \log^2 n)$' },
      { key: 'B', text: '$\Theta(n^2 \log n)$' },
      { key: 'C', text: '$\Theta(n^2 \log(\log n))$' },
      { key: 'D', text: '$\Theta(n^{\log_2 4})$' },
    ],
    correctAnswer: 'A',
    explanation: `1. In $T(n) = aT(n/b) + f(n)$: $a = 4, b = 2$.
2. Critical exponent $n^{\log_b a} = n^{\log_2 4} = n^2$.
3. Driving function $f(n) = n^2 \log^1 n = n^{\log_b a} \log^k n$ where $k = 1$.
4. By Master Theorem (Extended Case 2 for $k \ge 0$):
$T(n) = \Theta(n^{\log_b a} \log^{k+1} n) = \Theta(n^2 \log^2 n)$.`,
    conceptTested: 'Extended Master Theorem for Polylogarithmic Driving Functions',
    difficulty: 'Medium',
    referenceUrl: 'https://gateoverflow.in',
    relatedChapterKeywords: ['Master Theorem', 'Recurrence', 'Algorithms', 'Asymptotic Complexity'],
  },
  {
    id: 'vol2-pds-2023-q6',
    volume: 2,
    category: 'Programming and Data Structures',
    chapter: 'C Programming, Pointers & Recursion',
    subject: 'Programming and Data Structures',
    topic: 'C Programming, Pointers & Recursion',
    subtopic: 'Pointer Arithmetic & Array Offsets',
    year: 2023,
    examTag: 'GATE CSE 2023',
    marks: 2,
    type: 'MCQ',
    questionText: `What is the output printed by the following standard C program?`,
    codeSnippet: `#include <stdio.h>
int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int *p = arr;
    int *q = arr + 3;
    printf("%d %d\n", *(p + 2), (int)(q - p));
    return 0;
}`,
    options: [
      { key: 'A', text: '30 3' },
      { key: 'B', text: '30 12' },
      { key: 'C', text: '20 3' },
      { key: 'D', text: '40 3' },
    ],
    correctAnswer: 'A',
    explanation: `1. $p$ points to $arr[0]$ (address with value 10).
2. $p + 2$ points to $arr[2]$, so $*(p + 2) = 30$.
3. $q = arr + 3$ points to $arr[3]$.
4. In C, subtracting two pointers $(q - p)$ of type int* returns the number of elements between them (i.e. $(3 - 0) = 3$), NOT byte distance.
Hence, the output is "30 3".`,
    conceptTested: 'C Pointer Subtraction & Index Dereferencing',
    difficulty: 'Easy',
    referenceUrl: 'https://gateoverflow.in',
    relatedChapterKeywords: ['C Programming', 'Pointers', 'Arrays', 'Pointer Arithmetic'],
  },
  {
    id: 'vol2-toc-2024-q7',
    volume: 2,
    category: 'Theory of Computation',
    chapter: 'Finite Automata & Regular Languages',
    subject: 'Theory of Computation',
    topic: 'Finite Automata & Regular Languages',
    subtopic: 'DFA State Minimization',
    year: 2024,
    examTag: 'GATE CSE 2024',
    marks: 2,
    type: 'MCQ',
    questionText: `What is the minimum number of states in a Minimal DFA that accepts the language $L = \{ w \in \{a, b\}^* \mid w \text{ contains the substring } \text{"aba"} \}$?`,
    options: [
      { key: 'A', text: '4 states' },
      { key: 'B', text: '3 states' },
      { key: 'C', text: '5 states' },
      { key: 'D', text: '6 states' },
    ],
    correctAnswer: 'A',
    explanation: `1. States represent the longest prefix of "aba" seen so far:
   - $q_0$ (Start): $\epsilon$ (no match). On 'a' $\to q_1$, on 'b' $\to q_0$.
   - $q_1$: 'a' matched. On 'b' $\to q_2$, on 'a' $\to q_1$.
   - $q_2$: 'ab' matched. On 'a' $\to q_3$ (Accepting state!), on 'b' $\to q_0$.
   - $q_3$ (Accepting): 'aba' matched (Trap/absorbing state). On 'a', 'b' $\to q_3$.
2. All 4 states are pairwise distinguishable by Myhill-Nerode relations.
Minimum number of states = 4.`,
    conceptTested: 'DFA Construction for Substring Matching Pattern',
    difficulty: 'Easy',
    referenceUrl: 'https://gateoverflow.in',
    relatedChapterKeywords: ['DFA', 'Theory of Computation', 'Regular Languages', 'Automata'],
  },
  {
    id: 'vol2-cd-2023-q8',
    volume: 2,
    category: 'Compiler Design',
    chapter: 'Syntax Directed Translation (SDT)',
    subject: 'Compiler Design',
    topic: 'Syntax Directed Translation (SDT)',
    subtopic: 'S-Attributed vs L-Attributed SDT',
    year: 2023,
    examTag: 'GATE CSE 2023',
    marks: 2,
    type: 'MCQ',
    questionText: `Which of the following statements is strictly TRUE regarding Syntax Directed Translations (SDTs)?`,
    options: [
      { key: 'A', text: 'Every S-attributed SDT is also an L-attributed SDT.' },
      { key: 'B', text: 'Every L-attributed SDT can be evaluated during bottom-up LR parsing without any grammar modifications.' },
      { key: 'C', text: 'L-attributed definitions allow attributes to depend on right siblings.' },
      { key: 'D', text: 'S-attributed definitions only allow inherited attributes.' },
    ],
    correctAnswer: 'A',
    explanation: `1. In an S-attributed SDT, every semantic action uses ONLY synthesized attributes.
2. In an L-attributed SDT, attributes can be synthesized or inherited, where inherited attributes of $X_j$ only depend on inherited attributes of the LHS or attributes of symbols to its left ($X_1, \dots, X_{j-1}$).
3. Since having only synthesized attributes trivially satisfies the L-attributed definition, EVERY S-attributed SDT is a subset of L-attributed SDTs (Statement A is TRUE).`,
    conceptTested: 'SDT Classifications & Attribute Evaluation Orders',
    difficulty: 'Medium',
    referenceUrl: 'https://gateoverflow.in',
    relatedChapterKeywords: ['Compiler Design', 'SDT', 'S-Attributed', 'L-Attributed', 'Parsing'],
  },

  // ==========================================
  // VOLUME 3: COMPUTER SYSTEMS
  // ==========================================
  {
    id: 'vol3-os-2024-q9',
    volume: 3,
    category: 'Operating Systems',
    chapter: 'Memory Management, Paging & Virtual Memory',
    subject: 'Operating Systems',
    topic: 'Memory Management, Paging & Virtual Memory',
    subtopic: 'Belady Anomaly & Page Replacement',
    year: 2024,
    examTag: 'GATE CSE 2024',
    marks: 2,
    type: 'MCQ',
    questionText: `Which of the following page replacement algorithms CANNOT suffer from Belady's Anomaly under any reference string?`,
    options: [
      { key: 'A', text: 'LRU and Optimal' },
      { key: 'B', text: 'FIFO and Second Chance' },
      { key: 'C', text: 'FIFO only' },
      { key: 'D', text: 'FIFO and Random Replacement' },
    ],
    correctAnswer: 'A',
    explanation: `1. Belady's Anomaly states that increasing the number of page frames can increase the number of page faults.
2. Stack-based algorithms (where the set of pages in a frame of size $N$ is always a subset of pages in a frame of size $N+1$) are mathematically PROVEN NEVER to suffer from Belady's Anomaly.
3. LRU (Least Recently Used), LFU, and OPT (Optimal) are stack algorithms and NEVER suffer from Belady's anomaly. FIFO is not a stack algorithm and does suffer from it.`,
    conceptTested: 'Belady Anomaly & Stack Algorithm Properties',
    difficulty: 'Easy',
    referenceUrl: 'https://gateoverflow.in',
    relatedChapterKeywords: ['Operating Systems', 'Virtual Memory', 'Page Replacement', 'Belady Anomaly', 'LRU'],
  },
  {
    id: 'vol3-coa-2024-q10',
    volume: 3,
    category: 'Computer Organization and Architecture',
    chapter: 'Memory Hierarchy & Cache Mapping',
    subject: 'Computer Organization and Architecture',
    topic: 'Memory Hierarchy & Cache Mapping',
    subtopic: 'Set Associative Cache Tag Computation',
    year: 2024,
    examTag: 'GATE CSE 2024',
    marks: 2,
    type: 'MCQ',
    questionText: `Consider a 4-way set-associative cache memory with 64 KB total cache capacity and block size of 64 bytes. If the physical address is 32 bits, what is the size of the TAG field in bits?`,
    options: [
      { key: 'A', text: '18 bits' },
      { key: 'B', text: '16 bits' },
      { key: 'C', text: '20 bits' },
      { key: 'D', text: '14 bits' },
    ],
    correctAnswer: 'A',
    explanation: `1. Word Offset: $\log_2(64) = 6$ bits.
2. Total Lines: $64\text{ KB} / 64\text{ B} = 1024$ lines.
3. Number of Sets: $1024 / 4 = 256 = 2^8 \implies$ Set Index = 8 bits.
4. Physical Address = Tag + Set Index + Word Offset
Tag = $32 - (8 + 6) = 32 - 14 = 18$ bits.`,
    conceptTested: 'Set Associative Cache Address Partitioning',
    difficulty: 'Medium',
    referenceUrl: 'https://gateoverflow.in',
    relatedChapterKeywords: ['COA', 'Cache Memory', 'Set Associative', 'Tag Bits', 'Memory Hierarchy'],
  },
  {
    id: 'vol3-dbms-2023-q11',
    volume: 3,
    category: 'Databases',
    chapter: 'Functional Dependencies & Normalization (1NF to BCNF)',
    subject: 'Databases',
    topic: 'Functional Dependencies & Normalization (1NF to BCNF)',
    subtopic: 'Highest Normal Form Identification',
    year: 2023,
    examTag: 'GATE CSE 2023',
    marks: 2,
    type: 'MCQ',
    questionText: `Given relation $R(A, B, C, D, E)$ with functional dependencies $F = \{ AB \to C, C \to D, D \to E \}$. What is the highest normal form satisfied by $R$?`,
    options: [
      { key: 'A', text: '2NF' },
      { key: 'B', text: '1NF' },
      { key: 'C', text: '3NF' },
      { key: 'D', text: 'BCNF' },
    ],
    correctAnswer: 'A',
    explanation: `1. Candidate Key: $(AB)^+ = \{A, B, C, D, E\}$. Prime attributes = $\{A, B\}$, Non-prime = $\{C, D, E\}$.
2. 2NF Check: No non-prime attribute is dependent on a proper subset of candidate key (neither $A \to \dots$ nor $B \to \dots$ exists). So $R$ is in 2NF.
3. 3NF Check: In $C \to D$, $C$ is NOT a superkey and $D$ is NOT a prime attribute (transitive dependency). Thus $R$ violates 3NF.
Highest normal form = 2NF.`,
    conceptTested: 'Functional Dependency Transitivity & 2NF/3NF Testing',
    difficulty: 'Medium',
    referenceUrl: 'https://gateoverflow.in',
    relatedChapterKeywords: ['DBMS', 'Normalization', 'Functional Dependencies', '2NF', '3NF', 'Candidate Keys'],
  },
  {
    id: 'vol3-cn-2024-q12',
    volume: 3,
    category: 'Computer Networks',
    chapter: 'Data Link Layer & Flow Control',
    subject: 'Computer Networks',
    topic: 'Data Link Layer & Flow Control',
    subtopic: 'Go-Back-N Protocol Window Size',
    year: 2024,
    examTag: 'GATE CSE 2024',
    marks: 2,
    type: 'MCQ',
    questionText: `In a Go-Back-N ARQ protocol, if $k$ bits are used in the frame header for sequence numbers, what is the maximum sender window size ($W_s$) and receiver window size ($W_r$)?`,
    options: [
      { key: 'A', text: '$W_s = 2^k - 1, W_r = 1$' },
      { key: 'B', text: '$W_s = 2^k, W_r = 1$' },
      { key: 'C', text: '$W_s = 2^{k-1}, W_r = 2^{k-1}$' },
      { key: 'D', text: '$W_s = 2^k - 1, W_r = 2^k - 1$' },
    ],
    correctAnswer: 'A',
    explanation: `1. In Go-Back-N ARQ: $W_s + W_r \le 2^k$.
2. The receiver in Go-Back-N accepts only in-order packets, so $W_r = 1$.
3. Thus, Maximum Sender Window $W_s = 2^k - 1$.
(If $W_s = 2^k$, acknowledgment loss would cause the receiver to confuse new packets with retransmitted old packets).`,
    conceptTested: 'Go-Back-N ARQ Sequence Number Space & Window Constraints',
    difficulty: 'Easy',
    referenceUrl: 'https://gateoverflow.in',
    relatedChapterKeywords: ['Computer Networks', 'Go-Back-N', 'Flow Control', 'Sliding Window', 'Sequence Numbers'],
  },
  {
    id: 'vol3-dig-2024-q13',
    volume: 3,
    category: 'Digital Logic',
    chapter: 'Combinational Circuits: Adders, MUX & Decoders',
    subject: 'Digital Logic',
    topic: 'Combinational Circuits: Adders, MUX & Decoders',
    subtopic: 'Multiplexer Function Implementation',
    year: 2024,
    examTag: 'GATE CSE 2024',
    marks: 1,
    type: 'MCQ',
    questionText: `A $4:1$ multiplexer with select inputs $S_1, S_0$ implementing boolean function $F(A, B, C) = \sum m(1, 2, 4, 7)$ has select lines connected as $S_1 = A, S_0 = B$. What are the inputs $I_0, I_1, I_2, I_3$ respectively?`,
    options: [
      { key: 'A', text: '$C, \bar{C}, \bar{C}, C$' },
      { key: 'B', text: '$\bar{C}, C, C, \bar{C}$' },
      { key: 'C', text: '$0, 1, 1, 0$' },
      { key: 'D', text: '$C, C, \bar{C}, \bar{C}$' },
    ],
    correctAnswer: 'A',
    explanation: `Construct Truth Table for $F(A, B, C)$:
- $AB = 00$ ($I_0$): $m(0)=0, m(1)=1 \implies I_0 = C$.
- $AB = 01$ ($I_1$): $m(2)=1, m(3)=0 \implies I_1 = \bar{C}$.
- $AB = 10$ ($I_2$): $m(4)=1, m(5)=0 \implies I_2 = \bar{C}$.
- $AB = 11$ ($I_3$): $m(6)=0, m(7)=1 \implies I_3 = C$.
Inputs = $(C, \bar{C}, \bar{C}, C)$.`,
    conceptTested: 'Multiplexer Implementation of 3-Variable Boolean Function',
    difficulty: 'Easy',
    referenceUrl: 'https://gateoverflow.in',
    relatedChapterKeywords: ['Digital Logic', 'Multiplexer', 'Combinational Circuits', 'Boolean Function'],
  }
];
