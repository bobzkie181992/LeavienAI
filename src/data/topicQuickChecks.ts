export interface TopicQuickCheck {
  topicId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const TOPIC_QUICK_CHECKS: Record<string, TopicQuickCheck> = {
  'functions': {
    topicId: 'functions',
    question: 'Which of the following relations is NOT a function?',
    options: [
      '{(1, 2), (2, 3), (3, 4)}',
      '{(2, 5), (3, 5), (4, 5)}',
      '{(1, 3), (1, 7), (2, 4)}',
      'y = 3x + 1'
    ],
    correctIndex: 2,
    explanation: 'In {(1, 3), (1, 7), (2, 4)}, the input x = 1 corresponds to two different outputs (3 and 7). A function requires each input to have exactly one output.'
  },
  'trig': {
    topicId: 'trig',
    question: 'In a right triangle, if sin(θ) = 3/5, what is the exact value of cos(θ) using the Pythagorean Identity?',
    options: [
      '4/5',
      '3/4',
      '5/3',
      '16/25'
    ],
    correctIndex: 0,
    explanation: 'Using sin²θ + cos²θ = 1: (3/5)² + cos²θ = 1 ⟹ cos²θ = 1 - 9/25 = 16/25 ⟹ cos(θ) = 4/5.'
  },
  'exp-log': {
    topicId: 'exp-log',
    question: 'What is the equivalent exponential form of the logarithmic statement log₂(32) = 5?',
    options: [
      '5² = 32',
      '2⁵ = 32',
      '32² = 5',
      '2 · 5 = 10'
    ],
    correctIndex: 1,
    explanation: 'By definition of logarithms, log_b(x) = y is equivalent to b^y = x. Here base b = 2, exponent y = 5, and argument x = 32, so 2⁵ = 32.'
  },
  'term2-w1-piecewise': {
    topicId: 'term2-w1-piecewise',
    question: 'Given F(x) = { 20 if x ≤ 2; 20 + 5(x - 2) if x > 2 }, what is the fare for a distance of x = 4 km?',
    options: [
      '₱20',
      '₱30',
      '₱40',
      '₱25'
    ],
    correctIndex: 1,
    explanation: 'Because x = 4 > 2, substitute into the second condition: F(4) = 20 + 5(4 - 2) = 20 + 5(2) = ₱30.'
  },
  'term2-w2-statistics': {
    topicId: 'term2-w2-statistics',
    question: 'What does a low sample standard deviation indicate about a class exam result?',
    options: [
      'The scores are tightly clustered around the class mean (high consistency)',
      'The scores are widely scattered from the highest to lowest mark',
      'The class average score was low',
      'There are numerous extreme outliers in the dataset'
    ],
    correctIndex: 0,
    explanation: 'Standard deviation measures data dispersion. A smaller standard deviation indicates that student scores are clustered close to the average, demonstrating high consistency.'
  },
  'term2-w3-trig-right': {
    topicId: 'term2-w3-trig-right',
    question: 'To find the height of a flagpole given the horizontal distance to the observer and the angle of elevation, which ratio should you use?',
    options: [
      'Sine (Opposite / Hypotenuse)',
      'Cosine (Adjacent / Hypotenuse)',
      'Tangent (Opposite / Adjacent)',
      'Cosecant (Hypotenuse / Opposite)'
    ],
    correctIndex: 2,
    explanation: 'Tangent relates the opposite vertical height to the adjacent horizontal ground distance: tan(θ) = Opposite / Adjacent.'
  },
  'term2-w4-trig-oblique': {
    topicId: 'term2-w4-trig-oblique',
    question: 'Given two side lengths and the included angle (SAS) of an oblique triangle, which law must be applied to solve for the third side?',
    options: [
      'Law of Sines',
      'Law of Cosines (c² = a² + b² - 2ab cos C)',
      'Pythagorean Theorem',
      'Heron’s Formula'
    ],
    correctIndex: 1,
    explanation: 'The Law of Cosines c² = a² + b² - 2ab cos C directly solves for the opposite side in SAS triangle problems where Law of Sines cannot yet be set up.'
  },
  'term2-w5-area-perimeter': {
    topicId: 'term2-w5-area-perimeter',
    question: 'In Heron’s formula Area = √(s(s-a)(s-b)(s-c)), what does the variable s represent?',
    options: [
      'The longest side length',
      'The semi-perimeter: (a + b + c) / 2',
      'The square of the perimeter',
      'The surface area'
    ],
    correctIndex: 1,
    explanation: 's is the semi-perimeter, calculated as half of the perimeter: s = (a + b + c) / 2.'
  },
  'term2-w6-volume-cost': {
    topicId: 'term2-w6-volume-cost',
    question: 'How many cubic centimeters (cm³) are equal to 1 Liter of fluid capacity?',
    options: [
      '10 cm³',
      '100 cm³',
      '1,000 cm³',
      '10,000 cm³'
    ],
    correctIndex: 2,
    explanation: '1 Liter is defined as exactly 1,000 cubic centimeters (cm³) or 1 cubic decimeter (dm³).'
  },
  'term2-w7-random-variables': {
    topicId: 'term2-w7-random-variables',
    question: 'For any valid discrete probability distribution, the sum of all individual probabilities Σ P(X = x) must always equal:',
    options: [
      '0',
      '0.5',
      '1',
      'The sample size n'
    ],
    correctIndex: 2,
    explanation: 'By the fundamental axioms of probability, the sum of probabilities across all mutually exclusive outcomes in a discrete probability distribution must equal 1 (100%).'
  },
  'term2-w8-normal-distribution': {
    topicId: 'term2-w8-normal-distribution',
    question: 'According to the Empirical Rule (68-95-99.7), what percentage of data falls within ±1 standard deviation of the mean in a normal curve?',
    options: [
      '50%',
      'Approximately 68%',
      'Approximately 95%',
      'Approximately 99.7%'
    ],
    correctIndex: 1,
    explanation: 'The Empirical Rule states that approximately 68.26% (≈68%) of values lie within 1 standard deviation of the mean [μ - σ, μ + σ].'
  },
  'term3-w1-business-math': {
    topicId: 'term3-w1-business-math',
    question: 'Under Simple Interest (I = Prt), on what amount is the interest computed over the entire duration?',
    options: [
      'Only on the initial principal P',
      'On the principal plus accumulated interest',
      'On the future maturity value',
      'Compounded monthly'
    ],
    correctIndex: 0,
    explanation: 'Simple interest is calculated exclusively on the original principal amount P throughout the investment term t, without compounding.'
  }
};
