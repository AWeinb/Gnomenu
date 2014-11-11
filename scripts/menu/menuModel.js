
const Lang = imports.lang;

const Config = imports.misc.config;
const Meta = imports.gi.Meta;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;
const Constants = Me.imports.scripts.constants;
const Datamanager = Me.imports.scripts.data.datamanager.Datamanager;

const EEventType = Constants.EEventType;
const EViewMode = Constants.EViewMode;
const ECategoryID = Constants.ECategoryID;
const ECategoryNum = Constants.ECategoryNum;
const EMenuLayout = Constants.EMenuLayout;
const ESelectionMethod = Constants.ESelectionMethod;



const ModelObserver = new Lang.Class({
    
    Name: 'Gnomenu.ModelObserver',

    
    _init: function() {
        this._components = [];
    },
    
    registerUpdateable: function(component) {
        if (component) {
            this._components.push(component);
        } else {
            Log.logWarning("Gnomenu.ModelObserver", "registerUpdateable", "component is null!");
        }
    },
    
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
    
    clearUpdateables: function() {
        this._components = [];  
    },
    
    update: function(event) {
        for each (let comp in this._components) {
            if (comp.update) {
                comp.update(event);
            } else {
                Log.logWarning("Gnomenu.ModelObserver", "update", "Non-updateable component found!");
            }
        }
        return false;
    },
});



