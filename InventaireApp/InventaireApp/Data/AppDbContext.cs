using InventaireApp.Models;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace InventaireApp.Data;

public class AppDbContext : DbContext
{
    public DbSet<Produit> Produits { get; set; }
    public DbSet<Client> Clients { get; set; }
    public DbSet<Commande> Commandes { get; set; }
    public DbSet<LigneCommande> LignesCommande { get; set; }
    public DbSet<Rabais> Rabais { get; set; }
    public DbSet<CommandeFournisseur> CommandesFournisseur { get; set; }
    public DbSet<LigneCommandeFournisseur> LignesCommandeFournisseur { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        var dbFolder = Path.Combine(appData, "InventaireApp");
        Directory.CreateDirectory(dbFolder);
        var dbPath = Path.Combine(dbFolder, "inventaire.db");
        options.UseSqlite($"Data Source={dbPath}");
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Commande>()
            .HasOne(c => c.Client)
            .WithMany(cl => cl.Commandes)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LigneCommande>()
            .HasOne(l => l.Commande)
            .WithMany(c => c.LignesCommande)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LigneCommande>()
            .HasOne(l => l.Produit)
            .WithMany(p => p.LignesCommande)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CommandeFournisseur>()
            .HasOne(cf => cf.CommandeClient)
            .WithMany(c => c.CommandesFournisseur)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<LigneCommandeFournisseur>()
            .HasOne(l => l.CommandeFournisseur)
            .WithMany(cf => cf.Lignes)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
