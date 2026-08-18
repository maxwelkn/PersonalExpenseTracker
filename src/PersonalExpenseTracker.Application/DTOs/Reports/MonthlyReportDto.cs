using System.Collections.Generic;

namespace PersonalExpenseTracker.Application.DTOs.Reports;

public class MonthlyReportDto
{
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal PreviousMonthTotal { get; set; }
    public decimal DifferenceFromPreviousMonth { get; set; }
    public IEnumerable<MonthlyCategoryExpenseDto> Categories { get; set; } = new List<MonthlyCategoryExpenseDto>();
    public IEnumerable<MonthlyCategoryExpenseDto> TopCategories { get; set; } = new List<MonthlyCategoryExpenseDto>();
}
