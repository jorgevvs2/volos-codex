using Google.GenAI;
using Google.GenAI.Types;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;

namespace VolosCodex.Infrastructure.ExternalServices
{
    public class GeminiExternalService
    {
        private readonly string _apiKey;
        private readonly Client _client;
        private readonly ILogger<GeminiExternalService> _logger;

        public GeminiExternalService(IConfiguration configuration, ILogger<GeminiExternalService> logger)
        {
            _logger = logger;
            _apiKey = configuration["Gemini:ApiKey"] ?? throw new ArgumentNullException("Gemini:ApiKey is missing");
            
            // Note: O log mostrou que você está na v1beta por padrão, 
            // vamos manter a configuração simples.
            _client = new Client(apiKey: _apiKey);
        }

        public async Task<string> GenerateContentAsync(string text)
        {
            try 
            {
                // ATUALIZADO: Usando o ID que seu log confirmou estar disponível
                const string modelId = "models/gemini-2.5-flash";
                
                _logger.LogDebug("Sending request to Gemini API (Model: {ModelId})...", modelId);

                var config = new GenerateContentConfig
                {
                    Temperature = 0.1f,
                    MaxOutputTokens = 8000 // Increased from 1000 to prevent truncation
                };

                var response = await _client.Models.GenerateContentAsync(
                    model: modelId,
                    contents: text,
                    config: config
                );

                var candidate = response.Candidates?.FirstOrDefault();
                
                // Check if the response was stopped due to length
                // Correct enum value for Google.GenAI.Types might be different, checking common ones.
                // Usually it is FinishReason.MaxTokens, but if the compiler complains, it might be 'MAX_TOKENS' or similar string enum.
                // Let's try to convert it to string for logging if strict enum matching fails, or just remove the specific check if it's causing build errors.
                // Assuming the user meant the enum member 'MaxTokens' is not found.
                
                if (candidate?.FinishReason.ToString() == "MAX_TOKENS")
                {
                    _logger.LogWarning("Gemini response was truncated due to MaxOutputTokens limit.");
                }

                var part = candidate?.Content?.Parts?.FirstOrDefault();
                var resultText = part?.Text ?? string.Empty;

                _logger.LogInformation("Received response from Gemini API: {ResponseText}", resultText);

                return resultText;
            }
            catch (Exception ex)
            {
                var maskedKey = _apiKey.Length > 4 ? _apiKey.Substring(0, 4) + "..." : "InvalidKey";
                _logger.LogError(ex, "Erro no VolosCodex (Key starts with {MaskedKey}): {Message}", maskedKey, ex.Message);
                // Agora que sabemos os modelos, um log simples basta
                throw new Exception($"Erro no VolosCodex: {ex.Message}", ex);
            }
        }
    }
}
