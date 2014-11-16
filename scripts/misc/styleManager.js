
const Lang = imports.lang;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Main = imports.ui.main;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const MenuModel = Me.imports.scripts.menu.menuModel;
const Log = Me.imports.scripts.misc.log;

const EMenuLayout = MenuModel.EMenuLayout;


const EStylesheetFilename = {
    
    LARGE:  'gnomenu-large.css',
    MEDIUM: 'gnomenu-medium.css',
    SMALL:  'gnomenu-small.css',
    
};


const StyleManager = new Lang.Class({

    Name: 'Gnomenu.StyleManager',

    _settings: null,
    _currentStylesheet: null,

    _themeContext: null,
    _theme: null,

    _init: function(settings) {
        this._settings = settings;
        this._currentStylesheet = null;
        
        this._themeContext = St.ThemeContext.get_for_stage(global.stage);
        this._theme = this._themeContext.get_theme();
        
        if (!this._themeContext || !this._theme) {
            Log.logError("Gnomenu.StyleManager", "_init", "Loading theme failed!");
        }
    },

    load: function() {
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

    unload: function() {
        if (this._currentStylesheet) {
            this._theme.unload_stylesheet(this._currentStylesheet);
            this._currentStylesheet = null;
        }
        return true;
    },

    refresh: function() {
        this.unload();
        this.load();
    },

    destroy: function() {
        this.unload();
    },
});