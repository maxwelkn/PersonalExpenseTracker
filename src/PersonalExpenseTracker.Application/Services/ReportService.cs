using PersonalExpenseTracker.Application.DTOs.Reports;
using PersonalExpenseTracker.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PersonalExpenseTracker.Application.Services;

public class ReportService
{
    private readonly IExpenseRepository _expenseRepository;
    private readonly ICategoryRepository _categoryRepository;

    public ReportService(IExpenseRepository expenseRepository, ICategoryRepository categoryRepository)
    {
        _expenseRepository = expenseRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<MonthlyReportDto> GetMonthlyReportAsync(int userId, int month, int year, int top = 3)
    {
        if (month < 1 || month > 12) throw new ArgumentException("El mes debe estar entre 1 y 12.");
        if (year < 1 || year > 9999) throw new ArgumentException("El año debe estar entre 1 y 9999.");
        if (top <= 0) throw new ArgumentException("Top debe ser mayor a 0.");

        var currentTotals = await _expenseRepository.GetTotalsByUserPeriodGroupedByCategoryAsync(userId, year, month);
        
        decimal previousMonthTotal = 0m;
        
        // Handle technical limit: January Year 1 cannot go back to Year 0.
        if (year > 1 || month > 1)
        {
            int prevMonth = month == 1 ? 12 : month - 1;
            int prevYear = month == 1 ? year - 1 : year;
            var previousTotals = await _expenseRepository.GetTotalsByUserPeriodGroupedByCategoryAsync(userId, prevYear, prevMonth);
            previousMonthTotal = previousTotals.Sum(t => t.TotalAmount);
        }

        decimal totalSpent = currentTotals.Sum(t => t.TotalAmount);
        decimal difference = totalSpent - previousMonthTotal;

        var categories = await _categoryRepository.GetAllByUserIdAsync(userId);
        var categoryMap = categories.ToDictionary(c => c.Id, c => c.Name);

        var categoryBreakdown = new List<MonthlyCategoryExpenseDto>();

        foreach (var ct in currentTotals)
        {
            if (ct.TotalAmount > 0)
            {
                string catName = categoryMap.TryGetValue(ct.CategoryId, out var name) ? name : "Unknown Category";
                decimal percentage = totalSpent > 0 ? Math.Round((ct.TotalAmount / totalSpent) * 100m, 2) : 0m;

                categoryBreakdown.Add(new MonthlyCategoryExpenseDto
                {
                    CategoryId = ct.CategoryId,
                    CategoryName = catName,
                    TotalSpent = ct.TotalAmount,
                    PercentageOfTotal = percentage
                });
            }
        }

        var topCategories = categoryBreakdown
            .OrderByDescending(c => c.TotalSpent)
            .Take(top)
            .ToList();

        return new MonthlyReportDto
        {
            Month = month,
            Year = year,
            TotalSpent = totalSpent,
            PreviousMonthTotal = previousMonthTotal,
            DifferenceFromPreviousMonth = difference,
            Categories = categoryBreakdown,
            TopCategories = topCategories
        };
    }
}
