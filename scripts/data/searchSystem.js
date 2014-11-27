/*
    Copyright (C) 2014-2015, THE PANACEA PROJECTS <panacier@gmail.com>

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software Foundation,
    Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301  USA
*/

const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Signals = imports.signals;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;



/**
 * @class SearchSystem
 *
 * @classdesc Slightly changed version of the gnome shell search system.
 *
 * @description .
 *
 * @emits SearchSystem#searchsystem-update
 * @emits SearchSystem#searchsystem-stop
 * 
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author GnomeShell
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const SearchSystem = new Lang.Class({
    
    Name: 'GnoMenu.SearchSystem',


    _init: function() {
        this._providers = [];
        this._remoteProviders = [];
        this.reset();
    },
    
    /**
     * @description Resets the system and the providers.
     * @function
     * @memberOf SearchSystem#
     */
    reset: function() {
        this._updateCallbackTimoutID = null;
        this._previousTerms = [];
        
        for each (let provider in this._providers) {
            provider.reset();
        }
    },
    
    /**
     * @description Registers a new provider.
     * @param {SearchProvider}
     * @function
     * @memberOf SearchSystem#
     */
    registerProvider: function (provider) {
        if (!provider.id || provider.id == '') {
            Log.logError("GnoMenu.SearchSystem", "registerProvider", "Please provide an id for the provider!");
        }
        
        this._providers.push(provider);
        provider.setUpdateCallback(Lang.bind(this, function () {
            if (this._updateCallbackTimoutID > 0) {
                Mainloop.source_remove(this._updateCallbackTimoutID);
            }
            this._updateCallbackTimoutID = Mainloop.timeout_add(100, Lang.bind(this, function() { this.emit('searchsystem-update') }));  
        }));

        if (provider.isRemoteProvider) {
            this._remoteProviders.push(provider);
        }
    },

    /**
     * @description Unregisters the specified provider.
     * @param {SearchProvider}
     * @function
     * @memberOf SearchSystem#
     */
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

    /**
     * @description Returns the currently registered providers.
     * @returns {SearchProviderList}
     * @function
     * @memberOf SearchSystem#
     */
    getProviders: function() {
        return this._providers;
    },

    /**
     * @description Returns the currently registered remote providers.
     * @returns {SearchProviderList}
     * @function
     * @memberOf SearchSystem#
     */
    getRemoteProviders: function() {
        return this._remoteProviders;
    },

    /**
     * @description Returns the currently active searchterms.
     * @returns {StringList}
     * @function
     * @memberOf SearchSystem#
     */
    getTerms: function() {
        return this._previousTerms;
    },
    
    /**
     * @description Returns a map of provider Ids to results. The results can
     *              be filtered with the corresponding argument.
     * @param {Object} filterParams
     * @returns {ProviderIDSearchLaunchableMap}
     * @function
     * @memberOf SearchSystem#
     */
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

    /**
     * @description Updates the current search run.
     * @param {StringList} terms
     * @function
     * @memberOf SearchSystem#
     */
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
    
    /**
     * @description Stops the current search run.
     * @function
     * @memberOf SearchSystem#
     */
    stopSearch: function() {
        this.reset();
        this.emit('searchsystem-stop');
    },
});
Signals.addSignalMethods(SearchSystem.prototype);