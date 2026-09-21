import { LearningPathway, PathwayStep, Topic, Problem, isValidatedOrActive } from '../types';
import { GRADE_11_COMPETENCIES } from '../data/competencyGraph';

export interface CompetencyPathwayDetail {
  competencyId: string;
  competencyName: string;
  topicId: string;
  topicTitle: string;
  conceptSummary: {
    definition: string;
    rules: { label: string; formulaOrRule: string; note: string }[];
    domainRestrictions?: string;
    commonMisconception: string;
  };
  miniLesson: {
    title: string;
    summary: string;
    keyTakeaways: string[];
    checkpointQuestion: {
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    };
  };
  workedExample: {
    problemStatement: string;
    goal: string;
    steps: { stepNumber: number; title: string; mathematicalExpression: string; explanation: string }[];
    domainCheck: string;
    finalAnswer: string;
  };
}

export const COMPETENCY_DETAILS_MAP: Record<string, CompetencyPathwayDetail> = {
  // 1. Rational Equations & Inequalities
  'comp-rational-eq': {
    competencyId: 'comp-rational-eq',
    competencyName: 'Solve rational equations & inequalities',
    topicId: 'functions',
    topicTitle: 'Functions & Relations',
    conceptSummary: {
      definition: 'A rational equation is an equation containing one or more rational expressions (fractions where the numerator and/or denominator are polynomials).',
      rules: [
        {
          label: 'Finding the LCD',
          formulaOrRule: 'LCD = Product of distinct irreducible factors with highest powers',
          note: 'Factor all denominators first to find the Least Common Denominator.'
        },
        {
          label: 'Clearing Denominators',
          formulaOrRule: 'Multiply entire equation by the LCD',
          note: 'This eliminates fractions, converting the equation into a polynomial (linear or quadratic) equation.'
        },
        {
          label: 'Domain Restrictions & Extraneous Roots',
          formulaOrRule: 'Denominator ≠ 0 (x such that D(x) = 0 must be discarded)',
          note: 'Any algebraic solution that makes any original denominator equal to zero is extraneous and MUST be rejected.'
        }
      ],
      domainRestrictions: 'All real numbers EXCEPT values of x where any denominator equals 0.',
      commonMisconception: 'Forgetting to check for extraneous solutions after multiplying by algebraic denominators.'
    },
    miniLesson: {
      title: 'Mastering Rational Equations & Domain Restrictions',
      summary: 'To solve rational equations systematically, follow the 4-step framework: Factor denominators → Determine restricted values → Multiply both sides by the LCD → Solve and verify against domain restrictions.',
      keyTakeaways: [
        'Always factor denominators first before picking the LCD.',
        'Record values of x that make denominators zero as restricted domain values.',
        'Multiply every single term on both sides by the LCD.',
        'Always substitute candidate answers back into original denominators to filter out extraneous roots.'
      ],
      checkpointQuestion: {
        question: 'What is the restricted domain value for the equation: 2/(x - 3) + 1 = 5/(x - 3)?',
        options: ['x ≠ 0', 'x ≠ 3', 'x ≠ -3', 'x ≠ 5'],
        correctAnswer: 1,
        explanation: 'The denominator is (x - 3). Setting x - 3 = 0 gives x = 3. Therefore, x = 3 is undefined and cannot be a solution.'
      }
    },
    workedExample: {
      problemStatement: 'Solve for x: (2 / (x - 1)) + 1 = 5 / (x - 1)',
      goal: 'Find all valid real values of x satisfying the rational equation.',
      steps: [
        {
          stepNumber: 1,
          title: 'Identify Domain Restrictions & Common Denominator',
          mathematicalExpression: 'x - 1 ≠ 0 ⟹ x ≠ 1; LCD = (x - 1)',
          explanation: 'The only variable denominator is (x - 1), so x cannot be 1.'
        },
        {
          stepNumber: 2,
          title: 'Multiply Both Sides by the LCD (x - 1)',
          mathematicalExpression: '(x - 1) · [2/(x - 1) + 1] = (x - 1) · [5/(x - 1)]',
          explanation: 'Distribute (x - 1) across every term in the equation.'
        },
        {
          stepNumber: 3,
          title: 'Simplify the Resulting Linear Equation',
          mathematicalExpression: '2 + (x - 1) = 5 ⟹ x + 1 = 5 ⟹ x = 4',
          explanation: 'Clearing denominators reduces the problem to an elementary linear equation.'
        },
        {
          stepNumber: 4,
          title: 'Verify Against Domain Restriction',
          mathematicalExpression: 'Check: x = 4 ≠ 1. (Valid solution!)',
          explanation: 'Since 4 does not make the original denominator zero, x = 4 is the authentic solution.'
        }
      ],
      domainCheck: 'Candidate solution x = 4 is not in the restricted set {1}.',
      finalAnswer: 'x = 4'
    }
  },

  // 2. Functions & Relations
  'comp-func-ident': {
    competencyId: 'comp-func-ident',
    competencyName: 'Identify functions from relations',
    topicId: 'functions',
    topicTitle: 'Functions & Relations',
    conceptSummary: {
      definition: 'A function is a mathematical relationship where every single input (element of domain) maps to exactly ONE unique output (element of range).',
      rules: [
        {
          label: 'Vertical Line Test (VLT)',
          formulaOrRule: 'If any vertical line crosses a graph more than once, it is NOT a function',
          note: 'Applies to any graph on the Cartesian coordinate plane.'
        },
        {
          label: 'Ordered Pairs Rule',
          formulaOrRule: 'No two distinct ordered pairs can have the exact same first coordinate (x-value)',
          note: 'If (x, y1) and (x, y2) exist with y1 ≠ y2, the relation is not a function.'
        }
      ],
      domainRestrictions: 'The domain consists of all allowable input values for which the relation is defined.',
      commonMisconception: 'Assuming that two different x-values cannot have the same y-value (which is allowed in functions like y = x²).'
    },
    miniLesson: {
      title: 'Understanding Functions vs Relations',
      summary: 'Think of a function as a reliable vending machine: each button (input) must reliably dispense exactly one specific item (output). If one button gives two different items unpredictably, it fails the function definition.',
      keyTakeaways: [
        'A relation is simply any set of ordered pairs (x, y).',
        'A function is a well-behaved relation: 1 input → exactly 1 output.',
        'Horizontal lines crossing multiple times is okay for standard functions, but vertical lines MUST NOT cross more than once.'
      ],
      checkpointQuestion: {
        question: 'Which of the following sets of ordered pairs is a function?',
        options: ['{(1,2), (1,3), (2,4)}', '{(2,5), (3,5), (4,5)}', '{(0,1), (0,-1), (2,2)}', '{(3,1), (3,2), (3,3)}'],
        correctAnswer: 1,
        explanation: 'In {(2,5), (3,5), (4,5)}, every input (2, 3, 4) maps to exactly one output (5). Distinct inputs sharing the same output is completely valid.'
      }
    },
    workedExample: {
      problemStatement: 'Determine whether the relation defined by x = y² represents y as a function of x.',
      goal: 'Apply algebraic test and Vertical Line Test.',
      steps: [
        {
          stepNumber: 1,
          title: 'Express y in terms of x',
          mathematicalExpression: 'x = y² ⟹ y = ±√x',
          explanation: 'Taking the square root of both sides introduces both positive and negative roots.'
        },
        {
          stepNumber: 2,
          title: 'Test with a sample input',
          mathematicalExpression: 'Let x = 4 ⟹ y = 2 or y = -2',
          explanation: 'The single input x = 4 yields two distinct outputs: 2 and -2.'
        },
        {
          stepNumber: 3,
          title: 'Evaluate against Function Definition',
          mathematicalExpression: 'Single input 4 ⟹ multiple outputs {2, -2}',
          explanation: 'Since one input generates more than one output, the relation fails the vertical line test.'
        }
      ],
      domainCheck: 'Domain is x ≥ 0.',
      finalAnswer: 'x = y² is NOT a function of x.'
    }
  },

  // 3. Perform operations & compositions on functions
  'comp-func-ops': {
    competencyId: 'comp-func-ops',
    competencyName: 'Perform operations and compositions on functions',
    topicId: 'functions',
    topicTitle: 'Functions & Relations',
    conceptSummary: {
      definition: 'Function composition (f ∘ g)(x) means substituting the entire expression of g(x) into the variable placeholder of f(x).',
      rules: [
        {
          label: 'Composition Formula',
          formulaOrRule: '(f ∘ g)(x) = f(g(x))',
          note: 'Evaluate the inner function g(x) first, then feed the result into f.'
        },
        {
          label: 'Non-Commutative Property',
          formulaOrRule: '(f ∘ g)(x) ≠ (g ∘ f)(x) in general',
          note: 'The order of composition matters significantly.'
        }
      ],
      commonMisconception: 'Multiplying the two functions f(x) · g(x) instead of nesting them inside one another.'
    },
    miniLesson: {
      title: 'Composition of Functions: Step-by-Step Substitution',
      summary: 'Composition acts as a two-stage assembly line: raw material x enters g(x) to become g(x), which then enters f(x) to yield the final output f(g(x)).',
      keyTakeaways: [
        'Always solve from the inside out: g(x) first, then f.',
        'Use parentheses as placeholders: write f( ) with empty parentheses, then place g(x) inside.',
        'Simplify polynomial terms carefully using correct order of operations.'
      ],
      checkpointQuestion: {
        question: 'If f(x) = 2x + 1 and g(x) = x², what is (f ∘ g)(3)?',
        options: ['49', '19', '37', '13'],
        correctAnswer: 1,
        explanation: 'g(3) = 3² = 9. Then f(9) = 2(9) + 1 = 18 + 1 = 19.'
      }
    },
    workedExample: {
      problemStatement: 'Given f(x) = 3x - 1 and g(x) = x² + 2, evaluate (f ∘ g)(x) and (f ∘ g)(3).',
      goal: 'Find the general composite formula and evaluate at x = 3.',
      steps: [
        {
          stepNumber: 1,
          title: 'Substitute g(x) into f(x)',
          mathematicalExpression: '(f ∘ g)(x) = f(g(x)) = 3(x² + 2) - 1',
          explanation: 'Replace every instance of x in f(x) with the polynomial (x² + 2).'
        },
        {
          stepNumber: 2,
          title: 'Distribute and Combine Like Terms',
          mathematicalExpression: '= 3x² + 6 - 1 = 3x² + 5',
          explanation: 'Multiply through by 3 and subtract 1.'
        },
        {
          stepNumber: 3,
          title: 'Evaluate at x = 3',
          mathematicalExpression: '(f ∘ g)(3) = 3(3)² + 5 = 3(9) + 5 = 27 + 5 = 32',
          explanation: 'Substitute 3 into the simplified composite function.'
        }
      ],
      domainCheck: 'Domain is all real numbers ℝ.',
      finalAnswer: '(f ∘ g)(x) = 3x² + 5; (f ∘ g)(3) = 32'
    }
  },

  // 4. Trigonometric Ratios & Pythagorean Identities
  'comp-trig-ratios': {
    competencyId: 'comp-trig-ratios',
    competencyName: 'Apply Pythagorean identities to find trigonometric ratios',
    topicId: 'trig',
    topicTitle: 'Trigonometry',
    conceptSummary: {
      definition: 'Pythagorean identities establish fundamental relationships between trigonometric functions on right triangles and unit circle coordinates.',
      rules: [
        {
          label: 'Primary Pythagorean Identity',
          formulaOrRule: 'sin²(θ) + cos²(θ) = 1',
          note: 'Fundamental identity valid for all real angles θ.'
        },
        {
          label: 'Derived Identities',
          formulaOrRule: '1 + tan²(θ) = sec²(θ) and 1 + cot²(θ) = csc²(θ)',
          note: 'Obtained by dividing the primary identity by cos²(θ) or sin²(θ).'
        }
      ],
      commonMisconception: 'Forgetting that cos(θ) can be negative depending on which quadrant the angle terminates in.'
    },
    miniLesson: {
      title: 'The Power of Pythagorean Identities in Trigonometry',
      summary: 'Given just one trigonometric ratio and the quadrant of the angle, you can determine all five other trigonometric ratios using Pythagorean identities.',
      keyTakeaways: [
        'sin²(θ) + cos²(θ) is ALWAYS equal to 1.',
        'When taking square roots, inspect the Quadrant (ASTC Rule) to determine the correct sign (+ or -).',
        'Quadrant I: All positive; Quadrant II: Sine positive; Quadrant III: Tangent positive; Quadrant IV: Cosine positive.'
      ],
      checkpointQuestion: {
        question: 'If sin(θ) = 3/5 and θ is in Quadrant I, what is cos(θ)?',
        options: ['4/5', '3/4', '5/4', '2/5'],
        correctAnswer: 0,
        explanation: 'cos²(θ) = 1 - sin²(θ) = 1 - 9/25 = 16/25. In Quadrant I, cos(θ) > 0, so cos(θ) = 4/5.'
      }
    },
    workedExample: {
      problemStatement: 'If sin(θ) = 5/13 and θ is an acute angle (Quadrant I), find cos(θ) and tan(θ).',
      goal: 'Calculate exact trigonometric values using identities.',
      steps: [
        {
          stepNumber: 1,
          title: 'Apply Pythagorean Identity',
          mathematicalExpression: 'sin²(θ) + cos²(θ) = 1 ⟹ (5/13)² + cos²(θ) = 1',
          explanation: 'Substitute the given sine ratio into the identity.'
        },
        {
          stepNumber: 2,
          title: 'Solve for cos²(θ)',
          mathematicalExpression: 'cos²(θ) = 1 - 25/169 = 144/169',
          explanation: 'Subtract 25/169 from 1.'
        },
        {
          stepNumber: 3,
          title: 'Take Square Root with Quadrant Check',
          mathematicalExpression: 'cos(θ) = +√(144/169) = 12/13 (positive in Q1)',
          explanation: 'Quadrant I requires positive cosine.'
        },
        {
          stepNumber: 4,
          title: 'Compute tan(θ)',
          mathematicalExpression: 'tan(θ) = sin(θ) / cos(θ) = (5/13) / (12/13) = 5/12',
          explanation: 'Use the quotient identity for tangent.'
        }
      ],
      domainCheck: 'θ is acute (0 < θ < π/2).',
      finalAnswer: 'cos(θ) = 12/13, tan(θ) = 5/12'
    }
  },

  // 5. Exponential & Logarithmic Equations
  'comp-exp-eq': {
    competencyId: 'comp-exp-eq',
    competencyName: 'Solve exponential and logarithmic equations',
    topicId: 'exp-log',
    topicTitle: 'Exponentials & Logs',
    conceptSummary: {
      definition: 'Exponential equations feature variables in exponents, while logarithmic equations involve log terms that must be combined using log properties.',
      rules: [
        {
          label: 'One-to-One Property',
          formulaOrRule: 'If b^u = b^v, then u = v (for b > 0, b ≠ 1)',
          note: 'Express both sides with the same base to equate exponents directly.'
        },
        {
          label: 'Taking Logarithms',
          formulaOrRule: 'log(b^x) = x · log(b)',
          note: 'Used when bases cannot easily be matched.'
        },
        {
          label: 'Log Argument Domain',
          formulaOrRule: 'In log_b(M), the argument M MUST be strictly positive (M > 0)',
          note: 'Always check for extraneous solutions in logarithmic equations.'
        }
      ],
      commonMisconception: 'Assuming negative values of x are automatically invalid, rather than testing if the argument inside the log becomes non-positive.'
    },
    miniLesson: {
      title: 'Solving Exponential Equations via Common Bases',
      summary: 'When solving exponential equations, rewrite numbers as powers of a common base (e.g., 4 = 2², 8 = 2³). Once bases match, equate the exponents and solve algebraically.',
      keyTakeaways: [
        'Look for common prime bases like 2, 3, 5, or 10.',
        'Remember power-of-a-power rule: (b^m)^n = b^(m·n).',
        'When solving log equations, condense multiple logs using product/quotient rules before converting to exponential form.'
      ],
      checkpointQuestion: {
        question: 'Solve for x: 2^(3x - 1) = 32.',
        options: ['x = 2', 'x = 3', 'x = 1', 'x = 5'],
        correctAnswer: 0,
        explanation: '32 = 2⁵. Equating exponents: 3x - 1 = 5 ⟹ 3x = 6 ⟹ x = 2.'
      }
    },
    workedExample: {
      problemStatement: 'Solve for x: 4^(x + 1) = 8^(x - 1)',
      goal: 'Solve by expressing both sides with common base 2.',
      steps: [
        {
          stepNumber: 1,
          title: 'Express Both Sides with Common Base 2',
          mathematicalExpression: '4 = 2² and 8 = 2³ ⟹ (2²)^(x + 1) = (2³)^(x - 1)',
          explanation: 'Convert both composite bases into powers of 2.'
        },
        {
          stepNumber: 2,
          title: 'Apply Power of a Power Rule',
          mathematicalExpression: '2^(2(x + 1)) = 2^(3(x - 1)) ⟹ 2^(2x + 2) = 2^(3x - 3)',
          explanation: 'Multiply the outer exponents by the inner exponents.'
        },
        {
          stepNumber: 3,
          title: 'Equate Exponents and Solve',
          mathematicalExpression: '2x + 2 = 3x - 3 ⟹ 2 + 3 = 3x - 2x ⟹ x = 5',
          explanation: 'Since bases are identical (2), exponents must be equal.'
        }
      ],
      domainCheck: 'Check: 4^(5+1) = 4⁶ = 4096; 8^(5-1) = 8⁴ = 4096. (Verified!)',
      finalAnswer: 'x = 5'
    }
  }
};

