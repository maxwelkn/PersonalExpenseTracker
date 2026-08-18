namespace PersonalExpenseTracker.Application.DTOs.Budget;

public class ExceededBudgetDto
{
    public int BudgetId { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal BudgetAmount { get; set; }
    public decimal SpentAmount { get; set; }
    public decimal ExceededAmount { get; set; }
    public decimal PercentageConsumed { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
}
