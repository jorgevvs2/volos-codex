using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using VolosCodex.Application.Handlers;
using VolosCodex.Application.Requests;
using VolosCodex.Application.Services;
using VolosCodex.Domain.Entities;
using VolosCodex.Domain.Interfaces;

namespace VolosCodex.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class QuestionsController : ControllerBase
    {
        private readonly QuestionHandler _questionHandler;
        private readonly AuthService _authService;
        private readonly IChatRepository _chatRepository;
        private readonly ILogger<QuestionsController> _logger;

        public QuestionsController(
            QuestionHandler questionHandler,
            AuthService authService,
            IChatRepository chatRepository,
            ILogger<QuestionsController> logger)
        {
            _questionHandler = questionHandler;
            _authService = authService;
            _chatRepository = chatRepository;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> AskQuestion([FromBody] QuestionRequest request)
        {
            // 1. Get Answer from AI
            var answer = await _questionHandler.HandleQuestionAsync(request.Prompt, request.System);
            Guid? returnedSessionId = request.SessionId;

            // 2. If user is authenticated, save history
            if (User.Identity?.IsAuthenticated == true)
            {
                try
                {
                    var googleId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    var email = User.FindFirst(ClaimTypes.Email)?.Value;
                    var name = User.FindFirst(ClaimTypes.Name)?.Value;

                    if (!string.IsNullOrEmpty(googleId))
                    {
                        var user = await _authService.GetOrCreateUserAsync(googleId, email ?? "", name ?? "Unknown");

                        ChatSession session;
                        if (request.SessionId.HasValue)
                        {
                            session = await _chatRepository.GetSessionByIdAsync(request.SessionId.Value, user.Id);
                            if (session == null)
                            {
                                _logger.LogWarning($"Session {request.SessionId} not found for user {user.Id}. Creating new.");
                                session = await CreateNewSession(user.Id, request.Prompt);
                            }
                        }
                        else
                        {
                            session = await CreateNewSession(user.Id, request.Prompt);
                        }

                        returnedSessionId = session.Id;

                        // Save User Message
                        await _chatRepository.AddMessageAsync(new ChatMessage
                        {
                            Id = Guid.NewGuid(),
                            ChatSessionId = session.Id,
                            Content = request.Prompt,
                            Role = "user",
                            Timestamp = DateTime.UtcNow
                        });

                        // Save Bot Message
                        await _chatRepository.AddMessageAsync(new ChatMessage
                        {
                            Id = Guid.NewGuid(),
                            ChatSessionId = session.Id,
                            Content = answer,
                            Role = "model",
                            Timestamp = DateTime.UtcNow.AddSeconds(1)
                        });

                        _logger.LogInformation($"Saved messages to session {session.Id}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error saving chat history to database.");
                    // We still return the answer, but log the error
                }
            }

            return Ok(new { Answer = answer, SessionId = returnedSessionId });
        }

        private async Task<ChatSession> CreateNewSession(Guid userId, string firstPrompt)
        {
            var title = firstPrompt.Length > 30 ? firstPrompt.Substring(0, 30) + "..." : firstPrompt;
            var session = new ChatSession
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Title = title,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            return await _chatRepository.CreateSessionAsync(session);
        }
    }
}
