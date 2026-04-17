using InventaireApp.Data;
using InventaireApp.ViewModels;
using InventaireApp.Views;
using System.Windows;

namespace InventaireApp;

public partial class MainWindow : Window
{
    private readonly AppDbContext _db = new();

    public MainWindow()
    {
        InitializeComponent();
        Navigate<ProduitsView, ProduitsViewModel>();
    }

    private void Navigate<TView, TViewModel>()
        where TView : System.Windows.Controls.Page, new()
        where TViewModel : BaseViewModel
    {
        var vm = CreateViewModel<TViewModel>();
        var view = new TView();
        view.DataContext = vm;
        MainFrame.Navigate(view);
        _ = vm.LoadAsync();
    }

    private TViewModel CreateViewModel<TViewModel>() where TViewModel : BaseViewModel
    {
        return typeof(TViewModel) switch
        {
            var t when t == typeof(ProduitsViewModel) => (TViewModel)(BaseViewModel)new ProduitsViewModel(_db),
            var t when t == typeof(ClientsViewModel) => (TViewModel)(BaseViewModel)new ClientsViewModel(_db),
            var t when t == typeof(CommandesViewModel) => (TViewModel)(BaseViewModel)new CommandesViewModel(_db),
            var t when t == typeof(CommandesFournisseurViewModel) => (TViewModel)(BaseViewModel)new CommandesFournisseurViewModel(_db),
            var t when t == typeof(RabaisViewModel) => (TViewModel)(BaseViewModel)new RabaisViewModel(_db),
            _ => throw new InvalidOperationException($"ViewModel inconnu: {typeof(TViewModel)}")
        };
    }

    private void NavProduits_Checked(object sender, RoutedEventArgs e) =>
        Navigate<ProduitsView, ProduitsViewModel>();

    private void NavClients_Checked(object sender, RoutedEventArgs e) =>
        Navigate<ClientsView, ClientsViewModel>();

    private void NavCommandes_Checked(object sender, RoutedEventArgs e) =>
        Navigate<CommandesView, CommandesViewModel>();

    private void NavFournisseurs_Checked(object sender, RoutedEventArgs e) =>
        Navigate<CommandesFournisseurView, CommandesFournisseurViewModel>();

    private void NavRabais_Checked(object sender, RoutedEventArgs e) =>
        Navigate<RabaisView, RabaisViewModel>();
}
