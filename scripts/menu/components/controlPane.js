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
const ButtonGroup = Me.imports.scripts.menu.components.elements.menubutton.ButtonGroup;

const EMenuLayout = Constants.EMenuLayout;


/**
 * @class ControlPane: This creates the controls at the bottom of the menu. With
 *                     the buttons you are able to logout or shutdown. There is no
 *                     clear or refresh implemented.
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
const ControlPane = new Lang.Class({

    Name: 'Gnomenu.ControlPane',
    Extends: Component,


    _init: function(model, mediator) {
        this.parent(model, mediator);

        this.actor = new St.BoxLayout({ style_class: 'gnomenu-controlPane-box'});
        this._buttonGroup = new ButtonGroup();

        let iconSize = this.model.getMiscBtnIconSize();
        let systemRestart = new IconButton(mediator, 'refresh-symbolic', iconSize, 'Restart Shell', null);
        systemRestart.setOnLeftClickHandler(Lang.bind(mediator, function() {
            mediator.restartShell();
        }));

        let systemSuspend = new IconButton(mediator, 'suspend-symbolic', iconSize, 'Suspend', null);
        systemSuspend.setOnLeftClickHandler(Lang.bind(mediator, function() {
            mediator.suspendComputer();
        }));

        let systemShutdown = new IconButton(mediator, 'shutdown-symbolic', iconSize, 'Shutdown', null);
        systemShutdown.setOnLeftClickHandler(Lang.bind(mediator, function() {
            mediator.shutdownComputer();
        }));

        let logoutUser = new IconButton(mediator, 'user-logout-symbolic', iconSize, 'Logout User', null);
        logoutUser.setOnLeftClickHandler(Lang.bind(mediator, function() {
            mediator.logoutSession();
        }));

        let lockScreen = new IconButton(mediator, 'user-lock-symbolic', iconSize, 'Lock Screen', null);
        lockScreen.setOnLeftClickHandler(Lang.bind(mediator, function() {
            mediator.lockSession();
        }));

        this._buttonGroup.addButton(systemRestart);
        this._buttonGroup.addButton(systemSuspend);
        this._buttonGroup.addButton(systemShutdown);
        this._buttonGroup.addButton(logoutUser);
        this._buttonGroup.addButton(lockScreen);

        this.actor.add(systemRestart.actor,  { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE, margin_right: 1 });
        this.actor.add(systemSuspend.actor,  { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE, margin_right: 1 });
        this.actor.add(systemShutdown.actor, { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE, margin_right: 1 });
        this.actor.add(logoutUser.actor,     { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE, margin_right: 1 });
        this.actor.add(lockScreen.actor,     { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE, margin_right: 1 });
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
        let actors = this.actor.get_children();
        if (actors) {
            for each (let actor in actors) {
                this.actor.remove_actor(actor);
                actor.destroy();
            }
        }
        this._buttongroup.reset();

        this.actor.destroy();
    }
});
