using PersonalExpenseTracker.Application.DTOs.Category;
using PersonalExpenseTracker.Application.Interfaces;
using PersonalExpenseTracker.Domain.Entities;

namespace PersonalExpenseTracker.Application.Services
{
    public class CategoryService
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
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
    }
}
