using Microsoft.Extensions.Logging;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;
using VolosCodex.Infrastructure.ExternalServices;

namespace VolosCodex.Application.Utils
{
    public class BooksReader
    {
        private readonly RedisCacheService _cacheService;
        private readonly ILogger<BooksReader> _logger;

        public BooksReader(RedisCacheService cacheService, ILogger<BooksReader> logger)
        {
            _cacheService = cacheService;
            _logger = logger;
        }

        /// <summary>
        /// Lê um PDF de D&D e retorna o conteúdo formatado por páginas para facilitar o processamento de IA.
        /// </summary>
        public async Task<IEnumerable<string>> ReadPdfPagesAsync(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("O caminho do arquivo não pode ser nulo ou vazio.");

            string fileName = Path.GetFileName(filePath);
            string cacheKey = $"book_content_{fileName}";
            
            _logger.LogDebug("Checking cache for book: {FileName} (Key: {Key})", fileName, cacheKey);
            var cachedContent = await _cacheService.GetAsync<IEnumerable<string>>(cacheKey);

            if (cachedContent != null)
            {
                _logger.LogInformation("Cache HIT for book: {FileName}", fileName);
                return cachedContent;
            }

            _logger.LogInformation("Cache MISS for book: {FileName}. Reading PDF...", fileName);
            var pages = new List<string>();

            try
            {
                using (PdfDocument document = PdfDocument.Open(filePath))
                {
                    _logger.LogDebug("Opened PDF: {FileName}. Extracting pages...", fileName);
                    foreach (Page page in document.GetPages())
                    {
                        // O PdfPig extrai o texto preservando a ordem de leitura
                        string pageText = page.Text;

                        if (!string.IsNullOrWhiteSpace(pageText))
                        {
                            pages.Add(CleanText(pageText));
                        }
                    }
                }
                _logger.LogInformation("Extracted {Count} pages from {FileName}.", pages.Count, fileName);

                await _cacheService.SetAsync(cacheKey, pages, TimeSpan.FromDays(7)); // Cache for 7 days
                _logger.LogInformation("Cached content for book: {FileName}", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading PDF file: {FileName}", fileName);
                throw;
            }

            return pages;
        }

        /// <summary>
        /// Limpa caracteres especiais e normaliza o espaçamento para otimizar o consumo de tokens no Gemini.
        /// </summary>
        private string CleanText(string input)
        {
            if (string.IsNullOrEmpty(input)) return input;

            return input
                .Replace("\r\n", "\n") // Normaliza quebras de linha
                .Replace("\t", " ")    // Remove tabs
                .Trim();
        }
    }
}
