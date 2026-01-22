using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using VolosCodex.Application.Utils;
using VolosCodex.Domain;
using VolosCodex.Domain.Interfaces;

namespace VolosCodex.Application.Services
{
    public class PromptService
    {
        private readonly IQuestionRepository _questionRepository;
        private readonly PromptBuilder _promptBuilder;
        private readonly ILogger<PromptService> _logger;

        public PromptService(IQuestionRepository questionRepository, PromptBuilder promptBuilder, ILogger<PromptService> logger)
        {
            _questionRepository = questionRepository;
            _promptBuilder = promptBuilder;
            _logger = logger;
        }

        public async Task<string> SendQuestionPromptAsync(string userQuestion, RpgSystem system, List<string> contextPages)
        {
            _logger.LogInformation("Building final prompt for system: {System}", system);
            var systemPrompt = _promptBuilder.BuildPrompt(system);
            
            var contextText = string.Join("\n\n---\n\n", contextPages);
            var contextSection = !string.IsNullOrWhiteSpace(contextText) 
                ? $"\n\n### Contexto dos Livros de Regras:\n{contextText}\n\n" 
                : "";

            if (!string.IsNullOrWhiteSpace(contextSection))
            {
                _logger.LogInformation("Added {Count} pages of context to the prompt.", contextPages.Count);
            }
            else
            {
                _logger.LogWarning("No context pages found to add to the prompt.");
            }

            var fullPrompt = $"{systemPrompt}{contextSection}Pergunta do Usuário: {userQuestion}";
            
            _logger.LogDebug("Full Prompt Length: {Length}", fullPrompt.Length);
            return await _questionRepository.AskQuestionAsync(fullPrompt, system);
        }

        public async Task<string> GetSearchKeywordAsync(string userDescription)
        {
            _logger.LogInformation("Generating search keyword prompt for description: {Description}", userDescription);
            var searchPrompt = _promptBuilder.GetSearchKeywordPrompt();
            var fullPrompt = $"{searchPrompt}\n\nDescrição do Usuário: {userDescription}";
            
            return await _questionRepository.GetSearchKeywordAsync(fullPrompt);
        }
    }
}
