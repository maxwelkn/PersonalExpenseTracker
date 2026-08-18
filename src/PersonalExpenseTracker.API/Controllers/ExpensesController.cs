using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalExpenseTracker.Application.DTOs.Expense;
using PersonalExpenseTracker.Application.Services;
using System.Security.Claims;

namespace PersonalExpenseTracker.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ExpensesController : ControllerBase
    {
        private readonly ExpenseService _expenseService;
        private readonly ExpenseImportService _expenseImportService;

        public ExpensesController(ExpenseService expenseService, ExpenseImportService expenseImportService)
        {
            _expenseService = expenseService;
            _expenseImportService = expenseImportService;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("El token no contiene un identificador de usuario válido.");
            }
            return userId;
        }

        [HttpPost]
        public async Task<IActionResult> CreateExpense([FromBody] CreateExpenseDto dto)
        {
            var createdExpense = await _expenseService.CreateExpenseAsync(dto, GetUserId());
            return CreatedAtAction(nameof(GetExpenseById), new { id = createdExpense.Id }, createdExpense);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllExpenses()
        {
            var expenses = await _expenseService.GetAllExpensesAsync(GetUserId());
            return Ok(expenses);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetExpenseById(int id)
        {
            var expense = await _expenseService.GetExpenseByIdAsync(id, GetUserId());

            if (expense == null)
            {
                return NotFound();
            }

            return Ok(expense);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExpense(int id, [FromBody] UpdateExpenseDto dto)
        {
            var updatedExpense = await _expenseService.UpdateExpenseAsync(id, dto, GetUserId());

            if (updatedExpense == null)
            {
                return NotFound();
            }

            return Ok(updatedExpense);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var deleted = await _expenseService.DeleteExpenseAsync(id, GetUserId());

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportExpenses(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("Debe proporcionar un archivo válido.");
            }

            var extension = System.IO.Path.GetExtension(file.FileName);
            if (!string.Equals(extension, ".xlsx", StringComparison.OrdinalIgnoreCase))
            {
                throw new ArgumentException("El archivo debe tener la extensión .xlsx.");
            }

            using var stream = file.OpenReadStream();
            var result = await _expenseImportService.ImportExpensesAsync(stream, GetUserId());

            return Ok(result);
        }
    }
}
