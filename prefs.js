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

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.scripts.misc.convenience;

imports.gettext.textdomain(Me.metadata['gettext-prefs-domain']);
imports.gettext.bindtextdomain(Me.metadata['gettext-prefs-domain'], Me.path + Me.metadata['gettext-prefs-dir']);

const Gettext = imports.gettext.domain(Me.metadata['gettext-prefs-domain']);
const _ = Gettext.gettext;


// The values of the comboboxes need to be transformed to numbers and so on.
// For this we need the values in the correct order.
// There may be a better solution..
const ICONSIZES = [16, 22, 24, 32, 48, 64];
const SELECT_METHODS = [20, 21];
const VIEWMODES = [30, 31];
const MENU_LAYOUTS = [40, 41, 42];
const SIDEBAR_CATEGORIES = [52, 54];
const MENU_CATEGORIES = [51, 50];


/**
 * @class SignalHandlers
 *
 * @classdesc This is a handler collection for the prefs glade file. The method
 *            names are defined in the glade file and after connection the
 *            methods are called when something is clicked.
 *
 * @description The builder object is needed.
 *
 *
 * @param {GTK.Builder} builder
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const SignalHandlers = new Lang.Class({

    Name: 'GnoMenu.prefs.SignalHandlers',


    _init: function (builder) {
        this._builder = builder;
        this._settings = Convenience.getSettings();
    },


    // First page:

    // Switch
    _disableMainCorner: function(switchBtn) {
        this._settings.set_boolean('disable-activities-hotcorner', switchBtn.get_active());
    },

    // Switch
    _disableMenuHotspot: function(switchBtn) {
        this._settings.set_boolean('disable-menu-hotspot', switchBtn.get_active());
    },

    // Check
    _enableMenuShorcutKey: function(toggleBtn) {
        this._settings.set_boolean('enable-menu-shortcut', toggleBtn.get_active());
    },

    // Text
    _changeMenuShorcutKey: function(entry) {
        let [key, mods] = Gtk.accelerator_parse(entry.get_text());
        if(Gtk.accelerator_valid(key, mods)) {
            entry["secondary-icon-name"] = null;
            entry["secondary-icon-tooltip-text"] = null;
            let shortcut = Gtk.accelerator_name(key, mods);
            this._settings.set_strv('menu-shortcut-key', [shortcut]);
        } else {
            entry["secondary-icon-name"] = "dialog-warning-symbolic";
            entry["secondary-icon-tooltip-text"] = _("Invalid Accelerator. Try F12, <Super>space, <Ctrl><Alt><Shift>a, etc.");
        }
    },


    // Check
    _enableMenuButton: function(toggleBtn) {
        this._settings.set_boolean('enable-menu-button', toggleBtn.get_active());
    },

    // Text
    _changeMenuBtnText: function(entry) {
        let iconName = entry.get_text();
        this._settings.set_strv('menu-button-text', [iconName]);
    },

    // Check
    _enableMenuButtonIcon: function(toggleBtn) {
        this._settings.set_boolean('enable-menu-button-icon', toggleBtn.get_active());
    },

    // Text
    _changeMenuBtnIconName: function(entry) {
        let iconName = entry.get_text();
        this._settings.set_strv('menu-button-icon', [iconName]);
    },


    // Check
    _enableAppsButton: function(toggleBtn) {
        this._settings.set_boolean('enable-apps-button', toggleBtn.get_active());
    },

    // Text
    _changeAppsBtnText: function(entry) {
        let iconName = entry.get_text();
        this._settings.set_strv('apps-button-text', [iconName]);
    },

    // Check
    _enableAppsButtonIcon: function(toggleBtn) {
        this._settings.set_boolean('enable-apps-button-icon', toggleBtn.get_active());
    },

    // Text
    _changeAppsBtnIconName: function(entry) {
        let iconName = entry.get_text();
        this._settings.set_strv('apps-button-icon', [iconName]);
    },



    // Check
    _enableWorkspaceButton: function(toggleBtn) {
        this._settings.set_boolean('enable-workspace-button', toggleBtn.get_active());
    },

    // Text
    _changeWorkspaceBtnText: function(entry) {
        let iconName = entry.get_text();
        this._settings.set_strv('workspace-button-text', [iconName]);
    },

    // Check
    _enableWorkspaceButtonIcon: function(toggleBtn) {
        this._settings.set_boolean('enable-workspace-button-icon', toggleBtn.get_active());
    },

    // Text
    _changeWorkspaceBtnIconName: function(entry) {
        let iconName = entry.get_text();
        this._settings.set_strv('workspace-button-icon', [iconName]);
    },



    // Second page:

    // Switch
    _enableSidebar: function(switchBtn) {
        this._settings.set_boolean('enable-sidebar', switchBtn.get_active());
    },

    // Combobox
    _changeSidebarCategory: function(combobox) {
        this._settings.set_enum('sidebar-category', SIDEBAR_CATEGORIES[combobox.get_active()]);
    },

    // Combobox
    _changeSidebarIconsize: function(combobox) {
        this._settings.set_int('sidebar-iconsize', ICONSIZES[combobox.get_active()]);
    },

    // Combobox
    _changeMenuLayout: function(combobox) {
        let sidebarIconsizeCombobox = this._builder.get_object('nb2_sidebarSettingsBox_grid_combobox3');
        let menuAppListIconsizeCombobox = this._builder.get_object('nb2_menuSettingsBox_grid_combobox5');
        let menuAppGridIconsizeCombobox = this._builder.get_object('nb2_menuSettingsBox_grid_combobox6');

        let selected = combobox.get_active();
        if (selected == 2) {
            sidebarIconsizeCombobox.set_active(ICONSIZES.indexOf(24));
            menuAppListIconsizeCombobox.set_active(ICONSIZES.indexOf(24));
            menuAppGridIconsizeCombobox.set_active(ICONSIZES.indexOf(32));

        } else if (selected == 1) {
            sidebarIconsizeCombobox.set_active(ICONSIZES.indexOf(32));
            menuAppListIconsizeCombobox.set_active(ICONSIZES.indexOf(24));
            menuAppGridIconsizeCombobox.set_active(ICONSIZES.indexOf(48));

        } else if (selected == 0) {
            sidebarIconsizeCombobox.set_active(ICONSIZES.indexOf(48));
            menuAppListIconsizeCombobox.set_active(ICONSIZES.indexOf(32));
            menuAppGridIconsizeCombobox.set_active(ICONSIZES.indexOf(64));
        }
        this._settings.set_enum('menu-layout', MENU_LAYOUTS[selected]);
    },

    // Combobox
    _changeMenuStartCategory: function(combobox) {
        this._settings.set_enum('menu-startcategory', MENU_CATEGORIES[combobox.get_active()]);
    },

    // Combobox
    _changeMenuDefaultViewMode: function(combobox) {
        this._settings.set_enum('menu-viewmode', VIEWMODES[combobox.get_active()]);
    },

    // Combobox
    _changeMenuCatSelectMethod: function(combobox) {
        this._settings.set_enum('menu-category-selectionmethod', SELECT_METHODS[combobox.get_active()]);
    },

    // Combobox
    _changeApplistIconsize: function(combobox) {
        this._settings.set_int('menu-applist-iconsize', ICONSIZES[combobox.get_active()]);
    },

    // Combobox
    _changeAppgridIconsize: function(combobox) {
        this._settings.set_int('menu-appgrid-iconsize', ICONSIZES[combobox.get_active()]);
    },

    // numberfield
    _changeSearchResultCount: function(spinButton) {
        this._settings.set_int('menu-search-maxresultcount', spinButton.get_value());
    },


    // Third page:



    // ---

    /**
     * @description Connector function that connects the glade-build-object to the
     *              handler. The parameters are filled by gtk.
     * @function
     */
    _connector: function(builder, object, signal, handler) {
        try {
            object.connect(signal, Lang.bind(this, this[handler]));
        } catch(e) {
            log("Function " + handler + " is not defined!");
        }
    },
});


