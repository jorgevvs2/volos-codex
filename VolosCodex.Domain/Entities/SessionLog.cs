namespace VolosCodex.Domain.Entities
{
    public class SessionLog
    {
        public Guid Id { get; set; }
        public Guid SessionId { get; set; }
        public string CharacterName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty; // e.g., "damage_dealt", "healing"
        public int Amount { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public Session Session { get; set; } = null!;
    }
}
