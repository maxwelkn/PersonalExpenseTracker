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
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public AuthService(IUserRepository userRepository, IPasswordHasher<User> passwordHasher, IJwtTokenGenerator jwtTokenGenerator)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _jwtTokenGenerator = jwtTokenGenerator;
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

        public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new ArgumentException("El email no puede estar vacío.", nameof(dto.Email));

            if (string.IsNullOrWhiteSpace(dto.Password))
                throw new ArgumentException("La contraseña no puede estar vacía.", nameof(dto.Password));

            var normalizedEmail = dto.Email.Trim();

            var user = await _userRepository.GetByEmailAsync(normalizedEmail);
            if (user == null)
                throw new UnauthorizedAccessException("Email o contraseña incorrectos.");

            var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            if (verificationResult == PasswordVerificationResult.Failed)
                throw new UnauthorizedAccessException("Email o contraseña incorrectos.");

            var token = _jwtTokenGenerator.GenerateToken(user);

            return new LoginResponseDto
            {
                User = new UserResponseDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email
                },
                Token = token
            };
        }
    }
}
