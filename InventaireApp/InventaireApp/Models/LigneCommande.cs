using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventaireApp.Models;

public class LigneCommande
{
    [Key]
    public int Id { get; set; }

    public int CommandeId { get; set; }
    public Commande Commande { get; set; } = null!;

    public int ProduitId { get; set; }
    public Produit Produit { get; set; } = null!;

    public int Quantite { get; set; } = 1;

    [Column(TypeName = "decimal(18,2)")]
    public decimal PrixUnitaire { get; set; }

    public int? RabaisId { get; set; }
    public Rabais? Rabais { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal RabaisPourcentage { get; set; } = 0;

    [MaxLength(500)]
    public string? Notes { get; set; }

    [NotMapped]
    public decimal SousTotal => PrixUnitaire * Quantite;

    [NotMapped]
    public decimal MontantRabais => SousTotal * (RabaisPourcentage / 100m);

    [NotMapped]
    public decimal TotalAvantTaxes => SousTotal - MontantRabais;
}
