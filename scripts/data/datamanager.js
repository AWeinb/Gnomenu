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
const Mainloop = imports.mainloop;
const Signals = imports.signals;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GMenu = imports.gi.GMenu;
const Gtk = imports.gi.Gtk;
const Shell = imports.gi.Shell;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Launchable = Me.imports.scripts.data.launchable.Launchable;
const Log = Me.imports.scripts.misc.log;

/**
 * @description The most-used apps do not notify if updated so i need to update
 *              them periodically.
 * @constant
 * @private
 */
const MOSTUSED_REFRESH_TICK = 60000; // 1 min



/**
 * @class AppsManager
 *
 * @classdesc This class keeps track of the currently available apps, most-used
 *            apps, and favorites. If update the corresponding callback is called.
 *            This is a helper class and is not supposed to be used outside
 *            of this file. The mainclass, the Datamanger, does use events
 *            to notify about changes.
 *
 * @description The constructor takes callback functions to notify about
 *              app, most-used, or favorite changes.
 *
 *
 * @param {Function} cbApps
 * @param {Function} cbMostUsed
 * @param {Function} cbFavorites
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
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

        // Connect to the appsystem.
        this._appSignalId = this._appSystem.connect('installed-changed', Lang.bind(this, Lang.bind(this, function () {
            if (this._appTimeoutId > 0) {
                return;
            }

            this._appTimeoutId = Mainloop.timeout_add(100, Lang.bind(this, function () {
                this._appTimeoutId = 0;
                this._updateAppMap();
                return false;
            }));
        })));
        this._updateAppMap();

        // The most-used apps are updated periodically.
        this._usageTimeoutId = Mainloop.timeout_add(MOSTUSED_REFRESH_TICK, Lang.bind(this, function () {
            this._updateMostUsedApps();
            return true;

        }));
        this._updateMostUsedApps();

        // Connect the favorites.
        this._favSignalId = global.settings.connect('changed::favorite-apps', Lang.bind(this, Lang.bind(this, function () {
            if (this._favTimeoutId > 0) {
                return;
            }

            this._favTimeoutId = Mainloop.timeout_add(100, Lang.bind(this, function () {
                this._favTimeoutId = 0;
                this._updateFavoriteApps();
                return false;
            }));
        })));
        this._updateFavoriteApps();
    },

    ////////////////////////////////////////////////////////////////////////////


    /**
     * @description Returns the apps in a map ordered by category.
     * @returns {StringLaunchableMap}
     * @function
     * @memberOf AppsManager#
     */
    getApplicationsMap: function() {
        return this._appCategoryMap;
    },

    /**
     * @description Returns a map with category Ids and category Names.
     * @returns {ObjectStringMap}
     * @function
     * @memberOf AppsManager#
     */
    getCategoryMap: function() {
        return this._categoryIdNameMap;
    },

    /**
     * @description Returns the all apps as list of launchables.
     * @returns {LaunchableList}
     * @function
     * @memberOf AppsManager#
     */
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

    /**
     * @description Returns the most-used apps as list of launchables.
     * @returns {LaunchableList}
     * @function
     * @memberOf AppsManager#
     */
    getMostUsedApps: function() {
        return this._mostUsedApps;
    },

    /**
     * @description Returns the favorite apps as list of launchables.
     * @returns {LaunchableList}
     * @function
     * @memberOf AppsManager#
     */
    getFavoriteApps: function() {
        return this._favoriteApps;
    },

    /**
     * @description Destroys the instance. Disconnects all signals.
     * @function
     * @memberOf AppsManager#
     */
    destroy: function() {
        if (this._appTimeoutId) {
            Mainloop.source_remove(this._appTimeoutId);
        }
        if (this._usageTimeoutId) {
            Mainloop.source_remove(this._usageTimeoutId);
        }
        if (this._favTimeoutId) {
            Mainloop.source_remove(this._favTimeoutId);
        }

        if (this._appSignalId) {
            this._appSystem.disconnect(this._appSignalId);
        }
        if (this._favSignalId) {
            global.settings.disconnect(this._favSignalId);
        }
    },

    ////////////////////////////////////////////////////////////////////////////


    /**
     * @description Helper to update all apps/ the apps of each category.
     * @function
     * @private
     * @memberOf AppsManager#
     */
    _updateAppMap: function() {
        this._appCategoryMap = {};

        // Travers through an app tree where the directories are the categories.
        let tree = this._appSystem.get_tree();
        let iter = tree.get_root_directory().iter();
        let nextType = null;
        while ((nextType = iter.next()) != GMenu.TreeItemType.INVALID) {

            // Category found.
            if (nextType == GMenu.TreeItemType.DIRECTORY) {
                let dir = iter.get_directory();
                let iterDir = dir.iter();
                let nextType = null;
                while ((nextType = iterDir.next()) != GMenu.TreeItemType.INVALID) {

                    // Get the next app and transform it to a launchable.
                    if (nextType == GMenu.TreeItemType.ENTRY) {
                        let entry = iterDir.get_entry();
                        // The app must be a visible app.
                        if (!entry.get_app_info().get_nodisplay()) {
                            // Init the map part for the catgory if needed.
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

        // Notify
        if (this._cbApps) this._cbApps();
    },

    /**
     * @description Helper to get the most used apps.
     * @function
     * @private
     * @memberOf AppsManager#
     */
    _updateMostUsedApps: function() {
        this._mostUsedApps = [];

        let appName = null;
        let appIcon = null;
        let appDescription = null;

        // Gets a list of apps that then are transformed into launchables.
        let mostUsed = this._appUsage.get_most_used('');
        for each (let app in mostUsed) {
            if (app.get_app_info().should_show()) {

                let appName = app.get_name();
                let appIcon = app.get_app_info().get_icon(); // Gio.ThemedIcon
                let appDescription = app.get_description();

                this._mostUsedApps.push(new Launchable(app, appName, appIcon, appDescription));
            }
        }

        // Notify.
        if (this._cbMostUsed) this._cbMostUsed();
    },

    /**
     * @description Helper to update the favorite apps.
     * @function
     * @private
     * @memberOf AppsManager#
     */
    _updateFavoriteApps: function() {
        this._favoriteApps = [];

        let appName = null;
        let appIcon = null;
        let appDescription = null;

        // Gets a list of names that then are used to get apps and after that
        // launchables.
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

        // Notify.
        if (this._cbFavorites) this._cbFavorites();
    },
});



/**
 * @class RecentFilesManager
 *
 * @classdesc This class keeps track of the current recent files. It notifies
 *            about changes via a callback function. You are not supposed to
 *            use this class but to use the Datamanager which provides signals
 *            as notifications.
 *
 * @description The constructor takes a callback function to notify about
 *              recent changes.
 *
 *
 * @param {Function} cbRecentFiles
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const RecentFilesManager = new Lang.Class({

    Name: 'GnoMenu.RecentFilesManager',


    _init: function(cbRecentFiles) {
        this._cbRecentFiles = cbRecentFiles;
        this._files = [];
        this._recentManager = Gtk.RecentManager.get_default();

        // Connect to recent changes.
        this._recentTimeoutId = 0;
        this._recentSignalId = this._recentManager.connect('changed', Lang.bind(this, Lang.bind(this, function () {
            if (this._recentTimeoutId > 0) {
                return;
            }

            this._recentTimeoutId = Mainloop.timeout_add(100, Lang.bind(this, function () {

                this._recentTimeoutId = 0;
                this._updateRecentFiles();

                return false;
            }));
        })));
        this._updateRecentFiles();
    },

    ////////////////////////////////////////////////////////////////////////////


    /**
     * @description Returns the recently used files as a list of launchables.
     * @returns {Launchable}
     * @function
     * @memberOf RecentFilesManager#
     */
    getRecentFiles: function() {
        return this._files;
    },

    /**
     * @description Destroys the instance and disconnects everything.
     * @function
     * @memberOf RecentFilesManager#
     */
    destroy: function() {
        if (this._recentTimeoutId) {
            Mainloop.source_remove(this._recentTimeoutId);
        }
        if (this._recentSignalId) {
            this._recentManager.disconnect(this._recentSignalId);
        }
    },

    ////////////////////////////////////////////////////////////////////////////


    /**
     * @description Helper to update the recent files.
     * @function
     * @private
     * @memberOf RecentFilesManager#
     */
    _updateRecentFiles: function() {
        let files = [];

        let recentPath = null;
        let recentName = null;
        let recentIcon = null;
        let recentDescription = null;

        // The recent files are already gathered and only need to be
        // transformed into launchables.
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

        // Notify someone.
        if (this._cbRecentFiles) this._cbRecentFiles();
    },
});



/**
 * @class PlacesManager
 *
 * @classdesc This class keeps track of the places and devices. It notifies
 *            about changes via a callback function. You are not supposed to
 *            use this class but to use the Datamanager which provides signals
 *            as notifications.
 *
 * @description The constructor takes callback functions to notify about
 *              changes.
 *
 *
 * @param {Boolean} useSymbolic It is possible to modify the icontype. Symbolic
 *                              icons are more simple than non-symbolic.
 * @param {Function} cbDevices
 * @param {Function} cbNetDevices
 * @param {Function} cbBookmarks
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author gcampax (Places Status Indicator extension)
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const PlacesManager = new Lang.Class({

    Name: 'GnoMenu.PlacesManager',


    _init: function(useSymbolic, cbDevices, cbNetDevices, cbBookmarks) {
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

        // Registering the default places.
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

        // Gather all valid default directories and create launchables.
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

        // Bookmark event connecting.
        this._bookmarkMonitorId = 0;
        this._bookmarkTimeoutId = 0;
        this._bookmarksFile = this._findBookmarksFile();
        if (this._bookmarksFile) {
            this._bookmarkMonitor = this._bookmarksFile.monitor_file(Gio.FileMonitorFlags.NONE, null);
            this._bookmarkMonitorId = this._bookmarkMonitor.connect('changed', Lang.bind(this, function () {

                if (this._bookmarkTimeoutId > 0) {
                    return;
                }
                /* Defensive event compression */
                this._bookmarkTimeoutId = Mainloop.timeout_add(100, Lang.bind(this, function () {

                    this._bookmarkTimeoutId = 0;
                    this._updateBookmarks();

                    return false;
                }));
            }));
            // First update.
            this._updateBookmarks();
        }
    },

    /**
     * @description Helper to connect to the signals of the volumemonitor.
     * @function
     * @private
     * @memberOf PlacesManager#
     */
    _connectVolumeMonitorSignals: function() {
        const signals = ['volume-added',
                         'volume-removed',
                         'volume-changed',
                         'mount-added',
                         'mount-removed',
                         'mount-changed',
                         'drive-connected',
                         'drive-disconnected',
                         'drive-changed'
                         ];

        this._volumeMonitorSignals = [];
        let func = Lang.bind(this, this._updateMounts);
        for each (let signal in signals) {
            let id = this._volumeMonitor.connect(signal, func);
            this._volumeMonitorSignals.push(id);
        }
    },

    /**
     * @description Helper to find the correct gtk bookmarks file.
     * @returns {Gio.File}
     * @function
     * @private
     * @memberOf PlacesManager#
     */
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


    /**
     * @description Returns the default places as list.
     * @returns {LaunchableList}
     * @function
     * @memberOf PlacesManager#
     */
    getDefaultPlaces: function() {
        return this._places['special'];
    },

    /**
     * @description Returns the bookmarks as list.
     * @returns {LaunchableList}
     * @function
     * @memberOf PlacesManager#
     */
    getBookmarks: function() {
        return this._places['bookmarks'];
    },

    /**
     * @description Returns the devices as list.
     * @returns {LaunchableList}
     * @function
     * @memberOf PlacesManager#
     */
    getDevices: function() {
        return this._places['devices'];
    },

    /**
     * @description Returns the remote devices as list.
     * @returns {LaunchableList}
     * @function
     * @memberOf PlacesManager#
     */
    getNetworkDevices: function() {
        return this._places['network'];
    },

    /**
     * @description Destroys the instance. Unregisters everything.
     * @function
     * @memberOf PlacesManager#
     */
    destroy: function() {
        for each (let signalID in this._volumeMonitorSignals) {
            this._volumeMonitor.disconnect(signalID);
        }
        if (this._bookmarkMonitor) {
            this._bookmarkMonitor.cancel();
        }
        if (this._bookmarkTimeoutId) {
            Mainloop.source_remove(this._bookmarkTimeoutId);
        }
        if (this._bookmarkMonitorId) {
            this._bookmarkMonitor.disconnect(this._bookmarkMonitorId);
        }
    },

    ////////////////////////////////////////////////////////////////////////////


    /**
     * @description Helper to update the devices and mounts.
     * @returns {LaunchableList}
     * @function
     * @private
     * @memberOf PlacesManager#
     */
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

    /**
     * @description Helper to update the bookmarks.
     * @returns {LaunchableList}
     * @function
     * @private
     * @memberOf PlacesManager#
     */
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

    /**
     * @description Helper to get the correct name for the path/file.
     * @returns {String}
     * @function
     * @private
     * @memberOf PlacesManager#
     */
    _getName: function(path) {
        let name = null;
        let file = Gio.File.new_for_path(path);
        try {
            let info = file.query_info('standard::display-name', 0, null);
            name = info.get_display_name();

        } catch(e if e instanceof Gio.IOErrorEnum) {
            name = file.get_basename();
        }
        return name;
    },

    /**
     * @description Helper to get the correct icon for the path/file.
     * @returns {Gio.ThemedIcon}
     * @function
     * @private
     * @memberOf PlacesManager#
     */
    _getStandardIcon: function(path) {
        let icon = null;
        let file = Gio.File.new_for_path(path);
        let info;

        if (this._useSymbolicIcons) {
            info = file.query_info('standard::symbolic-icon', 0, null); // Gio.ThemedIcon
            icon = info.get_symbolic_icon();
        } else {
            info = file.query_info("standard::icon", 0, null); // Gio.ThemedIcon
            icon = info.get_icon();
        }
        return icon;
    },

    /**
     * @description Helper to get the correct icon for the file type.
     * @returns {Gio.ThemedIcon}
     * @function
     * @private
     * @memberOf PlacesManager#
     */
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

    /**
     * @description Returns a the default mount icon.
     * @returns {Gio.ThemedIcon}
     * @function
     * @private
     * @memberOf PlacesManager#
     */
    _getMountIcon: function(mount) {
        if (this._useSymbolicIcons) {
            return mount.get_symbolic_icon(); // Gio.ThemedIcon
        } else {
            return mount.get_icon(); // Gio.ThemedIcon
        }
    },
});



