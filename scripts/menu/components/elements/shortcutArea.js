/*
    Copyright (C) 2014-2015, THE PANACEA PROJECTS <panacier@gmail.com>
    Copyright (C) 2014-2015, AxP <Der_AxP@t-online.de>

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

const Clutter = imports.gi.Clutter;
const Gtk = imports.gi.Gtk;
const Meta = imports.gi.Meta;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const MenuModel = Me.imports.scripts.menu.menuModel;
const DraggableGridButton = Me.imports.scripts.menu.components.elements.menubutton.DraggableGridButton;
const DraggableListButton = Me.imports.scripts.menu.components.elements.menubutton.DraggableListButton;
const Component = Me.imports.scripts.menu.components.component.Component;

const ECategoryID = MenuModel.ECategoryID;
const EEventType = MenuModel.EEventType;
const EViewMode = MenuModel.EViewMode;


/**
 * @class ShortcutBoxBase: Represents the basic shortcut component.
 *
 * @param {MenuMediator} mediator A mediator instance.
 *
 *
 * @author AxP
 * @version 1.0
 */
const ShortcutBoxBase = new Lang.Class({

    Name: 'Gnomenu.shortcutArea.ShortcutBoxBase',


    _init: function(mediator) {
        if (!mediator) {
            Log.logError("GnoMenu.shortcutArea.ShortcutBoxBase", "_init", "mediator may not be null!");
        }

        this._mediator = mediator;

        this._categoryButtonMap = {};
        this._appCategoryButtonMap = {};
    },

    /**
     * @description Abstract method to add a new button.
     * @public
     * @function
     */
    addCategoryButton: function(categoryID, launchable, isAppCategory) {
        Log.logError("GnoMenu.shortcutArea.ShortcutBoxBase", "addCategoryButton", "Implement me!");
    },

    /**
     * @description Deletes all buttons from the storage.
     * @public
     * @function
     */
    clearCategoryStorage: function(categoryID, isAppCategory) {
        let map = null;
        let list = null;

        // There are different kinds of categories. First there are the
        // categories which i can name in the code and second the dynamic
        // ones. They are divided because ... for a good reason. Ah, the reason
        // is that some categories are more likely to disappear. This categories
        // get their own map and all of them are cleared by a refresh. You may
        // find a nicer solution! I double dare you!
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

    /**
     * @description Refreshes the component.
     * @public
     * @function
     */
    refresh: function(shownCategory) {
        this.clear();

        // The parameter should only be used intern. It provides the shown category.
        if (shownCategory) {
            this.showCategory(shownCategory.id, shownCategory.isFromApp);
        }
    },

    /**
     * @description Clears the elements from the component.
     * @public
     * @function
     */
    clear: function() {
        let actors = this.actor.get_children();
        if (actors) {
            for each (let actor in actors) {
                this.actor.remove_actor(actor);
            }
        }
    },

    /**
     * @description Hides the component.
     * @public
     * @function
     */
    hide: function() {
        if (this.actor) {
            this.actor.hide();
        }
    },

    /**
     * @description Shows the component.
     * @public
     * @function
     */
    show: function() {
        if (this.actor) {
            this.actor.show();
        }
    },

    /**
     * @description Determines wether the component is visible.
     * @returns {Boolean}
     * @public
     * @function
     */
    isVisible: function() {
        if (this.actor) {
            return this.actor.visible;
        }
        return false;
    },

    /**
     * @description Hides or shows the component.
     * @public
     * @function
     */
    toggleVisibility: function() {
        if (this._isShown) {
            this.hide();
            this._isShown = false;
        } else {
            this.show();
            this._isShown = true;
        }
    },

    /**
     * @description Destroys the component.
     * @public
     * @function
     */
    destroy: function() {
        if (this.actor) {
            this.actor.destroy();
        }
    }
});


/**
 * @class ShortcutList: This is the element that shows the app as a list.
 * @extends ShortcutBoxBase
 *
 * @param {MenuMediator} mediator A mediator instance.
 *
 *
 * @author AxP
 * @version 1.0
 */
const ShortcutList = new Lang.Class({

    Name: 'Gnomenu.shortcutArea.ShortcutList',
    Extends: ShortcutBoxBase,


    _init: function(mediator) {
        this.parent(mediator);
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

    /**
     * @description Adds a button to the list.
     * @param {Enum} categoryID The id of the category.
     * @param {Launchable} launchable This provides app, name and icon.
     * @param {Boolean} isAppCategory Dynamic category? ie not from you created.
     * @public
     * @function
     */
    addCategoryButton: function(categoryID, launchable, isAppCategory) {
        if (!categoryID || !launchable) {
            Log.logWarning("GnoMenu.shortcutArea.ShortcutList", "addCategoryButton", "categoryID or launchable is null!");
            return;
        }

        // Gets the correct map.
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

        let iconSize = this._mediator.getMenuSettings().getAppListIconsize();
        map[categoryID].push(new DraggableListButton(this._mediator, iconSize, launchable));
    },

    /**
     * @description Shows a category.
     * @param {Enum} categoryID The id of the category.
     * @param {Boolean} isAppCategory Dynamic category? ie not from you created.
     * @returns {Boolean}
     * @public
     * @function
     */
    showCategory: function(categoryID, isAppCategory) {
        let buttonMap = null;
        if (isAppCategory) {
            buttonMap = this._appCategoryButtonMap[categoryID];
        } else {
            buttonMap = this._categoryButtonMap[categoryID];
        }

        if (!buttonMap) {
            return false;
        }

        // This is needed for the keyboard controls.
        this._selectedButtonMap = buttonMap;
        this._selectedButtonIdx = 0;

        this.clear();

        for each (let btn in buttonMap) {
            this.actor.add_actor(btn.actor);
        }

        return true;
    },
});


/**
 * @class ShortcutGrid: This is the element that shows the app in a grid.
 * @extends ShortcutBoxBase
 *
 * @param {MenuMediator} mediator A mediator instance.
 *
 *
 * @author AxP
 * @version 1.0
 */
const ShortcutGrid = new Lang.Class({

    Name: 'Gnomenu.shortcutArea.ShortcutGrid',
    Extends: ShortcutBoxBase,


    _init: function(mediator) {
        this.parent(mediator);
        
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

    /**
     * @description Adds a button to the final frontier.
     * @param {Enum} categoryID The id of the category.
     * @param {Launchable} launchable This provides app, name and icon.
     * @param {Boolean} isAppCategory Dynamic category? ie not from you created.
     * @public
     * @function
     */
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

        let iconSize = this._mediator.getMenuSettings().getAppGridIconsize();
        map[categoryID].push(new DraggableGridButton(this._mediator, iconSize, launchable));
    },

    /**
     * @description Shows a category.
     * @param {Enum} categoryID The id of the category.
     * @param {Boolean} isAppCategory Dynamic category? ie not from you created.
     * @returns {Boolean}
     * @public
     * @function
     */
    showCategory: function(categoryID, isAppCategory) {
        let buttonMap = null;
        if (isAppCategory) {
            buttonMap = this._appCategoryButtonMap[categoryID];
        } else {
            buttonMap = this._categoryButtonMap[categoryID];
        }

        if (!buttonMap) {
            return false;
        }

        // This is needed for the keyboard controls.
        this._selectedButtonMap = buttonMap;
        this._selectedButtonIdx = 0;

        this.clear();

        let count = 0;
        let colMax = this._mediator.getMenuSettings().getAppGridColumnCount();
        for each (let btn in buttonMap) {
            // I hope you know modulo.
            let rowTmp = parseInt(count / colMax);
            let colTmp = count % colMax;
            this.actor.add(btn.actor, { row: rowTmp, col: colTmp });
            count ++;
        }

        return true;
    },
});


/**
 * @class ShortcutArea: This component displays the apps in a list or a grid.
 * @extends Component
 *
 * @param {MenuModel} model A model instance.
 * @param {MenuMediator} mediator A mediator instance.
 *
 *
 * @author AxP
 * @version 1.0
 */
const ShortcutArea = new Lang.Class({

    Name: 'Gnomenu.shortcutArea.ShortcutArea',
    Extends: Component,


    _init: function(model, mediator) {
        this.parent(model, mediator);

        this._mainBox = new St.BoxLayout({ style_class: 'gnomenu-applications-box' });

        this.actor = new St.ScrollView({ x_fill: true, y_fill: false, y_align: St.Align.START, style_class: 'vfade gnomenu-applications-scrollbox' });
        this.actor.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
        this.actor.set_mouse_scrolling(true);
        this.actor.add_actor(this._mainBox);

        this._shortcutList = new ShortcutList(mediator);
        this._shortcutGrid = new ShortcutGrid(mediator);
        this._mainBox.add(this._shortcutList.actor, { expand: true, x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.START });
        this._mainBox.add(this._shortcutGrid.actor, { expand: true, x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.START });

        this._shownCategory = { id: null, isAppCategory: null };

        this._updateTimeoutIds = {};
        this._updateTimeoutIds[EEventType.DATA_APPS_EVENT] = 0;
        this._updateTimeoutIds[EEventType.DATA_MOSTUSED_EVENT] = 0;
        this._updateTimeoutIds[EEventType.DATA_FAVORITES_EVENT] = 0;
        this._updateTimeoutIds[EEventType.DATA_RECENTFILES_EVENT] = 0;
        this._updateTimeoutIds[EEventType.DATA_PLACES_EVENT] = 0;
        this._updateTimeoutIds[EEventType.DATA_DEVICES_EVENT] = 0;
        this._updateTimeoutIds[EEventType.DATA_NETDEVICES_EVENT] = 0;
        this._updateTimeoutIds[EEventType.DATA_BOOKMARKS_EVENT] = 0;

        this.refresh();
    },

    /**
     * @description Refreshs the component.
     * @public
     * @function
     */
    refresh: function() {
        this.updateCategory();
        this.showCategory(this.menuSettings.getDefaultShortcutAreaCategory());
        this.setViewMode(this.menuSettings.getShortcutAreaViewMode());
    },

    /**
     * @description Use this function to remove all actors from the component.
     *              Not implemented for this class.
     * @public
     * @function
     */
    clear: function() {
        /*
         * It is not intended to refresh the component so why clear it.
         */
        Log.logWarning("Gnomenu.shortcutArea.ShortcutArea", "clear", "This is not useful!");
    },

    /**
     * @description Destroys the component.
     * @public
     * @function
     */
    destroy: function() {
        for each (let id in this._updateTimeoutIds) {
            if (id > 0) {
                Mainloop.source_remove(id);
            }
        }

        this._shortcutList.destroy();
        this._shortcutGrid.destroy();

        this.actor.destroy();
    },

    updateCategory: function(categoryDataEvent) {
        let event = categoryDataEvent;
        
        // I want that everything is updated if the event is null.
        if (!event) {
            this.updateCategory({ type: EEventType.DATA_APPS_EVENT });
            this.updateCategory({ type: EEventType.DATA_MOSTUSED_EVENT });
            this.updateCategory({ type: EEventType.DATA_FAVORITES_EVENT });
            this.updateCategory({ type: EEventType.DATA_RECENTFILES_EVENT });
            this.updateCategory({ type: EEventType.DATA_PLACES_EVENT });
            this.updateCategory({ type: EEventType.DATA_DEVICES_EVENT });
            this.updateCategory({ type: EEventType.DATA_NETDEVICES_EVENT });
            this.updateCategory({ type: EEventType.DATA_BOOKMARKS_EVENT });
            return;
        }

        // There may be a frequent succession of events of one type and
        // i dont this to take too much time.
        if (this._updateTimeoutIds[event.type] > 0) {
            Mainloop.source_remove(this._updateTimeoutIds[event.type]);
            this._updateTimeoutIds[event.type] = 0;
        }

        // For everything here its the same procedure. Create a timeout in which
        // the categories of both view types are refreshed. This means the old
        // stuff gets deleted and then it creates new buttons.
        const TIMEOUT = 100;
        switch (event.type) {

            case EEventType.DATA_APPS_EVENT:
                this._updateTimeoutIds[event.type] = Mainloop.timeout_add(TIMEOUT, Lang.bind(this, function () {

                    this._updateHelperForStaticCategories(ECategoryID.ALL_APPS, this.model.getAllApplications());

                    // Thats the dynamic category stuff.
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

            case EEventType.DATA_MOSTUSED_EVENT:
                this._updateTimeoutIds[event.type] = Mainloop.timeout_add(TIMEOUT, Lang.bind(this, function () {

                    this._updateHelperForStaticCategories(ECategoryID.MOST_USED, this.model.getMostUsedApps());
                    this._updateTimeoutIds[event.type] = 0;
                    return false;
                }));
                break;

            case EEventType.DATA_FAVORITES_EVENT:
                this._updateTimeoutIds[event.type] = Mainloop.timeout_add(TIMEOUT, Lang.bind(this, function () {

                    this._updateHelperForStaticCategories(ECategoryID.FAVORITES, this.model.getFavoriteApps());
                    this._updateTimeoutIds[event.type] = 0;
                    return false;
                }));
                break;

            case EEventType.DATA_RECENTFILES_EVENT:
                this._updateTimeoutIds[event.type] = Mainloop.timeout_add(TIMEOUT, Lang.bind(this, function () {

                    this._updateHelperForStaticCategories(ECategoryID.RECENTFILES, this.model.getRecentFiles());
                    this._updateTimeoutIds[event.type] = 0;
                    return false;
                }));
                break;

            case EEventType.DATA_PLACES_EVENT:
                this._updateTimeoutIds[event.type] = Mainloop.timeout_add(TIMEOUT, Lang.bind(this, function () {

                    this._updateHelperForStaticCategories(ECategoryID.PLACES, this.model.getPlaces());
                    this._updateTimeoutIds[event.type] = 0;
                    return false;
                }));
                break;

            case EEventType.DATA_DEVICES_EVENT:
                this._updateTimeoutIds[event.type] = Mainloop.timeout_add(TIMEOUT, Lang.bind(this, function () {

                    this._updateHelperForStaticCategories(ECategoryID.DEVICES, this.model.getDevices());
                    this._updateTimeoutIds[event.type] = 0;
                    return false;
                }));
                break;

            case EEventType.DATA_NETDEVICES_EVENT:
                this._updateTimeoutIds[event.type] = Mainloop.timeout_add(TIMEOUT, Lang.bind(this, function () {

                    this._updateHelperForStaticCategories(ECategoryID.NETDEVICES, this.model.getNetworkDevices());
                    this._updateTimeoutIds[event.type] = 0;
                    return false;
                }));
                break;

            case EEventType.DATA_BOOKMARKS_EVENT:
                this._updateTimeoutIds[event.type] = Mainloop.timeout_add(TIMEOUT, Lang.bind(this, function () {

                    this._updateHelperForStaticCategories(ECategoryID.BOOKMARKS, this.model.getBookmarks());
                    this._updateTimeoutIds[event.type] = 0;
                    return false;
                }));
                break;

        }
    },

    /** Only a helper method. Dont call. @private */
    _updateHelperForStaticCategories: function(categoryID, dataMap) {
        this._shortcutList.clearCategoryStorage(categoryID);
        this._shortcutGrid.clearCategoryStorage(categoryID);

        for each (let item in dataMap) {
            this._shortcutList.addCategoryButton(categoryID, item);
            this._shortcutGrid.addCategoryButton(categoryID, item);
        }

        if (this._shownCategory.id == categoryID) {
            this._shortcutList.refresh(this._shownCategory);
            this._shortcutGrid.refresh(this._shownCategory);
        }
    },

    /**
     * @description Sets the viewmode of the component.
     * @param {Enum} id
     * @public
     * @function
     */
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

    /**
     * @description Shows a specific category.
     * @param {Enum} categoryID
     * @public
     * @function
     */
    showCategory: function(categoryID) {
        if (!categoryID) {
            Log.logError("GnoMenu.shortcutArea.ShortcutArea", "showCategory", "categoryID is null!");
        }

        // This is needed to devide static and dynamic categories.
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
        // It determines if the category is one of the above.
        let isAppCategory = true;
        for each (let cat in customCats) {
            if (cat == categoryID) {
                isAppCategory = false;
                break;
            }
        }

        this._shortcutList.showCategory(categoryID, isAppCategory);
        this._shortcutGrid.showCategory(categoryID, isAppCategory);

        // Save the data for refreshs and the kind.
        this._shownCategory = { id: categoryID, isAppCategory: isAppCategory };
    },
});
