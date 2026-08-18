using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalExpenseTracker.Application.Services;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PersonalExpenseTracker.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ReportService _reportService;
    private readonly ReportExportService _reportExportService;

    public ReportsController(ReportService reportService, ReportExportService reportExportService)
    {
        _reportService = reportService;
        _reportExportService = reportExportService;
    }

    private int GetUserId()
    {
        return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [HttpGet("monthly")]
    public async Task<IActionResult> GetMonthlyReport([FromQuery] int month, [FromQuery] int year, [FromQuery] int top = 3)
    {
        var report = await _reportService.GetMonthlyReportAsync(GetUserId(), month, year, top);
        return Ok(report);
    }

    [HttpGet("monthly/export")]
    public async Task<IActionResult> ExportMonthlyReport([FromQuery] int month, [FromQuery] int year, [FromQuery] string format, [FromQuery] int top = 3)
    {
        if (string.IsNullOrWhiteSpace(format))
        {
            return BadRequest(new { Message = "Format is required" });
        }

        var report = await _reportService.GetMonthlyReportAsync(GetUserId(), month, year, top);
        
        try
        {
            var exportResult = _reportExportService.Export(report, format);
            return File(exportResult.Content, exportResult.ContentType, exportResult.FileName);
        }
        catch (System.ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}
