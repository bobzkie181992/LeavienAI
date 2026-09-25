import { LessonPlan } from '../types';

export const ILAW_LESSON_PLANS: Record<string, LessonPlan> = {
  'functions': {
    id: 'lp-functions',
    topicId: 'functions',
    title: 'DepEd ILAW Lesson Plan: Functions & Relations',
    gradeLevel: 'Grade 11 - General Mathematics',
    duration: '60 minutes',
    subject: 'General Mathematics',
    term: 'Term 1',
    week: 'Week 1',
    dates: 'Aug. 10-14, 2026',
    section: 'Grade 11 – Gauss (6:00 AM – 7:00 AM)',
    doOrderRef: 'DepEd MATATAG / D.O. No. 016, s.2026',
    weeklySchedule: [
      { day: 'MONDAY', date: 'Aug. 10, 2026', lessonTitle: 'Understanding Relations, Functions, and Vertical Line Test', activityType: 'Whole Class', objective: 'Define functions vs relations using mapping diagrams and vertical line tests.' },
      { day: 'TUESDAY', date: 'Aug. 11, 2026', lessonTitle: 'Evaluating Functions and Piecewise Defined Functions', activityType: 'Group Work', objective: 'Evaluate f(x) for real numbers and piecewise domain sub-intervals.' },
      { day: 'WEDNESDAY', date: 'Aug. 12, 2026', lessonTitle: 'Performing Operations on Functions (Addition, Subtraction, Multiplication, Division)', activityType: 'Pair Work', objective: 'Execute fundamental operations (f + g)(x), (f · g)(x), (f / g)(x).' },
      { day: 'THURSDAY', date: 'Aug. 13, 2026', lessonTitle: 'Composition of Functions (f ∘ g)(x)', activityType: 'Whole Class', objective: 'Compute and simplify composite functions f(g(x)).' },
      { day: 'FRIDAY', date: 'Aug. 14, 2026', lessonTitle: 'Real-Life Problems Involving Functions, Piecewise Fares, and Assessment', activityType: 'Individual Work', objective: 'Model transportation fares and evaluate mastery via summative test.' }
    ],
    references: [
      'DepEd SHS General Mathematics Curriculum Guide (MELCs)',
      'DepEd SHS General Mathematics Learner’s Material (First Edition 2016)',
      'CHED Teaching Guide for Senior High School - General Mathematics'
    ],
    prerequisites: ['Cartesian Coordinate System', 'Algebraic Expressions', 'Evaluating Polynomials', 'Set Notation'],
    framework: 'ILAW',
    ilaw: {
      intentions: {
        learningIntentions: 'Master relations, functions, piecewise evaluation, operations, and composite functions in Grade 11 General Mathematics.',
        successCriteria: [
          'Differentiate between relations and functions using ordered pairs, mapping diagrams, and vertical line tests.',
          'Evaluate algebraic and piecewise functions accurately given specific domain inputs.',
          'Perform addition, subtraction, multiplication, division, and composition of functions (f ∘ g)(x).',
          'Formulate and solve real-world problems modeled by piecewise functions (e.g., jeepney fares, electricity rates).'
        ],
        competencies: [
          'M11GM-Ia-1: Represents real-life situations using functions, including piece-wise functions.',
          'M11GM-Ia-2: Evaluates a function.',
          'M11GM-Ia-3: Performs addition, subtraction, multiplication, division, and composition of functions.',
          'M11GM-Ia-4: Solves problems involving functions.'
        ],
        priorKnowledge: 'Cartesian coordinate system, plotting points (x, y), evaluating linear algebraic expressions, and solving simple equations.'
      },
      learningExperience: {
        primingActivity: 'Vending Machine Analogy: When you press button B3, exactly one soda dispenses. If pressing B3 gave two different items at random, would the machine be functioning? Relate button input to exactly one output.',
        coreInstruction: 'Interactive direct instruction: Distinguish domain vs range; demonstrate the vertical line test; model step-by-step function composition (f ∘ g)(x) = f(g(x)) and piecewise jeepney fare functions.',
        guidedExercises: 'Collaborative problem solving on evaluating composite functions (f ∘ g)(3) and graphing piecewise taxi rates in pairs.',
        keyFormulas: [
          { name: 'Function Rule', formula: 'f(x) = y', explanation: 'Each input x in the domain corresponds to exactly one output y in the range.' },
          { name: 'Composite Function', formula: '(f ∘ g)(x) = f(g(x))', explanation: 'Substitute the inner function g(x) into the outer function f(x).' },
          { name: 'Piecewise Function Model', formula: 'F(d) = { 12 if d ≤ 4; 12 + 1.50(d - 4) if d > 4 }', explanation: 'Functions defined across piecewise interval conditions of the domain.' },
          { name: 'Function Operations', formula: '(f ± g)(x) = f(x) ± g(x), (f · g)(x) = f(x) · g(x)', explanation: 'Standard algebraic combinations of functions.' }
        ]
      },
      assessingLearning: {
        formativeAssessment: 'Quick board check on evaluating f(g(2)) where f(x) = 2x + 1 and g(x) = x² - 3, followed by a vertical line test check on 4 graphs.',
        diagnosticQuizPlan: '5-item adaptive Functions Diagnostic Quiz with progressive hints for domain checks, composite evaluation, and piecewise interval selection.',
        successThreshold: '75% mastery benchmark across all 5 Intended Learning Outcomes.',
        summativeAssessmentPlan: '10-item Unit 1 Summative Examination aligned with DepEd Table of Specifications (TOS) measuring M11GM-Ia-1 through M11GM-Ia-4.'
      },
      waysForward: {
        nextSteps: 'Complete a student reflection log on how functional mappings model daily economic transactions (e.g. mobile data loads, grocery prices).',
        remediationAction: 'Color-coded substitution guides for composite functions, step-by-step domain restriction templates, and peer tutoring sessions.',
        enrichmentChallenge: 'Formulate an algorithmic piecewise function for Philippine progressive income tax brackets under the TRAIN Law.',
        realWorldCareers: ['Software Engineering', 'Financial Analysis', 'Actuarial Science', 'Data Analytics', 'Industrial Engineering']
      }
    },
    learningCompetencies: [
      'M11GM-Ia-1: Represents real-life situations using functions, including piece-wise functions.',
      'M11GM-Ia-2: Evaluates a function.',
      'M11GM-Ia-3: Performs addition, subtraction, multiplication, division, and composition of functions.',
      'M11GM-Ia-4: Solves problems involving functions.'
    ],
    objectives: {
      cognitive: 'Distinguish between relations and functions, evaluate function values, and compute composite functions with high accuracy.',
      psychomotor: 'Perform vertical line tests on coordinate graphs and execute multi-step algebraic substitutions systematically.',
      affective: 'Appreciate the practical utility of piecewise and composite functions in daily utility billing, transportation fares, and economics.'
    },
    materialsNeeded: [
      'Graphing software or coordinate grid paper',
      'Piecewise function scenario cards (jeepney fares, mobile load promo tiers)',
      'Calculators and whiteboard markers'
    ],
    keyConcepts: [
      { term: 'Relation', definition: 'A set of ordered pairs (x, y) relating values from domain to range.' },
      { term: 'Function', definition: 'A special relation where each input x corresponds to exactly one output y.', formula: 'f(x) = y' },
      { term: 'Piecewise Function', definition: 'A function defined by multiple sub-functions, each applying to a specific interval of the domain.' },
      { term: 'Function Composition', definition: 'Applying one function to the result of another function.', formula: '(f ∘ g)(x) = f(g(x))' }
    ],
    workedExamples: [
      {
        title: 'Evaluating Composite Functions',
        problem: 'Given f(x) = 3x - 1 and g(x) = x² + 2, evaluate (f ∘ g)(3).',
        stepByStepSolution: [
          'Step 1: Compute the inner function g(3) first: g(3) = 3² + 2 = 9 + 2 = 11.',
          'Step 2: Substitute the result 11 into the outer function f(x): f(11) = 3(11) - 1.',
          'Step 3: Perform multiplication and subtraction: 33 - 1 = 32.',
          'Conclusion: (f ∘ g)(3) = 32.'
        ]
      },
      {
        title: 'Real-World Piecewise Function (Jeepney Fare Model)',
        problem: 'A public jeepney charges ₱12.00 for the first 4 kilometers and ₱1.50 for each additional kilometer. Express the total fare F(d) as a function of travel distance d.',
        stepByStepSolution: [
          'Step 1: For distance 0 < d ≤ 4 km, the fare is fixed at F(d) = 12.',
          'Step 2: For distance d > 4 km, the additional distance beyond 4 km is (d - 4) km.',
          'Step 3: Each additional kilometer costs ₱1.50, so add 1.50(d - 4) to the base ₱12.00.',
          'Conclusion: F(d) = { 12 if 0 < d ≤ 4; 12 + 1.50(d - 4) if d > 4 }.'
        ]
      }
    ],
    procedures: [
      {
        phase: 'Motivation / Priming',
        durationMinutes: 10,
        teacherActivity: 'Present a vending machine analogy and ask students to analyze whether button presses that produce multiple drinks constitute a function.',
        studentActivity: 'Discuss in pairs and formulate an informal definition of a function where each input leads to a unique output.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Direct Instruction',
        durationMinutes: 20,
        teacherActivity: 'Introduce domain/range notation, demonstrate the vertical line test on four graph types, and derive composite function substitution.',
        studentActivity: 'Take notes, verify vertical line tests on graph sketches, and solve example problems along with the teacher.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Guided Practice',
        durationMinutes: 15,
        teacherActivity: 'Circulate as pairs solve composite function cards and formulate piecewise equations for tricycle fare zones.',
        studentActivity: 'Work with assigned study partners, compare step-by-step substitutions, and justify piecewise interval splits.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Independent Practice / Assessment',
        durationMinutes: 10,
        teacherActivity: 'Administer the 5-item adaptive Diagnostic Quiz on Functions & Relations.',
        studentActivity: 'Complete items independently, utilizing progressive hints when misconceptions arise.',
        ilawPillar: 'A - Assessing Learning'
      },
      {
        phase: 'Generalization & Homework',
        durationMinutes: 5,
        teacherActivity: 'Synthesize the day’s learning: emphasize that (f ∘ g)(x) ≠ (g ∘ f)(x) in general, and assign the reflection log.',
        studentActivity: 'Write a 1-sentence synthesis and record the reflection assignment in their study log.',
        ilawPillar: 'W - Ways Forward'
      }
    ],
    differentiation: {
      remediation: 'Provide color-coded step-by-step function evaluation cards, domain interval number-line visuals, and peer tutoring.',
      enrichment: 'Formulate an algorithmic piecewise function for Philippine progressive income tax brackets under the TRAIN Law.'
    },
    assessmentPlan: 'Formative board work check, 5-item adaptive Diagnostic Quiz, and 10-item TOS-aligned Summative Assessment.'
  },

  'trig': {
    id: 'lp-trig',
    topicId: 'trig',
    title: 'DepEd ILAW Lesson Plan: Trigonometric Ratios, Identities & Waves',
    gradeLevel: 'Grade 11 - General Mathematics & Precalculus',
    duration: '60 minutes',
    subject: 'Trigonometry & Precalculus',
    term: 'Term 1',
    week: 'Week 3',
    dates: 'Aug. 24-28, 2026',
    section: 'Grade 11 – Gauss (6:00 AM – 7:00 AM)',
    doOrderRef: 'DepEd MATATAG / D.O. No. 016, s.2026',
    weeklySchedule: [
      { day: 'MONDAY', date: 'Aug. 24, 2026', lessonTitle: 'SOH-CAH-TOA and Fundamental Trigonometric Ratios', activityType: 'Whole Class', objective: 'Define the 6 trigonometric ratios in right triangles.' },
      { day: 'TUESDAY', date: 'Aug. 25, 2026', lessonTitle: 'Unit Circle and Angles in Standard Position', activityType: 'Group Work', objective: 'Determine coordinates on the unit circle for special angles (30°, 45°, 60°).' },
      { day: 'WEDNESDAY', date: 'Aug. 26, 2026', lessonTitle: 'Pythagorean and Quotient Identities', activityType: 'Pair Work', objective: 'Apply sin²θ + cos²θ = 1 to solve trigonometric equations.' },
      { day: 'THURSDAY', date: 'Aug. 27, 2026', lessonTitle: 'Sinusoidal Wave Functions & Periodicity', activityType: 'Whole Class', objective: 'Determine amplitude, period, and phase shift of y = A sin(Bx - C) + D.' },
      { day: 'FRIDAY', date: 'Aug. 28, 2026', lessonTitle: 'Real-Life Trigonometry: Triangulation & Wave Applications', activityType: 'Individual Work', objective: 'Solve real-world triangulation and sound wave modeling problems.' }
    ],
    references: [
      'DepEd Senior High School General Mathematics Curriculum Guide',
      'DepEd Precalculus Learner’s Material',
      'CHED Teaching Guide for Senior High School - General Mathematics'
    ],
    prerequisites: ['Pythagorean Theorem', 'Cartesian Coordinates', 'Right Triangles & Radian Measure'],
    framework: 'ILAW',
    ilaw: {
      intentions: {
        learningIntentions: 'Master fundamental trigonometric ratios, unit circle mappings, Pythagorean identities, and sinusoidal wave functions in Grade 11 Mathematics.',
        successCriteria: [
          'Determine the exact values of the six trigonometric ratios for any right triangle.',
          'Compute exact trigonometric functions for unit circle angles in degrees and radians.',
          'Simplify expressions and verify trigonometric identities using Pythagorean and reciprocal laws.',
          'Model periodic phenomena (sound, tides, alternating current) using sinusoidal wave equations.'
        ],
        competencies: [
          'M9GE-IVe-1: Illustrates angles of elevation and angles of depression.',
          'STEM_PC11T-IIa-1: Illustrates the different circular functions.',
          'STEM_PC11T-IIa-2: Uses reference angles to find exact values of circular functions.',
          'STEM_PC11T-IIb-1: Graphs circular functions: sine, cosine, and tangent.'
        ],
        priorKnowledge: 'Pythagorean Theorem (a² + b² = c²), angle measurement in degrees and radians, and basic algebraic simplification.'
      },
      learningExperience: {
        primingActivity: 'Shadow measurement challenge: Estimate the height of a flagpole or school building using the shadow length and angle of elevation with a cardboard clinometer.',
        coreInstruction: 'Interactive trigonometric triangle modeling: Derivation of SOH-CAH-TOA, unit circle coordinates (cos θ, sin θ), fundamental identities, and sinusoidal parameters A (amplitude) and T = 2π/B (period).',
        guidedExercises: 'Collaborative problem solving on finding missing sides, verifying Pythagorean identity sin²θ + cos²θ = 1, and analyzing wave graphs.',
        keyFormulas: [
          { name: 'SOH-CAH-TOA', formula: 'sin θ = opp/hyp, cos θ = adj/hyp, tan θ = opp/adj', explanation: 'Ratios of sides in a right triangle relative to angle θ.' },
          { name: 'Pythagorean Identity', formula: 'sin²θ + cos²θ = 1', explanation: 'Fundamental relation linking sine and cosine for any angle θ.' },
          { name: 'Sinusoidal Wave Period', formula: 'Period T = 2π / |B|', explanation: 'Length of one full wave cycle for y = A sin(Bx - C) + D.' },
          { name: 'Reciprocal Identities', formula: 'csc θ = 1/sin θ, sec θ = 1/cos θ, cot θ = 1/tan θ', explanation: 'Reciprocal ratios for secondary trigonometric functions.' }
        ]
      },
      assessingLearning: {
        formativeAssessment: 'Quick whiteboard check on finding cos(150°) using reference angles, and identifying the period of 4 sin(3x - π) + 2.',
        diagnosticQuizPlan: '5-item adaptive Trigonometry Diagnostic Quiz with progressive hints for triangle ratios, identities, and wave periods.',
        successThreshold: '75% mastery benchmark across all trigonometric competencies.',
        summativeAssessmentPlan: '10-item Unit Summative Examination aligned with DepEd Table of Specifications (TOS) measuring recall, procedural execution, and contextual triangulation modeling.'
      },
      waysForward: {
        nextSteps: 'Create a student reflection log on how triangulation is used in modern GPS and telecommunications cell towers.',
        remediationAction: 'Color-coded SOH-CAH-TOA reference cards, quadrant sign mnemonics (CAST / All Students Take Calculus), and 1-on-1 peer mentoring.',
        enrichmentChallenge: 'Solve the ambiguous case (SSA) in oblique triangle surveying and model sound wave harmonic resonance.',
        realWorldCareers: ['Civil Engineering', 'Architecture', 'Aviation & Navigation', 'Telecommunications', 'Audio Engineering']
      }
    },
    learningCompetencies: [
      'M9GE-IVe-1: Illustrates angles of elevation and angles of depression.',
      'STEM_PC11T-IIa-1: Illustrates the different circular functions.',
      'STEM_PC11T-IIa-2: Uses reference angles to find exact values of circular functions.',
      'STEM_PC11T-IIb-1: Graphs circular functions: sine, cosine, and tangent.'
    ],
    objectives: {
      cognitive: 'Explain the definitions of circular functions and evaluate trigonometric values accurately.',
      psychomotor: 'Draw unit circle angles and solve trigonometric identity proofs step-by-step.',
      affective: 'Recognize the indispensable role of trigonometry in land surveying, navigation, and modern acoustics.'
    },
    materialsNeeded: [
      'Scientific calculators',
      'Unit circle reference diagrams',
      'Graphing paper or dynamic graphing tools'
    ],
    keyConcepts: [
      { term: 'SOH-CAH-TOA', definition: 'Mnemonic for the primary trigonometric ratios: Sine = Opp/Hyp, Cosine = Adj/Hyp, Tangent = Opp/Adj.' },
      { term: 'Unit Circle', definition: 'A circle of radius 1 centered at the origin (0,0) where any point is given by (cos θ, sin θ).' },
      { term: 'Pythagorean Identity', definition: 'The equation sin²θ + cos²θ = 1 expressing the relationship between sine and cosine.', formula: 'sin²θ + cos²θ = 1' },
      { term: 'Sinusoidal Wave Period', definition: 'The horizontal length required to complete one full cycle of a sine or cosine graph.', formula: 'T = 2π / |B|' }
    ],
    workedExamples: [
      {
        title: 'Finding Cosine from Sine using Pythagorean Identity',
        problem: 'In a right triangle, if sin(θ) = 3/5, find the exact value of cos(θ).',
        stepByStepSolution: [
          'Step 1: Write down the fundamental Pythagorean identity: sin²(θ) + cos²(θ) = 1.',
          'Step 2: Substitute sin(θ) = 3/5: (3/5)² + cos²(θ) = 1.',
          'Step 3: Square the fraction: 9/25 + cos²(θ) = 1.',
          'Step 4: Subtract 9/25 from both sides: cos²(θ) = 1 - 9/25 = 16/25.',
          'Step 5: Take the principal square root: cos(θ) = √(16/25) = 4/5.',
          'Conclusion: The exact value of cos(θ) is 4/5.'
        ]
      },
      {
        title: 'Determining Amplitude and Period of a Sine Wave',
        problem: 'Find the amplitude and period of the sinusoidal function f(x) = 4 sin(3x - π) + 2.',
        stepByStepSolution: [
          'Step 1: Compare f(x) to standard form y = A sin(Bx - C) + D.',
          'Step 2: Identify A = 4, B = 3, C = π, and D = 2.',
          'Step 3: The amplitude is given by |A| = |4| = 4.',
          'Step 4: The period is given by T = 2π / |B| = 2π / 3.',
          'Conclusion: Amplitude = 4, Period = 2π/3 radians.'
        ]
      }
    ],
    procedures: [
      {
        phase: 'Motivation / Priming',
        durationMinutes: 10,
        teacherActivity: 'Present a real-world scenario of estimating the height of a cellular communication tower using an angle of elevation measured from ground level.',
        studentActivity: 'Sketch the right triangle representation and formulate initial hypotheses on which ratio relates the opposite height to adjacent ground distance.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Direct Instruction',
        durationMinutes: 20,
        teacherActivity: 'Derive SOH-CAH-TOA, introduce the unit circle coordinates (cos θ, sin θ), and explain the Pythagorean identity sin²θ + cos²θ = 1.',
        studentActivity: 'Take guided notes, construct unit circle coordinate pairs for 30°, 45°, and 60°, and verify equations algebraically.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Guided Practice',
        durationMinutes: 15,
        teacherActivity: 'Facilitate pair work on evaluating composite trigonometric values and determining wave periods.',
        studentActivity: 'Solve practice problem cards in pairs, checking answers with peer partners.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Independent Practice / Assessment',
        durationMinutes: 10,
        teacherActivity: 'Administer 5-item adaptive diagnostic check and formative drill.',
        studentActivity: 'Complete the individual quiz items using progressive hints as needed.',
        ilawPillar: 'A - Assessing Learning'
      },
      {
        phase: 'Generalization & Homework',
        durationMinutes: 5,
        teacherActivity: 'Summarize key formulas and prompt reflection on real-world engineering applications.',
        studentActivity: 'Write a 2-sentence summary in their Leavien AI journal connecting trigonometry to modern technology.',
        ilawPillar: 'W - Ways Forward'
      }
    ],
    differentiation: {
      remediation: 'Provide color-coded SOH-CAH-TOA mnemonic guides, right triangle side labeling flashcards, and paired peer coaching.',
      enrichment: 'Investigate the ambiguous case (SSA) in oblique triangles and Fourier series approximation of square waves.'
    },
    assessmentPlan: 'Formative check on special angle evaluation and 5-item adaptive Trigonometry Diagnostic Quiz.'
  },

  'exp-log': {
    id: 'lp-exp-log',
    topicId: 'exp-log',
    title: 'DepEd ILAW Lesson Plan: Exponential & Logarithmic Functions',
    gradeLevel: 'Grade 11 - General Mathematics',
    duration: '60 minutes',
    subject: 'General Mathematics',
    term: 'Term 1',
    week: 'Week 2',
    dates: 'Aug. 17-21, 2026',
    section: 'Grade 11 – Gauss (6:00 AM – 7:00 AM)',
    doOrderRef: 'DepEd MATATAG / D.O. No. 016, s.2026',
    weeklySchedule: [
      { day: 'MONDAY', date: 'Aug. 17, 2026', lessonTitle: 'Introduction to Exponential Functions and Growth Models', activityType: 'Whole Class', objective: 'Distinguish between exponential functions, equations, and inequalities.' },
      { day: 'TUESDAY', date: 'Aug. 18, 2026', lessonTitle: 'Solving Exponential Equations and Inequalities', activityType: 'Group Work', objective: 'Solve equations of the form b^x = b^y by equating exponents.' },
      { day: 'WEDNESDAY', date: 'Aug. 19, 2026', lessonTitle: 'The Logarithmic Function as the Inverse of Exponential', activityType: 'Pair Work', objective: 'Rewrite exponential statements as logarithmic statements and vice versa.' },
      { day: 'THURSDAY', date: 'Aug. 20, 2026', lessonTitle: 'Laws of Logarithms: Product, Quotient, and Power Rules', activityType: 'Whole Class', objective: 'Apply logarithmic laws to expand and condense expressions.' },
      { day: 'FRIDAY', date: 'Aug. 21, 2026', lessonTitle: 'Real-Life Applications: Population Growth, Decay, and Compound Interest', activityType: 'Individual Work', objective: 'Solve real-world exponential growth, half-life decay, and Richter scale problems.' }
    ],
    references: [
      'DepEd Senior High School General Mathematics Curriculum Guide (MELCs)',
      'DepEd General Mathematics Learner’s Module on Exponential and Logarithmic Functions',
      'CHED Teaching Guide for Senior High School - General Mathematics'
    ],
    prerequisites: ['Laws of Exponents', 'Inverse Functions', 'Linear and Quadratic Equations'],
    framework: 'ILAW',
    ilaw: {
      intentions: {
        learningIntentions: 'Understand exponential and logarithmic relationships, apply the laws of logarithms, solve exponential and logarithmic equations, and model real-world growth, decay, and financial interest.',
        successCriteria: [
          'Convert fluently between exponential form b^y = x and logarithmic form log_b(x) = y.',
          'Apply product, quotient, and power rules of logarithms to simplify expressions.',
          'Solve exponential equations with like and unlike bases.',
          'Formulate exponential models for population growth, radioactive half-life, and compound interest.'
        ],
        competencies: [
          'M11GM-Ie-1: Represents real-life situations using exponential functions.',
          'M11GM-Ie-2: Distinguishes between exponential functions, exponential equations, and exponential inequalities.',
          'M11GM-Ie-3: Solves exponential equations and inequalities.',
          'M11GM-If-1: Represents real-life situations using logarithmic functions.',
          'M11GM-Ih-1: Applies the laws of logarithms to simplify expressions.'
        ],
        priorKnowledge: 'Laws of exponents (x^a · x^b = x^(a+b), (x^a)^b = x^(ab)), negative and zero exponents, and inverse functions.'
      },
      learningExperience: {
        primingActivity: 'Viral social media spread simulation: If 1 person shares a video with 3 friends, and each friend shares with 3 more each day, how many people see it by day 7? Compare linear vs. exponential doubling.',
        coreInstruction: 'Systematic instruction on the definition of logarithms (log_b(x) asks "b to what power equals x?"), graphical inversion of exponential curves, and the three fundamental laws of logarithms.',
        guidedExercises: 'Scaffolded pair exercises on expanding multi-term logarithms log(x³y/z) and solving bacterial growth equations A = P · e^(rt).',
        keyFormulas: [
          { name: 'Definition of Logarithm', formula: 'b^y = x ⟺ log_b(x) = y (b > 0, b ≠ 1)', explanation: 'Logarithm is the inverse of exponential exponentiation.' },
          { name: 'Product Rule', formula: 'log_b(xy) = log_b(x) + log_b(y)', explanation: 'The log of a product is the sum of the logs.' },
          { name: 'Quotient Rule', formula: 'log_b(x/y) = log_b(x) - log_b(y)', explanation: 'The log of a quotient is the difference of the logs.' },
          { name: 'Power Rule', formula: 'log_b(x^k) = k · log_b(x)', explanation: 'Exponents inside a log can be brought down as coefficients.' },
          { name: 'Exponential Growth Model', formula: 'A(t) = A₀ · e^(kt) or A(t) = A₀ · (1 + r)^t', explanation: 'Mathematical model for population, investments, or viral spread over time t.' }
        ]
      },
      assessingLearning: {
        formativeAssessment: 'Exit slip evaluation of log₂(32) and condensing log(x³) + log(y) - log(z).',
        diagnosticQuizPlan: '5-item adaptive Diagnostic Quiz assessing log definitions, rules, and exponential equations with progressive hints.',
        successThreshold: '75% mastery benchmark across all exponential and logarithmic competencies.',
        summativeAssessmentPlan: '10-item Unit Summative Examination measuring M11GM-Ie-1 through M11GM-Ih-1 aligned with DepEd TOS.'
      },
      waysForward: {
        nextSteps: 'Learner reflection journal on how logarithmic scales (Richter magnitude for earthquakes, pH for acidity, decibels for sound) protect human safety.',
        remediationAction: 'Exponent-to-log translation wheels, step-by-step algebraic substitution guides, and targeted peer-assisted drills.',
        enrichmentChallenge: 'Model the Philippine economic inflation rate using continuous compound interest and logistic population curves.',
        realWorldCareers: ['Data Science', 'Finance & Banking', 'Epidemiology / Public Health', 'Seismology', 'Acoustics & Sound Engineering']
      }
    },
    learningCompetencies: [
      'M11GM-Ie-1: Represents real-life situations using exponential functions.',
      'M11GM-Ie-2: Distinguishes between exponential functions, exponential equations, and exponential inequalities.',
      'M11GM-Ie-3: Solves exponential equations and inequalities.',
      'M11GM-If-1: Represents real-life situations using logarithmic functions.',
      'M11GM-Ih-1: Applies the laws of logarithms to simplify expressions.'
    ],
    objectives: {
      cognitive: 'Understand the reciprocal relationship between exponential and logarithmic forms and solve equations correctly.',
      psychomotor: 'Condense and expand logarithmic expressions accurately using algebraic laws.',
      affective: 'Appreciate how exponential and logarithmic equations govern financial interest, natural population growth, and earth science.'
    },
    materialsNeeded: [
      'Scientific calculators with log and ln keys',
      'Logarithmic law cheat sheets',
      'Graphing software or coordinate grid paper'
    ],
    keyConcepts: [
      { term: 'Exponential Function', definition: 'A function of the form f(x) = b^x where base b > 0 and b ≠ 1.', formula: 'f(x) = b^x' },
      { term: 'Logarithmic Function', definition: 'The inverse of an exponential function, giving the exponent to which a base must be raised.', formula: 'y = log_b(x)' },
      { term: 'Product Rule of Logarithms', definition: 'The log of a product equals the sum of the logs of its factors.', formula: 'log_b(MN) = log_b(M) + log_b(N)' },
      { term: 'Quotient Rule of Logarithms', definition: 'The log of a quotient equals the difference of the logs of numerator and denominator.', formula: 'log_b(M/N) = log_b(M) - log_b(N)' },
      { term: 'Power Rule of Logarithms', definition: 'The log of a number raised to a power equals the power multiplied by the log.', formula: 'log_b(M^p) = p · log_b(M)' }
    ],
    workedExamples: [
      {
        title: 'Evaluating Logarithms from the Definition',
        problem: 'Find the exact value of log₂(32).',
        stepByStepSolution: [
          'Step 1: Set the logarithmic expression equal to y: log₂(32) = y.',
          'Step 2: Rewrite in exponential form: 2^y = 32.',
          'Step 3: Express 32 as a power of 2: 32 = 2 · 2 · 2 · 2 · 2 = 2⁵.',
          'Step 4: Equate the exponents: y = 5.',
          'Conclusion: log₂(32) = 5.'
        ]
      },
      {
        title: 'Condensing Logarithms into a Single Expression',
        problem: 'Express log(x³) + log(y) - log(z) as a single logarithm.',
        stepByStepSolution: [
          'Step 1: Apply the Product Rule to the sum: log(x³) + log(y) = log(x³ · y).',
          'Step 2: Apply the Quotient Rule to the difference: log(x³y) - log(z) = log((x³y) / z).',
          'Conclusion: The condensed single logarithm is log((x³y) / z).'
        ]
      }
    ],
    procedures: [
      {
        phase: 'Motivation / Priming',
        durationMinutes: 10,
        teacherActivity: 'Display a bacteria doubling simulation: starting with 100 bacteria doubling every hour, ask how many will be present in 5 hours.',
        studentActivity: 'Calculate 100 · 2^t and discuss the rapid non-linear growth curve.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Direct Instruction',
        durationMinutes: 20,
        teacherActivity: 'Explain the definition of logarithm as the inverse of exponentiation and prove the three laws of logarithms on the board.',
        studentActivity: 'Record the laws, practice verbalizing "log base b of x equals the power", and solve along with the teacher.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Guided Practice',
        durationMinutes: 15,
        teacherActivity: 'Distribute paired cards requiring matching exponential statements with logarithmic equivalents.',
        studentActivity: 'Work with peers to match statements and condense multi-term logs.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Independent Practice / Assessment',
        durationMinutes: 10,
        teacherActivity: 'Assign the 5-item adaptive Diagnostic Quiz on Exponentials & Logs.',
        studentActivity: 'Complete the items independently, reviewing step explanations for any missed questions.',
        ilawPillar: 'A - Assessing Learning'
      },
      {
        phase: 'Generalization & Homework',
        durationMinutes: 5,
        teacherActivity: 'Guide students to summarize the power rule and assign real-world half-life problem sets.',
        studentActivity: 'Reflect on how compound interest in savings accounts relies on exponential functions.',
        ilawPillar: 'W - Ways Forward'
      }
    ],
    differentiation: {
      remediation: 'Provide exponential-to-logarithmic conversion charts, power-of-2 reference cards, and guided step templates.',
      enrichment: 'Explore natural logarithms (ln), Euler’s number e in continuous interest, and the pH scale in chemistry.'
    },
    assessmentPlan: 'Formative check on log laws and 5-item adaptive Exponentials & Logs Diagnostic Quiz.'
  },

  'term2-w1-piecewise': {
    id: 'lp-term2-w1',
    topicId: 'term2-w1-piecewise',
    title: 'DepEd ILAW Lesson Plan: Piecewise Functions in Context',
    gradeLevel: 'Grade 11 - General Mathematics',
    duration: '60 minutes',
    subject: 'General Mathematics',
    term: 'Term 2',
    week: 'Week 1',
    dates: 'Oct. 12-16, 2026',
    section: 'Grade 11 – Gauss (6:00 AM – 7:00 AM)',
    doOrderRef: 'DepEd MATATAG / D.O. No. 016, s.2026',
    weeklySchedule: [
      { day: 'MONDAY', date: 'Oct. 12, 2026', lessonTitle: 'Introduction to Piecewise Functions', activityType: 'Whole Class', objective: 'Define piecewise functions and identify domain intervals.' },
      { day: 'TUESDAY', date: 'Oct. 13, 2026', lessonTitle: 'Piecewise Functions in Fare Rates', activityType: 'Group Work', objective: 'Model transportation fare matrices as piecewise linear equations.' },
      { day: 'WEDNESDAY', date: 'Oct. 14, 2026', lessonTitle: 'Piecewise Functions in Purchasing', activityType: 'Pair Work', objective: 'Calculate bulk pricing discounts using piecewise step functions.' },
      { day: 'THURSDAY', date: 'Oct. 15, 2026', lessonTitle: 'Piecewise Functions in Income Tax Computation', activityType: 'Whole Class', objective: 'Evaluate progressive tax brackets using domain constraints.' },
      { day: 'FRIDAY', date: 'Oct. 16, 2026', lessonTitle: 'Word Problems Involving Piecewise Functions', activityType: 'Individual Work', objective: 'Solve contextual word problems and complete Performance Task 1.' }
    ],
    references: [
      'DepEd Senior High School General Mathematics Curriculum Guide (MELCs)',
      'DepEd General Mathematics Learner’s Material on Real-Life Functions',
      'LTFRB Official Public Utility Jeepney and Bus Fare Matrices'
    ],
    prerequisites: ['Linear Functions', 'Inequalities and Intervals', 'Cartesian Coordinates'],
    framework: 'ILAW',
    ilaw: {
      intentions: {
        learningIntentions: 'Formulate, evaluate, and solve real-world piecewise functions arising from transportation fare structures, electric power tier tariffs, and progressive taxation.',
        successCriteria: [
          'Identify domain conditions that define each piece of a piecewise function.',
          'Evaluate piecewise functions at boundary points and interior points.',
          'Graph piecewise functions with open and closed circles denoting boundary inclusion.',
          'Construct a mathematical piecewise model from real-world narrative conditions.'
        ],
        competencies: [
          'M11GM-Ia-1: Represents real-life situations using functions, including piece-wise functions.',
          'M11GM-Ia-4: Solves problems involving functions.'
        ],
        priorKnowledge: 'Linear equations y = mx + b, inequality intervals [a, b], (a, b], and plotting piecewise line segments.'
      },
      learningExperience: {
        primingActivity: 'Jeepney Fare Board Exploration: Analyze the LTFRB fare matrix displayed inside an actual Philippine jeepney. Why is the fare constant for the first 4 kilometers and increasing thereafter?',
        coreInstruction: 'Direct instruction on mathematical modeling of step functions and piecewise linear relations. Emphasize domain intervals (x ≤ a vs x > a) and boundary point evaluation.',
        guidedExercises: 'In pairs, write the piecewise function for Meralco residential electricity consumption tiered rates.',
        keyFormulas: [
          { name: 'Standard Piecewise Format', formula: 'f(x) = { g(x) if x ∈ D₁; h(x) if x ∈ D₂ }', explanation: 'Different mathematical rules apply depending on which domain partition x falls into.' },
          { name: 'LTFRB Fare Rule', formula: 'F(d) = { 13 if d ≤ 4; 13 + 1.80(d - 4) if d > 4 }', explanation: 'Base fare for minimum distance plus fixed increment per excess kilometer.' }
        ]
      },
      assessingLearning: {
        formativeAssessment: 'Evaluate F(3), F(4), and F(10) on the board using the student-generated piecewise fare equation.',
        diagnosticQuizPlan: '5-item Diagnostic Quiz checking interval identification and domain boundary evaluation with scaffolding hints.',
        successThreshold: '80% mastery benchmark on Performance Task 1 and formative checks.',
        summativeAssessmentPlan: 'Performance Task 1: Real-World Piecewise Modeling Project (20% grade weight).'
      },
      waysForward: {
        nextSteps: 'Create a personal household utility bill analysis comparing power consumption across billing tiers.',
        remediationAction: 'Interval number line charts to visualize which piece applies before substituting input values.',
        enrichmentChallenge: 'Model the 2026 Bureau of Internal Revenue (BIR) progressive withholding tax brackets as a 5-tier piecewise function.',
        realWorldCareers: ['Tariff & Utility Regulation', 'Transportation Planning', 'Tax Accounting', 'Operations Research']
      }
    },
    learningCompetencies: [
      'M11GM-Ia-1: Represents real-life situations using functions, including piece-wise functions.',
      'M11GM-Ia-4: Solves problems involving functions.'
    ],
    objectives: {
      cognitive: 'Formulate piecewise function equations from practical context statements.',
      psychomotor: 'Plot piecewise functions on Cartesian graphs accurately with proper boundary circles.',
      affective: 'Appreciate how mathematical models govern utility rates, fair taxation, and transport pricing.'
    },
    materialsNeeded: ['Graphing paper', 'Fare rate matrices', 'Calculators'],
    keyConcepts: [
      { term: 'Piecewise Function', definition: 'A function defined by multiple sub-functions over specific intervals.' },
      { term: 'Boundary Point', definition: 'The transition x-value where one sub-function ends and another begins.' }
    ],
    workedExamples: [
      {
        title: 'Tricycle Fare Piecewise Model',
        problem: 'A local tricycle driver charges ₱20 for the first 2 kilometers and ₱5 for every kilometer (or fraction thereof) thereafter. Formulate the piecewise function F(x) for travel distance x.',
        stepByStepSolution: [
          'Step 1: If 0 < x ≤ 2 km, the base fare is fixed at F(x) = 20.',
          'Step 2: If x > 2 km, the excess distance is (x - 2). The additional charge is 5(x - 2).',
          'Step 3: Combine base fare with additional charge: F(x) = 20 + 5(x - 2).',
          'Conclusion: F(x) = { 20 if 0 < x ≤ 2; 20 + 5(x - 2) if x > 2 }.'
        ]
      }
    ],
    procedures: [
      {
        phase: 'Motivation / Priming',
        durationMinutes: 10,
        teacherActivity: 'Present a real LTFRB fare matrix and ask what commuters pay for 2 km, 4 km, and 7 km.',
        studentActivity: 'Calculate costs and observe that fares do not increase continuously from 0 km.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Direct Instruction',
        durationMinutes: 20,
        teacherActivity: 'Define piecewise functions, demonstrate interval notation, and construct graphs with open and closed circles.',
        studentActivity: 'Sketch graphs and take notes on evaluating domain inequalities.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Guided Practice',
        durationMinutes: 15,
        teacherActivity: 'Supervise pair problem solving on cell phone call rate tier models.',
        studentActivity: 'Formulate piecewise models in pairs and critique partner solutions.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Independent Practice / Assessment',
        durationMinutes: 10,
        teacherActivity: 'Distribute 3-item formative piecewise evaluation worksheet.',
        studentActivity: 'Solve items individually and submit for check.',
        ilawPillar: 'A - Assessing Learning'
      },
      {
        phase: 'Generalization & Homework',
        durationMinutes: 5,
        teacherActivity: 'Summarize the importance of domain boundaries and explain Performance Task 1 instructions.',
        studentActivity: 'Note guidelines for Performance Task 1 modeling portfolio.',
        ilawPillar: 'W - Ways Forward'
      }
    ],
    differentiation: {
      remediation: 'Provide interval substitution templates with visual number line markers.',
      enrichment: 'Formulate multi-tier progressive tax rate equations.'
    },
    assessmentPlan: 'Performance Task 1 submission and 5-item Friday formative check.'
  },

  'term2-w2-statistics': {
    id: 'lp-term2-w2',
    topicId: 'term2-w2-statistics',
    title: 'DepEd ILAW Lesson Plan: Statistics, Central Tendency & Variability',
    gradeLevel: 'Grade 11 - Statistics & Probability',
    duration: '60 minutes',
    subject: 'Statistics & Probability',
    term: 'Term 2',
    week: 'Week 2',
    dates: 'Oct. 19-23, 2026',
    section: 'Grade 11 – Gauss (6:00 AM – 7:00 AM)',
    doOrderRef: 'DepEd MATATAG / D.O. No. 016, s.2026',
    weeklySchedule: [
      { day: 'MONDAY', date: 'Oct. 19, 2026', lessonTitle: 'Introduction to Central Tendency & Data Types', activityType: 'Whole Class', objective: 'Distinguish between grouped and ungrouped datasets and identify mean, median, mode.' },
      { day: 'TUESDAY', date: 'Oct. 20, 2026', lessonTitle: 'Calculating Mean, Median, and Mode for Grouped Data', activityType: 'Group Work', objective: 'Apply midpoint and cumulative frequency formulas to grouped data tables.' },
      { day: 'WEDNESDAY', date: 'Oct. 21, 2026', lessonTitle: 'Measures of Variability & Range Computation', activityType: 'Pair Work', objective: 'Calculate range and interquartile range for sample datasets.' },
      { day: 'THURSDAY', date: 'Oct. 22, 2026', lessonTitle: 'Variance & Standard Deviation in Sample Sets', activityType: 'Whole Class', objective: 'Compute sample variance s² and sample standard deviation s.' },
      { day: 'FRIDAY', date: 'Oct. 23, 2026', lessonTitle: 'Statistical Interpretation & Survey Data Presentation', activityType: 'Individual Work', objective: 'Analyze survey results and draw statistical conclusions for Performance Task 2.' }
    ],
    references: [
      'DepEd Senior High School Statistics and Probability Curriculum Guide',
      'DepEd Teaching Guide for Senior High School: Statistics and Probability',
      'Philippine Statistics Authority (PSA) Educational Resource Data'
    ],
    prerequisites: ['Frequency Distribution Tables', 'Basic Arithmetic', 'Summation Notation Σ'],
    framework: 'ILAW',
    ilaw: {
      intentions: {
        learningIntentions: 'Calculate, interpret, and compare measures of central tendency and dispersion for grouped and ungrouped statistical datasets.',
        successCriteria: [
          'Compute mean, median, and mode for ungrouped and grouped frequency distributions.',
          'Calculate sample variance (s²) and sample standard deviation (s) using step-by-step deviations.',
          'Interpret the meaning of standard deviation in assessing the consistency of student scores or economic data.',
          'Formulate evidence-based conclusions from statistical survey reports.'
        ],
        competencies: [
          'M11/12SP-IIIa-1: Computes mean, variance, and standard deviation.',
          'M11/12SP-IIIa-2: Interprets the mean and the variance of a discrete probability distribution or dataset.'
        ],
        priorKnowledge: 'Basic summation Σx, constructing frequency tables, and calculating averages.'
      },
      learningExperience: {
        primingActivity: 'Two Basketball Teams Comparison: Team A and Team B both score an average of 80 points per game. But Team A scores between 78-82 points every game, while Team B scores between 50-110 points. Which team is more consistent? Introduce variability.',
        coreInstruction: 'Direct instruction on formulas for mean (x̄ = Σx / n), sample variance s² = Σ(x - x̄)² / (n - 1), and standard deviation s = √s².',
        guidedExercises: 'Worksheet drill calculating standard deviation for 10 quiz scores using a 4-column deviation table.',
        keyFormulas: [
          { name: 'Sample Mean', formula: 'x̄ = (Σ x) / n', explanation: 'Arithmetic average of all data points in a sample.' },
          { name: 'Sample Variance', formula: 's² = Σ (x - x̄)² / (n - 1)', explanation: 'Average squared deviation from the mean (Bessel’s correction n-1).' },
          { name: 'Standard Deviation', formula: 's = √s²', explanation: 'Measure of the average spread of values in the original units of measurement.' }
        ]
      },
      assessingLearning: {
        formativeAssessment: 'Calculate the variance and standard deviation of {4, 8, 6, 5, 7} on the whiteboard.',
        diagnosticQuizPlan: '5-item adaptive Diagnostic Quiz assessing mean vs median sensitivity to outliers and standard deviation calculation.',
        successThreshold: '80% mastery benchmark on Performance Task 2.',
        summativeAssessmentPlan: 'Performance Task 2: Statistical Survey & Data Analysis Report (20% grade weight).'
      },
      waysForward: {
        nextSteps: 'Conduct a classroom survey on daily study hours and calculate mean and standard deviation.',
        remediationAction: 'Pre-printed deviation tables with columns for x, (x - x̄), and (x - x̄)² to prevent calculation slips.',
        enrichmentChallenge: 'Analyze box-and-whisker plots and interquartile range (IQR) outlier detection for skewed income distributions.',
        realWorldCareers: ['Market Research', 'Quality Assurance Engineering', 'Epidemiology', 'Financial Risk Consulting', 'Sports Analytics']
      }
    },
    learningCompetencies: [
      'M11/12SP-IIIa-1: Computes mean, variance, and standard deviation.',
      'M11/12SP-IIIa-2: Interprets the mean and the variance.'
    ],
    objectives: {
      cognitive: 'Differentiate between measures of central tendency and dispersion, and explain standard deviation.',
      psychomotor: 'Calculate sample variance and standard deviation systematically using deviation tables.',
      affective: 'Value data-driven objectivity and appreciate statistical consistency in science and society.'
    },
    materialsNeeded: ['Scientific calculators', 'Sample survey datasets', 'Frequency table worksheets'],
    keyConcepts: [
      { term: 'Mean', definition: 'The arithmetic average of a dataset.', formula: 'x̄ = Σx / n' },
      { term: 'Standard Deviation', definition: 'A measure of the amount of variation or dispersion of a set of values.', formula: 's = √(Σ(x - x̄)² / (n - 1))' }
    ],
    workedExamples: [
      {
        title: 'Calculating Sample Standard Deviation',
        problem: 'Find the sample standard deviation of the scores: 4, 8, 6, 5, 7.',
        stepByStepSolution: [
          'Step 1: Compute the mean x̄: (4 + 8 + 6 + 5 + 7) / 5 = 30 / 5 = 6.',
          'Step 2: Find deviations (x - x̄): 4-6 = -2; 8-6 = 2; 6-6 = 0; 5-6 = -1; 7-6 = 1.',
          'Step 3: Square deviations (x - x̄)²: (-2)² = 4; 2² = 4; 0² = 0; (-1)² = 1; 1² = 1.',
          'Step 4: Sum squared deviations: 4 + 4 + 0 + 1 + 1 = 10.',
          'Step 5: Divide by n - 1 = 5 - 1 = 4: s² = 10 / 4 = 2.5.',
          'Step 6: Take the square root: s = √2.5 ≈ 1.58.',
          'Conclusion: The sample standard deviation is approximately 1.58.'
        ]
      }
    ],
    procedures: [
      {
        phase: 'Motivation / Priming',
        durationMinutes: 10,
        teacherActivity: 'Compare basketball player scoring consistency with equal averages but disparate point spreads.',
        studentActivity: 'Evaluate which player a coach should rely on and define consistency in terms of spread.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Direct Instruction',
        durationMinutes: 20,
        teacherActivity: 'Demonstrate calculation of mean, variance, and standard deviation using a 4-column structured table.',
        studentActivity: 'Copy table format and compute deviations for a sample set along with the instructor.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Guided Practice',
        durationMinutes: 15,
        teacherActivity: 'Facilitate pair practice calculating standard deviation for class quiz results.',
        studentActivity: 'Complete deviation tables in pairs and verify row sums equal 0.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Independent Practice / Assessment',
        durationMinutes: 10,
        teacherActivity: 'Administer 5-item adaptive Diagnostic Quiz on statistics.',
        studentActivity: 'Answer items independently and review step solutions.',
        ilawPillar: 'A - Assessing Learning'
      },
      {
        phase: 'Generalization & Homework',
        durationMinutes: 5,
        teacherActivity: 'Summarize why standard deviation is preferred over range and introduce Performance Task 2 guidelines.',
        studentActivity: 'Record survey data collection instructions for Performance Task 2.',
        ilawPillar: 'W - Ways Forward'
      }
    ],
    differentiation: {
      remediation: 'Provide guided variance calculation templates with fill-in-the-blank columns.',
      enrichment: 'Explore Chebyshev’s theorem for arbitrary distributions.'
    },
    assessmentPlan: 'Performance Task 2 presentation and weekly formative drill.'
  },

  'term2-w3-trig-right': {
    id: 'lp-term2-w3',
    topicId: 'term2-w3-trig-right',
    title: 'DepEd ILAW Lesson Plan: Right Triangle Trigonometry & Elevation/Depression',
    gradeLevel: 'Grade 11 - General Mathematics',
    duration: '60 minutes',
    subject: 'General Mathematics',
    term: 'Term 2',
    week: 'Week 3',
    dates: 'Oct. 26-30, 2026',
    section: 'Grade 11 – Gauss (6:00 AM – 7:00 AM)',
    doOrderRef: 'DepEd MATATAG / D.O. No. 016, s.2026',
    weeklySchedule: [
      { day: 'MONDAY', date: 'Oct. 26, 2026', lessonTitle: 'Primary Trigonometric Ratios (Sine, Cosine, Tangent)', activityType: 'Whole Class', objective: 'Define opposite, adjacent, hypotenuse and primary ratios.' },
      { day: 'TUESDAY', date: 'Oct. 27, 2026', lessonTitle: 'Solving Right Triangles with SOH-CAH-TOA', activityType: 'Pair Work', objective: 'Find unknown side lengths and acute angles in right triangles.' },
      { day: 'WEDNESDAY', date: 'Oct. 28, 2026', lessonTitle: 'Angles of Elevation and Depression', activityType: 'Group Work', objective: 'Model vertical observation angles in real-world contexts.' },
      { day: 'THURSDAY', date: 'Oct. 29, 2026', lessonTitle: 'Practical Applications of Right Triangles', activityType: 'Whole Class', objective: 'Solve multi-step height and distance word problems.' },
      { day: 'FRIDAY', date: 'Oct. 30, 2026', lessonTitle: 'Formative Right Triangle Drill & Problem Solving', activityType: 'Individual Work', objective: 'Complete formative right triangle assessment.' }
    ],
    references: [
      'DepEd Senior High School General Mathematics Curriculum Guide',
      'DepEd Grade 9 Mathematics Learner’s Module on Right Triangle Trigonometry',
      'Philippine Surveying & Mapping Field Manual'
    ],
    prerequisites: ['Pythagorean Theorem', 'Angle Measurement', 'Similar Triangles'],
    framework: 'ILAW',
    ilaw: {
      intentions: {
        learningIntentions: 'Apply trigonometric ratios (sine, cosine, tangent) to solve right triangles and practical problems involving angles of elevation and depression.',
        successCriteria: [
          'Correctly label opposite, adjacent, and hypotenuse relative to a designated acute angle.',
          'Distinguish clearly between angles of elevation (looking up) and depression (looking down from the horizontal).',
          'Select and apply the appropriate ratio (sin, cos, or tan) to solve for missing heights or distances.',
          'Solve real-world indirect measurement word problems.'
        ],
        competencies: [
          'M9GE-IVe-1: Illustrates angles of elevation and angles of depression.',
          'M9GE-IVe-2: Uses trigonometric ratios to solve real-life problems involving right triangles.'
        ],
        priorKnowledge: 'Pythagorean Theorem a² + b² = c², properties of right triangles (sum of angles = 180°), and solving linear proportions.'
      },
      learningExperience: {
        primingActivity: 'Lighthouse & Ship Simulation: A lighthouse keeper 50 meters above sea level spots a distress boat at an angle of depression of 25°. How far from the lighthouse base is the boat? Sketch the horizontal line of sight.',
        coreInstruction: 'Systematic instruction on SOH-CAH-TOA, distinguishing angle of elevation from angle of depression, and emphasizing that alternate interior angles make angle of depression equal to angle of elevation from the observer below.',
        guidedExercises: 'Pair activity: Calculate the height of the school basketball hoop or flagpole using clinometer angle measurements.',
        keyFormulas: [
          { name: 'Tangent Ratio', formula: 'tan θ = Opposite / Adjacent', explanation: 'Used when horizontal distance and vertical height are involved.' },
          { name: 'Sine Ratio', formula: 'sin θ = Opposite / Hypotenuse', explanation: 'Used when line-of-sight distance or cable length is given or required.' },
          { name: 'Cosine Ratio', formula: 'cos θ = Adjacent / Hypotenuse', explanation: 'Used when horizontal distance and hypotenuse are involved.' }
        ]
      },
      assessingLearning: {
        formativeAssessment: 'Whiteboard check: An observer 30 m from a tree measures an angle of elevation of 40°. Find the height of the tree.',
        diagnosticQuizPlan: '5-item adaptive Diagnostic Quiz assessing triangle labeling, ratio selection, and elevation/depression calculations.',
        successThreshold: '75% mastery benchmark on right triangle problem sets.',
        summativeAssessmentPlan: '10-item Right Triangle Trigonometry assessment aligned with DepEd TOS.'
      },
      waysForward: {
        nextSteps: 'Build an inexpensive cardboard protractor-and-straw clinometer to measure real buildings.',
        remediationAction: 'Triangle orientation drill cards where triangles are rotated to practice identifying opposite and adjacent sides.',
        enrichmentChallenge: 'Solve two-observer problems where two observers at different distances view the same mountain peak.',
        realWorldCareers: ['Land Surveying', 'Civil Engineering', 'Aviation Flight Navigation', 'Architecture', 'Forestry']
      }
    },
    learningCompetencies: [
      'M9GE-IVe-1: Illustrates angles of elevation and angles of depression.',
      'M9GE-IVe-2: Uses trigonometric ratios to solve real-life problems involving right triangles.'
    ],
    objectives: {
      cognitive: 'Identify opposite, adjacent, and hypotenuse sides correctly and formulate trigonometric equations.',
      psychomotor: 'Solve right triangle side lengths and angles using trigonometric functions on calculators.',
      affective: 'Recognize trigonometric applications in architecture, navigation, and surveying.'
    },
    materialsNeeded: ['Clinometers', 'Scientific calculators', 'Measuring tapes'],
    keyConcepts: [
      { term: 'Angle of Elevation', definition: 'The angle between the horizontal line of sight and the observer’s line of sight looking upward.' },
      { term: 'Angle of Depression', definition: 'The angle between the horizontal line of sight and the observer’s line of sight looking downward.' }
    ],
    workedExamples: [
      {
        title: 'Finding the Height of a Flagpole',
        problem: 'A student stands 15 meters from the base of a school flagpole. The angle of elevation to the top of the pole is 36°. If the student’s eye level is 1.5 meters above ground, how tall is the flagpole?',
        stepByStepSolution: [
          'Step 1: Identify given information: adjacent side = 15 m, angle θ = 36°, eye level = 1.5 m.',
          'Step 2: Choose the trigonometric ratio: tan(θ) = opposite / adjacent.',
          'Step 3: Substitute known values: tan(36°) = h / 15.',
          'Step 4: Solve for h: h = 15 · tan(36°) = 15 · (0.7265) ≈ 10.90 m.',
          'Step 5: Add eye level height: Total height = 10.90 + 1.50 = 12.40 m.',
          'Conclusion: The flagpole is approximately 12.4 meters tall.'
        ]
      }
    ],
    procedures: [
      {
        phase: 'Motivation / Priming',
        durationMinutes: 10,
        teacherActivity: 'Display a picture of a surveyor with a theodolite and ask how engineers measure tall bridges without climbing them.',
        studentActivity: 'Brainstorm how angles and horizontal distances relate to height.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Direct Instruction',
        durationMinutes: 20,
        teacherActivity: 'Define angles of elevation and depression, prove they are equal alternate interior angles, and solve a worked example.',
        studentActivity: 'Draw diagrams, label horizontal lines of sight, and solve along in notebooks.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Guided Practice',
        durationMinutes: 15,
        teacherActivity: 'Circulate as pairs solve lighthouse and airplane altitude word problems.',
        studentActivity: 'Diagram scenarios, identify correct ratios, and calculate answers.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Independent Practice / Assessment',
        durationMinutes: 10,
        teacherActivity: 'Administer formative right triangle drill.',
        studentActivity: 'Complete 3 right triangle items independently.',
        ilawPillar: 'A - Assessing Learning'
      },
      {
        phase: 'Generalization & Homework',
        durationMinutes: 5,
        teacherActivity: 'Review common pitfalls: confusing angle of depression with angle from the vertical wall.',
        studentActivity: 'Note rule: angles of depression are ALWAYS measured from the horizontal line of sight.',
        ilawPillar: 'W - Ways Forward'
      }
    ],
    differentiation: {
      remediation: 'Provide color-coded triangle labeling practice with right-angle reference markers.',
      enrichment: 'Clinometer height measurement exercise for school structures.'
    },
    assessmentPlan: 'Formative right triangle quiz and diagnostic checks.'
  },

  'term2-w4-trig-oblique': {
    id: 'lp-term2-w4',
    topicId: 'term2-w4-trig-oblique',
    title: 'DepEd ILAW Lesson Plan: Oblique Triangles, Law of Sines & Cosines',
    gradeLevel: 'Grade 11 - General Mathematics',
    duration: '60 minutes',
    subject: 'General Mathematics',
    term: 'Term 2',
    week: 'Week 4',
    dates: 'Nov. 02-06, 2026',
    section: 'Grade 11 – Gauss (6:00 AM – 7:00 AM)',
    doOrderRef: 'DepEd MATATAG / D.O. No. 016, s.2026',
    weeklySchedule: [
      { day: 'MONDAY', date: 'Nov. 02, 2026', lessonTitle: 'Introduction to Oblique Triangles & SSA / SAS Cases', activityType: 'Whole Class', objective: 'Classify oblique triangles according to given parts (AAS, ASA, SAS, SSS, SSA).' },
      { day: 'TUESDAY', date: 'Nov. 03, 2026', lessonTitle: 'Law of Sines and Practical Applications', activityType: 'Group Work', objective: 'Apply a / sin A = b / sin B = c / sin C to solve AAS and ASA triangles.' },
      { day: 'WEDNESDAY', date: 'Nov. 04, 2026', lessonTitle: 'Law of Cosines and Applications', activityType: 'Pair Work', objective: 'Apply c² = a² + b² - 2ab cos C to solve SAS and SSS triangles.' },
      { day: 'THURSDAY', date: 'Nov. 05, 2026', lessonTitle: 'The Ambiguous Case (SSA) in Law of Sines', activityType: 'Whole Class', objective: 'Determine if 0, 1, or 2 triangles exist for SSA given parts.' },
      { day: 'FRIDAY', date: 'Nov. 06, 2026', lessonTitle: 'Oblique Triangle Real-World Problem Solving', activityType: 'Individual Work', objective: 'Complete land surveying triangulation calculations for Performance Task 3.' }
    ],
    references: [
      'DepEd Senior High School General Mathematics Curriculum Guide',
      'DepEd Grade 9 Mathematics Learner’s Module: Non-Right Triangles',
      'Land Management Bureau (DENR) Cadastral Survey Guidelines'
    ],
    prerequisites: ['Right Triangle Trigonometry', 'Angle Sum of Triangles (180°)', 'Solving Linear & Quadratic Equations'],
    framework: 'ILAW',
    ilaw: {
      intentions: {
        learningIntentions: 'Solve non-right (oblique) triangles using the Law of Sines and Law of Cosines in real-life navigation, topography, and engineering contexts.',
        successCriteria: [
          'Choose correctly between Law of Sines (AAS, ASA, SSA) and Law of Cosines (SAS, SSS).',
          'Solve for unknown side lengths and angles using the Law of Sines.',
          'Apply the Law of Cosines to determine the third side or calculate angle measures.',
          'Analyze the ambiguous case (SSA) to determine whether 0, 1, or 2 triangles exist.'
        ],
        competencies: [
          'M9GE-IVf-g-1: Solves problems involving oblique triangles using the Law of Sines and Law of Cosines.'
        ],
        priorKnowledge: 'Trigonometric ratios, inverse trigonometric functions (sin⁻¹, cos⁻¹), and angle sum of a triangle = 180°.'
      },
      learningExperience: {
        primingActivity: 'GPS Triangulation Problem: Three cellular towers at points A, B, and C form a non-right triangle. Given the distance between towers A and B, and angles measured to tower C, how can mobile networks locate a phone without right angles?',
        coreInstruction: 'Derive Law of Sines (a / sin A = b / sin B) using altitude decomposition. Derive Law of Cosines (c² = a² + b² - 2ab cos C) as a generalized Pythagorean Theorem.',
        guidedExercises: 'Decision Flowchart exercise: Students classify 6 triangle problem cards into Law of Sines vs Law of Cosines and solve in pairs.',
        keyFormulas: [
          { name: 'Law of Sines', formula: 'a / sin A = b / sin B = c / sin C', explanation: 'Ratios of side length to sine of opposite angle are equal.' },
          { name: 'Law of Cosines (Side)', formula: 'c² = a² + b² - 2ab cos C', explanation: 'Calculates third side given two sides and the included angle (SAS).' },
          { name: 'Law of Cosines (Angle)', formula: 'cos C = (a² + b² - c²) / (2ab)', explanation: 'Calculates any angle given all three side lengths (SSS).' }
        ]
      },
      assessingLearning: {
        formativeAssessment: 'Quick check: Solve for side c given a = 7, b = 10, and C = 60° using the Law of Cosines.',
        diagnosticQuizPlan: '5-item adaptive Diagnostic Quiz assessing law selection and calculation execution.',
        successThreshold: '80% mastery benchmark on Performance Task 3.',
        summativeAssessmentPlan: 'Performance Task 3: Land Surveying & Triangulation Project (20% grade weight).'
      },
      waysForward: {
        nextSteps: 'Connect oblique triangles to satellite positioning and maritime navigation bearings.',
        remediationAction: 'Provide an "If-Then" Law Decision Flowchart card to help students immediately select between Law of Sines and Cosines.',
        enrichmentChallenge: 'Calculate land area using Heron’s formula and compare it with the trigonometric area formula Area = ½ab sin C.',
        realWorldCareers: ['Geodetic Engineering', 'Naval Navigation', 'Cartography', 'Structural Engineering', 'Robotics Kinematics']
      }
    },
    learningCompetencies: [
      'M9GE-IVf-g-1: Solves problems involving oblique triangles.'
    ],
    objectives: {
      cognitive: 'Determine whether to use Law of Sines or Law of Cosines based on given triangle parts.',
      psychomotor: 'Solve unknown sides and angles of non-right triangles accurately.',
      affective: 'Appreciate triangulation methods in GPS, aviation, and land surveying.'
    },
    materialsNeeded: ['Protractors', 'Scientific calculators', 'Surveying layout maps'],
    keyConcepts: [
      { term: 'Oblique Triangle', definition: 'A triangle that does not contain a right angle.' },
      { term: 'Law of Sines', definition: 'a / sin A = b / sin B = c / sin C' },
      { term: 'Law of Cosines', definition: 'c² = a² + b² - 2ab cos C' }
    ],
    workedExamples: [
      {
        title: 'Applying the Law of Cosines (SAS Case)',
        problem: 'In triangle ABC, side a = 8 cm, side b = 11 cm, and angle C = 48°. Find the length of side c.',
        stepByStepSolution: [
          'Step 1: Identify given parts: two sides and the included angle (SAS). Use Law of Cosines.',
          'Step 2: State formula: c² = a² + b² - 2ab cos C.',
          'Step 3: Substitute values: c² = 8² + 11² - 2(8)(11) cos(48°).',
          'Step 4: Compute terms: c² = 64 + 121 - 176 · (0.6691) = 185 - 117.76 = 67.24.',
          'Step 5: Take the square root: c = √67.24 ≈ 8.20 cm.',
          'Conclusion: The length of side c is approximately 8.20 cm.'
        ]
      }
    ],
    procedures: [
      {
        phase: 'Motivation / Priming',
        durationMinutes: 10,
        teacherActivity: 'Present a map showing three islands in the Philippines forming an oblique triangle and ask how sailors computed distances before radar.',
        studentActivity: 'Observe that SOH-CAH-TOA fails without a right angle and propose dropping an altitude.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Direct Instruction',
        durationMinutes: 20,
        teacherActivity: 'Derive Law of Sines and Law of Cosines and construct a decision matrix for triangle cases.',
        studentActivity: 'Follow derivations and record the decision table in notebooks.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Guided Practice',
        durationMinutes: 15,
        teacherActivity: 'Supervise pair practice solving SSS and ASA triangle cards.',
        studentActivity: 'Determine which law to apply and solve equations collaboratively.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Independent Practice / Assessment',
        durationMinutes: 10,
        teacherActivity: 'Administer 4-item formative oblique triangle drill.',
        studentActivity: 'Solve items individually and self-check with solution steps.',
        ilawPillar: 'A - Assessing Learning'
      },
      {
        phase: 'Generalization & Homework',
        durationMinutes: 5,
        teacherActivity: 'Summarize key takeaways and provide instructions for Performance Task 3.',
        studentActivity: 'Take note of Performance Task 3 triangulation report guidelines.',
        ilawPillar: 'W - Ways Forward'
      }
    ],
    differentiation: {
      remediation: 'Provide law decision flowchart and inverse cosine step cards.',
      enrichment: 'Navigational bearing calculations involving wind drift vectors.'
    },
    assessmentPlan: 'Performance Task 3 report submission and formative drills.'
  },

  'term2-w5-area-perimeter': {
    id: 'lp-term2-w5',
    topicId: 'term2-w5-area-perimeter',
    title: 'DepEd ILAW Lesson Plan: Practical Measurement — Area & Perimeter',
    gradeLevel: 'Grade 11 - General Mathematics',
    duration: '60 minutes',
    subject: 'General Mathematics',
    term: 'Term 2',
    week: 'Week 5',
    dates: 'Nov. 09-13, 2026',
    section: 'Grade 11 – Gauss (6:00 AM – 7:00 AM)',
    doOrderRef: 'DepEd MATATAG / D.O. No. 016, s.2026',
    weeklySchedule: [
      { day: 'MONDAY', date: 'Nov. 09, 2026', lessonTitle: 'Review of Composite Plane Figures', activityType: 'Whole Class', objective: 'Decompose composite plane shapes into rectangles, triangles, and sectors.' },
      { day: 'TUESDAY', date: 'Nov. 10, 2026', lessonTitle: 'Heron’s Formula for Non-Right Triangular Area', activityType: 'Pair Work', objective: 'Apply Heron’s formula given three side lengths.' },
      { day: 'WEDNESDAY', date: 'Nov. 11, 2026', lessonTitle: 'Sector Area and Arc Lengths in Circular Geometry', activityType: 'Group Work', objective: 'Compute sector area A = ½r²θ and arc length s = rθ.' },
      { day: 'THURSDAY', date: 'Nov. 12, 2026', lessonTitle: 'Practical Land & Floor Plan Measurement', activityType: 'Whole Class', objective: 'Estimate tile and fencing material requirements.' },
      { day: 'FRIDAY', date: 'Nov. 13, 2026', lessonTitle: 'Area & Perimeter Estimation Drills', activityType: 'Individual Work', objective: 'Complete formative geometry problem assessment.' }
    ],
    references: [
      'DepEd Senior High School General Mathematics Curriculum Guide',
      'Philippine National Building Code - Measurement Standards',
      'Architectural Drafting and Estimating Handbook'
    ],
    prerequisites: ['Basic Geometric Shapes', 'Square Roots', 'Algebraic Evaluation'],
    framework: 'ILAW',
    ilaw: {
      intentions: {
        learningIntentions: 'Calculate area, perimeter, and material requirements for composite figures and non-right triangular land plots using Heron’s formula and sector geometries.',
        successCriteria: [
          'Decompose composite figures into standard geometric sub-shapes.',
          'Apply Heron’s formula to calculate triangular area without knowing the altitude.',
          'Calculate arc lengths and sector areas using degree and radian formulas.',
          'Estimate cost of flooring tiles and perimeter fencing for real floor plans.'
        ],
        competencies: [
          'Computes perimeter and area of composite figures.',
          'Solves practical measurement and estimation problems.'
        ],
        priorKnowledge: 'Perimeter and area formulas for squares, rectangles, triangles, and circles.'
      },
      learningExperience: {
        primingActivity: 'Classroom Flooring Cost Estimator: How many 60 cm × 60 cm ceramic tiles are needed to re-tile the classroom floor including an irregular entryway? Estimate 10% cutting waste allowance.',
        coreInstruction: 'Step-by-step instruction on Heron’s formula: semi-perimeter s = (a+b+c)/2, Area = √(s(s-a)(s-b)(s-c)). Demonstrate circular sector area Area = (θ / 360°) · πr².',
        guidedExercises: 'Students solve irregular agricultural lot blueprints in pairs to compute perimeter fencing and planting area.',
        keyFormulas: [
          { name: 'Heron’s Formula', formula: 'Area = √(s(s-a)(s-b)(s-c)), where s = (a+b+c)/2', explanation: 'Calculates area of any triangle from its three side lengths.' },
          { name: 'Circular Sector Area', formula: 'Area = (θ/360°) · πr² or ½r²θ (radians)', explanation: 'Area of a pie slice of a circle with central angle θ.' },
          { name: 'Arc Length', formula: 's = (θ/360°) · 2πr or rθ (radians)', explanation: 'Boundary curved perimeter of a circle slice.' }
        ]
      },
      assessingLearning: {
        formativeAssessment: 'Find the area of a triangular lot with sides 7 m, 8 m, and 9 m using Heron’s formula.',
        diagnosticQuizPlan: '5-item Diagnostic Quiz checking semi-perimeter computation, shape decomposition, and tile unit conversion.',
        successThreshold: '75% mastery benchmark on applied measurement exercises.',
        summativeAssessmentPlan: 'Formative plane geometry assessment and lot measurement portfolio.'
      },
      waysForward: {
        nextSteps: 'Measure your bedroom at home and create an estimated blueprint with calculated square footage.',
        remediationAction: 'Pre-formatted Heron’s formula calculation steps with designated slots for s, (s-a), (s-b), and (s-c).',
        enrichmentChallenge: 'Calculate irregular lot perimeter and area using Pick’s Theorem on coordinate lattice grids.',
        realWorldCareers: ['Architecture', 'Quantity Surveying', 'Interior Design', 'Landscape Architecture', 'Carpentry & Construction']
      }
    },
    learningCompetencies: [
      'Computes perimeter and area of composite figures.',
      'Solves practical measurement problems.'
    ],
    objectives: {
      cognitive: 'Decompose complex composite shapes into standard geometric figures and evaluate formulas.',
      psychomotor: 'Apply Heron’s formula and sector formulas accurately with correct units.',
      affective: 'Value precision in material estimating to prevent resource waste.'
    },
    materialsNeeded: ['Rulers', 'Floor plan blueprints', 'Scientific calculators'],
    keyConcepts: [
      { term: 'Heron’s Formula', definition: 'Area = √(s(s-a)(s-b)(s-c)) where s = (a+b+c)/2.', formula: 'Area = √(s(s-a)(s-b)(s-c))' },
      { term: 'Sector Area', definition: 'The portion of a disk enclosed by two radii and an arc.', formula: 'A = (θ/360°) · πr²' }
    ],
    workedExamples: [
      {
        title: 'Heron’s Formula Application',
        problem: 'A triangular plot of land has side lengths of 7 meters, 8 meters, and 9 meters. Calculate its exact area.',
        stepByStepSolution: [
          'Step 1: Calculate semi-perimeter s: s = (7 + 8 + 9) / 2 = 24 / 2 = 12 meters.',
          'Step 2: Calculate differences: (s - a) = 12 - 7 = 5; (s - b) = 12 - 8 = 4; (s - c) = 12 - 9 = 3.',
          'Step 3: Multiply terms under the radical: 12 · 5 · 4 · 3 = 720.',
          'Step 4: Take the square root: Area = √720 = √(144 · 5) = 12√5 ≈ 26.83 m².',
          'Conclusion: The area of the plot is approximately 26.83 square meters.'
        ]
      }
    ],
    procedures: [
      {
        phase: 'Motivation / Priming',
        durationMinutes: 10,
        teacherActivity: 'Display a floor plan of a modern house and ask how contractors estimate square meters when rooms have bay windows or angled walls.',
        studentActivity: 'Identify decomposing strategies to break the layout into simpler shapes.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Direct Instruction',
        durationMinutes: 20,
        teacherActivity: 'Explain Heron’s formula and circular sector area derivations on the board with worked examples.',
        studentActivity: 'Follow steps, calculate semi-perimeter, and practice root evaluation.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Guided Practice',
        durationMinutes: 15,
        teacherActivity: 'Provide floor plan worksheets and assist pairs in finding composite areas.',
        studentActivity: 'Decompose shapes, sum individual areas, and subtract negative void spaces.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Independent Practice / Assessment',
        durationMinutes: 10,
        teacherActivity: 'Administer 3-item formative geometry drill.',
        studentActivity: 'Solve items individually and record solutions.',
        ilawPillar: 'A - Assessing Learning'
      },
      {
        phase: 'Generalization & Homework',
        durationMinutes: 5,
        teacherActivity: 'Summarize key formulas and assign home measurement activity.',
        studentActivity: 'Record homework prompt in notebooks.',
        ilawPillar: 'W - Ways Forward'
      }
    ],
    differentiation: {
      remediation: 'Shape decomposition templates with labeled color blocks.',
      enrichment: 'Irregular parcel perimeter estimation using coordinate geometry.'
    },
    assessmentPlan: 'Formative plane geometry check and worksheet evaluation.'
  },

  'term2-w6-volume-cost': {
    id: 'lp-term2-w6',
    topicId: 'term2-w6-volume-cost',
    title: 'DepEd ILAW Lesson Plan: Volume, Capacity & Packaging Cost Estimation',
    gradeLevel: 'Grade 11 - General Mathematics',
    duration: '60 minutes',
    subject: 'General Mathematics',
    term: 'Term 2',
    week: 'Week 6',
    dates: 'Nov. 16-20, 2026',
    section: 'Grade 11 – Gauss (6:00 AM – 7:00 AM)',
    doOrderRef: 'DepEd MATATAG / D.O. No. 016, s.2026',
    weeklySchedule: [
      { day: 'MONDAY', date: 'Nov. 16, 2026', lessonTitle: 'Volumes of Prisms, Pyramids, Cylinders & Cones', activityType: 'Whole Class', objective: 'Calculate volumes of standard geometric 3D solids.' },
      { day: 'TUESDAY', date: 'Nov. 17, 2026', lessonTitle: 'Calculating Volume and Volumetric Capacity', activityType: 'Pair Work', objective: 'Convert cubic centimeters and meters to fluid liters and milliliters.' },
      { day: 'WEDNESDAY', date: 'Nov. 18, 2026', lessonTitle: 'Surface Area and Packaging Material Calculations', activityType: 'Group Work', objective: 'Determine total surface area of cardboard packaging containers.' },
      { day: 'THURSDAY', date: 'Nov. 19, 2026', lessonTitle: 'Material Cost Estimation & Budgeting', activityType: 'Whole Class', objective: 'Compute unit manufacturing cost based on cardboard surface area.' },
      { day: 'FRIDAY', date: 'Nov. 20, 2026', lessonTitle: 'Applied Engineering Cost Analysis', activityType: 'Individual Work', objective: 'Submit Performance Task 4 container prototype evaluation.' }
    ],
    references: [
      'DepEd Senior High School General Mathematics Curriculum Guide',
      'Packaging Institute of the Philippines - Industrial Container Standards',
      'Industrial Cost Accounting and Production Engineering Handbook'
    ],
    prerequisites: ['Area Formulas', 'Algebraic Substitution', 'Unit Conversions'],
    framework: 'ILAW',
    ilaw: {
      intentions: {
        learningIntentions: 'Determine the volume, volumetric capacity, and surface area of 3D solids to design cost-effective packaging containers.',
        successCriteria: [
          'Calculate volumes of prisms, cylinders, pyramids, and cones accurately.',
          'Convert volumetric dimensions into liquid capacity units (1,000 cm³ = 1 Liter).',
          'Calculate the total surface area to determine sheet metal or cardboard requirements.',
          'Optimize container dimensions to minimize surface area (and material cost) for a fixed volume.'
        ],
        competencies: [
          'Solves problems involving surface area, volume, and cost estimation.',
          'Represents real-life optimization scenarios using geometric equations.'
        ],
        priorKnowledge: 'Area of 2D shapes (circles, rectangles), volume basics, and unit conversion factors.'
      },
      learningExperience: {
        primingActivity: 'The Soda Can Mystery: Why are standard beverage cans cylindrical rather than rectangular boxes? How does minimizing surface area for a 330 mL capacity reduce manufacturing expenses for millions of cans?',
        coreInstruction: 'Direct instruction on 3D solid geometry: Prism Volume = Base Area × Height; Cylinder Volume = πr²h; Total Surface Area = 2πr² + 2πrh. Relate cardboard area to unit cost.',
        guidedExercises: 'In groups, design a cereal box with a minimum volume of 1,500 cm³ and determine the optimal dimensions that minimize cardboard cost.',
        keyFormulas: [
          { name: 'Cylinder Volume & Surface Area', formula: 'V = πr²h, SA = 2πr² + 2πrh', explanation: 'Volume and total exterior surface area of a closed circular cylinder.' },
          { name: 'Rectangular Prism Volume & Area', formula: 'V = lwh, SA = 2(lw + lh + wh)', explanation: 'Volume and exterior surface area of a box container.' },
          { name: 'Capacity Conversion', formula: '1 Liter = 1,000 cm³ = 0.001 m³', explanation: 'Fundamental bridge between solid volume and fluid capacity.' }
        ]
      },
      assessingLearning: {
        formativeAssessment: 'Calculate the total surface area and volume of a cylindrical tin can with radius 4 cm and height 10 cm.',
        diagnosticQuizPlan: '5-item Diagnostic Quiz checking 3D formula selection, metric capacity conversions, and cost per unit calculations.',
        successThreshold: '80% mastery benchmark on Performance Task 4.',
        summativeAssessmentPlan: 'Performance Task 4: Packaging Design & Cost Minimization Project (20% grade weight).'
      },
      waysForward: {
        nextSteps: 'Inspect packaged goods at a grocery store and compare volume-to-price ratios across brands.',
        remediationAction: 'Provide net unfolding templates where 3D boxes are flattened into 2D cutouts to visualize surface area.',
        enrichmentChallenge: 'Use differential calculus principles or trial tables to prove why a cylinder with height equal to diameter (h = 2r) minimizes surface area.',
        realWorldCareers: ['Packaging Engineering', 'Manufacturing Production', 'Logistics & Supply Chain', 'Industrial Design', 'Cost Accounting']
      }
    },
    learningCompetencies: [
      'Solves problems involving surface area, volume, and cost estimation.'
    ],
    objectives: {
      cognitive: 'Relate surface area to raw material costs and volume to fluid capacity.',
      psychomotor: 'Calculate fluid capacities, total surface areas, and production budgets accurately.',
      affective: 'Understand economical material utilization and environmental sustainability in packaging.'
    },
    materialsNeeded: ['Cardboard boxes', 'Rulers', 'Scissors', 'Calculators'],
    keyConcepts: [
      { term: 'Volumetric Capacity', definition: 'The volume of fluid or contents a 3D container can hold.', formula: '1 L = 1000 cm³' },
      { term: 'Surface Area', definition: 'The total area of all exterior faces of a 3D solid.', formula: 'SA_box = 2(lw + lh + wh)' }
    ],
    workedExamples: [
      {
        title: 'Cylindrical Can Surface Area and Material Cost',
        problem: 'A food company produces a soup can with radius r = 3.5 cm and height h = 10 cm. If tinplate costs ₱0.05 per cm², calculate the material cost to produce 1,000 cans (use π ≈ 3.1416).',
        stepByStepSolution: [
          'Step 1: Compute total surface area of one can: SA = 2πr² + 2πrh.',
          'Step 2: Area of two circular bases: 2 · π · (3.5)² = 2 · 3.1416 · 12.25 ≈ 76.97 cm².',
          'Step 3: Area of lateral curved wall: 2 · π · 3.5 · 10 = 2 · 3.1416 · 35 ≈ 219.91 cm².',
          'Step 4: Total surface area per can: 76.97 + 219.91 = 296.88 cm².',
          'Step 5: Cost per can: 296.88 cm² · ₱0.05/cm² = ₱14.84.',
          'Step 6: Cost for 1,000 cans: 1,000 · ₱14.84 = ₱14,844.00.',
          'Conclusion: Total material cost for 1,000 cans is approximately ₱14,844.00.'
        ]
      }
    ],
    procedures: [
      {
        phase: 'Motivation / Priming',
        durationMinutes: 10,
        teacherActivity: 'Display various consumer product packaging and ask which shape uses the least cardboard for the same volume.',
        studentActivity: 'Examine boxes and cans, proposing reasons why companies care about container geometry.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Direct Instruction',
        durationMinutes: 20,
        teacherActivity: 'Derive volume and surface area formulas for prisms and cylinders and demonstrate cost estimation calculations.',
        studentActivity: 'Record formulas, draw net diagrams, and calculate step-by-step.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Guided Practice',
        durationMinutes: 15,
        teacherActivity: 'Facilitate pair activity where students design prototype container boxes.',
        studentActivity: 'Calculate dimensions, compute surface area, and price out manufacturing expenses.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Independent Practice / Assessment',
        durationMinutes: 10,
        teacherActivity: 'Administer 3-item volume and cost computation drill.',
        studentActivity: 'Solve items individually and review answers.',
        ilawPillar: 'A - Assessing Learning'
      },
      {
        phase: 'Generalization & Homework',
        durationMinutes: 5,
        teacherActivity: 'Summarize connection between geometry and cost savings and review Performance Task 4 requirements.',
        studentActivity: 'Take note of Performance Task 4 submission deliverables.',
        ilawPillar: 'W - Ways Forward'
      }
    ],
    differentiation: {
      remediation: 'Provide 3D net unfolding templates to visually identify individual face areas.',
      enrichment: 'Explore surface-area-to-volume ratio optimization.'
    },
    assessmentPlan: 'Performance Task 4 packaging prototype evaluation.'
  },

  'term2-w7-random-variables': {
    id: 'lp-term2-w7',
    topicId: 'term2-w7-random-variables',
    title: 'DepEd ILAW Lesson Plan: Discrete Random Variables & Expected Value',
    gradeLevel: 'Grade 11 - Statistics & Probability',
    duration: '60 minutes',
    subject: 'Statistics & Probability',
    term: 'Term 2',
    week: 'Week 7',
    dates: 'Nov. 23-27, 2026',
    section: 'Grade 11 – Gauss (6:00 AM – 7:00 AM)',
    doOrderRef: 'DepEd MATATAG / D.O. No. 016, s.2026',
    weeklySchedule: [
      { day: 'MONDAY', date: 'Nov. 23, 2026', lessonTitle: 'Random Variables & Probability Mass Functions', activityType: 'Whole Class', objective: 'Distinguish discrete from continuous random variables and construct PMF tables.' },
      { day: 'TUESDAY', date: 'Nov. 24, 2026', lessonTitle: 'Mean / Expected Value E(X) of Discrete Variables', activityType: 'Pair Work', objective: 'Compute expected value E(X) = Σ x·P(x).' },
      { day: 'WEDNESDAY', date: 'Nov. 25, 2026', lessonTitle: 'Variance & Standard Deviation of Random Variables', activityType: 'Group Work', objective: 'Calculate variance Var(X) = Σ (x - μ)² · P(x).' },
      { day: 'THURSDAY', date: 'Nov. 26, 2026', lessonTitle: 'Constructing Probability Distributions for Real Experiments', activityType: 'Whole Class', objective: 'Model games of chance and warranty failure distributions.' },
      { day: 'FRIDAY', date: 'Nov. 27, 2026', lessonTitle: 'Games of Chance & Expected Value Decision Problems', activityType: 'Individual Work', objective: 'Evaluate fair game status and financial risk in lotteries and insurance.' }
    ],
    references: [
      'DepEd Senior High School Statistics and Probability Curriculum Guide',
      'DepEd Teaching Guide for Senior High School: Statistics and Probability',
      'Actuarial Society of the Philippines Educational Manual'
    ],
    prerequisites: ['Basic Probability Concepts (P(E) = n(E)/n(S))', 'Summation Notation', 'Fractions and Decimals'],
    framework: 'ILAW',
    ilaw: {
      intentions: {
        learningIntentions: 'Construct probability distributions for discrete random variables and compute mean, variance, and expected values in practical decision-making.',
        successCriteria: [
          'Differentiate discrete (countable) from continuous (measurable) random variables.',
          'Verify the two fundamental conditions of a discrete probability distribution: 0 ≤ P(X=x) ≤ 1 and Σ P(x) = 1.',
          'Compute the expected value E(X) = μ = Σ [x · P(x)].',
          'Interpret expected value to determine whether an insurance policy or carnival game is financially favorable.'
        ],
        competencies: [
          'M11/12SP-IIIa-1: Illustrates a random variable (discrete and continuous).',
          'M11/12SP-IIIa-2: Distinguishes between a discrete and a continuous random variable.',
          'M11/12SP-IIIa-3: Finds the possible values of a random variable.',
          'M11/12SP-IIIa-4: Illustrates a probability distribution for a discrete random variable.',
          'M11/12SP-IIIb-1: Calculates the mean and the variance of a discrete random variable.'
        ],
        priorKnowledge: 'Sample spaces, tree diagrams, compound events, and calculating basic probabilities.'
      },
      learningExperience: {
        primingActivity: 'Raffle Ticket Dilemma: A school raffle charges ₱50 per ticket. There is one ₱10,000 grand prize and two ₱1,000 consolation prizes among 500 tickets sold. What is your expected financial gain or loss if you buy one ticket?',
        coreInstruction: 'Direct instruction on random variables X, table construction for P(X = x), the probability distribution requirements, and derivation of Expected Value E(X) = Σ x·P(x).',
        guidedExercises: 'In pairs, construct the probability distribution for the number of heads obtained when tossing 3 fair coins, and calculate E(X).',
        keyFormulas: [
          { name: 'Probability Distribution Conditions', formula: '0 ≤ P(x) ≤ 1 and Σ P(x) = 1', explanation: 'Each probability must be valid and the sum of all probabilities must equal 1.' },
          { name: 'Expected Value (Mean)', formula: 'E(X) = μ = Σ [x · P(x)]', explanation: 'The long-term average outcome of a random variable over repeated trials.' },
          { name: 'Variance of Random Variable', formula: 'Var(X) = σ² = Σ [(x - μ)² · P(x)] = Σ [x² · P(x)] - μ²', explanation: 'Measure of the dispersion of outcomes around the expected value.' }
        ]
      },
      assessingLearning: {
        formativeAssessment: 'Whiteboard check: A game awards ₱100 with probability 0.1, ₱20 with probability 0.4, and ₱0 with probability 0.5. Compute E(X).',
        diagnosticQuizPlan: '5-item Diagnostic Quiz checking discrete vs continuous identification, PMF table verification, and E(X) computation.',
        successThreshold: '75% mastery benchmark on discrete probability problems.',
        summativeAssessmentPlan: 'Formative probability check and expected value analysis paper.'
      },
      waysForward: {
        nextSteps: 'Reflect on how insurance companies determine car insurance premiums using expected value of accidents.',
        remediationAction: 'Tree diagrams and sample space expansion grids to accurately count total outcomes for coin and dice experiments.',
        enrichmentChallenge: 'Analyze the St. Petersburg Paradox and formulate expected value for multi-tier lottery ticket systems.',
        realWorldCareers: ['Actuarial Science', 'Insurance Underwriting', 'Casino Gaming Compliance', 'Financial Risk Management', 'Epidemiological Modeling']
      }
    },
    learningCompetencies: [
      'M11/12SP-IIIa-1: Illustrates a random variable.',
      'M11/12SP-IIIb-1: Calculates the mean and the variance of a discrete random variable.'
    ],
    objectives: {
      cognitive: 'Distinguish between discrete and continuous random variables and explain expected value.',
      psychomotor: 'Compute expected value E(X) = Σ x·P(x) and variance systematically.',
      affective: 'Develop cautious financial reasoning regarding games of chance, lotteries, and risk assessment.'
    },
    materialsNeeded: ['Coins', 'Dice', 'Probability tables', 'Calculators'],
    keyConcepts: [
      { term: 'Discrete Random Variable', definition: 'A variable whose possible values are countable outcomes from a random process.' },
      { term: 'Expected Value', definition: 'The weighted average of all possible values of a random variable.', formula: 'E(X) = Σ x · P(x)' }
    ],
    workedExamples: [
      {
        title: 'Calculating Expected Value of a Carnival Game',
        problem: 'A carnival game costs ₱30 to play. You roll a fair six-sided die. If you roll a 6, you win ₱120. If you roll a 4 or 5, you win ₱30. If you roll a 1, 2, or 3, you win ₱0. Find the expected net gain of playing this game.',
        stepByStepSolution: [
          'Step 1: Determine net payouts (winnings minus ₱30 ticket cost):',
          '• Roll 6: Net gain x₁ = ₱120 - ₱30 = +₱90. Probability P(x₁) = 1/6.',
          '• Roll 4 or 5: Net gain x₂ = ₱30 - ₱30 = ₱0. Probability P(x₂) = 2/6 = 1/3.',
          '• Roll 1, 2, or 3: Net gain x₃ = ₱0 - ₱30 = -₱30. Probability P(x₃) = 3/6 = 1/2.',
          'Step 2: Apply the expected value formula: E(X) = Σ [x · P(x)].',
          'Step 3: Multiply and sum: E(X) = (90 · 1/6) + (0 · 2/6) + (-30 · 3/6) = 15 + 0 - 15 = 0.',
          'Conclusion: The expected value is ₱0. This is an exactly "fair game" in mathematical terms.'
        ]
      }
    ],
    procedures: [
      {
        phase: 'Motivation / Priming',
        durationMinutes: 10,
        teacherActivity: 'Introduce a raffle ticket scenario and ask students whether spending ₱100 on tickets is mathematically rational.',
        studentActivity: 'Debate chances of winning vs cost of entry and formulate concept of expected return.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Direct Instruction',
        durationMinutes: 20,
        teacherActivity: 'Define discrete vs continuous variables, establish PMF rules, and demonstrate E(X) calculation step-by-step.',
        studentActivity: 'Construct probability tables, verify Σ P(x) = 1, and compute weighted sums.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Guided Practice',
        durationMinutes: 15,
        teacherActivity: 'Circulate as pairs solve coin tossing and product warranty failure probability tables.',
        studentActivity: 'Calculate expected values and interpret results in practical context.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Independent Practice / Assessment',
        durationMinutes: 10,
        teacherActivity: 'Administer 4-item formative expected value drill.',
        studentActivity: 'Solve items individually and submit results.',
        ilawPillar: 'A - Assessing Learning'
      },
      {
        phase: 'Generalization & Homework',
        durationMinutes: 5,
        teacherActivity: 'Synthesize the law of large numbers: E(X) represents the long-run average per game over thousands of plays.',
        studentActivity: 'Record reflection on why gambling establishments always maintain positive expected value.',
        ilawPillar: 'W - Ways Forward'
      }
    ],
    differentiation: {
      remediation: 'Coin flip sample space tree diagrams and pre-formatted x · P(x) columns.',
      enrichment: 'Insurance policy premium risk modeling using variance.'
    },
    assessmentPlan: 'Formative probability check and expected value drills.'
  },

  'term2-w8-normal-distribution': {
    id: 'lp-term2-w8',
    topicId: 'term2-w8-normal-distribution',
    title: 'DepEd ILAW Lesson Plan: The Normal Distribution & Z-Scores',
    gradeLevel: 'Grade 11 - Statistics & Probability',
    duration: '60 minutes',
    subject: 'Statistics & Probability',
    term: 'Term 2',
    week: 'Week 8',
    dates: 'Nov. 30 - Dec. 04, 2026',
    section: 'Grade 11 – Gauss (6:00 AM – 7:00 AM)',
    doOrderRef: 'DepEd MATATAG / D.O. No. 016, s.2026',
    weeklySchedule: [
      { day: 'MONDAY', date: 'Nov. 30, 2026', lessonTitle: 'Properties of the Normal Curve & Empirical Rule (68-95-99.7)', activityType: 'Whole Class', objective: 'Describe the symmetric, bell-shaped properties of the standard normal distribution.' },
      { day: 'TUESDAY', date: 'Dec. 01, 2026', lessonTitle: 'Calculating Z-Scores and Standardizing Raw Data', activityType: 'Pair Work', objective: 'Convert raw score X into standard score Z = (X - μ) / σ.' },
      { day: 'WEDNESDAY', date: 'Dec. 02, 2026', lessonTitle: 'Standard Normal Distribution Table & Area Under Curve', activityType: 'Group Work', objective: 'Use standard normal Z-tables to determine probabilities and percentiles.' },
      { day: 'THURSDAY', date: 'Dec. 03, 2026', lessonTitle: 'Applications of Normal Curve in Educational Grading', activityType: 'Whole Class', objective: 'Apply Z-scores to compare performance across different exams.' },
      { day: 'FRIDAY', date: 'Dec. 04, 2026', lessonTitle: 'Term 2 Comprehensive Review & Evaluation', activityType: 'Individual Work', objective: 'Complete Performance Task 5 research paper evaluation and review.' }
    ],
    references: [
      'DepEd Senior High School Statistics and Probability Curriculum Guide',
      'DepEd Teaching Guide for Senior High School: Statistics and Probability',
      'National Educational Assessment & Examinations Research Manual'
    ],
    prerequisites: ['Mean and Standard Deviation', 'Percentages and Decimals', 'Inequality Notation'],
    framework: 'ILAW',
    ilaw: {
      intentions: {
        learningIntentions: 'Apply the properties of the standard normal distribution, empirical rule, and Z-scores to solve probability problems and compare relative standing.',
        successCriteria: [
          'State the key properties of the normal distribution (bell-shaped, symmetric about mean, total area = 1).',
          'Apply the Empirical Rule (68% within 1 SD, 95% within 2 SD, 99.7% within 3 SD).',
          'Calculate Z-scores Z = (X - μ) / σ and interpret sign and magnitude.',
          'Determine the area under the normal curve using standard Z-tables or digital calculators.'
        ],
        competencies: [
          'M11/12SP-IIIc-1: Illustrates a normal random variable and its probabilities.',
          'M11/12SP-IIIc-2: Converts a normal random variable to a standard normal variable and vice versa.',
          'M11/12SP-IIIc-3: Computes probabilities and percentiles using the standard normal table.'
        ],
        priorKnowledge: 'Mean (μ), standard deviation (σ), and calculating percentages.'
      },
      learningExperience: {
        primingActivity: 'Who Performed Better? Maria scored 85 on a Math exam (mean = 75, SD = 10). Juan scored 90 on a Science exam (mean = 85, SD = 5). Who performed relatively better compared to their respective classes? Introduce standardization.',
        coreInstruction: 'Direct instruction on the standard normal curve N(0, 1), the Empirical Rule (68-95-99.7%), Z-score formula Z = (X - μ) / σ, and reading Z-tables for cumulative probabilities P(Z < z).',
        guidedExercises: 'In pairs, sketch the normal bell curve, shade the designated area for P(Z > 1.25), and calculate probability using the Z-table.',
        keyFormulas: [
          { name: 'Z-Score Standardization', formula: 'Z = (X - μ) / σ', explanation: 'Converts raw score X into the number of standard deviations from the mean.' },
          { name: 'Empirical Rule (68-95-99.7)', formula: 'P(μ - σ < X < μ + σ) ≈ 68.26%, P(μ - 2σ < X < μ + 2σ) ≈ 95.44%', explanation: 'Fixed probability percentages within 1, 2, and 3 standard deviations.' },
          { name: 'Raw Score Conversion', formula: 'X = μ + Z · σ', explanation: 'Converts standard Z-score back to original raw score units.' }
        ]
      },
      assessingLearning: {
        formativeAssessment: 'If heights of Filipino adult males have μ = 165 cm and σ = 6 cm, find the Z-score for a male who is 177 cm tall and find the percentage shorter than him.',
        diagnosticQuizPlan: '5-item Diagnostic Quiz checking empirical rule bounds, Z-score computation, and shaded area lookup.',
        successThreshold: '80% mastery benchmark on Performance Task 5.',
        summativeAssessmentPlan: 'Performance Task 5: Standard Normal Curve & Z-Score Research Paper (20% grade weight).'
      },
      waysForward: {
        nextSteps: 'Analyze national entrance exams (e.g., UPCAT, DOST scholarship exams) where percentile ranks are derived from Z-scores.',
        remediationAction: 'Color-coded bell curve sketches with shaded regions (left tail, right tail, between two values) to avoid table sign errors.',
        enrichmentChallenge: 'Investigate the Central Limit Theorem and how sample means approach normality regardless of population shape.',
        realWorldCareers: ['Psychometrics & Educational Testing', 'Medical Diagnostics (Growth Charts)', 'Quality Control (Six Sigma)', 'Biostatistics', 'Sociological Demographics']
      }
    },
    learningCompetencies: [
      'M11/12SP-IIIc-1: Illustrates a normal random variable and its probabilities.',
      'M11/12SP-IIIc-2: Converts a normal random variable to a standard normal variable.',
      'M11/12SP-IIIc-3: Computes probabilities and percentiles.'
    ],
    objectives: {
      cognitive: 'Explain the properties of the normal distribution and interpret Z-score values.',
      psychomotor: 'Convert raw score X to Z-score Z = (X - μ) / σ and look up probabilities in tables accurately.',
      affective: 'Appreciate how standardized scores enable objective and fair comparisons across diverse populations.'
    },
    materialsNeeded: ['Z-score reference tables', 'Normal curve plotting paper', 'Calculators'],
    keyConcepts: [
      { term: 'Normal Distribution', definition: 'A continuous probability distribution that is symmetric and bell-shaped.' },
      { term: 'Z-Score', definition: 'The number of standard deviations a data point lies above or below the mean.', formula: 'Z = (X - μ) / σ' }
    ],
    workedExamples: [
      {
        title: 'Comparing Relative Performance with Z-Scores',
        problem: 'Maria scored 85 on a Mathematics test with mean μ = 75 and standard deviation σ = 10. Juan scored 90 on a Science test with mean μ = 85 and standard deviation σ = 5. Determine who had the higher relative standing.',
        stepByStepSolution: [
          'Step 1: Calculate Maria’s Z-score for Mathematics:',
          'Z_Maria = (85 - 75) / 10 = 10 / 10 = +1.00.',
          'Step 2: Calculate Juan’s Z-score for Science:',
          'Z_Juan = (90 - 85) / 5 = 5 / 5 = +1.00.',
          'Step 3: Compare standard scores: Z_Maria = +1.00 and Z_Juan = +1.00.',
          'Conclusion: Both students scored exactly 1.00 standard deviation above their respective class means, so their relative standing is identical.'
        ]
      }
    ],
    procedures: [
      {
        phase: 'Motivation / Priming',
        durationMinutes: 10,
        teacherActivity: 'Present Maria and Juan’s test score comparison and ask students how to compare grades from tests with different difficulties.',
        studentActivity: 'Discuss why comparing raw scores directly (85 vs 90) is misleading without class averages.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Direct Instruction',
        durationMinutes: 20,
        teacherActivity: 'Introduce standard normal curve properties, the 68-95-99.7 rule, and the Z-score standardization formula.',
        studentActivity: 'Sketch bell curves, mark standard deviation intervals, and compute Z-scores.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Guided Practice',
        durationMinutes: 15,
        teacherActivity: 'Facilitate pair work using Z-tables to find cumulative areas and percentile ranks.',
        studentActivity: 'Find areas under curve in pairs, verify complementary subtraction for upper tail probabilities.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Independent Practice / Assessment',
        durationMinutes: 10,
        teacherActivity: 'Administer 4-item Z-score calculation and probability lookup drill.',
        studentActivity: 'Solve items individually and verify against answer keys.',
        ilawPillar: 'A - Assessing Learning'
      },
      {
        phase: 'Generalization & Homework',
        durationMinutes: 5,
        teacherActivity: 'Synthesize the importance of Z-scores in standardized testing and explain Performance Task 5 research paper.',
        studentActivity: 'Record Performance Task 5 research paper specifications.',
        ilawPillar: 'W - Ways Forward'
      }
    ],
    differentiation: {
      remediation: 'Provide visual shaded bell-curve templates with table lookup arrows.',
      enrichment: 'Explore inverse normal calculations where probability is given and raw score X must be determined.'
    },
    assessmentPlan: 'Performance Task 5 research paper evaluation and formative drills.'
  },

  'term3-w1-business-math': {
    id: 'lp-term3-w1',
    topicId: 'term3-w1-business-math',
    title: 'DepEd ILAW Lesson Plan: Business Mathematics — Simple & Compound Interest',
    gradeLevel: 'Grade 11 - General Mathematics',
    duration: '60 minutes',
    subject: 'General Mathematics',
    term: 'Term 3',
    week: 'Week 1',
    dates: 'Jan. 11-15, 2027',
    section: 'Grade 11 – Gauss (6:00 AM – 7:00 AM)',
    doOrderRef: 'DepEd MATATAG / D.O. No. 016, s.2026',
    weeklySchedule: [
      { day: 'MONDAY', date: 'Jan. 11, 2027', lessonTitle: 'Simple Interest Formula and Principal Calculations', activityType: 'Whole Class', objective: 'Calculate simple interest I = Prt and maturity value F = P(1 + rt).' },
      { day: 'TUESDAY', date: 'Jan. 12, 2027', lessonTitle: 'Compound Interest & Compounding Frequencies', activityType: 'Group Work', objective: 'Apply compound interest formula F = P(1 + r/m)^(mt).' },
      { day: 'WEDNESDAY', date: 'Jan. 13, 2027', lessonTitle: 'Maturity Value and Effective Interest Rates', activityType: 'Pair Work', objective: 'Compare nominal rates compounded annually, semi-annually, quarterly, and monthly.' },
      { day: 'THURSDAY', date: 'Jan. 14, 2027', lessonTitle: 'Comparing Bank Deposit Offers & Loan Amortization', activityType: 'Whole Class', objective: 'Evaluate personal loan terms and credit card finance charges.' },
      { day: 'FRIDAY', date: 'Jan. 15, 2027', lessonTitle: 'Practical Business Math Financial Planning', activityType: 'Individual Work', objective: 'Submit Performance Task 1 savings and loan comparison schedule.' }
    ],
    references: [
      'DepEd Senior High School General Mathematics Curriculum Guide (MELCs)',
      'Bangko Sentral ng Pilipinas (BSP) Financial Literacy Consumer Guide',
      'CHED Teaching Guide for Senior High School: Business Mathematics'
    ],
    prerequisites: ['Percentages and Decimals', 'Exponents', 'Algebraic Manipulation'],
    framework: 'ILAW',
    ilaw: {
      intentions: {
        learningIntentions: 'Illustrate, compute, and solve problems involving simple interest, compound interest, maturity values, and financial loan schedules in business contexts.',
        successCriteria: [
          'Differentiate clearly between simple interest (growth on principal only) and compound interest (growth on principal and accumulated interest).',
          'Compute simple interest I = Prt, principal, rate, time, and maturity value.',
          'Compute compound interest maturity value F = P(1 + r/m)^(mt) for various compounding periods (annually, semi-annually, quarterly, monthly).',
          'Formulate an informed financial comparison between bank savings deposits and consumer loan repayment costs.'
        ],
        competencies: [
          'M11GM-IIa-1: Illustrates simple and compound interests.',
          'M11GM-IIa-2: Distinguishes between simple and compound interests.',
          'M11GM-IIa-3: Computes interest, maturity value, future value, and present value in simple interest and compound interest environment.',
          'M11GM-IIb-1: Solves problems involving simple and compound interests.'
        ],
        priorKnowledge: 'Converting percentages to decimals (e.g. 5% = 0.05), time expressed in years, and exponentiation.'
      },
      learningExperience: {
        primingActivity: 'The ₱10,000 Investment Comparison: Suppose you invest ₱10,000 for 5 years at 6% annual interest. Bank A offers simple interest. Bank B offers compound interest. How much more do you earn with Bank B? Introduce the compounding effect.',
        coreInstruction: 'Direct instruction on Simple Interest formula I = Prt and Maturity Value F = P + I = P(1 + rt). Derive Compound Interest F = P(1 + r/m)^(mt) where m is compounding frequency per year.',
        guidedExercises: 'In pairs, calculate the future value of a ₱50,000 business capital loan after 3 years at 8% compounded quarterly vs monthly.',
        keyFormulas: [
          { name: 'Simple Interest', formula: 'I = P · r · t, F = P(1 + rt)', explanation: 'Interest computed only on the initial principal P over time t years.' },
          { name: 'Compound Interest', formula: 'F = P(1 + r/m)^(mt)', explanation: 'Future value with annual interest rate r compounded m times per year for t years.' },
          { name: 'Compound Interest Earned', formula: 'I_c = F - P', explanation: 'Total accumulated interest earned over the investment duration.' }
        ]
      },
      assessingLearning: {
        formativeAssessment: 'Whiteboard problem: Calculate the maturity value of ₱20,000 invested at 4% compounded semi-annually for 3 years.',
        diagnosticQuizPlan: '5-item Diagnostic Quiz checking interest formula selection, time conversion (months to years), and compounding frequency calculation.',
        successThreshold: '80% mastery benchmark on financial math problem sets.',
        summativeAssessmentPlan: 'Performance Task 1: Savings & Loan Amortization Plan (20% grade weight).'
      },
      waysForward: {
        nextSteps: 'Evaluate real credit card interest statements and compute the true cost of minimum monthly payments.',
        remediationAction: 'Time conversion cheat sheet (e.g., 6 months = 0.5 years, 18 months = 1.5 years) and step-by-step formula cards.',
        enrichmentChallenge: 'Explore continuous compounding formula F = P · e^(rt) and compare it with daily compounding (m = 365).',
        realWorldCareers: ['Financial Planning', 'Banking & Credit Analysis', 'Accounting', 'Microfinance Management', 'Investment Consulting']
      }
    },
    learningCompetencies: [
      'M11GM-IIa-1: Illustrates simple and compound interests.',
      'M11GM-IIa-2: Distinguishes between simple and compound interests.',
      'M11GM-IIb-1: Solves problems involving simple and compound interests.'
    ],
    objectives: {
      cognitive: 'Contrast simple and compound growth mechanisms and evaluate future and present values accurately.',
      psychomotor: 'Compute simple and compound interest equations using scientific calculators systematically.',
      affective: 'Develop financial prudence regarding debt, personal savings, and long-term investments.'
    },
    materialsNeeded: ['Financial calculators', 'Bank rate brochures', 'Loan amortization tables'],
    keyConcepts: [
      { term: 'Simple Interest', definition: 'Interest calculated only on the original principal amount.', formula: 'I = Prt' },
      { term: 'Compound Interest', definition: 'Interest calculated on the initial principal and the accumulated interest of previous periods.', formula: 'F = P(1 + r/m)^(mt)' }
    ],
    workedExamples: [
      {
        title: 'Comparing Simple vs Compound Interest',
        problem: 'Compute the future value of a ₱10,000 principal invested for 5 years at an annual interest rate of 6% under: (a) Simple Interest, and (b) Compounded Annually.',
        stepByStepSolution: [
          'Step 1: Calculate under Simple Interest:',
          'I = P · r · t = 10,000 · 0.06 · 5 = ₱3,000.',
          'Maturity Value F = P + I = 10,000 + 3,000 = ₱13,000.',
          'Step 2: Calculate under Compounded Annually (m = 1):',
          'F = P(1 + r)^t = 10,000 · (1 + 0.06)⁵ = 10,000 · (1.06)⁵.',
          'Compute (1.06)⁵ ≈ 1.338226.',
          'F = 10,000 · 1.338226 = ₱13,382.26.',
          'Conclusion: Compounding produces ₱13,382.26, yielding ₱382.26 more than simple interest due to interest earned on interest.'
        ]
      }
    ],
    procedures: [
      {
        phase: 'Motivation / Priming',
        durationMinutes: 10,
        teacherActivity: 'Ask students what happens to ₱1,000 deposited in a bank savings account over 10 years and whether interest earns additional interest.',
        studentActivity: 'Calculate year-by-year balance progression and discover compounding growth.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Direct Instruction',
        durationMinutes: 20,
        teacherActivity: 'Derive simple interest I = Prt and compound interest F = P(1 + r/m)^(mt), defining compounding periods m.',
        studentActivity: 'Record formulas, identify m values (annual=1, semi=2, quarterly=4, monthly=12), and practice calculator keystrokes.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Guided Practice',
        durationMinutes: 15,
        teacherActivity: 'Supervise pair practice calculating maturity values across different banks with competing rates.',
        studentActivity: 'Solve comparison problem cards and calculate net interest earned.',
        ilawPillar: 'L - Learning Experience'
      },
      {
        phase: 'Independent Practice / Assessment',
        durationMinutes: 10,
        teacherActivity: 'Administer 4-item formative financial math drill.',
        studentActivity: 'Complete items independently and check solutions.',
        ilawPillar: 'A - Assessing Learning'
      },
      {
        phase: 'Generalization & Homework',
        durationMinutes: 5,
        teacherActivity: 'Summarize why compound interest is the foundational engine of long-term wealth creation and debt accumulation.',
        studentActivity: 'Record Performance Task 1 amortization schedule guidelines.',
        ilawPillar: 'W - Ways Forward'
      }
    ],
    differentiation: {
      remediation: 'Provide formula substitution step sheets and compounding frequency cheat cards.',
      enrichment: 'Calculate effective annual interest rate (EAR) and analyze inflation-adjusted returns.'
    },
    assessmentPlan: 'Performance Task 1 submission and formative financial math drills.'
  }
};