/**
 * @description This method inits the preferences. This function is called
 *              when the gnome shell starts.
 * @function
 */
function init() {
}


/**
 * @description This method creates the gui element of this preferences dialog.
 * @function
 */
function buildPrefsWidget() {
    // The layout is stored inside of a glade file and is build with the gtk builder.
    let builder = new Gtk.Builder();

    // The path to the glade file is stored in the meta data.
    let gladePath = Me.path + Me.metadata['prefs-glade-file'];
    if (!builder.add_from_file(gladePath)) {
        // This shows a message instead of the dialog.
        log("Could not load the ui file: %s".format(gladePath));
        let label = new Gtk.Label({
            label: "Could not load the preferences UI file",
            vexpand: true
        });
        return label;
    }

    // My base layout is a notebook.
    let notebook = builder.get_object('notebook');
    notebook.show_all();

    // The sliders, checkboxes, and labels need to be initialized.
    // For this we read the settings and apply the values.
    _setDefaults(builder);

    // To make the signal connecting easier the glade file knows about the
    // correct callback method in the signal handler class. We only
    // need to connect it and implement the handler methods.
    let signal_handlers = new SignalHandlers(builder);
    builder.connect_signals_full(Lang.bind(signal_handlers, signal_handlers._connector));

    return notebook;
}

/**
 * @description Sets the settings values to the gui elements. This is a lot
 *              object-getting, settings-getting, and object value settings blah fu.
 * @function
 * @private
 */
