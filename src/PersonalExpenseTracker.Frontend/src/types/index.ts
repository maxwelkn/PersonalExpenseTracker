export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
}

export interface Expense {
  id: number;
  amount: number;
  date: string;
  description: string;
  categoryId: number;
  paymentMethodId: number;
}

export interface Budget {
  id: number;
  amount: number;
  month: number;
  year: number;
  categoryId: number;
}

export interface BudgetProgress {
  id: number;
  amount: number;
  month: number;
  year: number;
  categoryId: number;
  categoryName: string;
  spentAmount: number;
  remainingAmount: number;
  percentageConsumed: number;
  alertThreshold: number;
  isExceeded: boolean;
}

export interface ExceededBudget {
  categoryId: number;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  exceededAmount: number;
  percentageConsumed: number;
}

export interface MonthlyCategoryExpense {
  categoryId: number;
  categoryName: string;
  totalSpent: number;
  percentageOfTotal: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  totalSpent: number;
  previousMonthTotal: number;
  differenceFromPreviousMonth: number;
  categories: MonthlyCategoryExpense[];
  topCategories: MonthlyCategoryExpense[];
}

export interface ImportResult {
  totalRows: number;
  importedRows: number;
  failedRows: number;
  errors: ImportError[];
}

export interface ImportError {
  rowNumber: number;
  fieldName: string;
  errorMessage: string;
}
