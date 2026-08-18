using PersonalExpenseTracker.Application.DTOs.Reports;
using PersonalExpenseTracker.Application.Interfaces;
using System.Text;

namespace PersonalExpenseTracker.Infrastructure.Services;

public class TxtReportExportStrategy : IReportExportStrategy
{
    public string Format => "txt";

    public ReportExportResult Export(MonthlyReportDto report)
    {
        var sb = new StringBuilder();
        
        sb.AppendLine("========================================");
        sb.AppendLine($"Monthly Report: {report.Month:D2}/{report.Year}");
        sb.AppendLine("========================================");
        sb.AppendLine($"Total Spent: {report.TotalSpent:C}");
        sb.AppendLine($"Previous Month Total: {report.PreviousMonthTotal:C}");
        sb.AppendLine($"Difference: {report.DifferenceFromPreviousMonth:C}");
        sb.AppendLine();
        
        sb.AppendLine("Category Breakdown:");
        sb.AppendLine("----------------------------------------");
        foreach (var cat in report.Categories)
        {
            sb.AppendLine($"- {cat.CategoryName}: {cat.TotalSpent:C} ({cat.PercentageOfTotal}%)");
        }
        sb.AppendLine();

        sb.AppendLine("Top Categories:");
        sb.AppendLine("----------------------------------------");
        int pos = 1;
        foreach (var top in report.TopCategories)
        {
            sb.AppendLine($"{pos}. {top.CategoryName}: {top.TotalSpent:C} ({top.PercentageOfTotal}%)");
            pos++;
        }

        return new ReportExportResult
        {
            Content = Encoding.UTF8.GetBytes(sb.ToString()),
            ContentType = "text/plain",
            FileName = $"monthly-report-{report.Year}-{report.Month:D2}.txt"
        };
    }
}
