
const Lang = imports.lang;
const Signals = imports.signals;
const Atk = imports.gi.Atk;
const Clutter = imports.gi.Clutter;
const Shell = imports.gi.Shell;
const Meta = imports.gi.Meta;
const St = imports.gi.St;

const Button = imports.ui.panelMenu.Button;
const ButtonBox = imports.ui.panelMenu.ButtonBox;
const Main = imports.ui.main;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;


const PanelButton = new Lang.Class({

    Name: 'Gnomenu.panelbutton.PanelButton',
    Extends: ButtonBox,


    _init: function(nameText, iconName) {
        this.parent({ reactive: true,
                      can_focus: true,
                      track_hover: true,
                      accessible_name: nameText ? nameText : "",
                      accessible_role: Atk.Role.MENU });
        
        this._buttonHandler = null;
        this._buttonHandlerId = null;
        this._keybindingName = null;

        // The mainBox is a vertical layout with the hotspot at the top border and the actual button below.
        let mainBox = new St.BoxLayout({ style_class: 'gnomenu-panel-button', vertical: true });
        
        // The hotspot has height 1 and fires if entered with the mouse.
        this._hotspot = new Clutter.Actor({ reactive: true, opacity: 0, height: 1 });
        mainBox.add(this._hotspot);
        this._hotspotId = null;
        this._hotspotActive = false;
        
        // The bin is used to align the button vertically in the middle.
        // The box takes the icon on the left and the label on the right.
        let descBin = new St.Bin({reactive: true});
        
        let descBox = new St.BoxLayout();
        this._icon = new St.Icon({ margin_right: 2, style_class: 'system-status-icon gnomenu-panel-button-icon' });
        if (iconName) {
            this._icon.icon_name = iconName;
        }
        descBox.add(this._icon);
        this._label = new St.Label();
        if (nameText) {
            this._label.text = nameText;
        }
        descBox.add(this._label);
        descBin.set_child(descBox);
        
        // expand: true tells the system that the bin with the button should fill the place.
        mainBox.add(descBin, { expand: true });
        
        this.actor.add_actor(mainBox);
    },
    
    setIconName: function(iconName) {
        this._icon.icon_name = iconName;
    },
    
    setLabelText: function(text) {
        this._label.text = text;
    },
    
    setButtonHandler: function(handler) {
        if (this._buttonHandlerId) {
            this.actor.disconnect(this._buttonHandlerId);
            this._buttonHandlerId = null;
        }
        if (handler) {
            this._buttonHandlerId = this.actor.connect('button-press-event', handler);
        }
        this._buttonHandler = handler;
    },
    
    setHotspotActive: function(active) {
        if (this._hotspotId) {
            this._hotspot.disconnect(this._hotspotId);
            this._hotspotId = null;
        }
        if (this._buttonHandler && active) {
            this._hotspotId = this._hotspot.connect('enter-event', this._buttonHandler);
        }
        this._hotspotActive = active;
    },

    setKeyboardShortcut: function(settings, name) {
        if (this._keybindingName != null) {
            Main.wm.removeKeybinding(this._keybindingName);
            this._keybindingName = null;
        }
        if (name && settings && this._buttonHandler) {
            Main.wm.addKeybinding(String(name), settings, Meta.KeyBindingFlags.NONE, Shell.KeyBindingMode.NORMAL, this._buttonHandler);
            this._keybindingName = String(name);
        }
    },

    setSensitive: function(sensitive) {
        this.actor.reactive = sensitive;
        this.actor.can_focus = sensitive;
        this.actor.track_hover = sensitive;
    },

    destroy: function() {
        this.setKeyboardShortcut(null, null);
        this.actor.destroy();
    },

    // Override _onStyleChanged function
    _onStyleChanged: function(actor) {
        // Ignore HPadding
    }
});



const MenuButton = new Lang.Class({

    Name: 'Gnomenu.panelbutton.MenuButton',
    Extends: Button,

    
    _init: function(nameText, iconName) {
        this.parent(0.0, nameText, true);
        this.actor.add_style_class_name('panel-status-button');
    
        this._keybindingName = null;
        this._hotspotActive = false;
    
        // The mainBox is a vertical layout with the hotspot at the top border and the actual button below.
        let mainBox = new St.BoxLayout({ style_class: 'gnomenu-panel-button', vertical: true });
        
        // The hotspot has height 1 and fires if entered with the mouse.
        this._hotspot = new Clutter.Actor({ reactive: true, opacity: 0, height: 1 });
        this._hotspot.connect('enter-event', Lang.bind(this, this._onHotspotEntered));
        mainBox.add(this._hotspot);
        
        // The bin is used to align the button vertically in the middle.
        // The box takes the icon on the left and the label on the right.
        let descBin = new St.Bin({reactive: true});
        
        let descBox = new St.BoxLayout();
        this._icon = new St.Icon({ margin_right: 2, style_class: 'system-status-icon gnomenu-panel-button-icon' });
        if (iconName) {
            this._icon.icon_name = iconName;
        }
        descBox.add(this._icon);
        this._label = new St.Label();
        if (nameText) {
            this._label.text = nameText;
        }
        descBox.add(this._label);
        descBin.set_child(descBox);
        
        // expand: true tells the system that the bin with the button should fill the place.
        mainBox.add(descBin, {expand: true});
        
        this.actor.add_actor(mainBox);
    },
    
    setIconName: function(iconName) {
        this._icon.icon_name = iconName;
    },
    
    setLabelText: function(text) {
        this._label.text = text;
    },

    setHotspotActive: function(active) {
        this._hotspotActive = active;
    },

    _onHotspotEntered: function() {
        if (this._hotspotActive) {
            this.menu.toggle();
        }
    },

    setKeyboardShortcut: function(settings, name) {
        if (this._keybindingName) {
            Main.wm.removeKeybinding(this._keybindingName);
            this._keybindingName = null;
        }
        
        if (name && settings) {
            let handler = Lang.bind(this, function() {
                if (this.actor.visible) {
                    this.menu.toggle();
                }
            });
            Main.wm.addKeybinding(name, settings, Meta.KeyBindingFlags.NONE, Shell.KeyBindingMode.NORMAL, handler);
            this._keybindingName = name;
        }
    },
    
    destroy: function() {
        this._hotspot.destroy();
        this.menu.destroy();
        this.menu = undefined;
        
        this.setKeyboardShortcut(null, null, null);
        this.actor.destroy();
        this.container.destroy();
    },

    // Override _onStyleChanged function
    _onStyleChanged: function(actor) {
        // Ignore HPadding
    }
    
    // setSensitive: function(sensitive)
    // setMenu: function(menu)
    // destroy: function()
});