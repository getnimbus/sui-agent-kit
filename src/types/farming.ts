/* eslint-disable @typescript-eslint/no-wrapper-object-types */

export type FARMING_TYPE =
  | "LENDING"
  | "BORROW"
  | "REPAY"
  | "ADD_LP"
  | "REMOVE_LP"
  | "STAKING"
  | "UNSTAKING"
  | "LENDING_WITHDRAW";

export interface IBaseTransactionParams {
  type: FARMING_TYPE;
}

export interface ILendingParams extends IBaseTransactionParams {
  type: "LENDING";
  amount: number;
  symbol: string;
}

export interface IBorrowParams extends IBaseTransactionParams {
  type: "BORROW";
  collateral: string;
  amount: number;
}

export interface IRepayParams extends IBaseTransactionParams {
  type: "REPAY";
  collateral: string;
  amount: BigInt;
  tokenAddress?: string;
}

export interface IAddLpParams extends IBaseTransactionParams {
  type: "ADD_LP";
  tokenA: string;
  tokenB: string;
  amountA: BigInt;
  amountB: BigInt;
  slippage?: number;
  singleSided?: boolean;
  lowerPrice?: number;
  upperPrice?: number;
}

export interface IRemoveLpParams extends IBaseTransactionParams {
  type: "REMOVE_LP";
  amount: BigInt;
}

export interface IStakingParams extends IBaseTransactionParams {
  type: "STAKING";
  amount: number;
  symbol: string;
}

export interface IUnstakingParams extends IBaseTransactionParams {
  type: "UNSTAKING";
  amount: number;
  symbol: string;
  positionId?: string;
}

export interface IWithdrawParams extends IBaseTransactionParams {
  type: "LENDING_WITHDRAW";
  amount: BigInt;
  symbol: string;
}

// Union of all transaction parameter types
export type ITransactionParams =
  | ILendingParams
  | IBorrowParams
  | IAddLpParams
  | IRemoveLpParams
  | IStakingParams
  | IUnstakingParams
  | IWithdrawParams
  | IRepayParams;

export type PrepareTransaction = (
  type: FARMING_TYPE,
) => { field: string; type: string }[];
export type GetTransactionPayload = (
  params: ITransactionParams,
) => Promise<string>;

export interface IDeFiFarmingAdapter {
  chain: string;
  protocol: string;
  prepareTransaction: PrepareTransaction;
  getTransactionPayload: GetTransactionPayload;
}
