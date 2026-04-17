using CommunityToolkit.Mvvm.ComponentModel;

namespace InventaireApp.ViewModels;

public abstract partial class BaseViewModel : ObservableObject
{
    [ObservableProperty]
    private bool _isLoading;

    [ObservableProperty]
    private string _statusMessage = string.Empty;

    [ObservableProperty]
    private bool _hasError;

    public virtual Task LoadAsync() => Task.CompletedTask;
}
