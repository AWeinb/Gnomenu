
const Lang = imports.lang;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Constants = Me.imports.scripts.constants;
const Component = Me.imports.scripts.menu.components.component.Component;
const IconButton = Me.imports.scripts.menu.components.elements.menubutton.IconButton;

const EMenuLayout = Constants.EMenuLayout;


const ControlPane = new Lang.Class({

    Name: 'Gnomenu.ControlPane',
    Extends: Component,
    
    
    _init: function(model, mediator) {
        this.parent(model, mediator);
        
        this.actor = new St.BoxLayout({ style_class: 'gnomenu-controlPane-box'});
        
        let iconSize = this.model.getMiscBtnIconSize();
        let systemRestart = new IconButton(mediator, 'refresh-symbolic', iconSize, 'Restart Shell', null);
        systemRestart.setOnLeftClickHandler(Lang.bind(mediator, function() {
            mediator.restartShell();
        }));
        
        let systemSuspend = new IconButton(mediator, 'suspend-symbolic', iconSize, 'Suspend', null);
        systemSuspend.setOnLeftClickHandler(Lang.bind(mediator, function() {
            mediator.suspendComputer();
        }));
        
        let systemShutdown = new IconButton(mediator, 'shutdown-symbolic', iconSize, 'Shutdown', null);
        systemShutdown.setOnLeftClickHandler(Lang.bind(mediator, function() {
            mediator.shutdownComputer();
        }));
        
        let logoutUser = new IconButton(mediator, 'user-logout-symbolic', iconSize, 'Logout User', null);
        logoutUser.setOnLeftClickHandler(Lang.bind(mediator, function() {
            mediator.logoutSession();
        }));
        
        let lockScreen = new IconButton(mediator, 'user-lock-symbolic', iconSize, 'Lock Screen', null);
        lockScreen.setOnLeftClickHandler(Lang.bind(mediator, function() {
            mediator.lockSession();
        }));
        
        this.actor.add(systemRestart.actor, { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE, margin_right: 1 });
        this.actor.add(systemSuspend.actor, { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE, margin_right: 1 });
        this.actor.add(systemShutdown.actor, { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE, margin_right: 1 });
        this.actor.add(logoutUser.actor, { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE, margin_right: 1 });
        this.actor.add(lockScreen.actor, { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE, margin_right: 1 });
    },
    
    destroy: function() {
        this.actor.destroy();
    }
});
