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
const Mainloop = imports.mainloop;

const Main = imports.ui.main;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const MenuSettings = Me.imports.scripts.menu.menuSettings.MenuSettings;
const Log = Me.imports.scripts.misc.log;



/**
 * @class MenuMediator
 *
 * @classdesc The mediator is kinda like the glue between the different
 *            components. That way the components are easier to replace and
 *            you dont have to search a lot in the code to find changed
 *            method calls. All communication is handled about this class
 *            and non of the components know about the other components. The
 *            methods of this class are mostly ones that are called by the
 *            components to notify about something or methods to call
 *            something of bigger scope.
 *
 * @description The constructor must be called with a valid menu and a valid
 *              gsettings instance.
 * 
 *
 * @param {Menu} menu
 * @param {MenuModel} model
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const MenuMediator = new Lang.Class({

    Name: 'Gnomenu.MenuMediator',


    _init: function(menu, settings) {
        this._menu = menu;

        this._menuSettings = new MenuSettings(settings);

        // Scroll down for getters/setters.
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
     * @function
     * @memberOf MenuMediator#
     */
    getMenuSettings: function() {
        return this._menuSettings;
    },
    
    destroy: function() {
        this._menuSettings.destroy();
    },


    // #########################################################################
    // ---
    // Manual controls.

    /**
     * @description This method selects a category by ID. It changes all affected
     *              components. This is not called by the navigationarea. This
     *              component uses a notify method to tell the mediator that
     *              the category changed.
     * @param {StringEnum} categoryID
     * @function
     * @memberOf MenuMediator#
     */
    selectMenuCategory: function(categoryID) {
        this._searchField.reset();
        this._categoryPane.selectCategory(categoryID);
        this._navigationArea.selectCategory(categoryID);
        this._mainArea.showCategory(categoryID);
    },

    /**
     * @description This method sets the viewmode. It changes all affected
     *              components. It is not called by the viewmode component
     *              but by init code. The pane itself uses a notify method to
     *              tell the mediator that the viewmode changed.
     * @param {IntegerEnum} viewMode
     * @function
     * @memberOf MenuMediator#
     */
    setViewMode: function(viewMode) {
        if (viewMode) {
            this._mainArea.setViewMode(viewMode);
            this._viewModePane.selectButton(viewMode);
        }
    },

    /**
     * @description Method to close the menu.
     * @function
     * @memberOf MenuMediator#
     */
    closeMenu: function() {
        if (!this._menu) {
            Log.logError("Gnomenu.MenuMediator", "closeMenu", "this._menu is null!");
        }
        this._menu.close();
    },

    /**
     * @description Method to open the menu.
     * @function
     * @memberOf MenuMediator#
     */
    openMenu: function() {
        if (!this._menu) {
            Log.logError("Gnomenu.MenuMediator", "openMenu", "this._menu is null!");
        }
        this._menu.open();
    },

    /**
     * @description Method to toggle the menu.
     * @function
     * @memberOf MenuMediator#
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


    // #########################################################################
    // ---
    // Mediator <-> Search

    /**
     * @description Setter to set the searchsystem.
     * @param {SearchSystem} system
     * @function
     * @memberOf MenuMediator#
     */
    setSearchSystem: function(system) {
        this._searchSystem = system;
    },

    /**
     * @description This method starts a search run. After the start continue with
     *              the continueSearch method.
     * @param {StringList} terms
     * @function
     * @memberOf MenuMediator#
     */
    startSearch: function(terms) {
        this._searchSystem.updateSearchResults(terms);
    },

    /**
     * @description This method continues a search run. To end the search call
     *              stopSearch.
     * @param {StringList} terms
     * @function
     * @memberOf MenuMediator#
     */
    continueSearch: function(terms) {
        this._searchSystem.updateSearchResults(terms);
    },

    /**
     * @description This method stops a search run. This call makes the searchsystem
     *              clear its buffer. You should call it when the searchfield
     *              is cleared.
     * @function
     * @memberOf MenuMediator#
     */
    stopSearch: function() {
        this._searchSystem.stopSearch();
    },
    
    
    // #########################################################################
    // ---
    // Mediator Notifications
    
    /**
     * @description This method notifies the mediator that the menu was opened.
     * @function
     * @memberOf MenuMediator#
     */
    notifyMenuOpened: function() {
        this.selectMenuCategory(this.getMenuSettings().getDefaultShortcutAreaCategory());
        this.resetKeyFocus();
    },
    
    /**
     * @description This method notifies the mediator that the menu was closed.
     * @function
     * @memberOf MenuMediator#
     */
    notifyMenuClosed: function() {
        Mainloop.timeout_add(50, Lang.bind(this, function() {

            // Cleaning up.
            this._searchField.reset();
        
            this._categoryPane.clean();
            this._viewModePane.clean();
    
            this._sidebar.clean();
            this._navigationArea.clean();
            this._mainArea.clean();
    
            this._controlPane.clean();
            this._extensionPrefButton.clean();

            this._descriptionBox.setTitle(null);
            this._descriptionBox.setDescription(null);
            
            return false;

        }));
    },
    
    /**
     * @description This notifies the mediator about an app activation. This
     *              means that an external app was started. The mediator then
     *              takes the steps needed to handle whatever should happen
     *              after a launch.
     * @param {Clutter.Actor} actor
     * @param {Clutter.Event} event
     * @function
     * @memberOf MenuMediator#
     */
    notifyActivation: function(actor, event) {
        this.closeMenu();
        Main.overview.hide();
    },
    
    /**
     * @description This method informs the mediator that an element was hovered.
     *              The mediator then tries to trigger the descriptionbox to
     *              show more information about the hovered element.
     * @param {Clutter.Actor} actor This actor provides the information.
     * @param {Clutter.Event} event
     * @param {Boolean} entered If the element was entered.
     * @function
     * @memberOf MenuMediator#
     */
    notifyHover: function(actor, event, entered) {
        // It is possible that the needed informations are not available.
        if (entered && actor._delegate) {
            if (actor._delegate.getButtonInfoTitle && actor._delegate.getButtonInfoTitle()) {
                let title = _(actor._delegate.getButtonInfoTitle());
                this._descriptionBox.setTitle(title);
            } else {
                this._descriptionBox.setTitle(null);
            }
            
            if (actor._delegate.getButtonInfoDescription && actor._delegate.getButtonInfoDescription()) {
                let desc = _(actor._delegate.getButtonInfoDescription());
                this._descriptionBox.setDescription(desc);
            } else {
                this._descriptionBox.setDescription(null);
            }
            
        } else {
            this._descriptionBox.setTitle(null);
            this._descriptionBox.setDescription(null);
        }
    },
    
    /**
     * @description This method notifies the mediator that a button drag has
     *              began. The components that need this information are then
     *              informed.
     * @function
     * @memberOf MenuMediator#
     */
    notifyDragBegin: function() {
        this._navigationArea.onDragBegin();
    },

    /**
     * @description This method notifies the mediator that a button drag was
     *              cancelled. The components that need this information are then
     *              informed.
     * @function
     * @memberOf MenuMediator#
     */
    notifyDragCancelled: function() {
        this._navigationArea.onDragCancelled();
    },

    /**
     * @description This method notifies the mediator that a button drag has
     *              ended. The components that need this information are then
     *              informed.
     * @function
     * @memberOf MenuMediator#
     */
    notifyDragEnd: function() {
        this._navigationArea.onDragEnd();
    },
    
    /**
     * @description This method notifies the mediator about a category change.
     *              It then handles this change and sends it to other components
     *              that need this information.
     * @param {StringEnum} categoryID The category ID.
     * @function
     * @memberOf MenuMediator#
     */
    notifyCategoryChange: function(categoryID) {
        if (categoryID) {
            this._searchField.reset();
            this._navigationArea.selectCategory(categoryID);
            this._categoryPane.selectCategory(categoryID);
            this._mainArea.showCategory(categoryID);
            this.resetKeyFocus();
        }
    },
    
    /**
     * @description This method notifies the mediator that the category was
     *              changed. It then triggers the appropriate response from
     *              the other components.
     * @param {IntegerEnum} viewmode The viewmode ID.
     * @function
     * @memberOf MenuMediator#
     */
    notifyViewModeChange: function(viewmode) {
        if (viewmode) {
            this._mainArea.setViewMode(viewmode);
        }
    },
    
    // #########################################################################
    // ---
    // Mediator Keyboard Handling
    
    /**
     * @description This function resets the keyfocus to the default component.
     *              At the moment this is the navigation area to select a
     *              category.
     * @function
     * @memberOf MenuMediator#
     */
    resetKeyFocus: function() {
        // Sets the focus to the menu for the key controls.
        global.stage.set_key_focus(this._navigationArea.actor);
        this._focusedComponent = this._navigationArea;
    },
    
    /**
     * @description This function sets the keyfocus to the searchfield. It
     *              is needed to handle mouse-focus-activation properly. This
     *              method is called when the user activates the searchfield
     *              with a click. Without this call the keyboard controls
     *              wont work properly.
     * @param {Clutter.Actor} actor
     * @param {Clutter.Event} event
     * @function
     * @memberOf MenuMediator#
     */
    activateSearchfieldKeyFocus: function(actor, event) {
        this._searchField.activateFocus(actor, event);
        this._focusedComponent = this._searchField;
    },

    /**
     * @description Handles the keyboard event. This is the toplevel handler which
     *              begins the keyboard handling. It is registered in such a way
     *              that the component events can bubble up to this handler.
     *              If you press a normal char-key it is probable that it bubbles
     *              up to this handler and is then send to the search.
     * @param {Clutter.Actor} actor
     * @param {Clutter.Event} event
     * @returns {Boolean} If event was handled.
     * @private
     * @function
     * @memberOf MenuMediator#
     */
    _onKeyboardEvent: function(actor, event) {
        log("Mediator received key event!");
         let ret = Clutter.EVENT_PROPAGATE;
         
        let state = event.get_state();
        let ctrl_pressed = (state & Clutter.ModifierType.CONTROL_MASK ? true : false);
        let symbolID = event.get_key_symbol();
        
        // Refresh the search only if the key is important for the search.
        if (this._shouldTriggerSearch(symbolID)) {
            this._searchField.activateFocus(actor, event);
            this._focusedComponent = this._searchField;
            
            ret = Clutter.EVENT_STOP;
        }
        
        return ret;
    },

    /**
     * @description This function determines wether an input was important for the search
     *              or if it is better handled by the currently focused component.
     *              For example all normal keystrokes should be delivered to the
     *              searchfield if they are not needed elsewhere so that the
     *              search can start immediately.
     * @param {Integer} symbolID The Clutter symbol ID.
     * @returns {Boolean} If the symbol should trigger the search.
     * @private
     * @function
     * @memberOf MenuMediator#
     */
    _shouldTriggerSearch: function(symbolID) {
        // This keys are important because they delete chars.
        if (( symbolID == Clutter.BackSpace ||
              symbolID == Clutter.Delete    ||
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

    /**
     * @description This function sets the key focus to the next possible
     *              component to the left of the currently
     *              focused component. You may provide the data of the last
     *              received event which is not handable in the old
     *              component so that it is not wasted.
     * @param {Clutter.Actor} actor
     * @param {Clutter.Event} event
     * @function
     * @memberOf MenuMediator#
     */
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

    /**
     * @description This function sets the key focus to the next possible
     *              component to the right of the currently
     *              focused component. You may provide the data of the last
     *              received event which is not handable in the old
     *              component so that it is not wasted.
     * @param {Clutter.Actor} actor
     * @param {Clutter.Event} event
     * @function
     * @memberOf MenuMediator#
     */
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

    /**
     * @description This function sets the key focus to the next possible
     *              component in upwards direction from the currently
     *              focused component. You may provide the data of the last
     *              received event which is not handable in the old
     *              component so that it is not wasted.
     * @param {Clutter.Actor} actor
     * @param {Clutter.Event} event
     * @function
     * @memberOf MenuMediator#
     */
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

    /**
     * @description This function sets the key focus to the next possible
     *              component in downwards direction from the currently
     *              focused component. You may provide the data of the last
     *              received event which is not handable in the old
     *              component so that it is not wasted.
     * @param {Clutter.Actor} actor
     * @param {Clutter.Event} event
     * @function
     * @memberOf MenuMediator#
     */
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
    // --
    // Component Setter.

    /**
     * @description This setter sets the category pane, the component above the
     *              category list.
     * @param {CategoryPane} component
     * @function
     * @memberOf MenuMediator#
     */
    setCategoryPane: function(component) {
        this._categoryPane = component;
    },

    /**
     * @description This setter sets the viewmode pane, the component above the
     *              shortcut area.
     * @param {ViewModePane} component
     * @function
     * @memberOf MenuMediator#
     */
    setViewModePane: function(component) {
        this._viewModePane = component;
    },

    /**
     * @description This setter sets the searchfield, the component above the
     *              shortcut area.
     * @param {SearchField} component
     * @function
     * @memberOf MenuMediator#
     */
    setSearchField: function(component) {
        this._searchField = component;
    },

    /**
     * @description This setter sets the sidebar.
     * @param {Sidebar} component
     * @function
     * @memberOf MenuMediator#
     */
    setSidebar: function(component) {
        this._sidebar = component;
    },

    /**
     * @description This setter sets the navigation area, the component with the
     *              category button list.
     * @param {NavigationArea} component
     * @function
     * @memberOf MenuMediator#
     */
    setNavigationArea: function(component) {
        this._navigationArea = component;
    },

    /**
     * @description This setter sets the main area, the component with the
     *              shortcuts or searchresults.
     * @param {MainArea} component
     * @function
     * @memberOf MenuMediator#
     */
    setMainArea: function(component) {
        this._mainArea = component;
    },

    /**
     * @description This setter sets the control pane, the component with
     *              shutdown and logout buttons.
     * @param {ControlPane} component
     * @function
     * @memberOf MenuMediator#
     */
    setControlPane: function(component) {
        this._controlPane = component;
    },

    /**
     * @description This setter sets the description box, the component which
     *              provides information about hovered buttons.
     * @param {DescriptionBox} component
     * @function
     * @memberOf MenuMediator#
     */
    setDescriptionBox: function(component) {
        this._descriptionBox = component;
    },

    /**
     * @description This setter sets the Settings button.
     * @param {ExtensionPrefButton} component
     * @function
     * @memberOf MenuMediator#
     */
    setExtensionPrefButton: function(component) {
        this._extensionPrefButton = component;
    },
});
