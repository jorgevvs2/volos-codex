using Microsoft.Extensions.Logging;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;
using VolosCodex.Infrastructure.ExternalServices;
using System.Text;
using System.Linq;

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
        /// Lê um PDF de D&D e retorna o conteúdo formatado como Markdown por páginas para facilitar o processamento de IA (RAG).
        /// </summary>
        public async Task<IEnumerable<string>> ReadPdfPagesAsync(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("O caminho do arquivo não pode ser nulo ou vazio.");

            string fileName = Path.GetFileName(filePath);
            string cacheKey = $"book_content_md_{fileName}";
            
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
                        string markdownPage = ConvertToMarkdown(page);

                        if (!string.IsNullOrWhiteSpace(markdownPage))
                        {
                            pages.Add(markdownPage);
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

        private string ConvertToMarkdown(Page page)
        {
            var words = page.GetWords().ToList();
            if (!words.Any()) return string.Empty;

            // Calculate base font size (most frequent) to detect headers
            // Word does not have FontSize directly, so we take the max font size of its letters
            var baseFontSize = words.GroupBy(w => Math.Round(w.Letters.Max(l => l.FontSize), 1))
                                    .OrderByDescending(g => g.Count())
                                    .First().Key;

            // Sort words by Y (descending) then X (ascending)
            var sortedWords = words.OrderByDescending(w => w.BoundingBox.Bottom).ThenBy(w => w.BoundingBox.Left).ToList();

            var lines = new List<List<Word>>();
            var currentLine = new List<Word>();
            
            if (sortedWords.Any())
            {
                double lastY = sortedWords.First().BoundingBox.Bottom;
                
                foreach (var word in sortedWords)
                {
                    // If the vertical distance is significant, start a new line
                    if (Math.Abs(word.BoundingBox.Bottom - lastY) > 5) 
                    {
                        if (currentLine.Any())
                        {
                            // Sort the current line by X before adding
                            lines.Add(currentLine.OrderBy(w => w.BoundingBox.Left).ToList());
                        }
                        currentLine = new List<Word>();
                        lastY = word.BoundingBox.Bottom;
                    }
                    currentLine.Add(word);
                }
                if (currentLine.Any())
                {
                    lines.Add(currentLine.OrderBy(w => w.BoundingBox.Left).ToList());
                }
            }

            var sb = new StringBuilder();

            foreach (var line in lines)
            {
                var lineText = string.Join(" ", line.Select(w => w.Text));
                var maxFontSize = line.Max(w => w.Letters.Max(l => l.FontSize));

                // Heuristic for headers based on font size
                if (maxFontSize >= baseFontSize * 1.5)
                {
                    sb.AppendLine($"# {lineText}");
                }
                else if (maxFontSize >= baseFontSize * 1.2)
                {
                    sb.AppendLine($"## {lineText}");
                }
                else
                {
                    sb.AppendLine(lineText);
                }
            }

            return sb.ToString().Trim();
        }
    }
}