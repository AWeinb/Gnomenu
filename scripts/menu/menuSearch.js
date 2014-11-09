
const Lang = imports.lang;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const SearchSystem = Me.imports.scripts.data.searchSystem.SearchSystem;
const AppSearchProvider = Me.imports.scripts.data.searchprovider.appSearchProvider.AppSearchProvider;
const GnoSearchProvider = Me.imports.scripts.data.searchprovider.gnoSearchProvider.GnoSearchProvider;



const MenuSearch = new Lang.Class({
    
    Name: 'GnoMenu.MenuSearch',
    
    
    _init: function() {
        this._searchSystem = new SearchSystem();
        
        this._appProvider = new AppSearchProvider();
        this._gnoProvider = new GnoSearchProvider();
        
        this._searchSystem.registerProvider(this._appProvider);
        this._searchSystem.registerProvider(this._gnoProvider);
    },
    
    destroy: function() {
        this._searchSystem.unregisterProvider(this._appProvider);
        this._searchSystem.unregisterProvider(this._gnoProvider);
    },
    
    getSearchSystem: function() {
        return this._searchSystem;
    },
});