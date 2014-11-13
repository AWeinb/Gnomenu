/*
    Copyright (C) 2014-2015, THE PANACEA PROJECTS <panacier@gmail.com>
    Copyright (C) 2014-2015, AxP <Der_AxP@t-online.de>
  
    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.
    
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    
    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software Foundation,
    Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301  USA
*/

const Lang = imports.lang;
const St = imports.gi.St;
const Gtk = imports.gi.Gtk;
const Clutter = imports.gi.Clutter;
const Mainloop = imports.mainloop;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Constants = Me.imports.scripts.constants;
const Log = Me.imports.scripts.misc.log;
const GnoMenuThumbnailsBox = Me.imports.scripts.menu.components.elements.workspaceThumbnail.GnoMenuThumbnailsBox;
const TextButton = Me.imports.scripts.menu.components.elements.menubutton.TextButton;
const UpdateableComponent = Me.imports.scripts.menu.components.component.UpdateableComponent;

const ECategoryID = Constants.ECategoryID;
const EEventType = Constants.EEventType;
const ESelectionMethod = Constants.ESelectionMethod;

const WORKSPACE_SWITCH_WAIT_TIME = 200;
const CATEGORY_SWITCH_WAIT_TIME = 50;


const NavigationBox = new Lang.Class({

    Name: 'Gnomenu.navigationArea.NavigationBox',
    
    
    _init: function(params) {
        this.actor = new St.BoxLayout(params);
    },
    
    hide: function() {
        if (this.actor.visible) {
            this.actor.hide();
        }
    },
    
    show: function() {
        if (!this.actor.visible) {
            this.actor.show();
        }
    },
    
    isVisible: function() {
        return this.actor.visible;  
    },
    
    toggleVisibility: function() {
        if (this.actor.visible) {
            this.hide();
        } else {
            this.show();
        }
    },
});



const WorkspaceBox = new Lang.Class({

    Name: 'Gnomenu.navigationArea.WorkspaceBox',
    Extends: NavigationBox,
    
    
    _init: function(model, mediator) {
        this.parent({ style_class: 'gnomenu-workspaces-box', vertical: true });
        
        this.thumbnailsBox = new GnoMenuThumbnailsBox(mediator, model);
        this.actor.add(this.thumbnailsBox.actor);
        
		this.actor.connect('scroll-event', Lang.bind(this, this._onScrollEvent));
    },
    
    hide: function() {
        if (this.actor.visible) {
            this.actor.hide();
            
            this.thumbnailsBox.destroyThumbnails();
        }
    },
    
    show: function() {
        if (!this.actor.visible) {
            this.actor.show();
            
            this.thumbnailsBox.createThumbnails();
            this.actor.height = this.thumbnailsBox.actor.height;
        }
    },
    
	_onScrollEvent : function(actor, event) {
        /**
         * @author scroll-workspaces@gfxmonk.net
         * Modified by AxP
         */
		let diff = 0;
		let direction = event.get_scroll_direction();
		if (direction == Clutter.ScrollDirection.DOWN) {
			diff = 1;
		} else if (direction == Clutter.ScrollDirection.UP) {
			diff = -1;
		} else {
			return Clutter.EVENT_PROPAGATE;
		}
		this._switch(diff);
        
        return Clutter.EVENT_STOP;
	},
    
    activateNext: function() {
        this._switch(+1);
    },
    
    activatePrevious: function() {
        this._switch(-1);
    },
    
    _switch: function(diff) {
        /**
         * @author scroll-workspaces@gfxmonk.net
         * Modified by AxP
         */
        let currentTime = global.get_current_time();
		if (currentTime > this._lastScroll && currentTime < this._lastScroll + WORKSPACE_SWITCH_WAIT_TIME) {
            return;
		}
		this._lastScroll = currentTime;

		let newIndex = global.screen.get_active_workspace().index() + diff;
        let metaWorkspace = global.screen.get_workspace_by_index(newIndex);
		if (metaWorkspace) {
            metaWorkspace.activate(true);
        }
    },
    
    _onDragBegin: function() {
        this.thumbnailsBox.onDragBegin();
    },
    
    _onDragCancelled: function() {
        this.thumbnailsBox.onDragCancelled();
    },
    
    _onDragEnd: function() {
        this.thumbnailsBox.onDragEnd();
    },
    
    destroy: function() {
        if (this._actorLeaveEventID) {
            this.actor.disconnect(this._actorLeaveEventID);
        }
        this.actor.destroy();
    }
});



