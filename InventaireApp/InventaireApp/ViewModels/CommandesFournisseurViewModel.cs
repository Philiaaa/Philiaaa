using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using InventaireApp.Data;
using InventaireApp.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.ObjectModel;

namespace InventaireApp.ViewModels;

public partial class CommandesFournisseurViewModel : BaseViewModel
{
    private readonly AppDbContext _db;

    [ObservableProperty]
    private ObservableCollection<CommandeFournisseur> _commandes = new();

    [ObservableProperty]
    private CommandeFournisseur? _commandeSelectionnee;

    [ObservableProperty]
    private ObservableCollection<Commande> _commandesClients = new();

    [ObservableProperty]
    private ObservableCollection<Produit> _produits = new();

    [ObservableProperty]
    private bool _modeEdition;

    [ObservableProperty] private int? _editCommandeClientId;
    [ObservableProperty] private string _editFournisseur = string.Empty;
    [ObservableProperty] private string _editNumeroCommande = string.Empty;
    [ObservableProperty] private DateTime _editDateCommande = DateTime.Now;
    [ObservableProperty] private DateTime? _editDateReceptionPrevue;
    [ObservableProperty] private EtatCommandeFournisseur _editEtat = EtatCommandeFournisseur.Brouillon;
    [ObservableProperty] private string _editNotes = string.Empty;

    [ObservableProperty]
    private ObservableCollection<LigneCommandeFournisseur> _lignes = new();

    [ObservableProperty] private int _nouvelleLigneProduitId;
    [ObservableProperty] private int _nouvelleLigneQuantite = 1;
    [ObservableProperty] private decimal _nouvelleLignePrix;

    public IEnumerable<EtatCommandeFournisseur> Etats =>
        Enum.GetValues<EtatCommandeFournisseur>();

    public CommandesFournisseurViewModel(AppDbContext db) => _db = db;

    public override async Task LoadAsync()
    {
        IsLoading = true;
        try
        {
            Commandes = new ObservableCollection<CommandeFournisseur>(
                await _db.CommandesFournisseur
                    .Include(cf => cf.CommandeClient).ThenInclude(c => c!.Client)
                    .Include(cf => cf.Lignes).ThenInclude(l => l.Produit)
                    .OrderByDescending(cf => cf.DateCommande)
                    .ToListAsync());

            CommandesClients = new ObservableCollection<Commande>(
                await _db.Commandes
                    .Include(c => c.Client)
                    .Where(c => c.Etat != EtatCommande.Annulee)
                    .OrderByDescending(c => c.DateCommande)
                    .ToListAsync());

            Produits = new ObservableCollection<Produit>(
                await _db.Produits.Where(p => p.Actif).OrderBy(p => p.Nom).ToListAsync());
        }
        finally { IsLoading = false; }
    }

    [RelayCommand]
    private void Nouvelle()
    {
        CommandeSelectionnee = null;
        EditCommandeClientId = null;
        EditFournisseur = EditNumeroCommande = EditNotes = string.Empty;
        EditDateCommande = DateTime.Now;
        EditDateReceptionPrevue = null;
        EditEtat = EtatCommandeFournisseur.Brouillon;
        Lignes.Clear();
        ModeEdition = true;
    }

    [RelayCommand]
    private async Task CreerDepuisCommandeClient(Commande? commande)
    {
        if (commande == null) return;

        var commandeAvecLignes = await _db.Commandes
            .Include(c => c.LignesCommande).ThenInclude(l => l.Produit)
            .FirstOrDefaultAsync(c => c.Id == commande.Id);

        if (commandeAvecLignes == null) return;

        EditCommandeClientId = commandeAvecLignes.Id;
        EditFournisseur = string.Empty;
        EditDateCommande = DateTime.Now;
        EditEtat = EtatCommandeFournisseur.Brouillon;
        EditNotes = $"Généré depuis commande #{commandeAvecLignes.Id}";

        Lignes.Clear();
        foreach (var ligne in commandeAvecLignes.LignesCommande)
        {
            Lignes.Add(new LigneCommandeFournisseur
            {
                ProduitId = ligne.ProduitId,
                Produit = ligne.Produit,
                Quantite = ligne.Quantite,
                PrixUnitaire = ligne.Produit.Prix
            });
        }
        ModeEdition = true;
    }

    [RelayCommand]
    private void AjouterLigne()
    {
        var produit = Produits.FirstOrDefault(p => p.Id == NouvelleLigneProduitId);
        if (produit == null) return;
        Lignes.Add(new LigneCommandeFournisseur
        {
            ProduitId = produit.Id,
            Produit = produit,
            Quantite = NouvelleLigneQuantite,
            PrixUnitaire = NouvelleLignePrix > 0 ? NouvelleLignePrix : produit.Prix
        });
    }

    [RelayCommand]
    private void SupprimerLigne(LigneCommandeFournisseur ligne) => Lignes.Remove(ligne);

    [RelayCommand]
    private async Task Sauvegarder()
    {
        if (!Lignes.Any()) { StatusMessage = "Ajoutez au moins un produit."; HasError = true; return; }
        HasError = false;

        CommandeFournisseur cf;
        if (CommandeSelectionnee == null)
        {
            cf = new CommandeFournisseur();
            _db.CommandesFournisseur.Add(cf);
        }
        else
        {
            cf = CommandeSelectionnee;
            _db.LignesCommandeFournisseur.RemoveRange(cf.Lignes);
        }

        cf.CommandeClientId = EditCommandeClientId;
        cf.NomFournisseur = EditFournisseur;
        cf.NumeroCommandeFournisseur = EditNumeroCommande;
        cf.DateCommande = EditDateCommande;
        cf.DateReceptionPrevue = EditDateReceptionPrevue;
        cf.Etat = EditEtat;
        cf.Notes = EditNotes;

        foreach (var l in Lignes)
        {
            _db.LignesCommandeFournisseur.Add(new LigneCommandeFournisseur
            {
                CommandeFournisseur = cf,
                ProduitId = l.ProduitId,
                Quantite = l.Quantite,
                PrixUnitaire = l.PrixUnitaire
            });
        }

        await _db.SaveChangesAsync();
        ModeEdition = false;
        StatusMessage = "Commande fournisseur sauvegardée.";
        await LoadAsync();
    }

    [RelayCommand]
    private void Annuler() => ModeEdition = false;
}
