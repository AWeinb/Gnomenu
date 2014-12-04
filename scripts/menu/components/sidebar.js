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
const Gtk = imports.gi.Gtk;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const MenuModel = Me.imports.scripts.menu.menuModel;
const DraggableIconButton = Me.imports.scripts.menu.components.elements.menubutton.DraggableIconButton;
const ButtonGroup = Me.imports.scripts.menu.components.elements.menubutton.ButtonGroup;
const UpdateableComponent = Me.imports.scripts.menu.components.component.UpdateableComponent;

const ECategoryID = MenuModel.ECategoryID;
const EEventType = MenuModel.EEventType;

/**
 * Simple Enum which provides a mousebutton to id mapping.
 * @private
 */
const MOUSEBUTTON = Me.imports.scripts.menu.components.elements.menubutton.EMousebutton;



/**
 * @class Sidebar
 * @extends UpdateableComponent
 *
 * @classdesc This component keeps at the moment only the favorites or the places.
 *            It is a simple button bar without special functionallity. It would be
 *            nice to implement the normal Gnome Dock features some time. It is a
 *            scrollview, so you can add it in a normal boxlayout. Because the
 *            buttons are ordered in a buttongroup it is possible to control them
 *            easily with the keyboard. Just set the keyfocus to this component. It
 *            is neccessary to provide the component with update events from the
 *            model to keep it up-to-date.
 *
 * @description @see UpdateableComponent
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
const Sidebar = new Lang.Class({

    Name: 'Gnomenu.Sidebar',
    Extends: UpdateableComponent,


    _init: function(model, mediator) {
        this.parent(model, mediator);

        // The buttongroup handles the interaction between the buttons.
        this._buttonGroup = new ButtonGroup();
        // The mainbox inside of a scrollbox takes the buttons.
        this._mainBox = new St.BoxLayout({ style_class: 'gnomenu-sidebar-box', vertical: true });

        let scrollBox = new St.ScrollView({ x_fill: true, y_fill: false, y_align: St.Align.START, style_class: 'gnomenu-sidebar-scrollbox' });
        // Mousescrolling yes but without any bars.
        scrollBox.set_mouse_scrolling(true);
        scrollBox.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.NEVER);
        scrollBox.add_actor(this._mainBox);
        this.actor = scrollBox;

        // To enable keyboard navigation the press event is connected to a function.
        this._keyPressID = this.actor.connect('key_press_event', Lang.bind(this, this._onKeyboardEvent));

        // Receives the app data and updates the view.
        this.refresh();
    },

    /**
     * @description Use this function to bring the view up-to-date.
     * @function
     * @memberOf Sidebar#
     */
    refresh: function() {
        // Remove the old buttons.
        this.clear();

        if (!this.menuSettings.isSidebarVisible()) {
            this.actor.hide();
        } else {
            this.actor.show();
        }

        // Get a list with apps.
        let launchables = null;
        this._category = this.menuSettings.getSidebarCategory();
        switch (this._category) {

            case ECategoryID.FAVORITES:
                launchables = this.model.getFavoriteApps();
                break;

            case ECategoryID.PLACES:
                launchables = this.model.getPlaces();
                break;

            default:
                break;
        }

        // And fill the component again.
        let iconSize = this.menuSettings.getSidebarIconsize();
        for each (let launchable in launchables) {
            let btn = new DraggableIconButton(this.mediator, iconSize, launchable);
            this._buttonGroup.addButton(btn);
            this._mainBox.add_actor(btn.actor);
        }
    },

    /**
     * @description Use this function to remove all actors from the component.
     * @function
     * @memberOf Sidebar#
     */
    clear: function() {
        let actors = this._mainBox.get_children();
        if (actors) {
            for each (let actor in actors) {
                this._mainBox.remove_actor(actor);
                // We dont need the buttons anymore so they can be destroyed.
                actor.destroy();
            }
        }
        // The buttongroup is now empty again.
        this._buttonGroup.reset();
    },

    /**
     * @description Use this function to destroy the component.
     * @function
     * @memberOf Sidebar#
     */
    destroy: function() {
        this.actor.destroy();
    },

    /**
     * @description Removes unneeded effects like the hover style.
     * @function
     * @memberof Sidebar#
     */
    clean: function() {
        this._buttonGroup.clean();
    },

    /**
     * @description Use this function to update the component.
     * @param {Object} event The event object provides the type of the event.
     *                       With this type it is decided if the component needs
     *                       to be updated. If this parameter is null the component
     *                       is updated.
     * @function
     * @memberOf Sidebar#
     */
    update: function(event) {
        if (!event) {
            event = { type: EEventType.DATA_FAVORITES_EVENT };
        }

        switch (event.type) {

            case EEventType.DATA_FAVORITES_EVENT:
                this.refresh();
                break;

            case EEventType.DATA_PLACES_EVENT:
                this.refresh();
                break;

            default:
                break;
        }
    },

    /**
     * @description This function handles the keyboard events.
     * @param {Clutter.Actor} actor
     * @param {Clutter.Event} event
     * @param {Boolean} mediatorCall If called from the mediator.
     * @returns {Boolean}
     * @private
     * @function
     * @memberOf Sidebar#
     */
    _onKeyboardEvent: function(actor, event, mediatorCall) {
        log("Sidebar received key event!");

        let state = event.get_state();
        let ctrl_pressed = (state & Clutter.ModifierType.CONTROL_MASK ? true : false);
        let symbol = event.get_key_symbol();

        // If we do not need the event it can bubble up.
        let returnVal = Clutter.EVENT_PROPAGATE;
        switch (symbol) {

            case Clutter.Up:
                this._buttonGroup.selectPrevious();
                returnVal = Clutter.EVENT_STOP;
                break;

            case Clutter.Down:
                this._buttonGroup.selectNext();
                returnVal = Clutter.EVENT_STOP;
                break;

            case Clutter.Left:
                this._buttonGroup.selectFirst();
                returnVal = Clutter.EVENT_STOP;
                break;

            case Clutter.Right:
                this._buttonGroup.clearButtonStates();
                this.mediator.moveKeyFocusRight(actor, event);
                returnVal = Clutter.EVENT_STOP;
                break;

            case Clutter.KEY_Tab:
                this._buttonGroup.clearButtonStates();
                this.mediator.moveKeyFocusRight(actor, event);
                returnVal = Clutter.EVENT_STOP;
                break;

            case Clutter.KEY_Return:
                this._buttonGroup.clearButtonStates();
                // The control key is used to activate already open apps.
                // Or actually to activate the action connected to the middle button.
                // But thats at the moment the reactivate action.
                if (ctrl_pressed) {
                    this._buttonGroup.activateSelected(MOUSEBUTTON.MOUSE_MIDDLE);
                } else {
                    this._buttonGroup.activateSelected(MOUSEBUTTON.MOUSE_LEFT);
                }
                returnVal = Clutter.EVENT_STOP;
                break;
        }

        return returnVal;
    },
});
