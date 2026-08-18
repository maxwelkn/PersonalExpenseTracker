using PersonalExpenseTracker.Application.DTOs.Reports;

namespace PersonalExpenseTracker.Application.Interfaces;

public interface IReportExportStrategy
{
    string Format { get; }
    ReportExportResult Export(MonthlyReportDto report);
}
