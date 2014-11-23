
const Lang = imports.lang;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;
const SearchLaunchable = Me.imports.scripts.data.launchable.SearchLaunchable;


const AbstractSearchProvider = new Lang.Class({
    
    Name: 'GnoMenu.AbstractSearchProvider',

    
    _init: function() {
        this.id = 'provider_abstract';
        
        this.reset();
    },
    
    reset: function() {
        this._results = [];
    },
    
    setUpdateCallback: function(updateCallback) {
        if (!updateCallback) {
            Log.logError("GnoMenu.AbstractSearchProvider", "setUpdateCallback", "Callback function is null!");
        }
        this._updateCallback = updateCallback;  
    },
    
    getResults: function(filterParams) {
        return this._results;
    },

    getResultMetas: function(rawResults) {
        return []; // SearchLaunchable
    },

    filterResults: function(results) {
        return [];
    },

    getInitialResultSet: function(terms) {
        this._results = [];
        
        if (this._updateCallback) {
            this._updateCallback();
        }
    },

    getSubsearchResultSet: function(terms) {
        this._results = [];
        
        if (this._updateCallback) {
            this._updateCallback();
        }
    },
});
