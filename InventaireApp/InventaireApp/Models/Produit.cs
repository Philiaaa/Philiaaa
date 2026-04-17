using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventaireApp.Models;

public class Produit
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Nom { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Prix { get; set; }

    [MaxLength(100)]
    public string? Couleur { get; set; }

    [MaxLength(50)]
    public string? UniteMesure { get; set; }

    public int StockQuantite { get; set; }

    /// <summary>
    /// TPS (5%) + TVQ (9.975%) applicables si vrai
    /// </summary>
    public bool SujetTaxes { get; set; } = true;

    public bool Actif { get; set; } = true;

    public DateTime DateCreation { get; set; } = DateTime.Now;

    public ICollection<LigneCommande> LignesCommande { get; set; } = new List<LigneCommande>();
}
