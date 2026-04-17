namespace InventaireApp.Models;

public enum EtatCommande
{
    EnAttente = 0,
    Confirmee = 1,
    EnProduction = 2,
    Expediee = 3,
    Livree = 4,
    Annulee = 5
}

public enum EtatCommandeFournisseur
{
    Brouillon = 0,
    Envoyee = 1,
    Confirmee = 2,
    RecuePartielle = 3,
    RecueComplete = 4,
    Annulee = 5
}
