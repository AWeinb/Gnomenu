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
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.scripts.misc.log;
const Component = Me.imports.scripts.menu.components.component.Component;
const MenuModel = Me.imports.scripts.menu.menuModel;
const IconToggleButton = Me.imports.scripts.menu.components.elements.menubutton.IconToggleButton;
const ButtonGroup = Me.imports.scripts.menu.components.elements.menubutton.ButtonGroup;

const EViewMode = MenuModel.EViewMode;

/**
 * Simple Enum which provides a mousebutton to id mapping.
 * @private
 */
const MOUSEBUTTON = Me.imports.scripts.menu.components.elements.menubutton.EMousebutton;



/**
 * @class ViewModePane
 * @extends Component
 *
 * @classdesc The viewmode pane lets the user change the viewmode of the menu.
 *            It is a small button bar with icon buttons. The class provides no
 *            keyboard controls or other advanced functionallity. It is possible
 *            to select a button by viewmode ID.
 *
 * @description @see Component
 * 
 *
 * @param {MenuModel} model A model instance.
 * @param {MenuMediator} mediator A mediator instance.
 *
 * @property {Clutter.Actor} actor The clutter actor of this component.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
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

        let listViewBtn = new IconToggleButton(mediator, 'view-list-symbolic', iconSize, 'List Viewmode', 'List Viewmode Description');
        listViewBtn.setID(EViewMode.LIST);
        listViewBtn.setHandlerForButton(MOUSEBUTTON.MOUSE_LEFT, Lang.bind(this, function(active) {
                this.mediator.notifyViewModeChange(EViewMode.LIST);
            }
        ));

        let gridViewBtn = new IconToggleButton(mediator, 'view-grid-symbolic', iconSize, 'Grid Viewmode', 'Grid Viewmode Description');
        gridViewBtn.setID(EViewMode.GRID);
        gridViewBtn.setHandlerForButton(MOUSEBUTTON.MOUSE_LEFT, Lang.bind(this, function(active) {
                this.mediator.notifyViewModeChange(EViewMode.GRID);
            }
        ));

        // With the group it would be possible to implement keyboard controls without problems.
        // But because its only two viewmodes it is possible to handle it with a single key.
        this._buttonGroup = new ButtonGroup();
        this._buttonGroup.deactivateDeselection();
        this._buttonGroup.addButton(listViewBtn);
        this._buttonGroup.addButton(gridViewBtn);

        this.actor.add(listViewBtn.actor, { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
        this.actor.add(gridViewBtn.actor, { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });

        this.refresh();
    },

    /**
     * @description Use this function to bring the view up-to-date.
     * @function
     * @memberOf ViewModePane#
     */
    refresh: function() {
        this.selectButton(this.menuSettings.getMainAreaViewMode());
    },

    /**
     * @description Use this function to remove all actors from the component.
     *              Not implemented for this class.
     * @function
     * @memberOf ViewModePane#
     */
    clear: function() {
        /*
         * It is not intended to clear the component.
         */
        Log.logWarning("Gnomenu.ControlPane", "clear", "This is not useful!");
    },

    /**
     * @description Use this function to destroy the component.
     * @function
     * @memberOf ViewModePane#
     */
    destroy: function() {
        this.actor.destroy();
    },
    
    /**
     * @description Removes unneeded effects like the hover style.
     * @function
     * @memberof ViewModePane#
     */
    clean: function() {
        this._buttonGroup.clean();
    },

    /**
     * @description This method lets you select a button for a specific viewmode.
     *              You need to provide a valid id.
     * @param {IntegerEnum} viewModeID The viewmode id of the button or assoziated
     *                      with it.
     * @function
     * @memberOf ViewModePane#
     */
    selectButton: function(viewModeID) {
        if (!viewModeID) {
            Log.logError("Gnomenu.ViewModePane", "selectButton", "shortcutAreaViewModeID is null!");
        }

        this._buttonGroup.selectByID(viewModeID);
    },
});
