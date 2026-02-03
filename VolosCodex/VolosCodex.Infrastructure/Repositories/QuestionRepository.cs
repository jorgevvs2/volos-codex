using Microsoft.Extensions.Logging;
using VolosCodex.Domain;
using VolosCodex.Domain.Interfaces;
using VolosCodex.Infrastructure.ExternalServices;

namespace VolosCodex.Infrastructure.Repositories
{
    public class QuestionRepository : IQuestionRepository
    {
        private readonly GeminiExternalService _geminiService;
        private readonly ILogger<QuestionRepository> _logger;

        public QuestionRepository(GeminiExternalService geminiService, ILogger<QuestionRepository> logger)
        {
            _geminiService = geminiService;
            _logger = logger;
        }

        public async Task<string> AskQuestionAsync(string prompt, RpgSystem system)
        {
            _logger.LogInformation("Asking question to Gemini for system: {System}", system);
            var fullPrompt = $"Sistema: {system}. Pergunta: {prompt}";
            
            var response = await _geminiService.GenerateContentAsync(fullPrompt);
            _logger.LogDebug("Received response from Gemini (Length: {Length})", response.Length);
            
            return response;
        }

        public async Task<string> GetSearchKeywordAsync(string prompt)
        {
            _logger.LogInformation("Requesting search keyword from Gemini...");
            var response = await _geminiService.GenerateContentAsync(prompt);
            _logger.LogInformation("Received keyword from Gemini: {Keyword}", response);
            
            return response;
        }
    }
}