/**
 * @class Datamanager
 *
 * @classdesc This class lets you receive most of the systemdata that can be
 *            shown in an appsmenu. It compines the appmanager, the recent
 *            files manager, and the places manager and lets you get their
 *            data. You can connect to signals to receive update events. Every
 *            method here (should return) returns a Launchable Map or List.
 *            Launchables handle the launching for different file types and apps
 *            for you.
 *
 * @description The constructor creates the base classes and connects the signals.
 *
 *
 * @param {Boolean} useSymbolic It is possible to modify the icontype. Symbolic
 *                              icons are more simple than non-symbolic.
 * @param {Function} cbDevices
 * @param {Function} cbNetDevices
 * @param {Function} cbBookmarks
 *
 * @fires Datamanager#apps-updated
 * @fires Datamanager#mostUsed-updated
 * @fires Datamanager#favorites-updated
 * @fires Datamanager#recentFiles-updated
 * @fires Datamanager#devices-updated
 * @fires Datamanager#netDevices-updated
 * @fires Datamanager#bookmarks-updated
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const Datamanager = new Lang.Class({

    Name: 'GnoMenu.Datamanager',

    _appsManager: null,
    _recentFilesManager: null,
    _placesManager: null,


    _init: function() {
        // Create all data gatherer.

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

    /**
     * @description Destroys everything.
     * @function
     * @memberOf Datamanager#
     */
    destroy: function() {
        this._appsManager.destroy();
        this._recentFilesManager.destroy();
        this._placesManager.destroy();
    },

    ////////////////////////////////////////////////////////////////////////////


    /**
     * @description Returns a map with apps sorted by category.
     * @returns {StringLaunchableMap}
     * @function
     * @memberOf Datamanager#
     */
    getApplicationsMap: function() {
        return this._appsManager.getApplicationsMap();
    },

    /**
     * @description Returns a map with category IDs and category Names.
     * @returns {StringStringMap}
     * @function
     * @memberOf Datamanager#
     */
    getCategoryMap: function() {
        return this._appsManager.getCategoryMap();
    },

    /**
     * @description Returns a list with launchables. This are all applications
     *              of the system.
     * @returns {LaunchableList}
     * @function
     * @memberOf Datamanager#
     */
    getAllApplications: function() {
        return this._appsManager.getAllApplications();
    },

    /**
     * @description Returns a list with the most-used apps as Launchable list.
     * @returns {LaunchableList}
     * @function
     * @memberOf Datamanager#
     */
    getMostUsedApps: function() {
        return this._appsManager.getMostUsedApps();
    },

    /**
     * @description Returns a list with the favorite apps ordered by the user.
     * @returns {LaunchableList}
     * @function
     * @memberOf Datamanager#
     */
    getFavoriteApps: function() {
        return this._appsManager.getFavoriteApps();
    },

    /**
     * @description Returns a list with the recently opened files.
     * @returns {LaunchableList}
     * @function
     * @memberOf Datamanager#
     */
    getRecentFiles: function() {
        return this._recentFilesManager.getRecentFiles();
    },

    /**
     * @description Returns a list with the default places.
     * @returns {LaunchableList}
     * @function
     * @memberOf Datamanager#
     */
    getDefaultPlaces: function() {
        return this._placesManager.getDefaultPlaces();
    },

    /**
     * @description Returns a list with the bookmarks of the user.
     * @returns {LaunchableList}
     * @function
     * @memberOf Datamanager#
     */
    getBookmarks: function() {
        return this._placesManager.getBookmarks();
    },

    /**
     * @description Returns a list with the devices (USB Sticks, HDs) registered
     *              in the system.
     * @returns {LaunchableList}
     * @function
     * @memberOf Datamanager#
     */
    getDevices: function() {
        return this._placesManager.getDevices();
    },

    /**
     * @description Returns a list with remote devices.
     * @returns {LaunchableList}
     * @function
     * @memberOf Datamanager#
     */
    getNetworkDevices: function() {
        return this._placesManager.getNetworkDevices();
    },
});
Signals.addSignalMethods(Datamanager.prototype);