const CategoryBox = new Lang.Class({

    Name: 'Gnomenu.navigationArea.CategoryBox',
    Extends: NavigationBox,
    
    
    _init: function(model, mediator) {
        this.parent({ style_class: 'gnomenu-categories-box', vertical: true });
        
        this._mediator = mediator;
        this._model = model;
        this._categoryButtonMap = {};
        this._selected = null;
    },
    
    clear: function() {
        for each (let btn in this._categoryButtonMap) {
            btn.actor.destroy();
        }
        this._categoryButtonMap = {};  
        this._selected = null;
    },
    
    selectCategory: function(categoryID) {
        for each (let btn in this._categoryButtonMap) {
            btn.deselect();
        }
        
        if (categoryID && this._categoryButtonMap[categoryID]) {
            this._categoryButtonMap[categoryID].select();
            this._selected = categoryID;
        }
    },
    
    activateNext: function() {
        if (!this._selected) {
            return;
        }
        
        let currentTime = global.get_current_time();
		if (this._tLastScroll && currentTime < this._tLastScroll + CATEGORY_SWITCH_WAIT_TIME) {
            return;
		}
		this._tLastScroll = currentTime;
        
        let keys = Object.keys(this._categoryButtonMap);
        let selectedIdx = keys.indexOf(this._selected);
        let nextIdx = (selectedIdx + 1) % keys.length;
        let nextID = keys[nextIdx];
        
        this.selectCategory(nextID);
        this._mediator.selectMenuCategory(nextID);
    },
    
    activatePrevious: function() {
        if (!this._selected) {
            return;
        }
        
        let currentTime = global.get_current_time();
		if (this._tLastScroll && currentTime < this._tLastScroll + CATEGORY_SWITCH_WAIT_TIME) {
            return;
		}
		this._tLastScroll = currentTime;
        
        let keys = Object.keys(this._categoryButtonMap);
        let selectedIdx = keys.indexOf(this._selected);
        let previousIdx = selectedIdx - 1;
        if (previousIdx < 0) {
            previousIdx += keys.length;
        }
        let previousID = keys[previousIdx];
        
        this.selectCategory(previousID);
        this._mediator.selectMenuCategory(previousID);
    },
    
    addCategory: function(categoryID, categoryNameID, categoryDescriptionID) {
        if (this._categoryButtonMap[categoryID]) {
            return;
        }
        
        if (!categoryNameID) {
            categoryNameID = categoryID;
        }
        
        let btn = new TextButton(this._mediator, categoryNameID, categoryNameID, categoryDescriptionID);
        switch (this._model.getCategorySelectionMethod()) {
            
            case ESelectionMethod.CLICK:
                btn.setOnLeftClickHandler(Lang.bind(this, function() {
                    this._mediator.selectMenuCategory(categoryID);
                }));
                break;
            
            case ESelectionMethod.HOVER:
                btn.setOnHoverHandler(Lang.bind(this, function() {
                    this._mediator.selectMenuCategory(categoryID);
                }));
                break;
            
            default:
                break;
        }
        this._categoryButtonMap[categoryID] = btn;
        this.actor.add_actor(btn.actor);
    },
    
    destroy: function() {
        this.clear();
        this.actor.destroy();
    }
});


