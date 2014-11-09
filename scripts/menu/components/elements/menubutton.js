
const Lang = imports.lang;
const Gio = imports.gi.Gio;
const St = imports.gi.St;
const DND = imports.ui.dnd;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

const Button = Me.imports.scripts.menu.components.elements.menubuttonBase.Button;
const DraggableButton = Me.imports.scripts.menu.components.elements.menubuttonBase.DraggableButton;
const ToggleButton = Me.imports.scripts.menu.components.elements.menubuttonBase.ToggleButton;



// #############################################################################
// #####   Button implementations


const IconButton = new Lang.Class({

    Name: 'Gnomenu.buttons.IconButton',
    Extends: Button,

    
    _init: function(mediator, icon, iconSize, hoverTitleID, hoverDescriptionID) {
        
        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item popup-submenu-menu-item gnomenu-icon-button', x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
            container_params: { vertical: true },
            icon_add_params:  { x_fill: false, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
            label_params:     {  },
            label_add_params: {  },
        };
        
        this.parent(icon, iconSize, null, hoverTitleID, hoverDescriptionID, params);
        this.actor._delegate = this;
        
        this.setTitleChanger(mediator.getFocusedTitleChanger());
        this.setDescriptionChanger(mediator.getFocusedDescriptionChanger());
    }
});

const TextButton = new Lang.Class({
    
    Name: 'GnoMenu.buttons.TextButton',
    Extends: Button,
    
    
    _init: function (mediator, labelID, hoverTitleID, hoverDescriptionID) {
        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item popup-submenu-menu-item gnomenu-text-button', x_align: St.Align.START, y_align: St.Align.START },
            container_params: {  },
            icon_add_params:  {  },
            label_params:     { style_class: 'gnomenu-text-button-label' },
            label_add_params: { x_fill: true, y_fill: true, x_align: St.Align.START, y_align: St.Align.MIDDLE },
        };
        
        this.parent(null, 0, labelID, hoverTitleID, hoverDescriptionID, params);
        this.actor._delegate = this;
        
        this.setTitleChanger(mediator.getFocusedTitleChanger());
        this.setDescriptionChanger(mediator.getFocusedDescriptionChanger());
    },
});



// #############################################################################
// #####   Togglebutton implememtations


const IconToggleButton = new Lang.Class({

    Name: 'Gnomenu.buttons.IconToggleButton',
    Extends: ToggleButton,
    
    
    _init: function(mediator, icon, iconSize, hoverTitleID, hoverDescriptionID) {
        
        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item popup-submenu-menu-item gnomenu-iconToggle-button', x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
            container_params: { vertical: true },
            icon_add_params:  { x_fill: false, y_fill: false,x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
            label_params:     {  },
            label_add_params: {  },
        };
        
        this.parent(icon, iconSize, null, hoverTitleID, hoverDescriptionID, params);
        this.actor._delegate = this;
        
        this.setTitleChanger(mediator.getFocusedTitleChanger());
        this.setDescriptionChanger(mediator.getFocusedDescriptionChanger());
    },
});


const TextToggleButton = new Lang.Class({

    Name: 'Gnomenu.buttons.TextToggleButton',
    Extends: ToggleButton,
    
    
    _init: function(mediator, labelTextID, hoverTitleID, hoverDescriptionID) {
        
        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item popup-submenu-menu-item gnomenu-textToggle-button', x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
            container_params: { vertical: true },
            icon_add_params:  {  },
            label_params:     { style_class: 'gnomenu-textToggle-button-label' },
            label_add_params: { x_fill: false, y_fill: true,x_align: St.Align.MIDDLE, y_align: St.Align.START },
        };
        
        this.parent(null, 0, labelTextID, hoverTitleID, hoverDescriptionID, params);
        this.actor._delegate = this;
        
        this.setTitleChanger(mediator.getFocusedTitleChanger());
        this.setDescriptionChanger(mediator.getFocusedDescriptionChanger());
    },
});



// #############################################################################
// #####   Draggable button implememtations

