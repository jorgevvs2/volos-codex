using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VolosCodex.Application.Services;
using VolosCodex.Domain.Interfaces;

namespace VolosCodex.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Note: Nginx maps /api/ to root, so this might be accessible via /api/api/Chat if not careful.
                                // But since QuestionsController is at /[controller], let's stick to that convention.
    [Route("[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatRepository _chatRepository;
        private readonly AuthService _authService;

        public ChatController(IChatRepository chatRepository, AuthService authService)
        {
            _chatRepository = chatRepository;
            _authService = authService;
        }

        [HttpGet("sessions")]
        public async Task<IActionResult> GetSessions()
        {
            var googleId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(googleId)) return Unauthorized();

            var user = await _authService.GetOrCreateUserAsync(googleId, "", "");
            var sessions = await _chatRepository.GetSessionsByUserIdAsync(user.Id);

            return Ok(sessions.Select(s => new
            {
                s.Id,
                s.Title,
                s.UpdatedAt
            }));
        }

        [HttpGet("sessions/{id}")]
        public async Task<IActionResult> GetSession(Guid id)
        {
            var googleId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(googleId)) return Unauthorized();

            var user = await _authService.GetOrCreateUserAsync(googleId, "", "");
            var session = await _chatRepository.GetSessionByIdAsync(id, user.Id);

            if (session == null) return NotFound();

            return Ok(new
            {
                session.Id,
                session.Title,
                Messages = session.Messages.Select(m => new
                {
                    m.Id,
                    Text = m.Content,
                    Sender = m.Role == "user" ? "user" : "bot",
                    Timestamp = m.Timestamp
                })
            });
        }
    }
}
