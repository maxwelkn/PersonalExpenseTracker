namespace PersonalExpenseTracker.Application.DTOs.Reports;

public class ReportExportResult
{
    public byte[] Content { get; set; } = [];
    public string ContentType { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}
