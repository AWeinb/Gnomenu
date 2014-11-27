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
const TextToggleButton = Me.imports.scripts.menu.components.elements.menubutton.TextToggleButton;
const ButtonGroup = Me.imports.scripts.menu.components.elements.menubutton.ButtonGroup;

const ECategoryID = MenuModel.ECategoryID;
const ECategoryDescriptionID = MenuModel.ECategoryDescriptionID;

/**
 * Simple Enum which provides a mousebutton to id mapping.
 * @private
 */
const MOUSEBUTTON = Me.imports.scripts.menu.components.elements.menubutton.EMousebutton;


/**
 * @class CategoryPane
 * @extends Component
 * 
 * @classdesc This class creates a small pane with category buttons. It
 *            contains toggle buttons that show which category is active. You
 *            can also set the selected category programmatically. If you
 *            provide an valid id the corresponding category is selected, if
 *            not no category is selected. It is possible to refresh this
 *            component. This triggers a complete rebuild of the component
 *            which is probably not needed very often. It is possible to add
 *            the actor of this class to a normal boxlayout.
 * 
 * @description You need to provide valid instances of model and mediator. The
 *              model is needed to receive current data which then is displayed.
 *              The mediator is used to interact with the other components of
 *              the menu. So it is not allowed to call the methods of any other
 *              component directly.
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
const CategoryPane = new Lang.Class({

    Name: 'Gnomenu.CategoryPane',
    Extends: Component,


    _init: function(model, mediator) {
        this.parent(model, mediator);

        // The buttons are in a buttongroup so it would be no problem to
        // implement keyboard controls.
        this.actor = new St.BoxLayout({ style_class: 'gnomenu-categorypanel-box' });
        this._buttonGroup = new ButtonGroup();

        this.refresh();
    },

    /**
     * @description Use this function to bring the view to a fresh state. This
     *              recreates the component completely.
     * @function
     * @memberof CategoryPane#
     */
    refresh: function() {
        this.clear();

        // Creates the recent category button.
        let recentCategoryBtn = new TextToggleButton(this.mediator, ECategoryID.RECENTFILES, ECategoryID.RECENTFILES, ECategoryDescriptionID.RECENTFILES);
        recentCategoryBtn.setID(ECategoryID.RECENTFILES);
        recentCategoryBtn.setHandlerForButton(MOUSEBUTTON.MOUSE_LEFT, this._getCallback(ECategoryID.RECENTFILES));

        // Creates the web category button.
        let webBookmarksCategoryBtn = new TextToggleButton(this.mediator, ECategoryID.WEB, ECategoryID.WEB, ECategoryDescriptionID.WEB);
        webBookmarksCategoryBtn.setID(ECategoryID.WEB);
        webBookmarksCategoryBtn.setHandlerForButton(MOUSEBUTTON.MOUSE_LEFT, this._getCallback(ECategoryID.WEB));

        // Creates either the favorites category or the places category button.
        let tmpCategoryBtn = null;
        switch (this.menuSettings.getSidebarCategory()) {

            case ECategoryID.FAVORITES:
                tmpCategoryBtn = new TextToggleButton(this.mediator, ECategoryID.PLACES, ECategoryID.PLACES, ECategoryDescriptionID.PLACES);
                tmpCategoryBtn.setID(ECategoryID.PLACES);
                tmpCategoryBtn.setHandlerForButton(MOUSEBUTTON.MOUSE_LEFT, this._getCallback(ECategoryID.PLACES));
                break;

            case ECategoryID.PLACES:
                tmpCategoryBtn = new TextToggleButton(this.mediator, ECategoryID.FAVORITES, ECategoryID.FAVORITES, ECategoryDescriptionID.FAVORITES);
                tmpCategoryBtn.setID(ECategoryID.FAVORITES);
                tmpCategoryBtn.setHandlerForButton(MOUSEBUTTON.MOUSE_LEFT, this._getCallback(ECategoryID.FAVORITES));
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
     * @param {StringEnum} categoryID The enum string that is used as id. @see MenuModel
     * @returns {Callback} A callback that triggers a category change.
     * @private
     * @function
     * @memberof CategoryPane#
     */
    _getCallback: function(categoryID) {
        return Lang.bind(this, function(isSelected) {
            // If the button is deselected then the default category is applied.
            let cat = this.menuSettings.getDefaultShortcutAreaCategory();
            if (isSelected) {
                cat = categoryID;
            }
            // The mediator is notified that a category changed.
            this.mediator.notifyCategoryChange(cat);

            return true;
        });
    },

    /**
     * @description Use this function to remove all actors from the component.
     *              After this call the actor is empty and the date got
     *              deleted.
     * @function
     * @memberof CategoryPane#
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
     * @function
     * @memberof CategoryPane#
     */
    destroy: function() {
        this.actor.destroy();
    },

    /**
     * @description Use this function to select a button by category ID. You
     *              may provide wrong or unregistered ids to spare an
     *              extra check. In this case no button is selected and all
     *              are after this deselected.
     * @param {StringEnum} categoryID The category id that the button handles.
     * @function
     * @memberof CategoryPane#
     */
    selectCategory: function(categoryID) {
        // For this to work the buttons need to have their category id.
        this._buttonGroup.selectByID(categoryID);
    },

    /**
     * @description Use this function to deselect all buttons.
     * @function
     * @memberof CategoryPane#
     */
    deselectButtons: function() {
        this._buttonGroup.clearButtonStates();
    },
    
    /**
     * @description Removes unneeded effects like the hover style.
     * @function
     * @memberof CategoryPane#
     */
    clean: function() {
        this._buttonGroup.clean();
    },
});
