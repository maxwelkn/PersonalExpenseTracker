namespace PersonalExpenseTracker.Domain.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
