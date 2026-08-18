namespace PersonalExpenseTracker.Application.DTOs.Expense
{
    public class ExpenseImportRowDto
    {
        public int RowNumber { get; set; }
        public required string Amount { get; set; }
        public required string Date { get; set; }
        public required string Category { get; set; }
        public required string PaymentMethod { get; set; }
        public string? Description { get; set; }
    }
}
