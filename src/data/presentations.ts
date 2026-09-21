import { Presentation } from '../types';

export const initialPresentations: Presentation[] = [
  {
    id: 'pres-limits-101',
    title: 'Limits and Continuity: Conceptual Foundations',
    description: 'Interactive presentation deck covering intuitive limit concepts, one-sided limits, algebraic techniques, and continuity conditions for Grade 11 STEM.',
    topicId: 'limits',
    topicTitle: 'Limits & Continuity',
    grade: 'Grade 11',
    section: 'STEM-A',
    authorFacultyName: 'Prof. Leavien',
    originalFileName: 'DepEd_STEM_Calculus_Limits_Continuity.pptx',
    format: 'PPTX',
    totalSlides: 7,
    connectedQuizId: 'limits-quiz-1',
    connectedQuizTitle: 'Limits & Continuity Mastery Assessment',
    suggestedAssessmentType: 'both',
    createdAt: new Date().toISOString(),
    viewsCount: 28,
    completionsCount: 24,
    slides: [
      {
        id: 'slide-1',
        slideNumber: 1,
        title: 'Limits & Continuity',
        subtitle: 'Foundations of Differential Calculus • Grade 11 STEM',
        layout: 'title',
        content: [
          'Understanding the behavior of functions near a point $x \\to c$',
          'Intuitive and algebraic methods for limit evaluation',
          'The three essential conditions for function continuity',
          'DepEd STEM General & Basic Calculus Competency Standard'
        ],
        keyFormula: '\\lim_{x \\to c} f(x) = L',
        formulaExplanation: 'The value $f(x)$ approaches as $x$ gets arbitrarily close to $c$ from both left and right sides.',
        speakerNotes: 'Welcome, scholars! Today we begin our journey into calculus. A limit is not about what happens AT a point, but what happens AS YOU GET CLOSER to the point.',
        iconName: 'Zap'
      },
      {
        id: 'slide-2',
        slideNumber: 2,
        title: 'The Intuitive Concept of a Limit',
        subtitle: 'Approaching values without necessarily reaching them',
        layout: 'concept',
        content: [
          'Left-hand limit: $\\lim_{x \\to c^-} f(x)$ describes behavior as $x$ approaches from values smaller than $c$.',
          'Right-hand limit: $\\lim_{x \\to c^+} f(x)$ describes behavior as $x$ approaches from values larger than $c$.',
          'Fundamental Existence Theorem: A two-sided limit exists if and only if both one-sided limits exist and are equal: $\\lim_{x \\to c^-} f(x) = \\lim_{x \\to c^+} f(x) = L$.'
        ],
        keyFormula: '\\lim_{x \\to c} f(x) = L \\iff \\lim_{x \\to c^-} f(x) = \\lim_{x \\to c^+} f(x) = L',
        formulaExplanation: 'If left-hand and right-hand limits differ, the two-sided limit does NOT exist (DNE).',
        speakerNotes: 'Remember to always check both directions if you see a piecewise function or absolute value function.',
        iconName: 'TrendingUp'
      },
      {
        id: 'slide-3',
        slideNumber: 3,
        title: 'Core Limit Laws & Algebraic Techniques',
        subtitle: 'Direct substitution and resolving indeterminate forms (0/0)',
        layout: 'formula_breakdown',
        content: [
          'Step 1: Always attempt Direct Substitution first: evaluate $f(c)$.',
          'If $f(c) = \\frac{0}{0}$ (Indeterminate Form), apply algebraic manipulation:',
          '• Factoring & Canceling common factors',
          '• Conjugate Multiplication (Rationalization) for radical expressions',
          '• Finding Common Denominators for complex fractions'
        ],
        keyFormula: '\\lim_{x \\to c} [f(x) \\pm g(x)] = \\lim_{x \\to c} f(x) \\pm \\lim_{x \\to c} g(x)',
        formulaExplanation: 'Limits distribute over addition, subtraction, multiplication, and non-zero division.',
        speakerNotes: 'Never write "0/0 = 0" or "0/0 = 1". Indeterminate form 0/0 means you must do more algebra!',
        iconName: 'BookOpen'
      },
      {
        id: 'slide-4',
        slideNumber: 4,
        title: 'Worked Example: Indeterminate Factoring',
        subtitle: 'Step-by-step problem breakdown',
        layout: 'worked_example',
        content: [
          'Evaluate the limit: $\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$',
          'Observe that direct substitution gives $\\frac{3^2 - 9}{3 - 3} = \\frac{0}{0}$.'
        ],
        exampleProblem: {
          problemStatement: 'Evaluate \\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}',
          steps: [
            '1. Notice numerator is a difference of squares: x^2 - 9 = (x - 3)(x + 3)',
            '2. Rewrite limit: \\lim_{x \\to 3} \\frac{(x - 3)(x + 3)}{x - 3}',
            '3. Cancel non-zero factor (x - 3) since x \\neq 3 during limit approach: \\lim_{x \\to 3} (x + 3)',
            '4. Direct substitution into simplified expression: 3 + 3 = 6'
          ],
          finalAnswer: '\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3} = 6'
        },
        speakerNotes: 'Notice that the function is undefined at x=3, but the limit exists and equals 6 because the limit only cares about the neighborhood.',
        iconName: 'Award'
      },
      {
        id: 'slide-5',
        slideNumber: 5,
        title: 'The 3 Conditions for Continuity at a Point',
        subtitle: 'DepEd Competency: Determining if f(x) is continuous at x = c',
        layout: 'concept',
        content: [
          'A function $f(x)$ is continuous at a number $c$ if and only if all three conditions hold:',
          '1. $f(c)$ is defined (c is in the domain of f)',
          '2. $\\lim_{x \\to c} f(x)$ exists (left and right limits match)',
          '3. $\\lim_{x \\to c} f(x) = f(c)$ (limit value equals function value)'
        ],
        keyFormula: '\\lim_{x \\to c} f(x) = f(c)',
        formulaExplanation: 'If any single condition fails, the function has a discontinuity at $x = c$ (Removable, Jump, or Infinite).',
        speakerNotes: 'Always verify all three conditions sequentially on examinations.',
        iconName: 'Target'
      },
      {
        id: 'slide-6',
        slideNumber: 6,
        title: 'Quick Knowledge Check',
        subtitle: 'Test your intuition before the formal assessment',
        layout: 'interactive_check',
        content: [
          'Select the best answer to verify your conceptual retention.'
        ],
        quickCheck: {
          question: 'If \\lim_{x \\to 2^-} f(x) = 5 and \\lim_{x \\to 2^+} f(x) = 5, but f(2) = 8, what can we conclude?',
          options: [
            'The two-sided limit DNE and f is continuous at x = 2',
            '\\lim_{x \\to 2} f(x) = 5, but f(x) is NOT continuous at x = 2 (Removable Discontinuity)',
            '\\lim_{x \\to 2} f(x) = 8 and f is continuous at x = 2',
            'f(x) has an essential jump discontinuity at x = 2'
          ],
          correctAnswer: 1,
          explanation: 'The limit exists and equals 5 because both one-sided limits are 5. However, since lim f(x) != f(2) (5 != 8), Condition 3 of continuity fails, creating a removable discontinuity (hole with displaced point).'
        },
        speakerNotes: 'This is a classic DepEd exam trick. The limit is 5, but the function value is 8.',
        iconName: 'HelpCircle'
      },
      {
        id: 'slide-7',
        slideNumber: 7,
        title: 'Lesson Summary & Next Action',
        subtitle: 'Key takeaways and preparation for assessment',
        layout: 'summary',
        content: [
          '✓ Limits describe approaching behavior, not function value at the point.',
          '✓ Indeterminate forms $\\frac{0}{0}$ require factoring, rationalizing, or simplifying.',
          '✓ Continuity requires $f(c)$ defined, limit exists, and limit equals $f(c)$.',
          '★ Ready for the next step! Proceed to the Diagnostic Assessment or Topic Quiz to reinforce your mastery.'
        ],
        keyFormula: '\\text{Mastery Score} \\ge 80\\%',
        formulaExplanation: 'Completing the connected quiz unlocks +100 XP, level progression, and master badges.',
        speakerNotes: 'Great job completing this presentation! Now let\'s check your mastery with the practice assessment.',
        iconName: 'Trophy'
      }
    ]
  },
  {
    id: 'pres-derivatives-201',
    title: 'Differential Calculus: Derivatives & Tangent Lines',
    description: 'Comprehensive presentation on instantaneous rates of change, limit definition of derivative, power rule, product rule, and velocity models.',
    topicId: 'calculus',
    topicTitle: 'Differential Calculus',
    grade: 'Grade 11',
    section: 'STEM-A',
    authorFacultyName: 'Prof. Leavien',
    originalFileName: 'DepEd_Basic_Calculus_Derivative_Rules.pptx',
    format: 'PPTX',
    totalSlides: 6,
    connectedQuizId: 'calculus-quiz-1',
    connectedQuizTitle: 'Derivatives & Rate of Change Quiz',
    suggestedAssessmentType: 'quiz',
    createdAt: new Date().toISOString(),
    viewsCount: 35,
    completionsCount: 31,
    slides: [
      {
        id: 'calc-slide-1',
        slideNumber: 1,
        title: 'The Derivative as Instantaneous Rate of Change',
        subtitle: 'From secant slopes to tangent lines • Grade 11 Basic Calculus',
        layout: 'title',
        content: [
          'Average rate of change over $[x, x+h]$ vs instantaneous rate of change at $x$',
          'The definition of the derivative using limits',
          'Geometric meaning: Slope of the tangent line to the curve $y = f(x)$',
          'Physical meaning: Instantaneous velocity from position function $s(t)$'
        ],
        keyFormula: 'f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}',
        formulaExplanation: 'The derivative $f\'(x)$ represents the exact slope of the tangent line at any point $x$.',
        speakerNotes: 'As $h$ approaches 0, the secant line between $(x, f(x))$ and $(x+h, f(x+h))$ pivots to become the tangent line.',
        iconName: 'TrendingUp'
      },
      {
        id: 'calc-slide-2',
        slideNumber: 2,
        title: 'Essential Differentiation Rules',
        subtitle: 'Fast computational short-cuts derived from limit definition',
        layout: 'formula_breakdown',
        content: [
          '1. Constant Rule: $\\frac{d}{dx}[c] = 0$',
          '2. Power Rule: $\\frac{d}{dx}[x^n] = n \\cdot x^{n-1}$ for any real $n$',
          '3. Constant Multiple Rule: $\\frac{d}{dx}[c \\cdot f(x)] = c \\cdot f\'(x)$',
          '4. Sum and Difference Rule: $\\frac{d}{dx}[f(x) \\pm g(x)] = f\'(x) \\pm g\'(x)$'
        ],
        keyFormula: '\\frac{d}{dx}[a x^n] = a \\cdot n \\cdot x^{n-1}',
        formulaExplanation: 'Bring the exponent to the front as a multiplier and decrease the power by 1.',
        speakerNotes: 'Memorizing these four rules allows you to differentiate any polynomial in seconds.',
        iconName: 'Zap'
      },
      {
        id: 'calc-slide-3',
        slideNumber: 3,
        title: 'Worked Example: Tangent Line Equation',
        subtitle: 'Finding slope and equation of tangent line',
        layout: 'worked_example',
        content: [
          'Find the equation of the tangent line to $f(x) = 2x^3 - 5x + 1$ at $x = 2$.'
        ],
        exampleProblem: {
          problemStatement: 'Find equation of tangent line to f(x) = 2x^3 - 5x + 1 at x = 2.',
          steps: [
            '1. Find the y-coordinate by evaluating f(2): f(2) = 2(2)^3 - 5(2) + 1 = 16 - 10 + 1 = 7. Point is (2, 7).',
            '2. Find the derivative f\'(x): f\'(x) = 2(3x^2) - 5(1) + 0 = 6x^2 - 5.',
            '3. Evaluate slope m = f\'(2): m = 6(2)^2 - 5 = 6(4) - 5 = 24 - 5 = 19.',
            '4. Use point-slope form y - y1 = m(x - x1): y - 7 = 19(x - 2) \\implies y = 19x - 38 + 7 = 19x - 31.'
          ],
          finalAnswer: 'y = 19x - 31'
        },
        speakerNotes: 'Point-slope formula $y - y_1 = m(x - x_1)$ is your best friend when writing tangent lines.',
        iconName: 'Award'
      },
      {
        id: 'calc-slide-4',
        slideNumber: 4,
        title: 'Product & Quotient Rules',
        subtitle: 'Differentiating products and fractions of functions',
        layout: 'concept',
        content: [
          'Product Rule: $\\frac{d}{dx}[f \\cdot g] = f\' \\cdot g + f \\cdot g\'$',
          'Quotient Rule: $\\frac{d}{dx}\\left[\\frac{f}{g}\\right] = \\frac{f\' \\cdot g - f \\cdot g\'}{g^2}$',
          'Mnemonic for Quotient Rule: "Low d-High minus High d-Low, over the square of what\'s below!"'
        ],
        keyFormula: '\\left(\\frac{u}{v}\\right)\' = \\frac{u\' v - u v\'}{v^2}',
        formulaExplanation: 'Be cautious with the minus sign in the quotient rule — order matters!',
        speakerNotes: 'Students frequently make sign errors in the quotient rule. Always write out $u, u\', v, v\'$ explicitly first.',
        iconName: 'BookOpen'
      },
      {
        id: 'calc-slide-5',
        slideNumber: 5,
        title: 'Quick Check: Power Rule Application',
        subtitle: 'Confirm your calculation skill',
        layout: 'interactive_check',
        content: ['Test your understanding of fractional and negative exponents.'],
        quickCheck: {
          question: 'What is the derivative of g(x) = 4\\sqrt{x} - \\frac{3}{x^2} ?',
          options: [
            'g\'(x) = 2x^{-1/2} + 6x^{-3}',
            'g\'(x) = 4x^{1/2} - 6x^{-1}',
            'g\'(x) = \\frac{2}{\\sqrt{x}} - \\frac{6}{x^3}',
            'g\'(x) = 2\\sqrt{x} + 6x^{-2}'
          ],
          correctAnswer: 0,
          explanation: 'Rewrite g(x) = 4x^{1/2} - 3x^{-2}. Applying power rule: g\'(x) = 4(1/2)x^{-1/2} - 3(-2)x^{-3} = 2x^{-1/2} + 6x^{-3} = \\frac{2}{\\sqrt{x}} + \\frac{6}{x^3}.'
        },
        speakerNotes: 'Always rewrite roots as fractional powers and denominators as negative powers before differentiating.',
        iconName: 'HelpCircle'
      },
      {
        id: 'calc-slide-6',
        slideNumber: 6,
        title: 'Summary & Quiz Prompt',
        subtitle: 'Ready to solve derivative assessments',
        layout: 'summary',
        content: [
          '✓ Derivative represents instantaneous velocity and tangent line slope.',
          '✓ Power rule $\\frac{d}{dx} x^n = n x^{n-1}$ handles polynomials and rational powers.',
          '✓ Product and quotient rules apply to composite algebraic combinations.',
          '★ Ready for the assessment! Test your problem solving in the Calculus module.'
        ],
        keyFormula: 'f\'(x) = \\text{Instantaneous Rate of Change}',
        formulaExplanation: 'Proceed to the topic assessment to earn your Calculus Mastery Badge!',
        speakerNotes: 'Excellent work! Now jump straight into the attached quiz to secure your badges and XP.',
        iconName: 'Trophy'
      }
    ]
  },
  {
    id: 'pres-functions-301',
    title: 'General Mathematics: Rational Functions & Domain Analysis',
    description: 'Detailed presentation on rational functions, vertical and horizontal asymptotes, intercepts, and real-world economic modeling.',
    topicId: 'functions',
    topicTitle: 'Functions & Graphs',
    grade: 'Grade 11',
    section: 'STEM-A',
    authorFacultyName: 'Prof. Leavien',
    originalFileName: 'DepEd_GenMath_Rational_Functions.pptx',
    format: 'DOCX',
    totalSlides: 5,
    connectedQuizId: 'functions-quiz-1',
    connectedQuizTitle: 'Functions & Asymptotes Quiz',
    suggestedAssessmentType: 'quiz',
    createdAt: new Date().toISOString(),
    viewsCount: 22,
    completionsCount: 19,
    slides: [
      {
        id: 'fn-slide-1',
        slideNumber: 1,
        title: 'Rational Functions and Asymptotes',
        subtitle: 'DepEd Grade 11 General Mathematics Quarter 1',
        layout: 'title',
        content: [
          'Definition of a rational function $f(x) = \\frac{P(x)}{Q(x)}$ where $Q(x) \\neq 0$',
          'Finding domain restrictions and vertical asymptotes',
          'Analyzing end-behavior and horizontal / oblique asymptotes',
          'Graphing and real-world rate / cost modeling'
        ],
        keyFormula: 'f(x) = \\frac{P(x)}{Q(x)}, \\quad Q(x) \\neq 0',
        formulaExplanation: 'The domain of a rational function consists of all real numbers except the zeroes of the denominator $Q(x)$.',
        speakerNotes: 'Welcome to rational functions. Asymptotes are boundary lines that the graph gets closer and closer to without crossing vertically.',
        iconName: 'BookOpen'
      },
      {
        id: 'fn-slide-2',
        slideNumber: 2,
        title: 'Rules for Horizontal Asymptotes (HA)',
        subtitle: 'Comparing degree of numerator n with degree of denominator d',
        layout: 'formula_breakdown',
        content: [
          'Let $f(x) = \\frac{a x^n + \\dots}{b x^d + \\dots}$',
          'Case 1 ($n < d$): Denominator grows faster $\\implies$ Horizontal Asymptote is $y = 0$ (x-axis).',
          'Case 2 ($n = d$): Equal degrees $\\implies$ Horizontal Asymptote is $y = \\frac{a}{b}$ (ratio of leading coefficients).',
          'Case 3 ($n = d + 1$): Numerator is one degree higher $\\implies$ Oblique (Slant) Asymptote via polynomial long division.',
          'Case 4 ($n > d + 1$): No horizontal asymptote.'
        ],
        keyFormula: 'y = \\lim_{x \\to \\pm \\infty} \\frac{P(x)}{Q(x)}',
        formulaExplanation: 'Horizontal asymptotes describe the behavior of the curve as $x \\to \\pm\\infty$.',
        speakerNotes: 'Remember: Vertical asymptotes come from zeros of the reduced denominator. Horizontal asymptotes come from comparing degrees.',
        iconName: 'Zap'
      },
      {
        id: 'fn-slide-3',
        slideNumber: 3,
        title: 'Worked Example: Complete Asymptote Analysis',
        subtitle: 'Step-by-step rational function breakdown',
        layout: 'worked_example',
        content: [
          'Analyze $f(x) = \\frac{3x - 6}{x + 2}$ for Domain, Asymptotes, and Intercepts.'
        ],
        exampleProblem: {
          problemStatement: 'Find Domain, VA, HA, and intercepts for f(x) = \\frac{3x - 6}{x + 2}.',
          steps: [
            '1. Domain: Denominator x + 2 = 0 \\implies x = -2. Domain is \\{x \\in \\mathbb{R} \\mid x \\neq -2\\}.',
            '2. Vertical Asymptote: Denominator is 0 at x = -2 (and numerator is 3(-2)-6 = -12 \\neq 0), so VA is x = -2.',
            '3. Horizontal Asymptote: Degree of numerator is 1, degree of denominator is 1. Ratio of leading coefficients is 3/1 = 3. HA is y = 3.',
            '4. x-intercept: Set y = 0 \\implies 3x - 6 = 0 \\implies x = 2. Point is (2, 0).',
            '5. y-intercept: Set x = 0 \\implies f(0) = \\frac{-6}{2} = -3. Point is (0, -3).'
          ],
          finalAnswer: '\\text{VA: } x = -2, \\quad \\text{HA: } y = 3, \\quad \\text{x-int: } (2,0), \\quad \\text{y-int: } (0,-3)'
        },
        speakerNotes: 'Walking through these 5 steps will guarantee full marks on DepEd exams.',
        iconName: 'Award'
      },
      {
        id: 'fn-slide-4',
        slideNumber: 4,
        title: 'Quick Check: Finding Asymptotes',
        subtitle: 'Test your understanding',
        layout: 'interactive_check',
        content: ['Identify the horizontal asymptote.'],
        quickCheck: {
          question: 'What is the horizontal asymptote of h(x) = \\frac{5x^2 + 2x - 1}{2x^2 - 8} ?',
          options: [
            'y = 0',
            'y = 5/2',
            'y = 2/5',
            'No horizontal asymptote exists'
          ],
          correctAnswer: 1,
          explanation: 'Both numerator and denominator have degree 2 (n = d = 2). The horizontal asymptote is the ratio of their leading coefficients: y = 5/2 = 2.5.'
        },
        speakerNotes: 'Look at the highest power of x in the top and bottom: 5x^2 and 2x^2, so ratio is 5/2.',
        iconName: 'HelpCircle'
      },
      {
        id: 'fn-slide-5',
        slideNumber: 5,
        title: 'Review Summary & Assessment',
        subtitle: 'Ready to demonstrate mastery',
        layout: 'summary',
        content: [
          '✓ Domain is restricted wherever the denominator equals zero.',
          '✓ Vertical asymptotes occur at non-removable zeros of the denominator.',
          '✓ Horizontal asymptotes are determined by comparing numerator and denominator degrees.',
          '★ Ready for the assessment! Take the Quiz to earn XP and level up.'
        ],
        keyFormula: '\\text{Mastery Benchmark: } 80\\%+',
        formulaExplanation: 'Proceed to the Functions Quiz to test your skills!',
        speakerNotes: 'Great job completing this rational functions overview. Now test yourself on the quiz.',
        iconName: 'Trophy'
      }
    ]
  }
];
