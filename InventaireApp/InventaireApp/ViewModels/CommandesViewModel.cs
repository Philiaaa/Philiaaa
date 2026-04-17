using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using InventaireApp.Data;
using InventaireApp.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.ObjectModel;

namespace InventaireApp.ViewModels;

public partial class CommandesViewModel : BaseViewModel
{
    private readonly AppDbContext _db;

    [ObservableProperty]
    private ObservableCollection<Commande> _commandes = new();

    [ObservableProperty]
    private Commande? _commandeSelectionnee;

    [ObservableProperty]
    private ObservableCollection<LigneCommande> _lignes = new();

    [ObservableProperty]
    private ObservableCollection<Client> _clients = new();

    [ObservableProperty]
    private ObservableCollection<Produit> _produits = new();

    [ObservableProperty]
    private ObservableCollection<Rabais> _rabaisDisponibles = new();

    [ObservableProperty]
    private string _recherche = string.Empty;

    [ObservableProperty]
    private EtatCommande? _filtreEtat;

    [ObservableProperty]
    private bool _modeEdition;

    // Champs entête commande
    [ObservableProperty] private int _editClientId;
    [ObservableProperty] private DateTime _editDateCommande = DateTime.Now;
    [ObservableProperty] private DateTime? _editDateLivraison;
    [ObservableProperty] private EtatCommande _editEtat = EtatCommande.EnAttente;
    [ObservableProperty] private string _editCouleur = string.Empty;
    [ObservableProperty] private string _editReference = string.Empty;
    [ObservableProperty] private string _editNotes = string.Empty;

    // Ligne en cours d'ajout
    [ObservableProperty] private int _nouvelleLigneProduitId;
    [ObservableProperty] private int _nouvelleLigneQuantite = 1;
    [ObservableProperty] private decimal _nouvelleLignePrix;
    [ObservableProperty] private int? _nouvelleLigneRabaisId;

    // Totaux calculés
    [ObservableProperty] private decimal _sousTotal;
    [ObservableProperty] private decimal _totalTPS;
    [ObservableProperty] private decimal _totalTVQ;
    [ObservableProperty] private decimal _grandTotal;

    public IEnumerable<EtatCommande> EtatsCommande =>
        Enum.GetValues<EtatCommande>();

    public CommandesViewModel(AppDbContext db) => _db = db;

    public override async Task LoadAsync()
    {
        IsLoading = true;
        try
        {
            var query = _db.Commandes
                .Include(c => c.Client)
                .Include(c => c.LignesCommande)
                    .ThenInclude(l => l.Produit)
                .AsQueryable();

            if (!string.IsNullOrEmpty(Recherche))
                query = query.Where(c =>
                    c.Client.Nom.Contains(Recherche) ||
                    (c.NumeroReference != null && c.NumeroReference.Contains(Recherche)));

            if (FiltreEtat.HasValue)
                query = query.Where(c => c.Etat == FiltreEtat.Value);

            var liste = await query.OrderByDescending(c => c.DateCommande).ToListAsync();
            Commandes = new ObservableCollection<Commande>(liste);

            Clients = new ObservableCollection<Client>(
                await _db.Clients.Where(c => c.Actif).OrderBy(c => c.Nom).ToListAsync());

            Produits = new ObservableCollection<Produit>(
                await _db.Produits.Where(p => p.Actif).OrderBy(p => p.Nom).ToListAsync());

            RabaisDisponibles = new ObservableCollection<Rabais>(
                await _db.Rabais.Where(r => r.Actif).ToListAsync());
        }
        finally { IsLoading = false; }
    }

    partial void OnCommandeSelectionneeChanged(Commande? value)
    {
        if (value == null) { Lignes.Clear(); return; }
        Lignes = new ObservableCollection<LigneCommande>(value.LignesCommande);
        RecalculerTotaux();
    }

    [RelayCommand]
    private async Task Rechercher() => await LoadAsync();

    [RelayCommand]
    private void NouvelleCommande()
    {
        CommandeSelectionnee = null;
        EditClientId = 0;
        EditDateCommande = DateTime.Now;
        EditDateLivraison = null;
        EditEtat = EtatCommande.EnAttente;
        EditCouleur = EditReference = EditNotes = string.Empty;
        Lignes.Clear();
        RecalculerTotaux();
        ModeEdition = true;
    }

