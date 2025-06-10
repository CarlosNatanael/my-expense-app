import { Transaction } from '../types'; // Mantenha apenas a importação de Transaction

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
      const transactionDate = new Date(trans.date);
      if (transactionDate.getMonth() === targetMonth && transactionDate.getFullYear() === targetYear) {
        monthlyTransactions.push(trans);
      }
    }

    // Transações Recorrentes (Mensais)
    // Não precisa de type assertion 'as RecurringTransaction'
    else if (trans.frequency === 'monthly') {
      // trans já é do tipo Transaction. Os campos startDate e endDate são opcionais nela.
      const startDate = trans.startDate ? new Date(trans.startDate) : new Date();

      const hasStarted =
        startDate.getFullYear() < targetYear ||
        (startDate.getFullYear() === targetYear && startDate.getMonth() <= targetMonth);

      // Acesse trans.endDate diretamente
      const hasNotEnded = !trans.endDate ||
        (new Date(trans.endDate).getFullYear() > targetYear ||
         (new Date(trans.endDate).getFullYear() === targetYear && new Date(trans.endDate).getMonth() >= targetMonth));

      if (hasStarted && hasNotEnded) {
        // Crie uma instância da transação para o mês atual
        const monthlyInstance: Transaction = { // Use Transaction aqui
          ...trans, // Use 'trans' diretamente
          date: new Date(targetYear, targetMonth, Math.min(startDate.getDate(), new Date(targetYear, targetMonth + 1, 0).getDate())).toISOString().split('T')[0],
          id: `${trans.id}-${targetYear}-${targetMonth}`,
        };
        monthlyTransactions.push(monthlyInstance);
      }
    }

    // Transações Parceladas
    // Não precisa de type assertion 'as InstallmentTransaction'
    else if (trans.frequency === 'installment') {
      // trans já é do tipo Transaction. Os campos originalPurchaseDate, totalInstallments, etc. são opcionais nela.
      const originalPurchaseDate = trans.originalPurchaseDate
        ? new Date(trans.originalPurchaseDate)
        : new Date();

      const diffMonths =
        (targetYear - originalPurchaseDate.getFullYear()) * 12 +
        (targetMonth - originalPurchaseDate.getMonth());

      // Verifique se totalInstallments é definido antes de usar
      if (
        trans.totalInstallments !== undefined &&
        diffMonths >= 0 &&
        diffMonths < trans.totalInstallments
      ) {
        const currentCalculatedInstallment = diffMonths + 1;

        // Crie uma instância da parcela para o mês atual
        const installmentInstance: Transaction = { // Use Transaction aqui
          ...trans, // Use 'trans' diretamente
          currentInstallment: currentCalculatedInstallment,
          date: new Date(targetYear, targetMonth, Math.min(originalPurchaseDate.getDate(), new Date(targetYear, targetMonth + 1, 0).getDate())).toISOString().split('T')[0],
          id: `${trans.id}-${targetYear}-${targetMonth}`,
        };
        monthlyTransactions.push(installmentInstance);
      }
    }
  });

  monthlyTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return monthlyTransactions;
};