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
const Gio = imports.gi.Gio;
const St = imports.gi.St;

const Params = imports.misc.params;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;

/**
 * @description App or File enum.
 * @private
 * @enum {Integer}
 */
const LaunchableType = {

    App:  11,
    File: 22,

};



/**
 * @class Launchable
 *
 * @classdesc Provides a wrapper for app or file metas. This is a more convenient
 *            method to handle them and easier to launch the correct
 *            application.
 *
 * @description Description may be null but none of the others.
 *
 *
 * @param {App | String} appOrPath
 * @param {String} name
 * @param {Icon} icon
 * @param {String} description
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const Launchable = new Lang.Class({

    Name: 'GnoMenu.Launchable',


    _init: function(appOrPath, name, icon, description) {
        if (!appOrPath || !name || !icon) {
            Log.logError("GnoMenu.Launchable", "_init", "Illegal Launchable Argument!");
        }

        // Deduce what the argument exactly is.
        if (typeof appOrPath == 'string') {
            this._type = LaunchableType.File;
            if (appOrPath.startsWith('file:///')) {
                this._appOrFile = Gio.File.new_for_uri(appOrPath);
            } else {
                this._appOrFile = Gio.File.new_for_path(appOrPath);
            }
        } else {
            this._type = LaunchableType.App;
            this._appOrFile = appOrPath;
        }

        this._name = name;
        this._icon = icon;
        this._description = description;
    },

    /**
     * @description Returns the name of the launchable.
     * @returns {String}
     * @function
     * @memberOf Launchable#
     */
    getName: function() {
        return this._name;
    },

    /**
     * @description Returns the description of the launchable.
     * @returns {String}
     * @function
     * @memberOf Launchable#
     */
    getDescription: function() {
        return this._description;
    },

    /**
     * @description Returns the icon of the launchable.
     * @returns {Icon}
     * @function
     * @memberOf Launchable#
     */
    getIcon: function() {
        return this._icon;
    },

    /**
     * @description Returns the icon of the launchable as St.Icon.
     * @returns {St.Icon}
     * @function
     * @memberOf Launchable#
     */
    getStIcon: function(iconSize) {
        return new St.Icon({ gicon: this._icon, icon_size: iconSize });
    },

    /**
     * @description Returns the base-app of the launchable.
     * @returns {Shell.App}
     * @function
     * @memberOf Launchable#
     */
    getApp: function() {
        let ret = null;
        if (this._type == LaunchableType.App) {
            ret = this._appOrFile;
        }
        return ret;
    },

    /**
     * @description Returns the uri of the launchable.
     * @returns {String}
     * @function
     * @memberOf Launchable#
     */
    getUri: function() {
        let ret = null;
        if (this._type == LaunchableType.File) {
            ret = this._appOrFile.get_uri();
        }
        return ret;
    },

    /**
     * @description Launches the app.
     * @param {Boolean} openNew Open in a new window.
     * @param {Object} params
     * @function
     * @memberOf Launchable#
     */
    launch: function(openNew, params) {
        params = Params.parse(params, { workspace: -1, timestamp: 0 });

        let launchContext = global.create_app_launch_context();
        launchContext.set_timestamp(params.timestamp);

        // How to launch depends on the type.
        try {
            // Base was an app.
            if (this._type == LaunchableType.App) {
                if (openNew) {
                    this._appOrFile.open_new_window(params.workspace);
                } else {
                    this._appOrFile.activate_full(-1, params.timestamp);
                }

            // Base was a file.
            } else if (this._type == LaunchableType.File) {
                try {
                    Gio.AppInfo.launch_default_for_uri(this._appOrFile.get_uri(), launchContext);

                } catch (e if e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_MOUNTED)) {
                    this._appOrFile.mount_enclosing_volume(0, null, null, function(file, result) {
                        file.mount_enclosing_volume_finish(result);
                        Gio.AppInfo.launch_default_for_uri(file.get_uri(), launchContext);
                    });
                }
            }
        } catch(e) {
            Log.logError("GnoMenu.Launchable", "launch", e.message);
        }
    },
});



/**
 * @class SearchLaunchable
 *
 * @classdesc Provides a wrapper for searchresult metas.
 *
 * @description You need to provide every argument. The launch function is
 *              provided by argument to enable special results.
 *
 *
 * @param {App | String} appOrPath
 * @param {String} name
 * @param {Icon} icon
 * @param {String} description
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const SearchLaunchable = new Lang.Class({

    Name: 'GnoMenu.SearchLaunchable',
    Extends: Launchable,


    _init: function(name, description, getIconFunc, launchFunc) {
        if (!name || !getIconFunc || !launchFunc) {
            Log.logError("GnoMenu.ProviderSearchResult", "_init", "Argument is null!");
        }

        this._name = name;
        this._description = description;

        this._getIconFunc = getIconFunc;
        this._launchFunc = launchFunc;
    },

    /**
     * @description Returns the name of the launchable.
     * @returns {String}
     * @function
     * @memberOf SearchLaunchable#
     */
    getName: function() {
        return this._name;
    },

    /**
     * @description Returns the description of the launchable.
     * @returns {String}
     * @function
     * @memberOf SearchLaunchable#
     */
    getDescription: function() {
        return this._description;
    },

    /**
     * @description Returns the icon of the launchable.
     * @returns {Icon}
     * @function
     * @memberOf SearchLaunchable#
     */
    getIcon: function() {
        return this._getIconFunc();
    },

    /**
     * @description Returns the icon of the launchable as St.Icon.
     * @returns {St.Icon}
     * @function
     * @memberOf SearchLaunchable#
     */
    getStIcon: function(iconSize) {
        return null;
    },

    /**
     * @description Returns the app of the launchable.
     * @returns {Shell.App}
     * @function
     * @memberOf SearchLaunchable#
     */
    getApp: function() {
        return null;
    },

    /**
     * @description Returns the uri of the launchable.
     * @returns {String}
     * @function
     * @memberOf SearchLaunchable#
     */
    getUri: function() {
        return null;
    },

    /**
     * @description Launches the default program for the searchresult.
     * @param {Boolean} openNew Open in a new window.
     * @param {Object} params
     * @function
     * @memberOf SearchLaunchable#
     */
    launch: function(openNew, params) {
        return this._launchFunc(openNew, params);
    },
});