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
const Signals = imports.signals;
const Atk = imports.gi.Atk;
const Clutter = imports.gi.Clutter;
const Shell = imports.gi.Shell;
const Meta = imports.gi.Meta;
const St = imports.gi.St;

const Button = imports.ui.panelMenu.Button;
const ButtonBox = imports.ui.panelMenu.ButtonBox;
const Main = imports.ui.main;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;


/**
 * @class PanelButton
 *
 * @classdesc This class is a simple button that can be used in the main panel.
 *            It provides methods to change text, icon and buttonhandler. Also
 *            you can use a hotspot at top border of the button to activate it.
 *            Besides that you can add keyboard shortcuts to activate the button.
 *
 * @description You should provide a name or an icon. If not you wont get a
 *              big button.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const PanelButton = new Lang.Class({

    Name: 'Gnomenu.panelbutton.PanelButton',
    Extends: ButtonBox,


    _init: function(nameText, iconName) {
        this.parent({ reactive: true,
                      can_focus: true,
                      track_hover: true,
                      accessible_name: nameText ? nameText : "",
                      accessible_role: Atk.Role.MENU });

        this._buttonHandler = null;
        this._buttonHandlerId = null;
        this._keybindingName = null;

        // The mainBox is a vertical layout with the hotspot at the top border and the actual button below.
        let mainBox = new St.BoxLayout({ style_class: 'gnomenu-panel-button', vertical: true });

        // The hotspot has height 1 and fires if entered with the mouse.
        this._hotspot = new Clutter.Actor({ reactive: true, opacity: 0, height: 1 });
        mainBox.add(this._hotspot);
        this._hotspotId = null;
        this._hotspotActive = false;

        // The bin is used to align the button vertically in the middle.
        // The box takes the icon on the left and the label on the right.
        let descBin = new St.Bin({reactive: true});

        let descBox = new St.BoxLayout();
        this._icon = new St.Icon({ style_class: 'system-status-icon gnomenu-panel-button-icon' });
        if (iconName) {
            this._icon.icon_name = iconName;
        }
        descBox.add(this._icon);
        this._label = new St.Label();
        if (nameText) {
            this._label.text = nameText;
        } else {
            this._icon.actor.padding = 0;
        }
        descBox.add(this._label);
        descBin.set_child(descBox);

        // expand: true tells the system that the bin with the button should fill the place.
        mainBox.add(descBin, { expand: true });

        this.actor.add_actor(mainBox);
    },

    /**
     * @description The button uses at the moment only icon names. To change this
     *              name use this method.
     * @param {String} iconName
     * @function
     * @memberOf PanelButton#
     */
    setIconName: function(iconName) {
        this._icon.icon_name = iconName;
    },

    /**
     * @description This changes the label of the button.
     * @param {String} text
     * @function
     * @memberOf PanelButton#
     */
    setLabelText: function(text) {
        this._label.text = text;
    },

    /**
     * @description This deletes the last buttonhandler and activates the new
     *              one if it is valid.
     * @param {Function} handler
     * @function
     * @memberOf PanelButton#
     */
    setButtonHandler: function(handler) {
        if (this._buttonHandlerId) {
            this.actor.disconnect(this._buttonHandlerId);
            this._buttonHandlerId = null;
        }
        if (handler) {
            this._buttonHandlerId = this.actor.connect('button-press-event', handler);
        }
        this._buttonHandler = handler;
    },

    /**
     * @description This method activates or deactivates the button hotspot. The
     *              used method for the hotspot is the button click handler.
     * @param {Boolean} active
     * @function
     * @memberOf PanelButton#
     */
    setHotspotActive: function(active) {
        if (this._hotspotId) {
            this._hotspot.disconnect(this._hotspotId);
            this._hotspotId = null;
        }
        if (this._buttonHandler && active) {
            this._hotspotId = this._hotspot.connect('enter-event', this._buttonHandler);
        }
        this._hotspotActive = active;
    },

    /**
     * @description This method removes the last keybinding and activates the
     *              new one if it is valid.
     * @param {Object} settings
     * @param {String} name
     * @function
     * @memberOf PanelButton#
     */
    setKeyboardShortcut: function(settings, name) {
        if (this._keybindingName != null) {
            Main.wm.removeKeybinding(this._keybindingName);
            this._keybindingName = null;
        }
        if (name && settings && this._buttonHandler) {
            Main.wm.addKeybinding(String(name), settings, Meta.KeyBindingFlags.NONE, Shell.KeyBindingMode.NORMAL, this._buttonHandler);
            this._keybindingName = String(name);
        }
    },

    /**
     * @description Destroys the button. Removes the key binding.
     * @function
     * @memberOf PanelButton#
     */
    destroy: function() {
        this._hotspot.destroy();
        this.setKeyboardShortcut(null, null);
        this.actor.destroy();
        this.container.destroy();
    },

    /**
     * @description Override parent method.
     * @function
     * @memberOf PanelButton#
     * @private
     */
    _onStyleChanged: function(actor) {
        // Ignore HPadding
    }
});


