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
const St = imports.gi.St;
const Gtk = imports.gi.Gtk;
const Clutter = imports.gi.Clutter;
const Mainloop = imports.mainloop;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const MenuModel = Me.imports.scripts.menu.menuModel;
const Log = Me.imports.scripts.misc.log;
const GnoMenuThumbnailsBox = Me.imports.scripts.menu.components.elements.workspaceThumbnail.GnoMenuThumbnailsBox;
const TextButton = Me.imports.scripts.menu.components.elements.menubutton.TextButton;
const ButtonGroup = Me.imports.scripts.menu.components.elements.menubutton.ButtonGroup;
const UpdateableComponent = Me.imports.scripts.menu.components.component.UpdateableComponent;

const ECategoryID = MenuModel.ECategoryID;
const ECategoryDescriptionID = MenuModel.ECategoryDescriptionID;
const EEventType = MenuModel.EEventType;
const ESelectionMethod = MenuModel.ESelectionMethod;


/**
 * Simple Enum which provides a mousebutton to id mapping.
 * @private
 */
const MOUSEBUTTON = Me.imports.scripts.menu.components.elements.menubutton.EMousebutton;
/**
 * Delay between two workspace changes.
 * @private
 */
const WORKSPACE_SWITCH_WAIT_TIME = 200;
/**
 * Delay between two category changes.
 * @private
 */
const CATEGORY_SWITCH_WAIT_TIME = 50;



/**
 * @class NavigationBox
 *
 * @classdesc This class is the base class for the navigation box elements. That
 *            means the workspace view and the category view extend this class.
 *            This class provides the box for these views.
 *
 * @description The constructor creates the actor of the basic navigationbox
 *              and takes for this some parameters.
 *
 *
 * @param {Object} params Layout parameters for the actor.
 *
 * @property {Clutter.Actor} actor The clutter actor of this component.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const NavigationBox = new Lang.Class({

    Name: 'Gnomenu.navigationArea.NavigationBox',


    _init: function(params) {
        this.actor = new St.BoxLayout(params);
    },

    /**
     * @description Shows the component.
     * @function
     * @memberOf NavigationBox#
     */
    show: function() {
        this.actor.show();
    },

    /**
     * @description Hides the component.
     * @function
     * @memberOf NavigationBox#
     */
    hide: function() {
        this.actor.hide();
    },

    /**
     * @description Returns if the component is visible.
     * @returns {Boolean} If the actor is visible.
     * @function
     * @memberOf NavigationBox#
     */
    isVisible: function() {
        return this.actor.visible;
    },

    /**
     * @description Changes the visibility of the component.
     * @function
     * @memberOf NavigationBox#
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
 * @class WorkspaceBox
 * @extends NavigationBox
 *
 * @classdesc This is the component which contains the workspace views. It provides
 *            mouse and keyboard controls. To integrate drag events it needs to get
 *            this events from the buttons. Luckily the buttons provide this
 *            information and the mediator sends it further to the components.
 *
 * @description For this class to work properly you need to provide a valid
 *              mediator instance. The constructor then creates the actor
 *              and starts listening to changes in the workspaces.
 *
 *
 * @param {MenuModel} model A model instance.
 * @param {MenuMediator} mediator A mediator instance.
 *
 * @property {Clutter.Actor} actor The clutter actor of this component.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @author scroll-workspaces@gfxmonk.net (Scrolling)
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
         * than the original.
         */
        this._thumbnailsBox = new GnoMenuThumbnailsBox(mediator);
        this.actor.add(this._thumbnailsBox.actor);

        // Because the size of the windows does not affect the actor we fix the height.
        this._allocationID = this.actor.connect('notify::allocation', Lang.bind(this, function() {
            // This needs to happen after allocation to prevent St errors.
            this.actor.height = this._thumbnailsBox.getEstimatedHeight();
            this.actor.disconnect(this._allocationID);
            this._allocationID = undefined;
        }));
    },

    /**
     * @description Makes the component visible.
     * @function
     * @memberOf WorkspaceBox#
     */
    show: function() {
        if (!this.isVisible()) {
            this._thumbnailsBox.createThumbnails();
            this.actor.show();
        }
    },

    /**
     * @description Hides the component.
     * @function
     * @memberOf WorkspaceBox#
     */
    hide: function() {
        if (this.isVisible()) {
            this._thumbnailsBox.destroyThumbnails();
            this.actor.hide();
        }
    },

    /**
     * @description Activates the first workspace in the list.
     * @function
     * @memberOf WorkspaceBox#
     */
    activateFirst: function() {
        let metaWorkspace = global.screen.get_workspace_by_index(0);
        if (metaWorkspace) {
            metaWorkspace.activate(true);
        }
    },

    /**
     * @description Activates the last workspace in the list.
     *
     *              To be implemented.
     * @function
     * @memberOf WorkspaceBox#
     */
    activateLast: function() {
        //  XXX
    },

    /**
     * @description Activates the next workspace window.
     * @function
     * @memberOf WorkspaceBox#
     */
    activateNext: function() {
        this._switch(+1);
    },

    /**
     * @description Activates the previous workspace window.
     * @function
     * @memberOf WorkspaceBox#
     */
    activatePrevious: function() {
        this._switch(-1);
    },

    /**
     * @description To scroll properly while using the cursor key it is
     *              neccessary to get the component bounds. This bounds
     *              are returned by this method.
     * @returns {Object} The bounds object.
     * @function
     * @memberOf WorkspaceBox#
     */
    getActivatedElementBounds: function() {
        return this._thumbnailsBox.getActiveThumbnailBounds();
    },

    /**
     * @description Helper to switch the workspace.
     * @param {Integer} diff +1 or -1 for up or down.
     * @private
     * @function
     * @memberOf WorkspaceBox#
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
     * @function
     * @memberOf WorkspaceBox#
     */
    onDragBegin: function() {
        this._thumbnailsBox.onDragBegin();
    },

    /**
     * @description Informs the thumbnailsbox about a drag cancel.
     * @function
     * @memberOf WorkspaceBox#
     */
    onDragCancelled: function() {
        this._thumbnailsBox.onDragCancelled();
    },

    /**
     * @description Informs the thumbnailsbox about a drag end.
     * @function
     * @memberOf WorkspaceBox#
     */
    onDragEnd: function() {
        this._thumbnailsBox.onDragEnd();
    },

    /**
     * @description Destroys the component.
     * @function
     * @memberOf WorkspaceBox#
     */
    destroy: function() {
        this._thumbnailsBox.destroyThumbnails();
        this.actor.destroy();
    }
});



