
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


const Menu = new Lang.Class({

    Name: 'Gnomenu.Menu',
    Extends: PopupMenu,

    
    _init: function(sourceActor, settings) {
        if (!sourceActor || !settings) {
            Log.logError("Gnomenu.Menu", "_init", "sourceActor or settings is null!");
        }

        this.parent(sourceActor, 0.0, St.Align.START);
        Main.panel.menuManager.addMenu(this);
        
        this._section = new PopupMenuSection();
        this.addMenuItem(this._section);
        
        this._model = new MenuModel(settings);
        this._modelObserver = this._model.getObserver();
        this._mediator = new MenuMediator(this, this._model);
        
        this._menuSearch = new MenuSearch();
        this._model.setSearchSystem(this._menuSearch.getSearchSystem());
        this._mediator.setSearchSystem(this._menuSearch.getSearchSystem());
        
        this._onOpenStateId = this._section.connect('open-state-changed', Lang.bind(this, function() {
            if (this.isOpen) {
                this._onMenuOpened();
                
            } else {
                this._onMenuClosed();
            }
            return true;
        }));
        this._keyPressID = this.actor.connect('key_press_event', Lang.bind(this, this._handleKeyboardEvents));
        
        this._create();
        this._initMenu();
    },
    
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
        
        this._sidebar.actor.add_constraint(new Clutter.BindConstraint({name: 'constraint', source: this._navigationArea.actor, coordinate: Clutter.BindCoordinate.HEIGHT, offset: 0}));
        this._mainArea.actor.add_constraint(new Clutter.BindConstraint({name: 'constraint', source: this._navigationArea.actor, coordinate: Clutter.BindCoordinate.HEIGHT, offset: 0}));
        
        topPane.add(this._categoryPane.actor);
        topPane.add(new St.Label({ text: '' }), { expand: true, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
        topPane.add(this._viewModePane.actor);
        topPane.add(new St.Label({ text: '' }), { expand: true, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
        topPane.add(this._searchField.actor, { expand: true, x_align: St.Align.END, y_align: St.Align.MIDDLE });
        
        middlePane.add(this._sidebar.actor, { x_fill:false, y_fill: false, x_align: St.Align.START, y_align: St.Align.START });
        middlePane.add(this._navigationArea.actor, { x_fill:false, y_fill: false, x_align: St.Align.START, y_align: St.Align.START });
        middlePane.add(this._mainArea.actor, { x_fill:false, y_fill: false, x_align: St.Align.START, y_align: St.Align.START });
        
        bottomPane.add(this._controlPane.actor, { x_fill:false, y_fill: false, x_align: St.Align.START, y_align: St.Align.START });
        bottomPane.add(new St.Label({ text: '' }), { expand: true, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
        bottomPane.add(this._descriptionBox.actor, { expand: true, x_align: St.Align.END, y_align: St.Align.MIDDLE });
        bottomPane.add(this._extensionPrefButton.actor, { x_fill:false, y_fill: false, x_align: St.Align.END, y_align: St.Align.MIDDLE });
        
        mainBox.add(topPane, {x_fill:true, y_fill: false, expand: false});
        mainBox.add(middlePane, {x_fill:true, y_fill: true, expand: true});
        mainBox.add(bottomPane, {x_fill:true, y_fill: false, expand: false});
        
        this._section.actor.add(mainBox);
        
        this._mainAreaAllocationID = this._mainArea.actor.connect('notify::allocation', Lang.bind(this, this._fixElements));
    },
    
    _fixElements: function() {
        if (this._mainAreaAllocationID) {
            this._mainArea.actor.disconnect(this._mainAreaAllocationID);
            this._mainAreaAllocationID = undefined;
        }
        
        Mainloop.timeout_add(200, Lang.bind(this, function() {
        
            let height = this._navigationArea.actor.height;
            this._sidebar.actor.height = height;
            this._mainArea.actor.height = height;
        
            if (!this._categoryPane.min_width) this._categoryPane.min_width = this._categoryPane.actor.width;
            if (!this._navigationArea.min_width) this._navigationArea.min_width = this._navigationArea.actor.width;
            if (!this._controlPane.min_width) this._controlPane.min_width = this._controlPane.actor.width;
            
            let sidebarWidth = 0;
            if (this._model.isSidebarVisible()) {
                sidebarWidth = this._sidebar.actor.width;
            }
            log(sidebarWidth)
            let maxWidth = Math.max(this._categoryPane.actor.width, (this._navigationArea.actor.width + sidebarWidth), this._controlPane.actor.width);
            if (maxWidth > 0) {
                this._categoryPane.actor.width = maxWidth;
                this._navigationArea.actor.width = maxWidth - sidebarWidth;
                this._controlPane.actor.width = maxWidth;
            }
        }));
    },
    
    _initMenu: function() {
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
    },
    
    _registerSettingCallbacks: function() { 
        this._model.registerDefaultSidebarCategoryCB(Lang.bind(this, function(event) {
            this._categoryPane.actor.width = this._categoryPane.min_width;
            this._navigationArea.actor.width = this._navigationArea.min_width;
            this._controlPane.actor.width = this._controlPane.min_width;
            
            this._categoryPane.refresh();
            this._sidebar.refresh();
            
            this._fixElements();
            return true;
        }));
        
        this._model.registerSidebarIconSizeCB(Lang.bind(this, function(event) {
            this._categoryPane.actor.width = this._categoryPane.min_width;
            this._navigationArea.actor.width = this._navigationArea.min_width;
            this._controlPane.actor.width = this._controlPane.min_width;
            
            this._sidebar.refresh();
            
            this._fixElements();
            return true;
        }));
        
        this._model.registerSidebarVisibleCB(Lang.bind(this, function(event) {
            this._categoryPane.actor.width = this._categoryPane.min_width;
            this._navigationArea.actor.width = this._navigationArea.min_width;
            this._controlPane.actor.width = this._controlPane.min_width;
            
            this._sidebar.refresh();
            
            this._fixElements();
            return true;
        }));
        
        
        this._model.registerDefaultShortcutAreaCategoryCB(Lang.bind(this, function(event) {
            this._navigationArea.refresh();
            this._mediator.selectMenuCategory(this._model.getDefaultShortcutAreaCategory());
            return true;
        }));
        
        this._model.registerShortcutAreaViewModeCB(Lang.bind(this, function(event) {
            this._mediator.selectShortcutViewMode(this._model.getShortcutAreaViewMode(), true);
            return true;
        }));
        
        this._model.registerCategorySelectionMethodCB(Lang.bind(this, function(event) {
            this._navigationArea.refresh();
            return true;
        }));
        
        this._model.registerAppListIconSizeCB(Lang.bind(this, function(event) {
            this._mainArea.refresh();
            return true;
        }));
        
        this._model.registerAppGridIconSizeCB(Lang.bind(this, function(event) {
            this._mainArea.refresh();
            return true;
        }));
        
        
        this._model.registerMaxSearchResultCountCB(Lang.bind(this, function(event) {
            this._mainArea.refresh();
            return true;
        }));
    },
    
    _handleKeyboardEvents: function(actor, event) {
        this._mediator.onKeyboardEvent(actor, event);
        return true;
    },
    
    _onMenuOpened: function() {
        this._mediator.onMenuOpened();
    },
    
    _onMenuClosed: function() {
        this._mediator.onMenuClosed();
    },
    
    reset: function() {
        let actors = this._section.actor.get_children();
        if (actors) {
            for each (let actor in actors) {
                this._section.actor.remove_actor(actor);
                actor.destroy();
            }
        }
        
        this._modelObserver.clearUpdateables();
        
        this._categoryPane.destroy();
        this._viewModePane.destroy();
        this._searchField.destroy();
        
        this._sidebar.destroy();
        this._navigationArea.destroy();
        this._mainArea.destroy();
        
        this._controlPane.destroy();
        this._descriptionBox.destroy();
        this._extensionPrefButton.destroy();
        
        this._create();
        this._initMenu();
    },
    
    destroy: function() {
        if (this._onOpenStateId > 0) {
            this._section.disconnect(this._onOpenStateId);
            this._onOpenStateId = undefined;
        }
        
        if (this._keyPressID > 0) {
            this.actor.disconnect(this._keyPressID);
            this._keyPressID = undefined;
        }
        
        this._section.destroy();
        
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
        this._menuSearch.destroy();
    },
});
