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
 * @class ShortcutBoxBase
 *
 * @classdesc This is the base class for all shortcut boxes. It
 *            provides the basic methods that every box probably
 *            needs. It defines the basic structures and also
 *            implements big parts of the keyboard controls.
 *
 * @description Creates basic functions which are useful for every kind of box.
 *              It does not create an actor.
 *
 *
 * @param {MenuMediator} mediator A mediator instance.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const ShortcutBoxBase = new Lang.Class({

    Name: 'Gnomenu.shortcutArea.ShortcutBoxBase',


    _init: function(mediator) {
        if (!mediator) {
            Log.logError("GnoMenu.shortcutArea.ShortcutBoxBase", "_init", "mediator may not be null!");
        }
        this._mediator = mediator;

        // This map is used for the static categories
        this._categoryButtonMap = {};
        // while this is used for the generic ones. The reason to use two is
        // that its this way easier to update the real categories.
        this._appCategoryButtonMap = {};

        this._selectedButtonMap = null;
        this._selectedButtonIdx = -1;
    },

    /**
     * @description Abstract method to add a new button.
     *
     *              To be implemented.
     * @param {StringEnum} categoryID
     * @param {Launchable} launchable
     * @param {Boolean} isAppCategory
     * @function
     * @memberOf ShortcutBoxBase#
     */
    addCategoryButton: function(categoryID, launchable, isAppCategory) {
        Log.logError("GnoMenu.shortcutArea.ShortcutBoxBase", "addCategoryButton", "Implement me!");
    },

    /**
     * @description Deletes all buttons of the specified category from the storage.
     * @param {StringEnum} categoryID
     * @param {Boolean} isAppCategory
     * @function
     * @memberOf ShortcutBoxBase#
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
     * @description Refreshes the component and shows the last shown category
     *              again.
     * @param {Object} shownCategory Has id and isAppCategory entries.
     * @function
     * @memberOf ShortcutBoxBase#
     */
    refresh: function(shownCategory) {
        this.clear();

        // The parameter should only be used intern. It provides the shown category.
        if (shownCategory) {
            this.showCategory(shownCategory.id, shownCategory.isAppCategory);
            let btn = this.getSelectedButton();
            if (btn) btn.select();
        }
    },

    /**
     * @description Clears the elements from the component.
     * @function
     * @memberOf ShortcutBoxBase#
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
     * @function
     * @memberOf ShortcutBoxBase#
     */
    hide: function() {
        if (this.actor) {
            this.actor.hide();
        }

        this._selectedButtonIdx = -1;
    },

    /**
     * @description Shows the component.
     * @function
     * @memberOf ShortcutBoxBase#
     */
    show: function() {
        if (this.actor) {
            this.actor.show();
        }

        this._selectedButtonIdx = -1;
    },

    /**
     * @description Determines wether the component is visible.
     * @returns {Boolean} Is the element visible?
     * @function
     * @memberOf ShortcutBoxBase#
     */
    isVisible: function() {
        if (this.actor) {
            return this.actor.visible;
        }
        return false;
    },

    /**
     * @description Hides or shows the component.
     * @function
     * @memberOf ShortcutBoxBase#
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
     * @description This method selects the first button in the box.
     * @function
     * @memberOf ShortcutBoxBase#
     */
    selectFirst: function() {
        if (!this._selectedButtonMap) {
            return;
        }
        this.deselectAll();

        // I am only working with the indices so i need to translate them back first.
        let keys = Object.keys(this._selectedButtonMap);
        this._selectedButtonIdx = 0;
        let buttonID = keys[this._selectedButtonIdx];
        let btn = this._selectedButtonMap[buttonID];
        if (btn) btn.select();
    },

    /**
     * @description This method selects the last button in the box.
     * @function
     * @memberOf ShortcutBoxBase#
     */
    selectLast: function() {
        if (!this._selectedButtonMap) {
            return;
        }
        this.deselectAll();

        let keys = Object.keys(this._selectedButtonMap);
        this._selectedButtonIdx = keys.length - 1;
        let buttonID = keys[this._selectedButtonIdx];
        let btn = this._selectedButtonMap[buttonID];
        if (btn) btn.select();
    },

    /**
     * @description This method selects the button above the selected one.
     * @function
     * @memberOf ShortcutBoxBase#
     */
    selectUpper: function() {
        if (!this._selectedButtonMap) {
            return;
        }

        this.deselectLastSelectedButton();

        let colMax = this._mediator.getMenuSettings().getAppGridColumnCount();
        let keys = Object.keys(this._selectedButtonMap);
        this._selectedButtonIdx -= colMax;
        if (this._selectedButtonIdx < 0) {
            // I swear to BigMac I had something simpler the day before ...
            this._selectedButtonIdx = keys.length - (keys.length % colMax) + this._selectedButtonIdx - 1;
            if (this._selectedButtonIdx + colMax < keys.length) {
                this._selectedButtonIdx = this._selectedButtonIdx + colMax
            }
        }

        let buttonID = keys[this._selectedButtonIdx];
        let btn = this._selectedButtonMap[buttonID];
        if (btn) btn.select();
    },

    /**
     * @description This method selects the button under the selected one.
     * @function
     * @memberOf ShortcutBoxBase#
     */
    selectLower: function() {
        if (!this._selectedButtonMap) {
            return;
        }

        this.deselectLastSelectedButton();

        let colMax = this._mediator.getMenuSettings().getAppGridColumnCount();
        let keys = Object.keys(this._selectedButtonMap);
        this._selectedButtonIdx += colMax;
        if (this._selectedButtonIdx >= keys.length) {
            this._selectedButtonIdx = (this._selectedButtonIdx + 1) % colMax;
        }

        let buttonID = keys[this._selectedButtonIdx];
        let btn = this._selectedButtonMap[buttonID];
        if (btn) btn.select();
    },

    /**
     * @description This method selects the next button in the box.
     * @function
     * @memberOf ShortcutBoxBase#
     */
    selectNext: function() {
        if (!this._selectedButtonMap) {
            return;
        }
        this.deselectLastSelectedButton();

        let keys = Object.keys(this._selectedButtonMap);
        this._selectedButtonIdx = (this._selectedButtonIdx + 1) % keys.length;
        let buttonID = keys[this._selectedButtonIdx];
        let btn = this._selectedButtonMap[buttonID];
        if (btn) btn.select();

    },

    /**
     * @description This method selects the previous button in the box.
     * @function
     * @memberOf ShortcutBoxBase#
     */
    selectPrevious: function() {
        if (!this._selectedButtonMap) {
            return;
        }
        this.deselectLastSelectedButton();

        let keys = Object.keys(this._selectedButtonMap);
        this._selectedButtonIdx -= 1;
         if (this._selectedButtonIdx < 0) {
            this._selectedButtonIdx = keys.length - 1;
        }
        let buttonID = keys[this._selectedButtonIdx];
        let btn = this._selectedButtonMap[buttonID];
        if (btn) btn.select();
    },

    /**
     * @description This method deselects the last selected button.
     * @function
     * @memberOf ShortcutBoxBase#
     */
    deselectLastSelectedButton: function() {
        if (!this._selectedButtonMap) {
            return;
        }

        if (this._selectedButtonIdx != -1) {
            let keys = Object.keys(this._selectedButtonMap);
            let buttonID = keys[this._selectedButtonIdx];
            let lastBtn = this._selectedButtonMap[buttonID];
            if (lastBtn) lastBtn.deselect();
        }
    },

    /**
     * @description This method deselects all buttons.
     * @function
     * @memberOf ShortcutBoxBase#
     */
    deselectAll: function() {
        if (!this._selectedButtonMap) {
            return;
        }

        for each (let btn in this._selectedButtonMap) {
            if (btn) {
                btn.deselect();
            }
        }

        this._selectedButtonIdx = -1;
    },

    /**
     * @description This method activates the currently selected button.
     * @param {IntegerEnum} button
     * @param {Object} params
     * @function
     * @memberOf ShortcutBoxBase#
     */
    activateSelected: function(button, params) {
        let btn = this.getSelectedButton();
        if (btn) {
            btn.activate(button, params);
        }
    },

    /**
     * @description Returns the selected button object. Needed to fix mouse scroll.
     * @function
     * @memberOf ShortcutBoxBase#
     */
    getSelectedButton: function() {
        if (!this._selectedButtonMap) {
            return null;
        }

        let btn = null;
        if (this._selectedButtonIdx != -1) {
            let keys = Object.keys(this._selectedButtonMap);
            let buttonID = keys[this._selectedButtonIdx];
            btn = this._selectedButtonMap[buttonID];
        }
        return btn;
    },

    /**
     * @description Destroys the component.
     * @function
     * @memberOf ShortcutBoxBase#
     */
    destroy: function() {
        if (this.actor) {
            this.actor.destroy();
        }
    },

    /**
     * @description Removes unneeded effects like the hover style.
     * @function
     * @memberof ShortcutBoxBase#
     */
    clean: function() {
        if (!this._selectedButtonMap) {
            return;
        }

        for each (let btn in this._selectedButtonMap) {
            btn.clean();
        }
    },
});



