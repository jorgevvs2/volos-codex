using VolosCodex.Domain;

namespace VolosCodex.Application.Requests
{
    public class CreateCampaignRequest
    {
        public string GuildId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public RpgSystem System { get; set; } = RpgSystem.DnD5;
        public string? GameMasterId { get; set; } // Optional: Email or ID of the GM
    }

    public class SetActiveCampaignRequest
    {
        public string GuildId { get; set; } = string.Empty;
        public Guid CampaignId { get; set; }
    }

    public class AddPlayerRequest
    {
        public Guid CampaignId { get; set; }
        public string CharacterName { get; set; } = string.Empty;
    }
}