const DraggableIconButton = new Lang.Class({
    
    Name: 'GnoMenu.buttons.DraggableIconButton',
    Extends: DraggableButton,
    
    
    _init: function(mediator, iconSize, launchable) {
        this._launchable = launchable;
        this._mediator = mediator;
        
        let icon = launchable.getIcon();
        let hoverTitle = launchable.getName();
        let hoverDescription = launchable.getDescription();
        
        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item gnomenu-appIcon-button', x_align: St.Align.MIDDLE, y_align: St.Align.START },
            container_params: {  },
            icon_add_params:  { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE },
            label_params:     {  },
            label_add_params: {  },
        };
        
        this.parent(icon, iconSize, null, hoverTitle, hoverDescription, params);
        this.actor._delegate = this;
        
        this.setTitleChanger(mediator.getFocusedTitleChanger());
        this.setDescriptionChanger(mediator.getFocusedDescriptionChanger());
        
        this.setOnLeftClickHandler(Lang.bind(this, function(actor, event) {
            
            this._launchable.launch(true, { timestamp: event.get_time() });
            this._mediator.closeMenu();
            this._mediator.hideOverview();
            
        }));
        
        this.setOnMiddleClickHandler(Lang.bind(this, function(actor, event) {
            
            this._launchable.launch(false, { timestamp: event.get_time() });
            this._mediator.closeMenu();
            this._mediator.hideOverview();
            
        }));
    },
    
    _onDragBeginCB: function() {
        this._mediator.onDragBegin();
    },
    
    _onDragCancelledCB: function() {
        this._mediator.onDragCancelled();
    },
    
    _onDragEndCB: function() {
        this._mediator.onDragEnd();
    },
    
    shellWorkspaceLaunch : function(params) {
        if (this._launchable) {
            this._launchable.launch(true, params);
        }
    },
});


const DraggableGridButton = new Lang.Class({
    
    Name: 'GnoMenu.buttons.DraggableGridButton',
    Extends: DraggableButton,
    
    
    _init: function(mediator, iconSize, launchable) {
        this._launchable = launchable;
        this._mediator = mediator;
        
        let icon = launchable.getIcon();
        let hoverTitle = launchable.getName();
        let hoverDescription = launchable.getDescription();
        
        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item gnomenu-appGrid-button', x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
            container_params: { vertical: true },
            icon_add_params:  { x_fill: false, y_fill: false,x_align: St.Align.MIDDLE, y_align: St.Align.START },
            label_params:     { style_class: 'gnomenu-appGrid-button-label' },
            label_add_params: { x_fill: false, y_fill: true,x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
        };
        
        this.parent(icon, iconSize, null, hoverTitle, hoverDescription, params);
        this.actor._delegate = this;
        
        this.setTitleChanger(mediator.getFocusedTitleChanger());
        this.setDescriptionChanger(mediator.getFocusedDescriptionChanger());
        
        this.setOnLeftClickHandler(Lang.bind(this, function(actor, event) {
            
            this._launchable.launch(true, { timestamp: event.get_time() });
            this._mediator.closeMenu();
            this._mediator.hideOverview();
            
        }));
        
        this.setOnMiddleClickHandler(Lang.bind(this, function(actor, event) {
            
            this._launchable.launch(false, { timestamp: event.get_time() });
            this._mediator.closeMenu();
            this._mediator.hideOverview();
            
        }));
    },
    
    _onDragBeginCB: function() {
        this._mediator.onDragBegin();
    },
    
    _onDragCancelledCB: function() {
        this._mediator.onDragCancelled();
    },
    
    _onDragEndCB: function() {
        this._mediator.onDragEnd();
    },
    
    shellWorkspaceLaunch : function(params) {
        if (this._launchable) {
            this._launchable.launch(true, params);
        }
    },
});


const DraggableListButton = new Lang.Class({
    
    Name: 'GnoMenu.buttons.DraggableListButton',
    Extends: DraggableButton,
    
    
    _init: function(mediator, iconSize, launchable) {
        this._launchable = launchable;
        this._mediator = mediator;
        
        let icon = launchable.getIcon();
        let name = launchable.getName();
        let hoverTitle = launchable.getName();
        let hoverDescription = launchable.getDescription();
        
        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item gnomenu-appList-button', x_align: St.Align.START, y_align: St.Align.MIDDLE },
            container_params: {  },
            icon_add_params:  { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE },
            label_params:     { style_class: 'gnomenu-appList-button-label' },
            label_add_params: { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE },
        };
        
        this.parent(icon, iconSize, name, hoverTitle, hoverDescription, params);
        this.actor._delegate = this;

        this.setTitleChanger(mediator.getFocusedTitleChanger());
        this.setDescriptionChanger(mediator.getFocusedDescriptionChanger());
        
        this.setOnLeftClickHandler(Lang.bind(this, function(actor, event) {
            
            this._launchable.launch(true, { timestamp: event.get_time() });
            this._mediator.closeMenu();
            this._mediator.hideOverview();
            
        }));
        
        this.setOnMiddleClickHandler(Lang.bind(this, function(actor, event) {
            
            this._launchable.launch(false, { timestamp: event.get_time() });
            this._mediator.closeMenu();
            this._mediator.hideOverview();
            
        }));
    },
    
    _onDragBeginCB: function() {
        this._mediator.onDragBegin();
    },
    
    _onDragCancelledCB: function() {
        this._mediator.onDragCancelled();
    },
    
    _onDragEndCB: function() {
        this._mediator.onDragEnd();
    },
    
    shellWorkspaceLaunch : function(params) {
        if (this._launchable) {
            this._launchable.launch(true, params);
        }
    },
});

