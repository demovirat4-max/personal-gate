/**
 * Curated high-yield fallbacks for GATE CSE study tools
 * Ensures 100% uptime and resilience when Gemini API is rate-limited, key suspended, or offline.
 */

export interface FallbackQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  marks: number;
  explanation: string;
  tip?: string;
}

export function getFallbackSummary(topic: string, subject: string): string {
  const safeTopic = topic || 'Core Subject Topic';
  const safeSubject = subject || 'GATE CSE';

  return `### 📌 Core Concept Overview: ${safeTopic}
In **${safeSubject}**, **${safeTopic}** is a fundamental high-frequency topic in the GATE syllabus. Mastery of this concept requires understanding both the mathematical underpinnings and edge-case boundary conditions tested in previous year 1-mark and 2-mark questions.

### 📐 Key Formulas, Invariants & Properties
* **Fundamental Relation:** Verify conservation laws, recurrence bounds, and state transition equations specific to ${safeTopic}.
* **Structural Invariant:** Check constraints on inputs, non-negativity conditions, base cases (e.g., $n=0, 1$), and termination guarantees.
* **Algebraic Representation:** Ensure all indices and powers match strict discrete mathematics definitions.

### ⏱️ Time & Space Complexity / Parameter Bounds
* **Best-Case Time:** $O(1)$ or $O(\\log n)$ depending on indexing and optimal balance.
* **Average-Case Time:** Typically $O(n)$ or $O(n \\log n)$ for divide-and-conquer formulations.
* **Worst-Case Time:** $O(n^2)$ or $O(2^n)$ when degenerate partitions or unrestricted branching occur.
* **Auxiliary Space:** $O(1)$ in-place or $O(n)$ when recursion call-stack depth is unbounded.

### ⚠️ Common GATE Traps & PYQ Pitfalls
1. **Off-by-one boundary errors:** Always verify array index bounds ($0$ to $n-1$ vs $1$ to $n$) and tree height definitions (edges vs vertices).
2. **Strict vs Non-Strict inequalities:** Note whether definitions include equality ($\le$ vs $<$) for upper and lower bounds.
3. **Ambiguity in definitions:** Check whether graph is connected/directed or simple before applying closed-form formulas.`;
}

export function getFallbackFeynman(topic: string, subject: string) {
  const safeTopic = topic || 'Core Concept';
  const safeSubject = subject || 'GATE CSE';

  return {
    analogy: `Think of ${safeTopic} in ${safeSubject} like a highway toll system or an automated sorting conveyor. Instead of inspecting every item from scratch, the system establishes a standardized checkpoint with fixed rules. If an element meets the invariant, it passes through the fast lane; otherwise, it is systematically routed through a fallback buffer to maintain optimal flow.`,
    technicalMechanics: `In formal GATE CSE terms, ${safeTopic} operates on state transitions and invariant constraints. 
1. State Space: Defined over discrete states $S$ with initial condition $S_0$ and valid transitions $\\delta(s, a)$.
2. Boundary Properties: Preservation of loop invariants and conservation equations across iterations.
3. Asymptotic Bounds: Controlled by recurrence relations $T(n) = aT(n/b) + f(n)$ or inductive base step verification.`,
    gateTrapsAndEdgeCases: [
      `Handling empty sets, null references, or graphs with $0$ edges / $1$ vertex.`,
      `Applying theorems outside their domain (e.g., non-polynomial differences in Master's Theorem).`,
      `Confusing worst-case time complexity with amortized cost or average-case bounds.`,
    ],
    highYieldTips: [
      `Always draw a small 3-node or 4-element counterexample to test formula choices in MCQs.`,
      `Remember that GATE questions often test whether you checked disconnected graph cases or cycle possibilities.`,
    ],
  };
}

