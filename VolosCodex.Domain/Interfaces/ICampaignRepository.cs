using VolosCodex.Domain.Entities;

namespace VolosCodex.Domain.Interfaces
{
    public interface ICampaignRepository
    {
        Task<Campaign> CreateAsync(Campaign campaign);
        Task<Campaign?> GetByIdAsync(Guid id);
        Task<Campaign?> GetActiveByGuildIdAsync(string guildId);
        Task<IEnumerable<Campaign>> GetAllByGuildIdAsync(string guildId);
        Task<IEnumerable<Campaign>> GetAllAsync(); // New method
        Task UpdateAsync(Campaign campaign);
        Task DeleteAsync(Guid id);

        Task AddPlayerAsync(CampaignPlayer player);
        Task RemovePlayerAsync(Guid campaignId, string characterName);
        Task<IEnumerable<CampaignPlayer>> GetPlayersAsync(Guid campaignId);
    }
}
