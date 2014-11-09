
const Lang = imports.lang;
const St = imports.gi.St;
const Gtk = imports.gi.Gtk;
const Clutter = imports.gi.Clutter;
const Mainloop = imports.mainloop;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Constants = Me.imports.scripts.constants;
const Log = Me.imports.scripts.misc.log;
const GnoMenuThumbnailsBox = Me.imports.scripts.menu.components.elements.workspaceThumbnail.GnoMenuThumbnailsBox;
const TextButton = Me.imports.scripts.menu.components.elements.menubutton.TextButton;
const UpdateableComponent = Me.imports.scripts.menu.components.component.UpdateableComponent;

const ECategoryID = Constants.ECategoryID;
const EEventType = Constants.EEventType;
const ESelectionMethod = Constants.ESelectionMethod;



const NavigationBox = new Lang.Class({

    Name: 'Gnomenu.navigationArea.NavigationBox',
    
    
    _init: function(params) {
        this.actor = new St.BoxLayout(params);
        
        this._isShown = true;
    },
    
    hide: function() {
        if (this._isShown) {
            this.actor.hide();
            this._isShown = false;
        }
    },
    
    show: function() {
        if (!this._isShown) {
            this.actor.show();
            this._isShown = true;
        }
    },
    
    toggleVisibility: function() {
        if (this._isShown) {
            this.hide();
        } else {
            this.show();
        }
    },
});



const WorkspaceBox = new Lang.Class({

    Name: 'Gnomenu.navigationArea.WorkspaceBox',
    Extends: NavigationBox,
    
    
    _init: function(model, mediator) {
        this.parent({ style_class: 'gnomenu-workspaces-box', vertical: true });
        
        this.thumbnailsBox = new GnoMenuThumbnailsBox(mediator, model);
        this.actor.add(this.thumbnailsBox.actor);
    },
    
    hide: function() {
        if (this._isShown) {
            this.actor.hide();
            this._isShown = false;
            
            this.thumbnailsBox.destroyThumbnails();
        }
    },
    
    show: function() {
        if (!this._isShown) {
            this.actor.show();
            this._isShown = true;
            
            this.thumbnailsBox.createThumbnails();
            this.actor.height = this.thumbnailsBox.actor.height;
        }
    },
    
    _onDragBegin: function() {
        this.thumbnailsBox.onDragBegin();
    },
    
    _onDragCancelled: function() {
        this.thumbnailsBox.onDragCancelled();
    },
    
    _onDragEnd: function() {
        this.thumbnailsBox.onDragEnd();
    },
    
    destroy: function() {
        if (this._actorLeaveEventID) {
            this.actor.disconnect(this._actorLeaveEventID);
        }
        this.actor.destroy();
    }
});



const CategoryBox = new Lang.Class({

    Name: 'Gnomenu.navigationArea.CategoryBox',
    Extends: NavigationBox,
    
    
    _init: function(model, mediator) {
        this.parent({ style_class: 'gnomenu-categories-box', vertical: true });
        
        this._mediator = mediator;
        this._model = model;
        this._categoryButtonMap = {};
    },
    
    clear: function() {
        for each (let btn in this._categoryButtonMap) {
            btn.actor.destroy();
        }
        this._categoryButtonMap = {};  
    },
    
    selectCategory: function(categoryID) {
        for each (let btn in this._categoryButtonMap) {
            btn.deselect();
        }
        
        if (this._categoryButtonMap[categoryID]) {
            this._categoryButtonMap[categoryID].select();
        }
    },
    
    addCategory: function(categoryID, categoryNameID, categoryDescriptionID) {
        if (this._categoryButtonMap[categoryID]) {
            return;
        }
        
        if (!categoryNameID) {
            categoryNameID = categoryID;
        }
        
        let btn = new TextButton(this._mediator, categoryNameID, categoryNameID, categoryDescriptionID);
        switch (this._model.getCategorySelectionMethod()) {
            
            case ESelectionMethod.CLICK:
                btn.setOnLeftClickHandler(Lang.bind(this, function() {
                    this._mediator.selectMenuCategory(categoryID);
                }));
                break;
            
            case ESelectionMethod.HOVER:
                btn.setOnHoverHandler(Lang.bind(this, function() {
                    this._mediator.selectMenuCategory(categoryID);
                }));
                break;
            
            default:
                break;
        }
        this._categoryButtonMap[categoryID] = btn;
        this.actor.add_actor(btn.actor);
    },
    
    destroy: function() {
        this.clear();
        this.actor.destroy();
    }
});