/**
 * @class CategoryBox
 * @extends NavigationBox
 *
 * @classdesc The category box contains the category buttons. It provides
 *            keycontrol to navigate through the inserted buttons. You can
 *            add and clear buttons very easily.
 *
 * @description The constructor creates the actor of the element. You need
 *              to provide valid mediator and model instances.
 *
 *
 * @param {MenuModel} model A model instance.
 * @param {MenuMediator} mediator A mediator instance.
 *
 * @property {Clutter.Actor} actor The clutter actor of this component.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const CategoryBox = new Lang.Class({

    Name: 'Gnomenu.navigationArea.CategoryBox',
    Extends: NavigationBox,


    _init: function(model, mediator) {
        this.parent({ style_class: 'gnomenu-categories-box', vertical: true });

        this._mediator = mediator;
        this._model = model;

        this._buttonGroup = new ButtonGroup();
        // You shouldnt be able to deselect a button from the category list.
        this._buttonGroup.deactivateDeselection();
    },

    /**
     * @description Activates the first button.
     * @function
     * @memberOf CategoryBox#
     */
    activateFirst: function() {
        this._buttonGroup.selectFirst();
        this._buttonGroup.activateSelected(null);
    },

    /**
     * @description Activates the last button.
     * @function
     * @memberOf CategoryBox#
     */
    activateLast: function() {
        this._buttonGroup.selectLast();
        this._buttonGroup.activateSelected(null);
    },

    /**
     * @description Activates the next button.
     * @function
     * @memberOf CategoryBox#
     */
    activateNext: function() {
        this._buttonGroup.selectNext();
        this._buttonGroup.activateSelected(null);
    },

    /**
     * @description Activates the previous button.
     * @function
     * @memberOf CategoryBox#
     */
    activatePrevious: function() {
        this._buttonGroup.selectPrevious();
        this._buttonGroup.activateSelected(null);
    },

    /**
     * @description Activates a button/category by category ID.
     * @param {StringEnum} categoryID The id of the category.
     * @function
     * @memberOf CategoryBox#
     */
    activateCategory: function(categoryID) {
        this._buttonGroup.selectByID(categoryID);
        this._buttonGroup.activateSelected(null);
    },

    /**
     * @description Selects a button by ID.
     * @param {StringEnum} categoryID The id of the category.
     * @function
     * @memberOf CategoryBox#
     */
    selectCategory: function(categoryID) {
        this._buttonGroup.selectByID(categoryID);
    },

    /**
     * @description Returns the bounds of the currently selected button.
     * @returns {Object} The bounds object.
     * @function
     * @memberOf CategoryBox#
     */
    getActivatedElementBounds: function() {
        let btn = this._buttonGroup.getSelectedButton();

        let btnBox = null;
        if (btn && btn.actor) {
            btnBox = btn.actor.get_allocation_box();
        }

        return btnBox;
    },

    /**
     * @description Adds a category button. You have to provide a category ID.
     * @param {StringEnum} categoryID The category id.
     * @param {String} categoryNameID Can be a gettext variable.
     * @param {String} categoryDescriptionID Can be a gettext variable.
     * @function
     * @memberOf CategoryBox#
     */
    addCategory: function(categoryID, categoryNameID, categoryDescriptionID) {
        if (!categoryNameID) {
            categoryNameID = categoryID;
        }

        // The button can be activated with click or hover actions.
        let btn = new TextButton(this._mediator, categoryNameID, categoryNameID, categoryDescriptionID);
        btn.setID(categoryID);
        switch (this._mediator.getMenuSettings().getCategorySelectionMethod()) {

            case ESelectionMethod.CLICK:
                btn.setHandlerForButton(MOUSEBUTTON.MOUSE_LEFT, Lang.bind(this, function() {
                    // Because it is not in this scope to change the
                    // mainarea directly i send a change notification to the
                    // mediator.
                    this._mediator.notifyCategoryChange(categoryID);
                }));
                break;

            case ESelectionMethod.HOVER:
                btn.setOnHoverHandler(Lang.bind(this, function() {
                    this._mediator.notifyCategoryChange(categoryID);
                }));
                break;

            default:
                break;
        }

        this._buttonGroup.addButton(btn);
        this.actor.add_actor(btn.actor);
    },

    /**
     * @description Clears the buttons from the component.
     * @function
     * @memberOf CategoryBox#
     */
    clear: function() {
        let children = this.actor.get_children();
        for each (let btn in children) {
            btn.destroy();
        }

        this._buttonGroup.reset();
        this._buttonGroup.deactivateDeselection();
    },

    /**
     * @description Destroys the component.
     * @function
     * @memberOf CategoryBox#
     */
    destroy: function() {
        this.actor.destroy();
    },

    /**
     * @description Removes unneeded effects like the hover style.
     * @function
     * @memberof CategoryBox#
     */
    clean: function() {
        this._buttonGroup.clean();
    },
});



