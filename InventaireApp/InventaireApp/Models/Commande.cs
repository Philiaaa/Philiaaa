using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventaireApp.Models;

public class Commande
{
    [Key]
    public int Id { get; set; }

    public int ClientId { get; set; }
    public Client Client { get; set; } = null!;

    public DateTime DateCommande { get; set; } = DateTime.Now;

    public DateTime? DateLivraisonSouhaitee { get; set; }
    public DateTime? DateLivraisonReelle { get; set; }

    public EtatCommande Etat { get; set; } = EtatCommande.EnAttente;

    [MaxLength(100)]
    public string? Couleur { get; set; }

    [MaxLength(200)]
    public string? NumeroReference { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public ICollection<LigneCommande> LignesCommande { get; set; } = new List<LigneCommande>();
    public ICollection<CommandeFournisseur> CommandesFournisseur { get; set; } = new List<CommandeFournisseur>();

    [NotMapped]
    public decimal SousTotal => LignesCommande.Sum(l => l.TotalAvantTaxes);

    [NotMapped]
    public decimal TPS => LignesCommande
        .Where(l => l.Produit?.SujetTaxes == true)
        .Sum(l => l.TotalAvantTaxes) * Taxes.TauxTPS;

    [NotMapped]
    public decimal TVQ => LignesCommande
        .Where(l => l.Produit?.SujetTaxes == true)
        .Sum(l => l.TotalAvantTaxes) * Taxes.TauxTVQ;

    [NotMapped]
    public decimal TotalAvecTaxes => SousTotal + TPS + TVQ;
}
