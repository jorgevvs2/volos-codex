namespace VolosCodex.Domain.Entities
{
    public class ChatMessage
    {
        public Guid Id { get; set; }
        public Guid ChatSessionId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string Role { get; set; } = "user"; // "user" or "model"
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public ChatSession ChatSession { get; set; } = null!;
    }
}
