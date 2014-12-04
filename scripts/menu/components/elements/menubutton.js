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
const Gio = imports.gi.Gio;
const St = imports.gi.St;
const DND = imports.ui.dnd;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Button = Me.imports.scripts.menu.components.elements.menubuttonBase.Button;
const InternalButton = Me.imports.scripts.menu.components.elements.menubuttonBase.InternalButton;
const DraggableButton = Me.imports.scripts.menu.components.elements.menubuttonBase.DraggableButton;
const ToggleButton = Me.imports.scripts.menu.components.elements.menubuttonBase.ToggleButton;

/**
 * @description Mousebutton to name map.
 * @private
 */
const EMousebutton = Me.imports.scripts.menu.components.elements.menubuttonBase.EMousebutton;



/**
 * @class ButtonGroup
 *
 * @classdesc The buttongroup is really usefull in combination with
 *            togglebuttons. It free you from handling the selections
 *            of the buttons. The group ensures that only one button
 *            at a time is selected. In some usecases it is not
 *            wanted that a button is deselectable by the user and should
 *            only change the state by pressing another button in the
 *            group. To activate this feature use the "deactivateDeselection"
 *            Method. To easily access the buttons of the group you can
 *            set an id for each button and use this for access. ("id")
 *            Use "reset" to remove all the buttons from the group.
 *            Remember that the buttons are not destroyed. To
 *            actually add a button use the "addButton" method. To
 *            work correctly the method needs buttons the provide a
 *            "setStateToggledCallback" method which lets you register
 *            a callback.
 *            There are some more methods to travers the buttons of
 *            the group and to activate them.
 *
 * @description Inits the instance.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const ButtonGroup = new Lang.Class({

    Name: 'Gnomenu.menubutton.ButtonGroup',


    _init: function() {
        this.reset();
    },

    /**
     * @description Resets the group. Clears the buffer without destroying the
     *              elements.
     * @function
     * @memberOf ButtonGroup#
     */
    reset: function() {
        this._buttons = [];
        this._selectedIdx = -1;
        this._isButtonDeselectable = true;
    },

    /**
     * @description After this was called the buttons of the group cannot be
     *              deselected by the user.
     * @function
     * @memberOf ButtonGroup#
     */
    deactivateDeselection: function() {
        this._isButtonDeselectable = false;
    },

    /**
     * @description This function returns how many buttons are in the group.
     * @returns {Integer} The number of buttons in the group.
     * @function
     * @memberOf ButtonGroup#
     */
    getButtonCount: function() {
        return this._buttons.length;
    },

    /**
     * @description Adds a new button to the group. Use an button that
     *              provides an setStateToggledCallback method to register
     *              an state-toggled callback. Without the group cannot
     *              work properly.
     * @param {Menubutton} button Should extend ToggleButton.
     * @function
     * @memberOf ButtonGroup#
     */
    addButton: function(button) {
        // If there is a toggled callback it is implemented.
        if (button && button.setStateToggledCallback) {
            button.setStateToggledCallback(Lang.bind(this, function(btn, isActive) {
                if (isActive) {
                    this.clearButtonStates();
                    btn.select();
                } else {
                    if (!this._isButtonDeselectable) {
                        // The button is not allowed to be deselected by the user.
                        btn.select();
                    }
                }
            }));
        }
        this._buttons.push(button);
    },

    /**
     * @description Selects the first of the button list. A selection is not
     *              an activation. Use activateSelected to activate an button.
     * @function
     * @memberOf ButtonGroup#
     */
    selectFirst: function() {
        if (this._buttons.length > 0) {
            this.clearButtonStates();
            this._selectedIdx = 0;
            this._buttons[this._selectedIdx].select();
        }
    },

    /**
     * @description Selects the last of the button list. A selection is not
     *              an activation. Use activateSelected to activate an button.
     * @function
     * @memberOf ButtonGroup#
     */
    selectLast: function() {
        if (this._buttons.length > 0) {
            this.clearButtonStates();
            this._selectedIdx = this._buttons.length - 1
            this._buttons[this._selectedIdx].select();
        }
    },

    /**
     * @description Selects the next of the buttons. It starts with the first button.
     *              A selection is not an activation. Use activateSelected to
     *              activate an button.
     * @returns {Boolean} Was just an full cycle of selections completed?
     * @function
     * @memberOf ButtonGroup#
     */
    selectNext: function() {
        let fullCycle = false;

        if (this._buttons.length > 0) {
            let lastIdx = this._selectedIdx;
            if (lastIdx >= 0 && lastIdx < this._buttons.length) {
                // If the last index is valid it means that a button was selected
                // before.
                this._buttons[lastIdx].deselect();
            }

            this._selectedIdx += 1;
            if (this._selectedIdx >= this._buttons.length) {
                this._selectedIdx %= this._buttons.length;
                // I want to notify the user that now the first button is selected.
                fullCycle = true;
            }
            this._buttons[this._selectedIdx].select();
        }

        return fullCycle;
    },

    /**
     * @description Selects the previous of the buttons. It starts with the last button.
     *              A selection is not an activation. Use activateSelected to
     *              activate an button.
     * @returns {Boolean} Was just an full cycle of selections completed?
     * @function
     * @memberOf ButtonGroup#
     */
    selectPrevious: function() {
        let fullCycle = false;

        if (this._buttons.length > 0) {
            let lastIdx = this._selectedIdx;
            if (lastIdx >= 0 && lastIdx < this._buttons.length) {
                // If the last index is valid it means that a button was selected
                // before.
                this._buttons[lastIdx].deselect();
            }

            this._selectedIdx = this._selectedIdx - 1;
            if (this._selectedIdx < 0) {
                this._selectedIdx = this._buttons.length - 1;
                // I want to notify the user that now the last button is selected.
                fullCycle = true;
            }
            this._buttons[this._selectedIdx].select();
        }

        return fullCycle;
    },

    /**
     * @description Selects a button by ID. This id needs to be set in the button
     *              as "id" or available with getID().
     * @param {Object} id An ID. This should be a basic type.
     * @function
     * @memberOf ButtonGroup#
     */
    selectByID: function(id) {
        this._selectedIdx = -1;

        let c = 0;
        for each (let btn in this._buttons) {
            // Cycle through all buttons to deselect most and select only the
            // one with the fitting id.
            if (btn.getID() == id) {
                btn.select();
                this._selectedIdx = c;
            } else {
                btn.deselect();
            }
            c += 1;
        }
    },

    /**
     * @description Returns the currently selected button.
     * @returns {MenuButton} The selected button.
     * @function
     * @memberOf ButtonGroup#
     */
    getSelectedButton: function() {
        return this._buttons[this._selectedIdx];
    },

    /**
     * @description After a selection was made it is possible to activate the
     *              button with this method.
     * @param {IntegerEnum} button The mousebutton connected to the action or null.
     * @param {Object} params
     * @returns {Boolean} If the button was activated.
     * @function
     * @memberOf ButtonGroup#
     */
    activateSelected: function(button, params) {
        if (this._selectedIdx >= 0 && this._buttons[this._selectedIdx] && this._buttons[this._selectedIdx].activate) {
            this._buttons[this._selectedIdx].activate(button, params);
            return true;
        }
        return false;
    },

    /**
     * @description Deselects all buttons of the group.
     * @function
     * @memberOf ButtonGroup#
     */
    clearButtonStates: function() {
        for each (let button in this._buttons) {
            button.deselect();
        }
    },

    /**
     * @description Removes style modifier without valueable meaning.
     * @function
     * @memberOf ButtonGroup#
     */
    clean: function() {
        for each (let button in this._buttons) {
            button.clean();
        }
    },
});


