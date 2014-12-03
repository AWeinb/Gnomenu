
const Lang = imports.lang;
const St = imports.gi.St;

const Main = imports.ui.main;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const MenuButton = Me.imports.scripts.panelbutton.MenuButton;
const PanelButton = Me.imports.scripts.panelbutton.PanelButton;
const Menu = Me.imports.scripts.menu.menu.Menu;
const StyleManager = Me.imports.scripts.misc.styleManager.StyleManager;



const PanelBox = new Lang.Class({

    Name: 'Gnomenu.panel.PanelBox',
    

    _init: function(settings) {
        this._settings = settings;
        
        this.actor = new St.BoxLayout({ style_class: 'gnomenu-panel-box' });
    
        this._styleManager = new StyleManager(this._settings);
        if (!this._styleManager.load()) {
            log("Gnomenu.panel.PanelBox error"); 
        }
        
        this._createButtons(settings);
        this._connectToSettings(settings);
    },
    
    _createButtons: function() {
        this._workspaceButton = this._easyCreate('enable-workspace-button', 'workspace-button-text', 'enable-workspace-button-icon', 'workspace-button-icon', PanelButton);
        let workspaceBtnCallback = Lang.bind(this, function() {
            if (Main.overview.visible) {
                Main.overview.hide();
            } else {
                Main.overview.show();
                Main.overview.viewSelector._showAppsButton.checked = false;
            }
        });
        this._workspaceButton.setButtonHandler(workspaceBtnCallback);
        
        this._appsButton = this._easyCreate('enable-apps-button', 'apps-button-text', 'enable-apps-button-icon', 'apps-button-icon', PanelButton);
        let appsBtnCallback = Lang.bind(this, function() {
            if (Main.overview.visible) {
                Main.overview.hide();
                
            } else {
                Main.overview.show();
                Main.overview.viewSelector._showAppsButton.checked = true;
            }
        });
        this._appsButton.setButtonHandler(appsBtnCallback);
        
        this._menuButton = this._easyCreate('enable-menu-button', 'menu-button-text', 'enable-menu-button-icon', 'menu-button-icon', MenuButton);
        let menu = new Menu(this._menuButton.actor, this._settings);
        this._menuButton.setMenu(menu);
        this._menuButton.setHotspotActive(this._settings.get_boolean('disable-menu-hotspot'));
        if (this._settings.get_boolean('enable-menu-shortcut')) {
            this._menuButton.setKeyboardShortcut(this._settings, 'menu-shortcut-key');
        }
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
        this._settingsIDs = [];
        
        this._settingsIDs.push(settings.connect('changed::enable-workspace-button', Lang.bind(this, function() {
            if (settings.get_boolean('enable-workspace-button')) {
                this._workspaceButton.actor.show();
            } else {
                this._workspaceButton.actor.hide();
            }
        })));
        this._settingsIDs.push(settings.connect('changed::workspace-button-text', Lang.bind(this, function() {
            this._workspaceButton.setLabelText(String(settings.get_strv('workspace-button-text')));
        })));
        this._settingsIDs.push(settings.connect('changed::enable-workspace-button-icon', Lang.bind(this, function() {
            if (settings.get_boolean('enable-workspace-button-icon')) {
                this._workspaceButton.setIconName(String(settings.get_strv('workspace-button-icon')));
            } else {
                this._workspaceButton.setIconName("");
            }
        })));
        this._settingsIDs.push(settings.connect('changed::workspace-button-icon', Lang.bind(this, function() {
            this._workspaceButton.setIconName(String(settings.get_strv('workspace-button-icon')));
        })));
        
        
        this._settingsIDs.push(settings.connect('changed::enable-apps-button', Lang.bind(this, function() {
            if (settings.get_boolean('enable-apps-button')) {
                this._appsButton.actor.show();
            } else {
                this._appsButton.actor.hide();
            }
        })));
        this._settingsIDs.push(settings.connect('changed::apps-button-text', Lang.bind(this, function() {
            this._appsButton.setLabelText(String(settings.get_strv('apps-button-text')));
        })));
        this._settingsIDs.push(settings.connect('changed::enable-apps-button-icon', Lang.bind(this, function() {
            if (settings.get_boolean('enable-apps-button-icon')) {
                this._appsButton.setIconName(String(settings.get_strv('apps-button-icon')));
            } else {
                this._appsButton.setIconName("");
            }
        })));
        this._settingsIDs.push(settings.connect('changed::apps-button-icon', Lang.bind(this, function() {
            this._appsButton.setIconName(String(settings.get_strv('apps-button-icon')));
        })));
        
        
        this._settingsIDs.push(settings.connect('changed::enable-menu-button', Lang.bind(this, function() {
            if (settings.get_boolean('enable-menu-button')) {
                this._menuButton.actor.show();
            } else {
                this._menuButton.actor.hide();
            }
        })));
        this._settingsIDs.push(settings.connect('changed::menu-button-text', Lang.bind(this, function() {
            this._menuButton.setLabelText(String(settings.get_strv('menu-button-text')));
        })));
        this._settingsIDs.push(settings.connect('changed::enable-menu-button-icon', Lang.bind(this, function() {
            if (settings.get_boolean('enable-menu-button-icon')) {
                this._menuButton.setIconName(String(settings.get_strv('menu-button-icon')));
            } else {
                this._menuButton.setIconName("");
            }
        })));
        this._settingsIDs.push(settings.connect('changed::menu-button-icon', Lang.bind(this, function() {
            this._menuButton.setIconName(String(settings.get_strv('menu-button-icon')));
        })));
        this._settingsIDs.push(settings.connect('changed::disable-menu-hotspot', Lang.bind(this, function() {
            this._menuButton.setHotspotActive(settings.get_boolean('disable-menu-hotspot'));
        })));
        this._settingsIDs.push(settings.connect('changed::enable-menu-shortcut', Lang.bind(this, function() {
            if (settings.get_boolean('enable-menu-shortcut')) {
                this._menuButton.setKeyboardShortcut(settings, 'menu-shortcut-key');
            } else {
                this._menuButton.setKeyboardShortcut(settings, null);
            }
        })));
        this._settingsIDs.push(settings.connect('changed::menu-shortcut-key', Lang.bind(this, function() {
            if (settings.get_boolean('enable-menu-shortcut')) {
                this._menuButton.setKeyboardShortcut(settings, 'menu-shortcut-key');
            }
        })));
        
        
        this._settingsIDs.push(settings.connect('changed::menu-layout', Lang.bind(this, function() {
            this._styleManager.refresh();
            
            this._menuButton.menu.destroy();
            this._menuButton.menu = undefined;
            let menu = new Menu(this._menuButton.actor, settings);
            this._menuButton.setMenu(menu);
        })));
    },
    
    destroy: function() {
        for each (let id in this._settingsIDs) {
            try {
                this._settings.disconnect(id);
            } catch(e) {
                log(e);
            }
        }
        this._settingsIDs = undefined;
        
        this._workspaceButton.destroy();
        this._appsButton.destroy();
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
