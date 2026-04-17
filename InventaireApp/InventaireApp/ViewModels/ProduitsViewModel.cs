using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using InventaireApp.Data;
using InventaireApp.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.ObjectModel;

namespace InventaireApp.ViewModels;

public partial class ProduitsViewModel : BaseViewModel
{
    private readonly AppDbContext _db;

    [ObservableProperty]
    private ObservableCollection<Produit> _produits = new();

    [ObservableProperty]
    private Produit? _produitSelectionne;

    [ObservableProperty]
    private string _recherche = string.Empty;

    [ObservableProperty]
    private bool _modeEdition;

    // Champs d'édition
    [ObservableProperty] private string _editNom = string.Empty;
    [ObservableProperty] private string _editDescription = string.Empty;
    [ObservableProperty] private decimal _editPrix;
    [ObservableProperty] private string _editCouleur = string.Empty;
    [ObservableProperty] private string _editUniteMesure = string.Empty;
    [ObservableProperty] private int _editStock;
    [ObservableProperty] private bool _editSujetTaxes = true;
    [ObservableProperty] private bool _editActif = true;

    public ProduitsViewModel(AppDbContext db)
    {
        _db = db;
    }

    public override async Task LoadAsync()
    {
        IsLoading = true;
        try
        {
            var liste = await _db.Produits
                .Where(p => string.IsNullOrEmpty(Recherche) ||
                            p.Nom.Contains(Recherche) ||
                            (p.Description != null && p.Description.Contains(Recherche)))
                .OrderBy(p => p.Nom)
                .ToListAsync();
            Produits = new ObservableCollection<Produit>(liste);
        }
        finally { IsLoading = false; }
    }

    [RelayCommand]
    private async Task Rechercher() => await LoadAsync();

    [RelayCommand]
    private void Nouveau()
    {
        ProduitSelectionne = null;
        EditNom = string.Empty;
        EditDescription = string.Empty;
        EditPrix = 0;
        EditCouleur = string.Empty;
        EditUniteMesure = string.Empty;
        EditStock = 0;
        EditSujetTaxes = true;
        EditActif = true;
        ModeEdition = true;
    }

    [RelayCommand]
    private void Modifier()
    {
        if (ProduitSelectionne == null) return;
        EditNom = ProduitSelectionne.Nom;
        EditDescription = ProduitSelectionne.Description ?? string.Empty;
        EditPrix = ProduitSelectionne.Prix;
        EditCouleur = ProduitSelectionne.Couleur ?? string.Empty;
        EditUniteMesure = ProduitSelectionne.UniteMesure ?? string.Empty;
        EditStock = ProduitSelectionne.StockQuantite;
        EditSujetTaxes = ProduitSelectionne.SujetTaxes;
        EditActif = ProduitSelectionne.Actif;
        ModeEdition = true;
    }

    [RelayCommand]
    private async Task Sauvegarder()
    {
        if (string.IsNullOrWhiteSpace(EditNom))
        {
            StatusMessage = "Le nom du produit est requis.";
            HasError = true;
            return;
        }

        HasError = false;

        if (ProduitSelectionne == null)
        {
            var nouveau = new Produit
            {
                Nom = EditNom,
                Description = EditDescription,
                Prix = EditPrix,
                Couleur = EditCouleur,
                UniteMesure = EditUniteMesure,
                StockQuantite = EditStock,
                SujetTaxes = EditSujetTaxes,
                Actif = EditActif
            };
            _db.Produits.Add(nouveau);
        }
        else
        {
            ProduitSelectionne.Nom = EditNom;
            ProduitSelectionne.Description = EditDescription;
            ProduitSelectionne.Prix = EditPrix;
            ProduitSelectionne.Couleur = EditCouleur;
            ProduitSelectionne.UniteMesure = EditUniteMesure;
            ProduitSelectionne.StockQuantite = EditStock;
            ProduitSelectionne.SujetTaxes = EditSujetTaxes;
            ProduitSelectionne.Actif = EditActif;
        }

        await _db.SaveChangesAsync();
        ModeEdition = false;
        StatusMessage = "Produit sauvegardé.";
        await LoadAsync();
    }

    [RelayCommand]
    private void Annuler() => ModeEdition = false;

    [RelayCommand]
    private async Task Supprimer()
    {
        if (ProduitSelectionne == null) return;
        _db.Produits.Remove(ProduitSelectionne);
        await _db.SaveChangesAsync();
        StatusMessage = "Produit supprimé.";
        await LoadAsync();
    }
}
