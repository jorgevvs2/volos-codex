using VolosCodex.Domain;
using VolosCodex.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace VolosCodex.Infrastructure.Persistence
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(VolosCodexDbContext context)
        {
            if (context.Campaigns.Any()) return;

            Console.WriteLine("Seeding database with all sessions (1-10)...");

            var campaignId = Guid.NewGuid();
            var campaign = new Campaign
            {
                Id = campaignId,
                Name = "A Maldição de Strahd",
                Description = "Uma aventura gótica em Barovia onde o grupo enfrenta o conde vampiro Strahd von Zarovich.",
                GuildId = "default-guild",
                GameMasterId = "jorgevinicius9@gmail.com",
                System = RpgSystem.DnD5,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var players = new List<CampaignPlayer>
            {
                new CampaignPlayer { Id = Guid.NewGuid(), CampaignId = campaignId, CharacterName = "Ambrael", PlayerName = "Player" },
                new CampaignPlayer { Id = Guid.NewGuid(), CampaignId = campaignId, CharacterName = "Frederick", PlayerName = "Player" },
                new CampaignPlayer { Id = Guid.NewGuid(), CampaignId = campaignId, CharacterName = "Kairos", PlayerName = "Player" },
                new CampaignPlayer { Id = Guid.NewGuid(), CampaignId = campaignId, CharacterName = "Mordrek", PlayerName = "Player" },
                new CampaignPlayer { Id = Guid.NewGuid(), CampaignId = campaignId, CharacterName = "Will", PlayerName = "Player" }
            };

            var sessions = new List<Session>();
            var allLogs = new List<SessionLog>();

            // --- SESSÃO 1: Adentrando as Brumas ---
            var s1Id = Guid.NewGuid();
            sessions.Add(new Session { Id = s1Id, CampaignId = campaignId, SessionNumber = 1, Title = "Adentrando as Brumas", Description = "Encontro com os Vistani e o convite suspeito.", Date = DateTime.UtcNow.AddDays(-70) });
            allLogs.AddRange(CreateLogs(s1Id, "Ambrael", 11, 16, 26, 2));
            allLogs.AddRange(CreateLogs(s1Id, "Frederick", 14, 34, 0, 0, 1, 1, 1));
            allLogs.AddRange(CreateLogs(s1Id, "Kairos", 65, 14, 2, 1, 1, 2, 2));
            allLogs.AddRange(CreateLogs(s1Id, "Mordrek", 18, 16, 7, 1, 1, 0, 1));
            allLogs.AddRange(CreateLogs(s1Id, "Will", 32, 13, 3, 0, 0, 1, 1));

            // --- SESSÃO 2: A Casa da Morte ---
            var s2Id = Guid.NewGuid();
            sessions.Add(new Session { Id = s2Id, CampaignId = campaignId, SessionNumber = 2, Title = "A Casa da Morte", Description = "Exploração do casarão sombrio em Baróvia.", Date = DateTime.UtcNow.AddDays(-63) });
            allLogs.AddRange(CreateLogs(s2Id, "Ambrael", 12, 14, 16, 0, 1));
            allLogs.AddRange(CreateLogs(s2Id, "Frederick", 26, 35, 0, 0, 0, 2, 1));
            allLogs.AddRange(CreateLogs(s2Id, "Kairos", 64, 10, 1, 1, 1, 3, 0));
            allLogs.AddRange(CreateLogs(s2Id, "Mordrek", 24, 23, 2));
            allLogs.AddRange(CreateLogs(s2Id, "Will", 33, 19, 1, 2, 1, 2, 0));

            // --- SESSÃO 3: O Fim da Maldição ---
            var s3Id = Guid.NewGuid();
            sessions.Add(new Session { Id = s3Id, CampaignId = campaignId, SessionNumber = 3, Title = "O Fim da Maldição", Description = "Ritual sangrento e a fuga da mansão.", Date = DateTime.UtcNow.AddDays(-56) });
            allLogs.AddRange(CreateLogs(s3Id, "Ambrael", 8, 19, 27));
            allLogs.AddRange(CreateLogs(s3Id, "Frederick", 29, 25, 0, 0, 0, 2));
            allLogs.AddRange(CreateLogs(s3Id, "Kairos", 49, 19, 1, 0, 0, 0, 1));
            allLogs.AddRange(CreateLogs(s3Id, "Mordrek", 17, 21, 8, 0, 0, 0, 3));
            allLogs.AddRange(CreateLogs(s3Id, "Will", 36, 32, 3, 0, 1, 1, 1));

            // --- SESSÃO 4: O Vilarejo Amaldiçoado ---
            var s4Id = Guid.NewGuid();
            sessions.Add(new Session { Id = s4Id, CampaignId = campaignId, SessionNumber = 4, Title = "O Vilarejo Amaldiçoado", Description = "Enterro do burgomestre e encontro com Ismark.", Date = DateTime.UtcNow.AddDays(-49) });
            allLogs.AddRange(CreateLogs(s4Id, "Ambrael", 11, 19, 30, 3));
            allLogs.AddRange(CreateLogs(s4Id, "Frederick", 24, 30, 0, 0, 0, 0, 1));
            allLogs.AddRange(CreateLogs(s4Id, "Kairos", 61, 14, 3, 0, 0, 4, 2));
            allLogs.AddRange(CreateLogs(s4Id, "Mordrek", 21, 25, 3, 1, 1, 1));
            allLogs.AddRange(CreateLogs(s4Id, "Will", 38, 25, 0, 2, 0, 0, 2));

            // --- SESSÃO 5: Rumo a Valaki ---
            var s5Id = Guid.NewGuid();
            sessions.Add(new Session { Id = s5Id, CampaignId = campaignId, SessionNumber = 5, Title = "Rumo a Valaki", Description = "Leitura das cartas de Tarokka e o moinho.", Date = DateTime.UtcNow.AddDays(-42) });
            allLogs.AddRange(CreateLogs(s5Id, "Ambrael", 18, 16, 27, 1, 1, 0, 1));
            allLogs.AddRange(CreateLogs(s5Id, "Frederick", 21, 39, 0, 2, 2, 2, 1));
            allLogs.AddRange(CreateLogs(s5Id, "Kairos", 59, 17, 2, 3, 0, 1));
            allLogs.AddRange(CreateLogs(s5Id, "Mordrek", 22, 20, 4, 1, 1, 0, 2));
            allLogs.AddRange(CreateLogs(s5Id, "Will", 28, 13, 1, 0, 0, 3, 1));

            // --- SESSÃO 6: O Moinho de Vento ---
            var s6Id = Guid.NewGuid();
            sessions.Add(new Session { Id = s6Id, CampaignId = campaignId, SessionNumber = 6, Title = "O Moinho de Vento", Description = "O perigo das bruxas padeiras.", Date = DateTime.UtcNow.AddDays(-35) });
            allLogs.AddRange(CreateLogs(s6Id, "Ambrael", 18, 16, 27, 1));
            allLogs.AddRange(CreateLogs(s6Id, "Frederick", 31, 32, 0, 1, 1, 1, 2));
            allLogs.AddRange(CreateLogs(s6Id, "Kairos", 69, 16, 2, 0, 0, 1, 1));
            allLogs.AddRange(CreateLogs(s6Id, "Mordrek", 27, 26, 9, 0, 1));
            allLogs.AddRange(CreateLogs(s6Id, "Will", 30, 20, 2, 2, 0, 0, 1));

            // --- SESSÃO 7: A Cidade de Valaki ---
            var s7Id = Guid.NewGuid();
            sessions.Add(new Session { Id = s7Id, CampaignId = campaignId, SessionNumber = 7, Title = "A cidade de valaki", Description = "Exploração inicial de Vallaki e encontro com Strahd.", Date = DateTime.UtcNow.AddDays(-28) });
            allLogs.AddRange(CreateLogs(s7Id, "Ambrael", 0, 0, 0, 0, 0, 0, 1)); // Apenas 1 falha

            // --- SESSÃO 8: O Orfanato e o Encontro ---
            var s8Id = Guid.NewGuid();
            sessions.Add(new Session { Id = s8Id, CampaignId = campaignId, SessionNumber = 8, Title = "O Orfanato e o Encontro", Description = "Igreja profanada e conexões impossíveis no orfanato.", Date = DateTime.UtcNow.AddDays(-21) });
            allLogs.AddRange(CreateLogs(s8Id, "Ambrael", 0, 0, 10, 0, 0, 1, 0)); // Cura e Crítico
            allLogs.AddRange(CreateLogs(s8Id, "Frederick", 0, 0, 0, 0, 0, 0, 1)); // Falha
            allLogs.AddRange(CreateLogs(s8Id, "Will", 0, 0, 0, 0, 0, 1, 0)); // Crítico

            // --- SESSÃO 10: Purificando o Orfanato ---
            var s10Id = Guid.NewGuid();
            sessions.Add(new Session { Id = s10Id, CampaignId = campaignId, SessionNumber = 10, Title = "Purificando o Orfanato", Description = "O fim da maldição que afligia o orfanato.", Date = DateTime.UtcNow.AddDays(-7) });
            allLogs.AddRange(CreateLogs(s10Id, "Ambrael", 1, 9, 8));
            allLogs.AddRange(CreateLogs(s10Id, "Frederick", 52, 31, 0, 0, 0, 3));
            allLogs.AddRange(CreateLogs(s10Id, "Kairos", 61, 0, 0, 0, 0, 2));
            allLogs.AddRange(CreateLogs(s10Id, "Mordrek", 54));
            allLogs.AddRange(CreateLogs(s10Id, "Will", 48, 0, 0, 0, 0, 1));

            await context.Campaigns.AddAsync(campaign);
            await context.CampaignPlayers.AddRangeAsync(players);
            await context.Sessions.AddRangeAsync(sessions);
            await context.SessionLogs.AddRangeAsync(allLogs);
            await context.SaveChangesAsync();

            Console.WriteLine("Database seeded successfully.");
        }

        private static List<SessionLog> CreateLogs(Guid sessionId, string name, int danoC = 0, int danoR = 0, int cura = 0, int elim = 0, int caiu = 0, int crit = 0, int falha = 0)
        {
            var logs = new List<SessionLog>();
            var now = DateTime.UtcNow;

            if (danoC > 0) logs.Add(new SessionLog { Id = Guid.NewGuid(), SessionId = sessionId, CharacterName = name, Action = "causado", Amount = danoC, Timestamp = now });
            if (danoR > 0) logs.Add(new SessionLog { Id = Guid.NewGuid(), SessionId = sessionId, CharacterName = name, Action = "recebido", Amount = danoR, Timestamp = now });
            if (cura > 0) logs.Add(new SessionLog { Id = Guid.NewGuid(), SessionId = sessionId, CharacterName = name, Action = "cura", Amount = cura, Timestamp = now });
            if (elim > 0) logs.Add(new SessionLog { Id = Guid.NewGuid(), SessionId = sessionId, CharacterName = name, Action = "eliminacao", Amount = elim, Timestamp = now });
            if (caiu > 0) logs.Add(new SessionLog { Id = Guid.NewGuid(), SessionId = sessionId, CharacterName = name, Action = "jogador_caido", Amount = caiu, Timestamp = now });
            if (crit > 0) logs.Add(new SessionLog { Id = Guid.NewGuid(), SessionId = sessionId, CharacterName = name, Action = "critico_sucesso", Amount = crit, Timestamp = now });
            if (falha > 0) logs.Add(new SessionLog { Id = Guid.NewGuid(), SessionId = sessionId, CharacterName = name, Action = "critico_falha", Amount = falha, Timestamp = now });

            return logs;
        }
    }
}