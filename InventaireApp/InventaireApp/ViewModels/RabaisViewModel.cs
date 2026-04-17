using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using InventaireApp.Data;
using InventaireApp.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.ObjectModel;

namespace InventaireApp.ViewModels;

public partial class RabaisViewModel : BaseViewModel
{
    private readonly AppDbContext _db;

    [ObservableProperty] private ObservableCollection<Rabais> _liste = new();
    [ObservableProperty] private Rabais? _selectionne;
    [ObservableProperty] private bool _modeEdition;

    [ObservableProperty] private string _editNom = string.Empty;
    [ObservableProperty] private string _editDescription = string.Empty;
    [ObservableProperty] private decimal _editPourcentage;
    [ObservableProperty] private DateTime? _editDateDebut;
    [ObservableProperty] private DateTime? _editDateFin;
    [ObservableProperty] private bool _editActif = true;

    public RabaisViewModel(AppDbContext db) => _db = db;

    public override async Task LoadAsync()
    {
        IsLoading = true;
        try
        {
            Liste = new ObservableCollection<Rabais>(
                await _db.Rabais.OrderBy(r => r.Pourcentage).ToListAsync());
        }
        finally { IsLoading = false; }
    }

    [RelayCommand]
    private void Nouveau()
    {
        Selectionne = null;
        EditNom = EditDescription = string.Empty;
        EditPourcentage = 0;
        EditDateDebut = EditDateFin = null;
        EditActif = true;
        ModeEdition = true;
    }

    [RelayCommand]
    private void Modifier()
    {
        if (Selectionne == null) return;
        EditNom = Selectionne.Nom;
        EditDescription = Selectionne.Description ?? string.Empty;
        EditPourcentage = Selectionne.Pourcentage;
        EditDateDebut = Selectionne.DateDebut;
        EditDateFin = Selectionne.DateFin;
        EditActif = Selectionne.Actif;
        ModeEdition = true;
    }

    [RelayCommand]
    private async Task Sauvegarder()
    {
        if (string.IsNullOrWhiteSpace(EditNom)) { StatusMessage = "Le nom est requis."; HasError = true; return; }
        HasError = false;

        if (Selectionne == null)
            _db.Rabais.Add(new Rabais { Nom = EditNom, Description = EditDescription, Pourcentage = EditPourcentage, DateDebut = EditDateDebut, DateFin = EditDateFin, Actif = EditActif });
        else
        {
            Selectionne.Nom = EditNom;
            Selectionne.Description = EditDescription;
            Selectionne.Pourcentage = EditPourcentage;
            Selectionne.DateDebut = EditDateDebut;
            Selectionne.DateFin = EditDateFin;
            Selectionne.Actif = EditActif;
        }

        await _db.SaveChangesAsync();
        ModeEdition = false;
        StatusMessage = "Rabais sauvegardé.";
        await LoadAsync();
    }

    [RelayCommand]
    private void Annuler() => ModeEdition = false;
}
