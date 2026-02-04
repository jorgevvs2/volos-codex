namespace VolosCodex.Domain.Entities
{
    public class CampaignPlayer
    {
        public Guid Id { get; set; }
        public Guid CampaignId { get; set; }
        public string CharacterName { get; set; } = string.Empty;
        public string? PlayerName { get; set; } // Optional: Discord username or real name

        public Campaign Campaign { get; set; } = null!;
    }
}
