
const Lang = imports.lang;
const Mainloop = imports.mainloop;

const Clutter = imports.gi.Clutter;
const Gtk = imports.gi.Gtk;
const Meta = imports.gi.Meta;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Constants = Me.imports.scripts.constants;
const DraggableGridButton = Me.imports.scripts.menu.components.elements.menubutton.DraggableGridButton;
const DraggableListButton = Me.imports.scripts.menu.components.elements.menubutton.DraggableListButton;
const UpdateableComponent = Me.imports.scripts.menu.components.component.UpdateableComponent;

const ECategoryID = Constants.ECategoryID;
const EEventType = Constants.EEventType;
const EViewMode = Constants.EViewMode;



const ShortcutBoxBase = new Lang.Class({

    Name: 'Gnomenu.shortcutArea.ShortcutBoxBase',
    
    
    _init: function(model, mediator) {
        if (!model || !mediator) {
            Log.logError("GnoMenu.shortcutArea.ShortcutBoxBase", "_init", "model, mediator, may not be null!");
        }
        
        this.mediator = mediator;
        this.model = model;
        
        this._categoryButtonMap = {};
        this._appCategoryButtonMap = {};
    },
    
    addCategoryButton: function(categoryID, launchable, isAppCategory) {
        Log.logError("GnoMenu.shortcutArea.ShortcutBoxBase", "addCategoryButton", "Implement me!");
    },
    
    clearCategoryStorage: function(categoryID, isAppCategory) {
        let map = null;
        let list = null;
        
        if (isAppCategory) {
            for each (let cat in this._appCategoryButtonMap) {
                for each (let btn in cat) {
                    btn.actor.destroy();
                }
            }
            this._appCategoryButtonMap = {};
            
        } else {
            if (categoryID) {
                for each (let btn in this._categoryButtonMap[categoryID]) {
                    btn.actor.destroy();
                }
                this._categoryButtonMap[categoryID] = [];
                
            } else {
                for each (let cat in this._categoryButtonMap) {
                    for each (let btn in cat) {
                        btn.actor.destroy();
                    }
                }
                this._categoryButtonMap = {};
            }
        }
    },
    
    refresh: function(shownCategory) {
        this.clear();
        
        if (shownCategory) {
            this.showCategory(shownCategory.id, shownCategory.isFromApp);
        }
    },
    
    clear: function() {
        let actors = this.actor.get_children();
        if (actors) {
            for each (let actor in actors) {
                this.actor.remove_actor(actor);
            }
        }
    },
    
    hide: function() {
        if (this.actor) {
            this.actor.hide();
        }
    },
    
    show: function() {
        if (this.actor) {
            this.actor.show();
        }
    },
    
    isVisible: function() {
        if (this.actor) {
            return this.actor.visible;
        }
        return false;
    },
    
    toggleVisibility: function() {
        if (this._isShown) {
            this.hide();
            this._isShown = false;
        } else {
            this.show();
            this._isShown = true;
        }
    },
    
    destroy: function() {
        if (this.actor) {
            this.actor.destroy();
        }
    }
});


const ShortcutList = new Lang.Class({

    Name: 'Gnomenu.shortcutArea.ShortcutList',
    Extends: ShortcutBoxBase,
    
    
    _init: function(model, mediator) {
        this.parent(model, mediator);
        this.actor = new St.BoxLayout({ style_class: 'gnomenu-applications-list-box', vertical:true });
        
        this._selectedButtonMap = null;
        this._selectedButtonIdx = 0;
    },
    
    selectNext: function() {
        if (!this._selectedButtonMap) {
            return;
        }
        
        let keys = Object.keys(this._selectedButtonMap);
        let buttonID = keys[this._selectedButtonIdx % keys.length];
        let btn = this._selectedButtonMap[buttonID];
        btn.select();
        
        this._selectedButtonIdx += 1;
    },
    
    selectPrevious: function() {
        if (!this._selectedButtonMap) {
            return;
        }
        
        let keys = Object.keys(this._selectedButtonMap);
        if(this._selectedButtonIdx < 0) {
            this._selectedButtonIdx = keys.length - 1;
        }
        let buttonID = keys[this._selectedButtonIdx];
        let btn = this._selectedButtonMap[buttonID];
        btn.select();
        
        this._selectedButtonIdx -= 1;
    },
    
    addCategoryButton: function(categoryID, launchable, isAppCategory) {
        if (!categoryID || !launchable) {
            Log.logWarning("GnoMenu.shortcutArea.ShortcutList", "addCategoryButton", "categoryID or launchable is null!");
            return;
        }
        
        let map = null;
        if (isAppCategory) {
            if (!this._appCategoryButtonMap[categoryID]) {
                this._appCategoryButtonMap[categoryID] = [];
            }
            map = this._appCategoryButtonMap;
            
        } else {
            if (!this._categoryButtonMap[categoryID]) {
                this._categoryButtonMap[categoryID] = [];
            }
            map = this._categoryButtonMap;
        }
        
        let iconSize = this.model.getAppListIconSize();
        map[categoryID].push(new DraggableListButton(this.mediator, iconSize, launchable));
    },
    
    showCategory: function(categoryID, isAppCategory) {
        let buttonMap = null;
        
        if (isAppCategory) {
            buttonMap = this._appCategoryButtonMap[categoryID];
        } else {
            buttonMap = this._categoryButtonMap[categoryID];
        }
        
        this._selectedButtonMap = buttonMap;
        this._selectedButtonIdx = 0;
        
        if (!buttonMap) {
            return false;
        }
        
        this.clear();
        
        for each (let btn in buttonMap) {
            this.actor.add_actor(btn.actor);
        }
        
        return true;
    },
});


