using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventaireApp.Models;

public class CommandeFournisseur
{
    [Key]
    public int Id { get; set; }

    public int? CommandeClientId { get; set; }
    public Commande? CommandeClient { get; set; }

    [MaxLength(200)]
    public string? NomFournisseur { get; set; }

    [MaxLength(200)]
    public string? NumeroCommandeFournisseur { get; set; }

    public DateTime DateCommande { get; set; } = DateTime.Now;
    public DateTime? DateReceptionPrevue { get; set; }
    public DateTime? DateReceptionReelle { get; set; }

    public EtatCommandeFournisseur Etat { get; set; } = EtatCommandeFournisseur.Brouillon;

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public ICollection<LigneCommandeFournisseur> Lignes { get; set; } = new List<LigneCommandeFournisseur>();

    [NotMapped]
    public decimal TotalCommande => Lignes.Sum(l => l.PrixUnitaire * l.Quantite);
}

public class LigneCommandeFournisseur
{
    [Key]
    public int Id { get; set; }

    public int CommandeFournisseurId { get; set; }
    public CommandeFournisseur CommandeFournisseur { get; set; } = null!;

    public int ProduitId { get; set; }
    public Produit Produit { get; set; } = null!;

    public int Quantite { get; set; } = 1;

    [Column(TypeName = "decimal(18,2)")]
    public decimal PrixUnitaire { get; set; }

    public int QuantiteRecue { get; set; } = 0;
}