    [RelayCommand]
    private void ModifierCommande()
    {
        if (CommandeSelectionnee == null) return;
        EditClientId = CommandeSelectionnee.ClientId;
        EditDateCommande = CommandeSelectionnee.DateCommande;
        EditDateLivraison = CommandeSelectionnee.DateLivraisonSouhaitee;
        EditEtat = CommandeSelectionnee.Etat;
        EditCouleur = CommandeSelectionnee.Couleur ?? string.Empty;
        EditReference = CommandeSelectionnee.NumeroReference ?? string.Empty;
        EditNotes = CommandeSelectionnee.Notes ?? string.Empty;
        Lignes = new ObservableCollection<LigneCommande>(CommandeSelectionnee.LignesCommande);
        ModeEdition = true;
    }

    [RelayCommand]
    private void AjouterLigne()
    {
        var produit = Produits.FirstOrDefault(p => p.Id == NouvelleLigneProduitId);
        if (produit == null) return;

        var rabais = RabaisDisponibles.FirstOrDefault(r => r.Id == NouvelleLigneRabaisId);
        var ligne = new LigneCommande
        {
            ProduitId = produit.Id,
            Produit = produit,
            Quantite = NouvelleLigneQuantite,
            PrixUnitaire = NouvelleLignePrix > 0 ? NouvelleLignePrix : produit.Prix,
            RabaisId = NouvelleLigneRabaisId,
            Rabais = rabais,
            RabaisPourcentage = rabais?.Pourcentage ?? 0
        };
        Lignes.Add(ligne);
        RecalculerTotaux();
    }

    [RelayCommand]
    private void SupprimerLigne(LigneCommande ligne)
    {
        Lignes.Remove(ligne);
        RecalculerTotaux();
    }

    private void RecalculerTotaux()
    {
        SousTotal = Lignes.Sum(l => l.TotalAvantTaxes);
        TotalTPS = Lignes.Where(l => l.Produit?.SujetTaxes == true)
                         .Sum(l => l.TotalAvantTaxes) * Taxes.TauxTPS;
        TotalTVQ = Lignes.Where(l => l.Produit?.SujetTaxes == true)
                         .Sum(l => l.TotalAvantTaxes) * Taxes.TauxTVQ;
        GrandTotal = SousTotal + TotalTPS + TotalTVQ;
    }

    [RelayCommand]
    private async Task Sauvegarder()
    {
        if (EditClientId == 0) { StatusMessage = "Veuillez sélectionner un client."; HasError = true; return; }
        if (!Lignes.Any()) { StatusMessage = "Ajoutez au moins un produit."; HasError = true; return; }
        HasError = false;

        Commande commande;
        if (CommandeSelectionnee == null)
        {
            commande = new Commande();
            _db.Commandes.Add(commande);
        }
        else
        {
            commande = CommandeSelectionnee;
            _db.LignesCommande.RemoveRange(commande.LignesCommande);
        }

        commande.ClientId = EditClientId;
        commande.DateCommande = EditDateCommande;
        commande.DateLivraisonSouhaitee = EditDateLivraison;
        commande.Etat = EditEtat;
        commande.Couleur = EditCouleur;
        commande.NumeroReference = EditReference;
        commande.Notes = EditNotes;

        foreach (var ligne in Lignes)
        {
            ligne.CommandeId = commande.Id;
            _db.LignesCommande.Add(new LigneCommande
            {
                Quantite = ligne.Quantite,
                PrixUnitaire = ligne.PrixUnitaire,
                ProduitId = ligne.ProduitId,
                RabaisId = ligne.RabaisId,
                RabaisPourcentage = ligne.RabaisPourcentage,
                Notes = ligne.Notes
            });
        }

        await _db.SaveChangesAsync();
        ModeEdition = false;
        StatusMessage = "Commande sauvegardée.";
        await LoadAsync();
    }

    [RelayCommand]
    private void Annuler() => ModeEdition = false;
}
