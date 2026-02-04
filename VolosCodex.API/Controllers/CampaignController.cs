using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VolosCodex.Application.Requests;
using VolosCodex.Application.Services;

namespace VolosCodex.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CampaignController : ControllerBase
    {
        private readonly CampaignService _campaignService;

        public CampaignController(CampaignService campaignService)
        {
            _campaignService = campaignService;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateCampaign([FromBody] CreateCampaignRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var email = User.FindFirst(ClaimTypes.Email)?.Value;

                // Use provided GameMasterId or fallback to current user
                var gameMasterId = !string.IsNullOrEmpty(request.GameMasterId)
                    ? request.GameMasterId
                    : (email ?? userId ?? "unknown");

                var campaign = await _campaignService.CreateCampaignAsync(request.GuildId, request.Name, request.System, gameMasterId);
                return Ok(campaign);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpGet("{guildId}")]
        public async Task<IActionResult> GetCampaigns(string guildId)
        {
            var campaigns = await _campaignService.GetCampaignsAsync(guildId);
            return Ok(campaigns);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllCampaigns()
        {
            var campaigns = await _campaignService.GetAllCampaignsAsync();
            return Ok(campaigns);
        }

        [HttpGet("details/{campaignId}")]
        public async Task<IActionResult> GetCampaign(Guid campaignId)
        {
            var campaign = await _campaignService.GetCampaignByIdAsync(campaignId);
            if (campaign == null) return NotFound();
            return Ok(campaign);
        }

        [HttpDelete("{campaignId}")]
        [Authorize]
        public async Task<IActionResult> DeleteCampaign(Guid campaignId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var currentUser = email ?? userId;

            var campaign = await _campaignService.GetCampaignByIdAsync(campaignId);
            if (campaign == null) return NotFound();

            if (campaign.GameMasterId != currentUser && campaign.GameMasterId != "unknown" && !string.IsNullOrEmpty(campaign.GameMasterId))
            {
                return Forbid();
            }

            await _campaignService.DeleteCampaignAsync(campaignId);
            return Ok();
        }

        [HttpPost("active")]
        public async Task<IActionResult> SetActiveCampaign([FromBody] SetActiveCampaignRequest request)
        {
            await _campaignService.SetActiveCampaignAsync(request.GuildId, request.CampaignId);
            return Ok();
        }

        [HttpGet("{guildId}/active")]
        public async Task<IActionResult> GetActiveCampaign(string guildId)
        {
            var campaign = await _campaignService.GetActiveCampaignAsync(guildId);
            if (campaign == null) return NotFound();
            return Ok(campaign);
        }

        [HttpPost("players")]
        public async Task<IActionResult> AddPlayer([FromBody] AddPlayerRequest request)
        {
            await _campaignService.AddPlayerAsync(request.CampaignId, request.CharacterName);
            return Ok();
        }

        [HttpDelete("players/{campaignId}/{characterName}")]
        public async Task<IActionResult> RemovePlayer(Guid campaignId, string characterName)
        {
            await _campaignService.RemovePlayerAsync(campaignId, characterName);
            return Ok();
        }

        [HttpGet("players/{campaignId}")]
        public async Task<IActionResult> GetPlayers(Guid campaignId)
        {
            var players = await _campaignService.GetPlayersAsync(campaignId);
            return Ok(players);
        }
    }
}