// #############################################################################
// #####   Button implementations
//



/**
 * @class TextButton
 * @extends InternalButton
 *
 * @classdesc This button is a simple label-only button without icon. It
 *            is used and should only be used to activate menu intern
 *            things. An example would be to use it as category button
 *            for menus. The reason for this is that this button is not
 *            optimized for starting apps because it does not support
 *            DnD.
 *
 *            To provide more information about this button it gets
 *            at creation some strings or gettext ids. This title and
 *            description can then be used later on.
 *
 *            Many methods stem from the parent class. Please use
 *            available methods!
 *
 * @description Creates the button with predefined params.
 *
 *
 * @param {MenuMediator} mediator A mediator instance. The mediator receives
 *                                notifications which the button may produce.
 *                                For this kind of button there is to mention
 *                                the hover notification to handle hovers in the
 *                                greater context. It is optional to provide it
 *                                and if it is not given or a particular callback
 *                                is not available it will not matter.
 * @param {String} labelID The gettext id of the label. It is not needed to
 *                         translate the button label text before it is given to
 *                         the button. The button tries to translate the text
 *                         with the default domain.
 * @param {String} hoverTitleID The gettext id of the title.
 * @param {String} hoverDescriptionID The gettext id of the description.
 *
 * @property {Clutter.Actor} actor To add the button to another actor you can
 *                                 use button.actor.
 * @property {String} buttonInfoTitle Infotitle
 * @property {String} buttonInfoDescription Infodescription
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const TextButton = new Lang.Class({

    Name: 'GnoMenu.menubutton.TextButton',
    Extends: InternalButton,


    _init: function (mediator, labelID, hoverTitleID, hoverDescriptionID) {
        this._mediator = mediator;

        this.buttonInfoTitle = hoverTitleID;
        this.buttonInfoDescription = hoverDescriptionID;

        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item popup-submenu-menu-item gnomenu-text-button', x_align: St.Align.START, y_align: St.Align.MIDDLE },
            container_params: {  },
            icon_add_params:  {  },
            label_params:     { style_class: 'gnomenu-text-button-label' },
            label_add_params: { x_fill: true, y_fill: true, x_align: St.Align.START, y_align: St.Align.MIDDLE },
        };

        this.parent(null, 0, labelID, params);
        this.actor._delegate = this;
    },

    /**
     * @description This method is called when the button is activated.
     * @param {Clutter.actor} actor The actor that registered the event.
     * @param {Event} event The event.
     * @callback
     * @private
     * @memberOf TextButton#
     */
    _notifyActivation: function(actor, event) {
        // This button is used as category button.
    },

    /**
     * @description This method is called when the cursor enters or leaves the button.
     * @param {Clutter.actor} actor The actor that registered the event.
     * @param {Event} event The event.
     * @param {Boolean} entered Wether the actor was entered.
     * @callback
     * @private
     * @memberOf TextButton#
     */
    _notifyHovered: function(actor, event, entered) {
        if (this._mediator && this._mediator.notifyHover) {
            this._mediator.notifyHover(actor, event, entered);
        }
    },
});



