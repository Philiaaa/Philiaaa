namespace InventaireApp.Models;

public static class Taxes
{
    public const decimal TauxTPS = 0.05m;
    public const decimal TauxTVQ = 0.09975m;

    public static (decimal tps, decimal tvq, decimal total) Calculer(decimal montantAvantTaxes, bool sujetTaxes)
    {
        if (!sujetTaxes) return (0m, 0m, montantAvantTaxes);
        var tps = montantAvantTaxes * TauxTPS;
        var tvq = montantAvantTaxes * TauxTVQ;
        return (tps, tvq, montantAvantTaxes + tps + tvq);
    }
}
