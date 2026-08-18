using PersonalExpenseTracker.Application.DTOs.Reports;
using PersonalExpenseTracker.Application.Interfaces;
using System.Text.Json;
using System.Text;

namespace PersonalExpenseTracker.Infrastructure.Services;

public class JsonReportExportStrategy : IReportExportStrategy
{
    public string Format => "json";

    public ReportExportResult Export(MonthlyReportDto report)
    {
        var options = new JsonSerializerOptions { WriteIndented = true };
        var jsonString = JsonSerializer.Serialize(report, options);
        var bytes = Encoding.UTF8.GetBytes(jsonString);

        return new ReportExportResult
        {
            Content = bytes,
            ContentType = "application/json",
            FileName = $"monthly-report-{report.Year}-{report.Month:D2}.json"
        };
    }
}