const NavigationArea = new Lang.Class({

    Name: 'Gnomenu.navigationArea.NavigationArea',
    Extends: UpdateableComponent,
    
    
    _init: function(model, mediator) {
        this.parent(model, mediator);
        
        this._mainbox = new St.BoxLayout({ style_class: 'gnomenu-categories-workspaces-wrapper', vertical: false });
        this._workspaceBox = new WorkspaceBox(model, mediator);
        this._categoryBox = new CategoryBox(model, mediator);
        this._mainbox.add(this._workspaceBox.actor, { expand: true, x_fill: true });
        this._mainbox.add(this._categoryBox.actor, { expand: true, x_fill: true });
        
        let scrollBox = new St.ScrollView({ reactive: true, style_class: 'gnomenu-categories-workspaces-scrollbox' });
        scrollBox.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.NEVER);
        scrollBox.set_mouse_scrolling(true);
        scrollBox.add_actor(this._mainbox, { expand: true, x_fill: true });
        scrollBox.connect('button-release-event', Lang.bind(this, function(actor, event) {
            let button = event.get_button();
            if (button == 3) { //right click
                this.toggleView();
            }
            return false;
        }));
        this.actor = scrollBox;
        
        this._workspaceBox.actor.add_constraint(new Clutter.BindConstraint({ name: 'constraint', source: this._categoryBox.actor, coordinate: Clutter.BindCoordinate.WIDTH, offset: 0 }));
        this._workspaceBox.hide();
        
        this.update();
        
        this.model.registerCategorySelectionMethodCB(Lang.bind(this, function(event) { this.update(null) }));
    },
    
    _onDragBegin: function() {
        this.showWorkspaces();
        this._workspaceBox._onDragBegin();
    },
    
    _onDragCancelled: function() {
        this._workspaceBox._onDragCancelled();
    },
    
    _onDragEnd: function() {
        this.showCategories(true);
        this._workspaceBox._onDragEnd();
    },
    
    showCategories: function(withTimeout) {
        if (withTimeout) {
            if (this._stopResetID) this.actor.disconnect(this._stopResetID);
            if (this._resetTimeoutId) Mainloop.source_remove(this._resetTimeoutId);
            this._stopResetID = this.actor.connect('motion_event', Lang.bind(this, this.showWorkspaces));
            this._resetTimeoutId = Mainloop.timeout_add(250, Lang.bind(this, function() {
                if (this._stopResetID) this.actor.disconnect(this._stopResetID);
                this._stopResetID = 0;
                this._resetTimeoutId = 0;
                this.toggleView();
                return false;
            }));
            
        } else {
            this._workspaceBox.hide();
            this._categoryBox.show();
        }
    },
    
    showWorkspaces: function() {
        if (this._stopResetID) this.actor.disconnect(this._stopResetID);
        if (this._resetTimeoutId) Mainloop.source_remove(this._resetTimeoutId);
        this._stopResetID = 0;
        this._resetTimeoutId = 0;
        
        this._workspaceBox.show();
        this._categoryBox.hide();
    },
    
    toggleView: function() {
        this._workspaceBox.toggleVisibility();
        this._categoryBox.toggleVisibility();
    },
    
    setSelectedCategory: function(categoryID) {
        if (!categoryID) {
            Log.logError("Gnomenu.navigationArea.NavigationArea", "setSelectedCategory", "categoryID is null!")
        }
        this._categoryBox.selectCategory(categoryID);
        this._workspaceBox.hide();
        this._categoryBox.show();
    },
    
    update: function(event) {
        if (!event || event.type == EEventType.APPS_EVENT_TYPE) {
            
            this._categoryBox.clear();
            
            this._categoryBox.addCategory(ECategoryID.MOST_USED, ECategoryID.MOST_USED, null);
            this._categoryBox.addCategory(ECategoryID.ALL_APPS, ECategoryID.ALL_APPS, null);
            
            let categories = this.model.getApplicationCategories();
            for (let categoryID in categories) {
                let categoryNameID = categories[categoryID];
                this._categoryBox.addCategory(categoryID, categoryNameID, null);
            }
        }
    },
    
    destroy: function() {
        this.actor.destroy();
        this._workspaceBox.destroy();
        this._categoryBox.destroy();
    }
});
