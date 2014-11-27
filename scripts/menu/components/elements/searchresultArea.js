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
const Gtk = imports.gi.Gtk;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const MenuModel = Me.imports.scripts.menu.menuModel;
const Log = Me.imports.scripts.misc.log;
const DraggableSearchGridButton = Me.imports.scripts.menu.components.elements.menubutton.DraggableGridButton;
const DraggableSearchListButton = Me.imports.scripts.menu.components.elements.menubutton.DraggableListButton;
const ButtonGroup = Me.imports.scripts.menu.components.elements.menubutton.ButtonGroup;
const Component = Me.imports.scripts.menu.components.component.Component;

const EEventType = MenuModel.EEventType;
const EViewMode = MenuModel.EViewMode;


/**
 * @description Used as open iconname for the box button.
 * @private
 */
const OPEN_ICON = 'list-add-symbolic';
/**
 * @description Used as close iconname for the box button.
 * @private
 */
const CLOSE_ICON = 'list-remove-symbolic';
/**
 * @description Iconsize for the box button.
 * @private
 */
const ICON_SIZE = 25;



/**
 * @class ProviderResultBoxButton
 *
 * @classdesc This creates the open/close button for the searchresult boxes.
 *            This is just the horizontal bar with icon and label to open or
 *            close the box.
 *
 * @description Creates a horizontal button with a fixed icon and a label.
 *
 *
 * @param {String} labelTextID The gettext id of the label.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const ProviderResultBoxButton = new Lang.Class({

    Name: 'GnoMenu.searchresultArea.ProviderResultBoxButton',


    _init: function(label) {
        let buttonbox = new St.BoxLayout();

        this.stIcon = new St.Icon({ icon_size: ICON_SIZE });
        buttonbox.add(this.stIcon, { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE });

        let stLabel = new St.Label({ style_class: 'gnomenu-searchArea-category-button-label' });
        stLabel.set_text(_(label));
        buttonbox.add(stLabel, { x_fill: false, y_fill: false, x_align: St.Align.START, y_align: St.Align.MIDDLE });

        this.actor = new St.Button({ reactive: true, style_class: 'popup-menu-item popup-submenu-menu-item gnomenu-searchArea-category-button', x_align: St.Align.START, y_align: St.Align.MIDDLE });
        this.actor.set_child(buttonbox);

        this._btnPressId = this.actor.connect('button-press-event', Lang.bind(this, this._onPress));
        this._btnReleaseId = this.actor.connect('button-release-event', Lang.bind(this, this._onRelease));
        this._btnEnterId = this.actor.connect('enter-event', Lang.bind(this, this._onEnter));
        this._btnLeaveId = this.actor.connect('leave-event', Lang.bind(this, this._onLeave));
    },

    /**
     * @description Selects the button. This means that the icon changes.
     * @function
     * @memberOf ProviderResultBoxButton#
     */
    select: function() {
        this.stIcon.icon_name = CLOSE_ICON;
        this.actor.add_style_pseudo_class('pressed');
    },

    /**
     * @description Deselects the button. This means that the icon changes.
     * @function
     * @memberOf ProviderResultBoxButton#
     */
    deselect: function() {
        this.stIcon.icon_name = OPEN_ICON;
        this.actor.remove_style_pseudo_class('pressed');
    },

    /**
     * @description Set the onclick handler.
     * @param {Function} handler
     * @function
     * @memberOf ProviderResultBoxButton#
     */
    setOnClickHandler: function(handler) {
        this._btnClickHandler = handler;
    },

    /**
     * @description Function that is called in case of a press event.
     * @param {Clutter.Actor} actor
     * @param {Clutter.Event} event
     * @returns {Boolean} Was the event handled?
     * @private
     * @function
     * @memberOf ProviderResultBoxButton#
     */
    _onPress: function(actor, event) {
        if (this._btnClickHandler) {
            this._btnClickHandler(actor, event);
            return Clutter.EVENT_STOP;
        }
        return Clutter.EVENT_STOP;
    },

    /**
     * @description Function that is called in case of a release event.
     * @param {Clutter.Actor} actor
     * @param {Clutter.Event} event
     * @returns {Boolean} Was the event handled?
     * @private
     * @function
     * @memberOf ProviderResultBoxButton#
     */
    _onRelease: function(actor, event) {
        return Clutter.EVENT_STOP;
    },

    /**
     * @description Function that is called in case of a enter event.
     * @param {Clutter.Actor} actor
     * @param {Clutter.Event} event
     * @returns {Boolean} Was the event handled?
     * @private
     * @function
     * @memberOf ProviderResultBoxButton#
     */
    _onEnter: function(actor, event) {
        this.actor.add_style_pseudo_class('active');
        return Clutter.EVENT_STOP;
    },

    /**
     * @description Function that is called in case of a leave event.
     * @param {Clutter.Actor} actor
     * @param {Clutter.Event} event
     * @returns {Boolean} Was the event handled?
     * @private
     * @function
     * @memberOf ProviderResultBoxButton#
     */
    _onLeave: function(actor, event) {
        this.actor.remove_style_pseudo_class('active');
        this.actor.remove_style_pseudo_class('pressed');
        return Clutter.EVENT_STOP;
    },
});



