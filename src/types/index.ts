import { type } from "os";

// src/types/index.ts

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'paid' | 'pending';

export interface Transaction {
  id: string;
  description: string;
  amount: number; // Valor da parcela para parcelada, ou valor total para única/recorrente
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
  currentInstallment?: number;
  originalPurchaseDate?: string;
  installmentGroupId?: string;
  installmentFrequency?: string;
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
};

// --- NOVO TIPO: WishlistItem ---
export type WishlistItemStatus = 'pending' | 'bought'; // Pendente ou Comprado

export interface WishlistItem {
  id: string;
  name: string; // Nome do item desejado (ex: "Novo Celular")
  estimatedPrice: number; // Preço estimado (ex: 1500.00)
  desiredDate?: string; // Data desejada para a compra (ex: "DD/MM/YYYY")
  status: WishlistItemStatus; // Status: 'pending' ou 'bought'
  notes?: string; // Notas adicionais
  creationDate: string; // Data em que o item foi adicionado à lista
}