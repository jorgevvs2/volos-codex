using VolosCodex.Domain.Entities;

namespace VolosCodex.Domain.Interfaces
{
    public interface IChatRepository
    {
        Task<List<ChatSession>> GetSessionsByUserIdAsync(Guid userId);
        Task<ChatSession?> GetSessionByIdAsync(Guid sessionId, Guid userId);
        Task<ChatSession> CreateSessionAsync(ChatSession session);
        Task AddMessageAsync(ChatMessage message);
        Task SaveChangesAsync();
    }
}
