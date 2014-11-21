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
const St = imports.gi.St;
const Gtk = imports.gi.Gtk;
const Clutter = imports.gi.Clutter;
const Mainloop = imports.mainloop;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const MenuModel = Me.imports.scripts.menu.menuModel;
const Log = Me.imports.scripts.misc.log;
const GnoMenuThumbnailsBox = Me.imports.scripts.menu.components.elements.workspaceThumbnail.GnoMenuThumbnailsBox;
const TextButton = Me.imports.scripts.menu.components.elements.menubutton.TextButton;
const UpdateableComponent = Me.imports.scripts.menu.components.component.UpdateableComponent;

const ECategoryID = MenuModel.ECategoryID;
const EEventType = MenuModel.EEventType;
const ESelectionMethod = MenuModel.ESelectionMethod;

/** @constant */
const WORKSPACE_SWITCH_WAIT_TIME = 200;
/** @constant */
const CATEGORY_SWITCH_WAIT_TIME = 50;


/**
 * @class NavigationBox: This class is the base class for the navigation box
 *                       elements. That means the workspace view and the
 *                       category view extend this class. This class provides the
 *                       box for these views.
 * @param {Object} params Layout parameters for the actor.
 *
 * @property {Clutter.Actor} actor The clutter actor of this component.
 *
 *
 * @author AxP
 * @version 1.0
 */
const NavigationBox = new Lang.Class({

    Name: 'Gnomenu.navigationArea.NavigationBox',


    _init: function(params) {
        this.actor = new St.BoxLayout(params);
    },

    /**
     * @description Shows the component.
     * @public
     * @function
     */
    show: function() {
        this.actor.show();
    },
    
    /**
     * @description Hides the component.
     * @public
     * @function
     */
    hide: function() {
        this.actor.hide();
    },

    /**
     * @description Returns if the component is visible.
     * @returns {Boolean}
     * @public
     * @function
     */
    isVisible: function() {
        return this.actor.visible;
    },

    /**
     * @description Changes the visibility of the component.
     * @public
     * @function
     */
    toggleVisibility: function() {
        if (this.actor.visible) {
            this.hide();
        } else {
            this.show();
        }
    },
});


/**
 * @class WorkspaceBox: This is the component which contains the workspace views.
 *                      It provides mouse and keyboard controls. To integrate
 *                      drag events it needs to get this events from the buttons.
 * @extends NavigationBox
 *
 * @param {MenuModel} model A model instance.
 * @param {MenuMediator} mediator A mediator instance.
 *
 * @property {Clutter.Actor} actor The clutter actor of this component.
 *
 *
 * @author AxP
 * @version 1.0
 */
const WorkspaceBox = new Lang.Class({

    Name: 'Gnomenu.navigationArea.WorkspaceBox',
    Extends: NavigationBox,


    _init: function(mediator) {
        this.parent({ style_class: 'gnomenu-workspaces-box', vertical: true });

        /*
         * The GnoMenuThumbnailsBox is essentially a smaller version of the
         * normal workspace view. The code taken for this is mostly the same
         * than original.
         */
        this._thumbnailsBox = new GnoMenuThumbnailsBox(mediator);
        this.actor.add(this._thumbnailsBox.actor);
        
        this._thumbnailsBox.createThumbnails();
        // Because the size of the windows does not affect the actor we fix the height.
        this._allocationID = this.actor.connect('notify::allocation', Lang.bind(this, function() {
            // This needs to happen after allocation to prevent St errors.
            this.actor.height = this._thumbnailsBox.getEstimatedHeight();
            this.actor.disconnect(this._allocationID);
            this._allocationID = undefined;
        }));
    },
    
    show: function() {
        this._thumbnailsBox.createThumbnails();
        this.actor.show();
    },
    
    hide: function() {
        this._thumbnailsBox.destroyThumbnails();
        this.actor.hide();
    },

    activateFirst: function() {
        let metaWorkspace = global.screen.get_workspace_by_index(0);
		if (metaWorkspace) {
            metaWorkspace.activate(true);
        }
    },
    
    /**
     * @description Activates the next workspace window.
     * @public
     * @function
     */
    activateNext: function() {
        this._switch(+1);
    },

    /**
     * @description Activates the previous workspace window.
     * @public
     * @function
     */
    activatePrevious: function() {
        this._switch(-1);
    },
    
    getActivatedElementBounds: function() {
        return this._thumbnailsBox.getActiveThumbnailBounds();
    },

    /**
     * @description Helper to switch the workspace.
     * @param {Integer} diff +1 or -1 for up or down.
     * @private
     * @function
     * @author Mostly scroll-workspaces@gfxmonk.net. Modified by AxP.
     */
    _switch: function(diff) {
		let newIndex = global.screen.get_active_workspace().index() + diff;
        let metaWorkspace = global.screen.get_workspace_by_index(newIndex);
		if (metaWorkspace) {
            metaWorkspace.activate(true);
        }
    },

    /**
     * @description Informs the thumbnailsbox about a drag begin.
     * @private
     * @function
     */
    _onDragBegin: function() {
        this._thumbnailsBox.onDragBegin();
    },

    /**
     * @description Informs the thumbnailsbox about a drag cancel.
     * @private
     * @function
     */
    _onDragCancelled: function() {
        this._thumbnailsBox.onDragCancelled();
    },

    /**
     * @description Informs the thumbnailsbox about a drag end.
     * @private
     * @function
     */
    _onDragEnd: function() {
        this._thumbnailsBox.onDragEnd();
    },

    /**
     * @description Destroys the component.
     * @public
     * @function
     */
    destroy: function() {
        if (this._actorLeaveEventID) {
            this.actor.disconnect(this._actorLeaveEventID);
        }
        this._thumbnailsBox.destroyThumbnails();
        this.actor.destroy();
    }
});


