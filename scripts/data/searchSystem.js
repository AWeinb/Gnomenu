
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Signals = imports.signals;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;


const SearchSystem = new Lang.Class({
    
    Name: 'GnoMenu.SearchSystem',


    _init: function() {
        this._providers = [];
        this._remoteProviders = [];
        this.reset();
    },

    reset: function() {
        this._updateCallbackTimoutID = null;
        this._previousTerms = [];
        
        for each (let provider in this._providers) {
            provider.reset();
        }
    },
    
    registerProvider: function (provider) {
        if (!provider.id || provider.id == '') {
            Log.logError("GnoMenu.SearchSystem", "registerProvider", "Please provide an id for the provider!");
        }
        
        this._providers.push(provider);
        provider.setUpdateCallback(Lang.bind(this, this._onUpdate));

        if (provider.isRemoteProvider) {
            this._remoteProviders.push(provider);
        }
    },

    unregisterProvider: function (provider) {
        let index = this._providers.indexOf(provider);
        if (index == -1) {
            Log.logWarning("GnoMenu.SearchSystem", "unregisterProvider", "provider not found!");
            return;
        }
        this._providers.splice(index, 1);
        
        if (provider._searchSystemConnectID) {
            provider.disconnect(provider._searchSystemConnectID);
            provider._searchSystemConnectID = undefined;
        }

        let remoteIndex = this._remoteProviders.indexOf(provider);
        if (remoteIndex != -1) {
            this._remoteProviders.splice(remoteIndex, 1);
        }
    },

    getProviders: function() {
        return this._providers;
    },

    getRemoteProviders: function() {
        return this._remoteProviders;
    },

    getTerms: function() {
        return this._previousTerms;
    },
    
    getResults: function(filterParams) {
        let results = {};
        for each (let provider in this._providers) {
            if (filterParams && filterParams.ofProviderID && filterParams.ofProviderID != provider.id) {
                continue;
            }
            
            try {
                let rawResults = provider.getResults(filterParams);
                let resultsMetas = provider.getResultMetas(rawResults);
                results[provider.id] = resultsMetas;
            } catch(e) {
                Log.logWarning("GnoMenu.SearchSystem", "getResults", e.message);
            }
        }
        return results;
    },

    updateSearchResults: function(terms) {
        if (!terms || terms.join('').trim() == '') {
            this.stopSearch();
            return;
        }

        let searchString = terms.join(' ');
        let previousSearchString = this._previousTerms.join(' ');
        if (searchString == previousSearchString) {
            return;
        }

        let isSearchStart = true;
        if (this._previousTerms.length > 0) {
            isSearchStart = searchString.indexOf(previousSearchString) != 0;
        }

        for each (let provider in this._providers) {
            try {
                if (isSearchStart) {
                    provider.getInitialResultSet(terms);
                } else {
                    provider.getSubsearchResultSet(terms);
                }
                
            } catch (error) {
                Log.logWarning("GnoMenu.SearchSystem", "updateSearchResults", error.message);
            }
        }
        
        this._previousTerms = terms;
    },
    
    stopSearch: function() {
        this.reset();
        
        this.emit('searchsystem-stop');
    },
    
    _onUpdate: function() {
        if (this._updateCallbackTimoutID > 0) {
            Mainloop.source_remove(this._updateCallbackTimoutID);
        }
        this._updateCallbackTimoutID = Mainloop.timeout_add(100, Lang.bind(this, function() { this.emit('searchsystem-update') }));
    },
});
Signals.addSignalMethods(SearchSystem.prototype);