export function getFallbackFormulaSheet(topic: string, subject: string) {
  const safeTopic = topic || 'Core Topic';
  const safeSubject = subject || 'GATE CSE';

  return {
    formulas: [
      {
        title: `${safeTopic} Primary Recurrence / Relation`,
        equation: `T(n) = a \\cdot T(n/b) + \\Theta(n^k \\log^p n)`,
        context: `Standard Master's theorem formulation for divide-and-conquer analysis in ${safeSubject}.`,
      },
      {
        title: `Sum of Series & Combinatorial Bound`,
        equation: `\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2} = \\Theta(n^2), \\quad \\sum_{i=0}^{k} r^i = \\frac{r^{k+1}-1}{r-1}`,
        context: `Frequently used for calculating loop iterations and recursive tree heights.`,
      },
      {
        title: `Logarithmic Invariant & Base Conversion`,
        equation: `\\log_b a = \\frac{\\log_c a}{\\log_c b}, \\quad a^{\\log_b c} = c^{\\log_b a}`,
        context: `Essential for simplifying exponent terms in complexity calculations.`,
      },
    ],
    complexities: [
      {
        operation: `${safeTopic} (Lookup / Search)`,
        best: 'O(1)',
        average: 'O(log n)',
        worst: 'O(n)',
        space: 'O(1)',
      },
      {
        operation: `${safeTopic} (Insertion / Update)`,
        best: 'O(1)',
        average: 'O(log n)',
        worst: 'O(n)',
        space: 'O(1)',
      },
      {
        operation: `${safeTopic} (Full Traversal / Build)`,
        best: 'O(n)',
        average: 'O(n log n)',
        worst: 'O(n^2)',
        space: 'O(n)',
      },
    ],
    keyTheorems: [
      `Master Theorem for Divide & Conquer: Compares $f(n)$ with $n^{\\log_b a}$ across the three standard cases.`,
      `Pigeonhole Principle: If $n$ items are put into $m$ containers with $n > m$, at least one container has $\\lceil n/m \\rceil$ items.`,
      `Handshaking Lemma (Graph Theory): $\\sum_{v \\in V} \\text{deg}(v) = 2|E|$, implying total sum of degrees is always even.`,
    ],
  };
}

