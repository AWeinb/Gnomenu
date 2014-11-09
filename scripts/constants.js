
const SETTINGS = 'org.gnome.shell.extensions.gnomenu';
const PREFS_DIALOG_CMD = 'gnome-shell-extension-prefs gnomenu@panacier.gmail.com';
const STYLESHEET_BASE_PATH = '/themes/default/';

const SEARCH_MAX_ENTRIES_PER_ROW = 4;

const EStylesheetFilename = {
    
    LARGE:  'gnomenu-large.css',
    MEDIUM: 'gnomenu-medium.css',
    SMALL:  'gnomenu-small.css',
    
};

const EMenuLayout = {
    
    LARGE:  40,
    MEDIUM: 41,
    SMALL:  42,
    
};

const ECategoryID = {
        
    ALL_APPS:    "category_allApps",
    MOST_USED:   "category_mostUsed",
    FAVORITES:   "category_favorites",
    RECENTFILES: "category_recent",
    PLACES:      "category_places",
    DEVICES:     "category_devices",
    NETDEVICES:  "category_netdevices",
    BOOKMARKS:   "category_bookmarks",
    WEB:         "category_web",
    
};

const EEventType = {
    
    APPS_EVENT:          10,
    MOSTUSED_EVENT:      11,
    FAVORITES_EVENT:     12,
    RECENTFILES_EVENT:   13,
    PLACES_EVENT:        14,
    DEVICES_EVENT:       15,
    NETDEVICES_EVENT:    16,
    BOOKMARKS_EVENT:     17,
    SEARCH_UPDATE_EVENT: 18,
    SEARCH_STOP_EVENT:   19,
    
};

const EViewMode = {
    
    LIST: 30,
    GRID: 31,
    
};

const ESelectionMethod = {
    
    HOVER: 20,
    CLICK: 21,
    
};
