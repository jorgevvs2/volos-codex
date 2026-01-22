using Microsoft.Extensions.Logging;
using VolosCodex.Application.Utils;

namespace VolosCodex.Application.Services
{
    public class BookSearchService
    {
        private readonly BooksReader _booksReader;
        private readonly string _booksDirectory;
        private readonly ILogger<BookSearchService> _logger;

        public BookSearchService(BooksReader booksReader, ILogger<BookSearchService> logger)
        {
            _booksReader = booksReader;
            _logger = logger;
            
            // Navigate up from the bin folder to the project root, then to Domain/Books
            // This assumes the standard .NET build structure where the app runs from bin/Debug/netX.X/
            // Adjusting to find the source folder structure:
            // AppDomain.BaseDirectory is usually .../VolosCodexAPI/bin/Debug/net10.0/
            // We need to go up to .../VolosCodexAPI/VolosCodex.Domain/Books
            
            // Note: In a production/Docker environment, you should COPY the books to the output folder.
            // But for local development pointing to the source:
            
            var baseDir = AppDomain.CurrentDomain.BaseDirectory;
            
            // Try to find the solution root by going up directories
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
                // Fallback to a relative path if solution root not found (e.g. in Docker)
                // In Docker, we usually copy books to /app/Books or similar.
                _booksDirectory = Path.Combine(baseDir, "Books");
            }
        }

        public async Task<List<string>> SearchKeywordInBooksAsync(string keyword)
        {
            _logger.LogInformation("Searching for keyword: '{Keyword}' in directory: {Directory}", keyword, _booksDirectory);
            var results = new List<string>();
            
            if (string.IsNullOrWhiteSpace(keyword))
            {
                _logger.LogWarning("Keyword is empty. Skipping search.");
                return results;
            }

            // Ensure the directory exists
            if (!Directory.Exists(_booksDirectory))
            {
                _logger.LogError("Books directory not found: {Directory}", _booksDirectory);
                return results;
            }

            // Search for all PDF files in the directory
            var pdfFiles = Directory.GetFiles(_booksDirectory, "*.pdf");
            _logger.LogInformation("Found {Count} PDF files to scan.", pdfFiles.Length);

            foreach (var file in pdfFiles)
            {
                _logger.LogDebug("Scanning file: {File}", Path.GetFileName(file));
                var pages = await _booksReader.ReadPdfPagesAsync(file);
                
                int matchesInFile = 0;
                foreach (var pageContent in pages)
                {
                    if (pageContent.Contains(keyword, StringComparison.OrdinalIgnoreCase))
                    {
                        results.Add(pageContent);
                        matchesInFile++;
                    }
                }
                _logger.LogDebug("Found {Matches} matches in file: {File}", matchesInFile, Path.GetFileName(file));
            }

            _logger.LogInformation("Total matches found across all books: {Total}", results.Count);
            return results;
        }
    }
}