export function getFallbackQuiz(topic: string, subject: string, count = 10): FallbackQuizQuestion[] {
  const safeTopic = topic || 'Core Subject';
  const safeSubject = subject || 'GATE CSE';

  const defaultPool: FallbackQuizQuestion[] = [
    {
      id: 'Q1',
      question: `Consider "${safeTopic}" in ${safeSubject}. Which of the following statements is mathematically CORRECT regarding its fundamental invariants or properties?`,
      options: [
        `A) The worst-case time complexity is strictly bounded by O(log n) for all inputs without exception.`,
        `B) An invariant condition must hold true before and after each iteration/transition to ensure algorithmic correctness.`,
        `C) The auxiliary space requirement increases exponentially with linear increase in input size.`,
        `D) Disconnected components or boundary inputs (like n=0) always yield undefined behavior.`,
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: `Statement B is correct. In algorithmic and state machine correctness proofs, a loop/state invariant is a property that holds before and after each iteration, which combined with termination proves correctness.`,
      tip: `Always look for fundamental invariant properties when verifying algorithm correctness in GATE.`,
    },
    {
      id: 'Q2',
      question: `In a standard GATE 2-mark question on "${safeTopic}", suppose we have a recurrence relation $T(n) = 2T(n/2) + n \\log n$ with $T(1) = 1$. What is the asymptotic time complexity of $T(n)$?`,
      options: [
        `A) \\Theta(n \\log n)`,
        `B) \\Theta(n \\log^2 n)`,
        `C) \\Theta(n^2)`,
        `D) \\Theta(n)`,
      ],
      correctAnswer: 'B',
      marks: 2,
      explanation: `Here $a = 2, b = 2$, so $n^{\\log_b a} = n^{\\log_2 2} = n^1$. The driving function is $f(n) = n \\log n = n^1 \\log^1 n$. By Extended Master Theorem (Case 2 where $k=1$), $T(n) = \\Theta(n^{\\log_b a} \\log^{k+1} n) = \\Theta(n \\log^2 n)$.`,
      tip: `Extended Master's theorem handles $f(n) = n^{\\log_b a} \\log^k n$ by multiplying an extra $\\log n$ factor.`,
    },
    {
      id: 'Q3',
      question: `Which of the following edge cases or boundary conditions is the most common source of negative marks in GATE CSE questions involving "${safeTopic}"?`,
      options: [
        `A) Forgetting to account for cycle presence, empty base cases, or disconnected sub-graphs.`,
        `B) Assuming all graphs are strictly complete graphs.`,
        `C) Evaluating logarithms with base 10 instead of base 2.`,
        `D) Ignoring 1-mark questions entirely.`,
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: `In GATE CSE, questions frequently hide edge cases like disconnected graphs (number of components $> 1$), trees with height 0 or 1, or self-loops, which invalidate formulas that assume connected simple graphs.`,
      tip: `Always test trivial cases ($n=1$, disconnected vertices, empty inputs) on candidate MCQ options.`,
    },
    {
      id: 'Q4',
      question: `In the context of "${safeTopic}" in ${safeSubject}, if a system configuration has $N$ resource units and $K$ concurrent processes where each process requests at most $M$ units, what is the exact condition to guarantee deadlock-free execution?`,
      options: [
        `A) $N \\ge K(M - 1) + 1$`,
        `B) $N \\le K \\cdot M$`,
        `C) $N = K + M$`,
        `D) $M \\ge N / K$`,
      ],
      correctAnswer: 'A',
      marks: 2,
      explanation: `By Generalized Deadlock Prevention condition: Worst-case allocation occurs when each of the $K$ processes holds $(M - 1)$ units and requests 1 more. Total allocated = $K(M - 1)$. If total resources $N \\ge K(M - 1) + 1$, at least one process gets all its required resources and completes, guaranteeing deadlock-free operation.`,
      tip: `Remember the worst-case condition $N \\ge \\sum (\\text{Max}_i - 1) + 1$.`,
    },
    {
      id: 'Q5',
      question: `Consider a 4-way set-associative cache design related to "${safeTopic}". If the main memory address is 32 bits, cache size is 64 KB, and cache line (block) size is 64 bytes, what is the number of bits in the TAG field?`,
      options: [
        `A) 18 bits`,
        `B) 16 bits`,
        `C) 20 bits`,
        `D) 14 bits`,
      ],
      correctAnswer: 'A',
      marks: 2,
      explanation: `1. Block offset = $\\log_2(64) = 6$ bits.\n2. Total lines = $64\\text{ KB} / 64\\text{ B} = 1024$ lines.\n3. Number of sets = $1024 / 4 = 256 = 2^8$ => Set index = 8 bits.\n4. Tag bits = $32 - (8 + 6) = 32 - 14 = 18$ bits.`,
      tip: `Physical Address = Tag + Set Index + Word Offset.`,
    },
    {
      id: 'Q6',
      question: `For any formal grammar or state machine model in "${safeTopic}", which of the following properties is strictly UNDECIDABLE?`,
      options: [
        `A) Checking whether a given Turing Machine halts on a blank tape (Blank Tape Halting Problem).`,
        `B) Checking if a given Deterministic Finite Automaton accepts an empty language.`,
        `C) Membership testing of a string $w$ in a Context-Free Language via CYK algorithm.`,
        `D) Finding the shortest path in a weighted DAG with non-negative edge weights.`,
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: `By Turing's Halting Theorem and Rice's Theorem: Any non-trivial semantic property of Turing Machines (including halting on a blank tape or any arbitrary input) is strictly UNDECIDABLE. Emptiness for DFA and membership for CFL are decidable.`,
      tip: `Halting problems and general equivalence of Turing machines are always undecidable in GATE.`,
    },
    {
      id: 'Q7',
      question: `In "${safeTopic}", what is the time complexity to find the Minimum Spanning Tree (MST) of a connected undirected graph $G = (V, E)$ using Kruskal's algorithm with Disjoint Set Union (DSU) and path compression?`,
      options: [
        `A) $O(|E| \\log |V|)$`,
        `B) $O(|V|^2)$`,
        `C) $O(|V| \\log |E|)$`,
        `D) $O(|E| \\cdot |V|)$`,
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: `Sorting the edges takes $O(|E| \\log |E|) = O(|E| \\log |V|^2) = O(|E| \\log |V|)$. Disjoint-set Find/Union operations with path compression take $O(|E| \\cdot \\alpha(|V|))$, where $\\alpha$ is the nearly constant inverse Ackermann function. Thus, the total time is dominated by edge sorting: $O(|E| \\log |V|)$.`,
      tip: `Kruskal's is $O(E \\log V)$ for sparse graphs; Prim's with Fibonacci heap is $O(E + V \\log V)$.`,
    },
    {
      id: 'Q8',
      question: `Consider a relation $R(A, B, C, D, E)$ with functional dependencies in "${safeTopic}": $F = \\{ A \\to B, B \\to C, C \\to D, D \\to E \\}$. What is the highest normal form satisfied by $R$?`,
      options: [
        `A) 1NF`,
        `B) 2NF`,
        `C) 3NF`,
        `D) BCNF`,
      ],
      correctAnswer: 'B',
      marks: 2,
      explanation: `Candidate key is $A$ since $A^+ = \\{A,B,C,D,E\\}$.\nAll non-prime attributes $\\{B,C,D,E\\}$ are fully functionally dependent on the candidate key $A$ (no partial dependency), so $R$ is in 2NF.\nHowever, in $B \\to C$, $B$ is neither a superkey nor is $C$ a prime attribute (transitive dependency exists). Hence $R$ violates 3NF. Highest normal form is 2NF.`,
      tip: `3NF requires for $X \\to Y$: either $X$ is superkey or $Y$ is prime attribute.`,
    },
    {
      id: 'Q9',
      question: `In "${safeTopic}", a token bucket traffic shaper has a bucket capacity of $10\\text{ MB}$ and token arrival rate of $2\\text{ MB/s}$. The maximum transmission burst rate of the network is $10\\text{ MB/s}$. What is the maximum burst duration (in seconds)?`,
      options: [
        `A) $1.25\\text{ seconds}$`,
        `B) $1.0\\text{ second}$`,
        `C) $2.5\\text{ seconds}$`,
        `D) $5.0\\text{ seconds}$`,
      ],
      correctAnswer: 'A',
      marks: 2,
      explanation: `Formula for maximum burst time $S$: $C + \\rho \\cdot S = M \\cdot S \\implies S = \\frac{C}{M - \\rho}$.\nHere capacity $C = 10\\text{ MB}$, token rate $\\rho = 2\\text{ MB/s}$, peak rate $M = 10\\text{ MB/s}$.\n$S = \\frac{10}{10 - 2} = \\frac{10}{8} = 1.25\\text{ seconds}$.`,
      tip: `Burst duration $S = \\frac{\\text{Bucket Capacity}}{\\text{Max Output Rate} - \\text{Token Arrival Rate}}$.`,
    },
    {
      id: 'Q10',
      question: `Which of the following statements is TRUE regarding optimal binary search trees and dynamic programming principles for "${safeTopic}"?`,
      options: [
        `A) The optimal substructure property allows solving subproblems independently and storing results in a memoization/lookup table.`,
        `B) Greedy choice always yields the global optimum for 0/1 Knapsack problem.`,
        `C) Dynamic programming requires the underlying subproblem graph to contain directed cycles.`,
        `D) Memoization is strictly slower than simple recursion for all inputs.`,
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: `Dynamic programming requires two key properties: (1) Optimal Substructure (optimal solution to the problem contains within it optimal solutions to subproblems), and (2) Overlapping Subproblems. Storing computed subproblems avoids redundant exponential recalculation.`,
      tip: `0/1 Knapsack is DP ($O(nW)$ pseudo-polynomial), whereas Fractional Knapsack is Greedy.`,
    },
  ];

  return defaultPool.slice(0, count);
}

export function getFallbackWeeklyPlan(
  dailyHours: number,
  holidayDays: string[],
  focusSubjects: string[],
  strategy: string,
  weekKey: string,
  weekStartDate: string,
  weekEndDate: string,
  dayDates: any[],
  pendingTopicsList: any[] = []
) {
  const activeDaysCount = Math.max(1, 7 - holidayDays.length);
  const totalHours = activeDaysCount * dailyHours;

  const coreSubjects =
    focusSubjects.length > 0
      ? focusSubjects
      : ['Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks', 'Theory of Computation', 'Digital Logic'];

  const days = (dayDates || []).map((d: any, idx: number) => {
    const dayName = d.name || `Day ${idx + 1}`;
    const dateStr = d.dateStr || '';
    const isHoliday = holidayDays.includes(dayName);

    if (isHoliday) {
      return {
        dayIndex: idx,
        dayName,
        dateStr,
        isHoliday: true,
        holidayNote: 'Rest & Mental Reset Day • Optional 15m formula revision',
        allocatedMinutes: 0,
        focusSubject: 'Rest Day',
        dailyObjective: 'Recharge cognitive energy and avoid burnout.',
        tasks: [],
      };
    }

    const assignedSubject = coreSubjects[idx % coreSubjects.length];
    const candidateTopic =
      pendingTopicsList.find((p) => p.subject === assignedSubject)?.topic ||
      `${assignedSubject} Core Concept & PYQs`;

    const halfMinutes = Math.round((dailyHours * 60) / 2);

    return {
      dayIndex: idx,
      dayName,
      dateStr,
      isHoliday: false,
      allocatedMinutes: dailyHours * 60,
      focusSubject: assignedSubject,
      dailyObjective: `Master ${candidateTopic} and solve standard 2-mark GATE questions.`,
      tasks: [
        {
          id: `task_${idx}_0_${Date.now()}`,
          title: `Video Lecture: ${candidateTopic}`,
          topicName: candidateTopic,
          subjectName: assignedSubject,
          type: 'lecture' as const,
          durationMinutes: halfMinutes,
          actionTip: `Focus on theoretical derivations and write down formulas in your personal notebook.`,
          completed: false,
        },
        {
          id: `task_${idx}_1_${Date.now()}`,
          title: `PYQ Practice & Speed Drill: ${candidateTopic}`,
          topicName: candidateTopic,
          subjectName: assignedSubject,
          type: strategy === 'theory_mastery' ? ('revision' as const) : ('pyq' as const),
          durationMinutes: dailyHours * 60 - halfMinutes,
          actionTip: `Solve previous 5 years GATE questions under timed conditions without checking solutions upfront.`,
          completed: false,
        },
      ],
    };
  });

  return {
    id: `plan_${Date.now()}`,
    weekKey: weekKey || 'Current Week',
    weekStartDate: weekStartDate || '',
    weekEndDate: weekEndDate || '',
    dailyTargetHours: dailyHours,
    holidayDays,
    strategy,
    weekTheme: `${coreSubjects.slice(0, 2).join(' & ')} Syllabus Sprint`,
    weeklyGoalSummary: `Complete ${activeDaysCount * 2} high-yield study milestones across ${activeDaysCount} active days (${totalHours}h target).`,
    totalPlannedHours: totalHours,
    days,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getFallbackNews() {
  return {
    rawText: `### 📢 Official GATE Announcements & Examination Updates

1. **GATE Organizing Authority Schedule**
   * **Organizing IIT**: Official GATE portal manages annual examination cycles across 30 distinct test papers including Computer Science & Information Technology (CS) and Data Science & AI (DA).
   * **Official Portal**: Candidates can access syllabus notifications, test schedules, and mock papers directly at the official portal.

2. **Exam Schedule & Timelines**
   * **Exam Window**: GATE examinations are traditionally conducted across the first two weekends of February in forenoon (9:30 AM - 12:30 PM) and afternoon (2:30 PM - 5:30 PM) sessions.
   * **Admit Cards**: Hall tickets are released in early January. Verify personal details, photograph, and test center code immediately upon download.

3. **Two-Paper Combinations & Eligibility**
   * Candidates appearing for GATE Computer Science (CS) can optionally register for a secondary paper such as Data Science & AI (DA) or Mathematics (MA) under the approved combination guidelines.

4. **Syllabus & Weightage Reminders**
   * General Aptitude carries 15 marks, Engineering Mathematics carries ~13 marks, and Core Subject CSE topics carry 72 marks.
   * Marking scheme features 1-mark and 2-mark questions (MCQs with 1/3 and 2/3 negative marking; MSQs and NATs with no negative marking).`,
    groundingSources: [
      {
        title: 'Official GATE Examination Portal',
        uri: 'https://gate2025.iitr.ac.in',
      },
      {
        title: 'NPTEL GATE Preparation Portal',
        uri: 'https://gate.nptel.ac.in',
      },
      {
        title: 'National Testing Agency / IIT Announcements',
        uri: 'https://jeemain.nta.nic.in',
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function getFallbackChatAnswer(userQuery: string, subject?: string, topic?: string, role = 'mentor'): string {
  const safeSubject = subject || 'GATE CSE';
  const safeTopic = topic || 'Core Subject Topic';

  if (role === 'traps') {
    return `### ⚠️ GATE Trap & Edge-Case Analysis: ${safeTopic}

When solving GATE questions on **${safeTopic}** in **${safeSubject}**, examiners test specific boundary pitfalls:

1. **Strict vs. Non-Strict Bounds**:
   * Watch out for questions asking for *upper bound* ($O$) vs *tight bound* ($\\Theta$).
   * In NAT questions, check if range endpoints are inclusive or exclusive.

2. **Degenerate / Trivial Cases**:
   * For trees and graphs: Check $n=0$, $n=1$, disconnected graphs, or cyclic structures.
   * For memory calculations: Check whether addressing is **byte-addressable** or **word-addressable**.

3. **Negative Marking Defense**:
   * In MSQs (Multiple Select Questions), verify every option independently.
   * In NATs (Numerical Answer Type), note the rounding instructions (e.g., "round off to 2 decimal places").`;
  }

  if (role === 'revision') {
    return `### ⚡ Rapid Formula & Concept Card: ${safeTopic}

* **Core Subject**: ${safeSubject}
* **Standard Complexity / Bound**:
  * Lookup / Search: $O(\\log n)$ in balanced structures, $O(n)$ in degenerate cases.
  * Traversal / Build: $O(n)$ or $O(n \\log n)$.
* **Key Invariant**:
  * Sum of vertex degrees in graph: $\\sum \\text{deg}(v) = 2|E|$.
  * Height of balanced binary tree with $n$ nodes: $h = \\lfloor \\log_2 n \\rfloor$.
* **Quick Rule of Thumb**:
  * Always verify if cache/memory blocks are power-of-2 aligned.
  * For regular expressions, check if the empty string $\\epsilon$ is accepted.`;
  }

  if (role === 'prover') {
    return `### 🧮 Mathematical Step-by-Step Breakdown: ${safeTopic}

**Context:** Analysis for ${safeTopic} (${safeSubject})

**1. Formal Definition & Hypothesis:**
Let the problem size be $n$. We establish recurrence relation:
$$T(n) = a \\cdot T(n/b) + f(n)$$
where $a \\ge 1, b > 1$.

**2. Inductive / Tree Expansion:**
At level $i$, the number of subproblems is $a^i$, each of size $n/b^i$.
The total work at depth $i$ is:
$$W_i = a^i \\cdot f(n/b^i)$$

**3. Asymptotic Derivation:**
* Compare $f(n)$ with $n^{\\log_b a}$.
* If $f(n) = \\Theta(n^{\\log_b a})$, then $T(n) = \\Theta(n^{\\log_b a} \\log n)$.
* If $f(n) = \\Omega(n^{\\log_b a + \\epsilon})$ and regularity condition holds, $T(n) = \\Theta(f(n))$.

**Conclusion:** All state transitions terminate within verified asymptotic limits.`;
  }

  // Default mentor response
  return `### 📘 Concept Guide: ${safeTopic} (${safeSubject})

**1. Direct Conceptual Answer:**
${userQuery ? `Addressing your question on **"${userQuery}"**:` : `Regarding **${safeTopic}**:`}
In GATE CSE, this concept is central to understanding system guarantees, invariant preservation, and asymptotic efficiency.

**2. Essential Properties & Formulas:**
* Ensure you identify whether input constraints are discrete, finite, or continuous.
* Remember that memory calculations depend on cache block size, word length, and set-associativity.
* For recurrence relations, apply Master's Theorem or recursion tree method step-by-step.

**3. Standard GATE PYQ Pattern:**
* Typical 1-mark questions test direct definitions, properties, and standard counter-examples.
* Typical 2-mark questions test multi-step calculations (e.g., effective memory access time, total number of page faults, pipeline stall cycles, or schedule serializability).

*Tip: Feel free to ask for a specific numerical breakdown, proof, or practice MCQ!*`;
}
