using PersonalExpenseTracker.Application.DTOs.Expense;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace PersonalExpenseTracker.Application.Interfaces
{
    public interface IExpenseExcelReader
    {
        Task<IEnumerable<ExpenseImportRowDto>> ReadExpensesAsync(Stream fileStream);
    }
}
