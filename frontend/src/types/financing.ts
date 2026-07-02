export type FinancingType = 'financing' | 'leasing' | 'buyBack' | 'rentToBuy'

export interface FinancingScenarioInput {
  vehiclePrice: number
  downPayment: number
  termMonths: number
  tanPercent: number
  taegPercent: number
  finalPayment: number
  type: FinancingType
}

export interface FinancingScenarioResult {
  financedAmount: number
  monthlyPayment: number
  totalCost: number
  totalInterest: number
}
