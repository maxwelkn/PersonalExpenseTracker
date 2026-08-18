namespace PersonalExpenseTracker.Application.DTOs.Reports;

public class MonthlyCategoryExpenseDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal TotalSpent { get; set; }
    public decimal PercentageOfTotal { get; set; }
}
