
const Lang = imports.lang;

const GnomeSession = imports.misc.gnomeSession;
const LoginManager = imports.misc.loginManager;
const Main = imports.ui.main;
const Shell = imports.gi.Shell;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;
const Constants = Me.imports.scripts.constants;

const PREFS_DIALOG_CMD = Constants.PREFS_DIALOG_CMD;


    
const MenuMediator = new Lang.Class({
    
    Name: 'Gnomenu.MenuMediator',
    
    
    _init: function(menu, model) {
        this._menu = menu;
        this._model = model;
        
        this._session = new GnomeSession.SessionManager();
        
        this._categoryPane = null;
        this._viewModePane = null;
        this._searchField = null;
        
        this._sidebar = null;
        this._navigationArea = null;
        this._mainArea = null;
        
        this._controlPane = null;
        this._descriptionBox = null;
        this._extensionPrefButton = null;
    },
    
    // #########################################################################
    // --
    // Setter
    
    setCategoryPane: function(component) {
        this._categoryPane = component;
    },
    
    setViewModePane: function(component) {
        this._viewModePane = component;
    },
    
    setSearchField: function(component) {
        this._searchField = component;
    },
    
    
    setSidebar: function(component) {
        this._sidebar = component;
    },
    
    setNavigationArea: function(component) {
        this._navigationArea = component;
    },
    
    setMainArea: function(component) {
        this._mainArea = component;
    },
    
    
    setControlPane: function(component) {
        this._controlPane = component;
    },
    
    setDescriptionBox: function(component) {
        this._descriptionBox = component;
    },
    
    setExtensionPrefButton: function(component) {
        this._extensionPrefButton = component;
    },
    
    
    // #########################################################################
    // ---
    // Mediator <-> Menu
    
    closeMenu: function() {
        if (!this._menu) {
            Log.logError("Gnomenu.MenuMediator", "closeMenu", "this._menu is null!");
        }
        this._menu.close();
    },
    
    openMenu: function() {
        if (!this._menu) {
            Log.logError("Gnomenu.MenuMediator", "openMenu", "this._menu is null!");
        }
        this._menu.open();
    },
    
    toggleMenu: function() {
        if (!this._menu) {
            Log.logError("Gnomenu.MenuMediator", "toggleMenu", "this._menu is null!");
        }
        if (this._menu.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },
    
    onMenuOpened: function() {
    },
    
    onMenuClosed: function() {
        this._searchField.reset();
        this.selectMenuCategory(this._model.getDefaultShortcutAreaCategory());
    },
    
    onDragBegin: function() {
        this._navigationArea._onDragBegin();
    },
    
    onDragCancelled: function() {
        this._navigationArea._onDragCancelled();
    },
    
    onDragEnd: function() {
        this._navigationArea._onDragEnd();
    },
    
    
    // #########################################################################
    // ---
    // Mediator <-> System
    
    restartShell: function() {
        // code to refresh shell
        this.closeMenu();
        global.reexec_self();
    },
    
    suspendComputer: function() {
        // code to suspend
        this.closeMenu();
        //NOTE: alternate is to check if (Main.panel.statusArea.userMenu._haveSuspend) is true
        loginManager.canSuspend(
            function(result) {
                if (result) {
                    Main.overview.hide();
                    LoginManager.getLoginManager().suspend();
                }
            }
        );
    },
    
    shutdownComputer: function() {
        // code to shutdown (power off)
        // ToDo: GS38 iterates through SystemLoginSession to check for open sessions
        // and displays an openSessionWarnDialog
        this.closeMenu();
        this._session.ShutdownRemote();
    },
    
    logoutSession: function() {
        // code to logout user
        this.closeMenu();
        this._session.LogoutRemote(0);
    },
    
    lockSession: function() {
        // code for lock options
        this.closeMenu();
        Main.overview.hide();
        Main.screenShield.lock(true);
    },
    
    showSystemPreferences: function() {
        this.closeMenu();
        let app = Shell.AppSystem.get_default().lookup_app('gnome-control-center.desktop');
        app.activate();
    },
    
    showPreferences: function() {
        this.closeMenu();
        Main.Util.trySpawnCommandLine(PREFS_DIALOG_CMD);
    },
    
    hideOverview: function() {
        Main.overview.hide();
    },
    
    
    // #########################################################################
    // ---
    // Mediator <-> Search
    
    setSearchSystem: function(system) {
        this._searchSystem = system;
    },
    
    startSearch: function(terms) {
        if (!this._searchSystem) {
            Log.logError("Gnomenu.MenuMediator", "startSearch", "this._searchSystem is null!");
        }
        this._searchSystem.updateSearchResults(terms);
    },
    
    continueSearch: function(terms) {
        if (!this._searchSystem) {
            Log.logError("Gnomenu.MenuMediator", "continueSearch", "this._searchSystem is null!");
        }
        this._searchSystem.updateSearchResults(terms);
    },
    
    stopSearch: function() {
        if (!this._searchSystem) {
            Log.logError("Gnomenu.MenuMediator", "stopSearch", "this._searchSystem is null!");
        }
        this._searchSystem.stopSearch();
    },
    
    
    // #########################################################################
    // ---
    // Mediator <-> MidPane

    selectMenuCategory: function(categoryID) {
        if (!this._mainArea) {
            Log.logError("Gnomenu.MenuMediator", "selectMenuCategory", "this._mainArea is null!");
        }
        this._searchField.reset();
        this._categoryPane.selectButton(categoryID);
        this._navigationArea.setSelectedCategory(categoryID);
        this._mainArea.showCategory(categoryID);
    },
    
    selectShortcutViewMode: function(viewModeID, selectBtn) {
        if (!this._mainArea && !this._viewModePane) {
            Log.logError("Gnomenu.MenuMediator", "selectShortcutViewMode", "this._mainArea or this._viewModePane is null!");
        }
        this._mainArea.setViewMode(viewModeID);
        if (selectBtn) {
            this._viewModePane.selectButton(viewModeID);
        }
    },
    

    // #########################################################################
    // ---
    // Mediator <-> Bottom
    
    getFocusedTitleChanger: function() {
        return Lang.bind(this, function(title) {
            this.setFocusedTitle(title);
        });
    },
    
    getFocusedDescriptionChanger: function() {
        return Lang.bind(this, function(desc) {
            this.setFocusedDescription(desc);
        });
    },
    
    setFocusedTitle: function(title) {
        if (!this._descriptionBox) {
            Log.logError("Gnomenu.MenuMediator", "setFocusedTitle", "this._descriptionBox is null!");
        }
        this._descriptionBox.setTitle(title);
    },
    
    setFocusedDescription: function(desc) {
        if (!this._descriptionBox) {
            Log.logError("Gnomenu.MenuMediator", "setFocusedDescription", "this._descriptionBox is null!");
        }
        this._descriptionBox.setDescription(desc);
    },
    
});
