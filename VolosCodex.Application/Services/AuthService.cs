using VolosCodex.Domain.Entities;
using VolosCodex.Domain.Interfaces;

namespace VolosCodex.Application.Services
{
    public class AuthService
    {
        private readonly IUserRepository _userRepository;

        public AuthService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<User> GetOrCreateUserAsync(string googleId, string email, string name)
        {
            var user = await _userRepository.GetByGoogleIdAsync(googleId);
            if (user == null)
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    GoogleId = googleId,
                    Email = email,
                    Name = name,
                    CreatedAt = DateTime.UtcNow
                };
                await _userRepository.CreateAsync(user);
            }
            return user;
        }
    }
}