/**
 * @class ProviderResultBoxBase
 *
 * @classdesc This is the base of the search result boxes. It does not provide
 *            very much functionallity at the moment but can be used to implement
 *            functions that are the same for all result boxes.
 *
 * @description Creates the basebox with the button at the top. You need to
 *              provide valid arguments.
 *
 *
 * @param {MenuMediator} mediator A mediator instance.
 * @param {String} boxlabel A gettext id for the button.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const ProviderResultBoxBase = new Lang.Class({

    Name: 'GnoMenu.searchresultArea.ProviderResultBoxBase',


    _init: function(mediator, boxlabel) {
        if (!mediator || !boxlabel) {
            Log.logError("GnoMenu.searchresultArea.ProviderResultBoxBase", "_init", "mediator, boxlabel, may not be null!");
        }
        this._mediator = mediator;

        // Creates the button and the box. Other elements are added in the subclasses.
        this._button = new ProviderResultBoxButton(boxlabel);
        this._button.setOnClickHandler(Lang.bind(this, this.toggleOpenState));

        // This actor can be used to add the actual box.
        this.actor = new St.BoxLayout({ style_class: 'gnomenu-searchArea-category-box', vertical: true });
        this.actor.add(this._button.actor);
    },

    /**
     * @description Shows the component.
     * @function
     * @memberOf ProviderResultBoxBase#
     */
    show: function() {
        this.actor.show();
    },

    /**
     * @description Hides the component.
     * @function
     * @memberOf ProviderResultBoxBase#
     */
    hide: function() {
        this.actor.hide();
    },
});



