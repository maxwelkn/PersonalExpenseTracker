using PersonalExpenseTracker.Application.DTOs;
using PersonalExpenseTracker.Application.Interfaces;
using PersonalExpenseTracker.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PersonalExpenseTracker.Application.Services;

public class BudgetService
{
    private readonly IBudgetRepository _budgetRepository;
    private readonly ICategoryRepository _categoryRepository;

    public BudgetService(IBudgetRepository budgetRepository, ICategoryRepository categoryRepository)
    {
        _budgetRepository = budgetRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<BudgetResponseDto> CreateBudgetAsync(CreateBudgetDto dto, int userId)
    {
        ValidateBudgetRules(dto.Amount, dto.Month, dto.Year);
        await ValidateCategoryOwnershipAsync(dto.CategoryId, userId);

        var existing = await _budgetRepository.GetByUserCategoryPeriodAsync(userId, dto.CategoryId, dto.Year, dto.Month);
        if (existing != null)
        {
            throw new InvalidOperationException("Ya existe un presupuesto para esta categoría en el periodo indicado.");
        }

        var budget = new Budget
        {
            Amount = dto.Amount,
            Month = dto.Month,
            Year = dto.Year,
            CategoryId = dto.CategoryId,
            UserId = userId
        };

        await _budgetRepository.AddAsync(budget);

        return MapToResponse(budget);
    }

    public async Task<IEnumerable<BudgetResponseDto>> GetAllBudgetsAsync(int userId)
    {
        var budgets = await _budgetRepository.GetAllByUserIdAsync(userId);
        return budgets.Select(MapToResponse);
    }

    public async Task<BudgetResponseDto?> GetBudgetByIdAsync(int id, int userId)
    {
        var budget = await _budgetRepository.GetByIdAsync(id);
        if (budget == null || budget.UserId != userId)
        {
            return null;
        }

        return MapToResponse(budget);
    }

    public async Task<BudgetResponseDto?> UpdateBudgetAsync(int id, UpdateBudgetDto dto, int userId)
    {
        var budget = await _budgetRepository.GetByIdAsync(id);
        if (budget == null || budget.UserId != userId)
        {
            return null;
        }

        ValidateBudgetRules(dto.Amount, dto.Month, dto.Year);
        await ValidateCategoryOwnershipAsync(dto.CategoryId, userId);

        var existing = await _budgetRepository.GetByUserCategoryPeriodAsync(userId, dto.CategoryId, dto.Year, dto.Month);
        if (existing != null && existing.Id != id)
        {
            throw new InvalidOperationException("Ya existe otro presupuesto para esta categoría en el periodo indicado.");
        }

        budget.Amount = dto.Amount;
        budget.Month = dto.Month;
        budget.Year = dto.Year;
        budget.CategoryId = dto.CategoryId;

        await _budgetRepository.UpdateAsync(budget);

        return MapToResponse(budget);
    }

    public async Task<bool> DeleteBudgetAsync(int id, int userId)
    {
        var budget = await _budgetRepository.GetByIdAsync(id);
        if (budget == null || budget.UserId != userId)
        {
            return false;
        }

        await _budgetRepository.DeleteAsync(id);
        return true;
    }

    private void ValidateBudgetRules(decimal amount, int month, int year)
    {
        if (amount <= 0)
        {
            throw new ArgumentException("El monto del presupuesto debe ser mayor a cero.");
        }

        if (month < 1 || month > 12)
        {
            throw new ArgumentException("El mes debe estar entre 1 y 12.");
        }

        if (year <= 0)
        {
            throw new ArgumentException("El año debe ser mayor a cero.");
        }
    }

    private async Task ValidateCategoryOwnershipAsync(int categoryId, int userId)
    {
        var category = await _categoryRepository.GetByIdAsync(categoryId);
        if (category == null || category.UserId != userId)
        {
            throw new ArgumentException("La categoría especificada no existe o no es válida.");
        }
    }

    private BudgetResponseDto MapToResponse(Budget budget)
    {
        return new BudgetResponseDto
        {
            Id = budget.Id,
            Amount = budget.Amount,
            Month = budget.Month,
            Year = budget.Year,
            CategoryId = budget.CategoryId
        };
    }
}
