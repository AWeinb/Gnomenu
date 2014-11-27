/*
    Copyright (C) 2014-2015, THE PANACEA PROJECTS <panacier@gmail.com>

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

/**
 * Simple Enum which provides a mousebutton to id mapping.
 * @public
 * @enum {Integer}
 */
const EMousebutton = {

    MOUSE_LEFT:   1,
    MOUSE_MIDDLE: 2,
    MOUSE_RIGHT:  3,

};

/**
 * @class Button
 *
 * @classdesc This is the base class for all buttons. It provides all
 *            basic functionallity that can be fitted here without
 *            much more complexity. It does not need a model or mediator
 *            to work and should be extended for the use. Many of this
 *            methods are used in the subclasses in the menubutton module.
 *
 *            Some of the private callback methods here are only marginally
 *            implemented and need to be implemented by the subclass.
 *            For example the _notify methods.
 *
 *            The constructor should not fail in case you provide no
 *            icon and label. But it can fail if the icon is none
 *            of now used types.
 *
 *            Some methods need an integer button argument. The enum
 *            EMousebutton contains some useful information for this.
 *
 * @description This class takes as parameter not only icon and label but also
 *              parameters for its basic components.
 * 
 *
 * @param {Icon} icon The icon. The now working icon types are the Gio icons,
 *                    Clutter textures, and names.
 * @param {Integer} iconSize The iconSize.
 * @param {String} labelTextID The gettext id of the label.
 * @param {String} hoverTitleID The gettext id of the title.
 * @param {String} hoverDescriptionID The gettext id of the description.
 * @param {Object} params It is possible to provide some layout and pack
 *                        parameter in an map. It is possible to add more.
 *                        params parameter example:
 *
 *                        let params = {
 *                           actor_params:     {  },
 *                           container_params: {  },
 *                           icon_add_params:  {  },
 *                           label_params:     {  },
 *                           label_add_params: {  },
 *                        };
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const Button = new Lang.Class({

    Name: 'Gnomenu.menubuttonBase.Button',


    _init: function(icon, iconSize, labelTextID, params) {
        this._btnHandlers = [null, null, null, null];
        this._btnHoverHandler = null;

        let buttonbox = new St.BoxLayout(params.container_params);

        // There are some kind of icons possible.
        this._stIcon = null;
        if (icon && iconSize) {
            if (typeof icon == 'string') {
                // Iconnames
                this._stIcon = new St.Icon({ icon_name: icon, icon_size: iconSize });
            } else if (icon instanceof Gio.ThemedIcon || icon instanceof Gio.FileIcon) {
                // Some important Gio Icons.
                this._stIcon = new St.Icon({ gicon: icon, icon_size: iconSize });
            } else {
                // Clutter textures and others.
                this._stIcon = icon;
                this._stIcon.icon_size = iconSize;
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

        this._isSelected = false;
        this.id = undefined;
    },

    /**
     * @description Sets an id for the button.
     * @function
     * @memberOf Button#
     */
    setID: function(id) {
        this.id = id;
    },

    /**
     * @description Returns the id of the button.
     * @returns {Object}
     * @function
     * @memberOf Button#
     */
    getID: function() {
        return this.id;
    },

    /**
     * @description Sets a mouse handler for a specific mousebutton of the button.
     *              The handler for hover events is set in another method.
     * @param {Integer} button The id of the mousebutton. @see EMousebutton
     * @param {Function} handler The handler.
     * @function
     * @memberOf Button#
     */
    setHandlerForButton: function(button, handler) {
        // At the moment only good for the three normal mouse buttons.
        if (handler && button && button > 0 && button <= 3) {
            this._btnHandlers[button] = handler;
        }
    },

    /**
     * @description Sets a hover handler.
     * @param {function} handler
     * @function
     * @memberOf Button#
     */
    setOnHoverHandler: function(handler) {
        this._btnHoverHandler = handler;
    },

    /**
     * @description Returns the title of the button description.
     * @returns {String}
     * @function
     * @memberOf Button#
     */
    getButtonInfoTitle: function() {
        return this.buttonInfoTitle;
    },

    /**
     * @description Returns the button description.
     * @returns {String}
     * @function
     * @memberOf Button#
     */
    getButtonInfoDescription: function() {
        return this.buttonInfoDescription;
    },

    /**
     * @description Marks the button as selected.
     * @function
     * @memberOf Button#
     */
    select: function() {
        this.actor.add_style_pseudo_class('open');
        this._isSelected = true;
    },

    /**
     * @description Removes the selection mark.
     * @function
     * @memberOf Button#
     */
    deselect: function() {
        this.actor.remove_style_pseudo_class('open');
        this._isSelected = false;
    },

    /**
     * @description Returns wether the button is selected.
     * @returns {Boolean}
     * @function
     * @memberOf Button#
     */
    isSelected: function() {
        return this._isSelected;
    },

    /**
     * @description Resets the button.
     * @function
     * @memberOf Button#
     */
    reset: function() {
        this.actor.remove_style_pseudo_class('open');
        this.actor.remove_style_pseudo_class('pressed');
        this.actor.remove_style_pseudo_class('active');

        this._isSelected = false;
    },
    
    /**
     * @description Removes style modifier without valueable meaning.
     * @function
     * @memberOf Button#
     */
    clean: function() {
        this.actor.remove_style_pseudo_class('pressed');
        this.actor.remove_style_pseudo_class('active');
    },

    /**
     * @description This function does the same as a normal click would do.
     * @param {Integer} button The button id.
     * @param {Object} params Some parametersy.
     * @function
     * @memberOf Button#
     */
    activate: function(button, params) {
        if (button >= 0 && this._btnHandlers[button]) {
            this._btnHandlers[button](this.actor, null);
            this._notifyActivation(this.actor, null);
        } else {
            for each (let button in EMousebutton) {
                if (this._btnHandlers[button]) {
                    this._btnHandlers[button](this.actor, null);
                    this._notifyActivation(this.actor, null);
                    break;
                }
            }
        }
    },

    /**
     * To be implemented!
     * @callback
     * @memberOf Button#
     */
    _notifyActivation: function(actor, event) {
        // Is called when a button is activated.
    },

    /**
     * @description Function that is called in case of a release event.
     * @param actor
     * @param event
     * @returns {Boolean} Was the event handled?
     * @private
     * @function
     * @memberOf Button#
     */
    _onRelease: function(actor, event) {
        let button = event.get_button();
        if (this._btnHandlers[button]) {
            return Clutter.EVENT_STOP;
        }

        return Clutter.EVENT_PROPAGATE;
    },

    /**
     * @description Function that is called in case of a press event. It
     *              notifies then about an activation.
     * @param actor
     * @param event
     * @returns {Boolean} Was the event handled?
     * @private
     * @function
     * @memberOf Button#
     */
    _onPress: function(actor, event) {
        let button = event.get_button();

        if (this._btnHandlers[button]) {
            this.actor.remove_style_pseudo_class('pressed');
            this.actor.remove_style_pseudo_class('active');

            this._btnHandlers[button](actor, event);
            this._notifyActivation(actor, event);

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
     * @memberOf Button#
     */
    _onEnter: function(actor, event) {
        this.actor.add_style_pseudo_class('active');
        this._notifyHovered(actor, event, true);

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
     * @memberOf Button#
     */
    _onLeave: function(actor, event) {
        this.actor.remove_style_pseudo_class('active');
        this._notifyHovered(actor, event, false);

        return Clutter.EVENT_STOP;
    },

    /**
     * To be implemented.
     * @callback
     * @memberOf Button#
     */
    _notifyHovered: function(actor, event, entered) {
        // Called after a hover event happened.
    },

    /**
     * @description Destroys the button.
     * @function
     * @memberOf Button#
     */
    destroy: function() {
        this.actor.destroy();
    }
});



// =============================================================================


/**
 * @class InternalButton
 *
 * @classdesc This is a simple Button class derived from the normal Button class
 *            without activation callbacks.
 *
 *            @see Button
 *
 * @description @see Button
 * 
 *
 * @param {Icon} icon The icon. The now working icon types are the Gio icons,
 *                    Clutter textures, and names.
 * @param {Integer} iconSize The iconSize.
 * @param {String} labelTextID The gettext id of the label.
 * @param {String} hoverTitleID The gettext id of the title.
 * @param {String} hoverDescriptionID The gettext id of the description.
 * @param {Object} params @see Button
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const InternalButton = new Lang.Class({

    Name: 'Gnomenu.menubuttonBase.InternalButton',
    Extends: Button,


    _init: function(icon, iconSize, labelTextID, params) {
        this.parent(icon, iconSize, labelTextID, params);
    },
    

    /**
     * @description Function that is called in case of a press event. It
     *              notifies then about an activation.
     * @param actor
     * @param event
     * @returns {Boolean} Was the event handled?
     * @private
     * @function
     * @memberOf InternalButton#
     */
    _onPress: function(actor, event) {
        let button = event.get_button();

        if (this._btnHandlers[button]) {
            this.actor.remove_style_pseudo_class('pressed');
            this.actor.remove_style_pseudo_class('active');

            this._btnHandlers[button](actor, event);
            
            // no notify activation.

            return Clutter.EVENT_STOP;
        }
        return Clutter.EVENT_PROPAGATE;
    },
});


