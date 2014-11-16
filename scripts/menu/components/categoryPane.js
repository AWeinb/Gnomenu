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
const TextToggleButton = Me.imports.scripts.menu.components.elements.menubutton.TextToggleButton;
const ButtonGroup = Me.imports.scripts.menu.components.elements.menubutton.ButtonGroup;

const ECategoryID = MenuModel.ECategoryID;


/**
 * @class CategoryPane: Represents the small category panel above the
 *                      main category box.
 * @extends Component
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
const CategoryPane = new Lang.Class({

    Name: 'Gnomenu.CategoryPane',
    Extends: Component,


    _init: function(model, mediator) {
        this.parent(model, mediator);

        this.actor = new St.BoxLayout({ style_class: 'gnomenu-categorypanel-box' });
        this._buttonGroup = new ButtonGroup();

        this.refresh();
    },

    /**
     * @description Use this function to bring the view up-to-date.
     * @public
     * @function
     */
    refresh: function() {
        this.clear();
        
        // Creates the recent category button.
        let recentCategoryBtn = new TextToggleButton(this.mediator, 'Recent', 'Recent', null);
        recentCategoryBtn.setID(ECategoryID.RECENTFILES);
        recentCategoryBtn.setOnLeftClickHandler(this._getCallback(ECategoryID.RECENTFILES));

        // Creates the web category button.
        let webBookmarksCategoryBtn = new TextToggleButton(this.mediator, 'Web', 'Web', null);
        webBookmarksCategoryBtn.setID(ECategoryID.WEB);
        webBookmarksCategoryBtn.setOnLeftClickHandler(this._getCallback(ECategoryID.WEB));

        // Creates either the favorites category or the places category button.
        let tmpCategoryBtn = null;
        switch (this.menuSettings.getSidebarCategory()) {

            case ECategoryID.FAVORITES:
                tmpCategoryBtn = new TextToggleButton(this.mediator, 'Places', 'Places', null);
                tmpCategoryBtn.setID(ECategoryID.PLACES);
                tmpCategoryBtn.setOnLeftClickHandler(this._getCallback(ECategoryID.PLACES));
                break;

            case ECategoryID.PLACES:
                tmpCategoryBtn = new TextToggleButton(this.mediator, 'Favorites', 'Favorites', null);
                tmpCategoryBtn.setID(ECategoryID.FAVORITES);
                tmpCategoryBtn.setOnLeftClickHandler(this._getCallback(ECategoryID.FAVORITES));
                break;

            default:
                break;
        }

        // The buttongroup handles the interaction between the buttons.
        this._buttonGroup.addButton(recentCategoryBtn);
        this._buttonGroup.addButton(webBookmarksCategoryBtn);
        this._buttonGroup.addButton(tmpCategoryBtn);

        this.actor.add(recentCategoryBtn.actor,       { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
        this.actor.add(webBookmarksCategoryBtn.actor, { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
        this.actor.add(tmpCategoryBtn.actor,          { expand: true, x_fill: true, y_fill: false, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
    },

    /**
     * @description This function returns the callback for the buttons.
     * @returns {Bound Function} A callback that triggers a category change.
     * @private
     * @function
     */
    _getCallback: function(categoryID) {
        return Lang.bind(this, function(isSelected) {
            let cat = this.menuSettings.getDefaultShortcutAreaCategory();
            if (isSelected) {
                cat = categoryID;
            }
            this.mediator.selectMenuCategory(cat);

            return true;
        });
    },

    /**
     * @description Use this function to remove all actors from the component.
     * @public
     * @function
     */
    clear: function() {
        let actors = this.actor.get_children();
        if (actors) {
            for each (let actor in actors) {
                this.actor.remove_actor(actor);
                // We dont need the buttons anymore so they can be destroyed.
                actor.destroy();
            }
        }
        // The buttongroup is now empty again.
        this._buttonGroup.reset();
    },

    /**
     * @description Use this function to destroy the component.
     * @public
     * @function
     */
    destroy: function() {
        this.clear();
        this.actor.destroy();
    },

    /**
     * @description Use this function to select a button by category ID.
     * @param {Enum String} The category id that the button handles.
     * @public
     * @function
     */
    selectCategory: function(categoryID) {
        this._buttonGroup.clearButtonStates();
        // For this to work the buttons need to have their category id.
        this._buttonGroup.selectByID(categoryID);
    },

    /**
     * @description Use this function to deselect all buttons. May be needed in
     * combination with the main category box.
     * @public
     * @function
     */
    deselectButtons: function() {
        this._buttonGroup.clearButtonStates();
    },
});