/**
 * @class IconButton
 * @extends Button
 *
 * @classdesc This button is a simple icon button without label. It is used
 *            as simple non-draggable button to activate specific apps like
 *            the settings or to activate procedures like login out or restarts.
 *            This class does notify the mediator when the button was clicked.
 *
 *            To provide more information about this button it gets
 *            at creation some strings or gettext ids. This title and
 *            description can then be used later on.
 *
 *            Many methods stem from the parent class. Please use
 *            available methods!
 *
 * @description Creates the button with predefined params.
 *
 *
 * @param {MenuMediator} mediator A mediator instance. The mediator receives
 *                                notifications which the button may produce.
 *                                For this kind of button there is to mention
 *                                the hover notification to handle hovers in the
 *                                greater context. It is optional to provide it
 *                                and if it is not given or a particular callback
 *                                is not available it will not matter.
 * @param {Icon} icon The icon. The icon can be an St.Icon ie. an
 *                                 styled icon but keep in mind that only the
 *                                 Gio.?Icon is needed. Commonly used is the
 *                                 Gio.ThemedIcon which can easily be combined
 *                                 with an iconsize.
 * @param {Integer} iconSize The iconSize.
 * @param {String} hoverTitleID The gettext id of the title. It is not needed
 *                              to translate the button label text before it
 *                              is given to the button. The button tries to translate
 *                              the text with the default domain.
 * @param {String} hoverDescriptionID The gettext id of the description.
 *
 * @property {Clutter.Actor} actor To add the button to another actor you can
 *                                 use button.actor.
 * @property {String} buttonInfoTitle Infotitle
 * @property {String} buttonInfoDescription Infodescription
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const IconButton = new Lang.Class({

    Name: 'Gnomenu.menubutton.IconButton',
    Extends: Button,


    _init: function(mediator, icon, iconSize, hoverTitleID, hoverDescriptionID) {
        // The mediator is used to receive some general button notifications.
        // It is optional to provide it.
        this._mediator = mediator;

        this.buttonInfoTitle = hoverTitleID;
        this.buttonInfoDescription = hoverDescriptionID;

        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item popup-submenu-menu-item gnomenu-icon-button', x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
            container_params: { vertical: true },
            icon_add_params:  { x_fill: false, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
            label_params:     {  },
            label_add_params: {  },
        };

        this.parent(icon, iconSize, null, params);
        this.actor._delegate = this;
    },

    /**
     * @description This method is called when the button is activated.
     * @param {Clutter.actor} actor The actor that registered the event.
     * @param {Event} event The event.
     * @callback
     * @private
     * @memberOf IconButton#
     */
    _notifyActivation: function(actor, event) {
        if (this._mediator && this._mediator.notifyHover) {
            this._mediator.notifyActivation(actor, event);
        }
    },

    /**
     * @description This method is called when the cursor enters or leaves the button.
     * @param {Clutter.actor} actor The actor that registered the event.
     * @param {Event} event The event.
     * @param {Boolean} entered Wether the actor was entered.
     * @callback
     * @private
     * @memberOf IconButton#
     */
    _notifyHovered: function(actor, event, entered) {
        if (this._mediator && this._mediator.notifyHover) {
            this._mediator.notifyHover(actor, event, entered);
        }
    },
});


