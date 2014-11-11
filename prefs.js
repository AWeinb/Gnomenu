
const Lang = imports.lang;
const Gtk = imports.gi.Gtk;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.scripts.misc.convenience;

imports.gettext.textdomain(Me.metadata['gettext-prefs-domain']);
imports.gettext.bindtextdomain(Me.metadata['gettext-prefs-domain'], Me.path + Me.metadata['gettext-prefs-dir']);

const Gettext = imports.gettext.domain(Me.metadata['gettext-prefs-domain']);
const _ = Gettext.gettext;



const SignalHandlers = new Lang.Class({
    
    Name: 'GnoMenu.prefs.SignalHandlers',
    
    
    _init: function (builder) {
        this._builder = builder;
        this._settings = Convenience.getSettings();
        
        this._iconSizes = [16, 22, 24, 32, 48, 64];
        this._selectMethods = [20, 21];
        this._viewModes = [30, 31];
        this._menuLayouts = [40, 41, 42];
        this._sidebarCategories = [52, 54];
        this._menuCategories = [51, 50];
        
        //log(settings.get_boolean('disable-activities-hotcorner'));
        //log(settings.get_boolean('disable-menu-hotspot'));
        //log(settings.get_boolean('enable-menu-shortcut'));
        //log(settings.get_strv('menu-shortcut-key'));
        //
        //log(settings.get_boolean('enable-menu-button'));
        //log(settings.get_strv('menu-button-text'));
        //log(settings.get_boolean('enable-menu-button-icon'));
        //log(settings.get_strv('menu-button-icon'));
        //
        //log(settings.get_boolean('enable-apps-button'));
        //log(settings.get_strv('apps-button-text'));
        //log(settings.get_boolean('enable-apps-button-icon'));
        //log(settings.get_strv('apps-button-icon'));
        //
        //log(settings.get_boolean('enable-workspace-button'));
        //log(settings.get_strv('workspace-button-text'));
        //log(settings.get_boolean('enable-workspace-button-icon'));
        //log(settings.get_strv('workspace-button-icon'));
        //
        //log(settings.get_boolean('enable-sidebar'));
        //log(settings.get_enum('sidebar-category'));
        //log(settings.get_int('sidebar-iconsize'));
        //
        //log(settings.get_enum('menu-layout'));
        //log(settings.get_enum('menu-category'));
        //log(settings.get_enum('menu-viewmode'));
        //log(settings.get_enum('menu-category-selectionmethod'));
        //log(settings.get_int('menu-applist-iconsize'));
        //log(settings.get_int('menu-appgrid-iconsize'));
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
            entry["secondary-icon-tooltip-text"] = _("Invalid accelerator. Try F12, <Super>space, <Ctrl><Alt><Shift>a, etc.");
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
        log(this._sidebarCategories[combobox.get_active()])
        this._settings.set_enum('sidebar-category', this._sidebarCategories[combobox.get_active()]);
    },
    
    // Combobox
    _changeSidebarIconsize: function(combobox) {
        log(this._iconSizes[combobox.get_active()])
        this._settings.set_int('sidebar-iconsize', this._iconSizes[combobox.get_active()]);
    },
    
    // Combobox
    _changeMenuLayout: function(combobox) {
        let sidebarIconsizeCombobox = this._builder.get_object('nb2_sidebarSettingsBox_grid_combobox3');
        let menuAppListIconsizeCombobox = this._builder.get_object('nb2_menuSettingsBox_grid_combobox5');
        let menuAppGridIconsizeCombobox = this._builder.get_object('nb2_menuSettingsBox_grid_combobox6');
        
        let selected = combobox.get_active();
        if (selected == 2) {
            sidebarIconsizeCombobox.set_active(this._iconSizes.indexOf(24));
            menuAppListIconsizeCombobox.set_active(this._iconSizes.indexOf(16));
            menuAppGridIconsizeCombobox.set_active(this._iconSizes.indexOf(32));
            
        } else if (selected == 1) {
            sidebarIconsizeCombobox.set_active(this._iconSizes.indexOf(32));
            menuAppListIconsizeCombobox.set_active(this._iconSizes.indexOf(24));
            menuAppGridIconsizeCombobox.set_active(this._iconSizes.indexOf(48));
            
        } else if (selected == 0) {
            sidebarIconsizeCombobox.set_active(this._iconSizes.indexOf(48));
            menuAppListIconsizeCombobox.set_active(this._iconSizes.indexOf(32));
            menuAppGridIconsizeCombobox.set_active(this._iconSizes.indexOf(64));
        }
        log(this._menuLayouts[selected])
        this._settings.set_enum('menu-layout', this._menuLayouts[selected]);
    },
    
    // Combobox
    _changeMenuStartCategory: function(combobox) {
        log(this._menuCategories[combobox.get_active()])
        this._settings.set_enum('menu-category', this._menuCategories[combobox.get_active()]);
    },
    
    // Combobox
    _changeMenuDefaultViewMode: function(combobox) {
        log(this._viewModes[combobox.get_active()])
        this._settings.set_enum('menu-viewmode', this._viewModes[combobox.get_active()]);
    },
    
    // Combobox
    _changeMenuCatSelectMethod: function(combobox) {
        log(this._selectMethods[combobox.get_active()])
        this._settings.set_enum('menu-category-selectionmethod', this._selectMethods[combobox.get_active()]);
    },
    
    // Combobox
    _changeApplistIconsize: function(combobox) {
        this._settings.set_int('menu-applist-iconsize', this._iconSizes[combobox.get_active()]);
    },
    
    // Combobox
    _changeAppgridIconsize: function(combobox) {
        this._settings.set_int('menu-appgrid-iconsize', this._iconSizes[combobox.get_active()]);
    },
    
    // numberfield
    _changeSearchResultCount: function(spinButton) {
        log(spinButton.get_value())
        this._settings.set_int('menu-search-maxresultcount', spinButton.get_value());
    },
    
    
    // Third page:
    
    
    
    // ---
    
    /*
     * Connects the functions to the gui elements.
     */
    _connector: function(builder, object, signal, handler) {
        try {
            object.connect(signal, Lang.bind(this, this[handler]));
        } catch(e) {
            log("Function " + handler + " is not defined!");
        }
    },
});


