export const getLocalCurrencyInfo = (usdAmount: number, country?: string) => {
  const baseInrAmount = Math.round(usdAmount * 83.3);
  let localSymbol = '';
  let localAmount = 0;

  switch(country?.toLowerCase()) {
    case 'france':
    case 'italy':
      localSymbol = '€'; localAmount = usdAmount * 0.92; break;
    case 'japan':
      localSymbol = '¥'; localAmount = usdAmount * 150; break;
    case 'usa':
    case 'united states':
      localSymbol = '$'; localAmount = usdAmount * 1; break;
    case 'thailand':
      localSymbol = '฿'; localAmount = usdAmount * 35; break;
    case 'south africa':
      localSymbol = 'R'; localAmount = usdAmount * 19; break;
    case 'australia':
      localSymbol = 'A$'; localAmount = usdAmount * 1.5; break;
    case 'brazil':
      localSymbol = 'R$'; localAmount = usdAmount * 5; break;
    case 'india':
      return `₹${baseInrAmount.toLocaleString()}`;
    default:
      if (!country) return `₹${baseInrAmount.toLocaleString()}`;
      return `₹${baseInrAmount.toLocaleString()}`;
  }

  return `₹${baseInrAmount.toLocaleString()} (${localSymbol}${Math.round(localAmount).toLocaleString()})`;
};

export const formatINR = (usdAmount: number) => {
  return `₹${Math.round(usdAmount * 83.3).toLocaleString()}`;
};
