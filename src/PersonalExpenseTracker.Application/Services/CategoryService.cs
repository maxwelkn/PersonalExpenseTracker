using PersonalExpenseTracker.Application.DTOs.Category;
using PersonalExpenseTracker.Application.Interfaces;
using PersonalExpenseTracker.Domain.Entities;

namespace PersonalExpenseTracker.Application.Services
{
    public class CategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IExpenseRepository _expenseRepository;
        private readonly IBudgetRepository _budgetRepository;

        public CategoryService(ICategoryRepository categoryRepository, IExpenseRepository expenseRepository, IBudgetRepository budgetRepository)
        {
            _categoryRepository = categoryRepository;
            _expenseRepository = expenseRepository;
            _budgetRepository = budgetRepository;
        }

        public async Task<CategoryResponseDto> CreateCategoryAsync(CreateCategoryDto dto, int userId)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ArgumentException("El nombre de la categoría no puede estar vacío.", nameof(dto.Name));
            }

            string normalizedName = dto.Name.Trim();

            var existingCategories = await _categoryRepository.GetAllByUserIdAsync(userId);
            if (existingCategories.Any(c => c.Name.Equals(normalizedName, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException($"El usuario ya tiene una categoría con el nombre '{normalizedName}'.");
            }

            var category = new Category
            {
                Name = normalizedName,
                UserId = userId,
                IsActive = true
            };

            await _categoryRepository.AddAsync(category);

            return new CategoryResponseDto
            {
                Id = category.Id,
                Name = category.Name,
                IsActive = category.IsActive
            };
        }

        public async Task<IEnumerable<CategoryResponseDto>> GetAllCategoriesAsync(int userId)
        {
            var categories = await _categoryRepository.GetAllByUserIdAsync(userId);
            
            return categories.Select(c => new CategoryResponseDto
            {
                Id = c.Id,
                Name = c.Name,
                IsActive = c.IsActive
            });
        }

        public async Task<CategoryResponseDto?> GetCategoryByIdAsync(int id, int userId)
        {
            var category = await _categoryRepository.GetByIdAsync(id);

            if (category == null || category.UserId != userId)
            {
                return null;
            }

            return new CategoryResponseDto
            {
                Id = category.Id,
                Name = category.Name,
                IsActive = category.IsActive
            };
        }

        public async Task<CategoryResponseDto?> UpdateCategoryAsync(int id, UpdateCategoryDto dto, int userId)
        {
            var category = await _categoryRepository.GetByIdAsync(id);

            if (category == null || category.UserId != userId)
            {
                return null;
            }

            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ArgumentException("El nombre de la categoría no puede estar vacío.", nameof(dto.Name));
            }

            string normalizedName = dto.Name.Trim();

            var existingCategories = await _categoryRepository.GetAllByUserIdAsync(userId);
            if (existingCategories.Any(c => c.Id != id && c.Name.Equals(normalizedName, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException($"El usuario ya tiene otra categoría con el nombre '{normalizedName}'.");
            }

            category.Name = normalizedName;
            category.IsActive = dto.IsActive;

            await _categoryRepository.UpdateAsync(category);

            return new CategoryResponseDto
            {
                Id = category.Id,
                Name = category.Name,
                IsActive = category.IsActive
            };
        }

        public async Task<bool> DeleteCategoryAsync(int id, int userId)
        {
            var category = await _categoryRepository.GetByIdAsync(id);

            if (category == null || category.UserId != userId)
            {
                return false;
            }

            if (await _expenseRepository.HasExpensesByCategoryIdAsync(id))
            {
                throw new InvalidOperationException("La categoría no puede eliminarse mientras tenga gastos asociados.");
            }

            if (await _budgetRepository.HasBudgetsByCategoryIdAsync(id))
            {
                throw new InvalidOperationException("La categoría no puede eliminarse mientras tenga presupuestos asociados.");
            }

            await _categoryRepository.DeleteAsync(id);
            return true;
        }
    }
}
