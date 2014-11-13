
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const Gio = imports.gi.Gio;
const St = imports.gi.St;

const DND = imports.ui.dnd;
const Main = imports.ui.main;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

//params parameter example:
//
//let params = {
//    actor_params:     {  },
//    container_params: {  },
//    icon_add_params:  {  },
//    label_params:     {  },
//    label_add_params: {  },
//};

//if(Clutter.EVENT_PROPAGATE == undefined) throw Error();
//if(Clutter.EVENT_STOP == undefined) throw Error();


const Button = new Lang.Class({

    Name: 'Gnomenu.menubuttonBase.Button',

    
    _init: function(icon, iconSize, labelTextID, hoverTitleID, hoverDescriptionID, params) {
        this._btnHandlers = [null, null, null, null];
        this._btnHoverHandler = null;
        this._hoverTitleChanger = null;
        this._hoverDescriptionChanger = null;
        
        this._hoverTitle = null;
        if (hoverTitleID) {
            this._hoverTitle = _(hoverTitleID);
        }
        
        this._hoverDescription = null;
        if (hoverDescriptionID) {
            this._hoverDescription = _(hoverDescriptionID);
        }

        let buttonbox = new St.BoxLayout(params.container_params);
        
        this._stIcon = null;
        if (icon && iconSize) {
            if (typeof icon == 'string') {
                this._stIcon = new St.Icon({ icon_name: icon, icon_size: iconSize });
            } else if (icon instanceof Gio.ThemedIcon || icon instanceof Gio.FileIcon) {
                this._stIcon = new St.Icon({ gicon: icon, icon_size: iconSize });
            } else {
                this._stIcon = icon;
            }
        }
        if (this._stIcon) {
            buttonbox.add(this._stIcon, params.icon_add_params);
        }
        
        this._stLabel = null;
        if (labelTextID) {
            this._stLabel = new St.Label(params.label_params);
            this._stLabel.set_text(_(labelTextID));
            buttonbox.add(this._stLabel, params.label_add_params);
        }

        this.actor = new St.Button(params.actor_params);
        this.actor.set_child(buttonbox);

        // --
        this._btnPressId = this.actor.connect('button-press-event', Lang.bind(this, this._onPress));
        this._btnReleaseId = this.actor.connect('button-release-event', Lang.bind(this, this._onRelease));
        this._btnEnterId = this.actor.connect('enter-event', Lang.bind(this, this._onEnter));
        this._btnLeaveId = this.actor.connect('leave-event', Lang.bind(this, this._onLeave));
        
        this.actor.connect('destroy', Lang.bind(this, this._onDestroy));
        this.actor._delegate = this;
        
        this.isSelected = false;
        this.id = undefined;
    },
    
    setID: function(id) {
        this.id = id;
    },
    
    getID: function() {
        return this.id;
    },
    
    setTitleChanger: function(changer) {
        this._hoverTitleChanger = changer;
    },
    
    setDescriptionChanger: function(changer) {
        this._hoverDescriptionChanger = changer;
    },
    

    setOnLeftClickHandler: function(handler) {
        this._btnHandlers[1] = handler;
    },
    
    setOnMiddleClickHandler: function(handler) {
        this._btnHandlers[2] = handler;
    },
    
    setOnRightClickHandler: function(handler) {
        this._btnHandlers[3] = handler;
    },
    
    setOnHoverHandler: function(handler) {
        this._btnHoverHandler = handler;
    },
    
    
    select: function() {
        this.actor.add_style_pseudo_class('open');
        this.isSelected = true;
    },
    
    deselect: function() {
        this.reset();
        this.isSelected = false;
    },
    
    
    reset: function() {
        this.actor.remove_style_pseudo_class('open');
        this.actor.remove_style_pseudo_class('pressed');
        this.actor.remove_style_pseudo_class('active');
        
        if (this._hoverTitleChanger) {
            this._hoverTitleChanger(null);
        }
        if (this._hoverDescriptionChanger) {
            this._hoverDescriptionChanger(null);
        }
    },
    
    _onRelease: function(actor, event) {
        let button = event.get_button();
        if (this._btnHandlers[button]) {
            return Clutter.EVENT_STOP;
        }
        
        return Clutter.EVENT_PROPAGATE;
    },
    
    _onPress: function(actor, event) {
        let button = event.get_button();
        
        if (this._btnHandlers[button]) {
            if (this._hoverTitleChanger) {
                this._hoverTitleChanger(null);
            }
            
            if (this._hoverDescriptionChanger) {
                this._hoverDescriptionChanger(null);
            }
            
            this._btnHandlers[button](actor, event);
            
            return Clutter.EVENT_STOP;
        }
        return Clutter.EVENT_PROPAGATE;
    },

    _onEnter: function(actor, event) {
        this.actor.add_style_pseudo_class('active');
        
        if (this._hoverTitleChanger) {
            this._hoverTitleChanger(this._hoverTitle);
        }
        
        if (this._hoverDescriptionChanger) {
            this._hoverDescriptionChanger(this._hoverDescription);
        }
        
        if (this._btnHoverHandler) {
            this._btnHoverHandler(actor, event);
            
            return Clutter.EVENT_STOP;
        }
        return Clutter.EVENT_PROPAGATE;
    },

    _onLeave: function(actor, event) {
        this.actor.remove_style_pseudo_class('active');
        
        if (this._hoverTitleChanger) {
            this._hoverTitleChanger(null);
        }
        
        if (this._hoverDescriptionChanger) {
            this._hoverDescriptionChanger(null);
        }
        
        return Clutter.EVENT_STOP;
    },
    
    _onDestroy: function() {
        this.actor.disconnect(this._btnPressId);
        this.actor.disconnect(this._btnReleaseId);
        this.actor.disconnect(this._btnEnterId);
        this.actor.disconnect(this._btnLeaveId);
    }
});



