
const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const MenuButton = Me.imports.scripts.panelbutton.MenuButton;
const PanelButton = Me.imports.scripts.panelbutton.PanelButton;
const Menu = Me.imports.scripts.menu.menu.Menu;



const PanelBox = new Lang.Class({

    Name: 'Gnomenu.panel.PanelBox',
    

    _init: function(settings) {
        this.actor = new St.BoxLayout({ style_class: 'gnomenu-panel-box' });
        
        this._buttonOne = new MenuButton("Gno", "view-grid-symbolic", true);
        this._buttonOne.setMenu(new Menu(this._buttonOne.actor, settings));
        this.actor.add(this._buttonOne.container);
        
        //this._buttonTwo = new PanelButton("World!", null, true, Lang.bind(this, function() {
        //    global.log("sssss");
        //}));
        //this.actor.add(this._buttonTwo.container);
    },

    destroy: function() {
        this.actor.destroy();
        this._buttonOne.destroy();
        //this._buttonTwo.destroy();
    }
});



const ActivitiesButton = new Lang.Class({

    Name: 'Gnomenu.panel.ActivitiesButton',


    _init: function() {
        this._activitiesBtn = Main.panel.statusArea['activities'];
    },

    hide: function() {
        if (this._activitiesBtn != null) {
            this._activitiesBtn.actor.hide();
        }
    },

    show: function() {
        if (this._activitiesBtn) {
            this._activitiesBtn.actor.show();
        }
    },

    setCornerActive: function(active) {
        if (!active) {
            let primary = Main.layoutManager.primaryIndex;
            let corner = Main.layoutManager.hotCorners[primary];
            if (corner && corner.actor) {
                // This is GS 3.8+ fallback corner. Need to hide actor
                // to keep from triggering overview
                corner.actor.hide();
            } else {
                // Need to destroy corner to remove pressure barrier
                // to keep from triggering overview
                if (corner && corner._pressureBarrier) {
                    Main.layoutManager.hotCorners.splice(primary, 1);
                    corner.destroy();
                }
            }
        } else {
            let primary = Main.layoutManager.primaryIndex;
            let corner = Main.layoutManager.hotCorners[primary];
            if (corner && corner.actor) {
                // This is Gs 3.8+ fallback corner. Need to show actor
                // to trigger overview
                corner.actor.show();
            } else {
                // Need to create corner to setup pressure barrier
                // to trigger overview
                if (!corner || !corner._pressureBarrier) {
                    Main.layoutManager._updateHotCorners();
                }
            }
        }
    },
});
