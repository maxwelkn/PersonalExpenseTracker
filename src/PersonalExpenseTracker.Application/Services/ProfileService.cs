using PersonalExpenseTracker.Application.DTOs.Auth;
using PersonalExpenseTracker.Application.DTOs.Profile;
using PersonalExpenseTracker.Application.Interfaces;

namespace PersonalExpenseTracker.Application.Services
{
    public class ProfileService
    {
        private readonly IUserRepository _userRepository;

        public ProfileService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
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
    }
}
