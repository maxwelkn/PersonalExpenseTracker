using Microsoft.AspNetCore.Identity;
using PersonalExpenseTracker.Application.DTOs.Auth;
using PersonalExpenseTracker.Application.DTOs.Profile;
using PersonalExpenseTracker.Application.Interfaces;
using PersonalExpenseTracker.Domain.Entities;

namespace PersonalExpenseTracker.Application.Services
{
    public class ProfileService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher<User> _passwordHasher;

        public ProfileService(IUserRepository userRepository, IPasswordHasher<User> passwordHasher)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task<UserResponseDto?> GetProfileAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return null;
            }

            return new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email
            };
        }

        public async Task<UserResponseDto?> UpdateNameAsync(int userId, UpdateProfileNameDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ArgumentException("El nombre no puede estar vacío.", nameof(dto.Name));

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return null;
            }

            user.Name = dto.Name.Trim();
            
            await _userRepository.UpdateAsync(user);

            return new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email
            };
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
                throw new ArgumentException("La contraseña actual no puede estar vacía.", nameof(dto.CurrentPassword));

            if (string.IsNullOrWhiteSpace(dto.NewPassword))
                throw new ArgumentException("La nueva contraseña no puede estar vacía.", nameof(dto.NewPassword));

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.CurrentPassword);
            if (verificationResult == PasswordVerificationResult.Failed)
            {
                throw new UnauthorizedAccessException("La contraseña actual es incorrecta.");
            }

            user.PasswordHash = _passwordHasher.HashPassword(user, dto.NewPassword);

            await _userRepository.UpdateAsync(user);

            return true;
        }
    }
}