/**
 * @class CategoryBox: The category box contains the category buttons. It
 *                     provides keycontrol. For them to work the component needs
 *                     key focus.
 * @extends NavigationBox
 *
 * @param {MenuModel} model A model instance.
 * @param {MenuMediator} mediator A mediator instance.
 *
 * @property {Clutter.Actor} actor The clutter actor of this component.
 *
 *
 * @author AxP
 * @version 1.0
 */
const CategoryBox = new Lang.Class({

    Name: 'Gnomenu.navigationArea.CategoryBox',
    Extends: NavigationBox,


    _init: function(model, mediator) {
        this.parent({ style_class: 'gnomenu-categories-box', vertical: true });

        this._mediator = mediator;
        this._model = model;
        this._categoryButtonMap = {};
        this._selected = null;
    },
    
    activateFirst: function() {
        let keys = Object.keys(this._categoryButtonMap);
        let nextID = keys[0];

        this.activateCategory(nextID);
    },

    /**
     * @description Activates the next category.
     * @public
     * @function
     */
    activateNext: function() {
        if (!this._selected) {
            return;
        }

        let keys = Object.keys(this._categoryButtonMap);
        let selectedIdx = keys.indexOf(this._selected);
        let nextIdx = (selectedIdx + 1) % keys.length;
        let nextID = keys[nextIdx];

        this.activateCategory(nextID);
    },

    /**
     * @description Activates the previous category.
     * @public
     * @function
     */
    activatePrevious: function() {
        if (!this._selected) {
            return;
        }

        let keys = Object.keys(this._categoryButtonMap);
        let selectedIdx = keys.indexOf(this._selected);
        let previousIdx = selectedIdx - 1;
        if (previousIdx < 0) {
            previousIdx += keys.length;
        }
        let previousID = keys[previousIdx];

        this.activateCategory(previousID);
    },
    
    getActivatedElementBounds: function() {
        if (!this._selected) {
            return null;
        }
        
        let btnBox = null;
        if (this._categoryButtonMap[this._selected]) {
            let btn = this._categoryButtonMap[this._selected];
            btnBox = btn.actor.get_allocation_box();
        }
        
        return btnBox;
    },

    /**
     * @description Adds a category button.
     * @param {Enum} categoryID The category id.
     * @param {String} categoryNameID Can be a gettext variable.
     * @param {String} categoryDescriptionID Can be a gettext variable.
     * @public
     * @function
     */
    addCategory: function(categoryID, categoryNameID, categoryDescriptionID) {
        if (this._categoryButtonMap[categoryID]) {
            return;
        }

        if (!categoryNameID) {
            categoryNameID = categoryID;
        }

        // The button can be activated with click or hover actions.
        let btn = new TextButton(this._mediator, categoryNameID, categoryNameID, categoryDescriptionID);
        switch (this._mediator.getMenuSettings().getCategorySelectionMethod()) {

            case ESelectionMethod.CLICK:
                btn.setOnLeftClickHandler(Lang.bind(this, function() {
                    this._mediator.selectMenuCategory(categoryID);
                }));
                break;

            case ESelectionMethod.HOVER:
                btn.setOnHoverHandler(Lang.bind(this, function() {
                    this._mediator.selectMenuCategory(categoryID);
                }));
                break;

            default:
                break;
        }
        this._categoryButtonMap[categoryID] = btn;
        this.actor.add_actor(btn.actor);
    },

    /**
     * @description Selects the button connected to the category.
     * @param {Enum} categoryID The category id.
     * @public
     * @function
     */
    selectCategory: function(categoryID) {
        for each (let btn in this._categoryButtonMap) {
            btn.deselect();
        }

        if (categoryID && this._categoryButtonMap[categoryID]) {
            this._categoryButtonMap[categoryID].select();
            this._selected = categoryID;
        }
    },
    
    activateCategory: function(categoryID) {
        this.selectCategory(categoryID);
        this._mediator.selectMenuCategory(categoryID);
    },

    /**
     * @description Clears the buttons from the component.
     * @public
     * @function
     */
    clear: function() {
        for each (let btn in this._categoryButtonMap) {
            btn.actor.destroy();
        }
        this._categoryButtonMap = {};
        this._selected = null;
    },

    /**
     * @description Destroys the component.
     * @public
     * @function
     */
    destroy: function() {
        this.clear();
        this.actor.destroy();
    }
});