// #############################################################################
// #####   Togglebutton implememtations



/**
 * @class IconToggleButton
 * @extends ToggleButton
 *
 * @classdesc This button is a simple iconbutton. There is not
 *            a big difference between this button and an
 *            iconbutton. The main difference is that this button
 *            is optimized for use as togglebutton. It provides
 *            some more helpful methods for this and is well
 *            integrated with the ButtonGroup in this file. You
 *            should use a buttongroup to make sure that only
 *            one button of the group at a time is selected.
 *
 *            To provide more information about this button it gets
 *            at creation some strings or gettext ids. This title and
 *            description can then be used later on.
 *
 *            Many methods stem from the parent class. Please use
 *            available methods!
 *
 * @description Creates the button with predefined params.
 *
 *
 * @param {MenuMediator} mediator A mediator instance. The mediator receives
 *                                notifications which the button may produce.
 *                                For this kind of button there is to mention
 *                                the hover notification to handle hovers in the
 *                                greater context. It is optional to provide it
 *                                and if it is not given or a particular callback
 *                                is not available it will not matter.
 * @param {Icon} icon The icon.
 * @param {Integer} iconSize The iconSize.
 * @param {String} hoverTitleID The gettext id of the title.
 * @param {String} hoverDescriptionID The gettext id of the description.
 *
 * @property {Clutter.Actor} actor To add the button to another actor you can
 *                                 use button.actor.
 * @property {String} buttonInfoTitle Infotitle
 * @property {String} buttonInfoDescription Infodescription
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const IconToggleButton = new Lang.Class({

    Name: 'Gnomenu.menubutton.IconToggleButton',
    Extends: ToggleButton,


    _init: function(mediator, icon, iconSize, hoverTitleID, hoverDescriptionID) {
        this._mediator = mediator;

        this.buttonInfoTitle = hoverTitleID;
        this.buttonInfoDescription = hoverDescriptionID;

        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item popup-submenu-menu-item gnomenu-iconToggle-button', x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
            container_params: { vertical: true },
            icon_add_params:  { x_fill: false, y_fill: true, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
            label_params:     {  },
            label_add_params: {  },
        };

        this.parent(icon, iconSize, null, params);
        this.actor._delegate = this;
    },

    /**
     * @description This method is called when the cursor enters or leaves the button.
     * @param {Clutter.actor} actor The actor that registered the event.
     * @param {Event} event The event.
     * @param {Boolean} entered Wether the actor was entered.
     * @callback
     * @private
     * @memberOf IconToggleButton#
     */
    _notifyHovered: function(actor, event, entered) {
        if (this._mediator && this._mediator.notifyHover) {
            this._mediator.notifyHover(actor, event, entered);
        }
    },
});



/**
 * @class TextToggleButton
 * @extends ToggleButton
 *
 * @classdesc This button is a togglebutton with just an label.
 *
 *            Many methods stem from the parent class. Please use
 *            available methods!
 *
 *            @see IconToggleButton
 *
 * @description Creates the button with predefined params.
 *
 *
 * @param {MenuMediator} mediator A mediator instance.
 * @param {String} labelID The gettext id of the label.
 * @param {String} hoverTitleID The gettext id of the title.
 * @param {String} hoverDescriptionID The gettext id of the description.
 *
 * @property {Clutter.Actor} actor To add the button to another actor you can
 *                                 use button.actor.
 * @property {String} buttonInfoTitle Infotitle
 * @property {String} buttonInfoDescription Infodescription
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const TextToggleButton = new Lang.Class({

    Name: 'Gnomenu.menubutton.TextToggleButton',
    Extends: ToggleButton,


    _init: function(mediator, labelTextID, hoverTitleID, hoverDescriptionID) {
        this._mediator = mediator;

        this.buttonInfoTitle = hoverTitleID;
        this.buttonInfoDescription = hoverDescriptionID;

        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item popup-submenu-menu-item gnomenu-textToggle-button', x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
            container_params: { vertical: true },
            icon_add_params:  {  },
            label_params:     { style_class: 'gnomenu-textToggle-button-label' },
            label_add_params: { x_fill: false, y_fill: true,x_align: St.Align.MIDDLE, y_align: St.Align.START },
        };

        this.parent(null, 0, labelTextID, params);
        this.actor._delegate = this;
    },

    /**
     * @description This method is called when the cursor enters or leaves the button.
     * @param {Clutter.actor} actor The actor that registered the event.
     * @param {Event} event The event.
     * @param {Boolean} entered Wether the actor was entered.
     * @callback
     * @private
     * @memberOf TextToggleButton#
     */
    _notifyHovered: function(actor, event, entered) {
        if (this._mediator && this._mediator.notifyHover) {
            this._mediator.notifyHover(actor, event, entered);
        }
    },
});


