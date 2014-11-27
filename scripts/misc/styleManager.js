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
const GLib = imports.gi.GLib;
const Main = imports.ui.main;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const MenuModel = Me.imports.scripts.menu.menuModel;
const Log = Me.imports.scripts.misc.log;

const EMenuLayout = MenuModel.EMenuLayout;

/**
 * @private
 * @enum {String}
 */
const EStylesheetFilename = {
    
    LARGE:  'gnomenu-large.css',
    MEDIUM: 'gnomenu-medium.css',
    SMALL:  'gnomenu-small.css',
    
};


/**
 * @class StyleManager
 *
 * @classdesc This class handles the loading and unloading of the stylesheet.
 *
 * @description You must provide a valid gsettings instance.
 * 
 *
 * @param {Settings} settings A gsettings instance.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const StyleManager = new Lang.Class({

    Name: 'Gnomenu.StyleManager',


    _init: function(settings) {
        this._settings = settings;
        this._currentStylesheet = null;
        
        this._themeContext = St.ThemeContext.get_for_stage(global.stage);
        this._theme = this._themeContext.get_theme();
        
        if (!this._themeContext || !this._theme) {
            Log.logError("Gnomenu.StyleManager", "_init", "Loading theme failed!");
        }
    },

    /**
     * @description Loads the stylesheet of the current layout.
     * @function
     * @memberOf StyleManager#
     */
    load: function() {
        if (this._currentStylesheet) {
            this.unload();
        }
        
        let stylesheetName = null;
        switch (this._settings.get_enum('menu-layout')) {

            case EMenuLayout.LARGE:
                stylesheetName = EStylesheetFilename.LARGE;
                break;

            case EMenuLayout.MEDIUM:
                stylesheetName = EStylesheetFilename.MEDIUM;
                break;

            case EMenuLayout.SMALL:
                stylesheetName = EStylesheetFilename.SMALL;
                break;

            default:
                stylesheetName = EStylesheetFilename.MEDIUM;
                break;
        }

        let themeStylesheet = null;
        if (Main._cssStylesheet != null) {
            themeStylesheet = Main._cssStylesheet;
        } else {
            themeStylesheet = Main._defaultCssStylesheet;
        }

        let themeDirectory = GLib.path_get_dirname(themeStylesheet);
        let stylesheetFile = themeDirectory + '/extensions/Test/' + stylesheetName;
        if (!GLib.file_test(stylesheetFile, GLib.FileTest.EXISTS)) {

            let stylePath = Me.path + Me.metadata['stylesheets-path'] + stylesheetName;
            let stylesheetTmpFile = Gio.File.new_for_path(stylePath);
            if (stylesheetTmpFile.query_exists(null)) {
                stylesheetFile = stylesheetTmpFile.get_path();

            } else {
                Log.logError("Gnomenu.StyleManager", "load", "No stylesheet found!");
            }
        }

        let result = this._theme.load_stylesheet(stylesheetFile);
        if (result) {
            this._currentStylesheet = stylesheetFile;
        }
        
        return result;
    },

    /**
     * @description Unloads the current stylesheet.
     * @function
     * @memberOf StyleManager#
     */
    unload: function() {
        if (this._currentStylesheet) {
            this._theme.unload_stylesheet(this._currentStylesheet);
            this._currentStylesheet = null;
        }
        return true;
    },
    
    /**
     * @description Unloads and loads the stylesheet.
     * @function
     * @memberOf StyleManager#
     */
    refresh: function() {
        // Get menu layout
        let stylesheetName = null;
        switch (this._settings.get_enum('menu-layout')) {

            case EMenuLayout.LARGE:
                stylesheetName = EStylesheetFilename.LARGE;
                break;

            case EMenuLayout.MEDIUM:
                stylesheetName = EStylesheetFilename.MEDIUM;
                break;

            case EMenuLayout.SMALL:
                stylesheetName = EStylesheetFilename.SMALL;
                break;

            default:
                stylesheetName = EStylesheetFilename.MEDIUM;
                break;
        }

        // Get new theme stylesheet
        let themeStylesheet = Main._defaultCssStylesheet;
        if (Main._cssStylesheet != null) {
            themeStylesheet = Main._cssStylesheet;
        }

        let themeDirectory = GLib.path_get_dirname(themeStylesheet);
        let stylesheetFile = themeDirectory + '/extensions/' + Me.metadata['uuid'] + '/' + stylesheetName;
        if (!GLib.file_test(stylesheetFile, GLib.FileTest.EXISTS)) {

            let stylePath = Me.path + Me.metadata['stylesheets-path'] + stylesheetName;
            let stylesheetTmpFile = Gio.File.new_for_path(stylePath);
            if (stylesheetTmpFile.query_exists(null)) {
                stylesheetFile = stylesheetTmpFile.get_path();

            } else {
                Log.logError("Gnomenu.StyleManager", "load", "No stylesheet found!");
            }
        }

        if (this._currentStylesheet && this._currentStylesheet == stylesheetFile) {
            return false;
        }

        // Change gnomenu stylesheet by updating theme
        let themeContext = St.ThemeContext.get_for_stage(global.stage);
        if (!themeContext)
            return false;

        let theme = themeContext.get_theme();
        if (!theme)
            return false;

        let customStylesheets = theme.get_custom_stylesheets();
        if (!customStylesheets)
            return false;

        let previousStylesheet = this._currentStylesheet;
        this._currentStylesheet = stylesheetFile;

        let newTheme = new St.Theme ({ application_stylesheet: themeStylesheet });
        for (let i = 0; i < customStylesheets.length; i++) {
            if (customStylesheets[i] != previousStylesheet) {
                newTheme.load_stylesheet(customStylesheets[i]);
            }
        }

        newTheme.load_stylesheet(this._currentStylesheet);
        themeContext.set_theme (newTheme);

        return true;
    },

    /**
     * @description Destroys the instance.
     * @function
     * @memberOf StyleManager#
     */
    destroy: function() {
        this.unload();
    },
});