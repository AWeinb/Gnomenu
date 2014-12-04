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

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Component = Me.imports.scripts.menu.components.component.Component;



/**
 * @class DescriptionBox
 * @extends Component
 *
 * @classdesc Class for the description at the bottom of the menu. This component
 *            is used by the menu, ie the mediator to show information about the
 *            currently hovered element. It provides for this two labels, one for
 *            the title and one for the description.
 *
 * @description @see Component
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
const DescriptionBox = new Lang.Class({

    Name: 'Gnomenu.DescriptionBox',
    Extends: Component,


    _init: function(model, mediator) {
        this.parent(model, mediator);

        this.actor = new St.BoxLayout({ style_class: 'gnomenu-description-box', vertical: true });

        // This actor has two labels. One for a title and one for the description.
        this._selectedAppTitle = new St.Label({ style_class: 'gnomenu-description-box-title' });
        this._selectedAppDescription = new St.Label({ style_class: 'gnomenu-description-box-description' });

        this.actor.add_actor(this._selectedAppTitle);
        this.actor.add_actor(this._selectedAppDescription);
    },

    /**
     * @description Use this function to bring the view up-to-date. But in this case
     *              there is no moment in which this view would be outdated.
     * @function
     * @memberOf DescriptionBox#
     */
    refresh: function() {
        /*
         * There is no use in implementing this. The buttons are independent
         * from the menu data. Not implemented for this class.
         */
        Log.logWarning("Gnomenu.ControlPane", "refresh", "This is not useful!");
    },

    /**
     * @description Use this function to remove all actors from the component.
     *              Not implemented for this class.
     * @function
     * @memberOf DescriptionBox#
     */
    clear: function() {
        /*
         * It is not intended to refresh the component so why clear it.
         */
        Log.logWarning("Gnomenu.ControlPane", "clear", "This is not useful!");
    },

    /**
     * @description Use this function to destroy the component.
     * @function
     * @memberOf DescriptionBox#
     */
    destroy: function() {
        this.actor.destroy();
    },

    /**
     * @description Use this function to set the title label.If the
     *              text can be translated it is translated.
     * @param {String} The title. May be null to clear the label.
     * @function
     * @memberOf DescriptionBox#
     */
    setTitle: function(title) {
        if (!title) {
            this._selectedAppTitle.set_text("");
        } else {
            this._selectedAppTitle.set_text(_(title));
        }
    },

    /**
     * @description Use this function to set the description label. If the
     *              text can be translated it is translated.
     * @param {String} The description. May be null to clear the label.
     * @function
     * @memberOf DescriptionBox#
     */
    setDescription: function(description) {
        if (!description) {
            this._selectedAppDescription.set_text("");
        } else {
            this._selectedAppDescription.set_text(_(description));
        }
    },
});
