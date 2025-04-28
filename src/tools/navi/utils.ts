export const handleFormatSymbol = (symbol: string) => {
  switch (symbol) {
    case "SUI":
      return "Sui";
    case "vSUI":
      return "vSui";
    case "haSUI":
      return "haSui";
    case "wBTC":
      return "WBTC";
    case "SOL":
      return "WSOL";
    case "USDC":
      return "wUSDC";
    default:
      return symbol;
  }
};
