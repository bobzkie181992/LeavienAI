import { Problem, MathErrorCategory, AIMistakeGuidance } from '../types';
import { classifyMathError } from './errorClassifier';

/**
 * Intelligent AI Math Tutor Coaching Engine.
 * Instead of simply saying "Wrong" and immediately exposing the solution,
 * this engine:
 * 1. Analyzes the student's selected answer vs the correct answer.
 * 2. Generates an empathetic, targeted coaching prompt (e.g. "Check the value that makes the denominator equal to zero. Set x − 3 = 0 and solve for x.").
 * 3. Formulates 3 structured hints:
 *    - Hint 1: Conceptual hint
 *    - Hint 2: Procedural hint
 *    - Hint 3: First concrete step
 * 4. Ensures the complete answer is withheld until explicitly requested.
 */
export function generateAIMistakeGuidance(
  problem: Problem,
  selectedOptionIndex: number
): AIMistakeGuidance {
  const selectedText = problem.options[selectedOptionIndex] || '';
  const correctText = problem.options[problem.correctAnswer] || '';
  const qText = (problem.question || '').toLowerCase();
  const selLower = selectedText.toLowerCase();
  const corLower = correctText.toLowerCase();
  const misc = (problem.misconceptionCategory || '').toLowerCase();
  const comp = (problem.competency || '').toLowerCase();

  // Classify standard error category
  const classification = classifyMathError(problem, selectedOptionIndex);

  // =========================================================================
  // 1. SPECIFIC CASE: Rational Functions / Domain / Denominator Restrictions
  // (e.g., Student answers "x ≠ -3", Correct is "x ≠ 3", or "x ≠ -4" vs "x ≠ 4")
  // =========================================================================
  const isDomainRestriction = 
    qText.includes('restricted value') ||
    qText.includes('domain restriction') ||
    qText.includes('domain of') ||
    selLower.includes('x ≠') ||
    selLower.includes('x !=') ||
    corLower.includes('x ≠') ||
    corLower.includes('x !=') ||
    misc.includes('restricted value') ||
    misc.includes('denominator');

  if (isDomainRestriction) {
    // Extract potential denominator expression from question, e.g., "x - 3", "x - 4", "x + 2"
    let denomMatch = problem.question.match(/(?:x\s*[-+]\s*\d+)/i);
    let denomExpr = denomMatch ? denomMatch[0].trim() : 'x − 3';

    // Check if the student made a sign error on the restricted value (e.g., -3 vs 3)
    const selVal = selectedText.replace(/[^0-9-]/g, '');
    const corVal = correctText.replace(/[^0-9-]/g, '');

    return {
      category: 'Sign error',
      coachingMessage: `Check the value that makes the denominator equal to zero. Set ${denomExpr} = 0 and solve for x.`,
      hint1Conceptual: 'A rational expression is undefined when its denominator equals zero. The domain consists of all real numbers except values that cause division by zero.',
      hint2Procedural: `Isolate the denominator expression (${denomExpr}), set it equal to 0, and use inverse operations to solve for x.`,
      hint3FirstStep: `Set up the equation: ${denomExpr} = 0. Notice what sign change occurs when you isolate x on one side.`,
      remediationTip: 'Remember: setting x - c = 0 yields x = c, while setting x + c = 0 yields x = -c.'
    };
  }

  // =========================================================================
  // 2. Composite Functions (f ∘ g)(x) or f(g(x))
  // =========================================================================
  if (qText.includes('(f ∘ g)') || qText.includes('composite') || qText.includes('f(g(') || misc.includes('composite')) {
    return {
      category: 'Incorrect procedure',
      coachingMessage: 'Check the substitution order. In a composite function (f ∘ g)(x), evaluate the inside function first before applying the outside function.',
      hint1Conceptual: 'Function composition (f ∘ g)(x) means f(g(x)). The output of g(x) serves directly as the input for f.',
      hint2Procedural: 'Evaluate the inner function first to find a single numerical value. Then substitute that result into the formula for f(x).',
      hint3FirstStep: 'Find the value of the inner function first. Once computed, plug that number into the outer function.',
      remediationTip: 'Work from the inside out: do not multiply the two functions together unless requested.'
    };
  }

  // =========================================================================
  // 3. Inverse Functions f⁻¹(x)
  // =========================================================================
  if (qText.includes('inverse') || selLower.includes('f⁻¹') || misc.includes('inverse') || comp.includes('inverse')) {
    return {
      category: 'Algebraic manipulation error',
      coachingMessage: 'Check your inverse function setup. Did you swap the roles of x and y before algebraically isolating y?',
      hint1Conceptual: 'An inverse function reverses the mapping of the original function. Graphically, it reflects the curve across the line y = x.',
      hint2Procedural: 'Replace f(x) with y, swap all occurrences of x and y, and then use algebraic operations to solve for y.',
      hint3FirstStep: 'Write: x = (expression with y). Clear any denominators first by multiplying both sides.',
      remediationTip: 'Swapping variables must occur before isolating the new dependent variable.'
    };
  }

  // =========================================================================
  // 4. Evaluating Functions with Negative Inputs (e.g., f(-2), squaring negatives)
  // =========================================================================
  if (qText.includes('f(-') || misc.includes('squaring negative') || misc.includes('sign error')) {
    return {
      category: 'Sign error',
      coachingMessage: 'Check your sign when evaluating negative inputs. Remember that squaring a negative number yields a positive product.',
      hint1Conceptual: 'Parentheses matter: (-n)² = (-n) × (-n) = +n², whereas -n² = -(n²).',
      hint2Procedural: 'Substitute the negative input inside parentheses for every variable, then follow PEMDAS (Parentheses, Exponents, Multiplication, Addition).',
      hint3FirstStep: 'Write the expression with parentheses around the negative input before evaluating the exponents.',
      remediationTip: 'Always bracket negative inputs: e.g., 2(-2)² = 2(4) = 8.'
    };
  }

  // =========================================================================
  // 5. Identifying Functions vs Relations (Vertical Line Test / Uniqueness)
  // =========================================================================
  if (qText.includes('represents a function') || qText.includes('not a function') || misc.includes('vertical line') || misc.includes('relation')) {
    return {
      category: 'Conceptual misunderstanding',
      coachingMessage: 'Check the definition of a function. Does any single input (x-value) map to more than one output (y-value)?',
      hint1Conceptual: 'A relation is a function if and only if each unique input in the domain corresponds to exactly one output in the codomain.',
      hint2Procedural: 'Inspect the x-coordinates: if an x-coordinate repeats with different y-values, or if a vertical line crosses the graph more than once, it is not a function.',
      hint3FirstStep: 'List the x-values (inputs) of each option. Look for any x that appears more than once with differing outputs.',
      remediationTip: 'Multiple different inputs may share the same output, but one input can never produce two different outputs.'
    };
  }

  // =========================================================================
  // 6. Rational Equations & Extraneous Roots
  // =========================================================================
  if (qText.includes('solve for x') && (qText.includes('/') || qText.includes('rational'))) {
    return {
      category: 'Incorrect procedure',
      coachingMessage: 'Check the common denominator and domain restrictions. Multiply both sides by the LCD and verify candidate roots.',
      hint1Conceptual: 'To solve a rational equation, clear fractions by multiplying both sides by the least common denominator (LCD).',
      hint2Procedural: 'Find the LCD of all denominators, multiply every term by the LCD to eliminate fractions, solve the resulting polynomial, and check for extraneous roots.',
      hint3FirstStep: 'Identify the common denominator among the terms, then multiply both sides of the equation by this expression.',
      remediationTip: 'Always substitute your candidate solution back into original denominators to verify it does not produce division by zero.'
    };
  }

  // =========================================================================
  // 7. Logarithms & Exponential Equations
  // =========================================================================
  if (qText.includes('log') || qText.includes('exponential') || misc.includes('log')) {
    return {
      category: 'Formula error',
      coachingMessage: 'Check the logarithm laws. Remember that log(A) + log(B) = log(A × B), while log(A) − log(B) = log(A / B).',
      hint1Conceptual: 'Logarithms represent exponents: log_b(x) = y means b^y = x. Adding logarithms of the same base multiplies their arguments.',
      hint2Procedural: 'Condense multiple logarithms into a single log term using logarithm laws before converting to exponential form.',
      hint3FirstStep: 'Apply the product rule log(u) + log(v) = log(uv) or quotient rule to combine terms on the side with multiple logarithms.',
      remediationTip: 'Do not distribute log over addition: log(x + y) ≠ log(x) + log(y).'
    };
  }

  // =========================================================================
  // 8. Business Mathematics (Simple & Compound Interest, Annuities)
  // =========================================================================
  if (qText.includes('interest') || qText.includes('principal') || qText.includes('annuity') || misc.includes('interest')) {
    return {
      category: 'Formula error',
      coachingMessage: 'Check which financial formula is required. Note the difference between simple growth (I = Prt) and periodic compounding (A = P(1 + r/n)^(nt)).',
      hint1Conceptual: 'Simple interest only earns return on the initial principal. Compound interest earns return on both principal and previously accumulated interest.',
      hint2Procedural: 'Identify the given variables: principal P, annual rate r (expressed as decimal), compounding periods per year n, and time t in years.',
      hint3FirstStep: 'Convert the interest rate percentage to a decimal by dividing by 100, then substitute known quantities into the formula.',
      remediationTip: 'Ensure the time t is measured in years (e.g. 6 months = 0.5 years).'
    };
  }

  // =========================================================================
  // 9. Polynomial Expansion & Binomial Powers (e.g., (x+h)², (a+b)²)
  // =========================================================================
  if (qText.includes('(x+h)') || qText.includes('f(x+h)') || misc.includes('expanding') || misc.includes('(x+h)^2')) {
    return {
      category: 'Algebraic manipulation error',
      coachingMessage: 'Check how you expanded the binomial power. Don\'t forget the middle 2ab cross-term when squaring a sum.',
      hint1Conceptual: 'Squaring a binomial produces a trinomial: (a + b)² = (a + b)(a + b) = a² + 2ab + b².',
      hint2Procedural: 'Replace every occurrence of x with the entire expression (x + h), then expand each binomial systematically before simplifying.',
      hint3FirstStep: 'Write: (x + h)² = x² + 2xh + h². Include all three terms when substituting back into the function.',
      remediationTip: '(a + b)² is never simply a² + b²; the cross-term 2ab is essential.'
    };
  }

  // =========================================================================
  // 10. General Heuristic Fallback based on problem hints & error classifier
  // =========================================================================
  const fallbackHint1 = problem.hint1?.trim() || 
    `Recall the core conceptual principles for ${problem.competency || problem.topic}. Consider which options can be immediately eliminated.`;
  const fallbackHint2 = problem.hint2?.trim() || 
    'Break the problem into clear sequential operations: isolate terms systematically and check intermediate signs.';
  const fallbackHint3 = problem.hints?.[2]?.trim() || 
    `Start by identifying the primary expression: substitute known values and perform the first algebraic simplification.`;

  return {
    category: classification.category,
    coachingMessage: `Let's analyze your step: examine how your selected expression compares with the target condition in ${problem.competency || problem.topic}.`,
    hint1Conceptual: fallbackHint1,
    hint2Procedural: fallbackHint2,
    hint3FirstStep: fallbackHint3,
    remediationTip: classification.remediationTip || 'Review the relevant formulas and verify each step with inverse operations.'
  };
}

