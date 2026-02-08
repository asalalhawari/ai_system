export const formatCurrency = (amount: number, currency: string = 'QAR'): string => {
  // Handle undefined, null, or NaN values
  if (amount == null || isNaN(amount)) {
    return `${currency} 0.00`;
  }
  
  if (amount >= 1000000) {
    return `${currency} ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${currency} ${(amount / 1000).toFixed(1)}K`;
  } else {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export const formatNumber = (value: number, decimals: number = 0): string => {
  if (value == null || isNaN(value)) {
    return '0';
  }
  return value.toLocaleString(undefined, { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  if (value == null || isNaN(value)) {
    return '0.0%';
  }
  return `${value.toFixed(decimals)}%`;
};
