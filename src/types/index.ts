export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'paid' | 'pending';

export interface Transaction {
  id: string;
  // userId: string; // Removido se não for usar login Google
  description: string;
  amount: number;
  date: string; // Formato DD/MM/YYYY

  category: string;
  type: TransactionType;
  status: TransactionStatus;

  frequency: 'once' | 'monthly' | 'installment';

  // Campos opcionais para transações recorrentes
  startDate?: string;
  endDate?: string;

  // Campos opcionais para transações parceladas
  totalAmount?: number;      // Valor total da compra parcelada (calculado)
  totalInstallments?: number;
  currentInstallment?: number; // Qual parcela é esta (N/Total)
  originalPurchaseDate?: string;
  installmentGroupId?: string;
  installmentFrequency?: string;
  paidOccurrences?: string[]; // <--- NOVO CAMPO: Array de strings 'YYYY-MM' para parcelas pagas
}
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
  installmentFrequency: string;
  paidOccurrences?: string[]; // Para garantir que está presente no tipo específico
};
// --- WishlistItem (já existente) ---
export type WishlistItemStatus = 'pending' | 'bought';

export interface WishlistItem {
  id: string;
  // userId: string; // Removido se não for usar login Google
  name: string;
  estimatedPrice: number;
  desiredDate?: string;
  status: WishlistItemStatus;
  notes?: string;
  creationDate: string;
}