const ShortcutGrid = new Lang.Class({

    Name: 'Gnomenu.shortcutArea.ShortcutGrid',
    Extends: ShortcutBoxBase,
    
    
    _init: function(model, mediator) {
        this.parent(model, mediator);
        this.actor = new St.Table({ homogeneous: false, reactive: true, style_class: 'gnomenu-applications-grid-box' });
        
        this._selectedButtonMap = null;
        this._selectedButtonIdx = 0;
    },
    
    selectNext: function() {
        if (!this._selectedButtonMap) {
            return;
        }
        
        let keys = Object.keys(this._selectedButtonMap);
        let buttonID = keys[this._selectedButtonIdx % keys.length];
        let btn = this._selectedButtonMap[buttonID];
        btn.select();
        
        this._selectedButtonIdx += 1;
    },
    
    selectPrevious: function() {
        if (!this._selectedButtonMap) {
            return;
        }
        
        let keys = Object.keys(this._selectedButtonMap);
        if(this._selectedButtonIdx < 0) {
            this._selectedButtonIdx = keys.length - 1;
        }
        let buttonID = keys[this._selectedButtonIdx];
        let btn = this._selectedButtonMap[buttonID];
        btn.select();
        
        this._selectedButtonIdx -= 1;
    },
    
    addCategoryButton: function(categoryID, launchable, isAppCategory) {
        if (!categoryID || !launchable) {
            Log.logWarning("GnoMenu.shortcutArea.ShortcutGrid", "addCategoryButton", "categoryID or launchable is null!");
            return;
        }
        
        let map = null;
        if (isAppCategory) {
            if (!this._appCategoryButtonMap[categoryID]) {
                this._appCategoryButtonMap[categoryID] = [];
            }
            map = this._appCategoryButtonMap;
            
        } else {
            if (!this._categoryButtonMap[categoryID]) {
                this._categoryButtonMap[categoryID] = [];
            }
            map = this._categoryButtonMap;
        }
        
        let iconSize = this.model.getAppGridIconSize();
        map[categoryID].push(new DraggableGridButton(this.mediator, iconSize, launchable));
    },
    
    showCategory: function(categoryID, isAppCategory) {
        let buttonMap = null;
        
        if (isAppCategory) {
            buttonMap = this._appCategoryButtonMap[categoryID];
        } else {
            buttonMap = this._categoryButtonMap[categoryID];
        }
        
        this._selectedButtonMap = buttonMap;
        this._selectedButtonIdx = 0;
        
        if (!buttonMap) {
            return false;
        }
        
        this.clear();
        
        let count = 0;
        let colMax = this.model.getAppGridColumnCount();
        for each (let btn in buttonMap) {
            let rowTmp = parseInt(count / colMax);
            let colTmp = count % colMax;
            this.actor.add(btn.actor, { row: rowTmp, col: colTmp });
            count ++;
        }
        
        return true;
    },
});


