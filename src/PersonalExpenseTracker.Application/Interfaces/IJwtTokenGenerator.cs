using PersonalExpenseTracker.Domain.Entities;

namespace PersonalExpenseTracker.Application.Interfaces
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user);
    }
}