/**
 * Finds or synthesizes a CompetencyPathwayDetail for any given competency name or id.
 */
export function getCompetencyDetail(competencyNameOrId: string, topics: Topic[]): CompetencyPathwayDetail {
  // Check exact key match
  if (COMPETENCY_DETAILS_MAP[competencyNameOrId]) {
    return COMPETENCY_DETAILS_MAP[competencyNameOrId];
  }

  // Check by competency name matching
  const matchingKey = Object.keys(COMPETENCY_DETAILS_MAP).find(k => 
    COMPETENCY_DETAILS_MAP[k].competencyName.toLowerCase().includes(competencyNameOrId.toLowerCase()) ||
    competencyNameOrId.toLowerCase().includes(COMPETENCY_DETAILS_MAP[k].competencyName.toLowerCase())
  );
  if (matchingKey) {
    return COMPETENCY_DETAILS_MAP[matchingKey];
  }

  // Check in GRADE_11_COMPETENCIES
  const compBlueprint = GRADE_11_COMPETENCIES.find(c => 
    c.id === competencyNameOrId || 
    c.name.toLowerCase().includes(competencyNameOrId.toLowerCase()) ||
    competencyNameOrId.toLowerCase().includes(c.name.toLowerCase())
  );

  const topic = topics.find(t => t.id === compBlueprint?.topicId) || topics[0];
  const compName = compBlueprint?.name || competencyNameOrId;

  // Synthesize from topic lesson plan or dynamic blueprint
  return {
    competencyId: compBlueprint?.id || `comp-${Date.now()}`,
    competencyName: compName,
    topicId: topic.id,
    topicTitle: topic.title,
    conceptSummary: {
      definition: `A fundamental mathematical competency in ${topic.title}: mastering ${compName}.`,
      rules: [
        {
          label: 'Core Principle',
          formulaOrRule: 'Apply systematic mathematical rules and domain verification',
          note: `Essential for solving Grade 11 ${topic.title} problems.`
        },
        {
          label: 'Step-by-Step Procedure',
          formulaOrRule: 'Simplify ⟹ Formulate ⟹ Solve ⟹ Check Domain',
          note: 'Ensures accuracy and avoids algebraic errors.'
        }
      ],
      commonMisconception: 'Applying arithmetic shortcuts without verifying foundational algebraic constraints.'
    },
    miniLesson: {
      title: `Understanding ${compName}`,
      summary: `This mini-lesson breaks down ${compName} into clear, actionable mathematical steps aligned with the Grade 11 curriculum.`,
      keyTakeaways: [
        `Understand the core terminology and mathematical notation of ${compName}.`,
        'Work systematically through step-by-step algebraic manipulations.',
        'Always double-check solutions with substitution.'
      ],
      checkpointQuestion: {
        question: `Which strategy is most appropriate when beginning a problem involving ${compName}?`,
        options: [
          'Identify given terms and verify domain constraints',
          'Guess the final value directly without writing steps',
          'Ignore negative signs and powers',
          'Cancel terms indiscriminately'
        ],
        correctAnswer: 0,
        explanation: 'Systematic identification of given parameters and domain constraints is always the essential first step.'
      }
    },
    workedExample: {
      problemStatement: `Sample problem for ${compName}`,
      goal: `Demonstrate complete algebraic solution process for ${compName}.`,
      steps: [
        {
          stepNumber: 1,
          title: 'Identify Given Parameters',
          mathematicalExpression: 'Given expressions and algebraic constraints',
          explanation: 'Isolate key variables and note restricted values.'
        },
        {
          stepNumber: 2,
          title: 'Apply Mathematical Transformations',
          mathematicalExpression: 'Perform rigorous algebraic simplification',
          explanation: 'Transform the equation to standard solvable form.'
        },
        {
          stepNumber: 3,
          title: 'Verify Solution',
          mathematicalExpression: 'Check candidate answers against constraints',
          explanation: 'Ensure the final value is in the domain and satisfies the original equation.'
        }
      ],
      domainCheck: 'All values satisfy the problem domain constraints.',
      finalAnswer: 'Demonstrated and verified.'
    }
  };
}

