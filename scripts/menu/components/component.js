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
const Gtk = imports.gi.Gtk;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;



/**
 * @class Component
 *
 * @classdesc Represents a basic menu component and provides some often used
 *            functions. Some of the declared functions are not implemented and
 *            need to be created by subclasses.
 *
 * @description The subclasses need valid instances of model and mediator to
 *              work properly. After init you can also access a menuSettings
 *              instance from the mediator to receive the current menustate.
 *              This is needed to get new iconsizes or other layout changes.
 *              The model provides you with data which is read from the system.
 *              With the mediator you can access other components. Dont access
 *              them directly to reduce the complexity.
 *
 *
 * @param {MenuModel} model A model instance.
 * @param {MenuMediator} mediator A mediator instance.
 *
 * @property {MenuModel} model The model instance.
 * @property {MenuMediator} mediator The mediator instance.
 * @property {MenuSettings} menuSettings The mediator menuSettings instance.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
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
        this.menuSettings = mediator.getMenuSettings();
    },

    /**
     * @description Hides the component.
     * @function
     * @memberOf Component#
     */
    hide: function() {
        if (this.actor) {
            this.actor.hide();
        }
    },

    /**
     * @description Shows the component.
     * @function
     * @memberOf Component#
     */
    show: function() {
        if (this.actor) {
            this.actor.show();
        }
    },

    /**
     * @description Returns if the component is visible.
     * @returns {Boolean} Is visible.
     * @function
     * @memberOf Component#
     */
    isVisible: function() {
        if (this.actor) {
            return this.actor.visible;
        }
        return false;
    },

    /**
     * @description Toggles the visibility.
     * @function
     * @memberOf Component#
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
     * @description Refreshs the component. What this actual means depends on
     *              the subclasses but in any case it should bring the component
     *              on the state that the settings provide.
     *
     *              NEEDS TO BE IMPLEMENTED BY SUBCLASSES.
     * @function
     * @memberOf Component#
     */
    refresh: function() {
        Log.logError("Gnomenu.Component", "refresh", "Please override this method!");
    },

    /**
     * @description Clears all actors from the component. The component should
     *              be in empty state afterwards and it should be possible
     *              to add elements again.
     *
     *              NEEDS TO BE IMPLEMENTED BY SUBCLASSES.
     * @function
     * @memberOf Component#
     */
    clear: function() {
        Log.logError("Gnomenu.Component", "clear", "Please override this method!");
    },

    /**
     * @description Destroys the component.
     * @function
     * @memberOf Component#
     */
    destroy: function() {
        if (this.actor) {
            this.actor.destroy();
        }
    },
});



/**
 * @class UpdateableComponent
 * @extends Component
 *
 * @classdesc Represents a component which is updateable. It takes the methods from
 *            the component class and adds an update method. This method is used
 *            by the model observer to update the components. @see Component
 *
 * @description @see Component
 *
 *
 * @param {MenuModel} model A model instance.
 * @param {MenuMediator} mediator A mediator instance.
 * @property {MenuSettings} menuSettings The mediator menuSettings instance.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
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
     *              new data from the model.
     *
     *              NEEDS TO BE IMPLEMENTED BY SUBCLASSES.
     * @param {Object} event The event object that provides some information about
     *                 the update.
     * @function
     * @memberOf UpdateableComponent#
     */
    update: function(event) {
        Log.logError("Gnomenu.UpdateableComponent", "update", "Please override this method!");
    }
});