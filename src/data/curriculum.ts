import { Topic } from '../types';
import { SUMMATIVE_ASSESSMENTS } from './summativeAssessments';

export const topics: Topic[] = [
  {
    id: 'functions',
    title: 'Functions & Relations',
    description: 'Master the building blocks of algebra: mapping inputs to outputs.',
    icon: 'Activity',
    color: 'blue',
    term: 'Term 1',
    week: 'Week 1',
    weekNumber: 1,
    weeklyFocus: 'Master relations, functions, piecewise evaluation, and composite functions in Grade 11 General Mathematics.',
    performanceTask: {
      assigned: true,
      number: 1,
      title: 'Function Mapping Portfolio',
      description: 'Document real-world functional relationships in everyday scenarios.',
      weightPercentage: 20
    },
    summativeAssessment: SUMMATIVE_ASSESSMENTS.find(a => a.id === 'summative-functions'),
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
        { day: 'MONDAY', date: 'Aug. 10, 2026', lessonTitle: 'Understanding Relations, Functions, and Vertical Line Test', activityType: 'Whole Class' },
        { day: 'TUESDAY', date: 'Aug. 11, 2026', lessonTitle: 'Evaluating Functions and Piecewise Defined Functions', activityType: 'Group Work' },
        { day: 'WEDNESDAY', date: 'Aug. 12, 2026', lessonTitle: 'Performing Operations on Functions (Addition, Subtraction, Multiplication)', activityType: 'Pair Work' },
        { day: 'THURSDAY', date: 'Aug. 13, 2026', lessonTitle: 'Composition of Functions (f ∘ g)(x) and Inverse Concepts', activityType: 'Whole Class' },
        { day: 'FRIDAY', date: 'Aug. 14, 2026', lessonTitle: 'Real-Life Problems Involving Functions, Piecewise Rates, and Assessment', activityType: 'Individual Work' }
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
          successThreshold: '75% accuracy benchmark across all 5 Intended Learning Outcomes.',
          summativeAssessmentPlan: '10-item Unit 1 Summative Examination aligned with DepEd Table of Specifications (TOS) measuring M11GM-Ia-1, M11GM-Ia-2, M11GM-Ia-3, M11GM-Id-2, and M11GM-Ib-1.'
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
        id: 'rational-equations',
        title: 'Rational Equations & Inequalities',
        description: 'Solve rational equations, clear denominators using LCDs, and eliminate extraneous solutions.',
        topicId: 'functions',
        xpReward: 150,
        problems: [
          {
            id: 'rat-easy-1',
            question: 'Solve the elementary rational equation: 6 / x = 2.',
            options: ['x = 3', 'x = 12', 'x = 1/3', 'x = 4'],
            correctAnswer: 0,
            solution: 'Multiply both sides by x: 6 = 2x => x = 3. Check domain: 3 ≠ 0, valid.',
            topic: 'Functions & Relations',
            competency: 'Solve rational equations & inequalities',
            difficulty: 'easy',
            difficultyParameter: -0.9,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Understanding',
            misconceptionCategory: 'Multiplying 6 by 2 to get 12',
            hint1: 'Multiply both sides by x to get x out of the denominator.',
            hint2: '6 = 2x, then divide by 2.',
            explanation: 'Cross multiplying gives 2x = 6, which yields x = 3.',
            remediation: 'Practice one-step rational equations.',
            status: 'Active'
          },
          {
            id: 'rat-easy-2',
            question: 'What is the restricted value (domain restriction) of x for the equation: 5 / (x - 3) = 10?',
            options: ['x ≠ 3', 'x ≠ -3', 'x ≠ 0', 'x ≠ 2'],
            correctAnswer: 0,
            solution: 'The denominator is x - 3. Setting the denominator equal to zero: x - 3 = 0 => x = 3. Because division by zero is undefined, x cannot equal 3 (x ≠ 3).',
            topic: 'Functions & Relations',
            competency: 'Solve rational equations & inequalities',
            difficulty: 'easy',
            difficultyParameter: -0.7,
            discriminationParameter: 1.4,
            cognitiveLevel: 'Remembering / Understanding',
            misconceptionCategory: 'Sign error when solving denominator linear equation',
            hint1: 'A rational expression is undefined when its denominator equals zero.',
            hint2: 'Set the denominator equal to zero: x - 3 = 0, and solve for x.',
            hint3: 'Add 3 to both sides of x - 3 = 0 to find the restricted value.',
            explanation: 'Any x-value that produces zero in the denominator is restricted: x - 3 = 0 yields x = 3, so x ≠ 3.',
            remediation: 'Review domain restrictions of rational expressions.',
            status: 'Active'
          },
          {
            id: 'rat-med-1',
            question: 'Solve for x: (x / 3) + (1 / 2) = 5 / 6.',
            options: ['x = 1', 'x = 2', 'x = 3', 'x = 4'],
            correctAnswer: 0,
            solution: 'Multiply by LCD = 6: 6(x/3) + 6(1/2) = 6(5/6) => 2x + 3 = 5 => 2x = 2 => x = 1.',
            topic: 'Functions & Relations',
            competency: 'Solve rational equations & inequalities',
            difficulty: 'medium',
            difficultyParameter: 0.1,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Adding numerators without finding common denominator',
            hint1: 'The LCD of 3, 2, and 6 is 6.',
            hint2: 'Multiply every term by 6: 2x + 3 = 5.',
            explanation: 'Clearing denominators with LCD 6 gives 2x + 3 = 5, so x = 1.',
            remediation: 'Practice clearing fractions using LCD.',
            status: 'Active'
          },
          {
            id: 'rat-med-2',
            question: 'Solve for x: (3 / (x + 2)) = 1 / 4.',
            options: ['x = 10', 'x = 14', 'x = 8', 'x = -2'],
            correctAnswer: 0,
            solution: 'Cross-multiply: 3(4) = 1(x + 2) => 12 = x + 2 => x = 10. Check: 10 ≠ -2.',
            topic: 'Functions & Relations',
            competency: 'Solve rational equations & inequalities',
            difficulty: 'medium',
            difficultyParameter: 0.3,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Cross-multiplying incorrectly',
            hint1: 'Cross-multiply: 3 * 4 = 1 * (x + 2).',
            hint2: '12 = x + 2, subtract 2 from both sides.',
            explanation: 'Cross-multiplication gives 12 = x + 2, so x = 10.',
            remediation: 'Practice proportion-style rational equations.',
            status: 'Active'
          },
          {
            id: 'rat-hard-1',
            question: 'Solve for x: (x / (x - 2)) = (2 / (x - 2)) + 2. Check for extraneous roots.',
            options: ['No real solution (x = 2 is extraneous)', 'x = 2', 'x = 0', 'x = 4'],
            correctAnswer: 0,
            solution: 'Multiply by LCD (x - 2): x = 2 + 2(x - 2) => x = 2 + 2x - 4 => x = 2x - 2 => x = 2. But x = 2 makes original denominator (x - 2) = 0! Thus x = 2 is extraneous. No solution exists.',
            topic: 'Functions & Relations',
            competency: 'Solve rational equations & inequalities',
            difficulty: 'hard',
            difficultyParameter: 1.6,
            discriminationParameter: 1.7,
            cognitiveLevel: 'Evaluating / Problem Solving',
            misconceptionCategory: 'Accepting extraneous solution x = 2 without domain check',
            hint1: 'Multiply by (x - 2) to get x = 2 + 2(x - 2).',
            hint2: 'You get algebraic candidate x = 2. Does x = 2 work in the original denominators?',
            explanation: 'Algebraic manipulation yields x = 2, which produces division by zero in the original equation. Hence x = 2 is extraneous and there is no solution.',
            remediation: 'Master extraneous solution verification in rational equations.',
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
    summativeAssessment: SUMMATIVE_ASSESSMENTS.find(a => a.id === 'summative-trig'),
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
    term: 'Term 1',
    week: 'Week 2',
    weekNumber: 2,
    weeklyFocus: 'Master exponential equations, logarithmic laws, and real-world growth & decay models.',
    performanceTask: {
      assigned: false
    },
    summativeAssessment: SUMMATIVE_ASSESSMENTS.find(a => a.id === 'summative-exp-log'),
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
  },
  /* ================= TERM 2 CURRICULUM (8 WEEKS, 5 PERFORMANCE TASKS) ================= */
  {
    id: 'term2-w1-piecewise',
    title: 'Piecewise Functions',
    description: 'Illustrate piecewise functions in practical contexts (fare rates, purchasing, income tax) and solve practical problems.',
    icon: 'Activity',
    color: 'orange',
    term: 'Term 2',
    week: 'Week 1',
    weekNumber: 1,
    weeklyFocus: 'Illustrate a piecewise function in practical contexts (fare rates, purchasing, income tax); solve practical problems involving piecewise functions.',
    performanceTask: {
      assigned: true,
      number: 1,
      title: 'Piecewise Functions Real-World Modeling Project',
      description: 'Formulate and evaluate real-world piecewise functions based on jeepney fare matrices, electricity billing tiers, or progressive income tax schedules.',
      weightPercentage: 20
    },
    quizzes: [],
    lessonPlan: {
      id: 'lp-term2-w1',
      topicId: 'term2-w1-piecewise',
      title: 'Week 1 Lesson Plan — Piecewise Functions',
      gradeLevel: 'Grade 11 - General Mathematics',
      duration: '60 minutes / day',
      subject: 'General Mathematics',
      term: 'Term 2',
      week: 'Week 1',
      weeklySchedule: [
        { day: 'MONDAY', date: 'Oct. 12, 2026', lessonTitle: 'Introduction to Piecewise Functions', activityType: 'Whole Class', objective: 'Define piecewise functions and identify domain intervals.' },
        { day: 'TUESDAY', date: 'Oct. 13, 2026', lessonTitle: 'Piecewise Functions in Fare Rates', activityType: 'Group Work', objective: 'Model transportation fare matrices as piecewise linear equations.' },
        { day: 'WEDNESDAY', date: 'Oct. 14, 2026', lessonTitle: 'Piecewise Functions in Purchasing', activityType: 'Pair Work', objective: 'Calculate bulk pricing discounts using piecewise step functions.' },
        { day: 'THURSDAY', date: 'Oct. 15, 2026', lessonTitle: 'Piecewise Functions in Income Tax Computation', activityType: 'Whole Class', objective: 'Evaluate progressive tax brackets using domain constraints.' },
        { day: 'FRIDAY', date: 'Oct. 16, 2026', lessonTitle: 'Word Problems Involving Piecewise Functions', activityType: 'Individual Work', objective: 'Solve contextual word problems and complete Performance Task 1.' }
      ],
      prerequisites: ['Linear Functions', 'Cartesian Coordinates'],
      learningCompetencies: ['M11GM-Ia-1: Represents real-life situations using functions, including piece-wise functions.'],
      objectives: {
        cognitive: 'Formulate piecewise function equations from practical context statements.',
        psychomotor: 'Plot piecewise functions on Cartesian graphs accurately.',
        affective: 'Appreciate how mathematical models govern utility rates and taxation.'
      },
      materialsNeeded: ['Graphing paper', 'Fare rate matrices', 'Calculators'],
      keyConcepts: [{ term: 'Piecewise Function', definition: 'A function defined by multiple sub-functions over specific intervals.' }],
      workedExamples: [],
      procedures: [],
      differentiation: { remediation: 'Interval substitution worksheets.', enrichment: 'Multi-step electric bill modeling.' },
      assessmentPlan: 'Performance Task 1 submission and 5-item Friday formative check.'
    }
  },
  {
    id: 'term2-w2-statistics',
    title: 'Statistics: Data, Central Tendency & Variability',
    description: 'Grouped and ungrouped data analysis, measures of central tendency, range, variance, and standard deviation.',
    icon: 'TrendingUp',
    color: 'emerald',
    term: 'Term 2',
    week: 'Week 2',
    weekNumber: 2,
    weeklyFocus: 'Calculate and interpret mean, median, mode, and measures of variability for grouped and ungrouped statistical data sets.',
    performanceTask: {
      assigned: true,
      number: 2,
      title: 'Statistical Survey & Data Analysis Report',
      description: 'Collect real class survey data, compute measures of central tendency & variance, and draw statistical conclusions.',
      weightPercentage: 20
    },
    quizzes: [],
    lessonPlan: {
      id: 'lp-term2-w2',
      topicId: 'term2-w2-statistics',
      title: 'Week 2 Lesson Plan — Statistics & Central Tendency',
      gradeLevel: 'Grade 11 - Statistics & Probability',
      duration: '60 minutes / day',
      subject: 'Statistics & Probability',
      term: 'Term 2',
      week: 'Week 2',
      weeklySchedule: [
        { day: 'MONDAY', date: 'Oct. 19, 2026', lessonTitle: 'Introduction to Central Tendency & Data Types', activityType: 'Whole Class' },
        { day: 'TUESDAY', date: 'Oct. 20, 2026', lessonTitle: 'Calculating Mean, Median, and Mode for Grouped Data', activityType: 'Group Work' },
        { day: 'WEDNESDAY', date: 'Oct. 21, 2026', lessonTitle: 'Measures of Variability & Range Computation', activityType: 'Pair Work' },
        { day: 'THURSDAY', date: 'Oct. 22, 2026', lessonTitle: 'Variance & Standard Deviation in Sample Sets', activityType: 'Whole Class' },
        { day: 'FRIDAY', date: 'Oct. 23, 2026', lessonTitle: 'Statistical Interpretation & Survey Data Presentation', activityType: 'Individual Work' }
      ],
      prerequisites: ['Frequency Distribution Tables', 'Basic Arithmetic'],
      learningCompetencies: ['M11/12SP-IIIa-1: Computes mean, variance, and standard deviation.'],
      objectives: {
        cognitive: 'Differentiate between measures of central tendency and dispersion.',
        psychomotor: 'Calculate variance and standard deviation accurately.',
        affective: 'Value data-driven decision making.'
      },
      materialsNeeded: ['Scientific calculators', 'Sample survey datasets'],
      keyConcepts: [{ term: 'Standard Deviation', definition: 'A measure of the amount of variation or dispersion of a set of values.' }],
      workedExamples: [],
      procedures: [],
      differentiation: { remediation: 'Guided variance calculation templates.', enrichment: 'Interquartile range analysis.' },
      assessmentPlan: 'Performance Task 2 presentation.'
    }
  },
  {
    id: 'term2-w3-trig-right',
    title: 'Trigonometry: Right Triangles',
    description: 'SOH-CAH-TOA, trigonometric ratios, angles of elevation and depression, and right triangle problem solving.',
    icon: 'Triangle',
    color: 'orange',
    term: 'Term 2',
    week: 'Week 3',
    weekNumber: 3,
    weeklyFocus: 'Apply trigonometric ratios (sine, cosine, tangent) to solve right triangle problems involving angles of elevation and depression.',
    performanceTask: {
      assigned: false
    },
    quizzes: [],
    lessonPlan: {
      id: 'lp-term2-w3',
      topicId: 'term2-w3-trig-right',
      title: 'Week 3 Lesson Plan — Trigonometry: Right Triangles',
      gradeLevel: 'Grade 11 - General Mathematics',
      duration: '60 minutes / day',
      subject: 'General Mathematics',
      term: 'Term 2',
      week: 'Week 3',
      weeklySchedule: [
        { day: 'MONDAY', date: 'Oct. 26, 2026', lessonTitle: 'Primary Trigonometric Ratios (Sine, Cosine, Tangent)', activityType: 'Whole Class' },
        { day: 'TUESDAY', date: 'Oct. 27, 2026', lessonTitle: 'Solving Right Triangles with SOH-CAH-TOA', activityType: 'Pair Work' },
        { day: 'WEDNESDAY', date: 'Oct. 28, 2026', lessonTitle: 'Angles of Elevation and Depression', activityType: 'Group Work' },
        { day: 'THURSDAY', date: 'Oct. 29, 2026', lessonTitle: 'Practical Applications of Right Triangles', activityType: 'Whole Class' },
        { day: 'FRIDAY', date: 'Oct. 30, 2026', lessonTitle: 'Formative Right Triangle Drill & Problem Solving', activityType: 'Individual Work' }
      ],
      prerequisites: ['Pythagorean Theorem', 'Angle Measurement'],
      learningCompetencies: ['M9GE-IVe-1: Illustrates angles of elevation and angles of depression.'],
      objectives: {
        cognitive: 'Identify opposite, adjacent, and hypotenuse sides correctly.',
        psychomotor: 'Solve right triangle side lengths using trigonometric ratios.',
        affective: 'Recognize trigonometric applications in architecture and surveying.'
      },
      materialsNeeded: ['Clinometer', 'Scientific calculators'],
      keyConcepts: [{ term: 'SOH-CAH-TOA', definition: 'Mnemonic for sine = opp/hyp, cosine = adj/hyp, tangent = opp/adj.' }],
      workedExamples: [],
      procedures: [],
      differentiation: { remediation: 'Color-coded triangle labeling practice.', enrichment: 'Clinometer height measurement exercise.' },
      assessmentPlan: 'Formative right triangle quiz.'
    }
  },
  {
    id: 'term2-w4-trig-oblique',
    title: 'Trigonometry: Oblique Triangles',
    description: 'Law of Sines, Law of Cosines, ambiguous cases, and non-right triangle applications.',
    icon: 'Triangle',
    color: 'emerald',
    term: 'Term 2',
    week: 'Week 4',
    weekNumber: 4,
    weeklyFocus: 'Solve non-right (oblique) triangles using the Law of Sines and Law of Cosines in real-life navigation and engineering contexts.',
    performanceTask: {
      assigned: true,
      number: 3,
      title: 'Land Surveying & Triangulation Project',
      description: 'Apply Law of Sines and Cosines to solve a multi-point topographical triangulation problem for land area calculation.',
      weightPercentage: 20
    },
    quizzes: [],
    lessonPlan: {
      id: 'lp-term2-w4',
      topicId: 'term2-w4-trig-oblique',
      title: 'Week 4 Lesson Plan — Oblique Triangles',
      gradeLevel: 'Grade 11 - General Mathematics',
      duration: '60 minutes / day',
      subject: 'General Mathematics',
      term: 'Term 2',
      week: 'Week 4',
      weeklySchedule: [
        { day: 'MONDAY', date: 'Nov. 02, 2026', lessonTitle: 'Introduction to Oblique Triangles & SSA / SAS Cases', activityType: 'Whole Class' },
        { day: 'TUESDAY', date: 'Nov. 03, 2026', lessonTitle: 'Law of Sines and Practical Applications', activityType: 'Group Work' },
        { day: 'WEDNESDAY', date: 'Nov. 04, 2026', lessonTitle: 'Law of Cosines and Applications', activityType: 'Pair Work' },
        { day: 'THURSDAY', date: 'Nov. 05, 2026', lessonTitle: 'The Ambiguous Case (SSA) in Law of Sines', activityType: 'Whole Class' },
        { day: 'FRIDAY', date: 'Nov. 06, 2026', lessonTitle: 'Oblique Triangle Real-World Problem Solving', activityType: 'Individual Work' }
      ],
      prerequisites: ['Right Triangle Trigonometry'],
      learningCompetencies: ['M9GE-IVf-g-1: Solves problems involving oblique triangles.'],
      objectives: {
        cognitive: 'Determine whether to use Law of Sines or Law of Cosines based on given triangle parts.',
        psychomotor: 'Solve unknown sides and angles of non-right triangles.',
        affective: 'Appreciate triangulation methods in GPS and land surveying.'
      },
      materialsNeeded: ['Protractors', 'Scientific calculators'],
      keyConcepts: [{ term: 'Law of Sines', definition: 'a / sin A = b / sin B = c / sin C.' }],
      workedExamples: [],
      procedures: [],
      differentiation: { remediation: 'Law decision flowchart.', enrichment: 'Navigational bearing calculations.' },
      assessmentPlan: 'Performance Task 3 report submission.'
    }
  },
  {
    id: 'term2-w5-area-perimeter',
    title: 'Practical Measurement: Area & Perimeter',
    description: 'Polygons, composite figures, Heron\'s formula, sector area, and practical perimeter estimations.',
    icon: 'Target',
    color: 'orange',
    term: 'Term 2',
    week: 'Week 5',
    weekNumber: 5,
    weeklyFocus: 'Calculate area and perimeter of complex plane figures and regular polygons using Heron\'s formula and sector geometries.',
    performanceTask: {
      assigned: false
    },
    quizzes: [],
    lessonPlan: {
      id: 'lp-term2-w5',
      topicId: 'term2-w5-area-perimeter',
      title: 'Week 5 Lesson Plan — Practical Measurement',
      gradeLevel: 'Grade 11 - General Mathematics',
      duration: '60 minutes / day',
      subject: 'General Mathematics',
      term: 'Term 2',
      week: 'Week 5',
      weeklySchedule: [
        { day: 'MONDAY', date: 'Nov. 09, 2026', lessonTitle: 'Review of Composite Plane Figures', activityType: 'Whole Class' },
        { day: 'TUESDAY', date: 'Nov. 10, 2026', lessonTitle: 'Hero\'s Formula for Non-Right Triangular Area', activityType: 'Pair Work' },
        { day: 'WEDNESDAY', date: 'Nov. 11, 2026', lessonTitle: 'Sector Area and Arc Lengths in Circular Geometry', activityType: 'Group Work' },
        { day: 'THURSDAY', date: 'Nov. 12, 2026', lessonTitle: 'Practical Land & Floor Plan Measurement', activityType: 'Whole Class' },
        { day: 'FRIDAY', date: 'Nov. 13, 2026', lessonTitle: 'Area & Perimeter Estimation Drills', activityType: 'Individual Work' }
      ],
      prerequisites: ['Basic Geometry Formulas'],
      learningCompetencies: ['Computes perimeter and area of composite figures.'],
      objectives: {
        cognitive: 'Decompose complex composite shapes into standard geometric figures.',
        psychomotor: 'Apply Heron\'s formula to find area given three side lengths.',
        affective: 'Value accuracy in flooring and land surveying calculations.'
      },
      materialsNeeded: ['Rulers', 'Floor plan blueprints'],
      keyConcepts: [{ term: 'Heron\'s Formula', definition: 'Area = √(s(s-a)(s-b)(s-c)) where s = (a+b+c)/2.' }],
      workedExamples: [],
      procedures: [],
      differentiation: { remediation: 'Shape decomposition templates.', enrichment: 'Irregular parcel perimeter estimation.' },
      assessmentPlan: 'Formative plane geometry check.'
    }
  },
  {
    id: 'term2-w6-volume-cost',
    title: 'Volume, Capacity & Cost Estimation',
    description: 'Three-dimensional solid geometry, volume, volumetric capacity, surface area, and material cost budgeting.',
    icon: 'Database',
    color: 'emerald',
    term: 'Term 2',
    week: 'Week 6',
    weekNumber: 6,
    weeklyFocus: 'Determine volume, surface area, and capacity of prisms, pyramids, cylinders, and cones to estimate material and manufacturing costs.',
    performanceTask: {
      assigned: true,
      number: 4,
      title: 'Packaging Design & Cost Minimization Project',
      description: 'Construct a 3D container prototype, compute its volume and surface area, and determine the optimal cost per unit produced.',
      weightPercentage: 20
    },
    quizzes: [],
    lessonPlan: {
      id: 'lp-term2-w6',
      topicId: 'term2-w6-volume-cost',
      title: 'Week 6 Lesson Plan — Volume & Cost Estimation',
      gradeLevel: 'Grade 11 - General Mathematics',
      duration: '60 minutes / day',
      subject: 'General Mathematics',
      term: 'Term 2',
      week: 'Week 6',
      weeklySchedule: [
        { day: 'MONDAY', date: 'Nov. 16, 2026', lessonTitle: 'Volumes of Prisms, Pyramids, Cylinders & Cones', activityType: 'Whole Class' },
        { day: 'TUESDAY', date: 'Nov. 17, 2026', lessonTitle: 'Calculating Volume and Volumetric Capacity', activityType: 'Pair Work' },
        { day: 'WEDNESDAY', date: 'Nov. 18, 2026', lessonTitle: 'Surface Area and Packaging Material Calculations', activityType: 'Group Work' },
        { day: 'THURSDAY', date: 'Nov. 19, 2026', lessonTitle: 'Material Cost Estimation & Budgeting', activityType: 'Whole Class' },
        { day: 'FRIDAY', date: 'Nov. 20, 2026', lessonTitle: 'Applied Engineering Cost Analysis', activityType: 'Individual Work' }
      ],
      prerequisites: ['3D Solid Shapes', 'Surface Area'],
      learningCompetencies: ['Solves problems involving surface area, volume, and cost estimation.'],
      objectives: {
        cognitive: 'Relate surface area to raw material costs and volume to capacity.',
        psychomotor: 'Calculate fluid capacities and volumetric weights.',
        affective: 'Understand economical material utilization in manufacturing.'
      },
      materialsNeeded: ['3D solid models', 'Cardboard', 'Scissors'],
      keyConcepts: [{ term: 'Volumetric Capacity', definition: 'The volume of fluid or contents a 3D container can hold.' }],
      workedExamples: [],
      procedures: [],
      differentiation: { remediation: 'Net unfolding exercises.', enrichment: 'Surface-area-to-volume ratio optimization.' },
      assessmentPlan: 'Performance Task 4 packaging model evaluation.'
    }
  },
  {
    id: 'term2-w7-random-variables',
    title: 'Discrete Random Variables',
    description: 'Discrete probability distributions, mean, expected value, variance, and standard deviation of random variables.',
    icon: 'HelpCircle',
    color: 'orange',
    term: 'Term 2',
    week: 'Week 7',
    weekNumber: 7,
    weeklyFocus: 'Construct probability distributions for discrete random variables and compute expected values in games of chance and risk analysis.',
    performanceTask: {
      assigned: false
    },
    quizzes: [],
    lessonPlan: {
      id: 'lp-term2-w7',
      topicId: 'term2-w7-random-variables',
      title: 'Week 7 Lesson Plan — Discrete Random Variables',
      gradeLevel: 'Grade 11 - Statistics & Probability',
      duration: '60 minutes / day',
      subject: 'Statistics & Probability',
      term: 'Term 2',
      week: 'Week 7',
      weeklySchedule: [
        { day: 'MONDAY', date: 'Nov. 23, 2026', lessonTitle: 'Random Variables & Probability Mass Functions', activityType: 'Whole Class' },
        { day: 'TUESDAY', date: 'Nov. 24, 2026', lessonTitle: 'Mean / Expected Value E(X) of Discrete Variables', activityType: 'Pair Work' },
        { day: 'WEDNESDAY', date: 'Nov. 25, 2026', lessonTitle: 'Variance & Standard Deviation of Random Variables', activityType: 'Group Work' },
        { day: 'THURSDAY', date: 'Nov. 26, 2026', lessonTitle: 'Constructing Probability Distributions for Real Experiments', activityType: 'Whole Class' },
        { day: 'FRIDAY', date: 'Nov. 27, 2026', lessonTitle: 'Games of Chance & Expected Value Decision Problems', activityType: 'Individual Work' }
      ],
      prerequisites: ['Basic Probability Concepts'],
      learningCompetencies: ['M11/12SP-IIIa-1: Illustrates a random variable.'],
      objectives: {
        cognitive: 'Distinguish between discrete and continuous random variables.',
        psychomotor: 'Compute expected value E(X) = Σ x·P(x).',
        affective: 'Develop cautious financial reasoning regarding games of chance.'
      },
      materialsNeeded: ['Dice', 'Coins', 'Probability tables'],
      keyConcepts: [{ term: 'Expected Value E(X)', definition: 'The weighted average of all possible values of a random variable.' }],
      workedExamples: [],
      procedures: [],
      differentiation: { remediation: 'Coin flip tree diagrams.', enrichment: 'Insurance policy premium risk modeling.' },
      assessmentPlan: 'Formative probability check.'
    }
  },
  {
    id: 'term2-w8-normal-distribution',
    title: 'The Normal Distribution',
    description: 'Continuous probability, standard normal curve, Z-scores, empirical rule, and probability under the normal curve.',
    icon: 'Zap',
    color: 'emerald',
    term: 'Term 2',
    week: 'Week 8',
    weekNumber: 8,
    weeklyFocus: 'Apply the normal distribution and Z-score standardization to analyze population percentile ranks and standardized test scores.',
    performanceTask: {
      assigned: true,
      number: 5,
      title: 'Standard Normal Curve & Z-Score Research Paper',
      description: 'Collect standardized testing or height/weight data, convert scores to Z-scores, and analyze normal curve probabilities.',
      weightPercentage: 20
    },
    quizzes: [],
    lessonPlan: {
      id: 'lp-term2-w8',
      topicId: 'term2-w8-normal-distribution',
      title: 'Week 8 Lesson Plan — The Normal Distribution',
      gradeLevel: 'Grade 11 - Statistics & Probability',
      duration: '60 minutes / day',
      subject: 'Statistics & Probability',
      term: 'Term 2',
      week: 'Week 8',
      weeklySchedule: [
        { day: 'MONDAY', date: 'Nov. 30, 2026', lessonTitle: 'Properties of the Normal Curve & Empirical Rule (68-95-99.7)', activityType: 'Whole Class' },
        { day: 'TUESDAY', date: 'Dec. 01, 2026', lessonTitle: 'Calculating Z-Scores and Standardizing Raw Data', activityType: 'Pair Work' },
        { day: 'WEDNESDAY', date: 'Dec. 02, 2026', lessonTitle: 'Standard Normal Distribution Table & Area Under Curve', activityType: 'Group Work' },
        { day: 'THURSDAY', date: 'Dec. 03, 2026', lessonTitle: 'Applications of Normal Curve in Educational Grading', activityType: 'Whole Class' },
        { day: 'FRIDAY', date: 'Dec. 04, 2026', lessonTitle: 'Term 2 Comprehensive Review & Evaluation', activityType: 'Individual Work' }
      ],
      prerequisites: ['Discrete Random Variables', 'Standard Deviation'],
      learningCompetencies: ['M11/12SP-IIIc-1: Illustrates a normal random variable and its probabilities.'],
      objectives: {
        cognitive: 'Explain the properties of the bell curve and Z-score values.',
        psychomotor: 'Convert raw score X to Z-score Z = (X - μ) / σ.',
        affective: 'Appreciate how standardized scores enable fair comparisons across populations.'
      },
      materialsNeeded: ['Z-score reference tables', 'Calculators'],
      keyConcepts: [{ term: 'Z-Score', definition: 'The number of standard deviations a data point lies above or below the mean.' }],
      workedExamples: [],
      procedures: [],
      differentiation: { remediation: 'Z-score shading visual aids.', enrichment: 'Central Limit Theorem introduction.' },
      assessmentPlan: 'Performance Task 5 research paper evaluation.'
    }
  },
  /* ================= TERM 3 CURRICULUM ================= */
  {
    id: 'term3-w1-business-math',
    title: 'Business Mathematics: Simple & Compound Interest',
    description: 'Financial literacy, simple interest, compound interest, annuities, and loan amortization.',
    icon: 'Award',
    color: 'indigo',
    term: 'Term 3',
    week: 'Week 1',
    weekNumber: 1,
    weeklyFocus: 'Solve problems involving simple interest, compound interest, maturity value, and bank loan schedules.',
    performanceTask: {
      assigned: true,
      number: 1,
      title: 'Savings & Loan Amortization Plan',
      description: 'Design a 5-year savings or business loan amortization schedule comparing simple vs compound interest rates.',
      weightPercentage: 20
    },
    quizzes: [],
    lessonPlan: {
      id: 'lp-term3-w1',
      topicId: 'term3-w1-business-math',
      title: 'Week 1 Lesson Plan — Business Mathematics',
      gradeLevel: 'Grade 11 - General Mathematics',
      duration: '60 minutes / day',
      subject: 'General Mathematics',
      term: 'Term 3',
      week: 'Week 1',
      weeklySchedule: [
        { day: 'MONDAY', date: 'Jan. 11, 2027', lessonTitle: 'Simple Interest Formula and Principal Calculations', activityType: 'Whole Class' },
        { day: 'TUESDAY', date: 'Jan. 12, 2027', lessonTitle: 'Compound Interest & Compounding Frequencies', activityType: 'Group Work' },
        { day: 'WEDNESDAY', date: 'Jan. 13, 2027', lessonTitle: 'Maturity Value and Effective Interest Rates', activityType: 'Pair Work' },
        { day: 'THURSDAY', date: 'Jan. 14, 2027', lessonTitle: 'Comparing Bank Deposit Offers & Loan Amortization', activityType: 'Whole Class' },
        { day: 'FRIDAY', date: 'Jan. 15, 2027', lessonTitle: 'Practical Business Math Financial Planning', activityType: 'Individual Work' }
      ],
      prerequisites: ['Exponentials', 'Percentages'],
      learningCompetencies: ['M11GM-IIa-1: Illustrates simple and compound interests.'],
      objectives: {
        cognitive: 'Contrast simple and compound growth mechanisms.',
        psychomotor: 'Compute compound interest A = P(1 + r/n)^(nt).',
        affective: 'Develop financial prudence regarding debt and investments.'
      },
      materialsNeeded: ['Financial calculators', 'Bank rate brochures'],
      keyConcepts: [{ term: 'Compound Interest', definition: 'Interest calculated on the initial principal and accumulated interest.' }],
      workedExamples: [],
      procedures: [],
      differentiation: { remediation: 'Formula substitution step sheets.', enrichment: 'Inflation-adjusted return calculations.' },
      assessmentPlan: 'Performance Task 1 submission.'
    }
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
