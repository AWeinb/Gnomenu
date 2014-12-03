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
const St = imports.gi.St;

const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu.PopupMenu;
const PopupMenuSection = imports.ui.popupMenu.PopupMenuSection;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;
const MenuModel = Me.imports.scripts.menu.menuModel.MenuModel;
const MenuModelObserver = Me.imports.scripts.menu.menuModel.ModelObserver;
const MenuMediator = Me.imports.scripts.menu.menuMediator.MenuMediator;
const MenuSearch = Me.imports.scripts.menu.menuSearch.MenuSearch;

const CategoryPane = Me.imports.scripts.menu.components.categoryPane.CategoryPane;
const ViewModePane = Me.imports.scripts.menu.components.viewModePane.ViewModePane;
const SearchField = Me.imports.scripts.menu.components.searchField.SearchField;
const Sidebar = Me.imports.scripts.menu.components.sidebar.Sidebar;
const NavigationArea = Me.imports.scripts.menu.components.navigationArea.NavigationArea;
const MainArea = Me.imports.scripts.menu.components.mainArea.MainArea;
const ControlPane = Me.imports.scripts.menu.components.controlPane.ControlPane;
const DescriptionBox = Me.imports.scripts.menu.components.descriptionBox.DescriptionBox;
const PreferencesButton = Me.imports.scripts.menu.components.preferencesButton.PreferencesButton;