/**
 * Async helper to fetch Gemini-generated coaching message and hints if online,
 * falling back safely and instantly to the local deterministic engine.
 */
export async function fetchAIMistakeDiagnosis(
  problem: Problem,
  selectedOptionIndex: number
): Promise<AIMistakeGuidance> {
  const localFallback = generateAIMistakeGuidance(problem, selectedOptionIndex);

  try {
    const selectedText = problem.options[selectedOptionIndex] || '';
    const correctText = problem.options[problem.correctAnswer] || '';

    const res = await fetch('/api/ai/diagnose-mistake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: problem.question,
        studentAnswer: selectedText,
        correctAnswer: correctText,
        topic: problem.topic,
        competency: problem.competency,
        options: problem.options
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.guidance) {
        return {
          coachingMessage: data.guidance.coachingMessage || localFallback.coachingMessage,
          hint1Conceptual: data.guidance.hint1Conceptual || localFallback.hint1Conceptual,
          hint2Procedural: data.guidance.hint2Procedural || localFallback.hint2Procedural,
          hint3FirstStep: data.guidance.hint3FirstStep || localFallback.hint3FirstStep,
          category: data.guidance.category || localFallback.category,
          remediationTip: data.guidance.remediationTip || localFallback.remediationTip
        };
      }
    }
  } catch (err) {
    // Network or server offline: seamlessly return high-precision local diagnosis
  }

  return localFallback;
}
