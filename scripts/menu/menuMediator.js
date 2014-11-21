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
const GnomeSession = imports.misc.gnomeSession;
const LoginManager = imports.misc.loginManager;
const Main = imports.ui.main;
const Shell = imports.gi.Shell;
const Clutter = imports.gi.Clutter;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const MenuSettings = Me.imports.scripts.menu.menuSettings.MenuSettings;
const Log = Me.imports.scripts.misc.log;


/**
 * @class MenuMediator: The mediator is used by the components to instruct
 *                      another component to do something.
 *
 * @param {Menu} menu
 * @param {MenuModel} model
 *
 *
 * @author AxP
 * @version 1.0
 */
const MenuMediator = new Lang.Class({

    Name: 'Gnomenu.MenuMediator',


    _init: function(menu, settings) {
        this._menu = menu;

        this._menuSettings = new MenuSettings(settings);
        
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
    
    /**
     * @description Returns the settings manager of the menu. This object bundles
     *              the settings so they can easier be modified.
     * @returns {MenuSettings}
     * @public
     * @function
     */
    getMenuSettings: function() {
        return this._menuSettings;
    },

    // #########################################################################
    // --
    // Setter

    /**
     * @description This setter sets the category pane, the component above the
     *              category list.
     * @param {CategoryPane} component
     * @public
     * @function
     */
    setCategoryPane: function(component) {
        this._categoryPane = component;
    },

    /**
     * @description This setter sets the viewmode pane, the component above the
     *              shortcut area.
     * @param {ViewModePane} component
     * @public
     * @function
     */
    setViewModePane: function(component) {
        this._viewModePane = component;
    },

    /**
     * @description This setter sets the searchfield, the component above the
     *              shortcut area.
     * @param {SearchField} component
     * @public
     * @function
     */
    setSearchField: function(component) {
        this._searchField = component;
    },

    /**
     * @description This setter sets the sidebar.
     * @param {Sidebar} component
     * @public
     * @function
     */
    setSidebar: function(component) {
        this._sidebar = component;
    },

    /**
     * @description This setter sets the navigation area, the component with the
     *              category list.
     * @param {NavigationArea} component
     * @public
     * @function
     */
    setNavigationArea: function(component) {
        this._navigationArea = component;
    },

    /**
     * @description This setter sets the main area, the component with the
     *              shortcuts or searchresults.
     * @param {MainArea} component
     * @public
     * @function
     */
    setMainArea: function(component) {
        this._mainArea = component;
    },

    /**
     * @description This setter sets the control pane, the component with
     *              shutdown and logout buttons.
     * @param {ControlPane} component
     * @public
     * @function
     */
    setControlPane: function(component) {
        this._controlPane = component;
    },

    /**
     * @description This setter sets the description box, the component which
     *              provides information about hovered buttons.
     * @param {DescriptionBox} component
     * @public
     * @function
     */
    setDescriptionBox: function(component) {
        this._descriptionBox = component;
    },

    /**
     * @description This setter sets the Settings button, the component right corner.
     * @param {ExtensionPrefButton} component
     * @public
     * @function
     */
    setExtensionPrefButton: function(component) {
        this._extensionPrefButton = component;
    },


    // #########################################################################
    // ---
    // Mediator <-> Menu

    /**
     * @description Method to close the menu.
     * @public
     * @function
     */
    closeMenu: function() {
        if (!this._menu) {
            Log.logError("Gnomenu.MenuMediator", "closeMenu", "this._menu is null!");
        }
        this._menu.close();
    },

    /**
     * @description Method to open the menu.
     * @public
     * @function
     */
    openMenu: function() {
        if (!this._menu) {
            Log.logError("Gnomenu.MenuMediator", "openMenu", "this._menu is null!");
        }
        this._menu.open();
    },

    /**
     * @description Method to toggle the menu.
     * @public
     * @function
     */
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

    /**
     * @description Open event callback.
     * @private
     * @function
     */
    _onMenuOpened: function() {
        // Cleaning up.
        this._searchField.reset();
        this.selectMenuCategory(this.getMenuSettings().getDefaultShortcutAreaCategory());
        this.resetKeyFocus();
    },

    /**
     * @description Close event callback.
     * @private
     * @function
     */
    _onMenuClosed: function() {
    },

    /**
     * @description drag begin inform. Called by the buttons.
     * @public
     * @function
     */
    onDragBegin: function() {
        this._navigationArea._onDragBegin();
    },

    /**
     * @description drag cancel inform. Called by the buttons.
     * @public
     * @function
     */
    onDragCancelled: function() {
        this._navigationArea._onDragCancelled();
    },

    /**
     * @description drag end inform. Called by the buttons.
     * @public
     * @function
     */
    onDragEnd: function() {
        this._navigationArea._onDragEnd();
    },
    
    resetKeyFocus: function() {
        // Sets the focus to the menu for the key controls.
        global.stage.set_key_focus(this._navigationArea.actor);
        this._focusedComponent = this._navigationArea;
    },

    /**
     * @description Handles the keyboard event. This is the toplevel handler which
     *              begins the keyboard handling.
     * @private
     * @function
     */
    _onKeyboardEvent: function(actor, event) {
        log("Mediator received key event!");
         let ret = Clutter.EVENT_PROPAGATE;
         
        let state = event.get_state();
        let ctrl_pressed = (state & Clutter.ModifierType.CONTROL_MASK ? true : false);
        let symbolID = event.get_key_symbol();
        
        // Refresh the search only if the key is important for the search.
        if (this._searchField.hasText() || this._shouldTriggerSearch(symbolID)) {
            this._searchField.activateFocus(actor, event);
            this._focusedComponent = this._searchField;
            
            ret = Clutter.EVENT_STOP;
        }
        
        return ret;
    },

    /**
     * @description This function determines wether an input was important for the search.
     * @param {Integer} symbolID The Clutter symbol ID.
     * @returns {Boolean}
     * @private
     * @function
     */
    _shouldTriggerSearch: function(symbolID) {
        // This keys are important because they delete chars.
        if (( symbolID == Clutter.BackSpace ||
              symbolID == Clutter.Delete ||
              symbolID == Clutter.KEY_space) &&
              this._searchActive) {
            return true;
        }

        // It should be an char you would write into a searchbox.
        let unicode = Clutter.keysym_to_unicode(symbolID);
        if (unicode == 0) {
            return false;
        }

        if (this._searchField._getTermsForSearchString(String.fromCharCode(unicode)).length > 0) {
            return true;
        }

        return false;
    },

    moveKeyFocusLeft: function(actor, event) {
        let gid = -1;
        if (this._focusedComponent && this._focusedComponent.actor) {
            gid = this._focusedComponent.actor.get_gid();
        }
        
        let ret = Clutter.EVENT_PROPAGATE;
        switch (gid) {
            
            case this._sidebar.actor.get_gid():
                // Nothing to the left here.
                ret = Clutter.EVENT_STOP;
                break;
            
            case this._navigationArea.actor.get_gid():
                global.stage.set_key_focus(this._sidebar.actor);
                this._focusedComponent = this._sidebar;
                this._sidebar._onKeyboardEvent(actor, event, true);
                ret = Clutter.EVENT_STOP;
                break;
            
            case this._mainArea.actor.get_gid():
                this._searchField.reset();
                
                global.stage.set_key_focus(this._navigationArea.actor);
                this._focusedComponent = this._navigationArea;
                this._navigationArea._onKeyboardEvent(actor, event, true);
                ret = Clutter.EVENT_STOP;
                break;
            
            case this._searchField.actor.get_gid():
                ret = Clutter.EVENT_STOP;
                break;
            
            default:
                global.stage.set_key_focus(this._sidebar.actor);
                this._focusedComponent = this._sidebar;
                this._sidebar._onKeyboardEvent(actor, event, true);
                ret = Clutter.EVENT_STOP;
                break;
        }
        
        return ret;
    },

    moveKeyFocusRight: function(actor, event) {
        let gid = -1;
        if (this._focusedComponent && this._focusedComponent.actor) {
            gid = this._focusedComponent.actor.get_gid();
        }
        
        let ret = Clutter.EVENT_PROPAGATE;
        switch (gid) {
            
            case this._sidebar.actor.get_gid():
                global.stage.set_key_focus(this._navigationArea.actor);
                this._focusedComponent = this._navigationArea;
                this._navigationArea._onKeyboardEvent(actor, event, true);
                ret = Clutter.EVENT_STOP;
                break;
            
            case this._navigationArea.actor.get_gid():
                global.stage.set_key_focus(this._mainArea.actor);
                this._focusedComponent = this._mainArea;
                this._mainArea._onKeyboardEvent(actor, event, true);
                ret = Clutter.EVENT_STOP;
                break;
            
            case this._mainArea.actor.get_gid():
                // Nothing to the right here.
                ret = Clutter.EVENT_STOP;
                break;
            
            case this._searchField.actor.get_gid():
                ret = Clutter.EVENT_STOP;
                break;
            
            default:
                global.stage.set_key_focus(this._mainArea.actor);
                this._focusedComponent = this._mainArea;
                this._mainArea._onKeyboardEvent(actor, event, true);
                ret = Clutter.EVENT_STOP;
                break;
        }
        
        return ret;
    },

    moveKeyFocusUp: function(actor, event) {
        let gid = -1;
        if (this._focusedComponent && this._focusedComponent.actor) {
            gid = this._focusedComponent.actor.get_gid();
        }
        
        let ret = Clutter.EVENT_PROPAGATE;
        switch (gid) {
            
            case this._sidebar.actor.get_gid():
                ret = Clutter.EVENT_STOP;
                break;
            
            case this._navigationArea.actor.get_gid():
                ret = Clutter.EVENT_STOP;
                break;
            
            case this._mainArea.actor.get_gid():
                ret = Clutter.EVENT_STOP;
                break;
            
            case this._searchField.actor.get_gid():
                ret = Clutter.EVENT_STOP;
                break;
            
            default:
                ret = Clutter.EVENT_STOP;
                break;
        }
        
        return ret;
    },

    moveKeyFocusDown: function(actor, event) {
        let gid = -1;
        if (this._focusedComponent && this._focusedComponent.actor) {
            gid = this._focusedComponent.actor.get_gid();
        }
        
        let ret = Clutter.EVENT_PROPAGATE;
        switch (gid) {
            
            case this._sidebar.actor.get_gid():
                ret = Clutter.EVENT_STOP;
                break;
            
            case this._navigationArea.actor.get_gid():
                ret = Clutter.EVENT_STOP;
                break;
            
            case this._mainArea.actor.get_gid():
                ret = Clutter.EVENT_STOP;
                break;
            
            case this._searchField.actor.get_gid():
                global.stage.set_key_focus(this._mainArea.actor);
                this._focusedComponent = this._mainArea;
                this._mainArea._onKeyboardEvent(actor, event, true);
                ret = Clutter.EVENT_STOP;
                break;
            
            default:
                global.stage.set_key_focus(this._navigationArea.actor);
                this._focusedComponent = this._navigationArea;
                this._navigationArea._onKeyboardEvent(actor, event, true);
                ret = Clutter.EVENT_STOP;
                break;
        }
        
        return ret;
    },

    // #########################################################################
    // ---
    // Mediator <-> System

    /**
     * @description This method restarts the shell.
     * @public
     * @function
     */
    restartShell: function() {
        // code to refresh shell
        this.closeMenu();
        global.reexec_self();
    },

    /**
     * @description This method suspends the computer.
     * @public
     * @function
     */
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

    /**
     * @description This method shuts the computer down.
     * @public
     * @function
     */
    shutdownComputer: function() {
        // code to shutdown (power off)
        // ToDo: GS38 iterates through SystemLoginSession to check for open sessions
        // and displays an openSessionWarnDialog
        this.closeMenu();
        this._session.ShutdownRemote();
    },

    /**
     * @description This method logs the user out.
     * @public
     * @function
     */
    logoutSession: function() {
        // code to logout user
        this.closeMenu();
        this._session.LogoutRemote(0);
    },

    /**
     * @description This method locks the session.
     * @public
     * @function
     */
    lockSession: function() {
        // code for lock options
        this.closeMenu();
        Main.overview.hide();
        Main.screenShield.lock(true);
    },

    /**
     * @description This method opens the gnome control center.
     * @public
     * @function
     */
    showSystemPreferences: function() {
        this.closeMenu();
        let app = Shell.AppSystem.get_default().lookup_app('gnome-control-center.desktop');
        app.activate();
    },

    /**
     * @description This method opens the extension settings.
     * @public
     * @function
     */
    showPreferences: function() {
        this.closeMenu();
        Main.Util.trySpawnCommandLine('gnome-shell-extension-prefs ' + Me.metadata['uuid']);
    },

    /**
     * @description This method hides the overview.
     * @public
     * @function
     */
    hideOverview: function() {
        Main.overview.hide();
    },


    // #########################################################################
    // ---
    // Mediator <-> Search

    /**
     * @description Setter to set the searchsystem.
     * @param {SearchSystem} system
     * @public
     * @function
     */
    setSearchSystem: function(system) {
        this._searchSystem = system;
    },

    /**
     * @description This method starts a search run. After the start continue with
     *              the continueSearch method.
     * @param {List} terms
     * @public
     * @function
     */
    startSearch: function(terms) {
        if (!this._searchSystem) {
            Log.logError("Gnomenu.MenuMediator", "startSearch", "this._searchSystem is null!");
        }
        this._searchSystem.updateSearchResults(terms);
    },

    /**
     * @description This method continues a search run. To end the search call
     *              stopSearch.
     * @param {List} terms
     * @public
     * @function
     */
    continueSearch: function(terms) {
        if (!this._searchSystem) {
            Log.logError("Gnomenu.MenuMediator", "continueSearch", "this._searchSystem is null!");
        }
        this._searchSystem.updateSearchResults(terms);
    },

    /**
     * @description This method stops a search run.
     * @public
     * @function
     */
    stopSearch: function() {
        if (!this._searchSystem) {
            Log.logError("Gnomenu.MenuMediator", "stopSearch", "this._searchSystem is null!");
        }
        this._searchSystem.stopSearch();
    },


    // #########################################################################
    // ---
    // Mediator <-> Apps

    /**
     * @description This method selects a category by ID. It changes all affected
     *              components.
     * @param {Enum} categoryID
     * @public
     * @function
     */
    selectMenuCategory: function(categoryID) {
        if (!this._searchField || !this._categoryPane || !this._navigationArea || !this._mainArea) {
            Log.logError("Gnomenu.MenuMediator", "selectMenuCategory", "Something is null!");
        }

        this._searchField.reset();
        this._categoryPane.selectCategory(categoryID);
        this._navigationArea.selectCategory(categoryID);
        this._mainArea.showCategory(categoryID);
    },

    /**
     * @description This method sets the viewmode. It changes all affected
     *              components.
     * @param {Enum} viewMode
     * @public
     * @function
     */
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

    /**
     * @description This method returns a function with which you can change
     *              the description box title by calling it with a string.
     * @returns {Bound Function(String)}
     * @public
     * @function
     */
    getFocusedTitleChanger: function() {
        return Lang.bind(this, function(title) {
            this.setFocusedTitle(title);
        });
    },

    /**
     * @description This method returns a function with which you can change
     *              the description box description by calling it with a string.
     * @returns {Bound Function(String)}
     * @public
     * @function
     */
    getFocusedDescriptionChanger: function() {
        return Lang.bind(this, function(desc) {
            this.setFocusedDescription(desc);
        });
    },

    /**
     * @description This method lets you change the description box title.
     * @param {String} title
     * @public
     * @function
     */
    setFocusedTitle: function(title) {
        if (this._descriptionBox) {
            this._descriptionBox.setTitle(title);
        }
    },

    /**
     * @description This method lets you change the description box description.
     * @param {String} desc
     * @public
     * @function
     */
    setFocusedDescription: function(desc) {
        if (this._descriptionBox) {
            this._descriptionBox.setDescription(desc);
        }
    },
});
