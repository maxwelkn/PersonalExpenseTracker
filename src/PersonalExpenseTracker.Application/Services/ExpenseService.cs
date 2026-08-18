using PersonalExpenseTracker.Application.DTOs.Expense;
using PersonalExpenseTracker.Application.Interfaces;
using PersonalExpenseTracker.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PersonalExpenseTracker.Application.Services
{
    public class ExpenseService
    {
        private readonly IExpenseRepository _expenseRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IPaymentMethodRepository _paymentMethodRepository;

        public ExpenseService(
            IExpenseRepository expenseRepository,
            ICategoryRepository categoryRepository,
            IPaymentMethodRepository paymentMethodRepository)
        {
            _expenseRepository = expenseRepository;
            _categoryRepository = categoryRepository;
            _paymentMethodRepository = paymentMethodRepository;
        }

        private async Task ValidateDependenciesAsync(int categoryId, int paymentMethodId, int userId)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);
            if (category == null || category.UserId != userId)
            {
                throw new ArgumentException("La categoría seleccionada no es válida o no pertenece al usuario.", nameof(categoryId));
            }

            var paymentMethod = await _paymentMethodRepository.GetByIdAsync(paymentMethodId);
            if (paymentMethod == null || paymentMethod.UserId != userId)
            {
                throw new ArgumentException("El método de pago seleccionado no es válido o no pertenece al usuario.", nameof(paymentMethodId));
            }
        }

        public async Task<ExpenseResponseDto> CreateExpenseAsync(CreateExpenseDto dto, int userId)
        {
            if (dto.Amount <= 0)
            {
                throw new ArgumentException("El monto debe ser mayor que cero.", nameof(dto.Amount));
            }

            if (dto.Date == default)
            {
                throw new ArgumentException("La fecha es inválida o no ha sido proporcionada.", nameof(dto.Date));
            }

            await ValidateDependenciesAsync(dto.CategoryId, dto.PaymentMethodId, userId);

            var expense = new Expense
            {
                Amount = dto.Amount,
                Date = dto.Date,
                Description = dto.Description,
                CategoryId = dto.CategoryId,
                PaymentMethodId = dto.PaymentMethodId,
                UserId = userId
            };

            await _expenseRepository.AddAsync(expense);

            return new ExpenseResponseDto
            {
                Id = expense.Id,
                Amount = expense.Amount,
                Date = expense.Date,
                Description = expense.Description,
                CategoryId = expense.CategoryId,
                PaymentMethodId = expense.PaymentMethodId
            };
        }

        public async Task<IEnumerable<ExpenseResponseDto>> GetAllExpensesAsync(int userId)
        {
            var expenses = await _expenseRepository.GetAllByUserIdAsync(userId);
            
            return expenses.Select(e => new ExpenseResponseDto
            {
                Id = e.Id,
                Amount = e.Amount,
                Date = e.Date,
                Description = e.Description,
                CategoryId = e.CategoryId,
                PaymentMethodId = e.PaymentMethodId
            });
        }

        public async Task<ExpenseResponseDto?> GetExpenseByIdAsync(int id, int userId)
        {
            var expense = await _expenseRepository.GetByIdAsync(id);

            if (expense == null || expense.UserId != userId)
            {
                return null;
            }

            return new ExpenseResponseDto
            {
                Id = expense.Id,
                Amount = expense.Amount,
                Date = expense.Date,
                Description = expense.Description,
                CategoryId = expense.CategoryId,
                PaymentMethodId = expense.PaymentMethodId
            };
        }

        public async Task<ExpenseResponseDto?> UpdateExpenseAsync(int id, UpdateExpenseDto dto, int userId)
        {
            var expense = await _expenseRepository.GetByIdAsync(id);

            if (expense == null || expense.UserId != userId)
            {
                return null;
            }

            if (dto.Amount <= 0)
            {
                throw new ArgumentException("El monto debe ser mayor que cero.", nameof(dto.Amount));
            }

            if (dto.Date == default)
            {
                throw new ArgumentException("La fecha es inválida o no ha sido proporcionada.", nameof(dto.Date));
            }

            await ValidateDependenciesAsync(dto.CategoryId, dto.PaymentMethodId, userId);

            expense.Amount = dto.Amount;
            expense.Date = dto.Date;
            expense.Description = dto.Description;
            expense.CategoryId = dto.CategoryId;
            expense.PaymentMethodId = dto.PaymentMethodId;

            await _expenseRepository.UpdateAsync(expense);

            return new ExpenseResponseDto
            {
                Id = expense.Id,
                Amount = expense.Amount,
                Date = expense.Date,
                Description = expense.Description,
                CategoryId = expense.CategoryId,
                PaymentMethodId = expense.PaymentMethodId
            };
        }
    }
}
