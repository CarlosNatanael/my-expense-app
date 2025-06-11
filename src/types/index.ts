// src/types/index.ts

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'paid' | 'pending'; // Pode ser usado se quiser, mas status já está em Transaction

export interface Transaction {
  id: string;
  description: string;
  amount: number; // Para despesas, armazene sempre o valor positivo aqui. O sinal é tratado na exibição/cálculo.
  date: string; // Formato YYYY-MM-DD

  category: string;
  type: TransactionType;
  status: TransactionStatus; // 'paid' ou 'pending'

  frequency: 'once' | 'monthly' | 'installment';

  // Campos opcionais para transações recorrentes e parceladas
  startDate?: string; // Usado para 'monthly'
  endDate?: string;   // Usado para 'monthly' (opcional)

  totalAmount?: number;      // Usado para 'installment' (valor total da compra)
  totalInstallments?: number; // Usado para 'installment' (total de parcelas)
  currentInstallment?: number; // Usado para 'installment' (parcela atual N/total)
  originalPurchaseDate?: string; // Usado para 'installment' (data da compra original)
  installmentGroupId?: string; // Usado para 'installment' (para agrupar parcelas da mesma compra)
  installmentFrequency?: string;
}

// Opcional: Se você quiser um tipo mais estrito para as transações no `transactionGenerators`,
// podemos definir tipos auxiliares que garantam a presença dos campos.
// Por exemplo:
export type RecurringTransaction = Transaction & {
  frequency: 'monthly';
  startDate: string;
};

export type InstallmentTransaction = Transaction & {
  frequency: 'installment';
  totalAmount: number;
  totalInstallments: number;
  currentInstallment: number;
  originalPurchaseDate: string;
  installmentGroupId: string;
};