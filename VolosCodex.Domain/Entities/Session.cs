namespace VolosCodex.Domain.Entities
{
    public class Session
    {
        public Guid Id { get; set; }
        public Guid CampaignId { get; set; }
        public int SessionNumber { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;

        public Campaign Campaign { get; set; } = null!;
        public ICollection<SessionLog> Logs { get; set; } = new List<SessionLog>();
    }
}
