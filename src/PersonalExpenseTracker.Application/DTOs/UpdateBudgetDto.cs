namespace PersonalExpenseTracker.Application.DTOs;

public class UpdateBudgetDto
{
    public decimal Amount { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public int CategoryId { get; set; }
}
