using Microsoft.EntityFrameworkCore;
using VolosCodex.Domain.Entities;

namespace VolosCodex.Infrastructure.Persistence
{
    public class VolosCodexDbContext : DbContext
    {
        public VolosCodexDbContext(DbContextOptions<VolosCodexDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<ChatSession> ChatSessions { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }

        // RPG Session Management
        public DbSet<Campaign> Campaigns { get; set; }
        public DbSet<CampaignPlayer> CampaignPlayers { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<SessionLog> SessionLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.GoogleId).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
            });

            modelBuilder.Entity<ChatSession>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User)
                      .WithMany(u => u.ChatSessions)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ChatMessage>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.ChatSession)
                      .WithMany(s => s.Messages)
                      .HasForeignKey(e => e.ChatSessionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Campaign Configuration
            modelBuilder.Entity<Campaign>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.GuildId, e.Name }).IsUnique(); // Unique name per guild
            });

            modelBuilder.Entity<CampaignPlayer>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Campaign)
                      .WithMany(c => c.Players)
                      .HasForeignKey(e => e.CampaignId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.CampaignId, e.CharacterName }).IsUnique();
            });

            modelBuilder.Entity<Session>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Campaign)
                      .WithMany(c => c.Sessions)
                      .HasForeignKey(e => e.CampaignId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.CampaignId, e.SessionNumber }).IsUnique();
            });

            modelBuilder.Entity<SessionLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Session)
                      .WithMany(s => s.Logs)
                      .HasForeignKey(e => e.SessionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
