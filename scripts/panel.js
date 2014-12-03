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

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;
const MenuButton = Me.imports.scripts.panelbutton.MenuButton;
const PanelButton = Me.imports.scripts.panelbutton.PanelButton;
const Menu = Me.imports.scripts.menu.menu.Menu;


/**
 * @class PanelBox
 *
 * @classdesc This class creates a boxlayout which then can be added to the top
 *            panel. It prepares everything and every button for this. You just
 *            need to add the actor to the panel. If finished you can destroy the
 *            instance with the destroy method.
 *
 * @description You need to provide a valid gsettings instance. The constructor
 *              then creates everything that should be visible in the panelbox.
 *
 *
 * @param {Settings} settings A gsettings instance.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const PanelBox = new Lang.Class({

    Name: 'Gnomenu.panel.PanelBox',


    _init: function(settings, styleManager) {
        this._settings = settings;
        this._styleManager = styleManager;

        // Each button is added to this box.
        this.actor = new St.BoxLayout({ style_class: 'gnomenu-panel-box' });
        this._createButtons(settings);
        this._connectToSettings(settings);
    },

    /**
     * @description This method creates the button for the box.
     * @function
     * @memberOf PanelBox#
     * @private
     */
    _createButtons: function() {
        // I created a helper method to help me with the buttons. Most of the
        // init code for them is the same.
        this._workspaceButton = this._easyButtonCreate('enable-workspace-button', 'workspace-button-text', 'enable-workspace-button-icon', 'workspace-button-icon', PanelButton);
        let workspaceBtnCallback = Lang.bind(this, function() {
            // This button shows or hides the overview.
            if (Main.overview.visible) {
                Main.overview.hide();
            } else {
                Main.overview.show();
                // The apps are shown if the apps button was clicked.
                // This is not intended here.
                Main.overview.viewSelector._showAppsButton.checked = false;
            }
        });
        this._workspaceButton.setButtonHandler(workspaceBtnCallback);
        this._workspaceButton.setHotspotActive(false);

        this._appsButton = this._easyButtonCreate('enable-apps-button', 'apps-button-text', 'enable-apps-button-icon', 'apps-button-icon', PanelButton);
        let appsBtnCallback = Lang.bind(this, function() {
            // Same as above. But now it is intended to show the apps.
            if (Main.overview.visible) {
                Main.overview.hide();

            } else {
                Main.overview.show();
                Main.overview.viewSelector._showAppsButton.checked = true;
            }
        });
        this._appsButton.setButtonHandler(appsBtnCallback);
        this._appsButton.setHotspotActive(false);

        // The menu button is not much different from the last buttons but
        // important is that it extends the menubutton class.
        // This class implements a lot of the menubutton functionality.
        this._menuButton = this._easyButtonCreate('enable-menu-button', 'menu-button-text', 'enable-menu-button-icon', 'menu-button-icon', MenuButton);
        let menu = new Menu(this._menuButton.actor, this._settings);
        this._menuButton.setMenu(menu);
        this._menuButton.setHotspotActive(this._settings.get_boolean('disable-menu-hotspot'));

        // Set up the shortcut key to open the menu.
        if (this._settings.get_boolean('enable-menu-shortcut')) {
            this._menuButton.setKeyboardShortcut(this._settings, 'menu-shortcut-key');
        }
    },

    /**
     * @description Helper for creating the buttons. Takes the settings ids for
     *              the data and the buttonclass. At the moment the normal button
     *              and the menu button share a lot of code and not different to
     *              init.
     * @function
     * @memberOf PanelBox#
     * @private
     */
    _easyButtonCreate: function(enableButtonID, labelID, enableIconID, iconID, buttonClass) {
        let text = this._settings.get_strv(labelID);
        let icon = null;
        if (this._settings.get_boolean(enableIconID)) {
            icon = this._settings.get_strv(iconID);
        }

        // With icon and text create the button.
        let btn = new buttonClass(String(text), String(icon));
        this.actor.add(btn.container);

        if (!this._settings.get_boolean(enableButtonID)) {
            btn.actor.hide();
        }

        return btn;
    },

    /**
     * @description Helper to set up the settings. Every needed id is connected
     *              to a handler function. Might be a bit difficult to read.
     *              Perhaps it helps that it is ordered by button.
     *              Every connect id is saved to disconnect it again on destroy.
     * @function
     * @memberOf PanelBox#
     * @private
     */
    _connectToSettings: function(settings) {
        this._settingsIDs = [];

        this._settingsIDs.push(settings.connect('changed::enable-workspace-button', Lang.bind(this, function() {
            if (settings.get_boolean('enable-workspace-button')) {
                this._workspaceButton.actor.show();
            } else {
                this._workspaceButton.actor.hide();
            }
        })));
        this._settingsIDs.push(settings.connect('changed::workspace-button-text', Lang.bind(this, function() {
            this._workspaceButton.setLabelText(String(settings.get_strv('workspace-button-text')));
        })));
        this._settingsIDs.push(settings.connect('changed::enable-workspace-button-icon', Lang.bind(this, function() {
            if (settings.get_boolean('enable-workspace-button-icon')) {
                this._workspaceButton.setIconName(String(settings.get_strv('workspace-button-icon')));
            } else {
                this._workspaceButton.setIconName("");
            }
        })));
        this._settingsIDs.push(settings.connect('changed::workspace-button-icon', Lang.bind(this, function() {
            this._workspaceButton.setIconName(String(settings.get_strv('workspace-button-icon')));
        })));


        this._settingsIDs.push(settings.connect('changed::enable-apps-button', Lang.bind(this, function() {
            if (settings.get_boolean('enable-apps-button')) {
                this._appsButton.actor.show();
            } else {
                this._appsButton.actor.hide();
            }
        })));
        this._settingsIDs.push(settings.connect('changed::apps-button-text', Lang.bind(this, function() {
            this._appsButton.setLabelText(String(settings.get_strv('apps-button-text')));
        })));
        this._settingsIDs.push(settings.connect('changed::enable-apps-button-icon', Lang.bind(this, function() {
            if (settings.get_boolean('enable-apps-button-icon')) {
                this._appsButton.setIconName(String(settings.get_strv('apps-button-icon')));
            } else {
                this._appsButton.setIconName("");
            }
        })));
        this._settingsIDs.push(settings.connect('changed::apps-button-icon', Lang.bind(this, function() {
            this._appsButton.setIconName(String(settings.get_strv('apps-button-icon')));
        })));


        this._settingsIDs.push(settings.connect('changed::enable-menu-button', Lang.bind(this, function() {
            if (settings.get_boolean('enable-menu-button')) {
                this._menuButton.actor.show();
            } else {
                this._menuButton.actor.hide();
            }
        })));
        this._settingsIDs.push(settings.connect('changed::menu-button-text', Lang.bind(this, function() {
            this._menuButton.setLabelText(String(settings.get_strv('menu-button-text')));
        })));
        this._settingsIDs.push(settings.connect('changed::enable-menu-button-icon', Lang.bind(this, function() {
            if (settings.get_boolean('enable-menu-button-icon')) {
                this._menuButton.setIconName(String(settings.get_strv('menu-button-icon')));
            } else {
                this._menuButton.setIconName("");
            }
        })));
        this._settingsIDs.push(settings.connect('changed::menu-button-icon', Lang.bind(this, function() {
            this._menuButton.setIconName(String(settings.get_strv('menu-button-icon')));
        })));
        this._settingsIDs.push(settings.connect('changed::disable-menu-hotspot', Lang.bind(this, function() {
            this._menuButton.setHotspotActive(settings.get_boolean('disable-menu-hotspot'));
        })));
        this._settingsIDs.push(settings.connect('changed::enable-menu-shortcut', Lang.bind(this, function() {
            if (settings.get_boolean('enable-menu-shortcut')) {
                this._menuButton.setKeyboardShortcut(settings, 'menu-shortcut-key');
            } else {
                this._menuButton.setKeyboardShortcut(settings, null);
            }
        })));
        this._settingsIDs.push(settings.connect('changed::menu-shortcut-key', Lang.bind(this, function() {
            if (settings.get_boolean('enable-menu-shortcut')) {
                this._menuButton.setKeyboardShortcut(settings, 'menu-shortcut-key');
            }
        })));


        this._settingsIDs.push(settings.connect('changed::menu-layout', Lang.bind(this, function() {
            this._styleManager.refresh();

            this._menuButton.menu.destroy();
            this._menuButton.menu = undefined;
            let menu = new Menu(this._menuButton.actor, settings);
            this._menuButton.setMenu(menu);
        })));
    },

    /**
     * @description This method destroys the instance. It disconnects the
     *              handler and destroys all buttons.
     * @function
     * @memberOf PanelBox#
     */
    destroy: function() {
        for each (let id in this._settingsIDs) {
            try {
                this._settings.disconnect(id);
            } catch(e) {
                Log.logWarning("Gnomenu.panel.PanelBox", "destroy", e);
            }
        }
        this._settingsIDs = undefined;

        this._workspaceButton.destroy();
        this._appsButton.destroy();
        this._menuButton.destroy();
        this.actor.destroy();
    }
});


