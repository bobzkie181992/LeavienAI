import { Problem, MathErrorCategory, ErrorPatternOccurrence, ErrorRemediationModule } from '../types';

export interface ClassificationResult {
  category: MathErrorCategory;
  specificDiagnosis: string;
  specificFeedback: string;
  remediationTip: string;
}

/**
 * Expert heuristic and semantic classifier for Grade 11 Mathematics errors.
 * Classifies an incorrect answer into one of the 7 official DepEd / NCTM error categories:
 * - Sign error
 * - Formula error
 * - Computational error
 * - Conceptual misunderstanding
 * - Incorrect procedure
 * - Misreading the problem
 * - Algebraic manipulation error
 */
export function classifyMathError(problem: Problem, selectedOptionIndex: number): ClassificationResult {
  const selectedText = problem.options[selectedOptionIndex] || '';
  const correctText = problem.options[problem.correctAnswer] || '';
  const misc = (problem.misconceptionCategory || '').toLowerCase();
  const qText = (problem.question || '').toLowerCase();
  const selLower = selectedText.toLowerCase();
  const corLower = correctText.toLowerCase();

  // 1. Check for Sign Error
  // Signs inverted, missing negative, quadratic sign error, trigonometric quadrant sign
  const isOppositeSign = 
    (selectedText.startsWith('-') && !correctText.startsWith('-') && selectedText.slice(1) === correctText) ||
    (!selectedText.startsWith('-') && correctText.startsWith('-') && '-' + selectedText === correctText) ||
    misc.includes('sign') ||
    misc.includes('negative') ||
    misc.includes('quadrant ii') ||
    misc.includes('quadrant iv') ||
    (selLower.includes('-') && corLower.includes('+') && selLower.replace(/[-+]/g, '') === corLower.replace(/[-+]/g, ''));

  if (isOppositeSign) {
    return {
      category: 'Sign error',
      specificDiagnosis: 'Inverted or dropped negative sign during distribution, squaring, or quadrant evaluation.',
      specificFeedback: `You selected "${selectedText}", which has the opposite sign from the correct result "${correctText}". Pay close attention to negative signs when distributing, transposing terms, or evaluating functions.`,
      remediationTip: 'Always bracket negative quantities, e.g., (-x)^2 = x^2, and remember that multiplying or dividing by a negative flips inequality signs.'
    };
  }

  // 2. Check for Formula Error
  // Logarithm laws, quadratic formula, arithmetic/geometric series, compound interest, trig identities
  const isFormulaIssue = 
    misc.includes('formula') ||
    misc.includes('compound interest') ||
    misc.includes('log laws') ||
    misc.includes('log quotient') ||
    misc.includes('adding arguments instead of multiplying') ||
    misc.includes('simple interest') ||
    misc.includes('cosine instead of sine') ||
    qText.includes('interest') ||
    qText.includes('identity') ||
    qText.includes('discriminant') ||
    qText.includes('formula');

  if (isFormulaIssue && (misc.includes('interest') || misc.includes('log') || misc.includes('identity') || misc.includes('formula') || misc.includes('using'))) {
    return {
      category: 'Formula error',
      specificDiagnosis: 'Application of an incorrect mathematical formula, index law, or logarithmic theorem.',
      specificFeedback: `The choice "${selectedText}" indicates a formula mismatch (e.g. confusing simple vs compound interest or logarithmic product/quotient laws). The correct value is "${correctText}".`,
      remediationTip: 'Review the standard formula definitions before substitution: verify all variables and exponents.'
    };
  }

  // 3. Check for Conceptual Misunderstanding
  // Relations vs Functions, Vertical Line Test, Domain restrictions, division by zero, Asymptotes vs Holes
  const isConceptual = 
    misc.includes('relation') ||
    misc.includes('function') ||
    misc.includes('vertical line') ||
    misc.includes('input uniqueness') ||
    misc.includes('definition') ||
    misc.includes('division by zero') ||
    misc.includes('restricted value') ||
    misc.includes('asymptote') ||
    qText.includes('which of the following represents a function') ||
    qText.includes('domain') ||
    qText.includes('range');

  if (isConceptual) {
    return {
      category: 'Conceptual misunderstanding',
      specificDiagnosis: 'Underlying conceptual confusion regarding definitions, domain existence, or relation mappings.',
      specificFeedback: `Selecting "${selectedText}" reflects a core conceptual pitfall (such as confusing an input restriction with a valid solution, or misunderstanding function criteria). Correct answer: "${correctText}".`,
      remediationTip: 'Anchor yourself in the fundamental definitions: each domain input x must map to exactly one codomain output y.'
    };
  }

  // 4. Check for Incorrect Procedure
  // Order of operations, composition order f(g(x)) vs g(f(x)), cross-multiplication across inequalities, extraneous root verification
  const isProcedure = 
    misc.includes('procedure') ||
    misc.includes('order') ||
    misc.includes('outer function') ||
    misc.includes('failing to check for extraneous') ||
    misc.includes('extraneous') ||
    misc.includes('plugging in 1 directly') ||
    misc.includes('cross-multiplying') ||
    misc.includes('composing') ||
    qText.includes('composite') ||
    qText.includes('f(g(') ||
    qText.includes('extraneous');

  if (isProcedure) {
    return {
      category: 'Incorrect procedure',
      specificDiagnosis: 'Executed procedural sequence out of order or omitted critical validation checks (e.g. extraneous roots).',
      specificFeedback: `Selecting "${selectedText}" occurred due to a procedural skip (such as evaluating composite functions in reverse order or omitting extraneous root checking). Correct answer: "${correctText}".`,
      remediationTip: 'Follow the algorithmic sequence strictly: evaluate inner functions first in f(g(x)), and substitute candidate roots back into the original denominators.'
    };
  }

  // 5. Check for Algebraic Manipulation Error
  // Illegal cancellation (x+5)/5 -> x+1, expanding (x+h)^2 incorrectly, invalid power distribution (a+b)^2 -> a^2+b^2, denominator factoring
  const isAlgebraic = 
    misc.includes('algebra') ||
    misc.includes('expanding') ||
    misc.includes('(x+h)^2') ||
    misc.includes('canceling') ||
    misc.includes('inverting coefficients') ||
    misc.includes('common denominator') ||
    misc.includes('multiplying 500') ||
    misc.includes('square the fraction') ||
    misc.includes('denominator');

  if (isAlgebraic) {
    return {
      category: 'Algebraic manipulation error',
      specificDiagnosis: 'Flawed algebraic manipulation, invalid term cancellation, or incomplete polynomial expansion.',
      specificFeedback: `The selection "${selectedText}" shows an algebraic simplification error (such as invalid binomial expansion or improper fraction cancellation). Correct answer: "${correctText}".`,
      remediationTip: 'Remember that (a + b)^2 = a^2 + 2ab + b^2, and only common multiplicative factors (not additive terms) can be cancelled.'
    };
  }

  // 6. Check for Computational / Arithmetic Error
  // Pure arithmetic drift, simple multiplication/division slip, numerical off-by-one
  const selectedNum = parseFloat(selectedText.replace(/[^0-9.-]/g, ''));
  const correctNum = parseFloat(correctText.replace(/[^0-9.-]/g, ''));
  const isPureNumber = !isNaN(selectedNum) && !isNaN(correctNum);
  const ratio = isPureNumber && correctNum !== 0 ? selectedNum / correctNum : 0;
  
  if (isPureNumber && (ratio === 2 || ratio === 0.5 || ratio === 10 || Math.abs(selectedNum - correctNum) <= 5 || misc.includes('multiplying') || misc.includes('adding') || misc.includes('arithmetic'))) {
    return {
      category: 'Computational error',
      specificDiagnosis: 'Minor arithmetic calculation slip during numerical multiplication, division, or fraction addition.',
      specificFeedback: `Your calculation yielded "${selectedText}", while the verified computation produces "${correctText}". This is a computational precision error.`,
      remediationTip: 'Double-check intermediate arithmetic steps and reduce fractions systematically to avoid arithmetic slips.'
    };
  }

  // 7. Check for Misreading the Problem
  // Asked for f(2) but found x, asked for domain but gave range, asked for maximum but gave vertex x-coordinate
  const isMisread = 
    misc.includes('misreading') ||
    misc.includes('confusing') ||
    qText.includes('which of the following is NOT') ||
    qText.includes('find the value of') ||
    qText.includes('except');

  if (isMisread) {
    return {
      category: 'Misreading the problem',
      specificDiagnosis: 'Misinterpreted the specific variable, condition, or question prompt requested.',
      specificFeedback: `You chose "${selectedText}". Re-reading the prompt carefully shows the question specifically asks for "${correctText}".`,
      remediationTip: 'Highlight the target variable and final question statement before performing calculations.'
    };
  }

  // Default fallback: Algebraic manipulation error
  return {
    category: 'Algebraic manipulation error',
    specificDiagnosis: 'Algebraic simplification or transformation variance.',
    specificFeedback: `You selected "${selectedText}", but the correct mathematical solution is "${correctText}".`,
    remediationTip: 'Review intermediate steps and ensure inverse operations are balanced on both sides of the equation.'
  };
}

