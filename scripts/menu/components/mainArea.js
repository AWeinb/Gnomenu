
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;
const Constants = Me.imports.scripts.constants;
const ResultArea = Me.imports.scripts.menu.components.elements.searchResultArea.ResultArea;
const ShortcutArea = Me.imports.scripts.menu.components.elements.shortcutArea.ShortcutArea;
const UpdateableComponent = Me.imports.scripts.menu.components.component.UpdateableComponent;

const EEventType = Constants.EEventType;


const MainArea = new Lang.Class({

    Name: 'Gnomenu.MainArea',
    Extends: UpdateableComponent,
    
    
    _init: function(model, mediator) {
        this.actor = new St.BoxLayout({ style_class: 'gnomenu-mainArea-box' });
        
        this._resultArea = new ResultArea(model, mediator);
        this._shortcutArea = new ShortcutArea(model, mediator);
        
        this._resultArea.actor.add_constraint(new Clutter.BindConstraint({name: 'constraint', source: this.actor, coordinate: Clutter.BindCoordinate.WIDTH, offset: 0}));
        this._shortcutArea.actor.add_constraint(new Clutter.BindConstraint({name: 'constraint', source: this.actor, coordinate: Clutter.BindCoordinate.WIDTH, offset: 0}));
        
        this.actor.add(this._resultArea.actor, { expand: true, x_fill: true, y_fill: true });
        this.actor.add(this._shortcutArea.actor, { expand: true, x_fill: true, y_fill: true });
    },
    
    showCategory: function(categoryID) {
        if (!categoryID) {
            Log.logWarning("Gnomenu.MainArea", "showCategory", "categoryID is null!");
        }
        this.showShortcuts();
        this._shortcutArea.showCategory(categoryID);
    },
    
    setViewMode: function(viewModeID) {
        if (!viewModeID) {
            Log.logWarning("Gnomenu.MainArea", "setViewMode", "viewModeID is null!");
        }
        this._resultArea.setViewMode(viewModeID);
        this._shortcutArea.setViewMode(viewModeID);
    },
    
    showSearchResults: function() {
        this._resultArea.show();
        this._shortcutArea.hide();
    },
    
    showShortcuts: function() {
        this._resultArea.hide();
        this._shortcutArea.show();
    },
    
    update: function(event) {
        if (!event) {
            Log.logWarning("Gnomenu.MainArea", "update", "event is null!");
        }
        
        switch (event.type) {
            
            case EEventType.SEARCH_UPDATE_EVENT:
                this.showSearchResults();
                break;
            
            case EEventType.SEARCH_STOP_EVENT:
                this.showShortcuts();
                break;
            
            default:
                break;
        }
        
        this._resultArea.update(event);
        this._shortcutArea.update(event);
    },
});