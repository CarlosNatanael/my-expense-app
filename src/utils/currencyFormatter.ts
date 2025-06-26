// src/utils/currencyFormatter.ts

/**
 * Formata um número para o padrão monetário brasileiro (BRL)
 * com separador de milhar (ponto) e separador decimal (vírgula).
 * Ex: 3448.74 -> "3.448,74"
 * @param amount O valor numérico a ser formatado.
 * @returns Uma string formatada.
 */
export const formatAmountWithThousandsSeparator = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2, // Garante pelo menos duas casas decimais
    maximumFractionDigits: 2, // Garante no máximo duas casas decimais
  }).format(amount);
};

export const formatCurrency = (value: number): string => {
  // Garante que, se o valor for inválido (NaN), ele seja tratado como 0.
  if (isNaN(value)) {
    value = 0;
  }

  // Usa a API de internacionalização para formatar o número corretamente.
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });

  return formatter.format(value);
};