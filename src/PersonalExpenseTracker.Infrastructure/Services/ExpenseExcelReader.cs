using ClosedXML.Excel;
using PersonalExpenseTracker.Application.DTOs.Expense;
using PersonalExpenseTracker.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace PersonalExpenseTracker.Infrastructure.Services
{
    public class ExpenseExcelReader : IExpenseExcelReader
    {
        public IEnumerable<ExpenseImportRowDto> ReadExpenses(Stream fileStream)
        {
            XLWorkbook workbook;
            try
            {
                workbook = new XLWorkbook(fileStream);
            }
            catch (Exception ex)
            {
                throw new FormatException("No se pudo leer el archivo Excel. Asegúrese de que el formato sea un .xlsx válido.", ex);
            }

            using (workbook)
            {
                var worksheet = workbook.Worksheets.FirstOrDefault();

                if (worksheet == null)
                {
                    throw new FormatException("El archivo Excel no contiene ninguna hoja válida.");
                }

                var firstRow = worksheet.FirstRowUsed();
                if (firstRow == null)
                {
                    throw new FormatException("El archivo Excel está completamente vacío o no contiene encabezados.");
                }

                var headerMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

                foreach (var cell in firstRow.CellsUsed())
                {
                    var headerText = cell.GetString().Trim();
                    if (string.IsNullOrWhiteSpace(headerText)) continue;

                    if (headerMap.ContainsKey(headerText))
                    {
                        throw new FormatException($"El archivo Excel contiene un encabezado duplicado: '{headerText}'.");
                    }
                    headerMap[headerText] = cell.Address.ColumnNumber;
                }

                string[] requiredHeaders = { "Amount", "Date", "Category", "PaymentMethod", "Description" };

                foreach (var requiredHeader in requiredHeaders)
                {
                    if (!headerMap.ContainsKey(requiredHeader))
                    {
                        throw new FormatException($"Falta la columna obligatoria: '{requiredHeader}'.");
                    }
                }

                var rows = worksheet.RowsUsed().Skip(1);
                var result = new List<ExpenseImportRowDto>();

                foreach (var row in rows)
                {
                    var amountCell = row.Cell(headerMap["Amount"]);
                    var dateCell = row.Cell(headerMap["Date"]);

                    string amountVal = string.Empty;
                    if (amountCell.DataType == XLDataType.Number)
                    {
                        amountVal = amountCell.GetDouble().ToString(System.Globalization.CultureInfo.InvariantCulture);
                    }
                    else
                    {
                        amountVal = amountCell.GetString().Trim();
                    }

                    string dateVal = string.Empty;
                    if (dateCell.DataType == XLDataType.DateTime)
                    {
                        dateVal = dateCell.GetDateTime().ToString("yyyy-MM-dd HH:mm:ss", System.Globalization.CultureInfo.InvariantCulture);
                    }
                    else
                    {
                        dateVal = dateCell.GetString().Trim();
                    }

                    var categoryVal = row.Cell(headerMap["Category"]).GetString().Trim();
                    var paymentMethodVal = row.Cell(headerMap["PaymentMethod"]).GetString().Trim();
                    var descVal = row.Cell(headerMap["Description"]).GetString().Trim();

                    if (string.IsNullOrEmpty(amountVal) && string.IsNullOrEmpty(dateVal) &&
                        string.IsNullOrEmpty(categoryVal) && string.IsNullOrEmpty(paymentMethodVal) &&
                        string.IsNullOrEmpty(descVal))
                    {
                        continue; 
                    }

                    result.Add(new ExpenseImportRowDto
                    {
                        RowNumber = row.RowNumber(),
                        Amount = amountVal,
                        Date = dateVal,
                        Category = categoryVal,
                        PaymentMethod = paymentMethodVal,
                        Description = string.IsNullOrEmpty(descVal) ? null : descVal
                    });
                }
                
                return result;
            }
        }
    }
}
