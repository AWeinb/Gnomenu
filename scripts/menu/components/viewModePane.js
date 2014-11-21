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

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;
const Component = Me.imports.scripts.menu.components.component.Component;
const MenuModel = Me.imports.scripts.menu.menuModel;
const IconToggleButton = Me.imports.scripts.menu.components.elements.menubutton.IconToggleButton;
const ButtonGroup = Me.imports.scripts.menu.components.elements.menubutton.ButtonGroup;

const EViewMode = MenuModel.EViewMode;


/**
 * @class ViewModePane: This class creates the controls to change the viewmode.
 *
 * @param {MenuModel} model A model instance.
 * @param {MenuMediator} mediator A mediator instance.
 *
 * @property {Clutter.Actor} actor The clutter actor of this component.
 *
 *
 * @author AxP
 * @version 1.0
 */
const ViewModePane = new Lang.Class({

    Name: 'Gnomenu.ViewModePane',
    Extends: Component,


    _init: function(model, mediator) {
        this.parent(model, mediator);

        // The actor gets two togglebuttons which change the viewmode.
        this.actor = new St.BoxLayout({ style_class: 'gnomenu-viewMode-box' });
        let iconSize = this.menuSettings.getLayoutDependendIconsize();

        let listViewBtn = new IconToggleButton(mediator, 'view-list-symbolic', iconSize, 'List View', null);
        listViewBtn.setID(EViewMode.LIST);
        listViewBtn.setOnLeftClickHandler(Lang.bind(this, function(active) {
                this.selectButton(EViewMode.LIST);
                this.mediator.setViewMode(EViewMode.LIST);
            }
        ));

        let gridViewBtn = new IconToggleButton(mediator, 'view-grid-symbolic', iconSize, 'Grid View', null);
        gridViewBtn.setID(EViewMode.GRID);
        gridViewBtn.setOnLeftClickHandler(Lang.bind(this, function(active) {
                this.selectButton(EViewMode.GRID);
                this.mediator.setViewMode(EViewMode.GRID);
            }
        ));

        this._buttonGroup = new ButtonGroup();
        this._buttonGroup.addButton(listViewBtn);
        this._buttonGroup.addButton(gridViewBtn);

        this.actor.add(listViewBtn.actor, { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
        this.actor.add(gridViewBtn.actor, { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });

        this.refresh();
    },

    /**
     * @description Use this function to bring the view up-to-date.
     * @public
     * @function
     */
    refresh: function() {
        this.selectButton(this.menuSettings.getMainAreaViewMode());
    },

    /**
     * @description Use this function to remove all actors from the component.
     *              Not implemented for this class.
     * @public
     * @function
     */
    clear: function() {
        /*
         * It is not intended to clear the component.
         */
        Log.logWarning("Gnomenu.ControlPane", "clear", "This is not useful!");
    },

    /**
     * @description Use this function to destroy the component.
     * @public
     * @function
     */
    destroy: function() {
        this.actor.destroy();
    },

    /**
     * @description This method lets you select a button for a specific viewmode.
     * @public
     * @function
     */
    selectButton: function(shortcutAreaViewModeID) {
        if (!shortcutAreaViewModeID) {
            Log.logError("Gnomenu.ViewModePane", "selectButton", "shortcutAreaViewModeID is null!");
        }

        this._buttonGroup.clearButtonStates();
        this._buttonGroup.selectByID(shortcutAreaViewModeID);
    },
});
