namespace PersonalExpenseTracker.Domain.Entities;

public class Expense
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string? Description { get; set; }
    
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    
    public int PaymentMethodId { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = null!;
}
