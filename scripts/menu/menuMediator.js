
const Lang = imports.lang;

const GnomeSession = imports.misc.gnomeSession;
const LoginManager = imports.misc.loginManager;
const Main = imports.ui.main;
const Shell = imports.gi.Shell;
const Clutter = imports.gi.Clutter;

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
        global.stage.set_key_focus(this._menu.actor);
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
    
    onKeyboardEvent: function(actor, event) {
        log("Mediator received key event!");
        
        let state = event.get_state();
        let ctrl_pressed = (state & imports.gi.Clutter.ModifierType.CONTROL_MASK ? true : false);
        let symbol = event.get_key_symbol();
        
        switch (symbol) {
            
            case Clutter.Up:
                this.focusNavigation();
                this._navigationArea._onKeyboardEvent(actor, event);
                break;
            
            case Clutter.Down:
                this.focusNavigation();
                this._navigationArea._onKeyboardEvent(actor, event);
                break;
            
            case Clutter.w:
                if (ctrl_pressed) {
                    this.focusNavigation();
                    this._navigationArea._onKeyboardEvent(actor, event);
                }
                break;
            
            case Clutter.s:
                if (ctrl_pressed) {
                    this.focusNavigation();
                    this._navigationArea._onKeyboardEvent(actor, event);
                }
                break;
            
            case Clutter.Left:
                this.focusSidebar();
                this._sidebar._onKeyboardEvent(actor, event);
                break;
            
            case Clutter.Right:
                this.focusMainArea();
                this._mainArea._onKeyboardEvent(actor, event);
                break;
            
            case Clutter.a:
                if (ctrl_pressed) {
                    this.focusSidebar();
                    this._sidebar._onKeyboardEvent(actor, event);
                }
                break;
            
            case Clutter.d:
                if (ctrl_pressed) {
                    this.focusMainArea();
                    this._mainArea._onKeyboardEvent(actor, event);
                }
                break;
        }
        
        return Clutter.EVENT_STOP;
    },
    
    moveKeyFocusLeft: function() {
        
    },
    
    moveKeyFocusRight: function() {
        
    },
    
    moveKeyFocusTop: function() {
        
    },
    
    moveKeyFocusDown: function() {
        
    },
    
    focusNavigation: function() {
        global.stage.set_key_focus(this._navigationArea.actor);
    },
    
    focusSidebar: function() {
        global.stage.set_key_focus(this._sidebar.actor);
    },
    
    focusMainArea: function() {
        global.stage.set_key_focus(this._mainArea.actor);
    },
    
    focusSearch: function() {
        global.stage.set_key_focus(this._searchField.actor);
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
    // Mediator <-> Apps

    selectMenuCategory: function(categoryID) {
        if (!this._searchField || !this._categoryPane || !this._navigationArea || !this._mainArea) {
            Log.logError("Gnomenu.MenuMediator", "selectMenuCategory", "Something is null!");
        }
        
        this._searchField.reset();
        this._categoryPane.selectCategory(categoryID);
        this._navigationArea.selectCategory(categoryID);
        this._mainArea.showCategory(categoryID);
    },
    
    setViewMode: function(viewMode) {
        if (!this._mainArea) {
            Log.logError("Gnomenu.MenuMediator", "setViewMode", "this._mainArea is null!");
        }
        
        if (viewMode) {
            this._mainArea.setViewMode(viewMode);
        }
    },

    // #########################################################################
    // ---
    // Mediator <-> Info
    
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
        if (this._descriptionBox) {
            this._descriptionBox.setTitle(title);
        }
    },
    
    setFocusedDescription: function(desc) {
        if (this._descriptionBox) {
            this._descriptionBox.setDescription(desc);
        }
    },
});