/**
 * @class MenuButton
 *
 * @classdesc This class is a simple button that can be used in the main panel.
 *            It provides methods to change text, icon and buttonhandler. Also
 *            you can use a hotspot at top border of the button to activate it.
 *            Besides that you can add keyboard shortcuts to activate the button.
 *            It is very similar to the normal panelbutton but also provides
 *            methods to handle a menu. You can not register an button handler
 *            because this button is set up to open and close the menu on click.
 *            To get the menu you may access it with .menu.
 *
 * @description You should provide a name or an icon. If not you wont get a
 *              big button.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const MenuButton = new Lang.Class({

    Name: 'Gnomenu.panelbutton.MenuButton',
    Extends: Button,

    // setSensitive: function(sensitive)
    // setMenu: function(menu)

    _init: function(nameText, iconName) {
        this.parent(0.0, nameText, true);
        this.actor.add_style_class_name('panel-status-button');

        this._keybindingName = null;
        this._hotspotActive = false;

        // The mainBox is a vertical layout with the hotspot at the top border and the actual button below.
        let mainBox = new St.BoxLayout({ style_class: 'gnomenu-panel-button', vertical: true });

        // The hotspot has height 1 and fires if entered with the mouse.
        this._hotspot = new Clutter.Actor({ reactive: true, opacity: 0, height: 1 });
        this._hotspot.connect('enter-event', Lang.bind(this, function() {
            if (this._hotspotActive) {
                this.menu.toggle();
            }
        }));
        mainBox.add(this._hotspot);

        // The bin is used to align the button vertically in the middle.
        // The box takes the icon on the left and the label on the right.
        let descBin = new St.Bin({reactive: true});

        let descBox = new St.BoxLayout();
        this._icon = new St.Icon({ style_class: 'system-status-icon gnomenu-panel-button-icon' });
        if (iconName) {
            this._icon.icon_name = iconName;
        }
        descBox.add(this._icon);
        this._label = new St.Label();
        if (nameText) {
            this._label.text = nameText;
        }
        descBox.add(this._label);
        descBin.set_child(descBox);

        // expand: true tells the system that the bin with the button should fill the place.
        mainBox.add(descBin, {expand: true});

        this.actor.add_actor(mainBox);
    },

    /**
     * @description The button uses at the moment only icon names. To change this
     *              name use this method.
     * @param {String} iconName
     * @function
     * @memberOf PanelButton#
     */
    setIconName: function(iconName) {
        this._icon.icon_name = iconName;
    },

    /**
     * @description This changes the label of the button.
     * @param {String} text
     * @function
     * @memberOf PanelButton#
     */
    setLabelText: function(text) {
        this._label.text = text;
    },

    /**
     * @description This method activates or deactivates the button hotspot. The
     *              used method for the hotspot is the button click handler.
     * @param {Boolean} active
     * @function
     * @memberOf PanelButton#
     */
    setHotspotActive: function(active) {
        this._hotspotActive = active;
    },

    /**
     * @description This method removes the last keybinding and activates the
     *              new one if it is valid.
     * @param {Object} settings
     * @param {String} name
     * @function
     * @memberOf PanelButton#
     */
    setKeyboardShortcut: function(settings, name) {
        if (this._keybindingName) {
            Main.wm.removeKeybinding(this._keybindingName);
            this._keybindingName = null;
        }

        if (name && settings) {
            let handler = Lang.bind(this, function() {
                if (this.actor.visible) {
                    this.menu.toggle();
                }
            });
            Main.wm.addKeybinding(name, settings, Meta.KeyBindingFlags.NONE, Shell.KeyBindingMode.NORMAL, handler);
            this._keybindingName = name;
        }
    },

    /**
     * @description Destroys the button. Removes the key binding.
     * @function
     * @memberOf PanelButton#
     */
    destroy: function() {
        this._hotspot.destroy();
        this.menu.destroy();
        this.menu = undefined;

        this.setKeyboardShortcut(null, null, null);
        this.actor.destroy();
        this.container.destroy();
    },

    /**
     * @description Override parent method.
     * @function
     * @memberOf PanelButton#
     * @private
     */
    _onStyleChanged: function(actor) {
        // Ignore HPadding
    },
});