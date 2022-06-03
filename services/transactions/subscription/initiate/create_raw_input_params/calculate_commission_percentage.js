const calculateCommissionPercentage = ({ payinTotalAmount, payoutTotalAmount }) => {
  const commissionAmount = payinTotalAmount - payoutTotalAmount;
  return parseFloat(((commissionAmount / payinTotalAmount) * 100).toFixed(2));
}

export default calculateCommissionPercentage;