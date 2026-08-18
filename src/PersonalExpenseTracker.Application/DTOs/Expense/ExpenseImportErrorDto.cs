namespace PersonalExpenseTracker.Application.DTOs.Expense
{
    public class ExpenseImportErrorDto
    {
        public int RowNumber { get; set; }
        public required string Field { get; set; }
        public required string Message { get; set; }
    }
}
