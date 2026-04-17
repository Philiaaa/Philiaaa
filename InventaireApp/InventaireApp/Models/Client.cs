using System.ComponentModel.DataAnnotations;

namespace InventaireApp.Models;

public class Client
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Nom { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Prenom { get; set; }

    [MaxLength(200)]
    public string? Entreprise { get; set; }

    [MaxLength(150)]
    public string? Email { get; set; }

    [MaxLength(20)]
    public string? Telephone { get; set; }

    [MaxLength(300)]
    public string? Adresse { get; set; }

    [MaxLength(100)]
    public string? Ville { get; set; }

    [MaxLength(10)]
    public string? CodePostal { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public bool Actif { get; set; } = true;

    public DateTime DateCreation { get; set; } = DateTime.Now;

    public ICollection<Commande> Commandes { get; set; } = new List<Commande>();

    public string NomComplet => string.IsNullOrEmpty(Prenom) ? Nom : $"{Prenom} {Nom}";
    public string Affichage => string.IsNullOrEmpty(Entreprise) ? NomComplet : $"{NomComplet} ({Entreprise})";
}