/**
 * Detects if a student has repeated occurrences of any error category.
 * Returns an array of error categories meeting or exceeding the repetition threshold.
 */
export function detectRepeatedErrorPatterns(
  history: ErrorPatternOccurrence[],
  threshold: number = 2
): Array<{ category: MathErrorCategory; count: number; occurrences: ErrorPatternOccurrence[] }> {
  if (!history || history.length === 0) return [];

  const counts: Record<string, ErrorPatternOccurrence[]> = {};

  history.forEach(item => {
    if (!counts[item.category]) {
      counts[item.category] = [];
    }
    counts[item.category].push(item);
  });

  const repeated: Array<{ category: MathErrorCategory; count: number; occurrences: ErrorPatternOccurrence[] }> = [];

  for (const [cat, list] of Object.entries(counts)) {
    if (list.length >= threshold) {
      repeated.push({
        category: cat as MathErrorCategory,
        count: list.length,
        occurrences: list
      });
    }
  }

  return repeated.sort((a, b) => b.count - a.count);
}

/**
 * Generates the full 5-stage remediation plan for a specific error category:
 * 1. AI Misconception Diagnosis
 * 2. Short Explanation
 * 3. Worked Example (Common Mistake vs Correct Method)
 * 4. Practice Questions (3 interactive items)
 * 5. Reassessment Questions (3 benchmark items)
 */