// #############################################################################
// #####   Draggable button implememtations



/**
 * @class DraggableIconButton
 * @extends DraggableButton
 *
 * @classdesc This button is a draggable icon button. It
 *            provides a method to drop-activate it. After a
 *            click the launchable is launched and menu or overview
 *            are closed. The button can be used as dnd button
 *            for the workspace overview. For this it provides
 *            a shellWorkspaceLaunch implementation. To activate
 *            it programmatically it is possible to call the
 *            activate methods. This button uses a mediator
 *            object to inform the world about specific events
 *            like drags and hovers.
 *
 *            Available mediator notifications:
 *            - notifyActivation(actor, event)
 *            - notifyHover(actor, event, entered)
 *            - notifyDragBegin(draggable, id)
 *            - notifyDragCancelled(draggable, id)
 *            - notifyDragEnd(draggable, id)
 *            // Implement them in the mediator.
 *
 *            To provide more information about this button it gets
 *            at creation some strings or gettext ids. This title and
 *            description can then be used later on.
 *
 *            Many methods stem from the parent class. Please use
 *            available methods!
 *
 * @description Creates the button with predefined params.
 *
 *
 * @param {MenuMediator} mediator A mediator instance. The mediator receives
 *                                notifications which the button may produce.
 *                                For this kind of button there is to mention
 *                                the hover notification to handle hovers in the
 *                                greater context. It is optional to provide it
 *                                and if it is not given or a particular callback
 *                                is not available it will not matter.
 * @param {Integer} iconSize The iconSize.
 * @param {Launchable} launchable A launchable instance. It contains icon and app.
 *                                This is the main provider of information
 *                                for the button. @see Launchable
 *
 * @property {Clutter.Actor} actor To add the button to another actor you can
 *                                 use button.actor.
 * @property {String} buttonInfoTitle Infotitle. Extracted from the launchable.
 * @property {String} buttonInfoDescription Infodescription. Extracted from the launchable.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const DraggableIconButton = new Lang.Class({

    Name: 'GnoMenu.menubutton.DraggableIconButton',
    Extends: DraggableButton,


    _init: function(mediator, iconSize, launchable) {
        this._mediator = mediator;
        this._launchable = launchable;

        this.buttonInfoTitle = launchable.getName();
        this.buttonInfoDescription = launchable.getDescription();

        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item gnomenu-appIcon-button', x_align: St.Align.MIDDLE, y_align: St.Align.START },
            container_params: {  },
            icon_add_params:  { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE },
            label_params:     {  },
            label_add_params: {  },
        };

        let icon = launchable.getIcon();
        this.parent(icon, iconSize, null, params);
        this.actor._delegate = this;

        // Left click starts a new app and the middle click activates an possible open one.
        this.setHandlerForButton(EMousebutton.MOUSE_LEFT, Lang.bind(this, function(actor, event) {
            this._launchable.launch(true, { timestamp: event.get_time() });
            this._notifyActivation(actor, event);
        }));
        // The launching is started here but all actions which change the
        // bigger picture are done in the mediator. Thats probably cleaner
        // and of course it is easier to change, say, if the menu should
        // close on click or not.
        this.setHandlerForButton(EMousebutton.MOUSE_MIDDLE, Lang.bind(this, function(actor, event) {
            this._launchable.launch(false, { timestamp: event.get_time() });
            this._notifyActivation(actor, event);
        }));
    },

    /**
     * @description This function does the same as a normal click would do. That
     *              means in this case the an app is started and the mediator
     *              is notified. This method uses the button parameter.
     * @param {Integer} button The button id.
     * @param {Object} params Some parameters.
     * @function
     * @memberOf DraggableIconButton#
     */
    activate: function(button, params) {
        switch (button) {

            case EMousebutton.MOUSE_LEFT:
                this._launchable.launch(true);
                this._notifyActivation(this.actor, null);
                break;

            case EMousebutton.MOUSE_MIDDLE:
                this._launchable.launch(false);
                this._notifyActivation(this.actor, null);
                break;
        }
    },

    /**
     * @description This function does the same as a normal click would do BUT
     *              without notifing the mediator. I it is needed to receive
     *              notifications about workspace launches implement it.
     *              This function is used by the dnd system to drag and drop
     *              buttons on the mini-workspaces.
     * @param {Object} params Some launch parameter. @see Launchable
     * @function
     * @memberOf DraggableIconButton#
     */
    shellWorkspaceLaunch : function(params) {
        this._launchable.launch(true, params);
    },

    /**
     * @description This method is called when the button is activated.
     * @param {Clutter.actor} actor The actor that registered the event.
     * @param {Event} event The event.
     * @callback
     * @private
     * @memberOf DraggableIconButton#
     */
    _notifyActivation: function(actor, event) {
        if (this._mediator && this._mediator.notifyActivation) {
            this._mediator.notifyActivation(actor, event);
        }
    },

    /**
     * @description This method is called when the cursor enters or leaves the button.
     * @param {Clutter.actor} actor The actor that registered the event.
     * @param {Event} event The event.
     * @param {Boolean} entered Wether the actor was entered.
     * @callback
     * @private
     * @memberOf DraggableIconButton#
     */
    _notifyHovered: function(actor, event, entered) {
        if (this._mediator && this._mediator.notifyHover) {
            this._mediator.notifyHover(actor, event, entered);
        }
    },

    /**
     * @description This method is called when the button gets dragged and
     *              notifies the mediator about a drag-begin.
     * @param draggable
     * @param id
     * @callback
     * @private
     * @memberOf DraggableIconButton#
     */
    _notifyDragBegin: function(draggable, id) {
        if (this._mediator && this._mediator.notifyDragBegin) {
            this._mediator.notifyDragBegin(draggable, id);
        }
    },

    /**
     * @description This method is called when the button stops to be dragged and
     *              notifies the mediator about a drag-cancel.
     * @param draggable
     * @param id
     * @callback
     * @private
     * @memberOf DraggableIconButton#
     */
    _notifyDragCancelled: function(draggable, id) {
        if (this._mediator && this._mediator.notifyDragCancelled) {
            this._mediator.notifyDragCancelled(draggable, id);
        }
    },

    /**
     * @description This method is called when the button stops to be dragged and
     *              notifies the mediator about a drag-end.
     * @param draggable
     * @param id
     * @callback
     * @private
     * @memberOf DraggableIconButton#
     */
    _notifyDragEnd: function(draggable, id) {
        if (this._mediator && this._mediator.notifyDragEnd) {
            this._mediator.notifyDragEnd(draggable, id);
        }
    },
});



