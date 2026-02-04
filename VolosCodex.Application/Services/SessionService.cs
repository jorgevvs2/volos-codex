using VolosCodex.Domain.Entities;
using VolosCodex.Domain.Interfaces;

namespace VolosCodex.Application.Services
{
    public class SessionService
    {
        private readonly ISessionRepository _sessionRepository;
        private readonly ICampaignRepository _campaignRepository;

        public SessionService(ISessionRepository sessionRepository, ICampaignRepository campaignRepository)
        {
            _sessionRepository = sessionRepository;
            _campaignRepository = campaignRepository;
        }

        public async Task<Session> GetOrCreateSessionAsync(Guid campaignId, int sessionNumber)
        {
            var session = await _sessionRepository.GetByNumberAsync(campaignId, sessionNumber);
            if (session == null)
            {
                session = new Session
                {
                    Id = Guid.NewGuid(),
                    CampaignId = campaignId,
                    SessionNumber = sessionNumber,
                    Date = DateTime.UtcNow
                };
                await _sessionRepository.CreateAsync(session);
            }
            return session;
        }

        public async Task LogEventAsync(Guid campaignId, int sessionNumber, string characterName, string action, int amount)
        {
            var session = await GetOrCreateSessionAsync(campaignId, sessionNumber);

            var log = new SessionLog
            {
                Id = Guid.NewGuid(),
                SessionId = session.Id,
                CharacterName = characterName,
                Action = action,
                Amount = amount,
                Timestamp = DateTime.UtcNow
            };

            await _sessionRepository.AddLogAsync(log);
        }

        public async Task EndSessionAsync(Guid campaignId, int sessionNumber, string title, string description)
        {
            var session = await GetOrCreateSessionAsync(campaignId, sessionNumber);
            session.Title = title;
            session.Description = description;
            await _sessionRepository.UpdateAsync(session);
        }

        public async Task DeleteSessionAsync(Guid campaignId, int sessionNumber)
        {
            var session = await _sessionRepository.GetByNumberAsync(campaignId, sessionNumber);
            if (session != null)
            {
                await _sessionRepository.DeleteSessionAsync(session.Id);
            }
        }

        public async Task DeleteLogAsync(Guid logId)
        {
            await _sessionRepository.DeleteLogAsync(logId);
        }

        public async Task<Dictionary<string, int>> GetPlayerStatsAsync(Guid campaignId, string characterName)
        {
            var logs = await _sessionRepository.GetLogsByCampaignAsync(campaignId);

            return logs
                .Where(l => l.CharacterName == characterName)
                .GroupBy(l => l.Action)
                .ToDictionary(g => g.Key, g => g.Sum(l => l.Amount));
        }

        public async Task<Dictionary<string, (List<string> Players, int Amount)>> GetMvpsAsync(Guid campaignId)
        {
            var logs = await _sessionRepository.GetLogsByCampaignAsync(campaignId);
            var result = new Dictionary<string, (List<string>, int)>();

            var actions = new[] { "causado", "recebido", "cura", "eliminacao", "jogador_caido", "critico_sucesso", "critico_falha" };

            foreach (var action in actions)
            {
                var actionLogs = logs.Where(l => l.Action == action).ToList();
                if (!actionLogs.Any()) continue;

                var playerTotals = actionLogs
                    .GroupBy(l => l.CharacterName)
                    .Select(g => new { Name = g.Key, Total = g.Sum(l => l.Amount) })
                    .OrderByDescending(x => x.Total)
                    .ToList();

                if (playerTotals.Any())
                {
                    var maxVal = playerTotals.First().Total;
                    if (maxVal > 0)
                    {
                        var topPlayers = playerTotals.Where(p => p.Total == maxVal).Select(p => p.Name).ToList();
                        result[action] = (topPlayers, maxVal);
                    }
                }
            }

            return result;
        }

        public async Task<IEnumerable<Session>> GetSessionSummariesAsync(Guid campaignId)
        {
            return await _sessionRepository.GetAllByCampaignIdAsync(campaignId);
        }

        public async Task<IEnumerable<SessionLog>> GetLogsByCampaignAsync(Guid campaignId)
        {
            return await _sessionRepository.GetLogsByCampaignAsync(campaignId);
        }

        public async Task<IEnumerable<SessionLog>> GetLogsBySessionAsync(Guid campaignId, int sessionNumber)
        {
            var session = await _sessionRepository.GetByNumberAsync(campaignId, sessionNumber);
            if (session == null) return new List<SessionLog>();
            return await _sessionRepository.GetLogsAsync(session.Id);
        }
    }
}
