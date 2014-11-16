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


/**
 * @class IconButton: This button is a simple icon button without label.
 *                    It is not draggable.
 * @extends Button
 *
 * @param {MenuMediator} mediator A mediator instance.
 * @param {Icon of some kind} icon The icon.
 * @param {Integer} iconSize The iconSize.
 * @param {String} hoverTitleID The gettext id of the title.
 * @param {String} hoverDescriptionID The gettext id of the description.
 *
 * @property {Clutter.Actor} actor
 * @property {MenuModel} model The model instance.
 *
 *
 * @author AxP
 * @version 1.0
 */
const IconButton = new Lang.Class({

    Name: 'Gnomenu.menubutton.IconButton',
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

        // This sets the hover description info up.
        this.setTitleChanger(mediator.getFocusedTitleChanger());
        this.setDescriptionChanger(mediator.getFocusedDescriptionChanger());
    }
});

/**
 * @class TextButton: This button is a simple text button without icon.
 *                    It is not draggable.
 * @extends Button
 *
 * @param {MenuMediator} mediator A mediator instance.
 * @param {String} labelID The gettext id of the label.
 * @param {String} hoverTitleID The gettext id of the title.
 * @param {String} hoverDescriptionID The gettext id of the description.
 *
 * @property {Clutter.Actor} actor
 * @property {MenuModel} model The model instance.
 *
 *
 * @author AxP
 * @version 1.0
 */
const TextButton = new Lang.Class({

    Name: 'GnoMenu.menubutton.TextButton',
    Extends: Button,


    _init: function (mediator, labelID, hoverTitleID, hoverDescriptionID) {
        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item popup-submenu-menu-item gnomenu-text-button', x_align: St.Align.START, y_align: St.Align.MIDDLE },
            container_params: {  },
            icon_add_params:  {  },
            label_params:     { style_class: 'gnomenu-text-button-label' },
            label_add_params: { x_fill: true, y_fill: true, x_align: St.Align.START, y_align: St.Align.MIDDLE },
        };

        this.parent(null, 0, labelID, hoverTitleID, hoverDescriptionID, params);
        this.actor._delegate = this;

        // This sets the hover description info up.
        this.setTitleChanger(mediator.getFocusedTitleChanger());
        this.setDescriptionChanger(mediator.getFocusedDescriptionChanger());
    },
});



// #############################################################################
// #####   Togglebutton implememtations


/**
 * @class IconToggleButton: This button is a togglebutton with just an icon.
 *                          It is not draggable.
 * @extends ToggleButton
 *
 * @param {MenuMediator} mediator A mediator instance.
 * @param {Icon of some kind} icon The icon.
 * @param {Integer} iconSize The iconSize.
 * @param {String} hoverTitleID The gettext id of the title.
 * @param {String} hoverDescriptionID The gettext id of the description.
 *
 * @property {Clutter.Actor} actor
 * @property {MenuModel} model The model instance.
 *
 *
 * @author AxP
 * @version 1.0
 */
const IconToggleButton = new Lang.Class({

    Name: 'Gnomenu.menubutton.IconToggleButton',
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

        // This sets the hover description info up.
        this.setTitleChanger(mediator.getFocusedTitleChanger());
        this.setDescriptionChanger(mediator.getFocusedDescriptionChanger());
    },
});


/**
 * @class TextToggleButton: This button is a togglebutton with just an label.
 *                          It is not draggable.
 * @extends ToggleButton
 *
 * @param {MenuMediator} mediator A mediator instance.
 * @param {String} labelID The gettext id of the label.
 * @param {String} hoverTitleID The gettext id of the title.
 * @param {String} hoverDescriptionID The gettext id of the description.
 *
 * @property {Clutter.Actor} actor
 * @property {MenuModel} model The model instance.
 *
 *
 * @author AxP
 * @version 1.0
 */
const TextToggleButton = new Lang.Class({

    Name: 'Gnomenu.menubutton.TextToggleButton',
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

        // This sets the hover description info up.
        this.setTitleChanger(mediator.getFocusedTitleChanger());
        this.setDescriptionChanger(mediator.getFocusedDescriptionChanger());
    },
});



// #############################################################################
// #####   Draggable button implememtations


/**
 * @class DraggableIconButton: This button is a draggable icon button. It
 *                             provides a method to drop-activate it.
 * @extends DraggableButton
 *
 * @param {MenuMediator} mediator A mediator instance.
 * @param {Integer} iconSize The iconSize.
 * @param {Launchable} launchable A launchable instance. It contains icon and app.
 *
 * @property {Clutter.Actor} actor
 * @property {MenuModel} model The model instance.
 *
 *
 * @author AxP
 * @version 1.0
 */