/**
 * @class ShortcutList
 * @extends ShortcutBoxBase
 *
 * @classdesc The shortcutList class creates the normal applist
 *            view. It is a normal boxlayout that can be fitted into
 *            a scrollview. There is functionallity to add buttons
 *            and to show specific categories. You should also
 *            see the methods of the parent class. There are some
 *            important parts of the keyboard controls.
 *
 * @description Creates the actor for this component.
 *
 *
 * @param {MenuMediator} mediator A mediator instance.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const ShortcutList = new Lang.Class({

    Name: 'Gnomenu.shortcutArea.ShortcutList',
    Extends: ShortcutBoxBase,


    _init: function(mediator) {
        this.parent(mediator);
        // Into this layout are the buttons coming.
        this.actor = new St.BoxLayout({ style_class: 'gnomenu-applications-list-box', vertical:true });
    },

    /**
     * @description Adds a button to the list. You need to provide an category
     *              id so the button can ordered correctly. Actually no parameter
     *              should be null.
     * @param {Enum} categoryID The id of the category.
     * @param {Launchable} launchable This provides app, name and icon.
     * @param {Boolean} isAppCategory Dynamic category? ie not from you created.
     * @function
     * @memberOf ShortcutList#
     */
    addCategoryButton: function(categoryID, launchable, isAppCategory) {
        if (!categoryID || !launchable) {
            Log.logWarning("GnoMenu.shortcutArea.ShortcutList", "addCategoryButton", "categoryID or launchable is null!");
            return;
        }

        // Gets the correct map. The buttons of the non-fixed, non-hardcoded
        // categories come into the appCategory map.
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

        // Thats it. Just create the button and store it.
        let iconSize = this._mediator.getMenuSettings().getAppListIconsize();
        map[categoryID].push(new DraggableListButton(this._mediator, iconSize, launchable));
    },

    /**
     * @description Shows a category. Same as in the addButton method the parameter
     *              shouldn't be null.
     * @param {Enum} categoryID The id of the category.
     * @param {Boolean} isAppCategory Dynamic category? ie not from you created.
     * @returns {Boolean}
     * @function
     * @memberOf ShortcutList#
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

        // Remove all stuff ..
        this.clear();
        // And add new.
        for each (let btn in buttonMap) {
            this.actor.add_actor(btn.actor);
        }

        return true;
    },
});



/**
 * @class ShortcutGrid
 * @extends ShortcutBoxBase
 *
 * @classdesc This is class that provides the shortcut grid of the
 *            menu. It is similar to the list but needs another button
 *            class and another add schema. The method calls here are
 *            the same as the ones of the list.
 *
 * @description Creates the actor for this component.
 *
 *
 * @param {MenuMediator} mediator A mediator instance.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const ShortcutGrid = new Lang.Class({

    Name: 'Gnomenu.shortcutArea.ShortcutGrid',
    Extends: ShortcutBoxBase,


    _init: function(mediator) {
        this.parent(mediator);
        // This table can be added to Scrollview without problems.
        this.actor = new St.Table({ homogeneous: false, reactive: true, style_class: 'gnomenu-applications-grid-box' });
    },

    /**
     * @description Adds a button to the final frontier. Please see the
     *              corresponding method of the list class above.
     * @param {Enum} categoryID The id of the category.
     * @param {Launchable} launchable This provides app, name and icon.
     * @param {Boolean} isAppCategory Dynamic category? ie not from you created.
     * @function
     * @memberOf ShortcutGrid#
     */
    addCategoryButton: function(categoryID, launchable, isAppCategory) {
        if (!categoryID || !launchable) {
            Log.logWarning("GnoMenu.shortcutArea.ShortcutGrid", "addCategoryButton", "categoryID or launchable is null!");
            return;
        }

        // The hard-coded categories have another map.
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

        // Here im creating a grid button instead of a list button.
        let iconSize = this._mediator.getMenuSettings().getAppGridIconsize();
        map[categoryID].push(new DraggableGridButton(this._mediator, iconSize, launchable));
    },

    /**
     * @description Shows a category.
     * @param {Enum} categoryID The id of the category.
     * @param {Boolean} isAppCategory Dynamic category? ie not from you created.
     * @returns {Boolean}
     * @function
     * @memberOf ShortcutGrid#
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

        this.clear();

        // Adding is not difficult but needs some special handling to fill
        // the table correctly.
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
 * @class ShortcutArea
 * @extends Component
 *
 * @classdesc This component uses the list or gridview elements to
 *            create the part of the menu that shows the apps. This
 *            class automatically updates itself if the model was
 *            correctly provided. In that case the update events
 *            trigger an automatic update of the component. There
 *            are some methods implemented to control this component
 *            with the keyboard. Also it is simple to change the
 *            viewmode from list to grid and viseversa. It also
 *            should be no problem to add more viewmodes.
 *
 * @description Creates the boxes for every viewmode and puts them into
 *              a scrollview.
 *
 * @param {MenuModel} model A model instance.
 * @param {MenuMediator} mediator A mediator instance.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
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

        // All viewmode elements are just added to the actor.
        // Through the program it is then assured that only one is visible at a time.
        this._shortcutList = new ShortcutList(mediator);
        this._shortcutGrid = new ShortcutGrid(mediator);
        this._mainBox.add(this._shortcutList.actor, { expand: true, x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.START });
        this._mainBox.add(this._shortcutGrid.actor, { expand: true, x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.START });

        // The showncategory is stored for redraws.
        this._shownCategory = { id: null, isAppCategory: null };

        // The updates are handled after a little timeout.
        // That way it not that bad if some update event comes very often in a
        // short period. This here are the connect ids.
        this._updateTimeoutIds = {};
        this._updateTimeoutIds[EEventType.DATA_APPS_EVENT] = 0;
        this._updateTimeoutIds[EEventType.DATA_MOSTUSED_EVENT] = 0;
        this._updateTimeoutIds[EEventType.DATA_FAVORITES_EVENT] = 0;
        this._updateTimeoutIds[EEventType.DATA_RECENTFILES_EVENT] = 0;
        this._updateTimeoutIds[EEventType.DATA_PLACES_EVENT] = 0;
        this._updateTimeoutIds[EEventType.DATA_DEVICES_EVENT] = 0;
        this._updateTimeoutIds[EEventType.DATA_NETDEVICES_EVENT] = 0;
        this._updateTimeoutIds[EEventType.DATA_BOOKMARKS_EVENT] = 0;
    },

    /**
     * @description Refreshs the component and resets it to startup state.
     * @function
     * @memberOf ShortcutArea#
     */
    refresh: function() {
        this.updateCategory();
        this.showCategory(this.menuSettings.getDefaultShortcutAreaCategory());
    },

    /**
     * @description Use this function to remove all actors from the component.
     *              Not implemented for this class.
     * @function
     * @memberOf ShortcutArea#
     */
    clear: function() {
        // I dont know when it would help to remove the list and the grid.
        Log.logWarning("Gnomenu.shortcutArea.ShortcutArea", "clear", "This is not useful!");
    },

    /**
     * @description Destroys the component.
     * @function
     * @memberOf ShortcutArea#
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

    /**
     * @description Removes unneeded effects like the hover style.
     * @function
     * @memberof ShortcutArea#
     */
    clean: function() {
        if (this._shortcutList.isVisible()) {
            this._shortcutList.clean();
        } else {
            this._shortcutGrid.clean();
        }
    },

    /**
     * @description This method is called by the model observer. If the correct
     *              event type was sent it automatically updates the outdated
     *              parts.
     * @param {Object} event The event with an event.type
     * @function
     * @memberOf ShortcutArea#
     */
    updateCategory: function(event) {
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

                        // This is the only part here where this kind of categories
                        // are filled.
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

    /**
     * @description Only a helper method. Clears the specified storage, creates
     *              the updated buttons and refreshs the view.
     * @private
     * @memberOf ShortcutArea#
     */
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
     * @description Shows a specific category.
     * @param {StringEnum} categoryID
     * @function
     * @memberOf ShortcutArea#
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

        if (this._shortcutGrid.isVisible()) {
            this._shortcutGrid.showCategory(categoryID, isAppCategory);
        } else {
            this._shortcutList.showCategory(categoryID, isAppCategory);
        }

        // Save the data for refreshs and the kind.
        this._shownCategory = { id: categoryID, isAppCategory: isAppCategory };
    },

    /**
     * @description Sets the viewmode of the component.
     * @param {IntegerEnum} id
     * @function
     * @memberOf ShortcutArea#
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
                Log.logWarning("GnoMenu.shortcutArea.ShortcutArea", "setViewMode", "Unknown id!");
                break;
        }
    },

    /**
     * @description Selects the first button of the current view.
     * @function
     * @memberOf ShortcutArea#
     */
    selectFirst: function() {
        this._shortcutGrid.selectFirst();
        this._scrollToSelectedButton(this._shortcutGrid);
        this._shortcutList.selectFirst();
        this._scrollToSelectedButton(this._shortcutList);
    },

    /**
     * @description Selects the last button of the current view.
     * @function
     * @memberOf ShortcutArea#
     */
    selectLast: function() {
        this._shortcutGrid.selectLast();
        this._scrollToSelectedButton(this._shortcutGrid);
        this._shortcutList.selectLast();
        this._scrollToSelectedButton(this._shortcutList);
    },

    /**
     * @description Selects the button above the currently selected button in
     *              the current view.
     * @function
     * @memberOf ShortcutArea#
     */
    selectUpper: function() {
        if (this._shortcutGrid.isVisible()) {
            this._shortcutGrid.selectUpper();
            this._scrollToSelectedButton(this._shortcutGrid);
        } else {
            this._shortcutList.selectPrevious();
            this._scrollToSelectedButton(this._shortcutList);
        }
    },

    /**
     * @description Selects the button under the currently selected button in
     *              the current view.
     * @function
     * @memberOf ShortcutArea#
     */
    selectLower: function() {
        if (this._shortcutGrid.isVisible()) {
            this._shortcutGrid.selectLower();
            this._scrollToSelectedButton(this._shortcutGrid);
        } else {
            this._shortcutList.selectNext();
            this._scrollToSelectedButton(this._shortcutList);
        }
    },

    /**
     * @description Selects the button next to the currently selected button in
     *              the current view.
     * @function
     * @memberOf ShortcutArea#
     */
    selectNext: function() {
        if (this._shortcutGrid.isVisible()) {
            this._shortcutGrid.selectNext();
            this._scrollToSelectedButton(this._shortcutGrid);
        } else {
            this._shortcutList.selectLast();
            this._scrollToSelectedButton(this._shortcutList);
        }
    },

    /**
     * @description Selects the button before to the currently selected button in
     *              the current view.
     * @function
     * @memberOf ShortcutArea#
     */
    selectPrevious: function() {
        if (this._shortcutGrid.isVisible()) {
            this._shortcutGrid.selectPrevious();
            this._scrollToSelectedButton(this._shortcutGrid);
        } else {
            this._shortcutList.selectFirst();
            this._scrollToSelectedButton(this._shortcutList);
        }
    },

    /**
     * @description Deselects all buttons of both views and scrolls to the top.
     * @function
     * @memberOf ShortcutArea#
     */
    resetSelection: function() {
        this._shortcutGrid.selectFirst();
        this._shortcutList.selectFirst();
        this._scrollToSelectedButton(this._shortcutGrid);
        this._scrollToSelectedButton(this._shortcutList);
        this._shortcutGrid.deselectAll();
        this._shortcutList.deselectAll();
    },

    /**
     * @description Activates the currently selected button.
     * @param {Integer} button The mousebutton id or null.
     * @param {Object} params
     * @function
     * @memberOf ShortcutArea#
     */
    activateSelected: function(button, params) {
        if (this._shortcutGrid.isVisible()) {
            this._shortcutGrid.activateSelected(button, params);
        } else {
            this._shortcutList.activateSelected(button, params);
        }
    },

    /**
     * @description Helper to adjust the scroll state according to the selected
     *              button.
     * @param {BOX} activeView
     * @private
     * @function
     * @memberOf ShortcutArea#
     */
    _scrollToSelectedButton: function(activeView) {
        let vscroll = this.actor.get_vscroll_bar();
        let btn = activeView.getSelectedButton();
        if (!btn) {
            return;
        }
        let buttonBox = btn.actor.get_allocation_box();

        // This code adjusts the vertical scrollbar.
        let currentScrollValue = vscroll.get_adjustment().get_value();
        let boxHeight = this.actor.get_allocation_box().y2 - this.actor.get_allocation_box().y1;
        let newScrollValue = currentScrollValue;

        if (currentScrollValue > buttonBox.y1 - 20) {
            newScrollValue = buttonBox.y1 - 20;
        }
        if (boxHeight + currentScrollValue < buttonBox.y2 + 20) {
            newScrollValue = buttonBox.y2 - boxHeight + 20;
        }
        if (newScrollValue != currentScrollValue) {
            vscroll.get_adjustment().set_value(newScrollValue);
        }
    },
});