// =============================================================================

const ToggleButton = new Lang.Class({

    Name: 'Gnomenu.menubuttonBase.ToggleButton',
    Extends: Button,
    
    
    _init: function(icon, iconSize, labelTextID, hoverTitleID, hoverDescriptionID, params) {
        this.parent(icon, iconSize, labelTextID, hoverTitleID, hoverDescriptionID, params);
        this.actor._delegate = this;
        
        this.active = false;
        this.id = null;
        this._stateToggledCallback = null;
    },
    
    isSelected: function() {
        return this.active;
    },
    
    toggleState: function() {
        this.setState(!this.active);
        if (this._stateToggledCallback) {
            this._stateToggledCallback(this, this.active);
        }
    },
    
    setState: function(active) {
        if (active) {
            this.actor.add_style_pseudo_class('open');
            this.active = true;
            
        } else {
            this.actor.remove_style_pseudo_class('open');
            this.active = false;
        }
    },
    
    setStateToggledCallback: function(callback) {
        this._stateToggledCallback = callback;
    },
    
    _onPress: function(actor, event) {
        this.toggleState();
        if (this._hoverTitleChanger) {
            this._hoverTitleChanger(null);
        }
        
        if (this._hoverDescriptionChanger) {
            this._hoverDescriptionChanger(null);
        }
    
        let button = event.get_button();
        if (this._btnHandlers[button]) {
            this._btnHandlers[button](this.active);
            this.actor.remove_style_pseudo_class('pressed');
            this.actor.remove_style_pseudo_class('active');
            
            return Clutter.EVENT_STOP;
        }
        
        return Clutter.EVENT_PROPAGATE;
    },
});


// =============================================================================

const DraggableButton = new Lang.Class({

    Name: 'Gnomenu.menubuttonBase.DraggableButton',
    Extends: Button,
    
    
    _init: function(icon, iconSize, labelTextID, hoverTitleID, hoverDescriptionID, params) {
        this.parent(icon, iconSize, labelTextID, hoverTitleID, hoverDescriptionID, params);
        this.actor._delegate = this;
    
        this._gicon = null;
        this._iconName = null;
        if (typeof icon == 'string') {
            this._iconName = icon;
        } else if (icon instanceof St.Icon) {
            if (icon.gicon) {
                this._gicon = icon.gicon;
            } else {
                this._iconName = icon.icon_name;
            }
        }  else {
            this._gicon = icon;
        }
        this._iconSize = iconSize;
        
        this._draggable = DND.makeDraggable(this.actor);
        
        this._dragMonitor = null;
        this._dragIds = [];
        let id = 0;
        id = this._draggable.connect('drag-begin', Lang.bind(this, this._onDragBegin));
        this._dragIds.push(id);
        id = this._draggable.connect('drag-cancelled', Lang.bind(this, this._onDragCancelled));
        this._dragIds.push(id);
        id = this._draggable.connect('drag-end', Lang.bind(this, this._onDragEnd));
        this._dragIds.push(id);
        
        this.actor.connect('destroy', Lang.bind(this, this._onDestroy));
    },
    
    getDragActor: function() {
        if (!this._gicon && !this._iconName || !this._iconSize) {
            return new St.Icon({ icon_name: 'error', icon_size: 30 });
        }
        return new St.Icon({ gicon: this._gicon, icon_name: this._iconName, icon_size: this._iconSize });
    },

    getDragActorSource: function() {
        return this._stIcon;
    },
    
    _onRelease: function(actor, event) {
        let button = event.get_button();
        if (this._btnHandlers[button]) {
            if (this._hoverTitleChanger) {
                this._hoverTitleChanger(null);
            }
            
            if (this._hoverDescriptionChanger) {
                this._hoverDescriptionChanger(null);
            }
            
            this.actor.remove_style_pseudo_class('pressed');
            this.actor.remove_style_pseudo_class('active');
            
            this._btnHandlers[button](actor, event);
            
            return Clutter.EVENT_STOP;
        }
        
        return Clutter.EVENT_PROPAGATE;
    },
    
    _onPress: function(actor, event) {
        let button = event.get_button();
        
        if (this._btnHandlers[button]) {
            this.actor.add_style_pseudo_class('pressed');
            
            return Clutter.EVENT_PROPAGATE;
        }
        return Clutter.EVENT_PROPAGATE;
    },
    
    _onDragBegin: function() {
        this.reset();
        this.actor.opacity = 55;
        
        this._dragMonitor = {
            dragMotion: Lang.bind(this, this._onDragMotion)
        };
        
        DND.addDragMonitor(this._dragMonitor);
        
        this._onDragBeginCB();
    },
    
    _onDragBeginCB: function() {
    },
    
    _onDragMotion: function(dragEvent) {
        return DND.DragMotionResult.CONTINUE;
    },
    
    _onDragCancelled: function() {
        DND.removeDragMonitor(this._dragMonitor);

        this._onDragCancelledCB();
    },
    
    _onDragCancelledCB: function() {
    },
    
    _onDragEnd: function() {
        this.reset();
        this.actor.opacity = 255;
        
        DND.removeDragMonitor(this._dragMonitor);
        
        this._onDragEndCB();
    },
    
    _onDragEndCB: function() {
    },
    
    _onDestroy: function() {
        DND.removeDragMonitor(this._dragMonitor);
        
        for each (let id in this._dragIds) {
            if (id > 0) {
                this._draggable.disconnect(id);
            }
        }
        this._dragIds = [];
    },
});