const DraggableIconButton = new Lang.Class({

    Name: 'GnoMenu.menubutton.DraggableIconButton',
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

        // Left click starts a new app and the middle click activates an eventually open one.
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

    /**
     * @description A callback which is called on drag begin. It informs the mediator.
     * @private
     * @function
     */
    _onDragBeginCB: function() {
        this._mediator.onDragBegin();
    },

    /**
     * @description A callback which is called on drag cancel. It informs the mediator.
     * @private
     * @function
     */
    _onDragCancelledCB: function() {
        this._mediator.onDragCancelled();
    },

    /**
     * @description A callback which is called on drag end. It informs the mediator.
     * @private
     * @function
     */
    _onDragEndCB: function() {
        this._mediator.onDragEnd();
    },
});


/**
 * @class DraggableGridButton: This button is a draggable icon button for grid use.
 *                             It provides a method to drop-activate it.
 * @extends DraggableButton
 *
 * @param {MenuMediator} mediator A mediator instance.
 * @param {Integer} iconSize The iconSize.
 * @param {Launchable} launchable A launchable instance. It contains icon and app.
 *
 * @property {Clutter.Actor} actor
 * @property {MenuModel} model The model instance.
 *
 *
 * @author AxP
 * @version 1.0
 */
const DraggableGridButton = new Lang.Class({

    Name: 'GnoMenu.menubutton.DraggableGridButton',
    Extends: DraggableButton,


    _init: function(mediator, iconSize, launchable) {
        this._launchable = launchable;
        this._mediator = mediator;

        let icon = launchable.getIcon();
        let label = null; //launchable.getName();
        let hoverTitle = launchable.getName();
        let hoverDescription = launchable.getDescription();

        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item gnomenu-appGrid-button', x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
            container_params: { vertical: true },
            icon_add_params:  { x_fill: false, y_fill: false,x_align: St.Align.MIDDLE, y_align: St.Align.START },
            label_params:     { style_class: 'gnomenu-appGrid-button-label' },
            label_add_params: { x_fill: false, y_fill: true,x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
        };

        this.parent(icon, iconSize, label, hoverTitle, hoverDescription, params);
        this.actor._delegate = this;

        this.setTitleChanger(mediator.getFocusedTitleChanger());
        this.setDescriptionChanger(mediator.getFocusedDescriptionChanger());

        // Left click starts a new app and the middle click activates an eventually open one.
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

    /**
     * @description A callback which is called on drag begin. It informs the mediator.
     * @private
     * @function
     */
    _onDragBeginCB: function() {
        this._mediator.onDragBegin();
    },

    /**
     * @description A callback which is called on drag cancel. It informs the mediator.
     * @private
     * @function
     */
    _onDragCancelledCB: function() {
        this._mediator.onDragCancelled();
    },

    /**
     * @description A callback which is called on drag end. It informs the mediator.
     * @private
     * @function
     */
    _onDragEndCB: function() {
        this._mediator.onDragEnd();
    },
});


/**
 * @class DraggableListButton: This button is a draggable button for list use.
 *                             It provides a method to drop-activate it.
 * @extends DraggableButton
 *
 * @param {MenuMediator} mediator A mediator instance.
 * @param {Integer} iconSize The iconSize.
 * @param {Launchable} launchable A launchable instance. It contains icon and app.
 *
 * @property {Clutter.Actor} actor
 * @property {MenuModel} model The model instance.
 *
 *
 * @author AxP
 * @version 1.0
 */
const DraggableListButton = new Lang.Class({

    Name: 'GnoMenu.menubutton.DraggableListButton',
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

        // Left click starts a new app and the middle click activates an eventually open one.
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

    /**
     * @description A callback which is called on drag begin. It informs the mediator.
     * @private
     * @function
     */
    _onDragBeginCB: function() {
        this._mediator.onDragBegin();
    },

    /**
     * @description A callback which is called on drag cancel. It informs the mediator.
     * @private
     * @function
     */
    _onDragCancelledCB: function() {
        this._mediator.onDragCancelled();
    },

    /**
     * @description A callback which is called on drag end. It informs the mediator.
     * @private
     * @function
     */
    _onDragEndCB: function() {
        this._mediator.onDragEnd();
    },
});



// #############################################################################


/**
 * @class DraggableSearchGridButton: This button is a draggable button for search grid use.
 *                                   It provides a method to drop-activate it.
 * @extends DraggableButton
 *
 * @param {MenuMediator} mediator A mediator instance.
 * @param {Integer} iconSize The iconSize.
 * @param {Launchable} launchable A launchable instance. It contains icon and app.
 *
 * @property {Clutter.Actor} actor
 * @property {MenuModel} model The model instance.
 *
 *
 * @author AxP
 * @version 1.0
 */
const DraggableSearchGridButton = new Lang.Class({

    Name: 'GnoMenu.menubutton.DraggableSearchGridButton',
    Extends: DraggableButton,


    _init: function(mediator, iconSize, searchResult) {
        this._searchResult = searchResult;
        this._mediator = mediator;

        let icon = searchResult.getIcon();
        let label = null; //searchResult.getName();
        let hoverTitle = searchResult.getName();
        let hoverDescription = searchResult.getDescription();

        let params = {
            actor_params:     { reactive: true, style_class: 'popup-menu-item gnomenu-appGrid-button', x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
            container_params: { vertical: true },
            icon_add_params:  { x_fill: false, y_fill: false,x_align: St.Align.MIDDLE, y_align: St.Align.START },
            label_params:     { style_class: 'gnomenu-appGrid-button-label' },
            label_add_params: { x_fill: false, y_fill: true,x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE },
        };

        this.parent(icon, iconSize, label, hoverTitle, hoverDescription, params);
        this.actor._delegate = this;

        this.setTitleChanger(mediator.getFocusedTitleChanger());
        this.setDescriptionChanger(mediator.getFocusedDescriptionChanger());

        // Left click starts a new app and the middle click activates an eventually open one.
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

    /**
     * @description A callback which is called on drag begin. It informs the mediator.
     * @private
     * @function
     */
    _onDragBeginCB: function() {
        this._mediator.onDragBegin();
    },

    /**
     * @description A callback which is called on drag cancel. It informs the mediator.
     * @private
     * @function
     */
    _onDragCancelledCB: function() {
        this._mediator.onDragCancelled();
    },

    /**
     * @description A callback which is called on drag end. It informs the mediator.
     * @private
     * @function
     */
    _onDragEndCB: function() {
        this._mediator.onDragEnd();
    },
});


/**
 * @class DraggableSearchGridButton: This button is a draggable button for search list use.
 *                                   It provides a method to drop-activate it.
 * @extends DraggableButton
 *
 * @param {MenuMediator} mediator A mediator instance.
 * @param {Integer} iconSize The iconSize.
 * @param {Launchable} launchable A launchable instance. It contains icon and app.
 *
 * @property {Clutter.Actor} actor
 * @property {MenuModel} model The model instance.
 *
 *
 * @author AxP
 * @version 1.0
 */
const DraggableSearchListButton = new Lang.Class({

    Name: 'GnoMenu.menubutton.DraggableSearchListButton',
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

        // Left click starts a new app and the middle click activates an eventually open one.
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

    /**
     * @description A callback which is called on drag begin. It informs the mediator.
     * @private
     * @function
     */
    _onDragBeginCB: function() {
        this._mediator.onDragBegin();
    },

    /**
     * @description A callback which is called on drag cancel. It informs the mediator.
     * @private
     * @function
     */
    _onDragCancelledCB: function() {
        this._mediator.onDragCancelled();
    },

    /**
     * @description A callback which is called on drag end. It informs the mediator.
     * @private
     * @function
     */
    _onDragEndCB: function() {
        this._mediator.onDragEnd();
    },
});



// =============================================================================


/**
 * @class ButtonGroup: This class groups buttons and controls their interaction
 *                     with each other.
 *
 *
 * @author AxP
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
     * @public
     * @function
     */
    reset: function() {
        this._buttons = [];
        this._selectedIdx = -1;
    },

    /**
     * @description Adds a new button to the group.
     * @param {Menubutton} button
     * @public
     * @function
     */
    addButton: function(button) {
        // If there is a toggled callback it is implemented.
        if (button && button.setStateToggledCallback) {
            button.setStateToggledCallback(Lang.bind(this, function(btn, isActive) {
                if (isActive) {
                    this.clearButtonStates();
                    btn.setState(true);
                }
            }));
        }
        this._buttons.push(button);
    },

    /**
     * @description Selects the first of the button list.
     * @public
     * @function
     */
    selectFirst: function() {
        this.clearButtonStates();
        this._selectedIdx = 0;
        if (this._buttons.length > 0) {
            this._buttons[this._selectedIdx].select();
        }
    },

    /**
     * @description Selects the next of the buttons. It starts with the first button.
     * @public
     * @function
     */
    selectNext: function() {
        let previousIdx = this._selectedIdx;
        this._selectedIdx = (this._selectedIdx + 1) % this._buttons.length;
        if (this._buttons.length > 0) {
            this._buttons[previousIdx].deselect();
            this._buttons[this._selectedIdx].select();
        }
    },

    /**
     * @description Selects the previous of the buttons. It starts with the last button.
     * @public
     * @function
     */
    selectPrevious: function() {
        let previousIdx = this._selectedIdx;
        this._selectedIdx = this._selectedIdx - 1;
        if (this._selectedIdx < 0) {
            this._selectedIdx = this._buttons.length - 1;
        }
        if (this._buttons.length > 0) {
            this._buttons[previousIdx].deselect();
            this._buttons[this._selectedIdx].select();
        }
    },

    /**
     * @description Selects a button by ID.
     * @param {Object} categoryID An ID.
     * @public
     * @function
     */
    selectByID: function(categoryID) {
        for each (let btn in this._buttons) {
            if (btn.id == categoryID) {
                btn.select();
            } else {
                btn.deselect();
            }
        }
    },

    /**
     * @description Deselects all buttons.
     * @public
     * @function
     */
    clearButtonStates: function() {
        for each (let button in this._buttons) {
            button.deselect();
        }
    },
});