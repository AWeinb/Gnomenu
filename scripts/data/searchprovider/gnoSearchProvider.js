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

/**
 * @description Dialog title.
 * @private
 */
const GNO_NAME = 'Gno the Gnominator';
/**
 * @description Command that is executed when the dialog is run.
 * @private
 */
const GNO_COMMAND = 'fortune';
/**
 * @description Terms that show the fortune button.
 */
const MAGIC_GNO_KEY = 'free the gno';


/**
 * @class FortuneDialog
 *
 * @classdesc Copy of the wanda fortune dialog of the Gnome Shell.
 *
 * @description .
 * 
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
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

    /**
     * @description Destroys the dialog.
     * @function
     * @memberOf FortuneDialog#
     */
    destroy: function() {
        this._bin.destroy();
    }
});



/**
 * @class GnoSearchProvider
 * @extends AbstractSearchProvider
 *
 * @classdesc Copy of the wanda fortune search provider.
 *
 * @description .
 * 
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const GnoSearchProvider = new Lang.Class({
    
    Name: 'GnoMenu.GnoSearchProvider',
    Extends: AbstractSearchProvider,

    
    _init: function() {
        this.id = 'provider_gno';
        
        this.reset();
    },
    
    /**
     * @description Resets the provider.
     * @function
     * @memberOf GnoSearchProvider#
     */
    reset: function() {
        this._results = null;
    },
    
    /**
     * @description Returns a list of results optinally filtered.
     * @param {Object} filterParams
     * @returns {List}
     * @function
     * @memberOf GnoSearchProvider#
     */
    getResults: function(filterParams) {
        return this._results;
    },

    /**
     * @description Returns the refined searchresults created from the raw results.
     * @param {List} apps
     * @returns {SearchLaunchableList}
     * @function
     * @memberOf GnoSearchProvider#
     */
    getResultMetas: function(gno) {
        if (gno && gno.length > 0) {
            let name = gno[0];
            let description = "";
            let getIconFunc = function() {
                // I thought a monkey would be somewhat funny.
                return Gio.icon_new_for_string('face-monkey-symbolic');
            }
            // Creates on launch the dialog.
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

    /**
     * @description Receives the startset of results for a search run. Calls
     *              the updateCallback afterwards.
     * @function
     * @memberOf GnoSearchProvider#
     */
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

    /**
     * @description Refines the current search run. Calls the updateCallback
     *              afterwards.
     * @function
     * @memberOf GnoSearchProvider#
     */
    getSubsearchResultSet: function(terms) {
        this.getInitialResultSet(terms);
        
        if (this._updateCallback) {
            this._updateCallback();
        }
    },
});
