namespace VolosCodex.Application.Requests
{
    public class LogEventRequest
    {
        public Guid CampaignId { get; set; }
        public int SessionNumber { get; set; }
        public string CharacterName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public int Amount { get; set; }
    }

    public class EndSessionRequest
    {
        public Guid CampaignId { get; set; }
        public int SessionNumber { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