// =============================================================================



/**
 * @class ToggleButton
 * @extends InternalButton
 *
 * @classdesc This is the base class for all togglebuttons. It
 *            provides some special methods for this kind of button
 *            but keeps all buttons from the parent.
 *
 *            It is possible to set a callback for a toggled
 *            event with "setStateToggledCallback".
 *
 *            Please see the parent class. @see Button
 *
 * @description @see Button
 *
 * @param {Icon} icon The icon.
 * @param {Integer} iconSize The iconSize.
 * @param {String} labelTextID The gettext id of the label.
 * @param {String} hoverTitleID The gettext id of the title.
 * @param {String} hoverDescriptionID The gettext id of the description.
 * @param {Object} params
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const ToggleButton = new Lang.Class({

    Name: 'Gnomenu.menubuttonBase.ToggleButton',
    Extends: InternalButton,


    _init: function(icon, iconSize, labelTextID, params) {
        this.parent(icon, iconSize, labelTextID, params);
        this.actor._delegate = this;

        this._stateToggledCallback = null;
    },

    /**
     * @description Sets the function which is called when the state is changed.
     * @param {Function} callback
     * @function
     * @memberOf ToggleButton#
     */
    setStateToggledCallback: function(callback) {
        this._stateToggledCallback = callback;
    },

    /**
     * @description Toggles the selection state of the button. This triggers
     *              a stateToggledCallback if this was provided.
     * @function
     * @memberOf ToggleButton#
     */
    toggleState: function() {
        this.setState(!this.isSelected());

        if (this._stateToggledCallback) {
            this._stateToggledCallback(this, this.isSelected());
        }
    },

    /**
     * @description Sets the state of the button.
     * @param {Boolean} selected
     * @function
     * @memberOf ToggleButton#
     */
    setState: function(active) {
        if (active) {
            this.select();
        } else {
            this.deselect();
        }
    },

    /**
     * @description Function that is called in case of a press event.
     *              This overrides the base class to move the actual important
     *              event to the press event. This method triggers an
     *              activation event.
     * @param actor
     * @param event
     * @returns {Boolean} Was the event handled?
     * @private
     * @function
     * @memberOf ToggleButton#
     */
    _onPress: function(actor, event) {
        let button = event.get_button();
        if (this._btnHandlers[button]) {
            this.toggleState();
            
            this.actor.remove_style_pseudo_class('pressed');
            this.actor.remove_style_pseudo_class('active');

            this._btnHandlers[button](this.isSelected());

            return Clutter.EVENT_STOP;
        }

        return Clutter.EVENT_PROPAGATE;
    },
});


