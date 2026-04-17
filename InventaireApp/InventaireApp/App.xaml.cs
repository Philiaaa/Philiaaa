using InventaireApp.Data;
using System.Windows;

namespace InventaireApp;

public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);
        using var db = new AppDbContext();
        DbInitializer.Initialize(db);
    }
}
