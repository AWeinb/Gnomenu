
const Lang = imports.lang;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;
const Component = Me.imports.scripts.menu.components.component.Component;
const Constants = Me.imports.scripts.constants;
const IconToggleButton = Me.imports.scripts.menu.components.elements.menubutton.IconToggleButton;
const ToggleButtonGroup = Me.imports.scripts.menu.components.elements.menubuttonBase.ToggleButtonGroup;

const EMenuLayout = Constants.EMenuLayout;
const EViewMode = Constants.EViewMode;



const ViewModePane = new Lang.Class({
    
    Name: 'Gnomenu.ViewModePane',
    Extends: Component,
    
    
    _init: function(model, mediator) {
        this.parent(model, mediator);
        
        this.actor = new St.BoxLayout({ style_class: 'gnomenu-viewMode-box' });
        let iconSize = this.model.getMiscBtnIconSize();
        
        let listViewBtn = new IconToggleButton(mediator, 'view-list-symbolic', iconSize, 'List View', null);
        listViewBtn.id = EViewMode.LIST;
        listViewBtn.setOnClickHandler(Lang.bind(this, function(active) {
                if (active) {
                    this.mediator.selectShortcutViewMode(EViewMode.LIST, false);
                }
                
            }
        ));
        let gridViewBtn = new IconToggleButton(mediator, 'view-grid-symbolic', iconSize, 'Grid View', null);
        gridViewBtn.id = EViewMode.GRID;
        gridViewBtn.setOnClickHandler(Lang.bind(this, function(active) {
                if (active) {
                    this.mediator.selectShortcutViewMode(EViewMode.GRID, false);
                }
            }
        ));
        
        this._toggleButtonGroup = new ToggleButtonGroup();
        this._toggleButtonGroup.addButton(listViewBtn);
        this._toggleButtonGroup.addButton(gridViewBtn);
        
        this.actor.add(listViewBtn.actor, { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
        this.actor.add(gridViewBtn.actor, { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
    },
    
    selectButton: function(shortcutAreaViewModeID) {
        if (!shortcutAreaViewModeID) {
            Log.logError("Gnomenu.ViewModePane", "selectButton", "shortcutAreaViewModeID is null!");
        }
        
        this._toggleButtonGroup.clearButtonStates();
        this._toggleButtonGroup.select(shortcutAreaViewModeID);
    },
    
    deselectButtons: function() {
        this._toggleButtonGroup.clearButtonStates();
    },
    
    destroy: function() {
        this.actor.destroy();
    }
});
