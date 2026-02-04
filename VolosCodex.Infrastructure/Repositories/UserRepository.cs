using Microsoft.EntityFrameworkCore;
using VolosCodex.Domain.Entities;
using VolosCodex.Domain.Interfaces;
using VolosCodex.Infrastructure.Persistence;

namespace VolosCodex.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly VolosCodexDbContext _context;

        public UserRepository(VolosCodexDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByGoogleIdAsync(string googleId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId);
        }

        public async Task<User> CreateAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