/**
 * @class NavigationArea: This area combines workspaces and categories. You can
 *                        toggle between them with a specific key. On top of that
 *                        the drag and drop is integrated so that the workspaces
 *                        are visible while dragging.
 * @extends UpdateableComponent
 *
 * @param {MenuModel} model A model instance.
 * @param {MenuMediator} mediator A mediator instance.
 *
 * @property {Clutter.Actor} actor The clutter actor of this component.
 *
 *
 * @author AxP
 * @version 1.0
 */
const NavigationArea = new Lang.Class({
    /*
     * Scrolling and changing workspaces while in workspace view can effect
     * each other. This may not be a problem though.
     */

    Name: 'Gnomenu.navigationArea.NavigationArea',
    Extends: UpdateableComponent,


    _init: function(model, mediator) {
        this.parent(model, mediator);

        this._mainbox = new St.BoxLayout({ style_class: 'gnomenu-categories-workspaces-wrapper', vertical: false });
        this._workspaceBox = new WorkspaceBox(mediator);
        this._categoryBox = new CategoryBox(model, mediator);
        this._mainbox.add(this._workspaceBox.actor, { expand: true, x_fill: true });
        this._mainbox.add(this._categoryBox.actor, { expand: true, x_fill: true });

        // Atm the scrolling of the view is handled manually to prevent glitches.
        let scrollBox = new St.ScrollView({ reactive: true, enable_mouse_scrolling: false, style_class: 'gnomenu-categories-workspaces-scrollbox' });
        scrollBox.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.NEVER);
        scrollBox.set_mouse_scrolling(true);
        scrollBox.add_actor(this._mainbox, { expand: true, x_fill: true });
        scrollBox.connect('button-release-event', Lang.bind(this, function(actor, event) {
            // The mouse button to toggle between the views is the right mouse button.
            let button = event.get_button();
            if (button == 3) {
                this.toggleView();
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        }));
        this.actor = scrollBox;

        // Fixes the width of the workspace box to the width of the categories.
        this._workspaceBox.actor.add_constraint(new Clutter.BindConstraint({ name: 'constraint', source: this._categoryBox.actor, coordinate: Clutter.BindCoordinate.WIDTH, offset: 0 }));
        this._workspaceBox.hide();

        // Listen for keyboard events to control the views with the keyboard.
        this._keyPressID = this.actor.connect('key_press_event', Lang.bind(this, this._onKeyboardEvent));
        // I want the boxes to react on scroll events.
		this._scrollID = this.actor.connect('scroll-event', Lang.bind(this, this._onScrollEvent));
        
        this.refresh();
    },

    /**
     * @description Refreshes the component. In the process the current model
     *              is applied.
     * @public
     * @function
     */
    refresh: function() {
        this.clear();

        // I want the default category to be on top.
        switch (this.menuSettings.getDefaultShortcutAreaCategory()) {

            case ECategoryID.MOST_USED:
                this._categoryBox.addCategory(ECategoryID.MOST_USED, ECategoryID.MOST_USED, null);
                this._categoryBox.addCategory(ECategoryID.ALL_APPS, ECategoryID.ALL_APPS, null);
                break;

            case ECategoryID.ALL_APPS:
                this._categoryBox.addCategory(ECategoryID.ALL_APPS, ECategoryID.ALL_APPS, null);
                this._categoryBox.addCategory(ECategoryID.MOST_USED, ECategoryID.MOST_USED, null);
                break;

            default:
                break;
        }

        let categories = this.model.getApplicationCategories();
        for (let categoryID in categories) {
            let categoryNameID = categories[categoryID];
            this._categoryBox.addCategory(categoryID, categoryNameID, null);
        }

        // I dont expect the update method to be called while the user uses the menu.
        this.selectCategory(this.menuSettings.getDefaultShortcutAreaCategory());
    },

    /**
     * @description Use this function to remove all actors from the component.
     * @public
     * @function
     */
    clear: function() {
        this._categoryBox.clear();
    },

    /**
     * @description Use this function to destroy the component.
     * @public
     * @function
     */
    destroy: function() {
        if (this._keyPressID > 0) {
            this.actor.disconnect(this._keyPressID);
            this._keyPressID = undefined;
        }
        
        if (this._scrollID > 0) {
            this.actor.disconnect(this._scrollID);
            this._scrollID = undefined;
        }
        
        this._workspaceBox.destroy();
        this._categoryBox.destroy();

        this.actor.destroy();
    },

    /**
     * @description Use this function to update the component.
     * @param {Object} event The event object provides the type of the event.
     *                       With this type it is decided if the component needs
     *                       to be updated.
     * @public
     * @function
     */
    update: function(event) {
        if (!event) {
            event = { type: EEventType.DATA_APPS_EVENT };
        }
        
        switch (event.type) {
            
            case EEventType.DATA_APPS_EVENT:
                this.refresh();
                break;

            default:
                break;
        }
    },

    /**
     * @description This function lets the categories get visible. You can
     *              tell it to use a timeout to delay the showing of the
     *              categories. This is used to show the view after a drag
     *              cancel occured.
     * @param {Boolean} withTimeout Use a timeout?
     * @public
     * @function
     */
    showCategories: function(withTimeout) {
        if (withTimeout) {
            // Disconnect old stuff.
            if (this._stopResetID) this.actor.disconnect(this._stopResetID);
            if (this._resetTimeoutId) Mainloop.source_remove(this._resetTimeoutId);
            // Use a motion event as indicator that the user wants to keep the view.
            this._stopResetID = this.actor.connect('motion_event', Lang.bind(this, this.showWorkspaces));
            this._resetTimeoutId = Mainloop.timeout_add(250, Lang.bind(this, function() {
                if (this._stopResetID) this.actor.disconnect(this._stopResetID);
                this._stopResetID = 0;
                this._resetTimeoutId = 0;
                this.toggleView();
                return false;
            }));

        } else {
            this._workspaceBox.hide();
            this._categoryBox.show();
        }
    },

    /**
     * @description Shows the workspace view.
     * @public
     * @function
     */
    showWorkspaces: function() {
        // Removes the timer and stuff from a possible showCategories call.
        if (this._stopResetID) this.actor.disconnect(this._stopResetID);
        if (this._resetTimeoutId) Mainloop.source_remove(this._resetTimeoutId);
        this._stopResetID = 0;
        this._resetTimeoutId = 0;

        this._workspaceBox.show();
        this._categoryBox.hide();

        // For the motion event we return that we handled the signal.
        return Clutter.EVENT_STOP;
    },

    /**
     * @description Toggles between workspaces and categories.
     * @public
     * @function
     */
    toggleView: function() {
        this._workspaceBox.toggleVisibility();
        this._categoryBox.toggleVisibility();
    },

    /**
     * @description Selects the specific category.
     * @param {Enum} categoryID The id of the category.
     * @public
     * @function
     */
    selectCategory: function(categoryID) {
        this._categoryBox.selectCategory(categoryID);
        this._workspaceBox.hide();
        this._categoryBox.show();
    },
    
    activateFirst: function() {
        if (this._workspaceBox.isVisible()) {
            this._workspaceBox.activateFirst();
            this._scrollToSelectedElement(this._workspaceBox);
        } else {
            this._categoryBox.activateFirst();
            this._scrollToSelectedElement(this._categoryBox);
        }
    },
    
    activateNext: function() {
        if (this._workspaceBox.isVisible()) {
            this._workspaceBox.activateNext();
            this._scrollToSelectedElement(this._workspaceBox);
        } else {
            this._categoryBox.activateNext();
            this._scrollToSelectedElement(this._categoryBox);
        }
    },
    
    activatePrevious: function() {
        if (this._workspaceBox.isVisible()) {
            this._workspaceBox.activatePrevious();
            this._scrollToSelectedElement(this._workspaceBox);
        } else {
            this._categoryBox.activatePrevious();
            this._scrollToSelectedElement(this._categoryBox);
        }
    },
    
    _scrollToSelectedElement: function(activeView) {
        let vscroll = this.actor.get_vscroll_bar();
        let elemBox = activeView.getActivatedElementBounds();
        if (!elemBox) {
            return;
        }
    
        let currentScrollValue = vscroll.get_adjustment().get_value();
        let boxHeight = this.actor.get_allocation_box().y2 - this.actor.get_allocation_box().y1;
        let newScrollValue = currentScrollValue;
    
        if (currentScrollValue > elemBox.y1 - 20) {
            newScrollValue = elemBox.y1 - 20;
        }
        if (boxHeight + currentScrollValue < elemBox.y2 + 20) {
            newScrollValue = elemBox.y2 - boxHeight + 20;
        }
        
        if (newScrollValue != currentScrollValue) {
            vscroll.get_adjustment().set_value(newScrollValue);
        }
    },

    /**
     * @description Handles the scroll events.
     * @param actor
     * @param event
     * @public
     * @function
     * @author Mostly scroll-workspaces@gfxmonk.net. Modified by AxP.
     */
	_onScrollEvent : function(actor, event) {
		let direction = event.get_scroll_direction();
        switch (direction) {
            
            case Clutter.ScrollDirection.UP:
                this.activatePrevious();
                break;
            
            case Clutter.ScrollDirection.DOWN:
                this.activateNext();
                break;
            
            default:
                break;
        }

        return Clutter.EVENT_STOP;
	},
    
    _onKeyboardEvent: function(actor, event, firstCall) {
        log("NavigationArea received key event!");
        
        // Prevents too fast changes.
        let currentTime = global.get_current_time();
		if (this._tLastScroll && currentTime < this._tLastScroll + CATEGORY_SWITCH_WAIT_TIME) {
            return Clutter.EVENT_STOP;
		}
		this._tLastScroll = currentTime;
        
        let state = event.get_state();
        let ctrl_pressed = (state & Clutter.ModifierType.CONTROL_MASK ? true : false);
        let symbol = event.get_key_symbol();

        let returnVal = Clutter.EVENT_PROPAGATE;
        switch (symbol) {

            case Clutter.Up:
                this.activatePrevious();
                returnVal = Clutter.EVENT_STOP;
                break;

            case Clutter.Down:
                this.activateNext();
                returnVal = Clutter.EVENT_STOP;
                break;

            case Clutter.Left:
                this._categoryBox.activateFirst();
                if (!firstCall) {
                    this.mediator.moveKeyFocusLeft(actor, event);
                }
                returnVal = Clutter.EVENT_STOP;
                break;

            case Clutter.Right:
                if (!firstCall) {
                    this.mediator.moveKeyFocusRight(actor, event);
                }
                returnVal = Clutter.EVENT_STOP;
                break;

            case Clutter.KEY_Tab:
                if (!firstCall) {
                    this.mediator.moveKeyFocusRight(actor, event);
                }
                returnVal = Clutter.EVENT_STOP;
                break;

            case Clutter.KEY_space:
                this.toggleView();
                returnVal = Clutter.EVENT_STOP;
                break;
            
            case Clutter.KEY_Return:
                if (this._workspaceBox.isVisible()) {
                    this.mediator.closeMenu();
                    returnVal = Clutter.EVENT_STOP;
                }
                break;
        }

        return returnVal;
    },

    /**
     * @description On drag begin callback function.
     * @private
     * @function
     */
    _onDragBegin: function() {
        this.showWorkspaces();
        this._workspaceBox._onDragBegin();
    },

    /**
     * @description On drag cancel callback function.
     * @private
     * @function
     */
    _onDragCancelled: function() {
        this._workspaceBox._onDragCancelled();
    },

    /**
     * @description On drag end callback function.
     * @private
     * @function
     */
    _onDragEnd: function() {
        // I dont want to annoy the user with the workspace box.
        this.showCategories(true);
        this._workspaceBox._onDragEnd();
    },
});
