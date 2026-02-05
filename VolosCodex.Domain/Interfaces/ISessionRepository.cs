using VolosCodex.Domain.Entities;

namespace VolosCodex.Domain.Interfaces
{
    public interface ISessionRepository
    {
        Task<Session> CreateAsync(Session session);
        Task<Session?> GetByIdAsync(Guid id);
        Task<Session?> GetByNumberAsync(Guid campaignId, int sessionNumber);
        Task<IEnumerable<Session>> GetAllByCampaignIdAsync(Guid campaignId);
        Task UpdateAsync(Session session);
        Task DeleteSessionAsync(Guid id);

        Task AddLogAsync(SessionLog log);
        Task<IEnumerable<SessionLog>> GetLogsAsync(Guid sessionId);
        Task<IEnumerable<SessionLog>> GetLogsByCampaignAsync(Guid campaignId);
        Task<SessionLog?> GetLogByIdAsync(Guid id); // New method to fetch log for update
        Task UpdateLogAsync(SessionLog log); // New method
        Task DeleteLogAsync(Guid id);
    }
}
