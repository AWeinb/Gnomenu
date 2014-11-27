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
const Clutter = imports.gi.Clutter;
const Shell = imports.gi.Shell;
const Params = imports.misc.params;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const AbstractSearchProvider = Me.imports.scripts.data.searchprovider.abstractSearchProvider.AbstractSearchProvider;
const SearchLaunchable = Me.imports.scripts.data.launchable.SearchLaunchable;



/**
 * @class AppSearchProvider
 * @extends AbstractSearchProvider
 *
 * @classdesc A searchprovider that search for apps.
 *
 * @description .
 * 
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const AppSearchProvider = new Lang.Class({
    
    Name: 'GnoMenu.AppSearchProvider',
    Extends: AbstractSearchProvider,

    
    _init: function() {
        // NEEDED: ID 
        this.id = 'provider_applications';
        
        this._appSys = Shell.AppSystem.get_default();
        this.reset();
    },
    
    /**
     * @description Resets the provider.
     * @function
     * @memberOf AppSearchProvider#
     */
    reset: function() {
        this._results = null;
    },
    
    /**
     * @description Returns a list of results optinally filtered.
     * @param {Object} filterParams
     * @returns {List}
     * @function
     * @memberOf AppSearchProvider#
     */
    getResults: function(filterParams) {
        let results = this._results;
        if (results && filterParams && filterParams.maxNumber) {
            results = this._results.slice(0, filterParams.maxNumber);
        }
        return results;
    },
    
    /**
     * @description Returns the refined searchresults created from the raw results.
     * @param {List} apps
     * @returns {SearchLaunchableList}
     * @function
     * @memberOf AppSearchProvider#
     */
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

    /**
     * @description Receives the startset of results for a search run. Calls
     *              the updateCallback afterwards.
     * @function
     * @memberOf AppSearchProvider#
     */
    getInitialResultSet: function(terms) {
        this._results = this._appSys.initial_search(terms);
        
        if (this._updateCallback) {
            this._updateCallback();
        }
    },

    /**
     * @description Refines the current search run. Calls the updateCallback
     *              afterwards.
     * @function
     * @memberOf AppSearchProvider#
     */
    getSubsearchResultSet: function(terms) {
        this._results = this._appSys.subsearch(this._results, terms);
        
        if (this._updateCallback) {
            this._updateCallback();
        }
    },
});
