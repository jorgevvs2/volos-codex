using Microsoft.Extensions.Logging;
using SmartComponents.LocalEmbeddings;
using VolosCodex.Application.Utils;

namespace VolosCodex.Application.Services
{
    public class BookSearchService
    {
        private readonly BooksReader _booksReader;
        private readonly string _booksDirectory;
        private readonly ILogger<BookSearchService> _logger;
        private readonly LocalEmbedder _embedder;
        private readonly Dictionary<string, EmbeddingF32> _pageEmbeddings = new();
        private readonly Dictionary<string, string> _pageContents = new();
        private bool _isIndexed = false;

        public BookSearchService(BooksReader booksReader, ILogger<BookSearchService> logger)
        {
            _booksReader = booksReader;
            _logger = logger;
            _embedder = new LocalEmbedder();
            
            // In Docker, we copied the books to /app/Books
            // In local development, we might want to look relative to the execution path
            var baseDir = AppDomain.CurrentDomain.BaseDirectory;
            
            // Check for the Docker path first (or published app structure)
            var dockerBooksPath = Path.Combine(baseDir, "Books");
            
            if (Directory.Exists(dockerBooksPath))
            {
                _booksDirectory = dockerBooksPath;
            }
            else
            {
                // Fallback for local debugging (finding source folder)
                var directoryInfo = new DirectoryInfo(baseDir);
                while (directoryInfo != null && !directoryInfo.GetFiles("*.sln", SearchOption.TopDirectoryOnly).Any() && !directoryInfo.GetFiles("*.slnx", SearchOption.TopDirectoryOnly).Any())
                {
                    directoryInfo = directoryInfo.Parent;
                }

                if (directoryInfo != null)
                {
                    _booksDirectory = Path.Combine(directoryInfo.FullName, "VolosCodex.Domain", "Books");
                }
                else
                {
                    // Final fallback
                    _booksDirectory = Path.Combine(baseDir, "Books");
                }
            }
            
            _logger.LogInformation("BookSearchService initialized. Books directory: {Directory}", _booksDirectory);
        }

        private async Task EnsureIndexedAsync()
        {
            if (_isIndexed) return;

            _logger.LogInformation("Indexing books for semantic search...");
            
            if (!Directory.Exists(_booksDirectory))
            {
                _logger.LogError("Books directory not found: {Directory}", _booksDirectory);
                return;
            }

            var pdfFiles = Directory.GetFiles(_booksDirectory, "*.pdf");
            
            if (pdfFiles.Length == 0)
            {
                _logger.LogWarning("No PDF files found in {Directory}", _booksDirectory);
            }

            foreach (var file in pdfFiles)
            {
                var fileName = Path.GetFileName(file);
                var pages = await _booksReader.ReadPdfPagesAsync(file);
                int pageIndex = 1;

                foreach (var pageContent in pages)
                {
                    if (string.IsNullOrWhiteSpace(pageContent)) continue;

                    var key = $"{fileName}_Page{pageIndex}";
                    var embedding = _embedder.Embed(pageContent);
                    
                    _pageEmbeddings[key] = embedding;
                    _pageContents[key] = pageContent;
                    
                    pageIndex++;
                }
            }
            
            _isIndexed = true;
            _logger.LogInformation("Indexing complete. Indexed {Count} pages.", _pageEmbeddings.Count);
        }

        public async Task<List<string>> SearchKeywordInBooksAsync(string query)
        {
            await EnsureIndexedAsync();

            _logger.LogInformation("Searching for query: '{Query}' using embeddings", query);
            
            if (string.IsNullOrWhiteSpace(query))
            {
                return new List<string>();
            }

            var queryEmbedding = _embedder.Embed(query);
            
            var results = _pageEmbeddings
                .Select(x => new { Key = x.Key, Similarity = x.Value.Similarity(queryEmbedding) })
                .OrderByDescending(x => x.Similarity)
                .Take(5)
                .Select(x => _pageContents[x.Key])
                .ToList();

            _logger.LogInformation("Found {Count} relevant pages.", results.Count);
            return results;
        }
    }
}