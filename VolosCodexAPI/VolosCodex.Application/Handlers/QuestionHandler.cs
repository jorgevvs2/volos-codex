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
                // 1. Extract keyword from user question
                _logger.LogInformation("Extracting keyword from user question...");
                var keyword = await _promptService.GetSearchKeywordAsync(userQuestion);
                _logger.LogInformation("Keyword extracted: {Keyword}", keyword);

                // 2. Search for relevant pages in books
                // Clean up the keyword (remove quotes if any)
                keyword = keyword.Trim().Trim('"').Trim('\'');
                
                _logger.LogInformation("Searching for keyword '{Keyword}' in books...", keyword);
                var relevantPages = await _bookSearchService.SearchKeywordInBooksAsync(keyword);
                _logger.LogInformation("Found {Count} relevant pages.", relevantPages.Count);

                // 3. Send final prompt with context
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