const ShortcutArea = new Lang.Class({

    Name: 'Gnomenu.shortcutArea.ShortcutArea',
    Extends: UpdateableComponent,
    
    
    _init: function(model, mediator) {
        this.parent(model, mediator);
        
        this._mainBox = new St.BoxLayout({ style_class: 'gnomenu-applications-box' });
        
        this.actor = new St.ScrollView({ x_fill: true, y_fill: false, y_align: St.Align.START, style_class: 'vfade gnomenu-applications-scrollbox' });
        this.actor.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
        this.actor.set_mouse_scrolling(true);
        this.actor.add_actor(this._mainBox);
        
        this._shortcutList = new ShortcutList(model, mediator);
        this._shortcutGrid = new ShortcutGrid(model, mediator);
        this._mainBox.add(this._shortcutList.actor, { expand: true, x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.START });
        this._mainBox.add(this._shortcutGrid.actor, { expand: true, x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.START });
        
        this._shownCategory = { id: null, isAppCategory: null };
        
        this._updateTimeoutIds = {};
        this._updateTimeoutIds[EEventType.APPS_EVENT] = 0;
        this._updateTimeoutIds[EEventType.MOSTUSED_EVENT] = 0;
        this._updateTimeoutIds[EEventType.FAVORITES_EVENT] = 0;
        this._updateTimeoutIds[EEventType.RECENTFILES_EVENT] = 0;
        this._updateTimeoutIds[EEventType.PLACES_EVENT] = 0;
        this._updateTimeoutIds[EEventType.DEVICES_EVENT] = 0;
        this._updateTimeoutIds[EEventType.NETDEVICES_EVENT] = 0;
        this._updateTimeoutIds[EEventType.BOOKMARKS_EVENT] = 0;
        
        this.update();
    },
    
    show: function() {
        this.actor.show();
    },
    
    hide: function() {
        this.actor.hide();
    },
    
    isVisible: function() {
        return this.actor.visible;
    },
    
    refresh: function() {
        this.update();
    },
    
    setViewMode: function(id) {
        switch (id) {
            
            case EViewMode.LIST:
                this._shortcutList.show();
                this._shortcutGrid.hide();
                this._shortcutList.refresh(this._shownCategory);
                break;
            
            case EViewMode.GRID:
                this._shortcutList.hide();
                this._shortcutGrid.show();
                this._shortcutGrid.refresh(this._shownCategory);
                break;
            
            default:
                Log.logWarning("GnoMenu.shortcutArea.ShortcutArea", "setViewMode", "id is null!");
                break;
        }
    },
    
    selectNext: function() {
        if (this._shortcutList.isVisible()) {
            this._shortcutList.selectNext();
        } else {
            this._shortcutGrid.selectNext()
        }
    },
    
    selectPrevious: function() {
        if (this._shortcutList.isVisible()) {
            this._shortcutList.selectPrevious();
        } else {
            this._shortcutGrid.selectPrevious()
        }
    },
    
    showCategory: function(categoryID) {
        if (!categoryID) {
            Log.logError("GnoMenu.shortcutArea.ShortcutArea", "showCategory", "categoryID is null!");
        }
        
        const customCats =
        [
            ECategoryID.ALL_APPS,
            ECategoryID.MOST_USED,
            ECategoryID.FAVORITES,
            ECategoryID.RECENTFILES,
            ECategoryID.PLACES,
            ECategoryID.DEVICES,
            ECategoryID.NETDEVICES,
            ECategoryID.BOOKMARKS,
            ECategoryID.WEB,
        ];
        
        let isAppCategory = true;
        for each (let cat in customCats) {
            if (cat == categoryID) {
                isAppCategory = false;
                break;
            }
        }
        
        let ret = this._shortcutList.showCategory(categoryID, isAppCategory);
        ret &= this._shortcutGrid.showCategory(categoryID, isAppCategory);
        
        if (!ret) {
            categoryID = ECategoryID.MOST_USED;
            isAppCategory = false;
            let ret = this._shortcutList.showCategory(categoryID, isAppCategory);
            ret &= this._shortcutGrid.showCategory(categoryID, isAppCategory);
        }
        
        this._shownCategory = { id: categoryID, isAppCategory: isAppCategory };
    },
    
    update: function(event) {
        if (!event) {
            this.update({ type: EEventType.APPS_EVENT });
            this.update({ type: EEventType.MOSTUSED_EVENT });
            this.update({ type: EEventType.FAVORITES_EVENT });
            this.update({ type: EEventType.RECENTFILES_EVENT });
            this.update({ type: EEventType.PLACES_EVENT });
            this.update({ type: EEventType.DEVICES_EVENT });
            this.update({ type: EEventType.NETDEVICES_EVENT });
            this.update({ type: EEventType.BOOKMARKS_EVENT });
            return;
        }
        
        if (this._updateTimeoutIds[event.type] > 0) {
            Mainloop.source_remove(this._updateTimeoutIds[event.type]);
            this._updateTimeoutIds[event.type] = 0;
        }
        
        switch (event.type) {
            
            case EEventType.APPS_EVENT:
                this._updateTimeoutIds[event.type] = Mainloop.timeout_add(100, Lang.bind(this, function () {
                    
                    this._shortcutList.clearCategoryStorage(ECategoryID.ALL_APPS);
                    this._shortcutGrid.clearCategoryStorage(ECategoryID.ALL_APPS);
                    let allApps = this.model.getAllApplications();
                    for each (let app in allApps) {
                        this._shortcutList.addCategoryButton(ECategoryID.ALL_APPS, app);
                        this._shortcutGrid.addCategoryButton(ECategoryID.ALL_APPS, app);
                    }
                    if (this._shownCategory.id == ECategoryID.ALL_APPS) {
                        this._shortcutList.refresh(this._shownCategory);
                        this._shortcutGrid.refresh(this._shownCategory);
                    }
                    
                    this._shortcutList.clearCategoryStorage(null, true);
                    this._shortcutGrid.clearCategoryStorage(null, true);
                    let appMap = this.model.getApplicationsMap();
                    for (let category in appMap) {
                        
                        let applist = appMap[category];
                        for each (let app in applist) {
                            this._shortcutList.addCategoryButton(category, app, true);
                            this._shortcutGrid.addCategoryButton(category, app, true);
                        }
                    }
                    if (this._shownCategory.isAppCategory) {
                        this._shortcutList.refresh(this._shownCategory);
                        this._shortcutGrid.refresh(this._shownCategory);
                    }
                    
                    this._updateTimeoutIds[event.type] = 0;
                    return false;
                }));
                break;
            
            case EEventType.MOSTUSED_EVENT:
                this._updateTimeoutIds[event.type] = Mainloop.timeout_add(100, Lang.bind(this, function () {
                    
                    this._shortcutList.clearCategoryStorage(ECategoryID.MOST_USED);
                    this._shortcutGrid.clearCategoryStorage(ECategoryID.MOST_USED);
                    let mostUsed = this.model.getMostUsedApps();
                    for each (let app in mostUsed) {
                        this._shortcutList.addCategoryButton(ECategoryID.MOST_USED, app);
                        this._shortcutGrid.addCategoryButton(ECategoryID.MOST_USED, app);
                    }
                    if (this._shownCategory.id == ECategoryID.MOST_USED) {
                        this._shortcutList.refresh(this._shownCategory);
                        this._shortcutGrid.refresh(this._shownCategory);
                    }
                    
                    this._updateTimeoutIds[event.type] = 0;
                    return false;
                }));
                break;
            
            case EEventType.FAVORITES_EVENT:
                this._updateTimeoutIds[event.type] = Mainloop.timeout_add(100, Lang.bind(this, function () {
                    
                    this._shortcutList.clearCategoryStorage(ECategoryID.FAVORITES);
                    this._shortcutGrid.clearCategoryStorage(ECategoryID.FAVORITES);
                    let favs = this.model.getFavoriteApps();
                    for each (let app in favs) {
                        this._shortcutList.addCategoryButton(ECategoryID.FAVORITES, app);
                        this._shortcutGrid.addCategoryButton(ECategoryID.FAVORITES, app);
                    }
                    if (this._shownCategory.id == ECategoryID.FAVORITES) {
                        this._shortcutList.refresh(this._shownCategory);
                        this._shortcutGrid.refresh(this._shownCategory);
                    }
                    
                    this._updateTimeoutIds[event.type] = 0;
                    return false;
                }));
                break;
            
            case EEventType.RECENTFILES_EVENT:
                this._updateTimeoutIds[event.type] = Mainloop.timeout_add(100, Lang.bind(this, function () {
                    
                    this._shortcutList.clearCategoryStorage(ECategoryID.RECENTFILES);
                    this._shortcutGrid.clearCategoryStorage(ECategoryID.RECENTFILES);
                    let recent = this.model.getRecentFiles();
                    for each (let app in recent) {
                        this._shortcutList.addCategoryButton(ECategoryID.RECENTFILES, app);
                        this._shortcutGrid.addCategoryButton(ECategoryID.RECENTFILES, app);
                    }
                    if (this._shownCategory.id == ECategoryID.RECENTFILES) {
                        this._shortcutList.refresh(this._shownCategory);
                        this._shortcutGrid.refresh(this._shownCategory);
                    }
                    
                    this._updateTimeoutIds[event.type] = 0;
                    return false;
                }));
                break;
            
            case EEventType.PLACES_EVENT:
                this._updateTimeoutIds[event.type] = Mainloop.timeout_add(100, Lang.bind(this, function () {
                    
                    this._shortcutList.clearCategoryStorage(ECategoryID.PLACES);
                    this._shortcutGrid.clearCategoryStorage(ECategoryID.PLACES);
                    let places = this.model.getPlaces();
                    for each (let place in places) {
                        this._shortcutList.addCategoryButton(ECategoryID.PLACES, place);
                        this._shortcutGrid.addCategoryButton(ECategoryID.PLACES, place);
                    }
                    if (this._shownCategory.id == ECategoryID.PLACES) {
                        this._shortcutList.refresh(this._shownCategory);
                        this._shortcutGrid.refresh(this._shownCategory);
                    }
                    
                    this._updateTimeoutIds[event.type] = 0;
                    return false;
                }));
                break;
            
            case EEventType.DEVICES_EVENT:
                this._updateTimeoutIds[event.type] = Mainloop.timeout_add(100, Lang.bind(this, function () {
                    
                    this._shortcutList.clearCategoryStorage(ECategoryID.DEVICES);
                    this._shortcutGrid.clearCategoryStorage(ECategoryID.DEVICES);
                    let devices = this.model.getDevices();
                    for each (let device in devices) {
                        this._shortcutList.addCategoryButton(ECategoryID.DEVICES, device);
                        this._shortcutGrid.addCategoryButton(ECategoryID.DEVICES, device);
                    }
                    if (this._shownCategory.id == ECategoryID.DEVICES) {
                        this._shortcutList.refresh(this._shownCategory);
                        this._shortcutGrid.refresh(this._shownCategory);
                    }
                    
                    this._updateTimeoutIds[event.type] = 0;
                    return false;
                }));
                break;
            
            case EEventType.NETDEVICES_EVENT:
                this._updateTimeoutIds[event.type] = Mainloop.timeout_add(100, Lang.bind(this, function () {
                    
                    this._shortcutList.clearCategoryStorage(ECategoryID.NETDEVICES);
                    this._shortcutGrid.clearCategoryStorage(ECategoryID.NETDEVICES);
                    let netDevices = this.model.getNetworkDevices();
                    for each (let device in netDevices) {
                        this._shortcutList.addCategoryButton(ECategoryID.NETDEVICES, device);
                        this._shortcutGrid.addCategoryButton(ECategoryID.NETDEVICES, device);
                    }
                    if (this._shownCategory.id == ECategoryID.NETDEVICES) {
                        this._shortcutList.refresh(this._shownCategory);
                        this._shortcutGrid.refresh(this._shownCategory);
                    }
                    
                    this._updateTimeoutIds[event.type] = 0;
                    return false;
                }));
                break;
            
            case EEventType.BOOKMARKS_EVENT:
                this._updateTimeoutIds[event.type] = Mainloop.timeout_add(100, Lang.bind(this, function () {
                    
                    this._shortcutList.clearCategoryStorage(ECategoryID.BOOKMARKS);
                    this._shortcutGrid.clearCategoryStorage(ECategoryID.BOOKMARKS);
                    let bookmarks = this.model.getBookmarks();
                    for each (let bookmark in bookmarks) {
                        this._shortcutList.addCategoryButton(ECategoryID.BOOKMARKS, bookmark);
                        this._shortcutGrid.addCategoryButton(ECategoryID.BOOKMARKS, bookmark);
                    }
                    if (this._shownCategory.id == ECategoryID.BOOKMARKS) {
                        this._shortcutList.refresh(this._shownCategory);
                        this._shortcutGrid.refresh(this._shownCategory);
                    }
                    
                    this._updateTimeoutIds[event.type] = 0;
                    return false;
                }));
                break;
            
        }
    },
    
    destroy: function() {
        for each (let id in this._updateTimeoutIds) {
            if (id > 0) {
                Mainloop.source_remove(id);
            }
        }
        
        this.actor.destroy();
        this._shortcutList.destroy();
        this._shortcutGrid.destroy();
    }
});