const NavigationArea = new Lang.Class({

    Name: 'Gnomenu.navigationArea.NavigationArea',
    Extends: UpdateableComponent,
    
    
    _init: function(model, mediator) {
        this.parent(model, mediator);
        
        this._mainbox = new St.BoxLayout({ style_class: 'gnomenu-categories-workspaces-wrapper', vertical: false });
        this._workspaceBox = new WorkspaceBox(model, mediator);
        this._categoryBox = new CategoryBox(model, mediator);
        this._mainbox.add(this._workspaceBox.actor, { expand: true, x_fill: true });
        this._mainbox.add(this._categoryBox.actor, { expand: true, x_fill: true });
        
        let scrollBox = new St.ScrollView({ reactive: true, style_class: 'gnomenu-categories-workspaces-scrollbox' });
        scrollBox.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.NEVER);
        scrollBox.set_mouse_scrolling(true);
        scrollBox.add_actor(this._mainbox, { expand: true, x_fill: true });
        scrollBox.connect('button-release-event', Lang.bind(this, function(actor, event) {
            let button = event.get_button();
            if (button == 3) { //right click
                this.toggleView();
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        }));
        this.actor = scrollBox;
        
        this._workspaceBox.actor.add_constraint(new Clutter.BindConstraint({ name: 'constraint', source: this._categoryBox.actor, coordinate: Clutter.BindCoordinate.WIDTH, offset: 0 }));
        this._workspaceBox.hide();
        
        this._keyPressID = this.actor.connect('key_press_event', Lang.bind(this, this._onKeyboardEvent));
        
        this.update();
    },
    
    refresh: function() {
        this.update();
    },
    
    _onKeyboardEvent: function(actor, event) {
        log("NavigationArea received key event!");
        
        let receiver = null;
        if (this._workspaceBox.isVisible()) {
            receiver = this._workspaceBox;
        } else {
            receiver = this._categoryBox;
        }
        
        let returnVal = Clutter.EVENT_PROPAGATE;
        if (receiver) {
            let state = event.get_state();
            let ctrl_pressed = (state & imports.gi.Clutter.ModifierType.CONTROL_MASK ? true : false);
            let symbol = event.get_key_symbol();
            
            switch (symbol) {
                
                case Clutter.Up:
                    returnVal = Clutter.EVENT_STOP;
                    receiver.activatePrevious();
                    break;
                
                case Clutter.Down:
                    receiver.activateNext();
                    returnVal = Clutter.EVENT_STOP;
                    break;
                
                case Clutter.w:
                    if (ctrl_pressed) {
                        receiver.activatePrevious();
                        returnVal = Clutter.EVENT_STOP;
                    }
                    break;
                
                case Clutter.s:
                    if (ctrl_pressed) {
                        receiver.activateNext();
                        returnVal = Clutter.EVENT_STOP;
                    }
                    break;
                
                case Clutter.KEY_Tab:
                    this.toggleView();
                    returnVal = Clutter.EVENT_STOP;
                    break;
                
                case Clutter.KEY_Return:
                    if (this._workspaceBox.isVisible()) {
                        this.mediator.closeMenu();
                        returnVal = Clutter.EVENT_STOP;
                    }
                    break;
                
                case Clutter.Left:
                    //this.mediator.focusSidebar();
                    this.mediator.moveKeyFocusLeft();
                    returnVal = Clutter.EVENT_STOP;
                    break;
                
                case Clutter.Right:
                    //this.mediator.focusMainArea();
                    this.mediator.moveKeyFocusRight();
                    returnVal = Clutter.EVENT_STOP;
                    break;
                
                case Clutter.a:
                    if (ctrl_pressed) {
                        this.mediator.moveKeyFocusLeft();
                        //this.mediator.focusSidebar();
                        returnVal = Clutter.EVENT_STOP;
                    }
                    break;
                
                case Clutter.d:
                    if (ctrl_pressed) {
                        //this.mediator.focusMainArea();
                        this.mediator.moveKeyFocusRight();
                        returnVal = Clutter.EVENT_STOP;
                    }
                    break;
            }
        }
        
        return returnVal;
    },
    
    _onDragBegin: function() {
        this.showWorkspaces();
        this._workspaceBox._onDragBegin();
    },
    
    _onDragCancelled: function() {
        this._workspaceBox._onDragCancelled();
    },
    
    _onDragEnd: function() {
        this.showCategories(true);
        this._workspaceBox._onDragEnd();
    },
    
    showCategories: function(withTimeout) {
        if (withTimeout) {
            if (this._stopResetID) this.actor.disconnect(this._stopResetID);
            if (this._resetTimeoutId) Mainloop.source_remove(this._resetTimeoutId);
            this._stopResetID = this.actor.connect('motion_event', Lang.bind(this, this.showWorkspaces));
            this._resetTimeoutId = Mainloop.timeout_add(250, Lang.bind(this, function() {
                if (this._stopResetID) this.actor.disconnect(this._stopResetID);
                this._stopResetID = 0;
                this._resetTimeoutId = 0;
                this.toggleView();
                return false;
            }));
            
        } else {
            this._workspaceBox.hide();
            this._categoryBox.show();
        }
    },
    
    showWorkspaces: function() {
        if (this._stopResetID) this.actor.disconnect(this._stopResetID);
        if (this._resetTimeoutId) Mainloop.source_remove(this._resetTimeoutId);
        this._stopResetID = 0;
        this._resetTimeoutId = 0;
        
        this._workspaceBox.show();
        this._categoryBox.hide();
        
        return Clutter.EVENT_STOP;
    },
    
    toggleView: function() {
        this._workspaceBox.toggleVisibility();
        this._categoryBox.toggleVisibility();
    },
    
    selectCategory: function(categoryID) {
        this._categoryBox.selectCategory(categoryID);
        this._workspaceBox.hide();
        this._categoryBox.show();
    },
    
    update: function(event) {
        if (!event || event.type == EEventType.APPS_EVENT_TYPE) {
            
            this._categoryBox.clear();
            
            switch (this.model.getDefaultShortcutAreaCategory()) {
                
                case ECategoryID.MOST_USED:
                    this._categoryBox.addCategory(ECategoryID.MOST_USED, ECategoryID.MOST_USED, null);
                    this._categoryBox.addCategory(ECategoryID.ALL_APPS, ECategoryID.ALL_APPS, null);
                    break;
                
                case ECategoryID.ALL_APPS:
                    this._categoryBox.addCategory(ECategoryID.ALL_APPS, ECategoryID.ALL_APPS, null);
                    this._categoryBox.addCategory(ECategoryID.MOST_USED, ECategoryID.MOST_USED, null);
                    break;
                
                default:
                    break;
            }
            
            let categories = this.model.getApplicationCategories();
            for (let categoryID in categories) {
                let categoryNameID = categories[categoryID];
                this._categoryBox.addCategory(categoryID, categoryNameID, null);
            }
            
            this.selectCategory(this.model.getDefaultShortcutAreaCategory());
        }
    },
    
    destroy: function() {
        
        this.actor.destroy();
        
        this._workspaceBox.destroy();
        this._categoryBox.destroy();
    },
});
