using Microsoft.EntityFrameworkCore;
using VolosCodex.Domain.Entities;
using VolosCodex.Domain.Interfaces;
using VolosCodex.Infrastructure.Persistence;

namespace VolosCodex.Infrastructure.Repositories
{
    public class SessionRepository : ISessionRepository
    {
        private readonly VolosCodexDbContext _context;

        public SessionRepository(VolosCodexDbContext context)
        {
            _context = context;
        }

        public async Task<Session> CreateAsync(Session session)
        {
            _context.Sessions.Add(session);
            await _context.SaveChangesAsync();
            return session;
        }

        public async Task<Session?> GetByIdAsync(Guid id)
        {
            return await _context.Sessions
                .Include(s => s.Logs)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Session?> GetByNumberAsync(Guid campaignId, int sessionNumber)
        {
            return await _context.Sessions
                .Include(s => s.Logs)
                .FirstOrDefaultAsync(s => s.CampaignId == campaignId && s.SessionNumber == sessionNumber);
        }

        public async Task<IEnumerable<Session>> GetAllByCampaignIdAsync(Guid campaignId)
        {
            return await _context.Sessions
                .Where(s => s.CampaignId == campaignId)
                .OrderBy(s => s.SessionNumber)
                .ToListAsync();
        }

        public async Task UpdateAsync(Session session)
        {
            _context.Sessions.Update(session);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteSessionAsync(Guid id)
        {
            var session = await _context.Sessions.FindAsync(id);
            if (session != null)
            {
                _context.Sessions.Remove(session);
                await _context.SaveChangesAsync();
            }
        }

        public async Task AddLogAsync(SessionLog log)
        {
            _context.SessionLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<SessionLog>> GetLogsAsync(Guid sessionId)
        {
            return await _context.SessionLogs
                .Where(l => l.SessionId == sessionId)
                .OrderBy(l => l.Timestamp)
                .ToListAsync();
        }

        public async Task<IEnumerable<SessionLog>> GetLogsByCampaignAsync(Guid campaignId)
        {
            return await _context.SessionLogs
                .Include(l => l.Session)
                .Where(l => l.Session.CampaignId == campaignId)
                .ToListAsync();
        }

        public async Task DeleteLogAsync(Guid id)
        {
            var log = await _context.SessionLogs.FindAsync(id);
            if (log != null)
            {
                _context.SessionLogs.Remove(log);
                await _context.SaveChangesAsync();
            }
        }
    }
}
