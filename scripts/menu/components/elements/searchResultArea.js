
const Lang = imports.lang;
const Gtk = imports.gi.Gtk;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Constants = Me.imports.scripts.constants;
const Log = Me.imports.scripts.misc.log;
const DraggableSearchGridButton = Me.imports.scripts.menu.components.elements.menubutton.DraggableSearchGridButton;
const DraggableSearchListButton = Me.imports.scripts.menu.components.elements.menubutton.DraggableSearchListButton;
const UpdateableComponent = Me.imports.scripts.menu.components.component.UpdateableComponent;

const EEventType = Constants.EEventType;
const EViewMode = Constants.EViewMode;
const SEARCH_MAX_ENTRIES_PER_ROW = Constants.SEARCH_MAX_ENTRIES_PER_ROW;


const OPEN_ICON = 'list-add-symbolic';
const CLOSE_ICON = 'list-remove-symbolic';
const ICON_SIZE = 20;



const ProviderResultBoxButton = new Lang.Class({
    
    Name: 'GnoMenu.searchResultArea.ProviderResultBoxButton',
    
    
    _init: function(icon, label) {
        let buttonbox = new St.BoxLayout();
        
        this.stIcon = new St.Icon({ icon_size: ICON_SIZE });
        buttonbox.add(this.stIcon, { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE });
        
        let stLabel = new St.Label({ style_class: 'gnomenu-searchArea-category-button-label' });
        stLabel.set_text(_(label));
        buttonbox.add(stLabel, { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE });
        
        this.actor = new St.Button({ reactive: true, style_class: 'popup-menu-item popup-submenu-menu-item gnomenu-searchArea-category-button', x_align: St.Align.START, y_align: St.Align.MIDDLE });
        this.actor.set_child(buttonbox);
        
        this._btnPressId = this.actor.connect('button-press-event', Lang.bind(this, this._onPress));
        this._btnReleaseId = this.actor.connect('button-release-event', Lang.bind(this, this._onRelease));
        this._btnEnterId = this.actor.connect('enter-event', Lang.bind(this, this._onEnter));
        this._btnLeaveId = this.actor.connect('leave-event', Lang.bind(this, this._onLeave));
    },
    
    onOpen: function() {
        this.stIcon.icon_name = CLOSE_ICON;
        this.actor.add_style_pseudo_class('pressed');
    },
    
    onClose: function() {
        this.stIcon.icon_name = OPEN_ICON;
        this.actor.remove_style_pseudo_class('pressed');
    },
    
    setOnClickHandler: function(handler) {
        this._btnClickHandler = handler;
    },
    
    _onPress: function(actor, event) {
    },
    
    _onRelease: function(actor, event) {
        if (this._btnClickHandler) {
            this._btnClickHandler(actor, event);
        }
    },
    
    _onEnter: function(actor, event) {
        this.actor.add_style_pseudo_class('active');
    },
    
    _onLeave: function(actor, event) {
        this.actor.remove_style_pseudo_class('active');
        this.actor.remove_style_pseudo_class('pressed');
    },
});


const ProviderResultBoxBase = new Lang.Class({
    
    Name: 'GnoMenu.searchResultArea.ProviderResultBoxBase',
    
    
    _init: function(model, mediator, boxlabel) {
        if (!model || !mediator || !boxlabel) {
            Log.logError("GnoMenu.searchResultArea.ProviderResultBoxBase", "_init", "model, mediator, boxlabel, may not be null!");
        }
        
        this.mediator = mediator;
        this.model = model;
        
        this.button = new ProviderResultBoxButton(null, boxlabel);
        this.button.setOnClickHandler(Lang.bind(this, this.toggleOpenState));
        
        this.actor = new St.BoxLayout({ style_class: 'gnomenu-searchArea-category-box', vertical: true });
        this.actor.add(this.button.actor);
    },
    
    show: function() {
        this.actor.show();
    },
    
    hide: function() {
        this.actor.hide();
    },
});


const ProviderResultList = new Lang.Class({
    
    Name: 'GnoMenu.searchResultArea.ProviderResultList',
    Extends: ProviderResultBoxBase,
    
    
    _init: function(model, mediator, boxlabel) {
        this.parent(model, mediator, boxlabel);
        
        this._box = new St.BoxLayout({ vertical:true, style_class: 'gnomenu-searchArea-list-box' });
        this._isBoxShown = true;
        this._buttonCount = 0;
        
        this.actor.add(this._box, { x_fill: true, x_align: St.Align.START });
    },
    
    clear: function() {
        let actors = this._box.get_children();
        if (actors) {
            for each (let actor in actors) {
                this._box.remove_actor(actor);
                actor.destroy();
            }
        }
        this._buttonCount = 0;
    },
    
    open: function() {
        this._box.show();
        this.button.onOpen();
        this._isBoxShown = true;
    },
    
    close: function() {
        this._box.hide();
        this.button.onClose();
        this._isBoxShown = false;
    },
    
    toggleOpenState: function() {
        if (this._isBoxShown) {
            this.close();
        } else {
            this.open();
        }
    },
    
    addResultButton: function(providerSearchResult) {
        if (!providerSearchResult) {
            Log.logWarning("GnoMenu.searchResultArea.ProviderResultList", "addResultButton", "providerSearchResult is null!");
            return;
        }
        
        let iconSize = this.model.getShortcutListIconSize();
        this._box.add_actor(new DraggableSearchListButton(this.mediator, iconSize, providerSearchResult).actor);
        this._buttonCount++;
    },
    
    isEmpty: function() {
        return this._buttonCount == 0;
    },
    
    destroy: function() {
        this.clear();
        this._box.destroy();
        this.actor.destroy();
    }
});