/**
 * @class ProviderResultList
 * @extends ProviderResultBoxBase
 *
 * @classdesc This creates a list result box with button. It provides functions
 *            to open or close it and some for keyboard navigation. Please see
 *            also the parent class for more methods.
 *
 * @description Creates the box with button and list box. You need to provide
 *              valid arguments.
 *
 *
 * @param {MenuMediator} mediator A mediator instance.
 * @param {String} boxlabel A gettext id for the button.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const ProviderResultList = new Lang.Class({

    Name: 'GnoMenu.searchresultArea.ProviderResultList',
    Extends: ProviderResultBoxBase,


    _init: function(mediator, boxlabel) {
        this.parent(mediator, boxlabel);

        // This box takes the actual buttons.
        this._box = new St.BoxLayout({ vertical:true, style_class: 'gnomenu-searchArea-list-box' });
        this.actor.add(this._box, { x_fill: true, x_align: St.Align.START });

        this._isBoxShown = true;
        this._buttonGroup = new ButtonGroup();
    },

    /**
     * @description This removes all buttons from the list and destroys them.
     * @function
     * @memberOf ProviderResultList#
     */
    clear: function() {
        this._buttonGroup.reset();

        let actors = this._box.get_children();
        if (actors) {
            for each (let actor in actors) {
                this._box.remove_actor(actor);
                actor.destroy();
            }
        }
    },
    
    /**
     * @description Removes unneeded effects like the hover style.
     * @function
     * @memberof ProviderResultList#
     */
    clean: function() {
        this._buttonGroup.clean();
    },

    /**
     * @description Opens the component, ie shows the button list and selects
     *              the box button.
     * @function
     * @memberOf ProviderResultList#
     */
    open: function() {
        this._box.show();
        this._button.select();
        this._isBoxShown = true;
        this.actor.add_style_pseudo_class('open');
    },

    /**
     * @description Hides the component, ie hides the button list and selects
     *              the box button.
     * @function
     * @memberOf ProviderResultList#
     */
    close: function() {
        this._box.hide();
        this._button.deselect();
        this._isBoxShown = false;
        this.actor.remove_style_pseudo_class('open');
    },

    /**
     * @description Shows or hides the elements of the box. That means
     *              that the box is opened or closed depending on the state.
     * @function
     * @memberOf ProviderResultList#
     */
    toggleOpenState: function() {
        if (this._isBoxShown) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * @description Returns if the button list is empty.
     * @returns {Boolean}
     * @function
     * @memberOf ProviderResultList#
     */
    isEmpty: function() {
        return this._buttonGroup.getButtonCount() == 0;
    },

    /**
     * @description Adds a button to the list.
     * @param {SearchLaunchable} searchLaunchable This is an object which
     *                               holds app information and provides methods
     *                               to start it. @see SearchLaunchable,
     *                               @see Launchable
     * @function
     * @memberOf ProviderResultList#
     */
    addResultButton: function(searchLaunchable) {
        if (!searchLaunchable) {
            Log.logWarning("GnoMenu.searchresultArea.ProviderResultList", "addResultButton", "searchLaunchable is null!");
            return;
        }

        // Not much magic here. Just create the button and add it to actor and group.
        let iconSize = this._mediator.getMenuSettings().getAppListIconsize();
        let btn = new DraggableSearchListButton(this._mediator, iconSize, searchLaunchable);
        this._box.add_actor(btn.actor);
        this._buttonGroup.addButton(btn);
    },

    /**
     * @description Selects the first entry of the box.
     * @function
     * @memberOf ProviderResultList#
     */
    selectFirst: function() {
        this._buttonGroup.selectFirst();
    },

    /**
     * @description Selects the last entry of the box.
     * @function
     * @memberOf ProviderResultList#
     */
    selectLast: function() {
        this._buttonGroup.selectLast();
    },

    /**
     * @description Selects the next entry of the box.
     * @returns If the end was reached and the first button is now selected.
     * @function
     * @memberOf ProviderResultList#
     */
    selectNext: function() {
        return this._buttonGroup.selectNext();
    },

    /**
     * @description Selects the previous entry of the box.
     * @returns If the start was reached and the last button is now selected.
     * @function
     * @memberOf ProviderResultList#
     */
    selectPrevious: function() {
        return this._buttonGroup.selectPrevious();
    },

    /**
     * @description Activates the currently selected button.
     * @param {IntegerEnum} button The mousebutton connected to the action or null.
     * @param {Object} params
     * @returns If the activation was successful.
     * @function
     * @memberOf ProviderResultList#
     */
    activateSelected: function(button, params) {
        return this._buttonGroup.activateSelected(button, params);
    },

    /**
     * @description Deselects all buttons.
     * @function
     * @memberOf ProviderResultList#
     */
    resetSelection: function() {
        this._buttonGroup.clearButtonStates();
    },

    /**
     * @description Destroys the component.
     * @function
     * @memberOf ProviderResultList#
     */
    destroy: function() {
        this.actor.destroy();
    }
});