// #############################################################################



const DraggableSearchGridButton = new Lang.Class({
    
    Name: 'GnoMenu.buttons.DraggableSearchGridButton',
    Extends: DraggableButton,
    
    
    _init: function(mediator, iconSize, searchResult) {
        this._searchResult = searchResult;
        this._mediator = mediator;
        
        let icon = searchResult.getIcon();
        let hoverTitle = searchResult.getName();
        let hoverDescription = searchResult.getDescription();
        
        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item gnomenu-appGrid-button', x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
            container_params: { vertical: true },
            icon_add_params:  { x_fill: false, y_fill: false,x_align: St.Align.MIDDLE, y_align: St.Align.START },
            label_params:     { style_class: 'gnomenu-appGrid-button-label' },
            label_add_params: { x_fill: false, y_fill: true,x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
        };
        
        this.parent(icon, iconSize, null, hoverTitle, hoverDescription, params);
        this.actor._delegate = this;
        
        this.setTitleChanger(mediator.getFocusedTitleChanger());
        this.setDescriptionChanger(mediator.getFocusedDescriptionChanger());
        
        this.setOnLeftClickHandler(Lang.bind(this, function(actor, event) {
            
            this._searchResult.launch(true, { timestamp: event.get_time() });
            this._mediator.closeMenu();
            this._mediator.hideOverview();
            
        }));
        
        this.setOnMiddleClickHandler(Lang.bind(this, function(actor, event) {
            
            this._searchResult.launch(false, { timestamp: event.get_time() });
            this._mediator.closeMenu();
            this._mediator.hideOverview();
            
        }));
    },
    
    _onDragBeginCB: function() {
        this._mediator.onDragBegin();
    },
    
    _onDragCancelledCB: function() {
        this._mediator.onDragCancelled();
    },
    
    _onDragEndCB: function() {
        this._mediator.onDragEnd();
    },
    
    shellWorkspaceLaunch : function(params) {
        if (this._searchResult) {
            this._searchResult.launch(true, params);
        }
    },
});


const DraggableSearchListButton = new Lang.Class({
    
    Name: 'GnoMenu.buttons.DraggableSearchListButton',
    Extends: DraggableButton,
    
    
    _init: function(mediator, iconSize, searchResult) {
        this._searchResult = searchResult;
        this._mediator = mediator;
        
        let icon = searchResult.getIcon();
        let name = searchResult.getName();
        let hoverTitle = searchResult.getName();
        let hoverDescription = searchResult.getDescription();
        
        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item gnomenu-appList-button', x_align: St.Align.START, y_align: St.Align.MIDDLE },
            container_params: {  },
            icon_add_params:  { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE },
            label_params:     { style_class: 'gnomenu-appList-button-label' },
            label_add_params: { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE },
        };
        
        this.parent(icon, iconSize, name, hoverTitle, hoverDescription, params);
        this.actor._delegate = this;

        this.setTitleChanger(mediator.getFocusedTitleChanger());
        this.setDescriptionChanger(mediator.getFocusedDescriptionChanger());
        
        this.setOnLeftClickHandler(Lang.bind(this, function(actor, event) {
            
            this._searchResult.launch(true, { timestamp: event.get_time() });
            this._mediator.closeMenu();
            this._mediator.hideOverview();
            
        }));
        
        this.setOnMiddleClickHandler(Lang.bind(this, function(actor, event) {
            
            this._searchResult.launch(false, { timestamp: event.get_time() });
            this._mediator.closeMenu();
            this._mediator.hideOverview();
            
        }));
    },
    
    _onDragBeginCB: function() {
        this._mediator.onDragBegin();
    },
    
    _onDragCancelledCB: function() {
        this._mediator.onDragCancelled();
    },
    
    _onDragEndCB: function() {
        this._mediator.onDragEnd();
    },
    
    shellWorkspaceLaunch : function(params) {
        if (this._searchResult) {
            this._searchResult.launch(true, params);
        }
    },
});
