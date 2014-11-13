

// journalctl /usr/bin/gnome-session -f -o cat

const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;
const IconTheme = imports.gi.Gtk.IconTheme;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Constants = Me.imports.scripts.constants;
const ActivitiesButton = Me.imports.scripts.panel.ActivitiesButton;
const PanelBox = Me.imports.scripts.panel.PanelBox;
const Convenience = Me.imports.scripts.misc.convenience;
const StyleManager = Me.imports.scripts.misc.styleManager.StyleManager;

/* This can be removed if it is sure that this variables exist. */
if (Clutter.EVENT_PROPAGATE == undefined) Clutter.EVENT_PROPAGATE = false;
if (Clutter.EVENT_STOP == undefined) Clutter.EVENT_STOP = true;


function enable() {
	global.log("Gnomenu: Enabled!");
	/*let settings = Convenience.getSettings();
	log(settings.get_boolean('disable-activities-hotcorner'));
	log(settings.get_boolean('disable-menu-hotspot'));
	log(settings.get_boolean('enable-menu-shortcut'));
	log(settings.get_strv('menu-shortcut-key'));
	
	log(settings.get_boolean('enable-menu-button'));
	log(settings.get_strv('menu-button-text'));
	log(settings.get_boolean('enable-menu-button-icon'));
	log(settings.get_strv('menu-button-icon'));
	
	log(settings.get_boolean('enable-apps-button'));
	log(settings.get_strv('apps-button-text'));
	log(settings.get_boolean('enable-apps-button-icon'));
	log(settings.get_strv('apps-button-icon'));
	
	log(settings.get_boolean('enable-workspace-button'));
	log(settings.get_strv('workspace-button-text'));
	log(settings.get_boolean('enable-workspace-button-icon'));
	log(settings.get_strv('workspace-button-icon'));
	
	log(settings.get_boolean('enable-sidebar'));
	log(settings.get_enum('sidebar-category'));
	log(settings.get_int('sidebar-iconsize'));
	
	log(settings.get_enum('menu-layout'));
	log(settings.get_enum('menu-category'));
	log(settings.get_enum('menu-viewmode'));
	log(settings.get_enum('menu-category-selectionmethod'));
	log(settings.get_int('menu-applist-iconsize'));
	log(settings.get_int('menu-appgrid-iconsize'));
	
    log(settings.get_int('menu-search-maxresultcount'))*/
	
	
	let settings = Convenience.getSettings();
	if (!settings) {
		return;
	}
	
	this.styleManager = new StyleManager(settings);
	
	if (!this.styleManager.load()) {
		return;
	}
	
	this.panelBox = new PanelBox(settings);
	Main.panel._leftBox.insert_child_at_index(this.panelBox.actor, 0);
	
	this.actBtn = new ActivitiesButton();
	this.actBtn.hide();
	this.actBtn.setCornerActive(false);
}

function disable() {
	global.log("Gnomenu: Disabled!");
	
	this.styleManager.unload();
	
	this.actBtn.show();
	this.actBtn.setCornerActive(true);
	
	this.panelBox.destroy();
}

function init() {
    Convenience.initTranslations();

    // Add extension icons to icon theme directory path
    // TODO: move this to enable/disable?
    // GS patch https://bugzilla.gnome.org/show_bug.cgi?id=675561
    let theme = IconTheme.get_default();
    theme.append_search_path(Me.path + "/icons");
}
