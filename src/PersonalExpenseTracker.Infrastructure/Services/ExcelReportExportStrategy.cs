using ClosedXML.Excel;
using PersonalExpenseTracker.Application.DTOs.Reports;
using PersonalExpenseTracker.Application.Interfaces;
using System.IO;

namespace PersonalExpenseTracker.Infrastructure.Services;

public class ExcelReportExportStrategy : IReportExportStrategy
{
    public string Format => "excel";

    public ReportExportResult Export(MonthlyReportDto report)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Monthly Report");

        // Resumen
        worksheet.Cell(1, 1).Value = "Monthly Report Summary";
        worksheet.Cell(1, 1).Style.Font.Bold = true;

        worksheet.Cell(3, 1).Value = "Month";
        worksheet.Cell(3, 2).Value = report.Month;

        worksheet.Cell(4, 1).Value = "Year";
        worksheet.Cell(4, 2).Value = report.Year;

        worksheet.Cell(5, 1).Value = "Total Spent";
        worksheet.Cell(5, 2).Value = report.TotalSpent;
        worksheet.Cell(5, 2).Style.NumberFormat.Format = "$ #,##0.00";

        worksheet.Cell(6, 1).Value = "Previous Month Total";
        worksheet.Cell(6, 2).Value = report.PreviousMonthTotal;
        worksheet.Cell(6, 2).Style.NumberFormat.Format = "$ #,##0.00";

        worksheet.Cell(7, 1).Value = "Difference";
        worksheet.Cell(7, 2).Value = report.DifferenceFromPreviousMonth;
        worksheet.Cell(7, 2).Style.NumberFormat.Format = "$ #,##0.00";

        // Category Breakdown
        worksheet.Cell(10, 1).Value = "Category Breakdown";
        worksheet.Cell(10, 1).Style.Font.Bold = true;

        worksheet.Cell(11, 1).Value = "Category";
        worksheet.Cell(11, 2).Value = "Total";
        worksheet.Cell(11, 3).Value = "Percentage";
        worksheet.Range(11, 1, 11, 3).Style.Font.Bold = true;

        int row = 12;
        foreach (var cat in report.Categories)
        {
            worksheet.Cell(row, 1).Value = cat.CategoryName;
            worksheet.Cell(row, 2).Value = cat.TotalSpent;
            worksheet.Cell(row, 2).Style.NumberFormat.Format = "$ #,##0.00";
            worksheet.Cell(row, 3).Value = cat.PercentageOfTotal / 100m;
            worksheet.Cell(row, 3).Style.NumberFormat.Format = "0.00%";
            row++;
        }

        // Top Categories
        row += 2;
        worksheet.Cell(row, 1).Value = "Top Categories";
        worksheet.Cell(row, 1).Style.Font.Bold = true;
        row++;

        worksheet.Cell(row, 1).Value = "Position";
        worksheet.Cell(row, 2).Value = "Category";
        worksheet.Cell(row, 3).Value = "Total";
        worksheet.Cell(row, 4).Value = "Percentage";
        worksheet.Range(row, 1, row, 4).Style.Font.Bold = true;
        row++;

        int pos = 1;
        foreach (var top in report.TopCategories)
        {
            worksheet.Cell(row, 1).Value = pos;
            worksheet.Cell(row, 2).Value = top.CategoryName;
            worksheet.Cell(row, 3).Value = top.TotalSpent;
            worksheet.Cell(row, 3).Style.NumberFormat.Format = "$ #,##0.00";
            worksheet.Cell(row, 4).Value = top.PercentageOfTotal / 100m;
            worksheet.Cell(row, 4).Style.NumberFormat.Format = "0.00%";
            row++;
            pos++;
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        return new ReportExportResult
        {
            Content = stream.ToArray(),
            ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            FileName = $"monthly-report-{report.Year}-{report.Month:D2}.xlsx"
        };
    }
}
