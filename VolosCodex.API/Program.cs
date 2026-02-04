using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VolosCodex.Application.Handlers;
using VolosCodex.Application.Services;
using VolosCodex.Application.Utils;
using VolosCodex.Domain.Interfaces;
using VolosCodex.Infrastructure.ExternalServices;
using VolosCodex.Infrastructure.Persistence;
using VolosCodex.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                       ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

builder.Services.AddDbContext<VolosCodexDbContext>(options =>
    options.UseNpgsql(connectionString));

// Authentication (Google)
var googleClientId = builder.Configuration["Authentication:Google:ClientId"]
                     ?? Environment.GetEnvironmentVariable("Authentication__Google__ClientId");

Console.WriteLine($"Configuring JWT with Audience: {googleClientId}");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://accounts.google.com";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuers = new[] { "https://accounts.google.com", "accounts.google.com" },

            // TEMPORARY DEBUG: Disable Audience Validation to confirm token validity
            ValidateAudience = false,
            // ValidAudience = googleClientId,

            ValidateLifetime = true
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Authentication Failed: {context.Exception.Message}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine("Token Validated Successfully");
                return Task.CompletedTask;
            }
        };
    });

// Infrastructure
builder.Services.AddSingleton<RedisCacheService>();
builder.Services.AddScoped<GeminiExternalService>();
builder.Services.AddScoped<IQuestionRepository, QuestionRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IChatRepository, ChatRepository>();

// Application
builder.Services.AddScoped<BooksReader>();
builder.Services.AddScoped<PromptBuilder>();
builder.Services.AddScoped<PromptService>();
builder.Services.AddScoped<BookSearchService>();
builder.Services.AddScoped<QuestionHandler>();
builder.Services.AddScoped<AuthService>();

var app = builder.Build();

// Apply Migrations automatically on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<VolosCodexDbContext>();
    try
    {
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Migration failed: {ex.Message}");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication(); // Add Authentication Middleware
app.UseAuthorization();

app.MapControllers();

app.Run();
