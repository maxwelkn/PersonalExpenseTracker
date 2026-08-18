namespace PersonalExpenseTracker.Application.DTOs.Budget;

public class BudgetProgressDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public int CategoryId { get; set; }

    public decimal SpentAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public decimal PercentageConsumed { get; set; }
    public int AlertThreshold { get; set; }
    public bool IsExceeded { get; set; }
}
