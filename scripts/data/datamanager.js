
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Signals = imports.signals;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GMenu = imports.gi.GMenu;
const Gtk = imports.gi.Gtk;
const Shell = imports.gi.Shell;
const St = imports.gi.St;

const Main = imports.ui.main;
const Params = imports.misc.params;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;


const LaunchableType = { App: 11, File: 22 };

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

    getIcon: function() {
        return this._icon;
    },

    getStIcon: function(iconSize) {
        return new St.Icon({ gicon: this._icon, icon_size: iconSize });
    },

    getDescription: function() {
        return this._description;
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



const AppsManager = new Lang.Class({

    Name: 'GnoMenu.AppsManager',


    _init: function(cbApps, cbMostUsed, cbFavorites) {
        this._cbApps = cbApps;
        this._cbMostUsed = cbMostUsed;
        this._cbFavorites = cbFavorites;
        
        this._appCategoryMap = {};
        this._categoryIdNameMap = {};
        this._mostUsedApps = [];
        this._favoriteApps = [];
        
        this._appSystem = Shell.AppSystem.get_default();
        this._appUsage = Shell.AppUsage.get_default();
        this._appTimeoutId = 0;
        this._favTimeoutId = 0;
        
        // --

        this._appSignalId = this._appSystem.connect('installed-changed', Lang.bind(this, Lang.bind(this, function () {
            if (this._appTimeoutId > 0)
                return;
            /* Defensive event compression */
            this._appTimeoutId = Mainloop.timeout_add(100, Lang.bind(this, function () {
                this._appTimeoutId = 0;
                this._updateAppMap();
                return false;
            }));
        })));
        this._updateAppMap();

        const MOSTUSED_REFRESH_TICK = 60000;
        this._usageTimeoutId = Mainloop.timeout_add(MOSTUSED_REFRESH_TICK, Lang.bind(this, function () {
            this._updateMostUsedApps();
            return true;
        }));
        this._updateMostUsedApps();

        this._favSignalId = global.settings.connect('changed::favorite-apps', Lang.bind(this, Lang.bind(this, function () {
            if (this._favTimeoutId > 0)
                return;
            /* Defensive event compression */
            this._favTimeoutId = Mainloop.timeout_add(100, Lang.bind(this, function () {
                this._favTimeoutId = 0;
                this._updateFavoriteApps();
                return false;
            }));
        })));
        this._updateFavoriteApps();
    },

    ////////////////////////////////////////////////////////////////////////////


    getApplicationsMap: function() {
        return this._appCategoryMap;
    },

    getCategoryMap: function() {
        return this._categoryIdNameMap;
    },

    getAllApplications: function() {
        let map = this.getApplicationsMap();

        let applist = [];
        for each (let directory in map) {
            applist = applist.concat(directory);
        }

        applist.sort(function(a, b) {
            return a.getName().toLowerCase() > b.getName().toLowerCase();
        });

        return applist;
    },

    getMostUsedApps: function() {
        return this._mostUsedApps;
    },

    getFavoriteApps: function() {
        return this._favoriteApps;
    },

    destroy: function() {
        if (this._appTimeoutId)
            Mainloop.source_remove(this._appTimeoutId);
        if (this._usageTimeoutId)
            Mainloop.source_remove(this._usageTimeoutId);
        if (this._favTimeoutId)
            Mainloop.source_remove(this._favTimeoutId);

        if (this._appSignalId)
            this._appSystem.disconnect(this._appSignalId);
        if (this._favSignalId)
            global.settings.disconnect(this._favSignalId);
    },

    ////////////////////////////////////////////////////////////////////////////


    _updateAppMap: function() {
        this._appCategoryMap = {};

        let tree = this._appSystem.get_tree();
        let iter = tree.get_root_directory().iter();
        let nextType = null;
        while ((nextType = iter.next()) != GMenu.TreeItemType.INVALID) {

            if (nextType == GMenu.TreeItemType.DIRECTORY) {
                let dir = iter.get_directory();

                let iterDir = dir.iter();
                let nextType = null;
                while ((nextType = iterDir.next()) != GMenu.TreeItemType.INVALID) {

                    if (nextType == GMenu.TreeItemType.ENTRY) {
                        let entry = iterDir.get_entry();
                        if (!entry.get_app_info().get_nodisplay()) {
                            if (!this._appCategoryMap[dir.get_menu_id()]) {
                                this._appCategoryMap[dir.get_menu_id()] = [];
                                this._categoryIdNameMap[dir.get_menu_id()] = dir.get_name();
                            }

                            let app = this._appSystem.lookup_app_by_tree_entry(entry);
                            let appName = app.get_name();
                            let appIcon = app.get_app_info().get_icon(); // Gio.ThemedIcon
                            let appDescription = app.get_description();

                            let launchable = new Launchable(app, appName, appIcon, appDescription);
                            this._appCategoryMap[dir.get_menu_id()].push(launchable);
                        }
                    }
                }
            }
        }
        
        if (this._cbApps) this._cbApps();
    },


    _updateMostUsedApps: function() {
        this._mostUsedApps = [];

        let appName = null;
        let appIcon = null;
        let appDescription = null;

        let mostUsed = this._appUsage.get_most_used('');
        for each (let app in mostUsed) {
            if (app.get_app_info().should_show()) {

                let appName = app.get_name();
                let appIcon = app.get_app_info().get_icon(); // Gio.ThemedIcon
                let appDescription = app.get_description();

                this._mostUsedApps.push(new Launchable(app, appName, appIcon, appDescription));
            }
        }
        
        if (this._cbMostUsed) this._cbMostUsed();
    },


    _updateFavoriteApps: function() {
        this._favoriteApps = [];

        let appName = null;
        let appIcon = null;
        let appDescription = null;

        let favorites = global.settings.get_strv('favorite-apps');
        for each (let fav in favorites) {
            let app = this._appSystem.lookup_app(fav);
            if (app) {
                let appName = app.get_name();
                let appIcon = app.get_app_info().get_icon(); // Gio.ThemedIcon
                let appDescription = app.get_description();

                this._favoriteApps.push(new Launchable(app, appName, appIcon, appDescription));
            }
        }
        
        if (this._cbFavorites) this._cbFavorites();
    },
});



const RecentFilesManager = new Lang.Class({

    Name: 'GnoMenu.RecentFilesManager',

    _cbRecentFiles: null,
    _files: null,

    _recentManager: null,
    _recentTimeoutId: null,
    _recentSignalId: null,


    _init: function(cbRecentFiles) {
        this._cbRecentFiles = cbRecentFiles;
        this._files = [];
        this._recentManager = Gtk.RecentManager.get_default();

        this._recentTimeoutId = 0;
        this._recentSignalId = this._recentManager.connect('changed', Lang.bind(this, Lang.bind(this, function () {
            if (this._recentTimeoutId > 0)
                return;
            /* Defensive event compression */
            this._recentTimeoutId = Mainloop.timeout_add(100, Lang.bind(this, function () {
                this._recentTimeoutId = 0;
                this._updateRecentFiles();
                return false;
            }));
        })));
        this._updateRecentFiles();
    },

    ////////////////////////////////////////////////////////////////////////////


    getRecentFiles: function() {
        return this._files;
    },

    destroy: function() {
        if (this._recentTimeoutId)
            Mainloop.source_remove(this._recentTimeoutId);
        if (this._recentSignalId)
            this._recentManager.disconnect(this._recentSignalId);
    },

    ////////////////////////////////////////////////////////////////////////////


    _updateRecentFiles: function() {
        let files = [];

        let recentPath = null;
        let recentName = null;
        let recentIcon = null;
        let recentDescription = null;

        let recentFiles = this._recentManager.get_items();
        for each (let recentInfo in  recentFiles) {
            if (recentInfo.exists()) {
                recentPath = recentInfo.get_uri();
                recentName = recentInfo.get_display_name();
                recentIcon = recentInfo.get_gicon(); // Gio.ThemedIcon
                recentDescription = recentInfo.get_description();

                files.push(new Launchable(recentPath, recentName, recentIcon, recentDescription));
            }
        }
        this._files = files;

        if (this._cbRecentFiles) this._cbRecentFiles();
    },
});



const PlacesManager = new Lang.Class({

    Name: 'GnoMenu.PlacesManager',

    _useSymbolicIcons: null,
    _cbDevices: null,
    _cbNetDevices: null,
    _cbBookmarks: null,
    
    _places: null,

    _volumeMonitor: null,
    _volumeMonitorSignals: null,

    _bookmarksFile: null,
    _bookmarkTimeoutId: null,
    _bookmarkMonitor: null,
    _bookmarkMonitorId: null,

    /*
     * What
     */
    _init: function(useSymbolic, cbDevices, cbNetDevices, cbBookmarks) {
        /*
         * How
         */

        // Why
        this._useSymbolicIcons = useSymbolic;
        this._cbDevices = cbDevices;
        this._cbNetDevices = cbNetDevices;
        this._cbBookmarks = cbBookmarks;
        
        this._places = {
            special: [],
            devices: [],
            bookmarks: [],
            network: [],
        };

        let homePath = GLib.get_home_dir();
        let homeName = _("Home");
        let homeIcon = this._getStandardIcon(homePath);
        let homeDescription = null;
        this._places.special.push(new Launchable(homePath, homeName, homeIcon, homeDescription));

        let DEFAULT_DIRECTORIES = [
            GLib.UserDirectory.DIRECTORY_DOCUMENTS,
            GLib.UserDirectory.DIRECTORY_DOWNLOAD,
            GLib.UserDirectory.DIRECTORY_MUSIC,
            GLib.UserDirectory.DIRECTORY_PICTURES,
            GLib.UserDirectory.DIRECTORY_VIDEOS
        ];

        let specialPath = null;
        let specialName = null;
        let specialIcon = null;
        let specialDescription = null;
        for each (let dir in DEFAULT_DIRECTORIES) {
            specialPath = GLib.get_user_special_dir(dir);
            if (specialPath) {
                if (specialPath == GLib.get_home_dir())
                    continue;
                specialName = this._getName(specialPath);
                specialIcon = this._getStandardIcon(specialPath);
                specialDescription = null;
                this._places.special.push(new Launchable(specialPath, specialName, specialIcon, specialDescription));
            }
        }

        /*
         * Show devices, code more or less ported from nautilus-places-sidebar.c
         */
        this._volumeMonitor = Gio.VolumeMonitor.get();
        this._connectVolumeMonitorSignals();
        this._updateMounts();

        this._bookmarkMonitorId = 0;
        this._bookmarkTimeoutId = 0;
        this._bookmarksFile = this._findBookmarksFile();
        if (this._bookmarksFile) {
            this._bookmarkMonitor = this._bookmarksFile.monitor_file(Gio.FileMonitorFlags.NONE, null);
            this._bookmarkMonitorId = this._bookmarkMonitor.connect('changed', Lang.bind(this, function () {
                if (this._bookmarkTimeoutId > 0)
                    return;
                /* Defensive event compression */
                this._bookmarkTimeoutId = Mainloop.timeout_add(100, Lang.bind(this, function () {
                    this._bookmarkTimeoutId = 0;
                    this._updateBookmarks();
                    return false;
                }));
            }));
            this._updateBookmarks();
        }
    },


    _connectVolumeMonitorSignals: function() {
        const signals = ['volume-added', 'volume-removed', 'volume-changed',
                         'mount-added', 'mount-removed', 'mount-changed',
                         'drive-connected', 'drive-disconnected', 'drive-changed'];

        this._volumeMonitorSignals = [];
        let func = Lang.bind(this, this._updateMounts);
        for each (let signal in signals) {
            let id = this._volumeMonitor.connect(signal, func);
            this._volumeMonitorSignals.push(id);
        }
    },


    _findBookmarksFile: function() {
        let paths = [
            GLib.build_filenamev([GLib.get_user_config_dir(), 'gtk-3.0', 'bookmarks']),
            GLib.build_filenamev([GLib.get_home_dir(), '.gtk-bookmarks']),
        ];

        for each (let path in paths) {
            if (GLib.file_test(path, GLib.FileTest.EXISTS)) {
                return Gio.File.new_for_path(path);
            }
        }
        return null;
    },

    ////////////////////////////////////////////////////////////////////////////


    getDefaultPlaces: function() {
        return this._places['special'];
    },

    getBookmarks: function() {
        return this._places['bookmarks'];
    },

    getDevices: function() {
        return this._places['devices'];
    },
    
    getNetworkDevices: function() {
        return this._places['network'];
    },

    destroy: function() {
        for each (let signalID in this._volumeMonitorSignals)
            this._volumeMonitor.disconnect(signalID);

        if (this._bookmarkMonitor)
            this._bookmarkMonitor.cancel();
        if (this._bookmarkTimeoutId)
            Mainloop.source_remove(this._bookmarkTimeoutId);
        if (this._bookmarkMonitorId) {
            this._bookmarkMonitor.disconnect(this._bookmarkMonitorId);
        }
    },

    ////////////////////////////////////////////////////////////////////////////


    _updateMounts: function() {
        this._places.devices = [];
        this._places.network = [];

        let symbolic = '';
        if (this._useSymbolicIcons) {
            symbolic = '-symbolic';
        }

        /* Add standard places */
        // Computer
        let mountPath = '/';
        let mountName = _("Computer");
        let mountIcon = this._getCustomIcon('devices');
        let mountDescription = null;
        this._places.devices.push(new Launchable(mountPath, mountName, mountIcon, mountDescription));

        // Network
        mountPath = 'network:///';
        mountName = _("Browse network");
        mountIcon = this._getCustomIcon('network');
        mountDescription = null;
        this._places.network.push(new Launchable(mountPath, mountName, mountIcon, mountDescription));

        /* go through all connected drives */
        let drives = this._volumeMonitor.get_connected_drives();
        for each (let drive in drives) {
            let volumes = drive.get_volumes();

            for each (let volume in volumes) {
                let mount = volume.get_mount();
                let kind = 'devices';
                let identifier = volume.get_identifier('class');
                if (identifier && identifier.indexOf('network') >= 0)
                    kind = 'network';

                if (mount != null) {
                    mountPath = mount.get_root();
                    mountName = mount.get_name();
                    mountIcon = this._getMountIcon(mount);
                    mountDescription = null;
                    this._places[kind].push(new Launchable(mountPath, mountName, mountIcon, mountDescription));
                }
            }
        }

        /* add all volumes that is not associated with a drive */
        let volumes = this._volumeMonitor.get_volumes();
        for each (let volume in volumes) {
            if (volume.get_drive() != null)
                continue;

            let kind = 'devices';
            let identifier = volumes[i].get_identifier('class');
            if (identifier && identifier.indexOf('network') >= 0)
                kind = 'network';

            let mount = volumes[i].get_mount();
            if (mount != null) {
                mountPath = mount.get_root();
                mountName = mount.get_name();
                mountIcon = this._getMountIcon(mount);
                mountDescription = null;
                this._places[kind].push(new Launchable(mountPath, mountName, mountIcon, mountDescription));
            }
        }

        /* add mounts that have no volume (/etc/mtab mounts, ftp, sftp,...) */
        let mounts = this._volumeMonitor.get_mounts();
        for each (let mount in mounts) {
            if (mount.is_shadowed())
                continue;

            if (mount.get_volume())
                continue;

            let root = mount.get_default_location();
            let kind;
            if (root.is_native())
                kind = 'devices';
            else
                kind = 'network';

            mountPath = mount.get_root();
            mountName = mount.get_name();
            mountIcon = this._getMountIcon(mount);
            mountDescription = null;
            this._places[kind].push(new Launchable(mountPath, mountName, mountIcon, mountDescription));
        }
        
        if (this._cbDevices) this._cbDevices();
        if (this._cbNetDevices) this._cbNetDevices();
    },


    _updateBookmarks: function() {
        this._bookmarks = [];

        let content = Shell.get_file_contents_utf8_sync(this._bookmarksFile.get_path());
        let lines = content.split('\n');

        let bookmarks = [];
        for each (let line in lines) {
            let components = line.split(' ');
            let bookmarkPath = components[0];

            if (!bookmarkPath)
                continue;

            let file = Gio.File.new_for_uri(bookmarkPath);
            if (file.is_native() && !file.query_exists(null))
                continue;

            let bookmarkName = null;
            if (components.length > 1) {
                bookmarkName = components.slice(1).join(' ');
            } else {
                let tmp = bookmarkPath.split('/');
                if (tmp.length > 0) {
                    bookmarkName = tmp[tmp.length - 1];
                }
            }

            let bookmarkIcon = this._getCustomIcon('bookmarks', file);
            let bookmarkDescription = null;
            bookmarks.push(new Launchable(bookmarkPath, bookmarkName, bookmarkIcon, bookmarkDescription));
        }
        this._places.bookmarks = bookmarks;
        
        if (this._cbBookmarks) this._cbBookmarks();
    },


    _getName: function(path) {
        let file = Gio.File.new_for_path(path);
        try {
            let info = file.query_info('standard::display-name', 0, null);
            return info.get_display_name();
        } catch(e if e instanceof Gio.IOErrorEnum) {
            return file.get_basename();
        }
    },


    _getStandardIcon: function(path) {
        let file = Gio.File.new_for_path(path);
        let info;

        if (this._useSymbolicIcons) {
            info = file.query_info('standard::symbolic-icon', 0, null); // Gio.ThemedIcon
            return info.get_symbolic_icon();
        } else {
            info = file.query_info("standard::icon", 0, null); // Gio.ThemedIcon
            return info.get_icon();
        }
    },


    _getCustomIcon: function(ID, file) {
        let iconName = null;

        switch (ID) {
            case 'network':
                iconName = 'folder-remote-symbolic';
                break;

            case 'devices':
                iconName = 'drive-harddisk-symbolic';
                break;

            case 'special':
                // == default

            case 'bookmarks':
                // == default

            default:
                if (!file || file && file.is_native()) {
                    iconName = 'folder-symbolic';
                } else {
                    iconName = 'folder-remote-symbolic';
                }
                break;
        }

        return new Gio.ThemedIcon({ name: iconName }); // Gio.ThemedIcon (Daahh)
    },


    _getMountIcon: function(mount) {
        if (this._useSymbolicIcons) {
            return mount.get_symbolic_icon(); // Gio.ThemedIcon
        } else {
            return mount.get_icon(); // Gio.ThemedIcon
        }
    },
});


const Datamanager = new Lang.Class({

    Name: 'GnoMenu.Datamanager',
    
    _appsManager: null,
    _recentFilesManager: null,
    _placesManager: null,
    
    
    _init: function() {
        let cbApps = Lang.bind(this, function() {
            this.emit('apps-updated');
        });
        let cbMostUsed = Lang.bind(this, function() {
            this.emit('mostUsed-updated');
        });
        let cbFavorites = Lang.bind(this, function() {
            this.emit('favorites-updated');
        });
        this._appsManager = new AppsManager(cbApps, cbMostUsed, cbFavorites);
        
        let cbRecentFiles = Lang.bind(this, function() {
            this.emit('recentFiles-updated');
        });
        this._recentFilesManager = new RecentFilesManager(cbRecentFiles);
        
        let cbDevices = Lang.bind(this, function() {
            this.emit('devices-updated');
        });
        let cbNetDevices = Lang.bind(this, function() {
            this.emit('netDevices-updated');
        });
        let cbBookmarks = Lang.bind(this, function() {
            this.emit('bookmarks-updated');
        });
        this._placesManager = new PlacesManager(cbDevices, cbNetDevices, cbBookmarks);
    },
    
    destroy: function() {
        this._appsManager.destroy();
        this._recentFilesManager.destroy();
        this._placesManager.destroy();
    },
    
    ////////////////////////////////////////////////////////////////////////////
    
    
    getApplicationsMap: function() {
        return this._appsManager.getApplicationsMap();
    },

    getCategoryMap: function() {
        return this._appsManager.getCategoryMap();
    },

    getAllApplications: function() {
        return this._appsManager.getAllApplications();
    },

    getMostUsedApps: function() {
        return this._appsManager.getMostUsedApps();
    },

    getFavoriteApps: function() {
        return this._appsManager.getFavoriteApps();
    },
    
    getRecentFiles: function() {
        return this._recentFilesManager.getRecentFiles();
    },
    
    getDefaultPlaces: function() {
        return this._placesManager.getDefaultPlaces();
    },

    getBookmarks: function() {
        return this._placesManager.getBookmarks();
    },

    getDevices: function() {
        return this._placesManager.getDevices();
    },
    
    getNetworkDevices: function() {
        return this._placesManager.getNetworkDevices();
    },
});
Signals.addSignalMethods(Datamanager.prototype);