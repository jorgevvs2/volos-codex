using VolosCodex.Domain.Entities;

namespace VolosCodex.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByGoogleIdAsync(string googleId);
        Task<User> CreateAsync(User user);
        Task SaveChangesAsync();
    }
}
