export interface FormulaItem {
  id: string;
  name: string;
  latex: string;
}

export interface FormulaGradeGroup {
  grade: string; // e.g. 'primary', 'middle', 'high', 'university'
  formulas: FormulaItem[];
}

export interface FormulaSubject {
  subject: string; // e.g. 'math', 'physics', 'chemistry', 'biology'
  groups: FormulaGradeGroup[];
}

export const PRESET_FORMULAS: FormulaSubject[] = [
  {
    subject: 'math',
    groups: [
      {
        grade: 'primary',
        formulas: [
          { id: 'math-p-1', name: 'Fraction', latex: '\\frac{a}{b}' },
          { id: 'math-p-2', name: 'Multiplication', latex: 'a \\times b = c' },
          { id: 'math-p-3', name: 'Division', latex: 'a \\div b = c' },
        ],
      },
      {
        grade: 'middle',
        formulas: [
          { id: 'math-m-1', name: 'Quadratic', latex: 'ax^2 + bx + c = 0' },
          { id: 'math-m-2', name: 'Quadratic Formula', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
          { id: 'math-m-3', name: 'Pythagorean', latex: 'a^2 + b^2 = c^2' },
          { id: 'math-m-4', name: 'Circle Area', latex: 'S = \\pi r^2' },
          { id: 'math-m-5', name: 'Trigonometry', latex: '\\sin^2\\theta + \\cos^2\\theta = 1' },
        ],
      },
      {
        grade: 'high',
        formulas: [
          { id: 'math-h-1', name: 'Logarithm', latex: '\\log_a(mn) = \\log_a m + \\log_a n' },
          { id: 'math-h-2', name: 'Binomial', latex: '(x+y)^n = \\sum_{k=0}^{n} \\binom{n}{k} x^{n-k}y^k' },
          { id: 'math-h-3', name: 'Limit', latex: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1' },
          { id: 'math-h-4', name: 'Derivative', latex: 'f\'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x)-f(x)}{\\Delta x}' },
          { id: 'math-h-5', name: 'Integral', latex: '\\int_a^b f(x) dx = F(b) - F(a)' },
        ],
      },
      {
        grade: 'university',
        formulas: [
          { id: 'math-u-1', name: 'Euler', latex: 'e^{i\\pi} + 1 = 0' },
          { id: 'math-u-2', name: 'Fourier Transform', latex: 'F(\\omega) = \\int_{-\\infty}^{\\infty} f(t) e^{-i\\omega t} dt' },
          { id: 'math-u-3', name: 'Taylor Series', latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x-a)^n' },
          { id: 'math-u-4', name: 'Gaussian Integral', latex: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}' },
          { id: 'math-u-5', name: 'Laplace Transform', latex: 'F(s) = \\int_0^{\\infty} f(t) e^{-st} dt' },
        ],
      },
    ],
  },
  {
    subject: 'physics',
    groups: [
      {
        grade: 'middle',
        formulas: [
          { id: 'phy-m-1', name: 'Velocity', latex: 'v = \\frac{s}{t}' },
          { id: 'phy-m-2', name: 'Density', latex: '\\rho = \\frac{m}{V}' },
          { id: 'phy-m-3', name: 'Pressure', latex: 'P = \\frac{F}{S}' },
          { id: 'phy-m-4', name: 'Work', latex: 'W = Fs' },
          { id: 'phy-m-5', name: 'Ohm Law', latex: 'I = \\frac{U}{R}' },
        ],
      },
      {
        grade: 'high',
        formulas: [
          { id: 'phy-h-1', name: 'Newton 2nd Law', latex: 'F = ma' },
          { id: 'phy-h-2', name: 'Kinetic Energy', latex: 'E_k = \\frac{1}{2}mv^2' },
          { id: 'phy-h-3', name: 'Gravitation', latex: 'F = G\\frac{m_1 m_2}{r^2}' },
          { id: 'phy-h-4', name: 'Lorentz Force', latex: '\\mathbf{F} = q(\\mathbf{E} + \\mathbf{v} \\times \\mathbf{B})' },
          { id: 'phy-h-5', name: 'Mass-Energy', latex: 'E = mc^2' },
        ],
      },
      {
        grade: 'university',
        formulas: [
          { id: 'phy-u-1', name: 'Schrödinger', latex: 'i\\hbar \\frac{\\partial}{\\partial t} \\Psi = \\hat{H} \\Psi' },
          { id: 'phy-u-2', name: 'Maxwell 1', latex: '\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}' },
          { id: 'phy-u-3', name: 'Maxwell 2', latex: '\\nabla \\cdot \\mathbf{B} = 0' },
          { id: 'phy-u-4', name: 'Maxwell 3', latex: '\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}' },
          { id: 'phy-u-5', name: 'Maxwell 4', latex: '\\nabla \\times \\mathbf{B} = \\mu_0\\mathbf{J} + \\mu_0\\varepsilon_0\\frac{\\partial \\mathbf{E}}{\\partial t}' },
        ],
      },
    ],
  },
  {
    subject: 'chemistry',
    groups: [
      {
        grade: 'middle',
        formulas: [
          { id: 'chem-m-1', name: 'Water', latex: '2H_2 + O_2 \\xrightarrow{\\text{点燃}} 2H_2O' },
          { id: 'chem-m-2', name: 'Carbon Dioxide', latex: 'C + O_2 \\xrightarrow{\\text{点燃}} CO_2' },
          { id: 'chem-m-3', name: 'Photosynthesis', latex: '6CO_2 + 6H_2O \\xrightarrow{\\text{光照}} C_6H_{12}O_6 + 6O_2' },
        ],
      },
      {
        grade: 'high',
        formulas: [
          { id: 'chem-h-1', name: 'Equilibrium Constant', latex: 'K_c = \\frac{[C]^c [D]^d}{[A]^a [B]^b}' },
          { id: 'chem-h-2', name: 'Ideal Gas Law', latex: 'PV = nRT' },
          { id: 'chem-h-3', name: 'pH', latex: '\\text{pH} = -\\log_{10}[H^+]' },
          { id: 'chem-h-4', name: 'Nernst Equation', latex: 'E = E^\\circ - \\frac{RT}{nF} \\ln Q' },
        ],
      },
    ],
  },
  {
    subject: 'biology',
    groups: [
      {
        grade: 'high',
        formulas: [
          { id: 'bio-h-1', name: 'Hardy-Weinberg', latex: 'p^2 + 2pq + q^2 = 1' },
          { id: 'bio-h-2', name: 'Population Growth', latex: '\\frac{dN}{dt} = rN\\left(1 - \\frac{N}{K}\\right)' },
        ],
      },
    ],
  },
];
