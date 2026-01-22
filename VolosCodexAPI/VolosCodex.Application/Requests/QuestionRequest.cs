using System.Text.Json.Serialization;
using VolosCodex.Domain;

namespace VolosCodex.Application.Requests;

public class QuestionRequest
{
    [JsonPropertyName("prompt")]
    public string Prompt { get; set; }
    
    [JsonPropertyName("sistema")]
    public RpgSystem System { get; set; }
}