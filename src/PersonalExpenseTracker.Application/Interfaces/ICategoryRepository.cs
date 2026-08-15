using PersonalExpenseTracker.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonalExpenseTracker.Application.Interfaces;

public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(int id);
    Task<IEnumerable<Category>> GetAllByUserIdAsync(int userId);
    Task AddAsync(Category category);
    Task UpdateAsync(Category category);
    Task DeleteAsync(int id);
}
