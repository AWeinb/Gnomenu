
const Lang = imports.lang;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Constants = Me.imports.scripts.constants;
const Component = Me.imports.scripts.menu.components.component.Component;
const IconButton = Me.imports.scripts.menu.components.elements.menubutton.IconButton;

const EMenuLayout = Constants.EMenuLayout;



const PreferencesButton = new Lang.Class({

    Name: 'Gnomenu.PreferencesButton',
    Extends: Component,
    
    
    _init: function(model, mediator) {
        this.parent(model, mediator);
        
        this.actor = new St.Bin();
        let iconSize = this.model.getMiscBtnIconSize();
        let extensionPreferencesBtn = new IconButton(mediator, 'control-center-alt-symbolic', iconSize, 'Preferences', null);
        extensionPreferencesBtn.setOnLeftClickHandler(Lang.bind(mediator, function() {
            mediator.showSystemPreferences();
        }));
        
        extensionPreferencesBtn.setOnRightClickHandler(Lang.bind(mediator, function() {
            mediator.showPreferences();
        }));
        
        this.actor.set_child(extensionPreferencesBtn.actor, { x_fill: false, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
    },
    
    destroy: function() {
        this.actor.destroy();
    }
});
