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



/**
 * @class Button: This is the base class for all buttons.
 *
 * @param {Icon of some kind} icon The icon.
 * @param {Integer} iconSize The iconSize.
 * @param {String} labelTextID The gettext id of the label.
 * @param {String} hoverTitleID The gettext id of the title.
 * @param {String} hoverDescriptionID The gettext id of the description.
 * @param {Object} params
 *
 *
 * @author AxP
 * @version 1.0
 */
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

        // There are some kind of icons possible.
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
        this.actor._delegate = this;

        // --
        this._btnPressId = this.actor.connect('button-press-event', Lang.bind(this, this._onPress));
        this._btnReleaseId = this.actor.connect('button-release-event', Lang.bind(this, this._onRelease));
        this._btnEnterId = this.actor.connect('enter-event', Lang.bind(this, this._onEnter));
        this._btnLeaveId = this.actor.connect('leave-event', Lang.bind(this, this._onLeave));

        this.isSelected = false;
        this.id = undefined;
    },

    /**
     * @description Sets an id for the button.
     * @public
     * @function
     */
    setID: function(id) {
        this.id = id;
    },

    /**
     * @description Returns the id of the button.
     * @returns {Object}
     * @public
     * @function
     */
    getID: function() {
        return this.id;
    },

    /**
     * @description Sets a callback which changes a label on hover.
     * @param {function} changer
     * @public
     * @function
     */
    setTitleChanger: function(changer) {
        this._hoverTitleChanger = changer;
    },

    /**
     * @description Sets a callback which changes a label on hover.
     * @param {function} changer
     * @public
     * @function
     */
    setDescriptionChanger: function(changer) {
        this._hoverDescriptionChanger = changer;
    },

    /**
     * @description Sets a left click handler.
     * @param {function} handler
     * @public
     * @function
     */
    setOnLeftClickHandler: function(handler) {
        this._btnHandlers[1] = handler;
    },

    /**
     * @description Sets a middle click handler.
     * @param {function} handler
     * @public
     * @function
     */
    setOnMiddleClickHandler: function(handler) {
        this._btnHandlers[2] = handler;
    },

    /**
     * @description Sets a right click handler.
     * @param {function} handler
     * @public
     * @function
     */
    setOnRightClickHandler: function(handler) {
        this._btnHandlers[3] = handler;
    },

    /**
     * @description Sets a hover handler.
     * @param {function} handler
     * @public
     * @function
     */
    setOnHoverHandler: function(handler) {
        this._btnHoverHandler = handler;
    },

    /**
     * @description Marks the button as selected.
     * @public
     * @function
     */
    select: function() {
        this.actor.add_style_pseudo_class('open');
        
        if (this._hoverTitleChanger) {
            this._hoverTitleChanger(this._hoverTitle);
        }

        if (this._hoverDescriptionChanger) {
            this._hoverDescriptionChanger(this._hoverDescription);
        }
        
        this.isSelected = true;
    },

    /**
     * @description Removes the selection mark.
     * @public
     * @function
     */
    deselect: function() {
        this.reset();
        this.isSelected = false;
    },
    
    /**
     * @description Activates the button. Not implemented.
     * @public
     * @function
     */
    activate: function() {
        ;
    },

    /**
     * @description Resets the button.
     * @public
     * @function
     */
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

    /**
     * @description Function that is called in case of a release event.
     * @param actor
     * @param event
     * @returns {Boolean} Was the event handled?
     * @private
     * @function
     */
    _onRelease: function(actor, event) {
        let button = event.get_button();
        if (this._btnHandlers[button]) {
            return Clutter.EVENT_STOP;
        }

        return Clutter.EVENT_PROPAGATE;
    },

    /**
     * @description Function that is called in case of a press event.
     * @param actor
     * @param event
     * @returns {Boolean} Was the event handled?
     * @private
     * @function
     */
    _onPress: function(actor, event) {
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

    /**
     * @description Function that is called in case of a enter event.
     * @param actor
     * @param event
     * @returns {Boolean} Was the event handled?
     * @private
     * @function
     */
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

    /**
     * @description Function that is called in case of a leave event.
     * @param actor
     * @param event
     * @returns {Boolean} Was the event handled?
     * @private
     * @function
     */
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

    /**
     * @description Destroys the button.
     * @public
     * @function
     */
    destroy: function() {
        if (this._btnPressId) this.actor.disconnect(this._btnPressId);
        if (this._btnReleaseId) this.actor.disconnect(this._btnReleaseId);
        if (this._btnEnterId) this.actor.disconnect(this._btnEnterId);
        if (this._btnLeaveId) this.actor.disconnect(this._btnLeaveId);
        this._btnPressId = undefined;
        this._btnReleaseId = undefined;
        this._btnEnterId = undefined;
        this._btnLeaveId = undefined;
    }
});



// =============================================================================


