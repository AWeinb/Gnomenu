

// journalctl /usr/bin/gnome-session -f -o cat

const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const IconTheme = imports.gi.Gtk.IconTheme;

const Main = imports.ui.main;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const ActivitiesButton = Me.imports.scripts.panel.ActivitiesButton;
const PanelBox = Me.imports.scripts.panel.PanelBox;
const Convenience = Me.imports.scripts.misc.convenience;

/* This can be removed if it is sure that this variables exist. */
if (Clutter.EVENT_PROPAGATE == undefined) Clutter.EVENT_PROPAGATE = false;
if (Clutter.EVENT_STOP == undefined) Clutter.EVENT_STOP = true;


function enable() {
	global.log("Gnomenu: Enabled!");
	
	let settings = Convenience.getSettings();
	if (!settings) {
		return;
	}
	
	this.panelBox = new PanelBox(settings);
	Main.panel._leftBox.insert_child_at_index(this.panelBox.actor, 0);
	
	this.actBtn = new ActivitiesButton();
	this.actBtn.hide();
	this.actBtn.setCornerActive(!settings.get_boolean('disable-activities-hotcorner'));
	
	settings.connect('changed::disable-activities-hotcorner', Lang.bind(this, function() {
		this.actBtn.setCornerActive(!settings.get_boolean('disable-activities-hotcorner'));
	}));
}


function disable() {
	global.log("Gnomenu: Disabled!");
	
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
