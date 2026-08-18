using System.Collections.Generic;

namespace PersonalExpenseTracker.Application.DTOs.Expense
{
    public class ExpenseImportResultDto
    {
        public int TotalRows { get; set; }
        public int ImportedRows { get; set; }
        public int FailedRows { get; set; }
        public IEnumerable<ExpenseImportErrorDto> Errors { get; set; } = new List<ExpenseImportErrorDto>();
    }
}
