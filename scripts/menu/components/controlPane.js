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

const Main = imports.ui.main;
const GnomeSession = imports.misc.gnomeSession;
const LoginManager = imports.misc.loginManager;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Component = Me.imports.scripts.menu.components.component.Component;
const IconButton = Me.imports.scripts.menu.components.elements.menubutton.IconButton;
const ButtonGroup = Me.imports.scripts.menu.components.elements.menubutton.ButtonGroup;


/**
 * Simple Enum which provides a mousebutton to id mapping.
 * @private
 */
const MOUSEBUTTON = Me.imports.scripts.menu.components.elements.menubutton.EMousebutton;



/**
 * @class ControlPane
 * @extends Component
 *
 * @classdesc This creates the controls at the bottom of the menu. With the buttons
 *            you are able to logout or shutdown. This component has no
 *            implemented keyboard controls but it is no problem to implement
 *            them. The component can be added to most layouts such as
 *            boxlayouts.
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
const ControlPane = new Lang.Class({

    Name: 'Gnomenu.ControlPane',
    Extends: Component,


    _init: function(model, mediator) {
        this.parent(model, mediator);

        this._session = new GnomeSession.SessionManager();

        this.actor = new St.BoxLayout({ style_class: 'gnomenu-controlPane-box' });
        this._buttonGroup = new ButtonGroup();

        // The elements are created in the refresh method.
        this.refresh();
    },

    /**
     * @description Use this function to bring the view up-to-date.
     * @function
     * @memberOf ControlPane#
     */
    refresh: function() {
        this.clear();

        let iconSize = this.menuSettings.getLayoutDependendIconsize();

        let systemShutdownBtn = new IconButton(this.mediator, 'shutdown-symbolic', iconSize, 'Power Off', 'PowerOff Description');
        systemShutdownBtn.setHandlerForButton(MOUSEBUTTON.MOUSE_LEFT, Lang.bind(this, function() {
            this.shutdownComputer();
        }));

        let systemSuspendBtn = new IconButton(this.mediator, 'suspend-symbolic', iconSize, 'Suspend', 'Suspend Description');
        systemSuspendBtn.setHandlerForButton(MOUSEBUTTON.MOUSE_LEFT, Lang.bind(this, function() {
            this.suspendComputer();
        }));

        let logoutUserBtn = new IconButton(this.mediator, 'user-logout-symbolic', iconSize, 'Log Out', 'Log Out Description');
        logoutUserBtn.setHandlerForButton(MOUSEBUTTON.MOUSE_LEFT, Lang.bind(this, function() {
            this.logoutSession();
        }));

        let lockScreenBtn = new IconButton(this.mediator, 'user-lock-symbolic', iconSize, 'Lock', 'Lock Description');
        lockScreenBtn.setHandlerForButton(MOUSEBUTTON.MOUSE_LEFT, Lang.bind(this, function() {
            this.lockSession();
        }));

        let shellRestartBtn = new IconButton(this.mediator, 'refresh-symbolic', iconSize, 'Restart Shell', 'Restart Shell Description');
        shellRestartBtn.setHandlerForButton(MOUSEBUTTON.MOUSE_LEFT, Lang.bind(this, function() {
            this.restartShell();
        }));

        // All buttons are added to a buttongroup. It is not really neccessary here
        // but who cares?
        this._buttonGroup.addButton(systemShutdownBtn);
        this._buttonGroup.addButton(systemSuspendBtn);
        this._buttonGroup.addButton(logoutUserBtn);
        this._buttonGroup.addButton(lockScreenBtn);
        this._buttonGroup.addButton(shellRestartBtn);

        // You can vary the order of the buttons by shuffeling the lines below.
        this.actor.add(systemShutdownBtn.actor);
        this.actor.add(systemSuspendBtn.actor);
        this.actor.add(logoutUserBtn.actor);
        this.actor.add(lockScreenBtn.actor);
        this.actor.add(shellRestartBtn.actor);
    },

    /**
     * @description Use this function to remove all actors from the component.
     * @function
     * @memberOf ControlPane#
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
     * @function
     * @memberOf ControlPane#
     */
    destroy: function() {
        this.actor.destroy();
    },

    /**
     * @description Removes unneeded effects like the hover style.
     * @function
     * @memberof ControlPane#
     */
    clean: function() {
        this._buttonGroup.clean();
    },

    /**
     * @description This method restarts the shell.
     * @function
     * @memberOf ControlPane#
     */
    restartShell: function() {
        global.reexec_self();
    },

    /**
     * @description This method suspends the computer.
     * @function
     * @memberOf ControlPane#
     */
    suspendComputer: function() {
        //NOTE: alternate is to check if (Main.panel.statusArea.userMenu._haveSuspend) is true
        LoginManager.getLoginManager().canSuspend(
            function(result) {
                if (result) {
                    Main.overview.hide();
                    LoginManager.getLoginManager().suspend();
                }
            }
        );
    },

    /**
     * @description This method shuts the computer down.
     * @function
     * @memberOf ControlPane#
     */
    shutdownComputer: function() {
        // code to shutdown (power off)
        // ToDo: GS38 iterates through SystemLoginSession to check for open sessions
        // and displays an openSessionWarnDialog
        this._session.ShutdownRemote();
    },

    /**
     * @description This method logs the user out.
     * @function
     * @memberOf ControlPane#
     */
    logoutSession: function() {
        this._session.LogoutRemote(0);
    },

    /**
     * @description This method locks the session.
     * @function
     * @memberOf ControlPane#
     */
    lockSession: function() {
        Main.overview.hide();
        Main.screenShield.lock(true);
    },
});
