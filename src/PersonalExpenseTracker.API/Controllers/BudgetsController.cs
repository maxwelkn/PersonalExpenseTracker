using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using PersonalExpenseTracker.Application.DTOs.Budget;
using PersonalExpenseTracker.Application.Services;
using System;
using System.Threading.Tasks;

namespace PersonalExpenseTracker.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BudgetsController : ControllerBase
    {
        private readonly BudgetService _budgetService;

        public BudgetsController(BudgetService budgetService)
        {
            _budgetService = budgetService;
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
        public async Task<IActionResult> CreateBudget([FromBody] CreateBudgetDto dto)
        {
            var createdBudget = await _budgetService.CreateBudgetAsync(dto, GetUserId());
            return CreatedAtAction(nameof(GetBudgetById), new { id = createdBudget.Id }, createdBudget);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllBudgets()
        {
            var budgets = await _budgetService.GetAllBudgetsAsync(GetUserId());
            return Ok(budgets);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBudgetById(int id)
        {
            var budget = await _budgetService.GetBudgetByIdAsync(id, GetUserId());

            if (budget == null)
            {
                return NotFound();
            }

            return Ok(budget);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBudget(int id, [FromBody] UpdateBudgetDto dto)
        {
            var updatedBudget = await _budgetService.UpdateBudgetAsync(id, dto, GetUserId());

            if (updatedBudget == null)
            {
                return NotFound();
            }

            return Ok(updatedBudget);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBudget(int id)
        {
            var deleted = await _budgetService.DeleteBudgetAsync(id, GetUserId());

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
