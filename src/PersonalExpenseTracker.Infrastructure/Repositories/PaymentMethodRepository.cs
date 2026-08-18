using Microsoft.EntityFrameworkCore;
using PersonalExpenseTracker.Application.Interfaces;
using PersonalExpenseTracker.Domain.Entities;
using PersonalExpenseTracker.Infrastructure.Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PersonalExpenseTracker.Infrastructure.Repositories;

public class PaymentMethodRepository : IPaymentMethodRepository
{
    private readonly AppDbContext _context;

    public PaymentMethodRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PaymentMethod?> GetByIdAsync(int id)
    {
        return await _context.PaymentMethods.FindAsync(id);
    }

    public async Task<IEnumerable<PaymentMethod>> GetAllByUserIdAsync(int userId)
    {
        return await _context.PaymentMethods
            .Where(p => p.UserId == userId)
            .ToListAsync();
    }

    public async Task AddAsync(PaymentMethod paymentMethod)
    {
        _context.PaymentMethods.Add(paymentMethod);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(PaymentMethod paymentMethod)
    {
        _context.PaymentMethods.Update(paymentMethod);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var paymentMethod = await _context.PaymentMethods.FindAsync(id);
        if (paymentMethod != null)
        {
            _context.PaymentMethods.Remove(paymentMethod);
            await _context.SaveChangesAsync();
        }
    }
}
