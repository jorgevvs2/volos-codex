using StackExchange.Redis;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace VolosCodex.Infrastructure.ExternalServices
{
    public class RedisCacheService
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly IDatabase _db;
        private readonly ILogger<RedisCacheService> _logger;

        public RedisCacheService(IConfiguration configuration, ILogger<RedisCacheService> logger)
        {
            _logger = logger;
            var connectionString = configuration["Redis:ConnectionString"] ?? "localhost:6379";
            
            try
            {
                _redis = ConnectionMultiplexer.Connect(connectionString);
                _db = _redis.GetDatabase();
                _logger.LogInformation("Connected to Redis at {ConnectionString}", connectionString);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to connect to Redis at {ConnectionString}", connectionString);
                throw;
            }
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            try
            {
                var json = JsonSerializer.Serialize(value);
                await _db.StringSetAsync(key, json, expiry);
                _logger.LogDebug("Set cache key: {Key} (Expiry: {Expiry})", key, expiry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting cache key: {Key}", key);
                throw;
            }
        }

        public async Task<T?> GetAsync<T>(string key)
        {
            try
            {
                var json = await _db.StringGetAsync(key);
                if (json.IsNullOrEmpty)
                {
                    _logger.LogDebug("Cache miss for key: {Key}", key);
                    return default;
                }
                
                _logger.LogDebug("Cache hit for key: {Key}", key);
                return JsonSerializer.Deserialize<T>((ReadOnlySpan<byte>)json);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cache key: {Key}", key);
                throw;
            }
        }
    }
}
