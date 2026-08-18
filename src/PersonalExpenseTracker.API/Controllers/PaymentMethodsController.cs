using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalExpenseTracker.Application.DTOs.PaymentMethod;
using PersonalExpenseTracker.Application.Services;
using System.Security.Claims;

namespace PersonalExpenseTracker.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentMethodsController : ControllerBase
    {
        private readonly PaymentMethodService _paymentMethodService;

        public PaymentMethodsController(PaymentMethodService paymentMethodService)
        {
            _paymentMethodService = paymentMethodService;
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
        public async Task<IActionResult> CreatePaymentMethod([FromBody] CreatePaymentMethodDto dto)
        {
            var createdPaymentMethod = await _paymentMethodService.CreatePaymentMethodAsync(dto, GetUserId());
            return CreatedAtAction(nameof(GetPaymentMethodById), new { id = createdPaymentMethod.Id }, createdPaymentMethod);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPaymentMethods()
        {
            var paymentMethods = await _paymentMethodService.GetAllPaymentMethodsAsync(GetUserId());
            return Ok(paymentMethods);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPaymentMethodById(int id)
        {
            var paymentMethod = await _paymentMethodService.GetPaymentMethodByIdAsync(id, GetUserId());

            if (paymentMethod == null)
            {
                return NotFound();
            }

            return Ok(paymentMethod);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePaymentMethod(int id, [FromBody] UpdatePaymentMethodDto dto)
        {
            var updatedPaymentMethod = await _paymentMethodService.UpdatePaymentMethodAsync(id, dto, GetUserId());

            if (updatedPaymentMethod == null)
            {
                return NotFound();
            }

            return Ok(updatedPaymentMethod);
        }
    }
}