/**
 * @class ProviderResultGrid
 * @extends ProviderResultBoxBase
 *
 * @classdesc This class creates the search result grid view.
 *
 * @description Creates the box with button and list box. You need to provide
 *              valid arguments.
 *
 *
 * @param {MenuMediator} mediator A mediator instance.
 * @param {String} boxlabel A gettext id for the button.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const ProviderResultGrid = new Lang.Class({

    Name: 'GnoMenu.searchresultArea.ProviderResultGrid',
    Extends: ProviderResultBoxBase,


    _init: function(mediator, boxlabel) {
        this.parent(mediator, boxlabel);

        this._table = new St.Table({ homogeneous: false, reactive: true, style_class: 'gnomenu-searchArea-grid-box' });
        this.actor.add(this._table, { x_fill: false, x_align: St.Align.START });

        this._buttonGroup = new ButtonGroup();
    },

    /**
     * @description This removes all buttons from the list and destroys them.
     * @function
     * @memberOf ProviderResultGrid#
     */
    clear: function() {
        this._buttonGroup.reset();

        let actors = this._table.get_children();
        if (actors) {
            for each (let actor in actors) {
                this._table.remove_actor(actor);
                actor.destroy();
            }
        }
    },
    
    /**
     * @description Removes unneeded effects like the hover style.
     * @function
     * @memberof ProviderResultGrid#
     */
    clean: function() {
        this._buttonGroup.clean();
    },

    /**
     * @description Opens the component, ie shows the button list.
     * @function
     * @memberOf ProviderResultGrid#
     */
    open: function() {
        this._table.show();
        this._button.select();
        this._isBoxShown = true;
        this.actor.add_style_pseudo_class('open');
    },

    /**
     * @description Hides the component, ie hides the button list.
     * @function
     * @memberOf ProviderResultGrid#
     */
    close: function() {
        this._table.hide();
        this._button.deselect();
        this._isBoxShown = false;
        this.actor.remove_style_pseudo_class('open');
    },

    /**
     * @description Shows or hides the elements of the box.
     * @function
     * @memberOf ProviderResultGrid#
     */
    toggleOpenState: function() {
        if (this._isBoxShown) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * @description Returns if the button list is empty.
     * @returns {Boolean}
     * @function
     * @memberOf ProviderResultGrid#
     */
    isEmpty: function() {
        return this._buttonGroup.getButtonCount() == 0;
    },

    /**
     * @description Adds a button to the list.
     * @param {SearchLaunchable} searchLaunchable This is an object which
     *                               holds app information and provides methods
     *                               to start it. @see SearchLaunchable,
     *                               @see Launchable
     * @function
     * @memberOf ProviderResultGrid#
     */
    addResultButton: function(providerSearchResult) {
        if (!providerSearchResult ) {
            Log.logWarning("GnoMenu.searchresultArea.ProviderResultGrid", "addResultButton", "providerSearchResult is null!");
            return;
        }

        let iconSize = this._mediator.getMenuSettings().getAppGridIconsize();
        let btn = new DraggableSearchGridButton(this._mediator, iconSize, providerSearchResult);

        // Because this is a table we need to get the correct row and column.
        let colMax = this._mediator.getMenuSettings().getSearchEntriesPerRow();
        let buttonCount = this._buttonGroup.getButtonCount();
        let rowTmp = parseInt(buttonCount / colMax);
        let colTmp = buttonCount % colMax;
        this._table.add(btn.actor, { row: rowTmp, col: colTmp, x_fill: false });

        this._buttonGroup.addButton(btn);
    },

    /**
     * @description Selects the first entry of the box.
     * @function
     * @memberOf ProviderResultGrid#
     */
    selectFirst: function() {
        this._buttonGroup.selectFirst();
    },

    /**
     * @description Selects the last entry of the box.
     * @function
     * @memberOf ProviderResultGrid#
     */
    selectLast: function() {
        this._buttonGroup.selectLast();
    },

    /**
     * @description Selects the next entry of the box.
     * @returns {Boolean} If the start was reached and the last button is now selected.
     * @function
     * @memberOf ProviderResultGrid#
     */
    selectNext: function() {
        return this._buttonGroup.selectNext();
    },

    /**
     * @description Selects the previous entry of the box.
     * @returns {Boolean} If the end was reached and the first button is now selected.
     * @function
     * @memberOf ProviderResultGrid#
     */
    selectPrevious: function() {
        return this._buttonGroup.selectPrevious();
    },

    /**
     * @description Activates the currently selected button.
     * @param {IntegerEnum} button The mousebutton connected to the action or null.
     * @param {Object} params
     * @returns {Boolean} If the activation was successful.
     * @function
     * @memberOf ProviderResultGrid#
     */
    activateSelected: function(button, params) {
        return this._buttonGroup.activateSelected(button, params);
    },

    /**
     * @description Resets the current selection. After this call all buttons
     *              are deselected.
     * @function
     * @memberOf ProviderResultGrid#
     */
    resetSelection: function() {
        this._buttonGroup.clearButtonStates();
    },

    /**
     * @description Destroys the component.
     * @function
     * @memberOf ProviderResultGrid#
     */
    destroy: function() {
        this.actor.destroy();
    }
});



