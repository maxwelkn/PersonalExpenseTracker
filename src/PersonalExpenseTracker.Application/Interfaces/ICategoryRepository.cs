using PersonalExpenseTracker.Domain.Entities;
using System.Collections.Generic;

namespace PersonalExpenseTracker.Application.Interfaces;

public interface ICategoryRepository
{
    Category? GetById(int id);
    IEnumerable<Category> GetAllByUserId(int userId);
    void Add(Category category);
    void Update(Category category);
    void Delete(int id);
}
