using Microsoft.EntityFrameworkCore;
using VolosCodex.Domain.Entities;
using VolosCodex.Domain.Interfaces;
using VolosCodex.Infrastructure.Persistence;

namespace VolosCodex.Infrastructure.Repositories
{
    public class ChatRepository : IChatRepository
    {
        private readonly VolosCodexDbContext _context;

        public ChatRepository(VolosCodexDbContext context)
        {
            _context = context;
        }

        public async Task<List<ChatSession>> GetSessionsByUserIdAsync(Guid userId)
        {
            return await _context.ChatSessions
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.UpdatedAt)
                .ToListAsync();
        }

        public async Task<ChatSession?> GetSessionByIdAsync(Guid sessionId, Guid userId)
        {
            return await _context.ChatSessions
                .Include(s => s.Messages.OrderBy(m => m.Timestamp))
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);
        }

        public async Task<ChatSession> CreateSessionAsync(ChatSession session)
        {
            _context.ChatSessions.Add(session);
            await _context.SaveChangesAsync();
            return session;
        }

        public async Task AddMessageAsync(ChatMessage message)
        {
            _context.ChatMessages.Add(message);

            // Update session timestamp
            var session = await _context.ChatSessions.FindAsync(message.ChatSessionId);
            if (session != null)
            {
                session.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
