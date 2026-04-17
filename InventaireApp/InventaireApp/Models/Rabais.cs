using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventaireApp.Models;

public class Rabais
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Nom { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? Description { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal Pourcentage { get; set; }

    public DateTime? DateDebut { get; set; }
    public DateTime? DateFin { get; set; }

    public bool Actif { get; set; } = true;

    public bool EstValide(DateTime date) =>
        Actif &&
        (DateDebut == null || date >= DateDebut) &&
        (DateFin == null || date <= DateFin);
}
