
const Lang = imports.lang;
const St = imports.gi.St;
const IconTheme = imports.gi.Gtk.IconTheme;

const Main = imports.ui.main;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const MenuButton = Me.imports.scripts.panelbutton.MenuButton;
const PanelButton = Me.imports.scripts.panelbutton.PanelButton;
const Menu = Me.imports.scripts.menu.menu.Menu;
const StyleManager = Me.imports.scripts.misc.styleManager.StyleManager;



const PanelBox = new Lang.Class({

    Name: 'Gnomenu.panel.PanelBox',
    
        //this._buttonTwo = new PanelButton("World!", null, true, Lang.bind(this, function() {
        //    global.log("sssss");
        //}));
        //this.actor.add(this._buttonTwo.container);

    _init: function(settings) {
        this._settings = settings;
        
        this.actor = new St.BoxLayout({ style_class: 'gnomenu-panel-box' });
        
        // Add extension icons to icon theme directory path
        // TODO: move this to enable/disable?
        // GS patch https://bugzilla.gnome.org/show_bug.cgi?id=675561
        let theme = IconTheme.get_default();
        theme.append_search_path(Me.path + "/icons");
    
    
        this._styleManager = new StyleManager(this._settings);
        if (!this._styleManager.load()) {
            log("Gnomenu.panel.PanelBox error"); 
        }
        
        this._createButtons(settings);
        this._connectToSettings(settings);
    },
    
    _createButtons: function() {
        this._viewButton = this._easyCreate('enable-workspace-button', 'workspace-button-text', 'enable-workspace-button-icon', 'workspace-button-icon', PanelButton);
        let workspaceBtnCallback = Lang.bind(this, function() {
            if (Main.overview.visible) {
                if (!Main.overview.viewSelector._showAppsButton.checked) {
                    Main.overview.hide();
                }
                Main.overview.viewSelector._showAppsButton.checked = false;
            } else {
                Main.overview.show();
            }
        });
        this._viewButton.setButtonHandler(workspaceBtnCallback);
        
        this._appsButton = this._easyCreate('enable-apps-button', 'apps-button-text', 'enable-apps-button-icon', 'apps-button-icon', PanelButton);
        let appsBtnCallback = Lang.bind(this, function() {
            if (Main.overview.visible) {
                if (Main.overview.viewSelector._showAppsButton.checked) {
                    Main.overview.hide();
                    Main.overview.viewSelector._showAppsButton.checked = false;
                } else {
                    Main.overview.viewSelector._showAppsButton.checked = true;
                }
            } else {
                Main.overview.show();
                Main.overview.viewSelector._showAppsButton.checked = true;
            }
        });
        this._appsButton.setButtonHandler(appsBtnCallback);
        
        this._menuButton = this._easyCreate('enable-menu-button', 'menu-button-text', 'enable-menu-button-icon', 'menu-button-icon', MenuButton);
        let menu = new Menu(this._menuButton.actor, this._settings);
        this._menuButton.setMenu(menu);
        this._menuButton.setHotspotActive(true);
    },
    
    _easyCreate: function(enableButtonID, labelID, enableIconID, iconID, buttonClass) {
        let text = this._settings.get_strv(labelID);
        let icon = null;
        if (this._settings.get_boolean(enableIconID)) {
            icon = this._settings.get_strv(iconID);
        }
        
        let btn = new buttonClass(String(text), String(icon));
        this.actor.add(btn.container);
        
        if (!this._settings.get_boolean(enableButtonID)) {
            btn.actor.hide();
        }
        
        return btn;
    },
    
    _connectToSettings: function(settings) {
        settings.connect('changed::enable-menu-button', Lang.bind(this, function() {
            if (settings.get_boolean('enable-menu-button')) {
                this._menuButton.actor.show();
            } else {
                this._menuButton.actor.hide();
            }
        }));
        settings.connect('changed::menu-button-text', Lang.bind(this, function() {
            this._menuButton.setLabelText(String(settings.get_strv('menu-button-text')));
        }));
        settings.connect('changed::enable-menu-button-icon', Lang.bind(this, function() {
            if (settings.get_boolean('enable-menu-button-icon')) {
                this._menuButton.setIconName(String(settings.get_strv('menu-button-icon')));
            } else {
                this._menuButton.setIconName("");
            }
        }));
        settings.connect('changed::menu-button-icon', Lang.bind(this, function() {
            this._menuButton.setIconName(String(settings.get_strv('menu-button-icon')));
        }));
        
        settings.connect('changed::menu-layout', Lang.bind(this, function() {
            this._styleManager.refresh();
            
            this._menuButton.menu.destroy();
            this._menuButton.menu = undefined;
            let menu = new Menu(this._menuButton.actor, settings);
            this._menuButton.setMenu(menu);
        }));
    },
    
    destroy: function() {
        this._menuButton.destroy();
        this.actor.destroy();
            
        this._styleManager.destroy();
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
