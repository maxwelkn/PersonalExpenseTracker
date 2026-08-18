using PersonalExpenseTracker.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PersonalExpenseTracker.Application.Interfaces;

public interface IExpenseRepository
{
    Task<Expense?> GetByIdAsync(int id);
    Task<IEnumerable<Expense>> GetAllByUserIdAsync(int userId);
    Task AddAsync(Expense expense);
    Task UpdateAsync(Expense expense);
    Task DeleteAsync(int id);
}
