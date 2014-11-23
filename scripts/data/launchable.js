
const Lang = imports.lang;
const Gio = imports.gi.Gio;
const St = imports.gi.St;

const Params = imports.misc.params;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;


const LaunchableType = {
    
    App:  11,
    File: 22,
    
};


const Launchable = new Lang.Class({

    Name: 'GnoMenu.Launchable',


    _init: function(appOrPath, name, icon, description) {
        if (!appOrPath || !name || !icon) {
            Log.logError("GnoMenu.Launchable", "_init", "Illegal Launchable Argument!");
        }

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

    getName: function() {
        return this._name;
    },

    getDescription: function() {
        return this._description;
    },

    getIcon: function() {
        return this._icon;
    },

    getStIcon: function(iconSize) {
        return new St.Icon({ gicon: this._icon, icon_size: iconSize });
    },

    getApp: function() {
        let ret = null;
        if (this._type == LaunchableType.App) {
            ret = this._appOrFile;
        }
        return ret;
    },

    getUri: function() {
        let ret = null;
        if (this._type == LaunchableType.File) {
            ret = this._appOrFile.get_uri();
        }
        return ret;
    },

    launch: function(openNew, params) {
        params = Params.parse(params, { workspace: -1, timestamp: 0 });
        
        let launchContext = global.create_app_launch_context();
        launchContext.set_timestamp(params.timestamp);

        try {
            if (this._type == LaunchableType.App) {
                if (openNew) {
                    this._appOrFile.open_new_window(params.workspace);
                } else {
                    this._appOrFile.activate_full(-1, params.timestamp);
                }

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
    
    getName: function() {
        return this._name;
    },
    
    getDescription: function() {
        return this._description;
    },

    getIcon: function() {
        return this._getIconFunc();
    },

    getStIcon: function(iconSize) {
        return null;
    },
    
    getApp: function() {
        return null;
    },
    
    getUri: function() {
        return null;
    },
    
    launch: function(openNew, params) {
        return this._launchFunc(openNew, params);
    },
});