export function generateErrorRemediationPlan(
  category: MathErrorCategory,
  competencyName?: string
): ErrorRemediationModule {
  switch (category) {
    case 'Sign error':
      return {
        category: 'Sign error',
        triggerReason: 'Repeated sign errors detected during algebraic distributions and evaluations.',
        misconceptionAnalysis: 'AI Diagnostic Analysis: You frequently drop or invert negative signs when distributing a negative multiplier (e.g., -3(x - 4) written as -3x - 12 instead of -3x + 12), squaring negative terms without brackets (treating (-4)^2 as -16), or neglecting to flip inequality signs when dividing by negative coefficients.',
        shortExplanation: {
          title: 'Mastering Mathematical Signs & Negative Multipliers',
          rules: [
            'Distribution of Negative Signs: -(a - b) = -a + b. Every single term inside the parentheses must flip its sign.',
            'Squaring vs Negative Signs: (-x)^2 = x^2 (positive), whereas -x^2 = -(x^2) (negative). Always bracket bases.',
            'Inequality Reversal: Dividing or multiplying both sides of an inequality by a negative quantity reverses the inequality symbol (e.g., -2x < 6 => x > -3).'
          ],
          keyTakeaways: 'When you see a minus sign before brackets or fractions, treat it as multiplying by (-1) and check each resulting term individually.'
        },
        workedExample: {
          title: 'Sign Distribution in Multi-Step Equations',
          problemText: 'Solve for x:  5 - 2(3x - 4) = 25',
          commonMistake: '❌ Common Mistake: Distributing -2 as: 5 - 6x - 8 = 25  =>  -3 - 6x = 25 (Forgot that -2 * -4 = +8).',
          correctMethod: '✅ Correct Method: Apply (-2) * (3x) = -6x and (-2) * (-4) = +8.',
          stepByStep: [
            'Step 1: Distribute -2 across (3x - 4): 5 - 6x + 8 = 25',
            'Step 2: Combine constant terms: 13 - 6x = 25',
            'Step 3: Subtract 13 from both sides: -6x = 12',
            'Step 4: Divide by -6 (and observe sign): x = 12 / (-6) = -2',
            'Verification: 5 - 2(3(-2) - 4) = 5 - 2(-6 - 4) = 5 - 2(-10) = 5 + 20 = 25. Correct!'
          ]
        },
        practiceQuestions: [
          {
            id: 'rem-sign-1',
            question: 'Simplify the algebraic expression:  -4(2x - 5) + 3',
            options: ['-8x + 23', '-8x - 17', '-8x - 20', '8x + 23'],
            correctAnswer: 0,
            solution: 'Distribute -4: -4(2x) + (-4)(-5) + 3 = -8x + 20 + 3 = -8x + 23.',
            topic: 'functions',
            competency: 'Sign accuracy and distribution',
            difficulty: 'easy',
            difficultyParameter: -0.5,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Sign error',
            hint1: 'Remember that (-4) multiplied by (-5) yields a positive product (+20).',
            hint2: 'Add +20 and +3 to get +23 for the constant term.',
            explanation: '(-4)(2x) = -8x and (-4)(-5) = +20. Adding 3 yields -8x + 23.',
            remediation: 'Keep track of negative times negative being positive.'
          },
          {
            id: 'rem-sign-2',
            question: 'Evaluate the expression  f(-3)  for  f(x) = x^2 - 4x + 2.',
            options: ['23', '-19', '5', '-1'],
            correctAnswer: 0,
            solution: 'Substitute (-3): (-3)^2 - 4(-3) + 2 = 9 - (-12) + 2 = 9 + 12 + 2 = 23.',
            topic: 'functions',
            competency: 'Function evaluation with negative inputs',
            difficulty: 'medium',
            difficultyParameter: 0.1,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Sign error',
            hint1: '(-3)^2 is positive 9. Then -4(-3) is positive 12.',
            hint2: 'Combine: 9 + 12 + 2 = 23.',
            explanation: '(-3)^2 = 9. -4(-3) = +12. 9 + 12 + 2 = 23.',
            remediation: 'Always write brackets around negative inputs when substituting.'
          },
          {
            id: 'rem-sign-3',
            question: 'Solve the inequality:  -3x + 7 ≤ 22',
            options: ['x ≥ -5', 'x ≤ -5', 'x ≥ 5', 'x ≤ 5'],
            correctAnswer: 0,
            solution: '-3x ≤ 15. Dividing both sides by -3 flips the inequality: x ≥ -5.',
            topic: 'functions',
            competency: 'Solving linear inequalities with sign reversal',
            difficulty: 'medium',
            difficultyParameter: 0.2,
            discriminationParameter: 1.4,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Sign error',
            hint1: 'Subtract 7 from both sides to get -3x ≤ 15.',
            hint2: 'When dividing by -3, remember to flip ≤ to ≥.',
            explanation: 'Dividing by a negative number flips ≤ to ≥. Hence x ≥ -5.',
            remediation: 'Negative multiplication/division reverses inequality directions.'
          }
        ],
        reassessmentQuestions: [
          {
            id: 'reassess-sign-1',
            question: 'Expand and simplify:  -(3x - 7) - 2(x + 4)',
            options: ['-5x - 1', '-5x + 15', '-5x - 15', '5x - 1'],
            correctAnswer: 0,
            solution: '-(3x - 7) = -3x + 7. -2(x + 4) = -2x - 8. Combined: -3x - 2x + 7 - 8 = -5x - 1.',
            topic: 'functions',
            competency: 'Sign error remediation mastery',
            difficulty: 'medium',
            difficultyParameter: 0.0,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Sign error',
            hint1: 'Distribute -1 to (3x - 7) to get -3x + 7.',
            hint2: 'Distribute -2 to (x + 4) to get -2x - 8.',
            explanation: '-3x + 7 - 2x - 8 = -5x - 1.',
            remediation: 'Sign distribution mastery.'
          },
          {
            id: 'reassess-sign-2',
            question: 'Evaluate  b^2 - 4ac  for  a = -2, b = -3, c = 4.',
            options: ['41', '-23', '25', '-41'],
            correctAnswer: 0,
            solution: '(-3)^2 - 4(-2)(4) = 9 - (-32) = 9 + 32 = 41.',
            topic: 'functions',
            competency: 'Discriminant evaluation with negative coefficients',
            difficulty: 'medium',
            difficultyParameter: 0.2,
            discriminationParameter: 1.4,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Sign error',
            hint1: '(-3)^2 = 9. 4(-2)(4) = -32.',
            hint2: 'Subtracting -32 is equivalent to adding 32.',
            explanation: '9 - (-32) = 9 + 32 = 41.',
            remediation: 'Sign isolation in discriminant evaluation.'
          },
          {
            id: 'reassess-sign-3',
            question: 'Solve for x:  -2(x - 6) = 3(x + 4)',
            options: ['x = 0', 'x = 24/5', 'x = -24/5', 'x = 4'],
            correctAnswer: 0,
            solution: '-2x + 12 = 3x + 12. Subtract 12: -2x = 3x. Subtract 3x: -5x = 0 => x = 0.',
            topic: 'functions',
            competency: 'Linear equation sign consistency',
            difficulty: 'medium',
            difficultyParameter: 0.1,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Sign error',
            hint1: '-2 times -6 is +12.',
            hint2: '-2x + 12 = 3x + 12 implies -5x = 0.',
            explanation: '-2x + 12 = 3x + 12 => -5x = 0 => x = 0.',
            remediation: 'Sign accuracy in multi-step equations.'
          }
        ]
      };

    case 'Formula error':
      return {
        category: 'Formula error',
        triggerReason: 'Repeated confusion or misapplication of core formulas and mathematical theorems.',
        misconceptionAnalysis: 'AI Diagnostic Analysis: You are confusing formula structures (such as confusing simple interest I = Prt with compound interest A = P(1+r/n)^(nt), or applying log product laws as log(A+B) instead of log(AB)).',
        shortExplanation: {
          title: 'Precision in Mathematical Formulas & Index Laws',
          rules: [
            'Logarithmic Properties: log_b(M * N) = log_b(M) + log_b(N), and log_b(M / N) = log_b(M) - log_b(N). (Note: log(A + B) cannot be expanded into log A + log B).',
            'Compound Interest Formula: A = P(1 + r/n)^(nt), where n is compounding frequency per year.',
            'Quadratic Formula: x = (-b ± √(b^2 - 4ac)) / (2a). Notice the entire numerator is divided by 2a.'
          ],
          keyTakeaways: 'Always write down the general formula in variable form first, identify each parameter clearly, then substitute values.'
        },
        workedExample: {
          title: 'Logarithmic Laws Application',
          problemText: 'Express  log_2(8) + log_2(4)  as a single logarithm and evaluate.',
          commonMistake: '❌ Common Mistake: Adding the arguments: log_2(8 + 4) = log_2(12).',
          correctMethod: '✅ Correct Method: Apply product rule log_b(M) + log_b(N) = log_b(M * N).',
          stepByStep: [
            'Step 1: Identify rule: log_2(8) + log_2(4) = log_2(8 * 4)',
            'Step 2: Compute product: log_2(32)',
            'Step 3: Evaluate: 2^5 = 32, so log_2(32) = 5',
            'Verification: log_2(8) = 3 and log_2(4) = 2. 3 + 2 = 5. Matches!'
          ]
        },
        practiceQuestions: [
          {
            id: 'rem-form-1',
            question: 'Simplify into a single logarithm:  log_3(54) - log_3(2)',
            options: ['3', 'log_3(52)', '27', '9'],
            correctAnswer: 0,
            solution: 'log_3(54/2) = log_3(27) = 3 because 3^3 = 27.',
            topic: 'exponential-logarithmic',
            competency: 'Logarithmic quotient law',
            difficulty: 'easy',
            difficultyParameter: -0.4,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Formula error',
            hint1: 'Subtracting logs with the same base means dividing their arguments: 54 / 2.',
            hint2: '54 / 2 = 27. What power of 3 equals 27?',
            explanation: 'log_3(54/2) = log_3(27) = 3.',
            remediation: 'Quotient law: log(A) - log(B) = log(A/B).'
          },
          {
            id: 'rem-form-2',
            question: 'An amount of ₱10,000 is invested at 6% compounded semi-annually for 2 years. Which formula correctly calculates the compound amount A?',
            options: ['A = 10,000(1 + 0.03)^4', 'A = 10,000(1 + 0.06)^2', 'A = 10,000 * 0.06 * 2', 'A = 10,000(1 + 0.06/4)^2'],
            correctAnswer: 0,
            solution: 'Semi-annual means n = 2. Rate per period r/n = 0.06/2 = 0.03. Total periods nt = 2 * 2 = 4. A = 10,000(1.03)^4.',
            topic: 'business-math',
            competency: 'Compound interest parameter formulation',
            difficulty: 'medium',
            difficultyParameter: 0.1,
            discriminationParameter: 1.4,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Formula error',
            hint1: 'Semi-annually means n = 2 compoundings per year.',
            hint2: 'Exponent is n * t = 2 * 2 = 4 periods.',
            explanation: 'P(1 + r/n)^(nt) with P=10000, r/n=0.03, nt=4.',
            remediation: 'Identify compounding periods and interest rate conversion.'
          },
          {
            id: 'rem-form-3',
            question: 'Solve for x:  log(x) + log(x - 3) = 1  (base 10)',
            options: ['x = 5', 'x = -2 and x = 5', 'x = 2', 'x = 10'],
            correctAnswer: 0,
            solution: 'log(x(x - 3)) = 1 => x^2 - 3x = 10 => x^2 - 3x - 10 = 0 => (x - 5)(x + 2) = 0. Since domain requires x > 3, only x = 5 is valid.',
            topic: 'exponential-logarithmic',
            competency: 'Logarithmic equations and extraneous root rejection',
            difficulty: 'hard',
            difficultyParameter: 0.6,
            discriminationParameter: 1.5,
            cognitiveLevel: 'Analyzing',
            misconceptionCategory: 'Formula error',
            hint1: 'Combine using product law: log(x(x - 3)) = 1.',
            hint2: 'Convert to exponential form: x(x - 3) = 10^1 = 10.',
            explanation: '(x-5)(x+2)=0. Domain requires x > 3, rejecting -2.',
            remediation: 'Combine logs and check domain restrictions.'
          }
        ],
        reassessmentQuestions: [
          {
            id: 'reassess-form-1',
            question: 'What is the value of  log_5(125) + log_2(1/8)?',
            options: ['0', '6', '-1', '3'],
            correctAnswer: 0,
            solution: 'log_5(125) = 3 (since 5^3 = 125). log_2(1/8) = -3 (since 2^-3 = 1/8). 3 + (-3) = 0.',
            topic: 'exponential-logarithmic',
            competency: 'Evaluating logarithmic expressions',
            difficulty: 'medium',
            difficultyParameter: 0.1,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Formula error',
            hint1: '5 cubed is 125. 2 to the power of -3 is 1/8.',
            hint2: 'Add 3 and -3.',
            explanation: '3 + (-3) = 0.',
            remediation: 'Evaluate logarithmic bases systematically.'
          },
          {
            id: 'reassess-form-2',
            question: 'Expand:  log_b((x^2 * y) / z^3)',
            options: ['2 log_b(x) + log_b(y) - 3 log_b(z)', '2 log_b(x) * log_b(y) / (3 log_b(z))', 'log_b(2x) + log_b(y) - log_b(3z)', '6 log_b(xy/z)'],
            correctAnswer: 0,
            solution: 'log_b(x^2) + log_b(y) - log_b(z^3) = 2 log_b(x) + log_b(y) - 3 log_b(z).',
            topic: 'exponential-logarithmic',
            competency: 'Expansion using properties of logarithms',
            difficulty: 'medium',
            difficultyParameter: 0.2,
            discriminationParameter: 1.4,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Formula error',
            hint1: 'Exponents come to the front as multipliers.',
            hint2: 'Terms in denominator receive a minus sign.',
            explanation: '2 log_b(x) + log_b(y) - 3 log_b(z).',
            remediation: 'Power, product, and quotient rules expansion.'
          },
          {
            id: 'reassess-form-3',
            question: 'If  f(x) = 2^(x + 1), what is  f(3)?',
            options: ['16', '8', '32', '12'],
            correctAnswer: 0,
            solution: 'f(3) = 2^(3 + 1) = 2^4 = 16.',
            topic: 'exponential-logarithmic',
            competency: 'Exponential function evaluation',
            difficulty: 'easy',
            difficultyParameter: -0.3,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Formula error',
            hint1: 'Substitute x = 3 into exponent: 3 + 1 = 4.',
            hint2: '2^4 = 2 * 2 * 2 * 2 = 16.',
            explanation: '2^(3+1) = 2^4 = 16.',
            remediation: 'Exponential substitution.'
          }
        ]
      };

    case 'Conceptual misunderstanding':
      return {
        category: 'Conceptual misunderstanding',
        triggerReason: 'Repeated conceptual confusion over mathematical definitions and fundamental properties.',
        misconceptionAnalysis: 'AI Diagnostic Analysis: You are experiencing conceptual gaps regarding what constitutes a function (each x input must have exactly one unique y output), domain restrictions (denominators cannot equal zero), or confusing restricted values with actual solutions.',
        shortExplanation: {
          title: 'Foundational Mathematical Concepts & Function Definitions',
          rules: [
            'Definition of a Function: A relation is a function if and only if every element in the domain maps to exactly ONE element in the range. Vertical Line Test: no vertical line intersects the graph more than once.',
            'Rational Function Domain Restrictions: Any value of x that makes the denominator equal to 0 is undefined and must be excluded from the domain.',
            'Inverse Functions: A function f has an inverse function f^(-1) if and only if it is one-to-one (passes both the Vertical and Horizontal Line Tests).'
          ],
          keyTakeaways: 'Look at the mathematical definition first before doing algebra. Check whether numbers represent valid domain inputs.'
        },
        workedExample: {
          title: 'Identifying Domain Restrictions in Rational Functions',
          problemText: 'Find the domain of  f(x) = (x + 3) / (x^2 - 4)',
          commonMistake: '❌ Common Mistake: Setting numerator to zero and concluding domain is x ≠ -3, or factoring x^2 - 4 as (x-4)(x+4).',
          correctMethod: '✅ Correct Method: Set the denominator to zero to identify restricted values: x^2 - 4 = 0 => (x-2)(x+2) = 0 => x = 2, -2.',
          stepByStep: [
            'Step 1: Set denominator equal to 0: x^2 - 4 = 0',
            'Step 2: Factor difference of squares: (x - 2)(x + 2) = 0',
            'Step 3: Solve for restricted inputs: x = 2 or x = -2',
            'Step 4: State Domain: All real numbers except x = 2 and x = -2 ({x ∈ ℝ | x ≠ ±2}).'
          ]
        },
        practiceQuestions: [
          {
            id: 'rem-con-1',
            question: 'Which of the following sets of ordered pairs represents a function?',
            options: ['{(1, 2), (2, 3), (3, 4)}', '{(1, 2), (1, 3), (2, 4)}', '{(5, 1), (5, 2), (5, 3)}', '{(3, 7), (3, 9), (4, 1)}'],
            correctAnswer: 0,
            solution: 'In {(1, 2), (2, 3), (3, 4)}, each x-coordinate (1, 2, 3) is distinct and paired with exactly one y-value.',
            topic: 'functions',
            competency: 'Definition of a function as unique input-output mappings',
            difficulty: 'easy',
            difficultyParameter: -0.6,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Understanding',
            misconceptionCategory: 'Conceptual misunderstanding',
            hint1: 'A function cannot have repeated x-values with different y-values.',
            hint2: 'Check which set has all unique first coordinates.',
            explanation: '{(1, 2), (2, 3), (3, 4)} has distinct inputs.',
            remediation: 'Every input x must correspond to exactly one output y.'
          },
          {
            id: 'rem-con-2',
            question: 'What is the domain of the function  f(x) = (2x - 1) / (x - 5)?',
            options: ['All real numbers except x = 5', 'All real numbers except x = 1/2', 'All real numbers except x = -5', 'All real numbers'],
            correctAnswer: 0,
            solution: 'Denominator cannot be zero: x - 5 ≠ 0 => x ≠ 5.',
            topic: 'functions',
            competency: 'Domain of rational functions',
            difficulty: 'easy',
            difficultyParameter: -0.5,
            discriminationParameter: 1.4,
            cognitiveLevel: 'Understanding',
            misconceptionCategory: 'Conceptual misunderstanding',
            hint1: 'Division by zero is undefined. Set x - 5 = 0.',
            hint2: 'x = 5 is the restricted value.',
            explanation: 'Domain is {x ∈ ℝ | x ≠ 5}.',
            remediation: 'Exclude values where denominator equals 0.'
          },
          {
            id: 'rem-con-3',
            question: 'If a horizontal line intersects the graph of a function twice, what does this tell us?',
            options: ['The function is not one-to-one and has no inverse function', 'The relation is not a function', 'The function has two y-intercepts', 'The domain is restricted'],
            correctAnswer: 0,
            solution: 'Horizontal line test tests for one-to-one property. Intersecting twice means two different inputs produce the same output, so it is not one-to-one and has no inverse function.',
            topic: 'functions',
            competency: 'Horizontal line test and inverse functions',
            difficulty: 'medium',
            difficultyParameter: 0.1,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Understanding',
            misconceptionCategory: 'Conceptual misunderstanding',
            hint1: 'Horizontal line test checks if a function is one-to-one.',
            hint2: 'Failing the test means it has no inverse function.',
            explanation: 'Fails Horizontal Line Test => not one-to-one => no inverse.',
            remediation: 'Differentiate Vertical Line Test (function) from Horizontal Line Test (one-to-one).'
          }
        ],
        reassessmentQuestions: [
          {
            id: 'reassess-con-1',
            question: 'What is the domain of  g(x) = 1 / (x^2 - 9)?',
            options: ['{x ∈ ℝ | x ≠ 3 and x ≠ -3}', '{x ∈ ℝ | x ≠ 9}', '{x ∈ ℝ | x ≠ 3}', '{x ∈ ℝ | x > 3}'],
            correctAnswer: 0,
            solution: 'x^2 - 9 = 0 => (x-3)(x+3) = 0 => x ≠ 3, -3.',
            topic: 'functions',
            competency: 'Domain of quadratic rational functions',
            difficulty: 'medium',
            difficultyParameter: 0.0,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Understanding',
            misconceptionCategory: 'Conceptual misunderstanding',
            hint1: 'Factor x^2 - 9 into (x - 3)(x + 3).',
            hint2: 'Both 3 and -3 make the denominator zero.',
            explanation: 'Domain is all real numbers except ±3.',
            remediation: 'Domain restrictions on quadratic denominators.'
          },
          {
            id: 'reassess-con-2',
            question: 'Which relation is NOT a function?',
            options: ['x = y^2', 'y = x^2', 'y = 2x + 1', 'y = |x|'],
            correctAnswer: 0,
            solution: 'For x = y^2, if x = 4, y can be +2 or -2 (two outputs for a single input), failing the definition of a function.',
            topic: 'functions',
            competency: 'Recognizing non-functions algebraically',
            difficulty: 'medium',
            difficultyParameter: 0.1,
            discriminationParameter: 1.4,
            cognitiveLevel: 'Understanding',
            misconceptionCategory: 'Conceptual misunderstanding',
            hint1: 'Try plugging in x = 4: what are the possible values for y?',
            hint2: 'y = ±2 has two outputs for one input.',
            explanation: 'x = y^2 gives y = ±√x, which is not a function.',
            remediation: 'Function uniqueness principle.'
          },
          {
            id: 'reassess-con-3',
            question: 'What is the value of  f(g(2))  if  f(x) = x^2  and  g(x) = x + 3?',
            options: ['25', '7', '10', '13'],
            correctAnswer: 0,
            solution: 'Evaluate inner function: g(2) = 2 + 3 = 5. Evaluate outer function: f(5) = 5^2 = 25.',
            topic: 'functions',
            competency: 'Composite function evaluation conceptual order',
            difficulty: 'easy',
            difficultyParameter: -0.3,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Conceptual misunderstanding',
            hint1: 'Compute g(2) first.',
            hint2: 'Then plug that result into f(x).',
            explanation: 'g(2) = 5. f(5) = 25.',
            remediation: 'Inner function first rule.'
          }
        ]
      };

    case 'Incorrect procedure':
      return {
        category: 'Incorrect procedure',
        triggerReason: 'Repeated procedural errors and executing multi-step algebraic operations in the wrong order.',
        misconceptionAnalysis: 'AI Diagnostic Analysis: You are executing mathematical operations out of order, such as canceling terms before factoring polynomials, composing functions from the outside in, or failing to verify solutions against original equations.',
        shortExplanation: {
          title: 'Algorithmic Precision & Step-by-Step Procedure',
          rules: [
            'Rational Expression Simplification: Factor both numerator and denominator completely FIRST, then cancel common factors. Never cancel individual terms separated by plus or minus.',
            'Composite Functions f(g(x)): Always evaluate the innermost function g(x) first before applying the outer transformation f.',
            'Extraneous Solutions: In rational and radical equations, candidate solutions that cause division by zero or negative square roots must be discarded.'
          ],
          keyTakeaways: 'Memorize the correct sequence of operations: Factor -> Simplify -> Solve -> Validate Domain.'
        },
        workedExample: {
          title: 'Solving Rational Equations with Extraneous Root Checking',
          problemText: 'Solve:  (x) / (x - 2) = 2 / (x - 2) + 3',
          commonMistake: '❌ Common Mistake: Multiply by (x - 2) to get x = 2 + 3(x - 2) => x = 2 + 3x - 6 => -2x = -4 => x = 2. Then accepting x = 2 as a valid answer without checking.',
          correctMethod: '✅ Correct Method: Recognize that x = 2 causes division by 0 in the original equation, making x = 2 an extraneous root with No Solution.',
          stepByStep: [
            'Step 1: Multiply LCD (x - 2): x = 2 + 3(x - 2)',
            'Step 2: Expand and solve: x = 2 + 3x - 6 => x = 3x - 4 => -2x = -4 => x = 2',
            'Step 3: Verification Check: Substitute x = 2 into original denominators: 2 - 2 = 0 (undefined!)',
            'Step 4: Conclusion: x = 2 is extraneous. The equation has No Solution (∅).'
          ]
        },
        practiceQuestions: [
          {
            id: 'rem-proc-1',
            question: 'Solve for x:  (3) / (x - 4) = (x - 1) / (x - 4)',
            options: ['No solution (extraneous solution x = 4)', 'x = 4', 'x = -4', 'x = 3'],
            correctAnswer: 0,
            solution: 'Multiply by (x-4): 3 = x - 1 => x = 4. Checking x = 4 in denominator yields 4 - 4 = 0 (undefined). Hence x = 4 is extraneous, leaving No Solution.',
            topic: 'functions',
            competency: 'Identifying extraneous solutions in rational equations',
            difficulty: 'medium',
            difficultyParameter: 0.1,
            discriminationParameter: 1.4,
            cognitiveLevel: 'Analyzing',
            misconceptionCategory: 'Incorrect procedure',
            hint1: 'Solving gives x = 4, but what happens when you plug x = 4 into the denominator?',
            hint2: 'Division by zero means x = 4 cannot be a valid solution.',
            explanation: 'x = 4 causes division by 0, so there is no solution.',
            remediation: 'Always check solutions in original rational denominators.'
          },
          {
            id: 'rem-proc-2',
            question: 'Simplify the rational expression:  (x^2 - 9) / (x^2 + 2x - 15)',
            options: ['(x + 3) / (x + 5)', '(x - 3) / (x - 5)', '-9 / (2x - 15)', '(x - 3) / (x + 5)'],
            correctAnswer: 0,
            solution: 'Factor numerator: (x - 3)(x + 3). Factor denominator: (x - 3)(x + 5). Cancel common factor (x - 3) to get (x + 3) / (x + 5).',
            topic: 'functions',
            competency: 'Simplifying rational expressions via factorization',
            difficulty: 'medium',
            difficultyParameter: 0.0,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Incorrect procedure',
            hint1: 'Factor x^2 - 9 as difference of squares.',
            hint2: 'Factor x^2 + 2x - 15 into (x - 3)(x + 5).',
            explanation: '((x-3)(x+3)) / ((x-3)(x+5)) = (x+3)/(x+5).',
            remediation: 'Factor polynomials completely before canceling.'
          },
          {
            id: 'rem-proc-3',
            question: 'Given  f(x) = 2x + 1  and  g(x) = x^2, find  (f ∘ g)(3).',
            options: ['19', '49', '13', '37'],
            correctAnswer: 0,
            solution: '(f ∘ g)(3) = f(g(3)). First compute g(3) = 3^2 = 9. Then f(9) = 2(9) + 1 = 18 + 1 = 19.',
            topic: 'functions',
            competency: 'Evaluating composite functions in proper sequence',
            difficulty: 'easy',
            difficultyParameter: -0.3,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Incorrect procedure',
            hint1: 'Evaluate g(3) first: 3^2 = 9.',
            hint2: 'Then evaluate f(9) = 2(9) + 1.',
            explanation: 'f(g(3)) = f(9) = 2(9) + 1 = 19.',
            remediation: 'Inner function evaluation must precede outer function.'
          }
        ],
        reassessmentQuestions: [
          {
            id: 'reassess-proc-1',
            question: 'Solve:  (x - 3) / (x + 1) = 0',
            options: ['x = 3', 'x = -1', 'x = 3 and x = -1', 'No solution'],
            correctAnswer: 0,
            solution: 'A fraction equals 0 when its numerator is 0 and denominator is non-zero: x - 3 = 0 => x = 3. Check denominator: 3 + 1 = 4 ≠ 0. Valid!',
            topic: 'functions',
            competency: 'Solving rational equations correctly',
            difficulty: 'easy',
            difficultyParameter: -0.4,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Incorrect procedure',
            hint1: 'Set numerator equal to 0.',
            hint2: 'Verify denominator is not 0.',
            explanation: 'Numerator x - 3 = 0 => x = 3.',
            remediation: 'Fraction zero property.'
          },
          {
            id: 'reassess-proc-2',
            question: 'Simplify:  (2x^2 + 6x) / (2x)',
            options: ['x + 3', 'x^2 + 3', '2x + 3', 'x + 6'],
            correctAnswer: 0,
            solution: 'Factor 2x from numerator: 2x(x + 3) / (2x) = x + 3.',
            topic: 'functions',
            competency: 'Factoring common monomial factors',
            difficulty: 'easy',
            difficultyParameter: -0.5,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Incorrect procedure',
            hint1: 'Factor 2x out of both 2x^2 and 6x.',
            hint2: '2x(x + 3) / 2x = x + 3.',
            explanation: '2x(x+3) / 2x = x + 3.',
            remediation: 'Factor common monomials.'
          },
          {
            id: 'reassess-proc-3',
            question: 'If  f(x) = 3x - 2, find the inverse function  f^(-1)(x).',
            options: ['f^(-1)(x) = (x + 2) / 3', 'f^(-1)(x) = (x - 2) / 3', 'f^(-1)(x) = 3x + 2', 'f^(-1)(x) = 1 / (3x - 2)'],
            correctAnswer: 0,
            solution: 'y = 3x - 2. Swap variables: x = 3y - 2 => x + 2 = 3y => y = (x + 2) / 3.',
            topic: 'functions',
            competency: 'Finding algebraic inverse functions systematically',
            difficulty: 'medium',
            difficultyParameter: 0.1,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Incorrect procedure',
            hint1: 'Swap x and y to get x = 3y - 2.',
            hint2: 'Add 2 and divide by 3 to isolate y.',
            explanation: 'x = 3y - 2 => y = (x + 2)/3.',
            remediation: 'Systematic variable swapping for inverses.'
          }
        ]
      };

    case 'Algebraic manipulation error':
      return {
        category: 'Algebraic manipulation error',
        triggerReason: 'Repeated illegal algebraic transformations and invalid variable cancellations.',
        misconceptionAnalysis: 'AI Diagnostic Analysis: You are attempting invalid cancellations (such as canceling non-factored terms like (x + 5)/5 => x + 1), misapplying binomial expansions ((a+b)^2 => a^2 + b^2 without the 2ab middle term), or improperly handling fractional exponents.',
        shortExplanation: {
          title: 'Algebraic Integrity & Polynomial Expansion Rules',
          rules: [
            'Binomial Expansion: (a + b)^2 = a^2 + 2ab + b^2. Never drop the middle product term (2ab).',
            'Fraction Cancellation Law: You can ONLY cancel common FACTORS, never individual ADDENDS. In (A + B)/C, C must divide both A and B.',
            'Exponent Laws: (x^a)^b = x^(ab) and x^a * x^b = x^(a+b).'
          ],
          keyTakeaways: 'Resist the temptation to cross out numbers inside addition or subtraction. Factor first, then simplify.'
        },
        workedExample: {
          title: 'Proper Binomial Difference Expansion',
          problemText: 'Expand and simplify:  (2x - 3)^2',
          commonMistake: '❌ Common Mistake: Squaring each part separately: (2x)^2 - (3)^2 = 4x^2 - 9 (Missing the -2ab middle term).',
          correctMethod: '✅ Correct Method: Use (a - b)^2 = a^2 - 2ab + b^2 where a = 2x and b = 3.',
          stepByStep: [
            'Step 1: Compute a^2: (2x)^2 = 4x^2',
            'Step 2: Compute -2ab: -2 * (2x) * (3) = -12x',
            'Step 3: Compute b^2: (-3)^2 = +9',
            'Step 4: Combine all terms: 4x^2 - 12x + 9'
          ]
        },
        practiceQuestions: [
          {
            id: 'rem-alg-1',
            question: 'Expand:  (x + 4)^2',
            options: ['x^2 + 8x + 16', 'x^2 + 16', 'x^2 + 4x + 16', '2x + 8'],
            correctAnswer: 0,
            solution: '(x + 4)^2 = x^2 + 2(x)(4) + 4^2 = x^2 + 8x + 16.',
            topic: 'functions',
            competency: 'Binomial expansion with middle term',
            difficulty: 'easy',
            difficultyParameter: -0.5,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Algebraic manipulation error',
            hint1: 'Remember (a + b)^2 has three terms: a^2 + 2ab + b^2.',
            hint2: '2 * x * 4 = 8x is the middle term.',
            explanation: 'x^2 + 8x + 16 includes the 2ab term.',
            remediation: 'Never forget the 2ab term in binomial squaring.'
          },
          {
            id: 'rem-alg-2',
            question: 'Simplify the expression:  (3x + 12) / 3',
            options: ['x + 4', 'x + 12', '3x + 4', '4x'],
            correctAnswer: 0,
            solution: 'Factor 3 in numerator: 3(x + 4) / 3 = x + 4.',
            topic: 'functions',
            competency: 'Proper algebraic division and factoring',
            difficulty: 'easy',
            difficultyParameter: -0.6,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Algebraic manipulation error',
            hint1: 'Divide both terms (3x and 12) by 3.',
            hint2: '3x / 3 = x, and 12 / 3 = 4.',
            explanation: '3(x + 4) / 3 = x + 4.',
            remediation: 'Divide every term in numerator by denominator.'
          },
          {
            id: 'rem-alg-3',
            question: 'Factor completely:  2x^2 - 8',
            options: ['2(x - 2)(x + 2)', '2(x - 4)^2', '(2x - 4)(x + 2)', '(2x - 8)(x + 1)'],
            correctAnswer: 0,
            solution: 'Factor GCF 2: 2(x^2 - 4). Then factor difference of squares: 2(x - 2)(x + 2).',
            topic: 'functions',
            competency: 'Two-step polynomial factorization',
            difficulty: 'medium',
            difficultyParameter: 0.0,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Algebraic manipulation error',
            hint1: 'Factor out the common factor of 2 first: 2(x^2 - 4).',
            hint2: 'x^2 - 4 factors into (x - 2)(x + 2).',
            explanation: '2(x^2 - 4) = 2(x - 2)(x + 2).',
            remediation: 'Factor greatest common monomial factor before binomial identities.'
          }
        ],
        reassessmentQuestions: [
          {
            id: 'reassess-alg-1',
            question: 'Expand:  (3x - 2)^2',
            options: ['9x^2 - 12x + 4', '9x^2 - 4', '9x^2 + 4', '9x^2 - 6x + 4'],
            correctAnswer: 0,
            solution: '(3x)^2 - 2(3x)(2) + 2^2 = 9x^2 - 12x + 4.',
            topic: 'functions',
            competency: 'Algebraic manipulation expansion mastery',
            difficulty: 'medium',
            difficultyParameter: 0.1,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Algebraic manipulation error',
            hint1: '(3x)^2 is 9x^2.',
            hint2: 'Middle term is -2 * (3x) * 2 = -12x.',
            explanation: '9x^2 - 12x + 4.',
            remediation: 'Middle term preservation.'
          },
          {
            id: 'reassess-alg-2',
            question: 'Simplify:  (x^2 - 16) / (x - 4)',
            options: ['x + 4', 'x - 4', 'x + 16', '4'],
            correctAnswer: 0,
            solution: '((x - 4)(x + 4)) / (x - 4) = x + 4 (for x ≠ 4).',
            topic: 'functions',
            competency: 'Difference of squares simplification',
            difficulty: 'easy',
            difficultyParameter: -0.4,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Algebraic manipulation error',
            hint1: 'Factor x^2 - 16 as (x - 4)(x + 4).',
            hint2: 'Cancel (x - 4).',
            explanation: '(x - 4)(x + 4)/(x - 4) = x + 4.',
            remediation: 'Factoring difference of squares.'
          },
          {
            id: 'reassess-alg-3',
            question: 'Factor:  x^2 + 7x + 12',
            options: ['(x + 3)(x + 4)', '(x + 2)(x + 6)', '(x + 1)(x + 12)', '(x - 3)(x - 4)'],
            correctAnswer: 0,
            solution: 'Find two numbers that multiply to 12 and add to 7: 3 and 4. (x + 3)(x + 4).',
            topic: 'functions',
            competency: 'Factoring monic trinomials',
            difficulty: 'easy',
            difficultyParameter: -0.4,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Algebraic manipulation error',
            hint1: '3 * 4 = 12 and 3 + 4 = 7.',
            hint2: '(x + 3)(x + 4).',
            explanation: '(x + 3)(x + 4).',
            remediation: 'Trinomial factoring product-sum technique.'
          }
        ]
      };

    case 'Computational error':
      return {
        category: 'Computational error',
        triggerReason: 'Repeated arithmetic slips and computational precision errors during calculations.',
        misconceptionAnalysis: 'AI Diagnostic Analysis: You understand the algebraic setup and formulas, but lose points due to arithmetic slips during fraction additions, integer operations, or PEMDAS order of operations.',
        shortExplanation: {
          title: 'Computational Accuracy & Arithmetic Verification',
          rules: [
            'Order of Operations (PEMDAS): Parentheses -> Exponents -> Multiplication & Division (left to right) -> Addition & Subtraction (left to right).',
            'Fraction Addition: Always find a Least Common Denominator (LCD) before adding numerators: a/b + c/d = (ad + bc) / bd.',
            'Double-Checking Technique: Estimate the magnitude of your answer before finalizing to catch arithmetic slips.'
          ],
          keyTakeaways: 'Write down intermediate arithmetic steps rather than calculating entirely in your head.'
        },
        workedExample: {
          title: 'Fraction Arithmetic and PEMDAS Precision',
          problemText: 'Evaluate:  3/4 - 1/6 + 2 * 5',
          commonMistake: '❌ Common Mistake: Subtracting 3/4 - 1/6 as (3-1)/(4-6) = 2/(-2) = -1, or adding before multiplying.',
          correctMethod: '✅ Correct Method: Multiply 2 * 5 = 10 first. Then find LCD for 4 and 6 (which is 12).',
          stepByStep: [
            'Step 1: Compute multiplication: 2 * 5 = 10',
            'Step 2: Find LCD for fractions: LCD of 4 and 6 is 12',
            'Step 3: Convert fractions: 3/4 = 9/12, and 1/6 = 2/12',
            'Step 4: Subtract: 9/12 - 2/12 = 7/12',
            'Step 5: Add constant: 10 + 7/12 = 127/12 (or 10 7/12)'
          ]
        },
        practiceQuestions: [
          {
            id: 'rem-comp-1',
            question: 'Evaluate:  2/3 + 3/5',
            options: ['19/15', '5/8', '6/15', '1'],
            correctAnswer: 0,
            solution: 'LCD is 15. 2/3 = 10/15. 3/5 = 9/15. 10/15 + 9/15 = 19/15.',
            topic: 'functions',
            competency: 'Fraction addition precision',
            difficulty: 'easy',
            difficultyParameter: -0.6,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Computational error',
            hint1: 'Common denominator is 15.',
            hint2: '10/15 + 9/15 = 19/15.',
            explanation: '10/15 + 9/15 = 19/15.',
            remediation: 'LCD fraction addition.'
          },
          {
            id: 'rem-comp-2',
            question: 'Calculate:  15 - 3 * (4 - 2)^2',
            options: ['3', '48', '141', '-9'],
            correctAnswer: 0,
            solution: 'Parentheses: (4 - 2) = 2. Exponent: 2^2 = 4. Multiply: 3 * 4 = 12. Subtract: 15 - 12 = 3.',
            topic: 'functions',
            competency: 'Order of operations arithmetic',
            difficulty: 'easy',
            difficultyParameter: -0.5,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Computational error',
            hint1: 'PEMDAS: do (4 - 2) = 2 first, then 2^2 = 4.',
            hint2: 'Then 3 * 4 = 12. Finally 15 - 12 = 3.',
            explanation: '15 - 3(4) = 15 - 12 = 3.',
            remediation: 'PEMDAS sequence.'
          },
          {
            id: 'rem-comp-3',
            question: 'If  f(x) = 3x^2 - 5x + 7, what is  f(4)?',
            options: ['35', '45', '27', '55'],
            correctAnswer: 0,
            solution: 'f(4) = 3(4^2) - 5(4) + 7 = 3(16) - 20 + 7 = 48 - 20 + 7 = 28 + 7 = 35.',
            topic: 'functions',
            competency: 'Polynomial numerical evaluation',
            difficulty: 'medium',
            difficultyParameter: -0.1,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Computational error',
            hint1: '4^2 is 16. 3 * 16 is 48.',
            hint2: '48 - 20 = 28. 28 + 7 = 35.',
            explanation: '48 - 20 + 7 = 35.',
            remediation: 'Step-by-step arithmetic verification.'
          }
        ],
        reassessmentQuestions: [
          {
            id: 'reassess-comp-1',
            question: 'Evaluate:  (4/7) * (21/8)',
            options: ['3/2', '84/56', '7/2', '1/2'],
            correctAnswer: 0,
            solution: 'Cross-cancel: 4/8 = 1/2. 21/7 = 3/1. (1 * 3) / (1 * 2) = 3/2.',
            topic: 'functions',
            competency: 'Fraction multiplication and cancellation',
            difficulty: 'easy',
            difficultyParameter: -0.4,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Computational error',
            hint1: 'Cancel 4 with 8 and 21 with 7.',
            hint2: 'Leaves (1/1) * (3/2) = 3/2.',
            explanation: '3/2.',
            remediation: 'Fraction simplification.'
          },
          {
            id: 'reassess-comp-2',
            question: 'Evaluate:  -8 + 5 * (-3) - (-10)',
            options: ['-13', '-33', '13', '-17'],
            correctAnswer: 0,
            solution: 'Multiply: 5 * (-3) = -15. Expression: -8 + (-15) - (-10) = -23 + 10 = -13.',
            topic: 'functions',
            competency: 'Signed integer multi-operation evaluation',
            difficulty: 'medium',
            difficultyParameter: 0.0,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Computational error',
            hint1: '5 * (-3) = -15.',
            hint2: '-8 - 15 + 10 = -13.',
            explanation: '-8 - 15 + 10 = -13.',
            remediation: 'Integer arithmetic order.'
          },
          {
            id: 'reassess-comp-3',
            question: 'Find the mean of the numbers:  14, 18, 22, 26',
            options: ['20', '19', '21', '22'],
            correctAnswer: 0,
            solution: 'Sum = 14 + 18 + 22 + 26 = 80. Mean = 80 / 4 = 20.',
            topic: 'business-math',
            competency: 'Arithmetic mean calculation',
            difficulty: 'easy',
            difficultyParameter: -0.5,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Computational error',
            hint1: 'Add the 4 numbers: 80.',
            hint2: 'Divide 80 by 4 = 20.',
            explanation: '80 / 4 = 20.',
            remediation: 'Sum and divide precision.'
          }
        ]
      };

    case 'Misreading the problem':
    default:
      return {
        category: 'Misreading the problem',
        triggerReason: 'Repeatedly answering for an incorrect variable or misinterpreting problem constraints.',
        misconceptionAnalysis: 'AI Diagnostic Analysis: You understand the mathematics, but frequently solve for the intermediate variable x instead of the requested value f(x), confuse domain with range, or overlook negative constraints such as "except" or "which is NOT".',
        shortExplanation: {
          title: 'Active Problem Reading & Question Verification',
          rules: [
            'Circle the Objective: Identify whether the problem asks for x, y, f(x), domain, maximum value, or inverse.',
            'Watch for Qualifier Words: Words like "NOT", "EXCEPT", "INTEGER", and "RESTRICTED" fundamentally change the required answer.',
            'Final Sanity Check: After solving, re-read the last sentence of the prompt to confirm your answer directly matches what was asked.'
          ],
          keyTakeaways: 'Never submit your answer immediately after finding x. Check if the question asked for 2x + 1 or f(x) instead.'
        },
        workedExample: {
          title: 'Target Question Verification',
          problemText: 'If  2x + 5 = 15, what is the value of  3x - 1?',
          commonMistake: '❌ Common Mistake: Solving 2x = 10 => x = 5, and immediately picking "5" as the answer.',
          correctMethod: '✅ Correct Method: Re-read the question: it asks for 3x - 1, not x! Substitute x = 5 into 3(5) - 1 = 14.',
          stepByStep: [
            'Step 1: Solve for x: 2x = 10 => x = 5',
            'Step 2: Re-read the target question: "what is the value of 3x - 1?"',
            'Step 3: Substitute x = 5: 3(5) - 1 = 15 - 1 = 14',
            'Step 4: Answer is 14 (not 5).'
          ]
        },
        practiceQuestions: [
          {
            id: 'rem-mis-1',
            question: 'If  3x - 4 = 11, what is the value of  2x + 3?',
            options: ['13', '5', '10', '15'],
            correctAnswer: 0,
            solution: '3x = 15 => x = 5. Target is 2x + 3: 2(5) + 3 = 10 + 3 = 13.',
            topic: 'functions',
            competency: 'Target variable identification',
            difficulty: 'easy',
            difficultyParameter: -0.5,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Misreading the problem',
            hint1: 'Solve for x first: x = 5.',
            hint2: 'Then plug x = 5 into 2x + 3.',
            explanation: 'x = 5, so 2(5) + 3 = 13.',
            remediation: 'Look for target expression after finding x.'
          },
          {
            id: 'rem-mis-2',
            question: 'Which of the following is NOT a rational function?',
            options: ['f(x) = (√x + 1) / (x - 2)', 'f(x) = (x^2 - 4) / (x + 1)', 'f(x) = 5 / (x - 3)', 'f(x) = (2x + 1) / 7'],
            correctAnswer: 0,
            solution: 'A rational function is the ratio of two polynomials. √x is not a polynomial (fractional exponent x^(1/2)), so (√x + 1)/(x - 2) is NOT a rational function.',
            topic: 'functions',
            competency: 'Identifying non-examples in definitions',
            difficulty: 'medium',
            difficultyParameter: 0.0,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Understanding',
            misconceptionCategory: 'Misreading the problem',
            hint1: 'Note the word "NOT".',
            hint2: 'Polynomials cannot have variables under square roots.',
            explanation: '√x prevents the numerator from being a polynomial.',
            remediation: 'Carefully observe negative qualification words.'
          },
          {
            id: 'rem-mis-3',
            question: 'For the quadratic function  f(x) = -(x - 3)^2 + 8, what is the MAXIMUM VALUE of the function?',
            options: ['8', '3', '-3', '-8'],
            correctAnswer: 0,
            solution: 'The vertex is (3, 8). The maximum value of the function refers to the y-value (output), which is 8 (occurring at x = 3).',
            topic: 'functions',
            competency: 'Distinguishing function output value from input location',
            difficulty: 'medium',
            difficultyParameter: 0.1,
            discriminationParameter: 1.4,
            cognitiveLevel: 'Analyzing',
            misconceptionCategory: 'Misreading the problem',
            hint1: 'The vertex is (3, 8).',
            hint2: 'Maximum value refers to the y-value (8), not the x-value (3).',
            explanation: 'Maximum value is the output y = 8.',
            remediation: 'Function value means y-coordinate, not x.'
          }
        ],
        reassessmentQuestions: [
          {
            id: 'reassess-mis-1',
            question: 'If  4x + 2 = 18, find the value of  x^2 - 1.',
            options: ['15', '4', '16', '7'],
            correctAnswer: 0,
            solution: '4x = 16 => x = 4. Target is x^2 - 1 = 4^2 - 1 = 16 - 1 = 15.',
            topic: 'functions',
            competency: 'Target expression evaluation',
            difficulty: 'easy',
            difficultyParameter: -0.4,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Misreading the problem',
            hint1: 'x = 4.',
            hint2: 'Compute 4^2 - 1 = 15.',
            explanation: '4^2 - 1 = 15.',
            remediation: 'Evaluate target requested.'
          },
          {
            id: 'reassess-mis-2',
            question: 'What is the y-intercept of the function  f(x) = (2x - 6) / (x + 3)?',
            options: ['-2', '3', '-3', '2'],
            correctAnswer: 0,
            solution: 'The y-intercept occurs when x = 0: f(0) = (2(0) - 6) / (0 + 3) = -6 / 3 = -2.',
            topic: 'functions',
            competency: 'Evaluating y-intercept vs x-intercept',
            difficulty: 'medium',
            difficultyParameter: 0.0,
            discriminationParameter: 1.3,
            cognitiveLevel: 'Applying',
            misconceptionCategory: 'Misreading the problem',
            hint1: 'y-intercept means plugging in x = 0 (not setting y = 0).',
            hint2: '-6 / 3 = -2.',
            explanation: 'f(0) = -6 / 3 = -2.',
            remediation: 'y-intercept is f(0).'
          },
          {
            id: 'reassess-mis-3',
            question: 'Which value of x is EXCLUDED from the domain of  f(x) = 7 / (2x - 8)?',
            options: ['x = 4', 'x = 0', 'x = 7', 'x = -4'],
            correctAnswer: 0,
            solution: 'Denominator equals zero when 2x - 8 = 0 => 2x = 8 => x = 4.',
            topic: 'functions',
            competency: 'Identifying excluded domain values',
            difficulty: 'easy',
            difficultyParameter: -0.5,
            discriminationParameter: 1.2,
            cognitiveLevel: 'Understanding',
            misconceptionCategory: 'Misreading the problem',
            hint1: 'Set 2x - 8 = 0.',
            hint2: 'x = 4 is the excluded value.',
            explanation: '2(4) - 8 = 0, so x = 4 is excluded.',
            remediation: 'Domain exclusion identification.'
          }
        ]
      };
  }
}
