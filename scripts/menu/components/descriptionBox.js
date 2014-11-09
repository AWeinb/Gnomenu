
const Lang = imports.lang;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Component = Me.imports.scripts.menu.components.component.Component;


const DescriptionBox = new Lang.Class({

    Name: 'Gnomenu.DescriptionBox',
    Extends: Component,
    
    
    _init: function(model, mediator) {
        this.parent(model, mediator);
        
        this.actor = new St.BoxLayout({ style_class: 'gnomenu-description-box', vertical: true });
        
        this._selectedAppTitle = new St.Label({ style_class: 'gnomenu-description-box-title' });
        this.actor.add_actor(this._selectedAppTitle);
        
        this._selectedAppDescription = new St.Label({ style_class: 'gnomenu-description-box-description' });
        this.actor.add_actor(this._selectedAppDescription);
    },
    
    setTitle: function(title) {
        if (!title) {
            this._selectedAppTitle.set_text("");
        } else {
            this._selectedAppTitle.set_text(title);
        }
    },
    
    setDescription: function(description) {
        if (!description) {
            this._selectedAppDescription.set_text("");
        } else {
            this._selectedAppDescription.set_text(description);
        }
    },
    
    destroy: function() {
        this.actor.destroy();
    }
});
