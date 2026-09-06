import { Topic } from '../types';

export const topics: Topic[] = [
  {
    id: 'functions',
    title: 'Functions & Relations',
    description: 'Master the building blocks of algebra: mapping inputs to outputs.',
    icon: 'Activity',
    color: 'blue',
    lessonPlan: {
      id: 'lp-functions',
      topicId: 'functions',
      title: 'Detailed Lesson Plan on Functions & Relations',
      gradeLevel: 'Grade 11 - General Mathematics',
      duration: '60 minutes',
      subject: 'General Mathematics',
      term: 'Term 1',
      week: 'Week 1',
      dates: 'Aug. 10-14, 2026',
      section: 'Grade 11 – Gauss (6:00 AM – 7:00 AM)',
      doOrderRef: 'As per D.O. No. 016, s.2026',
      weeklySchedule: [
        { day: 'MONDAY', date: 'Aug. 10, 2026', lessonTitle: 'Understanding Relations, Functions, and Vertical Line Test' },
        { day: 'TUESDAY', date: 'Aug. 11, 2026', lessonTitle: 'Evaluating Functions and Piecewise Defined Functions' },
        { day: 'WEDNESDAY', date: 'Aug. 12, 2026', lessonTitle: 'Performing Operations on Functions (Addition, Subtraction, Multiplication)' },
        { day: 'THURSDAY', date: 'Aug. 13, 2026', lessonTitle: 'Composition of Functions (f ∘ g)(x) and Inverse Concepts' },
        { day: 'FRIDAY', date: 'Aug. 14, 2026', lessonTitle: 'Real-Life Problems Involving Functions, Piecewise Rates, and Assessment' }
      ],
      references: [
        'DepEd SSHS General Mathematics – Budget of Work (BoW)',
        'DepEd SSHS General Mathematics Learning Exemplar',
        'Mathematics in the Modern World learning materials'
      ],
      prerequisites: ['Cartesian Coordinate System', 'Algebraic Expressions', 'Evaluating Polynomials'],
      framework: 'ILAW',
      ilaw: {
        intentions: {
          learningIntentions: 'Master relations, functions, piecewise evaluation, and composite functions in Grade 11 General Mathematics.',
          successCriteria: [
            'Differentiate between relations and functions using vertical line tests.',
            'Evaluate composite functions (f ∘ g)(x) accurately.',
            'Model real-life piecewise scenarios like transportation fares.'
          ],
          competencies: [
            'M11GM-Ia-1: Represents real-life situations using functions, including piece-wise functions.',
            'M11GM-Ia-2: Evaluates a function.',
            'M11GM-Ia-3: Performs addition, subtraction, multiplication, division, and composition of functions.'
          ]
        },
        learningExperience: {
          primingActivity: 'Vending machine input-output mapping analogy and vertical line test card warm-up.',
          coreInstruction: 'Interactive step-by-step function composition derivations and piecewise piecewise jeepney fare modeling.',
          guidedExercises: 'Collaborative peer problem-solving cards on evaluating composite functions.'
        },
        assessingLearning: {
          formativeAssessment: 'Board work checks during composite evaluation and vertical line test diagnostic check.',
          diagnosticQuizPlan: '5-item adaptive Functions & Relations quiz with step verification.',
          successThreshold: '80% accuracy benchmark on function evaluation items.'
        },
        waysForward: {
          nextSteps: 'Learner reflection journal entry on real-life input-output mappings.',
          remediationAction: 'Color-coded step-by-step function evaluation worksheets and peer tutoring.',
          enrichmentChallenge: 'Real-world income tax bracket piecewise function modeling project.'
        }
      },
      learningCompetencies: [
        'M11GM-Ia-1: Represents real-life situations using functions, including piece-wise functions.',
        'M11GM-Ia-2: Evaluates a function.',
        'M11GM-Ia-3: Performs addition, subtraction, multiplication, division, and composition of functions.'
      ],
      objectives: {
        cognitive: 'Distinguish between relations and functions, and evaluate function values accurately for real numbers.',
        psychomotor: 'Perform vertical line tests on graphs and solve composite function equations step-by-step.',
        affective: 'Appreciate the practical utility of piecewise functions in real-world scenarios such as taxi fares and tax rates.'
      },
      materialsNeeded: [
        'Graphing calculators or interactive graph tools',
        'Worksheets on piecewise function evaluation',
        'LeavienAI Adaptive Quiz Module'
      ],
      keyConcepts: [
        { term: 'Relation', definition: 'A rule that relates values from a set of inputs (domain) to a set of outputs (range).' },
        { term: 'Function', definition: 'A special relation where each input x corresponds to exactly one output y.', formula: 'f(x) = y' },
        { term: 'Piecewise Function', definition: 'A function defined by multiple sub-functions, each applying to a specific interval of the domain.' },
        { term: 'Function Composition', definition: 'Applying one function to the result of another function.', formula: '(f ∘ g)(x) = f(g(x))' }
      ],
      workedExamples: [
        {
          title: 'Evaluating Composite Functions',
          problem: 'Given f(x) = 3x - 1 and g(x) = x² + 2, evaluate (f ∘ g)(3).',
          stepByStepSolution: [
            'Step 1: Compute g(3) first: g(3) = 3² + 2 = 9 + 2 = 11.',
            'Step 2: Substitute g(3) = 11 into f(x): f(11) = 3(11) - 1.',
            'Step 3: Calculate the result: 33 - 1 = 32.',
            'Conclusion: (f ∘ g)(3) = 32.'
          ]
        },
        {
          title: 'Real-World Piecewise Function (Jeepney Fare)',
          problem: 'A jeepney fare costs ₱12 for the first 4 kilometers and ₱1.50 for each additional kilometer. Express the fare F(d) as a function of distance d in kilometers.',
          stepByStepSolution: [
            'Step 1: For d ≤ 4 km, F(d) = 12.',
            'Step 2: For d > 4 km, the extra distance is (d - 4) km.',
            'Step 3: Combine: F(d) = 12 + 1.50(d - 4).',
            'Final Piecewise Equation: F(d) = { 12 if 0 < d ≤ 4; 12 + 1.50(d - 4) if d > 4 }.'
          ]
        }
      ],
      procedures: [
        {
          phase: 'Motivation / Priming',
          durationMinutes: 10,
          teacherActivity: 'Present a vending machine analogy (one button -> one drink) vs a broken machine (one button -> multiple drinks). Ask students to relate this to math mappings.',
          studentActivity: 'Students participate in group discussion, identifying inputs and outputs in daily routines.',
          assessmentStrategy: 'Diagnostic quick poll via vertical line test cards.'
        },
        {
          phase: 'Direct Instruction',
          durationMinutes: 20,
          teacherActivity: 'Demonstrate evaluating functions, domain constraints, and composite function operations on the board with interactive graphs.',
          studentActivity: 'Students take structured notes, work through sample substitution problems in pairs.',
          assessmentStrategy: 'Formative checking of board answers.'
        },
        {
          phase: 'Guided Practice',
          durationMinutes: 15,
          teacherActivity: 'Divide class into small study groups and assign composite function problem cards with varying difficulty parameters.',
          studentActivity: 'Students solve assigned composite function problems collaboratively, using peer tutoring.',
          assessmentStrategy: 'Teacher observes group discussions and provides instant hints.'
        },
        {
          phase: 'Independent Practice / Assessment',
          durationMinutes: 10,
          teacherActivity: 'Direct students to launch the LeavienAI Introduction to Functions Quiz module.',
          studentActivity: 'Students independently complete 5 diagnostic/practice problems on their devices.',
          assessmentStrategy: 'Real-time item response analysis via LeavienAI Faculty Dashboard.'
        },
        {
          phase: 'Generalization & Homework',
          durationMinutes: 5,
          teacherActivity: 'Summarize key difference between relations and functions. Assign real-world piecewise modeling task.',
          studentActivity: 'Students write down key takeaways in their learning reflection journal.',
          assessmentStrategy: 'Exit ticket submission.'
        }
      ],
      differentiation: {
        remediation: 'Provide step-by-step substitution templates and color-coded function mapping diagrams for struggling learners.',
        enrichment: 'Challenge advanced students to model non-linear piecewise income tax rates and compute inverse composite functions.'
      },
      assessmentPlan: 'Formative assessment through 5-item online quiz in LeavienAI app; Summative unit assessment at the end of Chapter 1.',
      reflectionNotes: 'Emphasize common sign errors when squaring negative inputs in evaluating functions.'
    },
    quizzes: [
      {
        id: 'func-intro',
        title: 'Introduction to Functions',
        description: 'Identify functions and evaluate basic algebraic mappings.',
        topicId: 'functions',
        xpReward: 100,
        problems: [
          {
            id: 'p1',
            question: 'Which of the following represents a function?',
            options: [
              '{(1,2), (2,3), (1,4)}',
              '{(1,2), (2,2), (3,2)}',
              'A circle with center (0,0)',
              'x = y²'
            ],
            correctAnswer: 1,
            solution: 'A relation is a function if every input has exactly one output. Option 1 maps x=1 to y=2 and y=4. Option 3 fails the vertical line test. Option 4 allows y to be positive or negative for a given x. Only Option 2 maps each unique x to exactly one y.',
            topic: 'Functions & Relations',
            competency: 'Identify functions from relations',
            difficulty: 'easy',
            difficultyParameter: -1.5,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Remembering / Understanding',
            misconceptionCategory: 'Confusing input uniqueness with output uniqueness',
            hint1: 'Remember that a function must have exactly one y-value for each x-value.',
            hint2: 'Check if any x-value repeats with a different y-value in the given options.',
            explanation: 'A function must have exactly one output for each input. In option 2, every unique input has exactly one output.',
            remediation: 'Review the definition of a function and the vertical line test.',
            status: 'Active'
          },
          {
            id: 'p2',
            question: 'If f(x) = 2x² - 3x + 1, what is f(-2)?',
            options: ['3', '15', '11', '1'],
            correctAnswer: 1,
            solution: 'f(-2) = 2(-2)² - 3(-2) + 1\nf(-2) = 2(4) + 6 + 1\nf(-2) = 8 + 6 + 1\nf(-2) = 15',
            topic: 'Functions & Relations',
            competency: 'Evaluate functions at algebraic or numeric values',
            difficulty: 'easy',
            difficultyParameter: -0.6,
            discriminationParameter: 0.8,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Sign errors when squaring negative numbers',
            hint1: 'Substitute x = -2 into the equation carefully.',
            hint2: 'Remember that (-2)² is positive 4.',
            explanation: 'f(-2) = 2(-2)² - 3(-2) + 1 = 2(4) + 6 + 1 = 8 + 6 + 1 = 15.',
            remediation: 'Review order of operations and arithmetic with negative numbers.',
            status: 'Active'
          },
          {
            id: 'p3',
            question: 'If f(x) = 3x - 1 and g(x) = x² + 2, what is (f ∘ g)(3)?',
            options: ['32', '34', '64', '28'],
            correctAnswer: 0,
            solution: 'First find g(3) = 3² + 2 = 9 + 2 = 11.\nThen evaluate f(11) = 3(11) - 1 = 33 - 1 = 32.',
            topic: 'Functions & Relations',
            competency: 'Perform operations and compositions on functions',
            difficulty: 'medium',
            difficultyParameter: 0.2,
            discriminationParameter: 1.1,
            cognitiveLevel: 'Applying / Analyzing',
            misconceptionCategory: 'Applying outer function first or multiplying f and g',
            hint1: 'Work from the inside out: compute g(3) first.',
            hint2: 'Plug the resulting number into f(x).',
            explanation: '(f ∘ g)(3) means f(g(3)). Since g(3) = 11, f(11) = 3(11) - 1 = 32.',
            remediation: 'Review function composition and order of substitution.',
            status: 'Active'
          },
          {
            id: 'p4',
            question: 'What is the inverse function f⁻¹(x) for f(x) = (2x + 5) / 3?',
            options: ['(3x - 5) / 2', '(3x + 5) / 2', '3 / (2x + 5)', '(2x - 5) / 3'],
            correctAnswer: 0,
            solution: 'Let y = (2x + 5) / 3.\nSwap x and y: x = (2y + 5) / 3.\nMultiply by 3: 3x = 2y + 5.\nSubtract 5: 3x - 5 = 2y.\nDivide by 2: y = (3x - 5) / 2.',
            topic: 'Functions & Relations',
            competency: 'Determine inverse functions and domain/range',
            difficulty: 'medium',
            difficultyParameter: 0.6,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Analyzing',
            misconceptionCategory: 'Inverting coefficients instead of swapping variables',
            hint1: 'Swap the roles of x and y and solve for y.',
            hint2: 'Multiply both sides by 3 to clear the denominator.',
            explanation: 'Swapping x and y gives x = (2y + 5)/3 => 3x = 2y + 5 => y = (3x - 5)/2.',
            remediation: 'Practice isolating y step-by-step when finding inverse functions.',
            status: 'Active'
          },
          {
            id: 'p5',
            question: 'Solve for x: (2 / (x - 1)) + 1 = 5 / (x - 1).',
            options: ['4', '2', '3', 'No solution'],
            correctAnswer: 0,
            solution: 'Subtract 2/(x-1) from both sides:\n1 = (5 - 2) / (x - 1)\n1 = 3 / (x - 1)\nx - 1 = 3\nx = 4. Check domain: x ≠ 1, so x = 4 is valid.',
            topic: 'Functions & Relations',
            competency: 'Solve rational equations & inequalities',
            difficulty: 'hard',
            difficultyParameter: 1.4,
            discriminationParameter: 1.4,
            cognitiveLevel: 'Evaluating / Problem Solving',
            misconceptionCategory: 'Failing to check for extraneous solutions',
            hint1: 'Combine terms with the common denominator (x - 1).',
            hint2: '1 = 3 / (x - 1), then cross-multiply.',
            explanation: 'Subtracting 2/(x-1) gives 1 = 3/(x-1), which implies x - 1 = 3, so x = 4.',
            remediation: 'Practice clearing rational fractions and testing restricted domain values.',
            status: 'Active'
          }
        ]
      },
      {
        id: 'func-adv',
        title: 'Advanced Calculus Fundamentals',
        description: 'Deep dive into limits and differentiation concepts.',
        topicId: 'functions',
        xpReward: 200,
        problems: [
          {
            id: 'adv1',
            question: 'Evaluate the limit of (x² - 1) / (x - 1) as x approaches 1.',
            options: ['0', '1', '2', 'Undefined'],
            correctAnswer: 2,
            solution: 'Factor the numerator: ((x-1)(x+1)) / (x-1). For x ≠ 1, this simplifies to x + 1. As x approaches 1, 1 + 1 = 2.',
            topic: 'Functions & Relations',
            competency: 'Calculate limits of algebraic functions',
            difficulty: 'hard',
            difficultyParameter: 1.5,
            discriminationParameter: 1.6,
            cognitiveLevel: 'Analyzing',
            misconceptionCategory: 'Plugging in 1 directly and getting 0/0',
            hint1: 'Try factoring the numerator first.',
            hint2: 'Cancel the common (x-1) factor then substitute.',
            explanation: 'Factor numerator as (x-1)(x+1). Simplifies to x+1 for x≠1, limiting to 2.',
            remediation: 'Practice limit techniques for 0/0 indeterminacy.',
            status: 'Active'
          }
        ]
      },
      {
        id: 'func-midterm',
        title: 'Functions Midterm Exam',
        description: 'A comprehensive assessment covering function identification, evaluation, composition, and inverses.',
        topicId: 'functions',
        xpReward: 300,
        problems: [
          {
            id: 'mid1',
            question: 'Which relation is NOT a function?',
            options: ['{(1,1), (2,2), (3,3)}', 'y = x^2', 'x = |y|', 'y = 2x + 1'],
            correctAnswer: 2,
            solution: 'For x = |y|, if x = 4, y can be 2 or -2. This violates the definition of a function.',
            topic: 'Functions & Relations',
            competency: 'Identify functions from relations',
            difficulty: 'medium',
            difficultyParameter: 0.5,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Confusing relations with functions',
            hint1: 'Test if one x maps to more than one y.',
            hint2: 'A circle or parabola opening sideways fails the vertical line test.',
            explanation: 'In x = |y|, a single input (e.g., 4) produces two outputs (2 and -2).',
            remediation: 'Review definition of functions and vertical line test.',
            status: 'Active'
          },
          {
            id: 'mid2',
            question: 'Given f(x) = x^2 - 4, what is f(x+h)?',
            options: ['x^2 + h^2 - 4', 'x^2 + 2xh + h^2 - 4', 'x^2 + h - 4', 'x^2 + 2xh - 4'],
            correctAnswer: 1,
            solution: 'f(x+h) = (x+h)^2 - 4 = x^2 + 2xh + h^2 - 4.',
            topic: 'Functions & Relations',
            competency: 'Evaluate functions at algebraic expressions',
            difficulty: 'hard',
            difficultyParameter: 1.2,
            discriminationParameter: 1.5,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Forgetting to expand (x+h)^2 correctly',
            hint1: 'Substitute (x+h) for x everywhere.',
            hint2: 'Remember (x+h)^2 = x^2 + 2xh + h^2.',
            explanation: 'f(x+h) requires substituting (x+h) into the x term, resulting in (x+h)^2 - 4.',
            remediation: 'Practice algebraic expansion of binomials.',
            status: 'Active'
          }
        ]
      },
      {
        id: 'func-midterm',
        title: 'Functions Midterm Exam',
        description: 'A comprehensive assessment covering function identification, evaluation, composition, and inverses.',
        topicId: 'functions',
        xpReward: 300,
        problems: [
          {
            id: 'mid1',
            question: 'Which relation is NOT a function?',
            options: ['{(1,1), (2,2), (3,3)}', 'y = x^2', 'x = |y|', 'y = 2x + 1'],
            correctAnswer: 2,
            solution: 'For x = |y|, if x = 4, y can be 2 or -2. This violates the definition of a function.',
            topic: 'Functions & Relations',
            competency: 'Identify functions from relations',
            difficulty: 'medium',
            difficultyParameter: 0.5,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Confusing relations with functions',
            hint1: 'Test if one x maps to more than one y.',
            hint2: 'A circle or parabola opening sideways fails the vertical line test.',
            explanation: 'In x = |y|, a single input (e.g., 4) produces two outputs (2 and -2).',
            remediation: 'Review definition of functions and vertical line test.',
            status: 'Active'
          },
          {
            id: 'mid2',
            question: 'Given f(x) = x^2 - 4, what is f(x+h)?',
            options: ['x^2 + h^2 - 4', 'x^2 + 2xh + h^2 - 4', 'x^2 + h - 4', 'x^2 + 2xh - 4'],
            correctAnswer: 1,
            solution: 'f(x+h) = (x+h)^2 - 4 = x^2 + 2xh + h^2 - 4.',
            topic: 'Functions & Relations',
            competency: 'Evaluate functions at algebraic expressions',
            difficulty: 'hard',
            difficultyParameter: 1.2,
            discriminationParameter: 1.5,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Forgetting to expand (x+h)^2 correctly',
            hint1: 'Substitute (x+h) for x everywhere.',
            hint2: 'Remember (x+h)^2 = x^2 + 2xh + h^2.',
            explanation: 'f(x+h) requires substituting (x+h) into the x term, resulting in (x+h)^2 - 4.',
            remediation: 'Practice algebraic expansion of binomials.',
            status: 'Active'
          }
        ]
      },
      {
        id: 'trig-apps',
        title: 'Trigonometric Applications',
        description: 'Solving practical real-world problems using trigonometric functions.',
        topicId: 'trig',
        xpReward: 250,
        problems: [
          {
            id: 'app1',
            question: 'A ladder 10m long leans against a wall at an angle of 60° with the ground. How high up the wall does it reach?',
            options: ['5m', '5√3m', '10√3m', '5/√3m'],
            correctAnswer: 1,
            solution: 'sin(60°) = height / hypotenuse\nheight = 10 * sin(60°) = 10 * (√3 / 2) = 5√3.',
            topic: 'Trigonometry',
            competency: 'Apply trig ratios to real world problems',
            difficulty: 'medium',
            difficultyParameter: 0.5,
            discriminationParameter: 1.1,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Using cosine instead of sine',
            hint1: 'Draw the right triangle.',
            hint2: 'sin(angle) = opposite / hypotenuse.',
            explanation: 'The height is opposite the angle, so we use sin(60°) = height / 10.',
            remediation: 'Review SOH CAH TOA application.',
            status: 'Active'
          }
        ]
      }
    ],
  },
  {
    id: 'trig',
    title: 'Trigonometry',
    description: 'Explore the relationships between angles and sides of triangles.',
    icon: 'Triangle',
    color: 'emerald',
    quizzes: [
      {
        id: 'trig-ratios',
        title: 'Trigonometric Ratios & Waves',
        description: 'SOH CAH TOA, unit circle, and sinusoidal graphs.',
        topicId: 'trig',
        xpReward: 120,
        problems: [
          {
            id: 't1',
            question: 'In a right triangle, if sin(θ) = 3/5, what is cos(θ)?',
            options: ['4/5', '3/4', '5/3', '1/2'],
            correctAnswer: 0,
            solution: 'Using the Pythagorean identity: sin²θ + cos²θ = 1\n(3/5)² + cos²θ = 1\n9/25 + cos²θ = 1\ncos²θ = 1 - 9/25 = 16/25\ncosθ = √(16/25) = 4/5',
            topic: 'Trigonometry',
            competency: 'Apply Pythagorean identities to find trigonometric ratios',
            difficulty: 'easy',
            difficultyParameter: -0.8,
            discriminationParameter: 1.5,
            cognitiveLevel: 'Applying / Analyzing',
            misconceptionCategory: 'Failing to square the fraction properly',
            hint1: 'Recall the Pythagorean identity: sin²θ + cos²θ = 1.',
            hint2: 'Square 3/5 and subtract it from 1.',
            explanation: 'Using the Pythagorean identity sin²θ + cos²θ = 1: (3/5)² + cos²θ = 1 => 9/25 + cos²θ = 1 => cos²θ = 16/25 => cosθ = 4/5.',
            remediation: 'Review the fundamental trigonometric identities and fraction operations.',
            status: 'Active'
          },
          {
            id: 't2',
            question: 'What is the exact value of cos(150°)?',
            options: ['-√3 / 2', '-1/2', '√3 / 2', '1/2'],
            correctAnswer: 0,
            solution: '150° is in Quadrant II, where cosine is negative. Reference angle is 180° - 150° = 30°. cos(30°) = √3/2, therefore cos(150°) = -√3/2.',
            topic: 'Trigonometry',
            competency: 'Evaluate trigonometric functions of special and unit circle angles',
            difficulty: 'medium',
            difficultyParameter: 0.4,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Missing the negative sign in Quadrant II for cosine',
            hint1: 'Which quadrant does 150° lie in? Remember CAST / All Students Take Calculus.',
            hint2: 'The reference angle with the x-axis is 180° - 150° = 30°.',
            explanation: 'In Quadrant II, cosine is negative. The reference angle is 30°, so cos(150°) = -cos(30°) = -√3/2.',
            remediation: 'Practice quadrant signs and unit circle reference angles.',
            status: 'Active'
          },
          {
            id: 't3',
            question: 'What is the period of the function f(x) = 4 sin(3x - π) + 2?',
            options: ['2π/3', '3π', 'π/3', '4π'],
            correctAnswer: 0,
            solution: 'For a sinusoidal function y = A sin(Bx - C) + D, the period is given by T = 2π / |B|. Here B = 3, so the period is 2π/3.',
            topic: 'Trigonometry',
            competency: 'Graph sinusoidal wave functions',
            difficulty: 'medium',
            difficultyParameter: 0.7,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Analyzing / Creating',
            misconceptionCategory: 'Confusing amplitude A with frequency multiplier B',
            hint1: 'The period formula for sine waves is 2π / B.',
            hint2: 'Identify the coefficient inside the sine multiplying x.',
            explanation: 'The period is 2π / B. Since B = 3, Period = 2π/3.',
            remediation: 'Review sinusoidal parameters: A (amplitude), B (frequency), C/B (phase shift), D (vertical shift).',
            status: 'Active'
          },
          {
            id: 't4',
            question: 'Which of the following expressions is identically equal to (sin 2θ) / (2 sin θ)?',
            options: ['cos θ', 'tan θ', 'sec θ', 'sin² θ'],
            correctAnswer: 0,
            solution: 'Use the double-angle identity: sin(2θ) = 2 sin(θ) cos(θ).\nThen (2 sin θ cos θ) / (2 sin θ) = cos θ.',
            topic: 'Trigonometry',
            competency: 'Verify trigonometric identities and double-angle formulas',
            difficulty: 'hard',
            difficultyParameter: 1.6,
            discriminationParameter: 1.4,
            cognitiveLevel: 'Evaluating / Proving',
            misconceptionCategory: 'Canceling 2 from inside sin(2θ)',
            hint1: 'Recall the double-angle identity for sin(2θ).',
            hint2: 'sin(2θ) = 2 sin θ cos θ.',
            explanation: 'sin(2θ) = 2 sin θ cos θ. Dividing by 2 sin θ cancels terms to leave cos θ.',
            remediation: 'Review double angle formulas for sine and cosine.',
            status: 'Active'
          },
          {
            id: 't5',
            question: 'Find all solutions for 2 cos(x) - 1 = 0 on the interval [0, 2π).',
            options: ['π/3, 5π/3', 'π/6, 11π/6', '2π/3, 4π/3', 'π/3, 2π/3'],
            correctAnswer: 0,
            solution: '2 cos(x) = 1 => cos(x) = 1/2.\nCosine is positive in Quadrants I and IV.\nIn Quadrant I: x = π/3.\nIn Quadrant IV: x = 2π - π/3 = 5π/3.',
            topic: 'Trigonometry',
            competency: 'Solve trigonometric equations on specified intervals',
            difficulty: 'hard',
            difficultyParameter: 1.8,
            discriminationParameter: 1.5,
            cognitiveLevel: 'Evaluating',
            misconceptionCategory: 'Forgetting the Quadrant IV solution',
            hint1: 'Isolate cos(x): cos(x) = 1/2.',
            hint2: 'Cosine is positive in Quadrants I and IV on [0, 2π).',
            explanation: 'cos(x) = 1/2 corresponds to x = π/3 (60°) in Q1 and x = 5π/3 (300°) in Q4.',
            remediation: 'Review inverse cosine and interval solutions.',
            status: 'Active'
          }
        ]
      }
    ]
  },
  {
    id: 'exp-log',
    title: 'Exponentials & Logs',
    description: 'Growth, decay, and the power of logarithms.',
    icon: 'TrendingUp',
    color: 'orange',
    quizzes: [
      {
        id: 'log-props',
        title: 'Logarithms & Exponential Growth',
        description: 'Master the rules of logs and modeling real-world growth.',
        topicId: 'exp-log',
        xpReward: 150,
        problems: [
          {
            id: 'l1',
            question: 'What is log₂(32)?',
            options: ['4', '5', '6', '16'],
            correctAnswer: 1,
            solution: 'By definition, log_b(x) = y means b^y = x.\nSo log₂(32) = y means 2^y = 32.\nSince 2⁵ = 32, y = 5.',
            topic: 'Exponentials & Logs',
            competency: 'Evaluate logarithmic and exponential expressions',
            difficulty: 'easy',
            difficultyParameter: -0.5,
            discriminationParameter: 1.0,
            cognitiveLevel: 'Understanding',
            misconceptionCategory: 'Confusing logs with division (e.g., 32/2 = 16)',
            hint1: 'A logarithm asks: "2 to what power equals 32?"',
            hint2: 'Try multiplying 2 by itself: 2, 4, 8, 16, 32...',
            explanation: '2⁵ = 32, so log₂(32) = 5.',
            remediation: 'Review the relationship between exponential and logarithmic forms.',
            status: 'Active'
          },
          {
            id: 'l2',
            question: 'Express log(x³) + log(y) - log(z) as a single logarithm.',
            options: ['log(x³y / z)', 'log(3xy / z)', 'log(x³ + y - z)', '3 log(xy/z)'],
            correctAnswer: 0,
            solution: 'Use the product rule: log(x³) + log(y) = log(x³y).\nUse the quotient rule: log(x³y) - log(z) = log(x³y / z).',
            topic: 'Exponentials & Logs',
            competency: 'Apply properties of logarithms to simplify expressions',
            difficulty: 'medium',
            difficultyParameter: 0.3,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Adding arguments instead of multiplying them',
            hint1: 'log A + log B = log(AB).',
            hint2: 'log A - log C = log(A / C).',
            explanation: 'Combining product and quotient rules gives log(x³y / z).',
            remediation: 'Practice expanding and condensing logarithmic expressions using log laws.',
            status: 'Active'
          },
          {
            id: 'l3',
            question: 'Solve for x: 3^(2x - 1) = 27.',
            options: ['2', '3', '1', '4'],
            correctAnswer: 0,
            solution: 'Express both sides with base 3: 27 = 3³.\n3^(2x - 1) = 3³\nSince bases are equal, 2x - 1 = 3\n2x = 4 => x = 2.',
            topic: 'Exponentials & Logs',
            competency: 'Solve exponential and logarithmic equations',
            difficulty: 'medium',
            difficultyParameter: 0.8,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Analyzing',
            misconceptionCategory: 'Dividing exponent by base',
            hint1: 'Write 27 as a power of 3.',
            hint2: 'Equate the exponents: 2x - 1 = 3.',
            explanation: '3^(2x - 1) = 3³, so 2x - 1 = 3, which gives 2x = 4, x = 2.',
            remediation: 'Practice matching exponential bases to solve exponential equations.',
            status: 'Active'
          },
          {
            id: 'l4',
            question: 'A bacterial culture doubles every 3 hours. If the initial population is 500, what will the population be after 9 hours?',
            options: ['4,000', '1,500', '3,000', '8,000'],
            correctAnswer: 0,
            solution: 'Number of doubling periods n = 9 / 3 = 3 periods.\nP = P₀ * 2^n = 500 * 2³ = 500 * 8 = 4,000 bacteria.',
            topic: 'Exponentials & Logs',
            competency: 'Model real-world exponential growth and decay',
            difficulty: 'hard',
            difficultyParameter: 1.5,
            discriminationParameter: 1.4,
            cognitiveLevel: 'Evaluating / Modeling',
            misconceptionCategory: 'Multiplying 500 by 2 then cubing, or multiplying 500 by 3',
            hint1: 'How many 3-hour periods are in 9 hours?',
            hint2: 'Formula: P = P₀ * 2^(t / d).',
            explanation: 'In 9 hours, the bacteria doubles 9/3 = 3 times: 500 * 2³ = 500 * 8 = 4000.',
            remediation: 'Review exponential growth models P(t) = P₀ * b^(t/k).',
            status: 'Active'
          },
          {
            id: 'l5',
            question: 'An investment of $1,000 earns 6% annual interest compounded annually. How much is in the account after 2 years?',
            options: ['$1,123.60', '$1,120.00', '$1,060.00', '$1,200.00'],
            correctAnswer: 0,
            solution: 'Using the compound interest formula: A = P(1 + r)^t\nA = 1000 * (1 + 0.06)² = 1000 * (1.06)² = 1000 * 1.1236 = $1,123.60.',
            topic: 'Exponentials & Logs',
            competency: 'Calculate compound interest and annuities in financial mathematics',
            difficulty: 'hard',
            difficultyParameter: 1.7,
            discriminationParameter: 1.5,
            cognitiveLevel: 'Applying / Creating',
            misconceptionCategory: 'Using simple interest (1000 * 0.06 * 2 = 120)',
            hint1: 'Recall the compound interest formula: A = P(1 + r)^t.',
            hint2: 'Calculate (1.06)² first, then multiply by 1000.',
            explanation: 'A = 1000 * (1.06)² = 1000 * 1.1236 = $1,123.60.',
            remediation: 'Contrast simple interest vs compound interest growth over time.',
            status: 'Active'
          }
        ]
      }
    ]
  }
];

export const achievements = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Complete your first quiz.',
    icon: 'Award',
    requirement: 'quiz_count >= 1'
  },
  {
    id: 'perfect-score',
    title: 'Perfect Precision',
    description: 'Get a 100% score on a quiz.',
    icon: 'Target',
    requirement: 'perfect_score === true'
  },
  {
    id: 'topic-master',
    title: 'Curriculum Explorer',
    description: 'Study 5 different math topics.',
    icon: 'Map',
    requirement: 'unique_topics >= 5'
  },
  {
    id: 'math-whiz',
    title: 'Math Whiz',
    description: 'Earn 1000 XP.',
    icon: 'Zap',
    requirement: 'xp >= 1000'
  },
  {
    id: 'streak-starter',
    title: 'Streak Starter',
    description: 'Maintain a 3-day study streak.',
    icon: 'Activity',
    requirement: 'streak >= 3'
  }
];