/**
 * Generates the standardized 7-step Learning Pathway for a student's weakness/target competency.
 */
export function generateLearningPathway(
  competencyNameOrId: string,
  topics: Topic[],
  weaknessScore?: number
): LearningPathway {
  const detail = getCompetencyDetail(competencyNameOrId, topics);

  const steps: PathwayStep[] = [
    {
      id: `step-1-concept-${detail.competencyId}`,
      type: 'concept',
      title: `1. Review Concept: ${detail.competencyName}`,
      isCompleted: false
    },
    {
      id: `step-2-lesson-${detail.competencyId}`,
      type: 'lesson',
      title: `2. Watch/Read Mini Lesson`,
      isCompleted: false
    },
    {
      id: `step-3-example-${detail.competencyId}`,
      type: 'example',
      title: `3. Step-by-Step Worked Example`,
      isCompleted: false
    },
    {
      id: `step-4-easy-${detail.competencyId}`,
      type: 'practice_easy',
      title: `4. Foundational Easy Practice (b ≤ -0.3)`,
      isCompleted: false
    },
    {
      id: `step-5-moderate-${detail.competencyId}`,
      type: 'practice_moderate',
      title: `5. Intermediate Moderate Practice (-0.3 < b ≤ 0.5)`,
      isCompleted: false
    },
    {
      id: `step-6-difficult-${detail.competencyId}`,
      type: 'practice_difficult',
      title: `6. Rigorous Difficult Practice (b > 0.5)`,
      isCompleted: false
    },
    {
      id: `step-7-mastery-${detail.competencyId}`,
      type: 'mastery',
      title: `7. Competency Mastery Assessment (Pass Threshold: ≥ 75%)`,
      isCompleted: false
    }
  ];

  return {
    topicId: detail.topicId,
    topicTitle: detail.topicTitle,
    competencyId: detail.competencyId,
    competencyName: detail.competencyName,
    currentStepIndex: 0,
    steps
  };
}

