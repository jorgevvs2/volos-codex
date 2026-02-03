using Microsoft.Extensions.Logging;
using VolosCodex.Application.Services;
using VolosCodex.Domain;

namespace VolosCodex.Application.Handlers
{
    public class QuestionHandler
    {
        private readonly PromptService _promptService;
        private readonly BookSearchService _bookSearchService;
        private readonly ILogger<QuestionHandler> _logger;

        public QuestionHandler(PromptService promptService, BookSearchService bookSearchService, ILogger<QuestionHandler> logger)
        {
            _promptService = promptService;
            _bookSearchService = bookSearchService;
            _logger = logger;
        }

        public async Task<string> HandleQuestionAsync(string userQuestion, RpgSystem system)
        {
            _logger.LogInformation("Starting to handle question: {UserQuestion} for System: {System}", userQuestion, system);

            try
            {
                // 1. Search for relevant pages in books using local embeddings, filtered by the requested system
                _logger.LogInformation("Searching for relevant context in books using embeddings for system {System}...", system);
                var relevantPages = await _bookSearchService.SearchKeywordInBooksAsync(userQuestion, system);
                _logger.LogInformation("Found {Count} relevant pages.", relevantPages.Count);

                // 2. Send final prompt with context
                _logger.LogInformation("Sending final prompt with context to AI...");
                var answer = await _promptService.SendQuestionPromptAsync(userQuestion, system, relevantPages);
                _logger.LogInformation("Received answer from AI.");

                return answer;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling question: {UserQuestion}", userQuestion);
                throw;
            }
        }
    }
}