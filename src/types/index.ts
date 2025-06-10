export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  status: 'paid' | 'pending';
  frequency: 'once' | 'monthly' | 'installment';
  startDate?: string;
  endDate?: string;
  totalAmount?: number;
  totalInstallments?: number;
  currentInstallment?: number;
  originalPurchaseDate?: string;
  installmentGroupId?: string;
}

export type TransactionType = 'income' | 'expense';

export interface UniqueTransaction extends Transaction {
  // Campos específicos, se houver
}

export interface InstallmentTransaction extends Transaction {
  // Campos específicos, se houver
}

export interface RecurringTransaction extends Transaction {
  frequency: 'monthly';
  startDate?: string;
  endDate?: string; // Add this line to allow optional endDate
  // (other properties)
}