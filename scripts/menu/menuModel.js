/*
    Copyright (C) 2014-2015, THE PANACEA PROJECTS <panacier@gmail.com>
    Copyright (C) 2014-2015, AxP <Der_AxP@t-online.de>

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
const Datamanager = Me.imports.scripts.data.datamanager.Datamanager;
const Log = Me.imports.scripts.misc.log;


const EEventType = {
    
    DATA_APPS_EVENT:          10,
    DATA_MOSTUSED_EVENT:      11,
    DATA_FAVORITES_EVENT:     12,
    DATA_RECENTFILES_EVENT:   13,
    DATA_PLACES_EVENT:        14,
    DATA_DEVICES_EVENT:       15,
    DATA_NETDEVICES_EVENT:    16,
    DATA_BOOKMARKS_EVENT:     17,
    
    SEARCH_UPDATE_EVENT: 20,
    SEARCH_STOP_EVENT:   21,
    
};

const ECategoryID = {
        
    ALL_APPS:    "category_allApps",
    MOST_USED:   "category_mostUsed",
    FAVORITES:   "category_favorites",
    RECENTFILES: "category_recent",
    PLACES:      "category_places",
    DEVICES:     "category_devices",
    NETDEVICES:  "category_netdevices",
    BOOKMARKS:   "category_bookmarks",
    WEB:         "category_web",
    
};

const ESelectionMethod = {
    
    CLICK: 20,
    HOVER: 21,
    
};

const EViewMode = {
    
    LIST: 30,
    GRID: 31,
    
};

const EMenuLayout = {
    
    LARGE:  40,
    MEDIUM: 41,
    SMALL:  42,
    
};

const ECategoryNum = {
        
    ALL_APPS:    50,
    MOST_USED:   51,
    FAVORITES:   52,
    RECENTFILES: 53,
    PLACES:      54,
    DEVICES:     55,
    NETDEVICES:  56,
    BOOKMARKS:   57,
    WEB:         58,
    
};


/**
 * @class ModelObserver: The observer is updated when the model is changed and
 *                       updates then the registered components.
 *
 *
 * @author AxP
 * @version 1.0
 */
const ModelObserver = new Lang.Class({

    Name: 'Gnomenu.ModelObserver',


    _init: function() {
        this._components = [];
    },

    /**
     * @description This setter registers a component to get update events.
     * @param {Updateable} component
     * @public
     * @function
     */
    registerUpdateable: function(component) {
        if (component) {
            this._components.push(component);
        } else {
            Log.logWarning("Gnomenu.ModelObserver", "registerUpdateable", "component is null!");
        }
    },

    /**
     * @description This method removes an element from the update list.
     * @param {Updateable} component
     * @public
     * @function
     */
    unregisterUpdateable: function(component) {
        if (component) {
            let componentIndex = this._components.indexOf(component);
            if (componentIndex != -1) {
                this._components.splice(componentIndex, 1);
            }
        } else {
            Log.logWarning("Gnomenu.ModelObserver", "unregisterUpdateable", "component is null!");
        }
    },

    /**
     * @description Clears all components.
     * @public
     * @function
     */
    clearUpdateables: function() {
        this._components = [];
    },

    /**
     * @description This method notifies the registered components that something changed.
     *              To make it more clear which changed it is possible to provide
     *              an event object with an event type attribute.
     * @param {Object} event
     * @public
     * @function
     */
    notify: function(event) {
        for each (let comp in this._components) {
            if (comp.update) {
                comp.update(event);
            } else {
                Log.logWarning("Gnomenu.ModelObserver", "update", "Non-updateable component found!");
            }
        }
    },
});


/**
 * @class ModelObserver: The model contains all data that is displayed. The
 *                       components take this data when needed. To inform
 *                       them about updates they can register themselves at
 *                       the observer.
 *
 *
 * @author AxP
 * @version 1.0
 */
