using VolosCodex.Domain;
using VolosCodex.Domain.Entities;
using VolosCodex.Domain.Interfaces;

namespace VolosCodex.Application.Services
{
    public class CampaignService
    {
        private readonly ICampaignRepository _campaignRepository;

        public CampaignService(ICampaignRepository campaignRepository)
        {
            _campaignRepository = campaignRepository;
        }

        public async Task<Campaign> CreateCampaignAsync(string guildId, string name, RpgSystem system, string gameMasterId)
        {
            var campaign = new Campaign
            {
                Id = Guid.NewGuid(),
                GuildId = guildId,
                Name = name,
                System = system,
                GameMasterId = gameMasterId,
                IsActive = false, // Default to inactive
                CreatedAt = DateTime.UtcNow
            };

            return await _campaignRepository.CreateAsync(campaign);
        }

        public async Task SetActiveCampaignAsync(string guildId, Guid campaignId)
        {
            var campaigns = await _campaignRepository.GetAllByGuildIdAsync(guildId);

            foreach (var campaign in campaigns)
            {
                if (campaign.Id == campaignId)
                {
                    campaign.IsActive = true;
                }
                else if (campaign.IsActive)
                {
                    campaign.IsActive = false;
                }
                await _campaignRepository.UpdateAsync(campaign);
            }
        }

        public async Task<Campaign?> GetActiveCampaignAsync(string guildId)
        {
            return await _campaignRepository.GetActiveByGuildIdAsync(guildId);
        }

        public async Task<IEnumerable<Campaign>> GetCampaignsAsync(string guildId)
        {
            return await _campaignRepository.GetAllByGuildIdAsync(guildId);
        }

        public async Task<IEnumerable<Campaign>> GetAllCampaignsAsync()
        {
            return await _campaignRepository.GetAllAsync();
        }

        public async Task<Campaign?> GetCampaignByIdAsync(Guid campaignId)
        {
            return await _campaignRepository.GetByIdAsync(campaignId);
        }

        public async Task DeleteCampaignAsync(Guid campaignId)
        {
            await _campaignRepository.DeleteAsync(campaignId);
        }

        public async Task AddPlayerAsync(Guid campaignId, string characterName)
        {
            var player = new CampaignPlayer
            {
                Id = Guid.NewGuid(),
                CampaignId = campaignId,
                CharacterName = characterName
            };
            await _campaignRepository.AddPlayerAsync(player);
        }

        public async Task RemovePlayerAsync(Guid campaignId, string characterName)
        {
            await _campaignRepository.RemovePlayerAsync(campaignId, characterName);
        }

        public async Task<IEnumerable<CampaignPlayer>> GetPlayersAsync(Guid campaignId)
        {
            return await _campaignRepository.GetPlayersAsync(campaignId);
        }
    }
}
