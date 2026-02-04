using Microsoft.Extensions.Logging;
using SmartComponents.LocalEmbeddings;
using VolosCodex.Application.Utils;
using VolosCodex.Domain;

namespace VolosCodex.Application.Services
{
    public class BookSearchService
    {
        private readonly BooksReader _booksReader;
        private readonly string _booksDirectory;
        private readonly ILogger<BookSearchService> _logger;
        private readonly LocalEmbedder _embedder;
        // Key: FileName_PageNumber, Value: Embedding
        private readonly Dictionary<string, EmbeddingF32> _pageEmbeddings = new();
        // Key: FileName_PageNumber, Value: Content
        private readonly Dictionary<string, string> _pageContents = new();
        // Key: FileName_PageNumber, Value: RpgSystem (derived from filename)
        private readonly Dictionary<string, RpgSystem> _pageSystems = new();
        private bool _isIndexed = false;

        public BookSearchService(BooksReader booksReader, ILogger<BookSearchService> logger)
        {
            _booksReader = booksReader;
            _logger = logger;
            _embedder = new LocalEmbedder();
            
            var baseDir = AppDomain.CurrentDomain.BaseDirectory;
            
            var potentialPaths = new List<string>
            {
                "/app/Books", 
                Path.Combine(baseDir, "Books"), 
                Path.Combine(Directory.GetCurrentDirectory(), "Books") 
            };

            var directoryInfo = new DirectoryInfo(baseDir);
            while (directoryInfo != null && !directoryInfo.GetFiles("*.sln", SearchOption.TopDirectoryOnly).Any() && !directoryInfo.GetFiles("*.slnx", SearchOption.TopDirectoryOnly).Any())
            {
                directoryInfo = directoryInfo.Parent;
            }

            if (directoryInfo != null)
            {
                potentialPaths.Add(Path.Combine(directoryInfo.FullName, "VolosCodex.Domain", "Books"));
            }

            var existingPaths = potentialPaths.Where(Directory.Exists).ToList();
            
            if (existingPaths.Any())
            {
                _booksDirectory = existingPaths.FirstOrDefault(p => Directory.GetFiles(p, "*.pdf").Any()) ?? existingPaths.First();
            }
            else
            {
                _booksDirectory = Path.Combine(baseDir, "Books");
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
                var system = DetermineSystemFromFileName(fileName);
                
                if (system == null)
                {
                    _logger.LogWarning("Could not determine RpgSystem for file: {FileName}. Skipping.", fileName);
                    continue;
                }

                _logger.LogInformation("Indexing file: {FileName} as system: {System}", fileName, system);

                var pages = await _booksReader.ReadPdfPagesAsync(file);
                int pageIndex = 1;

                foreach (var pageContent in pages)
                {
                    if (string.IsNullOrWhiteSpace(pageContent)) continue;

                    var key = $"{fileName}_Page{pageIndex}";
                    var embedding = _embedder.Embed(pageContent);
                    
                    _pageEmbeddings[key] = embedding;
                    _pageContents[key] = pageContent;
                    _pageSystems[key] = system.Value;
                    
                    pageIndex++;
                }
            }
            
            _isIndexed = true;
            _logger.LogInformation("Indexing complete. Indexed {Count} pages.", _pageEmbeddings.Count);
        }

        private RpgSystem? DetermineSystemFromFileName(string fileName)
        {
            var lowerFileName = fileName.ToLowerInvariant();

            // DnD 2024 (e.g., dnd2024_phb.pdf, dnd2024_dmg.pdf)
            if (lowerFileName.Contains("dnd2024") || lowerFileName.StartsWith("dnd24"))
                return RpgSystem.DnD2024;

            // DnD 5e (e.g., dnd5e_phb.pdf, dnd5_xanathar.pdf)
            if (lowerFileName.Contains("dnd5e") || lowerFileName.Contains("dnd5"))
                return RpgSystem.DnD5;

            // Daggerheart (e.g., dh_playtest.pdf, daggerheart_core.pdf)
            if (lowerFileName.Contains("daggerheart") || lowerFileName.StartsWith("dh"))
                return RpgSystem.Daggerheart;

            // Reinos de Ferro (e.g., reinos_core.pdf, ikrpg.pdf)
            if (lowerFileName.Contains("reinos") || lowerFileName.Contains("ironkingdoms") || lowerFileName.StartsWith("ik"))
                return RpgSystem.ReinosDeFerro;

            return null;
        }

        public async Task<List<string>> SearchKeywordInBooksAsync(string query, RpgSystem system)
        {
            await EnsureIndexedAsync();

            _logger.LogInformation("Searching for query: '{Query}' in system: {System}", query, system);
            
            if (string.IsNullOrWhiteSpace(query))
            {
                return new List<string>();
            }

            var queryEmbedding = _embedder.Embed(query);
            
            var results = _pageEmbeddings
                .Where(x => _pageSystems.ContainsKey(x.Key) && _pageSystems[x.Key] == system)
                .Select(x => new { Key = x.Key, Similarity = x.Value.Similarity(queryEmbedding) })
                .OrderByDescending(x => x.Similarity)
                .Take(5)
                .Select(x => _pageContents[x.Key])
                .ToList();

            _logger.LogInformation("Found {Count} relevant pages for system {System}.", results.Count, system);
            return results;
        }
    }
}