/**
 * @class DraggableGridButton
 * @extends DraggableButton
 *
 * @classdesc This button is optimized for use in a grid.
 *
 *            Many methods stem from the parent class. Please use
 *            available methods!
 *
 *            @see DraggableIconButton
 *
 * @description Creates the button with predefined params.
 *
 * @param {MenuMediator} mediator A mediator instance.
 * @param {Integer} iconSize The iconSize.
 * @param {Launchable} launchable A launchable instance.
 *
 * @property {Clutter.Actor} actor
 * @property {String} buttonInfoTitle Infotitle. Extracted from the launchable.
 * @property {String} buttonInfoDescription Infodescription. Extracted from the launchable.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const DraggableGridButton = new Lang.Class({

    Name: 'GnoMenu.menubutton.DraggableGridButton',
    Extends: DraggableButton,


    _init: function(mediator, iconSize, launchable) {
        this._mediator = mediator;
        this._launchable = launchable;

        this.buttonInfoTitle = launchable.getName();
        this.buttonInfoDescription = launchable.getDescription();

        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item gnomenu-appGrid-button', x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
            container_params: { vertical: true },
            icon_add_params:  { x_fill: false, y_fill: false,x_align: St.Align.MIDDLE, y_align: St.Align.START },
            label_params:     { style_class: 'gnomenu-appGrid-button-label' },
            label_add_params: { x_fill: false, y_fill: true,x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
        };

        let icon = launchable.getIcon();
        let label = null; //launchable.getName();
        this.parent(icon, iconSize, label, params);
        this.actor._delegate = this;

        // Left click starts a new app and the middle click activates an eventually open one.
        this.setHandlerForButton(EMousebutton.MOUSE_LEFT, Lang.bind(this, function(actor, event) {
            this._launchable.launch(true, { timestamp: event.get_time() });
            this._notifyActivation(actor, event);
        }));
        this.setHandlerForButton(EMousebutton.MOUSE_MIDDLE, Lang.bind(this, function(actor, event) {
            this._launchable.launch(false, { timestamp: event.get_time() });
            this._notifyActivation(actor, event);
        }));
    },

    /**
     * @description This function does the same as a normal click would do. That
     *              means in this case the an app is started and the mediator
     *              is notified. This method uses the button parameter.
     * @param {Integer} button The button id.
     * @param {Object} params Some parameters.
     * @function
     * @memberOf DraggableGridButton#
     */
    activate: function(button, params) {
        switch (button) {

            case EMousebutton.MOUSE_LEFT:
                this._launchable.launch(true);
                this._notifyActivation(this.actor, null);
                break;

            case EMousebutton.MOUSE_MIDDLE:
                this._launchable.launch(false);
                this._notifyActivation(this.actor, null);
                break;
        }
    },

    /**
     * @description This function does the same as a normal click would do BUT
     *              without notifing the mediator. I it is needed to receive
     *              notifications about workspace launches implement it.
     *              This function is used by the dnd system to drag and drop
     *              buttons on the mini-workspaces.
     * @param {Object} params Some launch parameter. @see Launchable
     * @function
     * @memberOf DraggableGridButton#
     */
    shellWorkspaceLaunch : function(params) {
        this._launchable.launch(true, params);
    },

    /**
     * @description This method is called when the button is activated.
     * @param {Clutter.actor} actor The actor that registered the event.
     * @param {Event} event The event.
     * @callback
     * @private
     * @memberOf DraggableGridButton#
     */
    _notifyActivation: function(actor, event) {
        if (this._mediator && this._mediator.notifyActivation) {
            this._mediator.notifyActivation(actor, event);
        }
    },

    /**
     * @description This method is called when the cursor enters or leaves the button.
     * @param {Clutter.actor} actor The actor that registered the event.
     * @param {Event} event The event.
     * @param {Boolean} entered Wether the actor was entered.
     * @callback
     * @private
     * @memberOf DraggableGridButton#
     */
    _notifyHovered: function(actor, event, entered) {
        if (this._mediator && this._mediator.notifyHover) {
            this._mediator.notifyHover(actor, event, entered);
        }
    },

    /**
     * @description This method is called when the button gets dragged and
     *              notifies the mediator about a drag-begin.
     * @param draggable
     * @param id
     * @callback
     * @private
     * @memberOf DraggableGridButton#
     */
    _notifyDragBegin: function(draggable, id) {
        if (this._mediator && this._mediator.notifyDragBegin) {
            this._mediator.notifyDragBegin(draggable, id);
        }
    },

    /**
     * @description This method is called when the button stops to be dragged and
     *              notifies the mediator about a drag-cancel.
     * @param draggable
     * @param id
     * @callback
     * @private
     * @memberOf DraggableGridButton#
     */
    _notifyDragCancelled: function(draggable, id) {
        if (this._mediator && this._mediator.notifyDragCancelled) {
            this._mediator.notifyDragCancelled(draggable, id);
        }
    },

    /**
     * @description This method is called when the button stops to be dragged and
     *              notifies the mediator about a drag-end.
     * @param draggable
     * @param id
     * @callback
     * @private
     * @memberOf DraggableGridButton#
     */
    _notifyDragEnd: function(draggable, id) {
        if (this._mediator && this._mediator.notifyDragEnd) {
            this._mediator.notifyDragEnd(draggable, id);
        }
    },
});



