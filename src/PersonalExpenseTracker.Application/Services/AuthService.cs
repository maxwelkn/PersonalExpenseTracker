using Microsoft.AspNetCore.Identity;
using PersonalExpenseTracker.Application.DTOs.Auth;
using PersonalExpenseTracker.Application.Interfaces;
using PersonalExpenseTracker.Domain.Entities;

namespace PersonalExpenseTracker.Application.Services
{
    public class AuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AuthService(IUserRepository userRepository, IPasswordHasher<User> passwordHasher)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task<UserResponseDto> RegisterAsync(RegisterUserDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ArgumentException("El nombre del usuario no puede estar vacío.", nameof(dto.Name));

            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new ArgumentException("El email del usuario no puede estar vacío.", nameof(dto.Email));

            if (string.IsNullOrWhiteSpace(dto.Password))
                throw new ArgumentException("La contraseña no puede estar vacía.", nameof(dto.Password));

            var normalizedName = dto.Name.Trim();
            var normalizedEmail = dto.Email.Trim();

            var existingUser = await _userRepository.GetByEmailAsync(normalizedEmail);
            if (existingUser != null)
                throw new InvalidOperationException($"Ya existe un usuario con el email '{normalizedEmail}'.");

            var user = new User
            {
                Name = normalizedName,
                Email = normalizedEmail
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

            await _userRepository.AddAsync(user);

            return new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email
            };
        }
    }
}
