// src/types/index.ts

import { type } from "os";

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'paid' | 'pending';

export interface Transaction {
  id: string;
  userId: string; // <--- NOVO CAMPO: ID do usuário Firebase
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

// --- WishlistItem (já existente) ---
export type WishlistItemStatus = 'pending' | 'bought';

export interface WishlistItem {
  id: string;
  name: string;
  estimatedPrice: number;
  desiredDate?: string;
  status: WishlistItemStatus;
  notes?: string;
  creationDate: string;
}