import { Transaction, UniqueTransaction, RecurringTransaction, InstallmentTransaction } from '../types';

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
    else if (trans.frequency === 'monthly') {
      const recurringTrans = trans as RecurringTransaction; // Type assertion
      const startDate = recurringTrans.startDate ? new Date(recurringTrans.startDate) : new Date();

      // Verifica se a transação recorrente já começou
      const hasStarted =
        startDate.getFullYear() < targetYear ||
        (startDate.getFullYear() === targetYear && startDate.getMonth() <= targetMonth);

      // Verifica se a transação recorrente não terminou (se houver data de fim)
      const hasNotEnded = !recurringTrans.endDate ||
        (new Date(recurringTrans.endDate!).getFullYear() > targetYear ||
         (new Date(recurringTrans.endDate!).getFullYear() === targetYear && new Date(recurringTrans.endDate!).getMonth() >= targetMonth));

      if (hasStarted && hasNotEnded) {
        // Cria uma instância da transação para o mês atual
        const monthlyInstance: RecurringTransaction = {
          ...recurringTrans,
          // A data da instância deve ser do mês alvo. Podemos usar o dia do mês da data original,
          // ou um dia padrão como 1. Usarei o dia da transação original se for válido para o mês.
          date: new Date(targetYear, targetMonth, Math.min(startDate.getDate(), new Date(targetYear, targetMonth + 1, 0).getDate())).toISOString().split('T')[0],
          // O ID da instância pode ser o ID original + mês/ano para ser único para a exibição
          id: `${recurringTrans.id}-${targetYear}-${targetMonth}`,
        };
        monthlyTransactions.push(monthlyInstance);
      }
    }

    // Transações Parceladas
    else if (trans.frequency === 'installment') {
      const installmentTrans = trans as InstallmentTransaction; // Type assertion
      const originalPurchaseDate = installmentTrans.originalPurchaseDate
  ? new Date(installmentTrans.originalPurchaseDate)
  : new Date(); 

      // Calcula a diferença de meses entre a data da compra original e o mês alvo
      const diffMonths =
        (targetYear - originalPurchaseDate.getFullYear()) * 12 +
        (targetMonth - originalPurchaseDate.getMonth());

      // Verifica se a parcela atual corresponde ao mês alvo
      // currentInstallment representa a N-ésima parcela, onde 1 é a primeira parcela
      // diffMonths 0 significa o mês da compra, que seria a 1ª parcela (diffMonths + 1)
      if (
        installmentTrans.totalInstallments !== undefined &&
        diffMonths >= 0 &&
        diffMonths < installmentTrans.totalInstallments
      ) {
        const currentCalculatedInstallment = diffMonths + 1; // 1-based index

        // Criar uma instância da parcela para o mês atual
        const installmentInstance: InstallmentTransaction = {
          ...installmentTrans,
          currentInstallment: currentCalculatedInstallment,
          // A data da instância deve ser do mês alvo. Usamos o dia da compra original.
          date: new Date(targetYear, targetMonth, Math.min(originalPurchaseDate.getDate(), new Date(targetYear, targetMonth + 1, 0).getDate())).toISOString().split('T')[0],
          // O ID da instância para exibição
          id: `${installmentTrans.id}-${targetYear}-${targetMonth}`,
        };
        monthlyTransactions.push(installmentInstance);
      }
    }
  });

  // Opcional: ordenar as transações por data ou outro critério
  monthlyTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return monthlyTransactions;
};