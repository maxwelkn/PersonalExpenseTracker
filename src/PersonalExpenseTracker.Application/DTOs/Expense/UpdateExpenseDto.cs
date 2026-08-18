using System;

namespace PersonalExpenseTracker.Application.DTOs.Expense
{
    public class UpdateExpenseDto
    {
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string? Description { get; set; }
        public int CategoryId { get; set; }
        public int PaymentMethodId { get; set; }
    }
}
