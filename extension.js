

// journalctl /usr/bin/gnome-session -f -o cat

const Main = imports.ui.main;
const IconTheme = imports.gi.Gtk.IconTheme;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Constants = Me.imports.scripts.constants;
const ActivitiesButton = Me.imports.scripts.panel.ActivitiesButton;
const PanelBox = Me.imports.scripts.panel.PanelBox;

const Convenience = Me.imports.scripts.misc.convenience;
const StyleManager = Me.imports.scripts.misc.styleManager.StyleManager;


const SETTINGS = Constants.SETTINGS;


function enable() {
	global.log("Gnomenu: Enabled!");
	
	let settings = Convenience.getSettings(SETTINGS);
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
