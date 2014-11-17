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
const Clutter = imports.gi.Clutter;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;
const MenuModel = Me.imports.scripts.menu.menuModel;
const ResultArea = Me.imports.scripts.menu.components.elements.searchResultArea.ResultArea;
const ShortcutArea = Me.imports.scripts.menu.components.elements.shortcutArea.ShortcutArea;
const UpdateableComponent = Me.imports.scripts.menu.components.component.UpdateableComponent;

const EEventType = MenuModel.EEventType;

/** @constant */
const BUTTON_SWITCH_WAIT_TIME = 50;


/**
 * @class MainArea: This class creates main shortcut area. This contains also
 *                  the search results.
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
const MainArea = new Lang.Class({

    Name: 'Gnomenu.MainArea',
    Extends: UpdateableComponent,


    _init: function(model, mediator) {
        this.parent(model, mediator);

        // In this actor are two boxes on the same space. Only one is visible
        // at a time.
        this.actor = new St.BoxLayout({ style_class: 'gnomenu-mainArea-box' });

        this._resultArea = new ResultArea(model, mediator);
        this._shortcutArea = new ShortcutArea(model, mediator);

        // I want the areas to have the same width as the parent container.
        this._resultArea.actor.add_constraint(new Clutter.BindConstraint({name: 'constraint', source: this.actor, coordinate: Clutter.BindCoordinate.WIDTH, offset: 0}));
        this._shortcutArea.actor.add_constraint(new Clutter.BindConstraint({name: 'constraint', source: this.actor, coordinate: Clutter.BindCoordinate.WIDTH, offset: 0}));

        this.actor.add(this._resultArea.actor, { expand: true, x_fill: true, y_fill: true });
        this.actor.add(this._shortcutArea.actor, { expand: true, x_fill: true, y_fill: true });

        // This component listens for keys to handle the keyboard control.
        this._keyPressID = this.actor.connect('key_press_event', Lang.bind(this, this._onKeyboardEvent));

        this.searchActive = false;
        
        this.refresh();
    },

    /**
     * @description Use this function to bring the view up-to-date.
     * @public
     * @function
     */
    refresh: function() {
        if (this.searchActive) {
            this._resultArea.show();
            this._shortcutArea.hide();
            
        } else {
            this._resultArea.hide();
            this._shortcutArea.show();
        }
        
        this._resultArea.refresh();
        this._shortcutArea.refresh();
    },

    /**
     * @description Use this function to remove all actors from the component.
     * @public
     * @function
     */
    clear: function() {
        this._resultArea.clear();
        this._shortcutArea.clear();
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

        this._resultArea.destroy();
        this._shortcutArea.destroy();
        
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
        if (event) {
            switch (event.type) {

                case EEventType.SEARCH_UPDATE_EVENT:
                    this._resultArea.show();
                    this._shortcutArea.hide();
                    this.searchActive = true;
                    break;

                case EEventType.SEARCH_STOP_EVENT:
                    this._resultArea.hide();
                    this._shortcutArea.show();
                    this.searchActive = false;
                    break;

                default:
                    break;
            }
        }

        this._resultArea.updateSearch(event);
        this._shortcutArea.updateCategory(event);
        log(event.type)
    },

    /**
     * @description This function is used to show a special shortcut category.
     * @param {Enum} categoryID The ID of the category. May not be null!
     * @public
     * @function
     */
    showCategory: function(categoryID) {
        if (!categoryID) {
            Log.logWarning("Gnomenu.MainArea", "showCategory", "categoryID is null!");
        }

        this._resultArea.hide();
        this._shortcutArea.show();
        this._shortcutArea.showCategory(categoryID);
    },

    /**
     * @description This function is used to show a specific viewmode.
     * @param {Enum} viewModeID The ID of the viewmode. May not be null!
     * @public
     * @function
     */
    setViewMode: function(viewModeID) {
        if (!viewModeID) {
            Log.logWarning("Gnomenu.MainArea", "setViewMode", "viewModeID is null!");
        }

        this._resultArea.setViewMode(viewModeID);
        this._shortcutArea.setViewMode(viewModeID);
    },

    /**
     * @description Handles the keyboard input.
     * @param actor
     * @param event
     * @private
     * @function
     */
    _onKeyboardEvent: function(actor, event, firstCall) {
        log("MainArea received key event!");
        
        let currentTime = global.get_current_time();
		if (currentTime > this._lastScroll && currentTime < this._lastScroll + BUTTON_SWITCH_WAIT_TIME) {
            return Clutter.EVENT_STOP;
		}
		this._lastScroll = currentTime;
        
        let receiver = null;
        if (this._resultArea.isVisible()) {
            receiver = this._resultArea;
        } else {
            receiver = this._shortcutArea;
        }

        let returnVal = Clutter.EVENT_PROPAGATE;
        if (receiver) {
            let state = event.get_state();
            let ctrl_pressed = (state & Clutter.ModifierType.CONTROL_MASK ? true : false);
            let symbol = event.get_key_symbol();

            switch (symbol) {

                case Clutter.Up:
                    receiver.selectUp();
                    returnVal = Clutter.EVENT_STOP;
                    break;

                case Clutter.Down:
                    receiver.selectDown();
                    returnVal = Clutter.EVENT_STOP;
                    break;

                case Clutter.w:
                    if (ctrl_pressed) {
                        receiver.selectUp();
                        returnVal = Clutter.EVENT_STOP;
                    }
                    break;

                case Clutter.s:
                    if (ctrl_pressed) {
                        receiver.selectDown();
                        returnVal = Clutter.EVENT_STOP;
                    }
                    break;

                case Clutter.Left:
                    receiver.selectLeft();
                    returnVal = Clutter.EVENT_STOP;
                    break;

                case Clutter.Right:
                    if (firstCall) {
                        receiver.selectFirst();
                    } else {
                        receiver.selectRight();
                    }
                    returnVal = Clutter.EVENT_STOP;
                    break;

                case Clutter.a:
                    if (ctrl_pressed) {
                        receiver.selectLeft();
                        returnVal = Clutter.EVENT_STOP;
                    }
                    break;

                case Clutter.d:
                    if (ctrl_pressed) {
                        if (firstCall) {
                            receiver.selectFirst();
                        } else {
                            receiver.selectRight();
                        }
                        returnVal = Clutter.EVENT_STOP;
                    }
                    break;

                case Clutter.KEY_Tab:
                    receiver.deselectLastSelectedButton();
                    this.mediator.moveKeyFocusLeft(actor, event);
                    returnVal = Clutter.EVENT_STOP;
                    break;

                case Clutter.KEY_Return:
                    receiver.deselectLastSelectedButton();
                    returnVal = Clutter.EVENT_STOP;
                    break;
            }
        }

        return returnVal;
    }
});