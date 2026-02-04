namespace VolosCodex.Domain.Entities
{
    public class Campaign
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string GuildId { get; set; } = string.Empty; // From Discord Guild ID or User Email
        public string GameMasterId { get; set; } = string.Empty; // User ID/Email of the GM
        public bool IsActive { get; set; }
        public RpgSystem System { get; set; } = RpgSystem.DnD5;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<CampaignPlayer> Players { get; set; } = new List<CampaignPlayer>();
        public ICollection<Session> Sessions { get; set; } = new List<Session>();
    }
}
