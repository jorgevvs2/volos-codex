using VolosCodex.Application.Handlers;
using VolosCodex.Application.Services;
using VolosCodex.Application.Utils;
using VolosCodex.Domain.Interfaces;
using VolosCodex.Infrastructure.ExternalServices;
using VolosCodex.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Infrastructure
builder.Services.AddSingleton<RedisCacheService>();
builder.Services.AddScoped<GeminiExternalService>(); // Changed from AddHttpClient to AddScoped as it no longer uses HttpClient directly
builder.Services.AddScoped<IQuestionRepository, QuestionRepository>();

// Application
builder.Services.AddScoped<BooksReader>();
builder.Services.AddScoped<PromptBuilder>();
builder.Services.AddScoped<PromptService>();
builder.Services.AddScoped<BookSearchService>();
builder.Services.AddScoped<QuestionHandler>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