const MenuModel = new Lang.Class({
    
    Name: 'Gnomenu.MenuModel',
    
    
    _init: function(settings) {
        if (!settings) {
            Log.logError("Gnomenu.MenuModel", "_init", "settings is null!");
        }
        
        this._observer = new ModelObserver();
        this._settings = settings;
        this._settingCbIDs = {}
        this._gsVersion = Config.PACKAGE_VERSION.split('.');
        
        this._datamanager = new Datamanager();
        this._datamanagerSignalIDs = [];
        
        let id = 0;
        id = this._datamanager.connect('apps-updated', Lang.bind(this, function() {this._notify(EEventType.APPS_EVENT)}));
        this._datamanagerSignalIDs.push(id);
        id = this._datamanager.connect('mostUsed-updated', Lang.bind(this, function() {this._notify(EEventType.MOSTUSED_EVENT)}));
        this._datamanagerSignalIDs.push(id);
        id = this._datamanager.connect('favorites-updated', Lang.bind(this, function() {this._notify(EEventType.FAVORITES_EVENT)}));
        this._datamanagerSignalIDs.push(id);
        id = this._datamanager.connect('recentFiles-updated', Lang.bind(this, function() {this._notify(EEventType.RECENTFILES_EVENT)}));
        this._datamanagerSignalIDs.push(id);
        id = this._datamanager.connect('devices-updated', Lang.bind(this, function() {this._notify(EEventType.DEVICES_EVENT)}));
        this._datamanagerSignalIDs.push(id);
        id = this._datamanager.connect('netDevices-updated', Lang.bind(this, function() {this._notify(EEventType.NETDEVICES_EVENT)}));
        this._datamanagerSignalIDs.push(id);
        id = this._datamanager.connect('bookmarks-updated', Lang.bind(this, function() {this._notify(EEventType.BOOKMARKS_EVENT)}));
        this._datamanagerSignalIDs.push(id);
        
        this._searchSystem = undefined;
        this._searchSystemSignalID = undefined;
    },
    
    destroy: function() {
        for each (let id in this._datamanagerSignalIDs) {
            if (id > 0) {
                try {
                    this._datamanager.disconnect(id);
                } catch(e) {
                    Log.logWarning("Gnomenu.MenuModel", "destroy", e.message);
                }
            }
        }
        
        if (this._settings) {
            for each (let id in this._changeSettingsCB) {
                if (id && id > 0) {
                    this._settings.disconnect(id);
                }
            }
        }        
        
        this._datamanager.destroy();
        
        if (this._searchSystem && this._searchSystemSignalID) {
            this._searchSystem.disconnect(this._searchSystemSignalID);
            this._searchSystemSignalID = null;
        }
    },
    
    _notify: function(eventType) {
        if (!eventType) {
            Log.logWarning("Gnomenu.MenuModel", "_notify", "eventType is null!");
        }
        
        let event = { type: eventType }
        this._observer.update(event);
    },
    
    
    // #########################################################################
    // ---
    // Basics
    
    getObserver: function() {
        return this._observer;
    },
    
    getGnomeShellVersion: function() {
        return this._gsVersion;  
    },
    
    
    // #########################################################################
    // ---
    // Settings
    
    getSettings: function() {
        return this._settings;
    },
	
    
    isSidebarVisible: function() {
        return this._settings.get_boolean('enable-sidebar');
    },
    
    registerSidebarVisibleCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::enable-sidebar', onChangeCallback);
        return true;
    },
    
    getDefaultSidebarCategory: function() {
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
    
    registerDefaultSidebarCategoryCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::sidebar-category', onChangeCallback);
        return true;
    },
    
    getSidebarIconSize: function() {
        let iconSize = this._settings.get_int('sidebar-iconsize');
        if (!iconSize) {
            iconSize = 64;
        }
        return iconSize;
    },
    
    registerSidebarIconSizeCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::sidebar-iconsize', onChangeCallback);
        return true;
    },
    
    
    
    getMenuLayout: function() {
        let layout = this._settings.get_enum('menu-layout');
        if (!layout) {
            layout = EMenuLayout.MEDIUM;
        }
        return layout;
    },
    
    registerMenuLayoutCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::menu-layout', onChangeCallback);
        return true;
    },
    
    getDefaultShortcutAreaCategory: function() {
        let defCat = this._settings.get_enum('menu-category');
        
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
    
    registerDefaultShortcutAreaCategoryCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::menu-category', onChangeCallback);
        return true;
    },
    
    getShortcutAreaViewMode: function() {
        let viewMode = this._settings.get_enum('menu-viewmode');
        if (!viewMode) {
            viewMode = EViewMode.LIST;
        }
        return viewMode;
    },
    
    registerShortcutAreaViewModeCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::menu-viewmode', onChangeCallback);
        return true;
    },
    
    getCategorySelectionMethod: function() {
        let method = this._settings.get_enum('menu-category-selectionmethod');
        if (!method) {
            method = ESelectionMethod.CLICK;
        }
        return method;
    },
    
    registerCategorySelectionMethodCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::menu-category-selectionmethod', onChangeCallback);
        return true;
    },
    
    getShortcutListIconSize: function() {
        if (!this._settings) {
            return null;
        }
        let iconSize = this._settings.get_int('menu-applist-iconsize');
        if (!iconSize) {
            iconSize = 28;
        }
        return iconSize;
    },
    
    registerShortcutListIconSizeCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::menu-applist-iconsize', onChangeCallback);
        return true;
    },
    
    getShortcutGridIconSize: function() {
        let iconSize = this._settings.get_int('menu-appgrid-iconsize');
        if (!iconSize) {
            iconSize = 64;
        }
        return iconSize;
    },
    
    registerShortcutGridIconSizeCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::menu-appgrid-iconsize', onChangeCallback);
        return true;
    },
    
    
    
    getShortcutGridColumnCount: function() {
        let colCount = null; //XXX
        if (!colCount) {
            colCount = 5;
        }
        return colCount;
    },
    
    registerShortcutGridColumnCountCB: function(onChangeCallback) {
        //XXX
        return true;
    },
    
    getMaxSearchResultCount: function() {
        let count = this._settings.get_int('menu-search-maxresultcount');
        if (!count) {
            count = 4;
        }
        return count;
    },
    
    registerMaxSearchResultCountCB: function(onChangeCallback) {
        this._changeSettingsCB('changed::menu-search-maxresultcount', onChangeCallback);
        return true;
    },
    
    getMiscBtnIconSize: function() {
        let iconSize = 0;
        switch (this.getMenuLayout()) {
            
            case EMenuLayout.SMALL:
                iconSize = 16;
                break;
            
            case EMenuLayout.MEDIUM:
                iconSize = 18;
                break;
            
            case EMenuLayout.LARGE:
                iconSize = 20;
                break;
            
            default:
                break;
        }
        return iconSize;
    },
    
    
    _changeSettingsCB: function(key, onChangeCallback) {
        if (!onChangeCallback) {
            Log.logError("Gnomenu.MenuModel", "_changeSettingsCB", "onChangeCallback is null!");
        }
        
        let id = this._settingCbIDs[key];
        if (id && id > 0) {
            this._settings.disconnect(id);
        }
        
        id = this._settings.connect(key, onChangeCallback);
        this._settingCbIDs[key] = id;
    },
    
    
    // #########################################################################
    // ---
    // Data
    
    getApplicationsMap: function() {
        return this._datamanager.getApplicationsMap();
    },
    
    getApplicationCategories: function() {
        return this._datamanager.getCategoryMap();
    },
    
    getAllApplications: function() {
        return this._datamanager.getAllApplications();
    },
    
    getMostUsedApps: function() {
        return this._datamanager.getMostUsedApps();
    },
    
    getFavoriteApps: function() {
        return this._datamanager.getFavoriteApps();
    },
    
    getRecentFiles: function() {
        return this._datamanager.getRecentFiles();
    },
    
    getPlaces: function() {
        return this._datamanager.getDefaultPlaces();
    },
    
    getBookmarks: function() {
        return this._datamanager.getBookmarks();
    },
    
    getDevices: function() {
        return this._datamanager.getDevices();
    },
    
    getNetworkDevices: function() {
        return this._datamanager.getNetworkDevices();
    },
    
    
    // #########################################################################
    // ---
    // Search
    
    setSearchSystem: function(system) {
        if (system) {
            this._searchSystem = system;
            this._searchSystemSignalID = system.connect('searchsystem-update', Lang.bind(this, function() { this._notify(EEventType.SEARCH_UPDATE_EVENT) }));
            this._searchSystemSignalID = system.connect('searchsystem-stop', Lang.bind(this, function() { this._notify(EEventType.SEARCH_STOP_EVENT) }));
        } else {
            Log.logWarning("Gnomenu.MenuModel", "setSearchSystem", "system is null!");
        }
    },
    
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


