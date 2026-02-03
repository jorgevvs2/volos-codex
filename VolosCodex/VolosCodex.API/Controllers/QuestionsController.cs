using Microsoft.AspNetCore.Mvc;
using VolosCodex.Application.Handlers;
using VolosCodex.Application.Requests;

namespace VolosCodex.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class QuestionsController : ControllerBase
    {
        private readonly QuestionHandler _questionHandler;

        public QuestionsController(QuestionHandler questionHandler)
        {
            _questionHandler = questionHandler;
        }

        [HttpPost]
        public async Task<IActionResult> AskQuestion([FromBody] QuestionRequest request)
        {
            var answer = await _questionHandler.HandleQuestionAsync(request.Prompt, request.System);
            return Ok(new { Answer = answer });
        }
    }
}
