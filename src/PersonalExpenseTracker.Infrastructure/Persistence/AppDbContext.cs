using Microsoft.EntityFrameworkCore;
using PersonalExpenseTracker.Domain.Entities;

namespace PersonalExpenseTracker.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories { get; set; }
}