/**
 * Finds the NEXT competency for a student once they have demonstrated mastery.
 */
export function findNextCompetencyToStudy(
  currentCompetencyIdOrName: string,
  diagnosticScores: Record<string, number> | undefined,
  competencyScores: Record<string, number> | undefined,
  topics: Topic[]
): { nextCompetencyName: string; nextCompetencyId: string; topicId: string; reason: string } {
  // 1. Check if there are other identified weaknesses (scores < 75%)
  const scores = { ...(diagnosticScores || {}), ...(competencyScores || {}) };
  
  const weakCompetencyEntries = Object.entries(scores)
    .filter(([name, score]) => 
      score < 75 && 
      name.toLowerCase() !== currentCompetencyIdOrName.toLowerCase() &&
      !name.toLowerCase().includes(currentCompetencyIdOrName.toLowerCase())
    )
    .sort((a, b) => a[1] - b[1]);

  if (weakCompetencyEntries.length > 0) {
    const [weakestName, score] = weakCompetencyEntries[0];
    const compBlueprint = GRADE_11_COMPETENCIES.find(c => 
      c.name.toLowerCase() === weakestName.toLowerCase() ||
      weakestName.toLowerCase().includes(c.name.toLowerCase())
    );
    
    return {
      nextCompetencyName: compBlueprint?.name || weakestName,
      nextCompetencyId: compBlueprint?.id || `comp-weak-${Date.now()}`,
      topicId: compBlueprint?.topicId || 'functions',
      reason: `Identified as a student learning priority with ${Math.round(score)}% proficiency in diagnostic assessment.`
    };
  }

  // 2. Otherwise, check next in GRADE_11_COMPETENCIES progression graph
  const currentIndex = GRADE_11_COMPETENCIES.findIndex(c => 
    c.id === currentCompetencyIdOrName || 
    c.name.toLowerCase().includes(currentCompetencyIdOrName.toLowerCase()) ||
    currentCompetencyIdOrName.toLowerCase().includes(c.name.toLowerCase())
  );

  if (currentIndex !== -1 && currentIndex < GRADE_11_COMPETENCIES.length - 1) {
    const nextComp = GRADE_11_COMPETENCIES[currentIndex + 1];
    return {
      nextCompetencyName: nextComp.name,
      nextCompetencyId: nextComp.id,
      topicId: nextComp.topicId,
      reason: `Next curriculum tier progression (${nextComp.tierLabel}) in Grade 11 learning sequence.`
    };
  }

  // 3. Fallback to next topic
  const currentTopic = topics.find(t => 
    t.title.toLowerCase().includes(currentCompetencyIdOrName.toLowerCase())
  ) || topics[0];
  const topicIdx = topics.findIndex(t => t.id === currentTopic.id);
  const nextTopic = topicIdx < topics.length - 1 ? topics[topicIdx + 1] : topics[0];

  return {
    nextCompetencyName: nextTopic.title,
    nextCompetencyId: `topic-${nextTopic.id}`,
    topicId: nextTopic.id,
    reason: `Next core curriculum module in Grade 11 General Mathematics.`
  };
}