/**
 * @class ToggleButton: This is the base class for all togglebuttons.
 * @extends Button
 *
 * @param {Icon of some kind} icon The icon.
 * @param {Integer} iconSize The iconSize.
 * @param {String} labelTextID The gettext id of the label.
 * @param {String} hoverTitleID The gettext id of the title.
 * @param {String} hoverDescriptionID The gettext id of the description.
 * @param {Object} params
 *
 *
 * @author AxP
 * @version 1.0
 */
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

    /**
     * @description Marks the button as selected.
     * @public
     * @function
     */
    select: function() {
        this.actor.add_style_pseudo_class('open');
        this.isSelected = true;
        this.active = true;
    },

    /**
     * @description Removes the selection mark.
     * @public
     * @function
     */
    deselect: function() {
        this.reset();
        this.isSelected = false;
        this.active = false;
    },
    
    /**
     * @description Returns wether the button is selected.
     * @returns {Boolean}
     * @public
     * @function
     */
    isSelected: function() {
        return this.active;
    },

    /**
     * @description Toggles the selection state of the button. This triggers
     *              a stateToggledCallback if this was provided.
     * @public
     * @function
     */
    toggleState: function() {
        this.setState(!this.active);
        if (this._stateToggledCallback) {
            this._stateToggledCallback(this, this.active);
        }
    },

    /**
     * @description Sets the state of the button.
     * @param {Boolean} active
     * @public
     * @function
     */
    setState: function(active) {
        if (active) {
            this.actor.add_style_pseudo_class('open');
            this.active = true;

        } else {
            this.actor.remove_style_pseudo_class('open');
            this.active = false;
        }
    },

    /**
     * @description Sets the function which is called when the state is changed.
     * @param {Function} callback
     * @public
     * @function
     */
    setStateToggledCallback: function(callback) {
        this._stateToggledCallback = callback;
    },

    /**
     * @description Function that is called in case of a press event.
     *              This overrides the base class to move the actual important
     *              event to the press event.
     * @param actor
     * @param event
     * @returns {Boolean} Was the event handled?
     * @private
     * @function
     */
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


/**
 * @class DraggableButton: This is the base class for all draggable buttons.
 * @extends Button
 *
 * @param {Icon of some kind} icon The icon.
 * @param {Integer} iconSize The iconSize.
 * @param {String} labelTextID The gettext id of the label.
 * @param {String} hoverTitleID The gettext id of the title.
 * @param {String} hoverDescriptionID The gettext id of the description.
 * @param {Object} params
 *
 *
 * @author AxP
 * @version 1.0
 */
const DraggableButton = new Lang.Class({

    Name: 'Gnomenu.menubuttonBase.DraggableButton',
    Extends: Button,


    _init: function(icon, iconSize, labelTextID, hoverTitleID, hoverDescriptionID, params) {
        this.parent(icon, iconSize, labelTextID, hoverTitleID, hoverDescriptionID, params);
        this.actor._delegate = this;

        // This needs to get sorted out to create the right drag icon.
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
    },

    /**
     * @description Returns the drag actor which in most cases is an icon.
     * @returns {St.Icon}
     * @public
     * @function
     */
    getDragActor: function() {
        if (!this._gicon && !this._iconName || !this._iconSize) {
            return new St.Icon({ icon_name: 'error', icon_size: 30 });
        }
        return new St.Icon({ gicon: this._gicon, icon_name: this._iconName, icon_size: this._iconSize });
    },

    /**
     * @description Returns the drag actor source which is the button icon.
     * @returns {St.Icon}
     * @public
     * @function
     */
    getDragActorSource: function() {
        return this._stIcon;
    },

    /**
     * @description Function that is called in case of a release event.
     *              For draggable buttons the important stuff is handled in the
     *              release method. Works better with drag and drop.
     * @param actor
     * @param event
     * @returns {Boolean} Was the event handled?
     * @private
     * @function
     */
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

    /**
     * @description Function that is called in case of a press event.
     * @param actor
     * @param event
     * @returns {Boolean} Was the event handled?
     * @private
     * @function
     */
    _onPress: function(actor, event) {
        let button = event.get_button();

        if (this._btnHandlers[button]) {
            this.actor.add_style_pseudo_class('pressed');

            return Clutter.EVENT_PROPAGATE;
        }
        return Clutter.EVENT_PROPAGATE;
    },

    /**
     * @description Function that is called in case of a drag-begin event.
     * @private
     * @function
     */
    _onDragBegin: function() {
        this.reset();
        // Fades out the button.
        this.actor.opacity = 55;

        this._dragMonitor = {
            dragMotion: Lang.bind(this, this._onDragMotion)
        };

        DND.addDragMonitor(this._dragMonitor);

        this._onDragBeginCB();
    },

    _onDragBeginCB: function() {
        // Implement this for it to be useful.
    },

    /**
     * @description Function that is called in case of a drag-motion event.
     * @private
     * @function
     */
    _onDragMotion: function(dragEvent) {
        return DND.DragMotionResult.CONTINUE;
    },

    /**
     * @description Function that is called in case of a drag-cancel event.
     * @private
     * @function
     */
    _onDragCancelled: function() {
        DND.removeDragMonitor(this._dragMonitor);

        this._onDragCancelledCB();
    },

    _onDragCancelledCB: function() {
        // Implement this for it to be useful.
    },

    /**
     * @description Function that is called in case of a drag-end event.
     * @private
     * @function
     */
    _onDragEnd: function() {
        this.reset();
        // Fades in the button.
        this.actor.opacity = 255;

        DND.removeDragMonitor(this._dragMonitor);

        this._onDragEndCB();
    },

    _onDragEndCB: function() {
        // Implement this for it to be useful.
    },

    /**
     * @description Destroys the button.
     * @public
     * @function
     */
    destroy: function() {
        if (this._btnPressId) this.actor.disconnect(this._btnPressId);
        if (this._btnReleaseId) this.actor.disconnect(this._btnReleaseId);
        if (this._btnEnterId) this.actor.disconnect(this._btnEnterId);
        if (this._btnLeaveId) this.actor.disconnect(this._btnLeaveId);
        this._btnPressId = undefined;
        this._btnReleaseId = undefined;
        this._btnEnterId = undefined;
        this._btnLeaveId = undefined;
        
        DND.removeDragMonitor(this._dragMonitor);

        for each (let id in this._dragIds) {
            if (id > 0) {
                this._draggable.disconnect(id);
            }
        }
        this._dragIds = [];
    },
});
