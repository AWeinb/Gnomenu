
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const St = imports.gi.St;

const Layout = imports.ui.layout;
const Main = imports.ui.main;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;
const AbstractSearchProvider = Me.imports.scripts.data.searchprovider.abstractSearchProvider.AbstractSearchProvider;
const SearchLaunchable = Me.imports.scripts.data.launchable.SearchLaunchable;


const GNO_NAME = 'Gno the Gnominator';
const GNO_COMMAND = 'fortune';
const MAGIC_GNO_KEY = 'free the gno';


const FortuneDialog = new Lang.Class({
    
    Name: 'GnoMenu.FortuneDialog',

    
    _init: function(name, command) {
        let text;
        try {
            let [res, stdout, stderr, status] = GLib.spawn_command_line_sync(command);
            text = String.fromCharCode.apply(null, stdout);
        } catch(e) {
            text = _("Sorry, no wisdom for you today:\n%s").format(e.message);
        }

        this._title = new St.Label({ style_class: 'prompt-dialog-headline', text: _("%s the Oracle says").format(name) });
        this._label = new St.Label({ style_class: 'prompt-dialog-description', text: text });
        this._label.clutter_text.line_wrap = true;

        this._box = new St.BoxLayout({ vertical: true, style_class: 'prompt-dialog'}); // this is just to force a reasonable width
        this._box.add(this._title, { align: St.Align.MIDDLE });
        this._box.add(this._label, { expand: true });

        this._button = new St.Button({ button_mask: St.ButtonMask.ONE, style_class: 'modal-dialog', reactive: true });
        this._button.connect('clicked', Lang.bind(this, this.destroy));
        this._button.child = this._box;

        this._bin = new St.Bin({ x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
        this._bin.add_constraint(new Layout.MonitorConstraint({ primary: true }));
        this._bin.add_actor(this._button);

        Main.layoutManager.addChrome(this._bin);

        GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 10, Lang.bind(this, this.destroy));
    },

    destroy: function() {
        this._bin.destroy();
    }
});



const GnoSearchProvider = new Lang.Class({
    
    Name: 'GnoMenu.GnoSearchProvider',
    Extends: AbstractSearchProvider,

    
    _init: function() {
        this.id = 'provider_gno';
        
        this.reset();
    },
    
    reset: function() {
        this._results = null;
    },
    
    getResults: function(filterParams) {
        return this._results;
    },

    getResultMetas: function(gno) {
        if (gno && gno.length > 0) {
            let name = gno[0];
            let description = "";
            let getIconFunc = function() {
                return Gio.icon_new_for_string('face-monkey-symbolic');
            }
            let launchFunc = Lang.bind(this, function(openNew, params) {
                if (this._dialog)
                    this._dialog.destroy();
                let str = gno[0].toUpperCase() + gno[0].substring(1, gno.length)
                this._dialog = new FortuneDialog(str, GNO_COMMAND);
            });
            
            let res = new SearchLaunchable(name, description, getIconFunc, launchFunc);
            return [res];
        }
        return [];
    },

    filterResults: function(results) {
        return results;
    },

    getInitialResultSet: function(terms) {
        if (terms && terms.join(' ') == MAGIC_GNO_KEY) {
            this._results = [ GNO_NAME ];
        } else {
            this._results = [];
        }
        
        if (this._updateCallback) {
            this._updateCallback();
        }
    },

    getSubsearchResultSet: function(terms) {
        this.getInitialResultSet(terms);
        
        if (this._updateCallback) {
            this._updateCallback();
        }
    },
});
