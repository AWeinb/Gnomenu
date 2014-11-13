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

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Constants = Me.imports.scripts.constants;
const Component = Me.imports.scripts.menu.components.component.Component;
const IconButton = Me.imports.scripts.menu.components.elements.menubutton.IconButton;

const EMenuLayout = Constants.EMenuLayout;


/**
 * @class PreferencesButton: This Class create the preferences button in the top right corner.
 * @extends Component
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
const PreferencesButton = new Lang.Class({

    Name: 'Gnomenu.PreferencesButton',
    Extends: Component,


    _init: function(model, mediator) {
        this.parent(model, mediator);

        this.actor = new St.Bin();
        let iconSize = this.model.getMiscBtnIconSize();
        let extensionPreferencesBtn = new IconButton(mediator, 'control-center-alt-symbolic', iconSize, 'Preferences', null);

        // The normal user would probably expect that the button opens the system controls.
        // So now a left click opens the main controls and a right click the extension prefs.
        extensionPreferencesBtn.setOnLeftClickHandler(Lang.bind(mediator, function() {
            mediator.showSystemPreferences();
        }));

        extensionPreferencesBtn.setOnRightClickHandler(Lang.bind(mediator, function() {
            mediator.showPreferences();
        }));

        // I dont think we need a button group for this one.

        this.actor.set_child(extensionPreferencesBtn.actor, { x_fill: false, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
    },

    /**
     * @description Use this function to bring the view up-to-date. But in this case
     *              there is no moment in which this view would be outdated.
     * @public
     * @function
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
     * @public
     * @function
     */
    clear: function() {
        /*
         * It is not intended to refresh the component so why clear it.
         */
        Log.logWarning("Gnomenu.ControlPane", "clear", "This is not useful!");
    },

    /**
     * @description Use this function to destroy the component.
     * @public
     * @function
     */
    destroy: function() {
        this.actor.destroy();
    },
});
