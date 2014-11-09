
const Lang = imports.lang;
const Gtk = imports.gi.Gtk;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;


const Component = new Lang.Class({

    Name: 'Gnomenu.Component',
    
    
    _init: function(model, mediator) {
        if (!model || !mediator) {
            Log.logError("Gnomenu.Component", "_init", "model or mediator is null!");
        }
        
        this.model = model;
        this.mediator = mediator;
    },
});


const UpdateableComponent = new Lang.Class({

    Name: 'Gnomenu.UpdateableComponent',
    Extends: Component,
    
    
    _init: function(model, mediator) {
        this.parent(model, mediator);
    },
    
    update: function(event) {
        Log.logError("Gnomenu.UpdateableComponent", "update", "Please override this method!");
    }
});