/**
 * @class ActivitiesButton
 *
 * @classdesc This class is a wrapper around the apps button of the standard
 *            panel. This class provides methods to show/hide the button or
 *            to modify the hotspot.
 *
 * @description .
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const ActivitiesButton = new Lang.Class({

    Name: 'Gnomenu.panel.ActivitiesButton',


    _init: function() {
        // Gets the button from Main.
        this._activitiesBtn = Main.panel.statusArea['activities'];
    },

    /**
     * @description Hides the activities button. Use show to make it visible again.
     * @function
     * @memberOf ActivitiesButton#
     */
    hide: function() {
        if (this._activitiesBtn != null) {
            this._activitiesBtn.actor.hide();
        }
    },

    /**
     * @description Shows the activities button. Use hide to make it hidden again.
     * @function
     * @memberOf ActivitiesButton#
     */
    show: function() {
        if (this._activitiesBtn) {
            this._activitiesBtn.actor.show();
        }
    },

    /**
     * @description Activates or deactivates the activities hotcorner.
     * @function
     * @memberOf ActivitiesButton#
     */
    setCornerActive: function(active) {
        if (!active) {
            let primary = Main.layoutManager.primaryIndex;
            let corner = Main.layoutManager.hotCorners[primary];
            if (corner && corner.actor) {
                // This is GS 3.8+ fallback corner. Need to hide actor
                // to keep from triggering overview
                corner.actor.hide();
            } else {
                // Need to destroy corner to remove pressure barrier
                // to keep from triggering overview
                if (corner && corner._pressureBarrier) {
                    Main.layoutManager.hotCorners.splice(primary, 1);
                    corner.destroy();
                }
            }
        } else {
            let primary = Main.layoutManager.primaryIndex;
            let corner = Main.layoutManager.hotCorners[primary];
            if (corner && corner.actor) {
                // This is Gs 3.8+ fallback corner. Need to show actor
                // to trigger overview
                corner.actor.show();
            } else {
                // Need to create corner to setup pressure barrier
                // to trigger overview
                if (!corner || !corner._pressureBarrier) {
                    Main.layoutManager._updateHotCorners();
                }
            }
        }
    },
});