// =============================================================================


/**
 * @class DraggableButton
 * @extends Button
 *
 * @classdesc This is the base class for all draggable buttons. It
 *            is able to deal with DnD and notify about this events.
 *            You need to override the methods for this.
 *            The activation is shifted from onPress to onRelease.
 *
 *            Please see the parent class. @see Button
 *
 * @description @see Button
 *
 * @param {Icon} icon The icon.
 * @param {Integer} iconSize The iconSize.
 * @param {String} labelTextID The gettext id of the label.
 * @param {String} hoverTitleID The gettext id of the title.
 * @param {String} hoverDescriptionID The gettext id of the description.
 * @param {Object} params
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const DraggableButton = new Lang.Class({

    Name: 'Gnomenu.menubuttonBase.DraggableButton',
    Extends: Button,


    _init: function(icon, iconSize, labelTextID, params) {
        this.parent(icon, iconSize, labelTextID, params);
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

        // DnD
        this._draggable = DND.makeDraggable(this.actor);
        this._dragMonitor = null;
        this._dragIds = [];
        this._dragIds.push(this._draggable.connect('drag-begin', Lang.bind(this, this._onDragBegin)));
        this._dragIds.push(this._draggable.connect('drag-cancelled', Lang.bind(this, this._onDragCancelled)));
        this._dragIds.push(this._draggable.connect('drag-end', Lang.bind(this, this._onDragEnd)));
    },

    /**
     * @description Returns the drag actor which in most cases is an icon.
     * @returns {St.Icon}
     * @function
     * @memberOf DraggableButton#
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
     * @function
     * @memberOf DraggableButton#
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
     * @memberOf DraggableButton#
     */
    _onRelease: function(actor, event) {
        let button = event.get_button();
        if (this._btnHandlers[button]) {
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
     * @memberOf DraggableButton#
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
     * @memberOf DraggableButton#
     */
    _onDragBegin: function(draggable, id) {
        this.reset();
        // Fades out the button.
        this.actor.opacity = 55;

        this._dragMonitor = {
            dragMotion: Lang.bind(this, this._onDragMotion)
        };

        DND.addDragMonitor(this._dragMonitor);

        this._notifyDragBegin(draggable, id);
    },

    /**
     * @description Function that is called in case of a drag-motion event.
     * @private
     * @function
     * @memberOf DraggableButton#
     */
    _onDragMotion: function(dragEvent) {
        return DND.DragMotionResult.CONTINUE;
    },

    /**
     * @description Function that is called in case of a drag-cancel event.
     * @private
     * @function
     * @memberOf DraggableButton#
     */
    _onDragCancelled: function(draggable, id) {
        DND.removeDragMonitor(this._dragMonitor);

        this._notifyDragCancelled(draggable, id);
    },

    /**
     * @description Function that is called in case of a drag-end event.
     * @private
     * @function
     * @memberOf DraggableButton#
     */
    _onDragEnd: function(draggable, id) {
        this.reset();
        // Fades in the button.
        this.actor.opacity = 255;

        DND.removeDragMonitor(this._dragMonitor);

        this._notifyDragEnd(draggable, id);
    },

    /**
     * To be implemented!
     * @callback
     * @memberOf DraggableButton#
     */
    _notifyDragBegin: function(draggable, id) {
        // This method is called when a drag begins.
    },

    /**
     * To be implemented!
     * @callback
     * @memberOf DraggableButton#
     */
    _notifyDragCancelled: function(draggable, id) {
        // This method is called when a drag is cancelled.
    },

    /**
     * To be implemented!
     * @callback
     * @memberOf DraggableButton#
     */
    _notifyDragEnd: function(draggable, id) {
        // This method is called when a drag ends.
    },

    /**
     * @description Destroys the button.
     * @function
     * @memberOf DraggableButton#
     */
    destroy: function() {
        DND.removeDragMonitor(this._dragMonitor);
        this.actor.destroy();
    },
});