function _setDefaults(builder) {
    let settings = Convenience.getSettings();

    let enableMainHotCornerSwitch = builder.get_object('nb1_miscSettingsBox_grid_switch1');
    let enableMenuHotspotSwitch = builder.get_object('nb1_miscSettingsBox_grid_switch2');
    let enableMenuShortcutKeyCheck = builder.get_object('nb1_miscSettingsBox_grid_label3');
    let shortcutKeyEntry = builder.get_object('nb1_miscSettingsBox_grid_entry3');
    enableMainHotCornerSwitch.set_active(settings.get_boolean('disable-activities-hotcorner'));
    enableMenuHotspotSwitch.set_active(settings.get_boolean('disable-menu-hotspot'));
    enableMenuShortcutKeyCheck.set_active(settings.get_boolean('enable-menu-shortcut'));
    shortcutKeyEntry.set_text(settings.get_strv('menu-shortcut-key')[0]);

    let enableMenuButtonCheck = builder.get_object('nb1_menuSettingsBox_ckb');
    let menuButtonTextEntry = builder.get_object('nb1_menuSettingsBox_grid_entry1');
    let enableMenuButtonIconCheck = builder.get_object('nb1_menuSettingsBox_grid_label2');
    let menuButtonIconNameEntry = builder.get_object('nb1_menuSettingsBox_grid_entry2');
    enableMenuButtonCheck.set_active(settings.get_boolean('enable-menu-button'));
    menuButtonTextEntry.set_text(settings.get_strv('menu-button-text')[0]);
    enableMenuButtonIconCheck.set_active(settings.get_boolean('enable-menu-button-icon'));
    menuButtonIconNameEntry.set_text(settings.get_strv('menu-button-icon')[0]);

    let enableAppsButtonCheck = builder.get_object('nb1_appsSettingsBox_ckb');
    let appsButtonTextEntry = builder.get_object('nb1_appsSettingsBox_grid_entry1');
    let enableAppsButtonIconCheck = builder.get_object('nb1_appsSettingsBox_grid_label2');
    let appsButtonIconNameEntry = builder.get_object('nb1_appsSettingsBox_grid_entry2');
    enableAppsButtonCheck.set_active(settings.get_boolean('enable-apps-button'));
    appsButtonTextEntry.set_text(settings.get_strv('apps-button-text')[0]);
    enableAppsButtonIconCheck.set_active(settings.get_boolean('enable-apps-button-icon'));
    appsButtonIconNameEntry.set_text(settings.get_strv('apps-button-icon')[0]);

    let enableWorkspaceButtonCheck = builder.get_object('nb1_workspaceSettingsBox_ckb');
    let workspaceButtonTextEntry = builder.get_object('nb1_workspaceSettingsBox_grid_entry1');
    let enableWorkspaceButtonIconCheck = builder.get_object('nb1_workspaceSettingsBox_grid_label2');
    let workspaceButtonIconNameEntry = builder.get_object('nb1_workspaceSettingsBox_grid_entry2');
    enableWorkspaceButtonCheck.set_active(settings.get_boolean('enable-workspace-button'));
    workspaceButtonTextEntry.set_text(settings.get_strv('workspace-button-text')[0]);
    enableWorkspaceButtonIconCheck.set_active(settings.get_boolean('enable-workspace-button-icon'));
    workspaceButtonIconNameEntry.set_text(settings.get_strv('workspace-button-icon')[0]);


    let enableSidebarSwitch = builder.get_object('nb2_sidebarSettingsBox_grid_switch1');
    let sidebarCategoryCombobox = builder.get_object('nb2_sidebarSettingsBox_grid_combobox2');
    let sidebarIconsizeCombobox = builder.get_object('nb2_sidebarSettingsBox_grid_combobox3');
    enableSidebarSwitch.set_active(settings.get_boolean('enable-sidebar'));
    sidebarCategoryCombobox.set_active(SIDEBAR_CATEGORIES.indexOf(settings.get_enum('sidebar-category')) + '');
    sidebarIconsizeCombobox.set_active(ICONSIZES.indexOf(settings.get_int('sidebar-iconsize')) + '');

    let menuLayoutCombobox = builder.get_object('nb2_menuSettingsBox_grid_combobox1');
    let menuStartCategoryCombobox = builder.get_object('nb2_menuSettingsBox_grid_combobox2');
    let menuViewModeCombobox = builder.get_object('nb2_menuSettingsBox_grid_combobox3');
    let menuCatSelectMethodCombobox = builder.get_object('nb2_menuSettingsBox_grid_combobox4');
    let menuAppListIconsizeCombobox = builder.get_object('nb2_menuSettingsBox_grid_combobox5');
    let menuAppGridIconsizeCombobox = builder.get_object('nb2_menuSettingsBox_grid_combobox6');
    menuLayoutCombobox.set_active(MENU_LAYOUTS.indexOf(settings.get_enum('menu-layout')) + '');
    menuStartCategoryCombobox.set_active(MENU_CATEGORIES.indexOf(settings.get_enum('menu-startcategory')) + '');
    menuViewModeCombobox.set_active(VIEWMODES.indexOf(settings.get_enum('menu-viewmode')) + '');
    menuCatSelectMethodCombobox.set_active(SELECT_METHODS.indexOf(settings.get_enum('menu-category-selectionmethod')) + '');
    menuAppListIconsizeCombobox.set_active(ICONSIZES.indexOf(settings.get_int('menu-applist-iconsize')) + '');
    menuAppGridIconsizeCombobox.set_active(ICONSIZES.indexOf(settings.get_int('menu-appgrid-iconsize')) + '');

    let menuSearchResultCountSpin = builder.get_object('nb2_searchSettingsBox_grid_spinbutton1');
    menuSearchResultCountSpin.set_value(settings.get_int('menu-search-maxresultcount'));
}