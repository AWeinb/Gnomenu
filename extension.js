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

// journalctl /usr/bin/gnome-session -f -o cat

const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const IconTheme = imports.gi.Gtk.IconTheme;

const Main = imports.ui.main;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;
const ActivitiesButton = Me.imports.scripts.panel.ActivitiesButton;
const PanelBox = Me.imports.scripts.panel.PanelBox;
const Convenience = Me.imports.scripts.misc.convenience;
const StyleManager = Me.imports.scripts.misc.styleManager.StyleManager;


/* This can be removed if it is sure that this variables exist. */
if (Clutter.EVENT_PROPAGATE == undefined) Clutter.EVENT_PROPAGATE = false;
if (Clutter.EVENT_STOP == undefined) Clutter.EVENT_STOP = true;


/**
 * @description This method is called by the extension system when the
 *              extension is enabled. In this case it creates the elements
 *              of the panel and the menu. After this method the panel buttons
 *              are added and the menu can be used.
 * @function
 */
function enable() {
    global.log("Gnomenu: Enabled!");

    // The convenience module uses the meta data to find the correct settings object.
    let settings = Convenience.getSettings();
    if (!settings) {
        // And hopefully finds one. But this should work in most cases.
        return;
    }
	
	// The stylemanager loads the stylesheet and refreshs it if needed.
	this._styleManager = new StyleManager(settings);
	if (!this._styleManager.load()) {
		Log.logError("Gnomenu", "enable", "The style was not loaded!");
	}

    // This box contains all buttons and elements that are added by this extension.
    this.panelBox = new PanelBox(settings, this._styleManager);
    // We want to insert the box at the left.
    Main.panel._leftBox.insert_child_at_index(this.panelBox.actor, 0);

    // This creates an utility wrapper around the activities button.
    // With this it is easier to hide or show it.
    this._actBtn = new ActivitiesButton();
    this._actBtn.hide();
    // We provided the settings option to deactivate the activities hotspot.
    this._actBtn.setCornerActive(!settings.get_boolean('disable-activities-hotcorner'));

    // To update the button if setting changes occured we need to connect a
    // handler to the settings.
    settings.connect('changed::disable-activities-hotcorner', Lang.bind(this, function() {
        this._actBtn.setCornerActive(!settings.get_boolean('disable-activities-hotcorner'));
    }));
}


/**
 * @description This method disables the extension. That means that the
 *              elements of the extension are destroyed and hopefully
 *              everything is cleaned up.
 * @function
 */
function disable() {
    global.log("Gnomenu: Disabled!");

    // The default is to show the activities button and activate the hotspot.
    this._actBtn.show();
    this._actBtn.setCornerActive(true);

    this._styleManager.destroy();
    this.panelBox.destroy();
}


/**
 * @description This method inits the extension. This function is called
 *              when the gnome shell starts.
 * @function
 */
function init() {
    Convenience.initTranslations();

    // Add extension icons to icon theme directory path
    // TODO: move this to enable/disable?
    // GS patch https://bugzilla.gnome.org/show_bug.cgi?id=675561
    let theme = IconTheme.get_default();
    theme.append_search_path(Me.path + "/icons");
}
