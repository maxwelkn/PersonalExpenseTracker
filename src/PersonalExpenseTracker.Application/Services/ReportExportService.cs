using PersonalExpenseTracker.Application.DTOs.Reports;
using PersonalExpenseTracker.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;

namespace PersonalExpenseTracker.Application.Services;

public class ReportExportService
{
    private readonly IEnumerable<IReportExportStrategy> _strategies;

    public ReportExportService(IEnumerable<IReportExportStrategy> strategies)
    {
        _strategies = strategies;
    }

    public ReportExportResult Export(MonthlyReportDto report, string format)
    {
        var strategy = _strategies.FirstOrDefault(s => string.Equals(s.Format, format, StringComparison.OrdinalIgnoreCase));
        
        if (strategy == null)
        {
            throw new ArgumentException($"El formato de exportación '{format}' no está soportado.");
        }

        return strategy.Export(report);
    }
}
