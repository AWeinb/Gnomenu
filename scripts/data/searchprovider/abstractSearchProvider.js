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

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;
const SearchLaunchable = Me.imports.scripts.data.launchable.SearchLaunchable;



/**
 * @class AbstractSearchProvider
 *
 * @classdesc This class defines the basic structure of a searchprovider.
 *
 * @description The constructor needs to define an unique id.
 * 
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const AbstractSearchProvider = new Lang.Class({
    
    Name: 'GnoMenu.AbstractSearchProvider',

    
    _init: function() {
        this.id = 'provider_abstract';
        
        this.reset();
    },
    
    /**
     * @description Callback used to inform the searchsystem that the new
     *              results are ready.
     * @function
     * @memberOf AbstractSearchProvider#
     */
    setUpdateCallback: function(updateCallback) {
        if (!updateCallback) {
            Log.logError("GnoMenu.AbstractSearchProvider", "setUpdateCallback", "Callback function is null!");
        }
        this._updateCallback = updateCallback;  
    },
    
    /**
     * @description Resets the provider. Deletes the stored results.
     * @function
     * @memberOf AbstractSearchProvider#
     */
    reset: function() {
        this._results = [];
    },
    
    /**
     * @description Returns the raw results as a list.
     * @returns {List}
     * @function
     * @memberOf AbstractSearchProvider#
     */
    getResults: function(filterParams) {
        return this._results;
    },

    /**
     * @description Returns the refined results as a list.
     * @param {List} rawResults Takes the raw results.
     * @returns {SearchLaunchablesList}
     * @function
     * @memberOf AbstractSearchProvider#
     */
    getResultMetas: function(rawResults) {
        return []; // SearchLaunchable
    },

    /**
     * @description Receives the startset of results for a search run. Calls
     *              the updateCallback afterwards.
     * @function
     * @memberOf AbstractSearchProvider#
     */
    getInitialResultSet: function(terms) {
        this._results = [];
        
        if (this._updateCallback) {
            this._updateCallback();
        }
    },

    /**
     * @description Refines the current search run. Calls the updateCallback
     *              afterwards.
     * @function
     * @memberOf AbstractSearchProvider#
     */
    getSubsearchResultSet: function(terms) {
        this._results = [];
        
        if (this._updateCallback) {
            this._updateCallback();
        }
    },
});