function init() {
}


function buildPrefsWidget() {
    let builder = new Gtk.Builder();
    
    let gladePath = Me.path + Me.metadata['prefs-glade-file'];
    if (!builder.add_from_file(gladePath)) {
        log("Could not load the ui file: %s".format(gladePath));
    
        let label = new Gtk.Label({
            label: "Could not load the preferences UI file",
            vexpand: true
        });
    
        return label;
    }
    
    let notebook = builder.get_object('notebook');
    notebook.show_all();
    
    _setDefaults(builder);
    
    let signal_handlers = new SignalHandlers(builder);
    builder.connect_signals_full(Lang.bind(signal_handlers, signal_handlers._connector));

    return notebook;
}


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
    
    let iconSizes = [16, 22, 24, 32, 48, 64];
    let selectMethods = [20, 21];
    let viewModes = [30, 31];
    let menuLayouts = [40, 41, 42];
    let sidebarCategories = [52, 54];
    let menuCategories = [51, 50];
        
    let enableSidebarSwitch = builder.get_object('nb2_sidebarSettingsBox_grid_switch1');
    let sidebarCategoryCombobox = builder.get_object('nb2_sidebarSettingsBox_grid_combobox2');
    let sidebarIconsizeCombobox = builder.get_object('nb2_sidebarSettingsBox_grid_combobox3');
    enableSidebarSwitch.set_active(settings.get_boolean('enable-sidebar'));
    sidebarCategoryCombobox.set_active(sidebarCategories.indexOf(settings.get_enum('sidebar-category')) + '');
    sidebarIconsizeCombobox.set_active(iconSizes.indexOf(settings.get_int('sidebar-iconsize')) + '');
    
    let menuLayoutCombobox = builder.get_object('nb2_menuSettingsBox_grid_combobox1');
    let menuStartCategoryCombobox = builder.get_object('nb2_menuSettingsBox_grid_combobox2');
    let menuViewModeCombobox = builder.get_object('nb2_menuSettingsBox_grid_combobox3');
    let menuCatSelectMethodCombobox = builder.get_object('nb2_menuSettingsBox_grid_combobox4');
    let menuAppListIconsizeCombobox = builder.get_object('nb2_menuSettingsBox_grid_combobox5');
    let menuAppGridIconsizeCombobox = builder.get_object('nb2_menuSettingsBox_grid_combobox6');
    menuLayoutCombobox.set_active(menuLayouts.indexOf(settings.get_enum('menu-layout')) + '');
    menuStartCategoryCombobox.set_active(menuCategories.indexOf(settings.get_enum('menu-category')) + '');
    menuViewModeCombobox.set_active(viewModes.indexOf(settings.get_enum('menu-viewmode')) + '');
    menuCatSelectMethodCombobox.set_active(selectMethods.indexOf(settings.get_enum('menu-category-selectionmethod')) + '');
    menuAppListIconsizeCombobox.set_active(iconSizes.indexOf(settings.get_int('menu-applist-iconsize')) + '');
    menuAppGridIconsizeCombobox.set_active(iconSizes.indexOf(settings.get_int('menu-appgrid-iconsize')) + '');
    
    let menuSearchResultCountSpin = builder.get_object('nb2_searchSettingsBox_grid_spinbutton1');
    menuSearchResultCountSpin.set_value(settings.get_int('menu-search-maxresultcount'));
}