const ProviderResultGrid = new Lang.Class({
    
    Name: 'GnoMenu.searchResultArea.ProviderResultGrid',
    Extends: ProviderResultBoxBase,
    
    
    _init: function(model, mediator, boxlabel) {
        this.parent(model, mediator, boxlabel);
        
        this._table = new St.Table({ homogeneous: false, reactive: true, style_class: 'gnomenu-searchArea-grid-box' });
        this._isTableShown = true;
        this._buttonCount = 0;
        
        this.actor.add(this._table, { x_fill: false, x_align: St.Align.START });
    },
    
    clear: function() {
        let actors = this._table.get_children();
        if (actors) {
            for each (let actor in actors) {
                this._table.remove_actor(actor);
                actor.destroy();
            }
        }
        this._buttonCount = 0;
    },
    
    open: function() {
        this._table.show();
        this.button.onOpen();
        this._isTableShown = true;
    },
    
    close: function() {
        this._table.hide();
        this.button.onClose();
        this._isTableShown = false;
    },
    
    toggleOpenState: function() {
        if (this._isTableShown) {
            this.close();
        } else {
            this.open();
        }
    },
    
    addResultButton: function(providerSearchResult) {
        if (!providerSearchResult ) {
            Log.logWarning("GnoMenu.searchResultArea.ProviderResultGrid", "addResultButton", "providerSearchResult is null!");
            return;
        }
        
        let iconSize = this.model.getShortcutGridIconSize();
        let btn = new DraggableSearchGridButton(this.mediator, iconSize, providerSearchResult);
        
        let colMax = SEARCH_MAX_ENTRIES_PER_ROW;
        let rowTmp = parseInt(this._buttonCount / colMax);
        let colTmp = this._buttonCount % colMax;
        this._table.add(btn.actor, { row: rowTmp, col: colTmp, x_fill: false });
        this._buttonCount++;
    },
    
    isEmpty: function() {
        return this._buttonCount == 0;
    },
    
    destroy: function() {
        this.clear();
        this._table.destroy();
        this.actor.destroy();
    }
});


const ResultArea = new Lang.Class({
    
    Name: 'GnoMenu.searchResultArea.ResultArea',
    Extends: UpdateableComponent,
    
    
    _init: function(model, mediator) {
        this.parent(model, mediator);
        
        this._mainBox = new St.BoxLayout({ style_class: 'gnomenu-searchArea-box', vertical: true });
        
        this.actor = new St.ScrollView({ x_fill: true, y_fill: false, y_align: St.Align.START, style_class: 'vfade gnomenu-searchArea-scrollbox' });
        this.actor.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
        this.actor.set_mouse_scrolling(true);
        this.actor.add_actor(this._mainBox);
        
        this._viewMode = EViewMode.LIST;
        this.reset();
    },
    
    clear: function() {
        let actors = this._mainBox.get_children();
        if (actors) {
            for each (let actor in actors) {
                this._mainBox.remove_actor(actor);
            }
        }
    },
    
    reset: function() {
        this.clear();
        
        for each (let box in this._providerListBoxes) {
            box.destroy();
        }
        for each (let box in this._providerGridBoxes) {
            box.destroy();
        }
        
        this._lastResults = null;
        this._providerListBoxes = {};
        this._providerGridBoxes = {};
    },
    
    show: function() {
        this.actor.show();
    },
    
    hide: function() {
        this.actor.hide();
    },
    
    setViewMode: function(viewMode) {
        if (!viewMode) {
            Log.logError("GnoMenu.searchResultArea.ResultArea", "setViewMode", "ViewMode may not be null!");
        }
        
        this._viewMode = viewMode;
        this._showResults(this._lastResults);
    },
    
    update: function(event) {
        switch (event.type) {
            
            case EEventType.SEARCH_UPDATE_EVENT:
                this._showResults(this.model.getSearchResults({ maxNumber: this.model.getMaxSearchResultCount() }));
                break;
            
            case EEventType.SEARCH_STOP_EVENT:
                this.reset();
                break;
            
            default:
                break;
        }
    },
    
    _showResults: function(resultMetas) {
        let boxMap = null;
        let currentBoxClass = null;
        switch (this._viewMode) {
            
            case EViewMode.LIST:
                boxMap = this._providerListBoxes;
                currentBoxClass = ProviderResultList;
                this.clear();
                break;
            
            case EViewMode.GRID:
                boxMap = this._providerGridBoxes;
                currentBoxClass = ProviderResultGrid;
                this.clear();
                break;
            
            default:
                Log.logError("GnoMenu.searchResultArea.ResultArea", "_showResults", "Unknown view mode!");
                return;
        }
        
        for each (let box in boxMap) {
            box.clear();
            box.show();
        }
        
        for (let id in resultMetas) {
            if (!boxMap[id]) {
                boxMap[id] = new currentBoxClass(this.model, this.mediator, id);
            }
            this._mainBox.add(boxMap[id].actor);
            
            let metaList = resultMetas[id];
            for each (let meta in metaList) {
                boxMap[id].addResultButton(meta);
            }
        }
        
        let isFirstVisible = false;
        for each (let box in boxMap) {
            box.close();
            
            if (box.isEmpty()) {
                box.hide();
                
            } else {
                if (!isFirstVisible) {
                    box.open();
                    isFirstVisible = true;
                }
            }
        }
        
        this._lastResults = resultMetas;
    },
});
