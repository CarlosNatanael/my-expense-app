// src/utils/transactionGenerators.ts
import { Transaction, RecurringTransaction, InstallmentTransaction } from '../types';

// Funções auxiliares para parsear e formatar datas
const parseDateString = (dateString: string): Date => {
  // Assume formato DD/MM/YYYY. Divide, inverte e junta para YYYY-MM-DD
  const [day, month, year] = dateString.split('/');
  return new Date(`${year}-${month}-${day}`);
};

// Se você já tem as datas no formato YYYY-MM-DD no mock e no AddTransactionScreen
// então new Date(dateString) já deve funcionar.
// No entanto, se o log mostra DD/MM/YYYY, a função acima é necessária.
// Estou ajustando para usar parseDateString para ser robusto com o formato DD/MM/YYYY.


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

    // Transações Únicas
    if (trans.frequency === 'once') {
      const transactionDate = parseDateString(trans.date); // Use parseDateString aqui
      if (transactionDate.getMonth() === targetMonth && transactionDate.getFullYear() === targetYear) {
        monthlyTransactions.push(trans);
      }
    }

    // Transações Recorrentes (Mensais)
    else if (trans.frequency === 'monthly') {
      const recurringTrans = trans as RecurringTransaction;
      const startDate = parseDateString(recurringTrans.startDate); // Use parseDateString aqui

      const hasStarted =
        startDate.getFullYear() < targetYear ||
        (startDate.getFullYear() === targetYear && startDate.getMonth() <= targetMonth);

      const hasNotEnded = !recurringTrans.endDate ||
        (parseDateString(recurringTrans.endDate).getFullYear() > targetYear || // Use parseDateString aqui
         (parseDateString(recurringTrans.endDate).getFullYear() === targetYear && parseDateString(recurringTrans.endDate).getMonth() >= targetMonth));

      if (hasStarted && hasNotEnded) {
        const monthlyInstance: Transaction = {
          ...recurringTrans,
          // Ajusta o dia para evitar problemas em meses com menos dias (ex: 31 de jan para fev)
          date: new Date(targetYear, targetMonth, Math.min(startDate.getDate(), new Date(targetYear, targetMonth + 1, 0).getDate())).toISOString().split('T')[0],
          id: `${recurringTrans.id}-${targetYear}-${targetMonth}`,
        };
        monthlyTransactions.push(monthlyInstance);
      }
    }

    // Transações Parceladas
    else if (trans.frequency === 'installment') {
      const installmentTrans = trans as InstallmentTransaction;
      const originalPurchaseDate = parseDateString(installmentTrans.originalPurchaseDate); // Use parseDateString aqui

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
          // Ajusta o dia para evitar problemas em meses com menos dias
          date: new Date(targetYear, targetMonth, Math.min(originalPurchaseDate.getDate(), new Date(targetYear, targetMonth + 1, 0).getDate())).toISOString().split('T')[0],
          id: `${installmentTrans.id}-${targetYear}-${targetMonth}`,
        };
        monthlyTransactions.push(installmentInstance);
      }
    }
  });

  monthlyTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return monthlyTransactions;
};