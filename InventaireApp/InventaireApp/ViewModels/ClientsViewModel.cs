using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using InventaireApp.Data;
using InventaireApp.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.ObjectModel;

namespace InventaireApp.ViewModels;

public partial class ClientsViewModel : BaseViewModel
{
    private readonly AppDbContext _db;

    [ObservableProperty]
    private ObservableCollection<Client> _clients = new();

    [ObservableProperty]
    private Client? _clientSelectionne;

    [ObservableProperty]
    private string _recherche = string.Empty;

    [ObservableProperty]
    private bool _modeEdition;

    [ObservableProperty] private string _editNom = string.Empty;
    [ObservableProperty] private string _editPrenom = string.Empty;
    [ObservableProperty] private string _editEntreprise = string.Empty;
    [ObservableProperty] private string _editEmail = string.Empty;
    [ObservableProperty] private string _editTelephone = string.Empty;
    [ObservableProperty] private string _editAdresse = string.Empty;
    [ObservableProperty] private string _editVille = string.Empty;
    [ObservableProperty] private string _editCodePostal = string.Empty;
    [ObservableProperty] private string _editNotes = string.Empty;
    [ObservableProperty] private bool _editActif = true;

    public ClientsViewModel(AppDbContext db) => _db = db;

    public override async Task LoadAsync()
    {
        IsLoading = true;
        try
        {
            var liste = await _db.Clients
                .Where(c => string.IsNullOrEmpty(Recherche) ||
                            c.Nom.Contains(Recherche) ||
                            (c.Prenom != null && c.Prenom.Contains(Recherche)) ||
                            (c.Entreprise != null && c.Entreprise.Contains(Recherche)))
                .OrderBy(c => c.Nom).ThenBy(c => c.Prenom)
                .ToListAsync();
            Clients = new ObservableCollection<Client>(liste);
        }
        finally { IsLoading = false; }
    }

    [RelayCommand]
    private async Task Rechercher() => await LoadAsync();

    [RelayCommand]
    private void Nouveau()
    {
        ClientSelectionne = null;
        EditNom = EditPrenom = EditEntreprise = EditEmail =
            EditTelephone = EditAdresse = EditVille = EditCodePostal = EditNotes = string.Empty;
        EditActif = true;
        ModeEdition = true;
    }

    [RelayCommand]
    private void Modifier()
    {
        if (ClientSelectionne == null) return;
        EditNom = ClientSelectionne.Nom;
        EditPrenom = ClientSelectionne.Prenom ?? string.Empty;
        EditEntreprise = ClientSelectionne.Entreprise ?? string.Empty;
        EditEmail = ClientSelectionne.Email ?? string.Empty;
        EditTelephone = ClientSelectionne.Telephone ?? string.Empty;
        EditAdresse = ClientSelectionne.Adresse ?? string.Empty;
        EditVille = ClientSelectionne.Ville ?? string.Empty;
        EditCodePostal = ClientSelectionne.CodePostal ?? string.Empty;
        EditNotes = ClientSelectionne.Notes ?? string.Empty;
        EditActif = ClientSelectionne.Actif;
        ModeEdition = true;
    }

    [RelayCommand]
    private async Task Sauvegarder()
    {
        if (string.IsNullOrWhiteSpace(EditNom))
        {
            StatusMessage = "Le nom du client est requis.";
            HasError = true;
            return;
        }
        HasError = false;

        if (ClientSelectionne == null)
        {
            _db.Clients.Add(new Client
            {
                Nom = EditNom, Prenom = EditPrenom, Entreprise = EditEntreprise,
                Email = EditEmail, Telephone = EditTelephone, Adresse = EditAdresse,
                Ville = EditVille, CodePostal = EditCodePostal, Notes = EditNotes, Actif = EditActif
            });
        }
        else
        {
            ClientSelectionne.Nom = EditNom;
            ClientSelectionne.Prenom = EditPrenom;
            ClientSelectionne.Entreprise = EditEntreprise;
            ClientSelectionne.Email = EditEmail;
            ClientSelectionne.Telephone = EditTelephone;
            ClientSelectionne.Adresse = EditAdresse;
            ClientSelectionne.Ville = EditVille;
            ClientSelectionne.CodePostal = EditCodePostal;
            ClientSelectionne.Notes = EditNotes;
            ClientSelectionne.Actif = EditActif;
        }

        await _db.SaveChangesAsync();
        ModeEdition = false;
        StatusMessage = "Client sauvegardé.";
        await LoadAsync();
    }

    [RelayCommand]
    private void Annuler() => ModeEdition = false;

    [RelayCommand]
    private async Task Supprimer()
    {
        if (ClientSelectionne == null) return;
        _db.Clients.Remove(ClientSelectionne);
        await _db.SaveChangesAsync();
        StatusMessage = "Client supprimé.";
        await LoadAsync();
    }
}
