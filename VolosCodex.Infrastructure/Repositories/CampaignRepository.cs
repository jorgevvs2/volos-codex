using Microsoft.EntityFrameworkCore;
using VolosCodex.Domain.Entities;
using VolosCodex.Domain.Interfaces;
using VolosCodex.Infrastructure.Persistence;

namespace VolosCodex.Infrastructure.Repositories
{
    public class CampaignRepository : ICampaignRepository
    {
        private readonly VolosCodexDbContext _context;

        public CampaignRepository(VolosCodexDbContext context)
        {
            _context = context;
        }

        public async Task<Campaign> CreateAsync(Campaign campaign)
        {
            _context.Campaigns.Add(campaign);
            await _context.SaveChangesAsync();
            return campaign;
        }

        public async Task<Campaign?> GetByIdAsync(Guid id)
        {
            return await _context.Campaigns
                .Include(c => c.Players)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Campaign?> GetActiveByGuildIdAsync(string guildId)
        {
            return await _context.Campaigns
                .Include(c => c.Players)
                .FirstOrDefaultAsync(c => c.GuildId == guildId && c.IsActive);
        }

        public async Task<IEnumerable<Campaign>> GetAllByGuildIdAsync(string guildId)
        {
            return await _context.Campaigns
                .Where(c => c.GuildId == guildId)
                .OrderByDescending(c => c.IsActive)
                .ThenBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Campaign>> GetAllAsync()
        {
            return await _context.Campaigns
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task UpdateAsync(Campaign campaign)
        {
            _context.Campaigns.Update(campaign);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var campaign = await _context.Campaigns.FindAsync(id);
            if (campaign != null)
            {
                _context.Campaigns.Remove(campaign);
                await _context.SaveChangesAsync();
            }
        }

        public async Task AddPlayerAsync(CampaignPlayer player)
        {
            _context.CampaignPlayers.Add(player);
            await _context.SaveChangesAsync();
        }

        public async Task RemovePlayerAsync(Guid campaignId, string characterName)
        {
            var player = await _context.CampaignPlayers
                .FirstOrDefaultAsync(p => p.CampaignId == campaignId && p.CharacterName == characterName);

            if (player != null)
            {
                _context.CampaignPlayers.Remove(player);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<CampaignPlayer>> GetPlayersAsync(Guid campaignId)
        {
            return await _context.CampaignPlayers
                .Where(p => p.CampaignId == campaignId)
                .OrderBy(p => p.CharacterName)
                .ToListAsync();
        }
    }
}
