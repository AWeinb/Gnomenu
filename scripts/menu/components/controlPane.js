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
const Component = Me.imports.scripts.menu.components.component.Component;
const IconButton = Me.imports.scripts.menu.components.elements.menubutton.IconButton;
const ButtonGroup = Me.imports.scripts.menu.components.elements.menubutton.ButtonGroup;

const MOUSEBUTTON = Me.imports.scripts.menu.components.elements.menubutton.MOUSEBUTTON;

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

        this.actor = new St.BoxLayout({ style_class: 'gnomenu-controlPane-box' });
        this._buttonGroup = new ButtonGroup();
        
        this.refresh();
    },

    /**
     * @description Use this function to bring the view up-to-date.
     * @public
     * @function
     */
    refresh: function() {
        this.clear();
        
        let iconSize = this.menuSettings.getLayoutDependendIconsize();
        
        let systemShutdownBtn = new IconButton(this.mediator, 'shutdown-symbolic', iconSize, 'Power Off', 'PowerOff Description');
        systemShutdownBtn.setHandlerForButton(MOUSEBUTTON.MOUSE_LEFT, Lang.bind(this, function() {
            this.mediator.shutdownComputer();
        }));
        
        let systemSuspendBtn = new IconButton(this.mediator, 'suspend-symbolic', iconSize, 'Suspend', 'Suspend Description');
        systemSuspendBtn.setHandlerForButton(MOUSEBUTTON.MOUSE_LEFT, Lang.bind(this, function() {
            this.mediator.suspendComputer();
        }));
        
        let logoutUserBtn = new IconButton(this.mediator, 'user-logout-symbolic', iconSize, 'Log Out', 'Log Out Description');
        logoutUserBtn.setHandlerForButton(MOUSEBUTTON.MOUSE_LEFT, Lang.bind(this, function() {
            this.mediator.logoutSession();
        }));
        
        let lockScreenBtn = new IconButton(this.mediator, 'user-lock-symbolic', iconSize, 'Lock', 'Lock Description');
        lockScreenBtn.setHandlerForButton(MOUSEBUTTON.MOUSE_LEFT, Lang.bind(this, function() {
            this.mediator.lockSession();
        }));
        
        let shellRestartBtn = new IconButton(this.mediator, 'refresh-symbolic', iconSize, 'Restart Shell', 'Restart Shell Description');
        shellRestartBtn.setHandlerForButton(MOUSEBUTTON.MOUSE_LEFT, Lang.bind(this, function() {
            this.mediator.restartShell();
        }));

        this._buttonGroup.addButton(systemShutdownBtn);
        this._buttonGroup.addButton(systemSuspendBtn);
        this._buttonGroup.addButton(logoutUserBtn);
        this._buttonGroup.addButton(lockScreenBtn);
        this._buttonGroup.addButton(shellRestartBtn);

        this.actor.add(systemShutdownBtn.actor);
        this.actor.add(systemSuspendBtn.actor);
        this.actor.add(logoutUserBtn.actor);   
        this.actor.add(lockScreenBtn.actor);
        this.actor.add(shellRestartBtn.actor);
    },

    /**
     * @description Use this function to remove all actors from the component.
     * @public
     * @function
     */
    clear: function() {
        let actors = this.actor.get_children();
        if (actors) {
            for each (let actor in actors) {
                this.actor.remove_actor(actor);
                actor.destroy();
            }
        }
        this._buttonGroup.reset();
    },

    /**
     * @description Use this function to destroy the component.
     * @public
     * @function
     */
    destroy: function() {
        this.clear();
        this.actor.destroy();
    }
});