/**
 * @class NavigationArea
 * @extends UpdateableComponent
 *
 * @classdesc This area combines workspaces and categories. You can toggle between
 *            them with a specific key. On top of that the drag and drop is
 *            integrated so that the workspaces are visible while dragging.
 *
 * @description The constructor creates a scrollview as actor and inits all
 *              viewmode elements. @see UpdateableComponent
 *
 *
 * @param {MenuModel} model A model instance.
 * @param {MenuMediator} mediator A mediator instance.
 *
 * @property {Clutter.Actor} actor The clutter actor of this component.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @author scroll-workspaces@gfxmonk.net (Scrolling)
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
        this.actor = scrollBox;

        // Fixes the width of the workspace box to the width of the categories.
        this._workspaceBox.actor.add_constraint(new Clutter.BindConstraint({ name: 'constraint', source: this._categoryBox.actor, coordinate: Clutter.BindCoordinate.WIDTH, offset: 0 }));
        this._workspaceBox.hide();

        // The mouse can be used to toggle between the different components.
        this._mouseReleaseID = scrollBox.connect('button-release-event', Lang.bind(this, this._onReleaseEvent));
        // Listen for keyboard events to control the views with the keyboard.
        this._keyPressID = this.actor.connect('key_press_event', Lang.bind(this, this._onKeyboardEvent));
        // I want the boxes to react on scroll events.
        this._scrollID = this.actor.connect('scroll-event', Lang.bind(this, this._onScrollEvent));

        this.refresh();
    },

    /**
     * @description Refreshes the component. In the process the current model
     *              is applied.
     * @function
     * @memberOf NavigationArea#
     */
    refresh: function() {
        this.clear();

        // I want the default category to be on top.
        switch (this.menuSettings.getDefaultShortcutAreaCategory()) {

            case ECategoryID.MOST_USED:
                this._categoryBox.addCategory(ECategoryID.MOST_USED, ECategoryID.MOST_USED, ECategoryDescriptionID.MOST_USED);
                this._categoryBox.addCategory(ECategoryID.ALL_APPS, ECategoryID.ALL_APPS, ECategoryDescriptionID.ALL_APPS);
                break;

            case ECategoryID.ALL_APPS:
                this._categoryBox.addCategory(ECategoryID.ALL_APPS, ECategoryID.ALL_APPS, ECategoryDescriptionID.ALL_APPS);
                this._categoryBox.addCategory(ECategoryID.MOST_USED, ECategoryID.MOST_USED, ECategoryDescriptionID.MOST_USED);
                break;

            default:
                break;
        }

        // Reads the available categories and adds the according buttons.
        let categories = this.model.getApplicationCategories();
        for (let categoryID in categories) {
            let categoryNameID = categories[categoryID];
            this._categoryBox.addCategory(categoryID, categoryNameID, ECategoryDescriptionID.OTHER);
        }

        // I dont expect the update method to be called while the user uses the menu.
        this.selectCategory(this.menuSettings.getDefaultShortcutAreaCategory());
    },

    /**
     * @description Use this function to remove all actors from the component.
     * @function
     * @memberOf NavigationArea#
     */
    clear: function() {
        this._categoryBox.clear();
    },

    /**
     * @description Use this function to destroy the component.
     * @function
     * @memberOf NavigationArea#
     */
    destroy: function() {
        this._workspaceBox.destroy();
        this._categoryBox.destroy();

        this.actor.destroy();
    },

    /**
     * @description Removes unneeded effects like the hover style.
     * @function
     * @memberof NavigationArea#
     */
    clean: function() {
        this._categoryBox.clean();
    },

    /**
     * @description Use this function to update the component.
     * @param {Object} event The event object provides the type of the event.
     *                       With this type it is decided if the component needs
     *                       to be updated.
     * @function
     * @memberOf NavigationArea#
     */
    update: function(event) {
        if (!event) {
            event = { type: EEventType.DATA_APPS_EVENT };
        }

        switch (event.type) {

            case EEventType.DATA_APPS_EVENT:
                // It is only possible to change the not hard-coded categories.
                // That kind of change appears here.
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
     * @function
     * @memberOf NavigationArea#
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
     * @returns {Boolean}
     * @function
     * @memberOf NavigationArea#
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
     * @function
     * @memberOf NavigationArea#
     */
    toggleView: function() {
        this._workspaceBox.toggleVisibility();
        this._categoryBox.toggleVisibility();
    },

    /**
     * @description Selects the specific category.
     * @param {StringEnum} categoryID The id of the category.
     * @function
     * @memberOf NavigationArea#
     */
    selectCategory: function(categoryID) {
        this._categoryBox.selectCategory(categoryID);
        this._categoryBox.show();
        this._workspaceBox.hide();
    },

    /**
     * @description Activates the first element.
     * @function
     * @memberOf NavigationArea#
     */
    activateFirst: function() {
        if (this._workspaceBox.isVisible()) {
            this._workspaceBox.activateFirst();
            this._scrollToSelectedElement(this._workspaceBox);
        } else {
            this._categoryBox.activateFirst();
            this._scrollToSelectedElement(this._categoryBox);
        }
    },

    /**
     * @description Activates the last element.
     * @function
     * @memberOf NavigationArea#
     */
    activateLast: function() {
        if (this._workspaceBox.isVisible()) {
            this._workspaceBox.activateLast();
            this._scrollToSelectedElement(this._workspaceBox);
        } else {
            this._categoryBox.activateLast();
            this._scrollToSelectedElement(this._categoryBox);
        }
    },

    /**
     * @description Activates the next element.
     * @function
     * @memberOf NavigationArea#
     */
    activateNext: function() {
        if (this._workspaceBox.isVisible()) {
            this._workspaceBox.activateNext();
            this._scrollToSelectedElement(this._workspaceBox);
        } else {
            this._categoryBox.activateNext();
            this._scrollToSelectedElement(this._categoryBox);
        }
    },

    /**
     * @description Activates the previous element.
     * @function
     * @memberOf NavigationArea#
     */
    activatePrevious: function() {
        if (this._workspaceBox.isVisible()) {
            this._workspaceBox.activatePrevious();
            this._scrollToSelectedElement(this._workspaceBox);
        } else {
            this._categoryBox.activatePrevious();
            this._scrollToSelectedElement(this._categoryBox);
        }
    },

    /**
     * @description Helper to scroll the view to the currently active element.
     * @param {Box} The active box.
     * @private
     * @function
     * @memberOf NavigationArea#
     */
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
     * @description Handler for mouse button releases.
     * @param {Clutter.Actor} actor
     * @param {Clutter.Event} event
     * @returns {Boolean}
     * @private
     * @function
     * @memberOf NavigationArea#
     */
    _onReleaseEvent: function(actor, event) {
        // The mouse button to toggle between the views is the right mouse button.
        let button = event.get_button();
        if (button == MOUSEBUTTON.MOUSE_RIGHT) {
            this.toggleView();
            return Clutter.EVENT_STOP;
        }

        return Clutter.EVENT_PROPAGATE;
    },

    /**
     * @description Handles the scroll events.
     * @param {Clutter.Actor} actor
     * @param {Clutter.Event} event
     * @returns {Boolean}
     * @private
     * @function
     * @memberOf NavigationArea#
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

    /**
     * @description Handles the keyboard events. The third parameter allows me
     *              to determine wether the event occured first here because this
     *              component was focused at the time or if the mediator send
     *              some other event to this element.
     * @param {Clutter.Actor} actor
     * @param {Clutter.Event} event
     * @param mediatorCall True if called by the mediator.
     * @returns {Boolean}
     * @private
     * @function
     * @memberOf NavigationArea#
     */
    _onKeyboardEvent: function(actor, event, mediatorCall) {
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
                this.activateFirst();
                if (!mediatorCall) {
                    // Moves the focus to the sidebar.
                    this.mediator.moveKeyFocusLeft(actor, event);
                }
                returnVal = Clutter.EVENT_STOP;
                break;

            case Clutter.Right:
                if (!mediatorCall) {
                    // Moves the focus to the mainarea.
                    this.mediator.moveKeyFocusRight(actor, event);
                }
                returnVal = Clutter.EVENT_STOP;
                break;

            case Clutter.KEY_Tab:
                if (!mediatorCall) {
                    // Moves the focus to the mainarea.
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
                    // The user probably changed the workspace and now wants
                    // to close the menu.
                    this.mediator.closeMenu();
                    returnVal = Clutter.EVENT_STOP;
                }
                break;
        }

        return returnVal;
    },

    /**
     * @description On drag begin callback function.
     * @function
     * @memberOf NavigationArea#
     */
    onDragBegin: function() {
        this.showWorkspaces();
        this._workspaceBox.onDragBegin();
    },

    /**
     * @description On drag cancel callback function.
     * @function
     * @memberOf NavigationArea#
     */
    onDragCancelled: function() {
        this._workspaceBox.onDragCancelled();
    },

    /**
     * @description On drag end callback function.
     * @function
     * @memberOf NavigationArea#
     */
    onDragEnd: function() {
        // I dont want to annoy the user with the workspace box.
        // So it fades away after some time.
        this.showCategories(true);
        this._workspaceBox.onDragEnd();
    },
});
