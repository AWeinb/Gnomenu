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
const Gtk = imports.gi.Gtk;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;


/**
 * @class Component: Represents a basic menu component and provides some often
 *                   used functions.
 *
 * @param {MenuModel} model A model instance.
 * @param {MenuMediator} mediator A mediator instance.
 *
 * @property {MenuModel} model The model instance.
 * @property {MenuMediator} mediator The mediator instance.
 *
 *
 * @author AxP
 * @version 1.0
 */
const Component = new Lang.Class({

    Name: 'Gnomenu.Component',


    _init: function(model, mediator) {
        if (!model || !mediator) {
            Log.logError("Gnomenu.Component", "_init", "model or mediator is null!");
        }

        this.model = model;
        this.mediator = mediator;
    },

    /**
     * @description Hides the component.
     * @public
     * @function
     */
    hide: function() {
        if (this.actor) {
            this.actor.hide();
        }
    },

    /**
     * @description Shows the component.
     * @public
     * @function
     */
    show: function() {
        if (this.actor) {
            this.actor.show();
        }
    },

    /**
     * @description Returns if the component is visible.
     * @returns {Boolean} Is visible.
     * @public
     * @function
     */
    isVisible: function() {
        if (this.actor) {
            return this.actor.visible;
        }
        return false;
    },

    /**
     * @description Toggles the visibility.
     * @public
     * @function
     */
    toggleVisibility: function() {
        if (this.actor) {
            if (this.actor.visible) {
                this.hide();
            } else {
                this.show();
            }
        }
    },

    /**
     * @description Refreshs the component. NEEDS TO BE IMPLEMENTED BY SUBCLASSES.
     * @public
     * @function
     */
    refresh: function() {
        Log.logError("Gnomenu.Component", "refresh", "Please override this method!");
    },
    
    /**
     * @description Clears all actors from the component. NEEDS TO BE IMPLEMENTED BY SUBCLASSES.
     * @public
     * @function
     */
    clear: function() {
        Log.logError("Gnomenu.Component", "clear", "Please override this method!");
    },

    /**
     * @description Destroys the component.
     * @public
     * @function
     */
    destroy: function() {
        if (this.actor) {
            this.actor.destroy();
        }
    },
});


/**
 * @class UpdateableComponent: Represents a component which is updateable.
 * @extends Component
 *
 * @param {MenuModel} model A model instance.
 * @param {MenuMediator} mediator A mediator instance.
 *
 *
 * @author AxP
 * @version 1.0
 */
const UpdateableComponent = new Lang.Class({

    Name: 'Gnomenu.UpdateableComponent',
    Extends: Component,


    _init: function(model, mediator) {
        this.parent(model, mediator);
    },

    /**
     * @description Tells the component that it is outdated and it needs to get
     *              new data from the model. NEEDS TO BE IMPLEMENTED BY SUBCLASSES.
     * @param {Object} event The event object that provides some information about
     *                 the update.
     * @public
     * @function
     */
    update: function(event) {
        Log.logError("Gnomenu.UpdateableComponent", "update", "Please override this method!");
    }
});