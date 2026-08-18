using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalExpenseTracker.Application.DTOs.Profile;
using PersonalExpenseTracker.Application.Services;
using System.Security.Claims;

namespace PersonalExpenseTracker.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly ProfileService _profileService;

        public ProfileController(ProfileService profileService)
        {
            _profileService = profileService;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("El token no contiene un identificador de usuario válido.");
            }
            return userId;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var profile = await _profileService.GetProfileAsync(GetUserId());
            if (profile == null)
            {
                return NotFound();
            }

            return Ok(profile);
        }

        [HttpPut("name")]
        public async Task<IActionResult> UpdateName([FromBody] UpdateProfileNameDto dto)
        {
            var updatedProfile = await _profileService.UpdateNameAsync(GetUserId(), dto);
            if (updatedProfile == null)
            {
                return NotFound();
            }

            return Ok(updatedProfile);
        }
    }
}
