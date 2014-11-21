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
const Config = imports.misc.config;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const MenuModel = Me.imports.scripts.menu.menuModel;


const ECategoryID = MenuModel.ECategoryID;
const ESelectionMethod = MenuModel.ESelectionMethod;
const EViewMode = MenuModel.EViewMode;
const EMenuLayout = MenuModel.EMenuLayout;
const ECategoryNum = MenuModel.ECategoryNum;


/**
 * @class MenuSettings: This class bundles the settings for the menu.
 *
 *
 * @author AxP
 * @version 1.0
 */
const MenuSettings = new Lang.Class({

    Name: 'Gnomenu.MenuSettings',
    
    _init: function(settings) {
        if (!settings) {
            Log.logError("Gnomenu.MenuSettings", "_init", "settings is null!");
        }
        
        this._settings = settings;
        this._settingCbIDs = {}
        
        this._gsVersion = Config.PACKAGE_VERSION.split('.');  
    },
    
    /**
     * @description Destroys the object.
     * @public
     * @function
     */
    destroy: function() {
        // Disconnect from the settings.
        if (this._settings) {
            for each (let id in this._changeSettingsCB) {
                if (id && id > 0) {
                    this._settings.disconnect(id);
                }
            }
        }  
    },

    // ###
    
    /**
     * @description This getter provides the gnome shell version.
     * @returns {String}
     * @public
     * @function
     */
    getGnomeShellVersion: function() {
        return this._gsVersion;
    },

    /**
     * @description Method to get the settings instance.
     * @returns {Settings}
     * @public
     * @function
     */
    getSettings: function() {
        return this._settings;
    },
    
    // ###

    /**
     * @description Returns wether the sidebar should be visible.
     * @returns {Boolean}
     * @public
     * @function
     */
    isSidebarVisible: function() {
        return this._settings.get_boolean('enable-sidebar');
    },

    /**
     * @description Registers a settings changed event callback.
     * @param {Function} onChangeCallback
     * @public
     * @function
     */
    registerSidebarVisibleCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::enable-sidebar', onChangeCallback);
    },

    // ---


    /**
     * @description Returns which category of apps the sidebar should show.
     * @returns {ECategoryID Enum}
     * @public
     * @function
     */
    getSidebarCategory: function() {
        let defCat = this._settings.get_enum('sidebar-category');
        
        switch (defCat) {
            
            case ECategoryNum.FAVORITES:
                defCat = ECategoryID.FAVORITES;
                break;
            
            case ECategoryNum.PLACES:
                defCat = ECategoryID.PLACES;
                break;
                
            default:
                defCat = ECategoryID.FAVORITES;
                break;
        }
        
        return defCat;
    },

    /**
     * @description Registers a settings changed event callback.
     * @param {Function} onChangeCallback
     * @public
     * @function
     */
    registerSidebarCategoryCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::sidebar-category', onChangeCallback);
    },

    // ---


    /**
     * @description Returns the iconsize the sidebar buttons should have.
     * @returns {Integer}
     * @public
     * @function
     */
    getSidebarIconsize: function() {
        let iconSize = this._settings.get_int('sidebar-iconsize');
        if (!iconSize) {
            iconSize = 64;
        }
        return iconSize;
    },

    /**
     * @description Registers a settings changed event callback.
     * @param {Function} onChangeCallback
     * @public
     * @function
     */
    registerSidebarIconsizeCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::sidebar-iconsize', onChangeCallback);
    },

    // --- -


    /**
     * @description Returns the layout the menu should have.
     * @returns {EMenuLayout Enum}
     * @public
     * @function
     */
    getMenuLayout: function() {
        let layout = this._settings.get_enum('menu-layout');
        if (!layout) {
            layout = EMenuLayout.MEDIUM;
        }
        return layout;
    },


    // ---


    /**
     * @description Returns the current shortcutarea category.
     * @returns {ECategoryID Enum}
     * @public
     * @function
     */
    getDefaultShortcutAreaCategory: function() {
        let defCat = this._settings.get_enum('menu-startcategory');
        
        switch (defCat) {
            
            case ECategoryNum.MOST_USED:
                defCat = ECategoryID.MOST_USED;
                break;
            
            case ECategoryNum.ALL_APPS:
                defCat = ECategoryID.ALL_APPS;
                break;
                
            default:
                defCat = ECategoryID.MOST_USED;
                break;
        }
        
        return defCat;
    },

    /**
     * @description Registers a settings changed event callback.
     * @param {Function} onChangeCallback
     * @public
     * @function
     */
    registerDefaultShortcutAreaCategoryCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::menu-startcategory', onChangeCallback);
    },

    // ---


    /**
     * @description Returns the default viewmode.
     * @returns {EViewMode Enum}
     * @public
     * @function
     */
    getMainAreaViewMode: function() {
        let viewMode = this._settings.get_enum('menu-viewmode');
        if (!viewMode) {
            viewMode = EViewMode.LIST;
        }
        return viewMode;
    },

    /**
     * @description Registers a settings changed event callback.
     * @param {Function} onChangeCallback
     * @public
     * @function
     */
    registerMainAreaViewModeCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::menu-viewmode', onChangeCallback);
    },

    // ---


    /**
     * @description Returns the current shortcutarea selection method.
     * @returns {ESelectionMethod Enum}
     * @public
     * @function
     */
    getCategorySelectionMethod: function() {
        let method = this._settings.get_enum('menu-category-selectionmethod');
        if (!method) {
            method = ESelectionMethod.CLICK;
        }
        return method;
    },

    /**
     * @description Registers a settings changed event callback.
     * @param {Function} onChangeCallback
     * @public
     * @function
     */
    registerCategorySelectionMethodCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::menu-category-selectionmethod', onChangeCallback);
    },

    // ---


    /**
     * @description Returns the current shortcutarea iconsize of buttons in the app list.
     * @returns {Integer}
     * @public
     * @function
     */
    getAppListIconsize: function() {
        let iconSize = this._settings.get_int('menu-applist-iconsize');
        if (!iconSize) {
            iconSize = 28;
        }
        return iconSize;
    },

    /**
     * @description Registers a settings changed event callback.
     * @param {Function} onChangeCallback
     * @public
     * @function
     */
    registerAppListIconsizeCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::menu-applist-iconsize', onChangeCallback);
    },

    // ---


    /**
     * @description Returns the current shortcutarea iconsize of buttons in the app grid.
     * @returns {Integer}
     * @public
     * @function
     */
    getAppGridIconsize: function() {
        let iconSize = this._settings.get_int('menu-appgrid-iconsize');
        if (!iconSize) {
            iconSize = 64;
        }
        return iconSize;
    },

    /**
     * @description Registers a settings changed event callback.
     * @param {Function} onChangeCallback
     * @public
     * @function
     */
    registerAppGridIconsizeCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::menu-appgrid-iconsize', onChangeCallback);
    },

    // ---


    /**
     * @description Returns the column count of the app grid.
     * @returns {Integer}
     * @public
     * @function
     */
    getAppGridColumnCount: function() {
        let colCount = null; //XXX
        if (!colCount) {
            colCount = 5;
        }
        return colCount;
    },


    // ---


    /**
     * @description Returns the maximal search result count that should get shown.
     * @returns {Integer}
     * @public
     * @function
     */
    getMaxSearchResultCount: function() {
        let count = this._settings.get_int('menu-search-maxresultcount');
        if (!count) {
            count = 4;
        }
        return count;
    },

    /**
     * @description Registers a settings changed event callback.
     * @param {Function} onChangeCallback
     * @public
     * @function
     */
    registerMaxSearchResultCountCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::menu-search-maxresultcount', onChangeCallback);
    },

    // ---


    /**
     * @description Returns the count of entries that should be shown per row.
     *              Only interesting for grid views.
     * @returns {Integer}
     * @public
     * @function
     */
    getSearchEntriesPerRow: function() {
        let count = null;
        if (!count) {
            count = 4;
        }
        return count;
    },

    
    // ---


    /**
     * @description Returns the iconsize for buttons dependend on the menu layout.
     * @returns {Integer}
     * @public
     * @function
     */
    getLayoutDependendIconsize: function() {
        let iconsize = 0;
        switch (this.getMenuLayout()) {

            case EMenuLayout.SMALL:
                iconsize = 16;
                break;

            case EMenuLayout.MEDIUM:
                iconsize = 18;
                break;

            case EMenuLayout.LARGE:
                iconsize = 20;
                break;

            default:
                break;
        }
        return iconsize;
    },


    /**
     * @description Helper for registering callbacks.
     * @param {ID} key Some identifier.
     * @param {Function} onChangeCallback The callback.
     * @private
     * @function
     */
    _changeSettingsCB: function(key, onChangeCallback) {
        if (!onChangeCallback) {
            Log.logError("Gnomenu.MenuSettings", "_changeSettingsCB", "onChangeCallback is null!");
        }

        // The callback ids are stored in a map to make unregistering easier.
        let id = this._settingCbIDs[key];
        if (id && id > 0) {
            this._settings.disconnect(id);
        }

        id = this._settings.connect(key, onChangeCallback);
        this._settingCbIDs[key] = id;
    },
});