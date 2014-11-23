
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const Shell = imports.gi.Shell;
const Params = imports.misc.params;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const AbstractSearchProvider = Me.imports.scripts.data.searchprovider.abstractSearchProvider.AbstractSearchProvider;
const SearchLaunchable = Me.imports.scripts.data.launchable.SearchLaunchable;


const AppSearchProvider = new Lang.Class({
    
    Name: 'GnoMenu.AppSearchProvider',
    Extends: AbstractSearchProvider,

    
    _init: function() {
        // NEEDED: ID 
        this.id = 'provider_applications';
        
        this._appSys = Shell.AppSystem.get_default();
        this.reset();
    },
    
    reset: function() {
        this._results = null;
    },
    
    getResults: function(filterParams) {
        let results = this._results;
        if (results && filterParams && filterParams.maxNumber) {
            results = this._results.slice(0, filterParams.maxNumber);
        }
        return results;
    },
    
    getResultMetas: function(apps) {
        let metas = [];
        for (let idx in apps) {
            let app = apps[idx];
            if (app) {
                let getIconFunc = function() {
                    return app.get_app_info().get_icon();
                };
                
                let launchFunc = function(openNew, params) {
                    let event = Clutter.get_current_event();
                    let modifiers = event ? event.get_state() : 0;
                    let openNewWindow = modifiers & Clutter.ModifierType.CONTROL_MASK;
                    
                    if (openNew || openNewWindow) {
                        params = Params.parse(params, { workspace: -1, timestamp: 0 });
                        app.open_new_window(params.workspace);
                    } else {
                        app.activate();
                    }
                };
                
                let res = new SearchLaunchable(app.get_name(), app.get_description(), getIconFunc, launchFunc);
                metas.push(res);
            }
        }
        return metas;
    },

    getInitialResultSet: function(terms) {
        this._results = this._appSys.initial_search(terms);
        
        if (this._updateCallback) {
            this._updateCallback();
        }
    },

    getSubsearchResultSet: function(terms) {
        this._results = this._appSys.subsearch(this._results, terms);
        
        if (this._updateCallback) {
            this._updateCallback();
        }
    },
});
