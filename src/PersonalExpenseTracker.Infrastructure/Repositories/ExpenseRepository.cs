using Microsoft.EntityFrameworkCore;
using PersonalExpenseTracker.Application.Interfaces;
using PersonalExpenseTracker.Domain.Entities;
using PersonalExpenseTracker.Infrastructure.Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PersonalExpenseTracker.Infrastructure.Repositories;

public class ExpenseRepository : IExpenseRepository
{
    private readonly AppDbContext _context;

    public ExpenseRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Expense?> GetByIdAsync(int id)
    {
        return await _context.Expenses.FindAsync(id);
    }

    public async Task<IEnumerable<Expense>> GetAllByUserIdAsync(int userId)
    {
        return await _context.Expenses
            .Where(e => e.UserId == userId)
            .ToListAsync();
    }

    public async Task AddAsync(Expense expense)
    {
        await _context.Expenses.AddAsync(expense);
        await _context.SaveChangesAsync();
    }

    public async Task AddRangeAsync(IEnumerable<Expense> expenses)
    {
        await _context.Expenses.AddRangeAsync(expenses);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Expense expense)
    {
        _context.Expenses.Update(expense);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var expense = await _context.Expenses.FindAsync(id);
        if (expense != null)
        {
            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> HasExpensesByCategoryIdAsync(int categoryId)
    {
        return await _context.Expenses.AnyAsync(e => e.CategoryId == categoryId);
    }

    public async Task<bool> HasExpensesByPaymentMethodIdAsync(int paymentMethodId)
    {
        return await _context.Expenses.AnyAsync(e => e.PaymentMethodId == paymentMethodId);
    }
}
