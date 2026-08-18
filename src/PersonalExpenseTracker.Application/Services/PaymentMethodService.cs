using PersonalExpenseTracker.Application.DTOs.PaymentMethod;
using PersonalExpenseTracker.Application.Interfaces;
using PersonalExpenseTracker.Domain.Entities;

namespace PersonalExpenseTracker.Application.Services
{
    public class PaymentMethodService
    {
        private readonly IPaymentMethodRepository _paymentMethodRepository;
        private readonly IExpenseRepository _expenseRepository;

        public PaymentMethodService(IPaymentMethodRepository paymentMethodRepository, IExpenseRepository expenseRepository)
        {
            _paymentMethodRepository = paymentMethodRepository;
            _expenseRepository = expenseRepository;
        }

        public async Task<PaymentMethodResponseDto> CreatePaymentMethodAsync(CreatePaymentMethodDto dto, int userId)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ArgumentException("El nombre del método de pago no puede estar vacío.", nameof(dto.Name));
            }

            string normalizedName = dto.Name.Trim();

            var existingPaymentMethods = await _paymentMethodRepository.GetAllByUserIdAsync(userId);
            if (existingPaymentMethods.Any(p => p.Name.Equals(normalizedName, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException($"El usuario ya tiene un método de pago con el nombre '{normalizedName}'.");
            }

            var paymentMethod = new PaymentMethod
            {
                Name = normalizedName,
                UserId = userId
            };

            await _paymentMethodRepository.AddAsync(paymentMethod);

            return new PaymentMethodResponseDto
            {
                Id = paymentMethod.Id,
                Name = paymentMethod.Name
            };
        }

        public async Task<IEnumerable<PaymentMethodResponseDto>> GetAllPaymentMethodsAsync(int userId)
        {
            var paymentMethods = await _paymentMethodRepository.GetAllByUserIdAsync(userId);
            
            return paymentMethods.Select(p => new PaymentMethodResponseDto
            {
                Id = p.Id,
                Name = p.Name
            });
        }

        public async Task<PaymentMethodResponseDto?> GetPaymentMethodByIdAsync(int id, int userId)
        {
            var paymentMethod = await _paymentMethodRepository.GetByIdAsync(id);

            if (paymentMethod == null || paymentMethod.UserId != userId)
            {
                return null;
            }

            return new PaymentMethodResponseDto
            {
                Id = paymentMethod.Id,
                Name = paymentMethod.Name
            };
        }

        public async Task<PaymentMethodResponseDto?> UpdatePaymentMethodAsync(int id, UpdatePaymentMethodDto dto, int userId)
        {
            var paymentMethod = await _paymentMethodRepository.GetByIdAsync(id);

            if (paymentMethod == null || paymentMethod.UserId != userId)
            {
                return null;
            }

            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ArgumentException("El nombre del método de pago no puede estar vacío.", nameof(dto.Name));
            }

            string normalizedName = dto.Name.Trim();

            var existingPaymentMethods = await _paymentMethodRepository.GetAllByUserIdAsync(userId);
            if (existingPaymentMethods.Any(p => p.Id != id && p.Name.Equals(normalizedName, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException($"El usuario ya tiene otro método de pago con el nombre '{normalizedName}'.");
            }

            paymentMethod.Name = normalizedName;

            await _paymentMethodRepository.UpdateAsync(paymentMethod);

            return new PaymentMethodResponseDto
            {
                Id = paymentMethod.Id,
                Name = paymentMethod.Name
            };
        }

        public async Task<bool> DeletePaymentMethodAsync(int id, int userId)
        {
            var paymentMethod = await _paymentMethodRepository.GetByIdAsync(id);

            if (paymentMethod == null || paymentMethod.UserId != userId)
            {
                return false;
            }

            if (await _expenseRepository.HasExpensesByPaymentMethodIdAsync(id))
            {
                throw new InvalidOperationException("El método de pago no puede eliminarse mientras tenga gastos asociados.");
            }

            await _paymentMethodRepository.DeleteAsync(id);
            return true;
        }
    }
}
