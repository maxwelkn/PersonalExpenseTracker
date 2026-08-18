using PersonalExpenseTracker.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;
using PersonalExpenseTracker.Application.DTOs.Expense;

namespace PersonalExpenseTracker.Application.Interfaces;

public interface IExpenseRepository
{
    Task<Expense?> GetByIdAsync(int id);
    Task<IEnumerable<Expense>> GetAllByUserIdAsync(int userId);
    Task AddAsync(Expense expense);
    Task AddRangeAsync(IEnumerable<Expense> expenses);
    Task UpdateAsync(Expense expense);
    Task DeleteAsync(int id);
    Task<bool> HasExpensesByCategoryIdAsync(int categoryId);
    Task<bool> HasExpensesByPaymentMethodIdAsync(int paymentMethodId);
    Task<decimal> GetTotalByUserCategoryPeriodAsync(int userId, int categoryId, int year, int month);
    Task<IEnumerable<CategoryExpenseTotalDto>> GetTotalsByUserPeriodGroupedByCategoryAsync(int userId, int year, int month);
}
