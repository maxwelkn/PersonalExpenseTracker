using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using PersonalExpenseTracker.Application.DTOs.Expense;
using PersonalExpenseTracker.Application.Interfaces;
using PersonalExpenseTracker.Domain.Entities;

namespace PersonalExpenseTracker.Application.Services
{
    public class ExpenseImportService
    {
        private readonly IExpenseExcelReader _excelReader;
        private readonly IExpenseRepository _expenseRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IPaymentMethodRepository _paymentMethodRepository;

        public ExpenseImportService(
            IExpenseExcelReader excelReader,
            IExpenseRepository expenseRepository,
            ICategoryRepository categoryRepository,
            IPaymentMethodRepository paymentMethodRepository)
        {
            _excelReader = excelReader;
            _expenseRepository = expenseRepository;
            _categoryRepository = categoryRepository;
            _paymentMethodRepository = paymentMethodRepository;
        }

        public async Task<ExpenseImportResultDto> ImportExpensesAsync(Stream fileStream, int userId)
        {
            var result = new ExpenseImportResultDto();
            var errors = new List<ExpenseImportErrorDto>();
            var validExpensesToInsert = new List<Expense>();
            
            var rows = _excelReader.ReadExpenses(fileStream).ToList();
            result.TotalRows = rows.Count;
            
            if (!rows.Any()) return result;

            var userCategories = await _categoryRepository.GetAllByUserIdAsync(userId);
            var userPaymentMethods = await _paymentMethodRepository.GetAllByUserIdAsync(userId);
            
            var categoryMap = userCategories.ToDictionary(c => c.Name, c => c.Id, StringComparer.OrdinalIgnoreCase);
            var paymentMap = userPaymentMethods.ToDictionary(p => p.Name, p => p.Id, StringComparer.OrdinalIgnoreCase);
            
            var failedRowNumbers = new HashSet<int>();

            foreach (var row in rows)
            {
                bool rowHasError = false;
                
                decimal parsedAmount = 0;
                DateTime parsedDate = default;
                int categoryId = 0;
                int paymentMethodId = 0;

                // Validate Amount
                if (string.IsNullOrWhiteSpace(row.Amount))
                {
                    errors.Add(new ExpenseImportErrorDto { RowNumber = row.RowNumber, Field = "Amount", Message = "El monto es requerido." });
                    rowHasError = true;
                }
                else if (!decimal.TryParse(row.Amount, NumberStyles.AllowDecimalPoint | NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out parsedAmount) || parsedAmount <= 0)
                {
                    errors.Add(new ExpenseImportErrorDto { RowNumber = row.RowNumber, Field = "Amount", Message = "El monto debe ser un número válido mayor a 0." });
                    rowHasError = true;
                }

                // Validate Date
                if (string.IsNullOrWhiteSpace(row.Date))
                {
                    errors.Add(new ExpenseImportErrorDto { RowNumber = row.RowNumber, Field = "Date", Message = "La fecha es requerida." });
                    rowHasError = true;
                }
                else
                {
                    string[] formats = { "yyyy-MM-dd", "yyyy-MM-dd HH:mm:ss" };
                    if (!DateTime.TryParseExact(row.Date, formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out parsedDate))
                    {
                        errors.Add(new ExpenseImportErrorDto { RowNumber = row.RowNumber, Field = "Date", Message = "El formato de la fecha debe ser yyyy-MM-dd o yyyy-MM-dd HH:mm:ss." });
                        rowHasError = true;
                    }
                }

                // Validate Category
                if (string.IsNullOrWhiteSpace(row.Category))
                {
                    errors.Add(new ExpenseImportErrorDto { RowNumber = row.RowNumber, Field = "Category", Message = "La categoría es requerida." });
                    rowHasError = true;
                }
                else
                {
                    if (categoryMap.TryGetValue(row.Category.Trim(), out var cId))
                    {
                        categoryId = cId;
                    }
                    else
                    {
                        errors.Add(new ExpenseImportErrorDto { RowNumber = row.RowNumber, Field = "Category", Message = "La categoría no fue encontrada o no pertenece al usuario." });
                        rowHasError = true;
                    }
                }

                // Validate PaymentMethod
                if (string.IsNullOrWhiteSpace(row.PaymentMethod))
                {
                    errors.Add(new ExpenseImportErrorDto { RowNumber = row.RowNumber, Field = "PaymentMethod", Message = "El método de pago es requerido." });
                    rowHasError = true;
                }
                else
                {
                    if (paymentMap.TryGetValue(row.PaymentMethod.Trim(), out var pmId))
                    {
                        paymentMethodId = pmId;
                    }
                    else
                    {
                        errors.Add(new ExpenseImportErrorDto { RowNumber = row.RowNumber, Field = "PaymentMethod", Message = "El método de pago no fue encontrado o no pertenece al usuario." });
                        rowHasError = true;
                    }
                }

                if (rowHasError)
                {
                    failedRowNumbers.Add(row.RowNumber);
                }
                else
                {
                    validExpensesToInsert.Add(new Expense
                    {
                        Amount = parsedAmount,
                        Date = parsedDate,
                        CategoryId = categoryId,
                        PaymentMethodId = paymentMethodId,
                        Description = row.Description,
                        UserId = userId
                    });
                }
            }

            if (validExpensesToInsert.Any())
            {
                await _expenseRepository.AddRangeAsync(validExpensesToInsert);
            }

            result.ImportedRows = validExpensesToInsert.Count;
            result.FailedRows = failedRowNumbers.Count;
            result.Errors = errors;

            return result;
        }
    }
}
