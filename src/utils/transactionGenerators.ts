// src/utils/transactionGenerators.ts
import { Transaction, RecurringTransaction, InstallmentTransaction } from '../types';

// **Ajuste na função parseDateString**
const parseDateString = (dateString: string): Date => {
  // Tenta parsear no formato YYYY-MM-DD (padrão de new Date() com strings ISO)
  // Se for DD/MM/YYYY, o split('/') resultará em partes, caso contrário, não.
  if (dateString.includes('/')) {
    // Formato DD/MM/YYYY
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}`);
  } else {
    // Assume formato YYYY-MM-DD (ou outro formato ISO compatível com new Date())
    return new Date(dateString);
  }
};

/**
 * Gera as ocorrências de transações para um mês específico.
 *
 * @param allTransactions Todas as transações mestres salvas (únicas, recorrentes, parceladas).
 * @param targetDate A data de referência para o mês desejado (ex: new Date(2025, 5, 1) para Junho/2025).
 * @returns Um array de transações que devem ser exibidas para o mês alvo.
 */
export const generateMonthlyTransactions = (
  allTransactions: Transaction[],
  targetDate: Date
): Transaction[] => {
  const targetMonth = targetDate.getMonth();
  const targetYear = targetDate.getFullYear();

  const monthlyTransactions: Transaction[] = [];

  allTransactions.forEach(trans => {
    // console.log('Processing transaction:', trans.id, trans.description, 'Date:', trans.date); // Log para depuração

    // Transações Únicas
    if (trans.frequency === 'once') {
      const transactionDate = parseDateString(trans.date);
      // console.log('  Once - Parsed Date:', transactionDate);
      if (transactionDate.getMonth() === targetMonth && transactionDate.getFullYear() === targetYear) {
        monthlyTransactions.push(trans);
        // console.log('  Once - Added:', trans.description);
      }
    }

    // Transações Recorrentes (Mensais)
    else if (trans.frequency === 'monthly') {
      const recurringTrans = trans as RecurringTransaction;
      const startDate = parseDateString(recurringTrans.startDate);
      // console.log('  Monthly - Parsed Start Date:', startDate);

      const hasStarted =
        startDate.getFullYear() < targetYear ||
        (startDate.getFullYear() === targetYear && startDate.getMonth() <= targetMonth);

      const hasNotEnded = !recurringTrans.endDate ||
        (parseDateString(recurringTrans.endDate).getFullYear() > targetYear ||
         (parseDateString(recurringTrans.endDate).getFullYear() === targetYear && parseDateString(recurringTrans.endDate).getMonth() >= targetMonth));

      if (hasStarted && hasNotEnded) {
        const monthlyInstance: Transaction = {
          ...recurringTrans,
          date: new Date(targetYear, targetMonth, Math.min(startDate.getDate(), new Date(targetYear, targetMonth + 1, 0).getDate())).toISOString().split('T')[0],
          id: `${recurringTrans.id}-${targetYear}-${targetMonth}`,
        };
        monthlyTransactions.push(monthlyInstance);
        // console.log('  Monthly - Added:', monthlyInstance.description);
      }
    }

    // Transações Parceladas
    else if (trans.frequency === 'installment') {
      const installmentTrans = trans as InstallmentTransaction;
      const originalPurchaseDate = parseDateString(installmentTrans.originalPurchaseDate);
      // console.log('  Installment - Parsed Original Purchase Date:', originalPurchaseDate);

      const diffMonths =
        (targetYear - originalPurchaseDate.getFullYear()) * 12 +
        (targetMonth - originalPurchaseDate.getMonth());

      if (
        diffMonths >= 0 &&
        diffMonths < installmentTrans.totalInstallments
      ) {
        const currentCalculatedInstallment = diffMonths + 1;

        const installmentInstance: Transaction = {
          ...installmentTrans,
          currentInstallment: currentCalculatedInstallment,
          date: new Date(targetYear, targetMonth, Math.min(originalPurchaseDate.getDate(), new Date(targetYear, targetMonth + 1, 0).getDate())).toISOString().split('T')[0],
          id: `${installmentTrans.id}-${targetYear}-${targetMonth}`,
        };
        monthlyTransactions.push(installmentInstance);
        // console.log('  Installment - Added:', installmentInstance.description, installmentInstance.currentInstallment, '/', installmentInstance.totalInstallments);
      }
    }
  });

  monthlyTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  console.log('generateMonthlyTransactions - Final monthlyTransactions:', monthlyTransactions);

  return monthlyTransactions;
};