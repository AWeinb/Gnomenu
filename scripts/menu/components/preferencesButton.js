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
const Shell = imports.gi.Shell;

const Main = imports.ui.main;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const MenuModel = Me.imports.scripts.menu.menuModel;
const Component = Me.imports.scripts.menu.components.component.Component;
const IconButton = Me.imports.scripts.menu.components.elements.menubutton.IconButton;


/**
 * Simple Enum which provides a mousebutton to id mapping.
 * @private
 */
const MOUSEBUTTON = Me.imports.scripts.menu.components.elements.menubutton.EMousebutton;



/**
 * @class PreferencesButton
 * @extends Component
 *
 * @classdesc This component is a single button to open the settings and the
 *            extension preferences. It is addable to all major layouts such as
 *            the boxlayout.
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
const PreferencesButton = new Lang.Class({

    Name: 'Gnomenu.PreferencesButton',
    Extends: Component,


    _init: function(model, mediator) {
        this.parent(model, mediator);

        this.actor = new St.Bin();

        // Refresh creates the element.
        this.refresh();
    },

    /**
     * @description Use this function to bring the starting state.
     * @function
     * @memberOf PreferencesButton#
     */
    refresh: function() {
        this.clear();

        let iconSize = this.menuSettings.getLayoutDependendIconsize();
        this._extensionPreferencesBtn = new IconButton(this.mediator, 'control-center-alt-symbolic', iconSize, 'Settings', 'Settings Description');

        // The normal user would probably expect that the button opens the system controls.
        // So now a left click opens the main controls and a middle click the extension prefs.
        this._extensionPreferencesBtn.setHandlerForButton(MOUSEBUTTON.MOUSE_LEFT, Lang.bind(this, function() {
            this.showSystemPreferences();
        }));

        this._extensionPreferencesBtn.setHandlerForButton(MOUSEBUTTON.MOUSE_MIDDLE, Lang.bind(this, function() {
            this.showPreferences();
        }));

        // I dont think we need a button group for this one.

        this.actor.set_child(this._extensionPreferencesBtn.actor);
    },

    /**
     * @description Use this function to remove all actors from the component.
     * @function
     * @memberOf PreferencesButton#
     */
    clear: function() {
        let actors = this.actor.get_children();
        if (actors) {
            for each (let actor in actors) {
                this.actor.remove_actor(actor);
                actor.destroy();
            }
        }
    },

    /**
     * @description Use this function to destroy the component.
     * @function
     * @memberOf PreferencesButton#
     */
    destroy: function() {
        this.actor.destroy();
    },
    
    /**
     * @description Removes unneeded effects like the hover style.
     * @function
     * @memberof PreferencesButton#
     */
    clean: function() {
        this._extensionPreferencesBtn.clean();
    },
    
    /**
     * @description This method opens the gnome control center.
     * @function
     * @memberOf PreferencesButton#
     */
    showSystemPreferences: function() {
        let app = Shell.AppSystem.get_default().lookup_app('gnome-control-center.desktop');
        app.activate();
    },

    /**
     * @description This method opens the extension settings.
     * @function
     * @memberOf PreferencesButton#
     */
    showPreferences: function() {
        Main.Util.trySpawnCommandLine('gnome-shell-extension-prefs ' + Me.metadata['uuid']);
    },
});