/**
 * @class Menu
 * @extends PopupMenu
 *
 * @classdesc This class creates all components of the menu. It is a popupmenu
 *            and can be integrated into a menubutton. This class controls
 *            not much of the menu but creates every component and connects
 *            them. You should see the methods of the parent class for some
 *            useful methods and functions.
 *
 * @description The sourceActor can be the menubutton actor that opens this menu.
 *              The settings are an instance of the gsettings. You must provide
 *              non-null instances.
 *
 *
 * @param {Clutter.Actor} sourceActor The button that triggers the menu.
 * @param {Settings} settings A gsettings instance.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const Menu = new Lang.Class({

    Name: 'Gnomenu.Menu',
    Extends: PopupMenu,


    _init: function(sourceActor, settings) {
        if (!sourceActor || !settings) {
            Log.logError("Gnomenu.Menu", "_init", "sourceActor or settings is null!");
        }
        this.parent(sourceActor, 0.0, St.Align.START);
        Main.panel.menuManager.addMenu(this);

        // Everything is put inside of this section.
        this._section = new PopupMenuSection();
        this.addMenuItem(this._section);

        // The menu is a model-view-controller architecture with an additional mediator.
        // The mediator is usefull to handle some direct connections.
        this._model = new MenuModel();
        this._modelObserver = this._model.getObserver();
        this._mediator = new MenuMediator(this, settings);

        // This sets up the search. To change the providers modify the MenuSearch.
        this._menuSearch = new MenuSearch();
        this._model.setSearchSystem(this._menuSearch.getSearchSystem());
        this._mediator.setSearchSystem(this._menuSearch.getSearchSystem());

        // I want to know when the menu is closed and opened.
        this._onOpenStateId = this._section.connect('open-state-changed', Lang.bind(this, function() {
            if (this.isOpen) {
                this._mediator.notifyMenuOpened();
               
            } else {
                this._mediator.notifyMenuClosed();
            }
            return true;
        }));
        // The key presses are used to implement a keyboard control.
        this._keyPressID = this.actor.connect('key_press_event', Lang.bind(this, this._handleKeyboardEvents));

        this._create();
        this._initMenu();
    },

    /**
     * @description Destroys the menu. The destroy method of all components is
     *              called. Also all data provider all destroyed and all
     *              connections closed.
     * @function
     * @memberOf Menu#
     */
    destroy: function() {
        if (this._onOpenStateId > 0) {
            this._section.disconnect(this._onOpenStateId);
            this._onOpenStateId = undefined;
        }

        if (this._keyPressID > 0) {
            this.actor.disconnect(this._keyPressID);
            this._keyPressID = undefined;
        }

        if (this._fixLoop) {
            Mainloop.source_remove(this._fixLoop);
        }

        this._categoryPane.destroy();
        this._viewModePane.destroy();
        this._searchField.destroy();
        this._sidebar.destroy();
        this._navigationArea.destroy();
        this._mainArea.destroy();
        this._controlPane.destroy();
        this._descriptionBox.destroy();
        this._extensionPrefButton.destroy();

        this._model.destroy();
        this._modelObserver.destroy();
        this._mediator.destroy();
        this._menuSearch.destroy();

        this._section.destroy();

        this._categoryPane = undefined;
        this._viewModePane = undefined;
        this._searchField = undefined;
        this._sidebar = undefined;
        this._navigationArea = undefined;
        this._mainArea = undefined;
        this._controlPane = undefined;
        this._descriptionBox = undefined;
        this._extensionPrefButton = undefined;

        this._model = undefined;
        this._menuSearch = undefined;

        this._section = undefined;

        this.removeAll();
    },

    /**
     * @description This creates the menu components and adds them to the section.
     * @private
     * @function
     * @memberOf Menu#
     */
    _create: function() {
        // mainbox holds the topPane and bottomPane
        let mainBox = new St.BoxLayout({ style_class: 'gnomenu-menu-box', vertical: true });

        // Top pane holds user group, view mode, and search (packed horizonally)
        let topPane = new St.BoxLayout({ style_class: 'gnomenu-menu-topPane' });
        // Middle pane holds shortcuts, categories/places/power, applications, workspaces (packed horizontally)
        let middlePane = new St.BoxLayout({ style_class: 'gnomenu-menu-middlePane' });
        // Bottom pane holds power group and selected app description (packed horizontally)
        let bottomPane = new St.BoxLayout({ style_class: 'gnomenu-menu-bottomPane' });

        this._categoryPane = new CategoryPane(this._model, this._mediator);
        this._viewModePane = new ViewModePane(this._model, this._mediator);
        this._searchField = new SearchField(this._model, this._mediator);

        this._sidebar = new Sidebar(this._model, this._mediator);
        this._navigationArea = new NavigationArea(this._model, this._mediator);
        this._mainArea = new MainArea(this._model, this._mediator);

        this._controlPane = new ControlPane(this._model, this._mediator);
        this._descriptionBox = new DescriptionBox(this._model, this._mediator);
        this._extensionPrefButton = new PreferencesButton(this._model, this._mediator);

        // There are some placeholder items to prevent the components from scaling and to get free space.
        topPane.add(this._categoryPane.actor);
        topPane.add(new St.Label({ text: '' }), { expand: true, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
        topPane.add(this._viewModePane.actor);
        topPane.add(new St.Label({ text: '' }), { expand: true, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
        topPane.add(this._searchField.actor,    { expand: true, x_align: St.Align.END, y_align: St.Align.MIDDLE });

        middlePane.add(this._sidebar.actor,        { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.START });
        middlePane.add(this._navigationArea.actor, { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.START });
        middlePane.add(this._mainArea.actor,       { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.START });

        bottomPane.add(this._controlPane.actor,         { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE });
        bottomPane.add(this._descriptionBox.actor,      { x_fill: true, y_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE, expand: true });
        bottomPane.add(this._extensionPrefButton.actor, { x_fill: false, y_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE });

        mainBox.add(topPane,    { x_fill: true, y_fill: false });
        mainBox.add(middlePane, { x_fill: true, y_fill: true });
        mainBox.add(bottomPane, { x_fill: true, y_fill: false });

        this._section.actor.add(mainBox);

        // The fix function needs the width and height of the elements. But accessing them before the data is set is
        // a bad idea. You get a lot gtk "There is no blah with name" errors when you try it.
        this._mainAreaAllocationID = this._mainArea.actor.connect('notify::allocation', Lang.bind(this, this._fixElements));
    },

    /**
     * @description Fixes the height and width of the elements.
     * @private
     * @function
     * @memberOf Menu#
     */
    _fixElements: function() {
        let menuSettings = this._mediator.getMenuSettings();

        // Disconnect the allocation callback.
        if (this._mainAreaAllocationID) {
            this._mainArea.actor.disconnect(this._mainAreaAllocationID);
            this._mainAreaAllocationID = undefined;
        }

        // To be sure i wait again some time to prevent errors.
        this._fixLoop = Mainloop.timeout_add(200, Lang.bind(this, function() {

            // This fixes the height.
            let height = this._navigationArea.actor.height;
            this._sidebar.actor.height = height;
            this._mainArea.actor.height = height;

            // This info is needed for later width changes.
            if (!this._categoryPane.min_width) this._categoryPane.min_width = this._categoryPane.actor.width;
            if (!this._navigationArea.min_width) this._navigationArea.min_width = this._navigationArea.actor.width;
            if (!this._controlPane.min_width) this._controlPane.min_width = this._controlPane.actor.width;

            // This fits all left elements to one width.
            let sidebarWidth = 0;
            if (menuSettings.isSidebarVisible()) {
                sidebarWidth = this._sidebar.actor.width;
            }
            let maxWidth = Math.max(this._categoryPane.actor.width, (this._navigationArea.actor.width + sidebarWidth), this._controlPane.actor.width);
            if (maxWidth > 0) {
                this._categoryPane.actor.width = maxWidth;
                this._navigationArea.actor.width = maxWidth - sidebarWidth;
                this._controlPane.actor.width = maxWidth;
            }
        }));
    },

    /**
     * @description This sets up the model and mediator stuff for the components.
     * @private
     * @function
     * @memberOf Menu#
     */
    _initMenu: function() {
        // The model sends messages to this components if it changes.
        this._modelObserver.registerUpdateable(this._sidebar);
        this._modelObserver.registerUpdateable(this._navigationArea);
        this._modelObserver.registerUpdateable(this._mainArea);

        this._mediator.setCategoryPane(this._categoryPane);
        this._mediator.setViewModePane(this._viewModePane);
        this._mediator.setSearchField(this._searchField);
        this._mediator.setSidebar(this._sidebar);
        this._mediator.setNavigationArea(this._navigationArea);
        this._mediator.setMainArea(this._mainArea);
        this._mediator.setControlPane(this._controlPane);
        this._mediator.setDescriptionBox(this._descriptionBox);
        this._mediator.setExtensionPrefButton(this._extensionPrefButton);

        this._registerSettingCallbacks();

        this._mediator.resetKeyFocus();
        this._mediator.stopSearch();
    },

    /**
     * @description This connects the elements with the settings. Not every
     *              is handleable here.
     * @private
     * @function
     * @memberOf Menu#
     */
    _registerSettingCallbacks: function() {
        let menuSettings = this._mediator.getMenuSettings();

        // The visbility of the sidebar. This effects also the width of the left side.
        menuSettings.registerSidebarVisibleCB(Lang.bind(this, function(event) {
            this._categoryPane.actor.width = this._categoryPane.min_width;
            this._navigationArea.actor.width = this._navigationArea.min_width;
            this._controlPane.actor.width = this._controlPane.min_width;

            this._sidebar.refresh();

            this._fixElements();
            return true;
        }));

        // The apps of the sidebar.
        menuSettings.registerSidebarCategoryCB(Lang.bind(this, function(event) {
            this._sidebar.refresh();
            this._categoryPane.refresh();
            return true;
        }));

        // The iconsize of the sidebar buttons.
        menuSettings.registerSidebarIconsizeCB(Lang.bind(this, function(event) {
            this._categoryPane.actor.width = this._categoryPane.min_width;
            this._navigationArea.actor.width = this._navigationArea.min_width;
            this._controlPane.actor.width = this._controlPane.min_width;

            this._sidebar.refresh();

            this._fixElements();
            return true;
        }));

        // Here are some more setting callbacks. They affect the categories and apps.
        menuSettings.registerDefaultShortcutAreaCategoryCB(Lang.bind(this, function(event) {
            this._navigationArea.refresh();
            this._mediator.selectMenuCategory(menuSettings.getDefaultShortcutAreaCategory());
            return true;
        }));

        menuSettings.registerMainAreaViewModeCB(Lang.bind(this, function(event) {
            this._mediator.setViewMode(menuSettings.getMainAreaViewMode(), true);
            return true;
        }));

        menuSettings.registerCategorySelectionMethodCB(Lang.bind(this, function(event) {
            this._navigationArea.refresh();
            return true;
        }));

        menuSettings.registerAppListIconsizeCB(Lang.bind(this, function(event) {
            this._mainArea.refresh();
            return true;
        }));

        menuSettings.registerAppGridIconsizeCB(Lang.bind(this, function(event) {
            this._mainArea.refresh();
            return true;
        }));

        // Maximum of apps shown as search result.
        menuSettings.registerMaxSearchResultCountCB(Lang.bind(this, function(event) {
            this._mainArea.refresh();
            return true;
        }));
    },

    /**
     * @description Handles the keyboard events.
     * @private
     * @function
     * @memberOf Menu#
     */
    _handleKeyboardEvents: function(actor, event) {
        // Actually the mediator handles it.
        this._mediator._onKeyboardEvent(actor, event);
        return true;
    },
});
