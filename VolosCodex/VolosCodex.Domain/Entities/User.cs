namespace VolosCodex.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string GoogleId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<ChatSession> ChatSessions { get; set; } = new List<ChatSession>();
    }
}
