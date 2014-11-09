
const Lang = imports.lang;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;
const Component = Me.imports.scripts.menu.components.component.Component;
const Constants = Me.imports.scripts.constants;
const TextToggleButton = Me.imports.scripts.menu.components.elements.menubutton.TextToggleButton;
const ToggleButtonGroup = Me.imports.scripts.menu.components.elements.menubuttonBase.ToggleButtonGroup;

const ECategoryID = Constants.ECategoryID;
const EMenuLayout = Constants.EMenuLayout;



const CategoryPane = new Lang.Class({
    
    Name: 'Gnomenu.CategoryPane',
    Extends: Component,

    
    _init: function(model, mediator) {
        this.parent(model, mediator);
        
        this.actor = new St.BoxLayout({ style_class: 'gnomenu-categorypanel-box' });
        
        let recentCategoryBtn = new TextToggleButton(mediator, 'Recent', 'Recent', null);
        recentCategoryBtn.id = ECategoryID.RECENTFILES;
        recentCategoryBtn.setOnClickHandler(Lang.bind(this, this._onRecentSelected));
        
        let webBookmarksCategoryBtn = new TextToggleButton(mediator, 'Web', 'Web', null);
        webBookmarksCategoryBtn.id = ECategoryID.WEB;
        webBookmarksCategoryBtn.setOnClickHandler(Lang.bind(this, this._onWebSelected));
        
        let tmpCategoryBtn = null;
        switch (model.getDefaultSidebarCategory()) {
            
            case ECategoryID.FAVORITES:
                tmpCategoryBtn = new TextToggleButton(mediator, 'Places', 'Places', null);
                tmpCategoryBtn.id = ECategoryID.PLACES;
                tmpCategoryBtn.setOnClickHandler(Lang.bind(this, this._onPlacesSelected));
                break;
            
            case ECategoryID.PLACES:
                tmpCategoryBtn = new TextToggleButton(mediator, 'Favorites', 'Favorites', null);
                tmpCategoryBtn.id = ECategoryID.FAVORITES;
                tmpCategoryBtn.setOnClickHandler(Lang.bind(this, this._onFavoritesSelected));
                break;
            
            default:
                break;
        }
        
        this._toggleButtonGroup = new ToggleButtonGroup();
        this._toggleButtonGroup.addButton(recentCategoryBtn);
        this._toggleButtonGroup.addButton(webBookmarksCategoryBtn);
        this._toggleButtonGroup.addButton(tmpCategoryBtn);
        
        this.actor.add(recentCategoryBtn.actor,       { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
        this.actor.add(webBookmarksCategoryBtn.actor, { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
        this.actor.add(tmpCategoryBtn.actor,          { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
    },
    
    _onFavoritesSelected: function(isSelected) {
        if (this.mediator) {
            if (isSelected) {
                this.mediator.selectMenuCategory(ECategoryID.FAVORITES);
            } else {
                this.mediator.selectMenuCategory(this.model.getDefaultShortcutAreaCategory());
            }
        }
    },
    
    _onRecentSelected: function(isSelected) {
        if (this.mediator) {
            if (isSelected) {
                this.mediator.selectMenuCategory(ECategoryID.RECENTFILES);
            } else {
                this.mediator.selectMenuCategory(this.model.getDefaultShortcutAreaCategory());
            }
        }
    },  
    
    _onPlacesSelected: function(isSelected) {
        if (this.mediator) {
            if (isSelected) {
                this.mediator.selectMenuCategory(ECategoryID.PLACES);
            } else {
                this.mediator.selectMenuCategory(this.model.getDefaultShortcutAreaCategory());
            }
        }
    },
    
    _onWebSelected: function(isSelected) {
        if (this.mediator) {
            if (isSelected) {
                this.mediator.selectMenuCategory(ECategoryID.WEB);
            } else {
                this.mediator.selectMenuCategory(this.model.getDefaultShortcutAreaCategory());
            }
        }
    },
    
    selectButton: function(categoryID) {
        if (!categoryID) {
            Log.logWarning("Gnomenu.CategoryPane", "selectButton", "categoryID is null!");
            return;
        }
        this._toggleButtonGroup.clearButtonStates();
        this._toggleButtonGroup.select(categoryID);
    },
    
    deselectButtons: function() {
        this._toggleButtonGroup.clearButtonStates();
    },
    
    destroy: function() {
        this.actor.destroy();
    }
});
