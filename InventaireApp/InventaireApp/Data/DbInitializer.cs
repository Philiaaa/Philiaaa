using InventaireApp.Models;

namespace InventaireApp.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        context.Database.EnsureCreated();

        if (context.Rabais.Any()) return;

        context.Rabais.AddRange(
            new Rabais { Nom = "Aucun rabais", Pourcentage = 0, Actif = true },
            new Rabais { Nom = "Rabais 5%", Pourcentage = 5, Actif = true },
            new Rabais { Nom = "Rabais 10%", Pourcentage = 10, Actif = true },
            new Rabais { Nom = "Rabais 15%", Pourcentage = 15, Actif = true }
        );

        context.SaveChanges();
    }
}