/**
 * @class DraggableListButton
 * @extends DraggableButton
 *
 * @classdesc This button is optimized for the use in a list.
 *
 *            Many methods stem from the parent class. Please use
 *            available methods!
 *
 *            @see DraggableIconButton
 *
 * @description Creates the button with predefined params.
 *
 *
 * @param {MenuMediator} mediator A mediator instance.
 * @param {Integer} iconSize The iconSize.
 * @param {Launchable} launchable A launchable instance.
 *
 * @property {Clutter.Actor} actor
 * @property {String} buttonInfoTitle Infotitle. Extracted from the launchable.
 * @property {String} buttonInfoDescription Infodescription. Extracted from the launchable.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const DraggableListButton = new Lang.Class({

    Name: 'GnoMenu.menubutton.DraggableListButton',
    Extends: DraggableButton,


    _init: function(mediator, iconSize, launchable) {
        this._mediator = mediator;
        this._launchable = launchable;

        this.buttonInfoTitle = launchable.getName();
        this.buttonInfoDescription = launchable.getDescription();

        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item gnomenu-appList-button', x_align: St.Align.START, y_align: St.Align.MIDDLE },
            container_params: {  },
            icon_add_params:  { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE },
            label_params:     { style_class: 'gnomenu-appList-button-label' },
            label_add_params: { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE },
        };

        let icon = launchable.getIcon();
        let name = launchable.getName();
        this.parent(icon, iconSize, name, params);
        this.actor._delegate = this;

        // Left click starts a new app and the middle click activates an eventually open one.
        this.setHandlerForButton(EMousebutton.MOUSE_LEFT, Lang.bind(this, function(actor, event) {
            this._launchable.launch(true, { timestamp: event.get_time() });
            this._notifyActivation(actor, event);
        }));
        this.setHandlerForButton(EMousebutton.MOUSE_MIDDLE, Lang.bind(this, function(actor, event) {
            this._launchable.launch(false, { timestamp: event.get_time() });
            this._notifyActivation(actor, event);
        }));
    },

    /**
     * @description This function does the same as a normal click would do. That
     *              means in this case the an app is started and the mediator
     *              is notified. This method uses the button parameter.
     * @param {Integer} button The button id.
     * @param {Object} params Some parameters.
     * @function
     * @memberOf DraggableListButton#
     */
    activate: function(button, params) {
        switch (button) {

            case EMousebutton.MOUSE_LEFT:
                this._launchable.launch(true);
                this._notifyActivation(this.actor, null);
                break;

            case EMousebutton.MOUSE_MIDDLE:
                this._launchable.launch(false);
                this._notifyActivation(this.actor, null);
                break;
        }
    },

    /**
     * @description This function does the same as a normal click would do BUT
     *              without notifing the mediator. I it is needed to receive
     *              notifications about workspace launches implement it.
     *              This function is used by the dnd system to drag and drop
     *              buttons on the mini-workspaces.
     * @param {Object} params Some launch parameter. @see Launchable
     * @function
     * @memberOf DraggableListButton#
     */
    shellWorkspaceLaunch : function(params) {
        this._launchable.launch(true, params);
    },

    /**
     * @description This method is called when the button is activated.
     * @param {Clutter.actor} actor The actor that registered the event.
     * @param {Event} event The event.
     * @callback
     * @private
     * @memberOf DraggableListButton#
     */
    _notifyActivation: function(actor, event) {
        if (this._mediator && this._mediator.notifyActivation) {
            this._mediator.notifyActivation(actor, event);
        }
    },

    /**
     * @description This method is called when the cursor enters or leaves the button.
     * @param {Clutter.actor} actor The actor that registered the event.
     * @param {Event} event The event.
     * @param {Boolean} entered Wether the actor was entered.
     * @callback
     * @private
     * @memberOf DraggableListButton#
     */
    _notifyHovered: function(actor, event, entered) {
        if (this._mediator && this._mediator.notifyHover) {
            this._mediator.notifyHover(actor, event, entered);
        }
    },

    /**
     * @description This method is called when the button gets dragged and
     *              notifies the mediator about a drag-begin.
     * @param draggable
     * @param id
     * @callback
     * @private
     * @memberOf DraggableListButton#
     */
    _notifyDragBegin: function(draggable, id) {
        if (this._mediator && this._mediator.notifyDragBegin) {
            this._mediator.notifyDragBegin(draggable, id);
        }
    },

    /**
     * @description This method is called when the button stops to be dragged and
     *              notifies the mediator about a drag-cancel.
     * @param draggable
     * @param id
     * @callback
     * @private
     * @memberOf DraggableListButton#
     */
    _notifyDragCancelled: function(draggable, id) {
        if (this._mediator && this._mediator.notifyDragCancelled) {
            this._mediator.notifyDragCancelled(draggable, id);
        }
    },

    /**
     * @description This method is called when the button stops to be dragged and
     *              notifies the mediator about a drag-end.
     * @param draggable
     * @param id
     * @callback
     * @private
     * @memberOf DraggableListButton#
     */
    _notifyDragEnd: function(draggable, id) {
        if (this._mediator && this._mediator.notifyDragEnd) {
            this._mediator.notifyDragEnd(draggable, id);
        }
    },
});


// =============================================================================