const MenuModel = new Lang.Class({

    Name: 'Gnomenu.MenuModel',


    _init: function() {
        this._observer = new ModelObserver();

        this._datamanager = new Datamanager();
        this._datamanagerSignalIDs = [];

        // The datamanager provides the model with a lot of data.
        let id = 0;
        id = this._datamanager.connect('apps-updated', Lang.bind(this, function() {this._notify(EEventType.DATA_APPS_EVENT)}));
        this._datamanagerSignalIDs.push(id);
        id = this._datamanager.connect('mostUsed-updated', Lang.bind(this, function() {this._notify(EEventType.DATA_MOSTUSED_EVENT)}));
        this._datamanagerSignalIDs.push(id);
        id = this._datamanager.connect('favorites-updated', Lang.bind(this, function() {this._notify(EEventType.DATA_FAVORITES_EVENT)}));
        this._datamanagerSignalIDs.push(id);
        id = this._datamanager.connect('recentFiles-updated', Lang.bind(this, function() {this._notify(EEventType.DATA_RECENTFILES_EVENT)}));
        this._datamanagerSignalIDs.push(id);
        id = this._datamanager.connect('devices-updated', Lang.bind(this, function() {this._notify(EEventType.DATA_DEVICES_EVENT)}));
        this._datamanagerSignalIDs.push(id);
        id = this._datamanager.connect('netDevices-updated', Lang.bind(this, function() {this._notify(EEventType.DATA_NETDEVICES_EVENT)}));
        this._datamanagerSignalIDs.push(id);
        id = this._datamanager.connect('bookmarks-updated', Lang.bind(this, function() {this._notify(EEventType.DATA_BOOKMARKS_EVENT)}));
        this._datamanagerSignalIDs.push(id);

        this._searchSystem = undefined;
        this._searchSystemSignalID = undefined;
    },

    /**
     * @description Destroys the model.
     * @public
     * @function
     */
    destroy: function() {
        // Disconnect from datamanager.
        for each (let id in this._datamanagerSignalIDs) {
            if (id > 0) {
                try {
                    this._datamanager.disconnect(id);
                } catch(e) {
                    Log.logWarning("Gnomenu.MenuModel", "destroy", e.message);
                }
            }
        }
        this._datamanager.destroy();

        // Disconnect from the searchsystem.
        if (this._searchSystem && this._searchSystemSignalID) {
            this._searchSystem.disconnect(this._searchSystemSignalID);
            this._searchSystemSignalID = null;
        }
    },

    /**
     * @description Helper to notify the observer.
     * @param {Enum} eventType
     * @private
     * @function
     */
    _notify: function(eventType) {
        if (!eventType) {
            Log.logWarning("Gnomenu.MenuModel", "_notify", "eventType is null!");
        }

        let event = { type: eventType }
        this._observer.notify(event);
    },


    // #########################################################################
    // ---
    // Basics

    /**
     * @description This getter gives you the model observer.
     * @returns {Observer}
     * @public
     * @function
     */
    getObserver: function() {
        return this._observer;
    },


    // #########################################################################
    // ---
    // Data


    /**
     * @description Returns a category-app map with the applications of the system.
     * @returns {Object Launchable}
     * @public
     * @function
     */
    getApplicationsMap: function() {
        return this._datamanager.getApplicationsMap();
    },

    /**
     * @description Returns a categoryID-categoryName map.
     * @returns {Object String}
     * @public
     * @function
     */
    getApplicationCategories: function() {
        return this._datamanager.getCategoryMap();
    },

    /**
     * @description Returns all applications of the system.
     * @returns {List Launchable}
     * @public
     * @function
     */
    getAllApplications: function() {
        return this._datamanager.getAllApplications();
    },

    /**
     * @description Returns the most used applications of the user.
     * @returns {List Launchable}
     * @public
     * @function
     */
    getMostUsedApps: function() {
        return this._datamanager.getMostUsedApps();
    },

    /**
     * @description Returns the favorite applications of the user.
     * @returns {List Launchable}
     * @public
     * @function
     */
    getFavoriteApps: function() {
        return this._datamanager.getFavoriteApps();
    },

    /**
     * @description Returns the recent files of the user.
     * @returns {List Launchable}
     * @public
     * @function
     */
    getRecentFiles: function() {
        return this._datamanager.getRecentFiles();
    },

    /**
     * @description Returns the places of the user.
     * @returns {List Launchable}
     * @public
     * @function
     */
    getPlaces: function() {
        return this._datamanager.getDefaultPlaces();
    },

    /**
     * @description Returns the bookmarks of the user.
     * @returns {List Launchable}
     * @public
     * @function
     */
    getBookmarks: function() {
        return this._datamanager.getBookmarks();
    },

    /**
     * @description Returns the devices of the user.
     * @returns {List Launchable}
     * @public
     * @function
     */
    getDevices: function() {
        return this._datamanager.getDevices();
    },

    /**
     * @description Returns the remote devices of the user.
     * @returns {List Launchable}
     * @public
     * @function
     */
    getNetworkDevices: function() {
        return this._datamanager.getNetworkDevices();
    },


    // #########################################################################
    // ---
    // Search

    /**
     * @description Sets the searchsystem. After that it is possible to get
     *              searchsystem observer updates.
     * @param {Searchsystem} system
     * @public
     * @function
     */
    setSearchSystem: function(system) {
        if (system) {
            this._searchSystem = system;
            this._searchSystemSignalID = system.connect('searchsystem-update', Lang.bind(this, function() { this._notify(EEventType.SEARCH_UPDATE_EVENT) }));
            this._searchSystemSignalID = system.connect('searchsystem-stop', Lang.bind(this, function() { this._notify(EEventType.SEARCH_STOP_EVENT) }));
        } else {
            Log.logWarning("Gnomenu.MenuModel", "setSearchSystem", "system is null!");
        }
    },

    /**
     * @description Returns the latest searchresults filtered with the params parameter.
     * @param {Object} params { maxNumber: ?, ... }
     * @public
     * @function
     */
    getSearchResults: function(params) {
        let results = null;
        if (this._searchSystem) {
            results = this._searchSystem.getResults(params);
        } else {
            Log.logWarning("Gnomenu.MenuModel", "getSearchResults", "this._searchSystem is null!");
        }
        return results;
    },
});


