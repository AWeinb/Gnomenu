
const Lang = imports.lang;

const Gtk = imports.gi.Gtk;
const Meta = imports.gi.Meta;  
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Constants = Me.imports.scripts.constants;
const DraggableIconButton = Me.imports.scripts.menu.components.elements.menubutton.DraggableIconButton;
const UpdateableComponent = Me.imports.scripts.menu.components.component.UpdateableComponent;


const ECategoryID = Constants.ECategoryID;
const EEventType = Constants.EEventType;




const Sidebar = new Lang.Class({

    Name: 'Gnomenu.Sidebar',
    Extends: UpdateableComponent,


    _init: function(model, mediator) {
        this.parent(model, mediator);
        
        this._isShown = true;
        this._buttonsTmp = null;

        this._mainBox = new St.BoxLayout({ style_class: 'gnomenu-sidebar-box', vertical: true });

        let scrollBox = new St.ScrollView({ x_fill: true, y_fill: false, y_align: St.Align.START, style_class: 'gnomenu-sidebar-scrollbox' });
        scrollBox.add_actor(this._mainBox);
        scrollBox.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.NEVER);
        scrollBox.set_mouse_scrolling(true);
        this.actor = scrollBox;
        
        this.model.registerDefaultSidebarCategoryCB(Lang.bind(this, function(event) {this.update(null)}));
        this.model.registerSidebarIconSizeCB(Lang.bind(this, function(event) {this.update(null)}));
        this.model.registerSidebarVisibleCB(Lang.bind(this, function(event) {this.update(null)}));
        
        this.update();
    },

    hide: function() {
        this.actor.hide();
    },

    show: function() {
        this.actor.show();
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
    
    clear: function() {
        let actors = this._mainBox.get_children();
        if (actors) {
            for each (let actor in actors) {
                this._mainBox.remove_actor(actor);
                actor.destroy();
            }
        }
    },

    update: function(event) {
        if (!event || event.type == EEventType.FAVORITES_EVENT) {
            Meta.later_add(Meta.LaterType.BEFORE_REDRAW, Lang.bind(this, function() {
                
                    if (!this.model.isSidebarVisible()) {
                        this.actor.hide();
                    } else {
                        this.actor.show();
                    }
                    
                    this._buttonTmp = [];
                    let launchables = null;
                    
                    switch (this.model.getDefaultSidebarCategory()) {
                        
                        case ECategoryID.FAVORITES:
                            launchables = this.model.getFavoriteApps();
                            break;
                        
                        case ECategoryID.PLACES:
                            launchables = this.model.getPlaces();
                            break;
                        
                        default:
                            break;
                    }
                    
                    this.clear();
                    
                    let iconSize = this.model.getSidebarIconSize();
                    let tmpBtn = null;
                    for each (let launchable in launchables) {
                        tmpBtn = new DraggableIconButton(this.mediator, iconSize, launchable);
                        this._buttonTmp.push(tmpBtn);
                        this._mainBox.add_actor(tmpBtn.actor);
                    }
                    
                    return false;
                }
            ));
        }
    },
    
    destroy: function() {
        this.clear();
        this.actor.destroy();
    }
});