/**
 * @class ResultArea
 * @extends Component
 *
 * @classdesc This creates the result area which is shown while a
 *            search is active. It is an element that is build
 *            onto a scrollview and can be added to a normal
 *            boxlayout. The class provides some methods to change
 *            the viewmode or to handle keyboard input.
 *            The element is at this moment not ment to stay as top
 *            component in the menu but that would be possible
 *            without major changes.
 *            The task of this is to display the searchresults of
 *            the searchproviders ordered by provider in the current
 *            viewmode.
 *            This class depends on searchupdates. You need to connect
 *            the "updateSearch" method correctly. The results are then
 *            taken directly out of the model. It is not needed to
 *            provide them directly.
 *
 * @description You need to provide valid arguments.
 *
 *
 * @param {MenuModel} model A model instance.
 * @param {MenuMediator} mediator A mediator instance.
 *
 *
 * @author AxP <Der_AxP@t-online.de>
 * @author passingthru67 <panacier@gmail.com>
 * @version 1.0
 */
const ResultArea = new Lang.Class({

    Name: 'GnoMenu.searchresultArea.ResultArea',
    Extends: Component,


    _init: function(model, mediator) {
        this.parent(model, mediator);

        // This box contains for each search provider a subbox with a button.
        // List or grid view depends on the main list and grid option.
        this._mainBox = new St.BoxLayout({ style_class: 'gnomenu-searchArea-box', vertical: true });

        this.actor = new St.ScrollView({ x_fill: true, y_fill: false, y_align: St.Align.START, style_class: 'vfade gnomenu-searchArea-scrollbox' });
        this.actor.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
        this.actor.set_mouse_scrolling(true);
        this.actor.add_actor(this._mainBox);

        // Sign that is shown if no provider has results.
        this._emptySign = new St.Label();
        this._emptySign.set_text(_("No Result"));

        this._viewMode = null;
        this._lastResults = null;

        // The provider boxes vary with the viewmode. This map stores the
        // boxes for each viewmode.
        this._viewmodeProviderBoxMap = {};
        this._selectedIdx = 0;
        this._selectedBox = null;
    },

    /**
     * @description Use this function to bring the view up-to-date.
     * @function
     * @memberOf ResultArea#
     */
    refresh: function() {
        this._showResults(this._lastResults);
    },

    /**
     * @description Use this function to remove all actors from the component.
     * @function
     * @memberOf ResultArea#
     */
    clear: function() {
        let actors = this._mainBox.get_children();
        if (actors) {
            for each (let actor in actors) {
                this._mainBox.remove_actor(actor);
                actor.destroy();
            }
        }

        this._viewmodeProviderBoxMap = {};
        this._selectedIdx = 0;
        this._selectedBox = null;
    },

    /**
     * @description Use this function to destroy the component.
     * @function
     * @memberOf ResultArea#
     */
    destroy: function() {
        this.actor.destroy();
    },
    
    /**
     * @description Removes unneeded effects like the hover style.
     * @function
     * @memberof ResultArea#
     */
    clean: function() {
        if (!this._viewMode) {
            return;
        }
        
        let boxmap = this._viewmodeProviderBoxMap[this._viewMode];
        if (!boxmap) {
            return;
        }
        
        for each (let box in boxmap) {
            box.clean();
        }
    },

    /**
     * @description This function is used to update the component. It takes
     *              the normal model events. The important ones are the search
     *              update events.
     * @param {Object} event An Object with an type entry.
     * @function
     * @memberOf ResultArea#
     */
    updateSearch: function(event) {
        switch (event.type) {

            case EEventType.SEARCH_UPDATE_EVENT:
                // You can provide an maximal count to get only the wanted number of results.
                this._showResults(this.model.getSearchResults({ maxNumber: this.menuSettings.getMaxSearchResultCount() }));
                break;

            case EEventType.SEARCH_STOP_EVENT:
                this.clear();
                this._lastResults = null;
                break;

            default:
                break;
        }
    },

    /**
     * @description Sets the viewmode.
     * @param {IntegerEnum} viewMode
     * @function
     * @memberOf ResultArea#
     */
    setViewMode: function(viewMode) {
        if (!viewMode) {
            Log.logError("GnoMenu.searchresultArea.ResultArea", "setViewMode", "ViewMode may not be null!");
        }
        this._viewMode = viewMode;
        this._showResults(this._lastResults);
    },

    /**
     * @description Selects the first entry of the first box.
     * @function
     * @memberOf ResultArea#
     */
    selectFirst: function() {
        this._selectedIdx = 0;
        let box = this._getVisibleBox(false);
        if (box) box.selectFirst();
    },

    /**
     * @description Selects the first entry of the last box.
     * @function
     * @memberOf ResultArea#
     */
    selectLast: function() {
        this._selectedIdx = -1;
        let box = this._getVisibleBox(true);
        if (box) box.selectFirst();
    },

    /**
     * @description Selects the first entry of the upper box if the grid mode
     *              is active else it selects the upper button.
     * @function
     * @memberOf ResultArea#
     */
    selectUpper: function() {
        switch (this._viewMode) {

            case EViewMode.LIST:
                box = this._selectedBox;
                if (box) box.selectPrevious();
                break;

            case EViewMode.GRID:
                this._selectedIdx -= 1;
                let box = this._getVisibleBox(true);
                if (box) box.selectFirst();
                break;
        }
    },

    /**
     * @description Selects the first entry of the lower box if the grid mode
     *              is active else it selects the lower button.
     * @function
     * @memberOf ResultArea#
     */
    selectLower: function() {
        switch (this._viewMode) {

            case EViewMode.LIST:
                box = this._selectedBox;
                if (box) box.selectNext();
                break;

            case EViewMode.GRID:
                this._selectedIdx += 1;
                let box = this._getVisibleBox(false);
                if (box) box.selectFirst();
                break;
        }
    },

    /**
     * @description Selects the next button if the grid mode is active else
     *              it selects the next box and there the first entry.
     * @function
     * @memberOf ResultArea#
     */
    selectNext: function() {
        switch (this._viewMode) {

            case EViewMode.LIST:
                this._selectedIdx += 1;
                let box = this._getVisibleBox(false);
                if (box) box.selectFirst();
                break;

            case EViewMode.GRID:
                box = this._selectedBox;
                if (box) box.selectNext();
                break;
        }
    },

    /**
     * @description Selects the previous button if the grid mode is active else
     *              it selects the previous box and there the first entry.
     * @function
     * @memberOf ResultArea#
     */
    selectPrevious: function() {
        switch (this._viewMode) {

            case EViewMode.LIST:
                this._selectedIdx -= 1;
                let box = this._getVisibleBox(true);
                if (box) box.selectFirst();
                break;

            case EViewMode.GRID:
                box = this._selectedBox;
                if (box) box.selectPrevious();
                break;
        }
    },

    /**
     * @description Selects the next button of the box.
     * @function
     * @memberOf ResultArea#
     */
    cycleForwardInBox: function() {
        let box = this._selectedBox;
        if (box) box.selectNext();
    },

    /**
     * @description Activates the selected button.
     * @function
     * @memberOf ResultArea#
     */
    activateSelected: function(button, params) {
        let box = this._selectedBox;
        if (box) box.activateSelected(button, params);
    },

    /**
     * @description Returns the next box in the given direction.
     * @param {Boolean} Wether to search upwards for the next non-empty box.
     * @returns {Box} The newly selected box or null.
     * @private
     * @function
     * @memberOf ResultArea#
     */
    _getVisibleBox: function(searchUpwards) {
        if (!this._viewMode || !this._viewmodeProviderBoxMap) {
            return null;
        }

        if (!this._viewmodeProviderBoxMap[this._viewMode]) {
            return null;
        }

        // I am searching for a box that has entries and is the next one
        // in the upwards or downwards direction.
        let box = null;
        let boxMap = this._viewmodeProviderBoxMap[this._viewMode];
        let keys = Object.keys(boxMap);
        for (let boxIdx in boxMap) {
            this._selectedIdx %= keys.length;
            if (this._selectedIdx < 0) {
                this._selectedIdx = keys.length - 1;
            }

            box = boxMap[keys[this._selectedIdx]];
            if (box && !box.isEmpty()) {
                break;
            }

            if (searchUpwards) {
                this._selectedIdx -= 1;
            } else {
                this._selectedIdx += 1;
            }
        }

        // This still points to the last selected box.
        if (this._selectedBox) {
            this._selectedBox.resetSelection();
            this._selectedBox.close();
        }

        if (box) {
            box.open();
        }

        this._selectedBox = box;
        return box;
    },

    /**
     * @description Deselects every button and every box.
     * @function
     * @memberOf ResultArea#
     */
    resetSelection: function() {
        for each (let box in this._viewmodeProviderBoxMap[this._viewMode]) {
            box.resetSelection();
        }

        this._selectedIdx = 0;
        this._selectedBox = null;
    },

    /**
     * @description This function updates or creates the needed result boxes.
     * @param {ResultMetasMap} resultMetas The provider IDs and their results
     *                                     as SearchLaunchables.
     * @private
     * @function
     * @memberOf ResultArea#
     */
    _showResults: function(resultMetas) {
        if (!resultMetas) {
            return;
        }

        if (!this._viewMode) {
            return;
        }

        // The boxes are stored inside a map in a map.
        // First key is the viewmode. The second is the provider id.
        if (!this._viewmodeProviderBoxMap[this._viewMode]) {
            this._viewmodeProviderBoxMap[this._viewMode] = {};
        }
        let boxMap = this._viewmodeProviderBoxMap[this._viewMode];

        // Remove everything.
        let actors = this._mainBox.get_children();
        if (actors) {
            for each (let actor in actors) {
                this._mainBox.remove_actor(actor);
            }
        }

        // Clean all up and show all boxes.
        for each (let box in boxMap) {
            box.clear();
            box.show();
        }

        // Get the correct box class. You could push that inside the for loop.
        let currentBoxClass = null;
        if (this._viewMode == EViewMode.LIST) {
            currentBoxClass = ProviderResultList;
        } else if (this._viewMode == EViewMode.GRID) {
            currentBoxClass = ProviderResultGrid;
        }

        // Look up if a provider box already exists, if not create it.
        for (let id in resultMetas) {
            let box = boxMap[id];
            if (id && !box) {
                // There was one box for a provider missing..
                box = new currentBoxClass(this.mediator, id);
                boxMap[id] = box;
            }
            this._mainBox.add(box.actor);

            // Add the results to the box.
            let metaList = resultMetas[id];
            for each (let meta in metaList) {
                box.addResultButton(meta);
            }
        }

        // We dont have much room so just show the first result provider and
        // collapse the rest.
        let isFirstVisible = false;
        for each (let box in boxMap) {
            box.close();

            // An empty box should not show up.
            if (box.isEmpty()) {
                box.hide();

            } else {
                // I want to open the first box and close the other.
                if (!isFirstVisible) {
                    box.open();
                    box.selectFirst();
                    isFirstVisible = true;
                }
            }
        }

        if (!isFirstVisible) {
            // If one box is visible this would be true. If its not then there is no box.
            this._mainBox.add(this._emptySign, { x_fill: false, y_fill: false, expand: true, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
        }

        // Ok, it seems that changing the reference does not change the original...
        this._viewmodeProviderBoxMap[this._viewMode] = boxMap;
        // Store the last results for refreshs.
        this._lastResults = resultMetas;
    },
});
