using PersonalExpenseTracker.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonalExpenseTracker.Application.Interfaces;

public interface IBudgetRepository
{
    Task<Budget?> GetByIdAsync(int id);
    Task<IEnumerable<Budget>> GetAllByUserIdAsync(int userId);
    Task<Budget?> GetByUserCategoryPeriodAsync(int userId, int categoryId, int year, int month);
    Task AddAsync(Budget budget);
    Task UpdateAsync(Budget budget);
    Task DeleteAsync(int id);
}
