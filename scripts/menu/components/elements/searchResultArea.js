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
const Gtk = imports.gi.Gtk;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const MenuModel = Me.imports.scripts.menu.menuModel;
const Log = Me.imports.scripts.misc.log;
const DraggableSearchGridButton = Me.imports.scripts.menu.components.elements.menubutton.DraggableSearchGridButton;
const DraggableSearchListButton = Me.imports.scripts.menu.components.elements.menubutton.DraggableSearchListButton;
const Component = Me.imports.scripts.menu.components.component.Component;

const EEventType = MenuModel.EEventType;
const EViewMode = MenuModel.EViewMode;


const OPEN_ICON = 'list-add-symbolic';
const CLOSE_ICON = 'list-remove-symbolic';
const ICON_SIZE = 20;



/**
 * @class ProviderResultBoxButton: This creates the show/hide button for the searchresults.
 *
 * @param {String} labelTextID The gettext id of the label.
 *
 *
 * @author AxP
 * @version 1.0
 */
const ProviderResultBoxButton = new Lang.Class({

    Name: 'GnoMenu.searchResultArea.ProviderResultBoxButton',


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
     * @description Select the button. This means that the icon changes.
     * @public
     * @function
     */
    select: function() {
        this.stIcon.icon_name = CLOSE_ICON;
        this.actor.add_style_pseudo_class('pressed');
    },

    /**
     * @description Deselect the button. This means that the icon changes.
     * @public
     * @function
     */
    deselect: function() {
        this.stIcon.icon_name = OPEN_ICON;
        this.actor.remove_style_pseudo_class('pressed');
    },

    /**
     * @description Set the onclick handler.
     * @param {function} handler
     * @public
     * @function
     */
    setOnClickHandler: function(handler) {
        this._btnClickHandler = handler;
    },
    
    /**
     * @description Destroys the component.
     * @public
     * @function
     */
    destroy: function() {
        // Prevent unregister errors.
        try {
            this.actor.disconnect(this._btnPressId);
            this.actor.disconnect(this._btnReleaseId);
            this.actor.disconnect(this._btnEnterId);
            this.actor.disconnect(this._btnLeaveId);
            this._btnPressId = undefined;
            this._btnReleaseId = undefined;
            this._btnEnterId = undefined;
            this._btnLeaveId = undefined;
        
        } catch(e) {
            Log.logWarning("GnoMenu.searchResultArea.ProviderResultBoxButton", "destroy", "Unregister error occured!");
        }
        this.actor.destroy();
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
        if (this._btnClickHandler) {
            this._btnClickHandler(actor, event);
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
        // %
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
        this.actor.remove_style_pseudo_class('pressed');
    },
});


/**
 * @class ProviderResultBoxBase: This is the base of the search result boxes.
 *
 * @param {MenuMediator} mediator A mediator instance.
 * @param {String} boxlabel A gettext id for the button.
 *
 *
 * @author AxP
 * @version 1.0
 */
const ProviderResultBoxBase = new Lang.Class({

    Name: 'GnoMenu.searchResultArea.ProviderResultBoxBase',


    _init: function(mediator, boxlabel) {
        if (!mediator || !boxlabel) {
            Log.logError("GnoMenu.searchResultArea.ProviderResultBoxBase", "_init", "mediator, boxlabel, may not be null!");
        }
        this._mediator = mediator;

        // Creates the button and the box. Other elements are added in the subclasses.
        this._button = new ProviderResultBoxButton(boxlabel);
        this._button.setOnClickHandler(Lang.bind(this, this.toggleOpenState));

        this.actor = new St.BoxLayout({ style_class: 'gnomenu-searchArea-category-box', vertical: true });
        this.actor.add(this._button.actor);
        
        this._buttonCount = 0;
        this._isBoxShown = true;
    },
    
    /**
     * @description Shows or hides the elements of the box.
     * @public
     * @function
     */
    toggleOpenState: function() {
        if (this._isBoxShown) {
            this.close();
            this._isBoxShown = false;
        } else {
            this.open();
            this._isBoxShown = true;
        }
    },

    open: function() {},
    
    close: function() {},
    
    /**
     * @description Shows the component.
     * @public
     * @function
     */
    show: function() {
        this.actor.show();
    },

    /**
     * @description Hides the component.
     * @public
     * @function
     */
    hide: function() {
        this.actor.hide();
    },
    
    /**
     * @description Returns if the button list is empty.
     * @returns {Boolean}
     * @public
     * @function
     */
    isEmpty: function() {
        return this._buttonCount == 0;
    },
});


/**
 * @class ProviderResultList: This creates a list result box with button.
 * @extends ProviderResultBoxBase
 *
 * @param {MenuMediator} mediator A mediator instance.
 * @param {String} boxlabel A gettext id for the button.
 *
 *
 * @author AxP
 * @version 1.0
 */
const ProviderResultList = new Lang.Class({

    Name: 'GnoMenu.searchResultArea.ProviderResultList',
    Extends: ProviderResultBoxBase,


    _init: function(mediator, boxlabel) {
        this.parent(mediator, boxlabel);

        // This box takes the actual buttons.
        this._box = new St.BoxLayout({ vertical:true, style_class: 'gnomenu-searchArea-list-box' });
        this.actor.add(this._box, { x_fill: true, x_align: St.Align.START });
    },

    /**
     * @description This removes all buttons from the list and destroys them.
     * @public
     * @function
     */
    clear: function() {
        let actors = this._box.get_children();
        if (actors) {
            for each (let actor in actors) {
                this._box.remove_actor(actor);
                actor.destroy();
            }
        }
        this._buttonCount = 0;
    },

    /**
     * @description Opens the component, ie shows the button list.
     * @public
     * @function
     */
    open: function() {
        this._box.show();
        this._button.select();
    },

    /**
     * @description Hides the component, ie hides the button list.
     * @public
     * @function
     */
    close: function() {
        this._box.hide();
        this._button.deselect();
    },

    /**
     * @description .
     * @public
     * @function
     */
    selectNext: function() {
    },

    /**
     * @description 
     * @public
     * @function
     */
    selectPrevious: function() {
    },

    /**
     * @description Adds a button to the list.
     * @param {ProviderSearchResult} providerSearchResult This is an object which
     *                               holds app information and provides methods
     *                               to start it.
     * @public
     * @function
     */
    addResultButton: function(providerSearchResult) {
        if (!providerSearchResult) {
            Log.logWarning("GnoMenu.searchResultArea.ProviderResultList", "addResultButton", "providerSearchResult is null!");
            return;
        }

        let iconSize = this._mediator.getMenuSettings().getAppListIconsize();
        this._box.add_actor(new DraggableSearchListButton(this._mediator, iconSize, providerSearchResult).actor);
        this._buttonCount++;
    },

    /**
     * @description Destroys the component.
     * @public
     * @function
     */
    destroy: function() {
        this.clear();
        this._box.destroy();
        this._button.destroy();
        this.actor.destroy();
    }
});


/**
 * @class ProviderResultGrid: This class creates the search result grid view.
 * @extends ProviderResultBoxBase
 * 
 * @param {MenuMediator} mediator A mediator instance.
 * @param {String} boxlabel A gettext id for the button.
 *
 *
 * @author AxP
 * @version 1.0
 */
const ProviderResultGrid = new Lang.Class({

    Name: 'GnoMenu.searchResultArea.ProviderResultGrid',
    Extends: ProviderResultBoxBase,


    _init: function(mediator, boxlabel) {
        this.parent(mediator, boxlabel);

        this._table = new St.Table({ homogeneous: false, reactive: true, style_class: 'gnomenu-searchArea-grid-box' });
        this.actor.add(this._table, { x_fill: false, x_align: St.Align.START });
    },

    /**
     * @description This removes all buttons from the list and destroys them.
     * @public
     * @function
     */
    clear: function() {
        let actors = this._table.get_children();
        if (actors) {
            for each (let actor in actors) {
                this._table.remove_actor(actor);
                actor.destroy();
            }
        }
        this._buttonCount = 0;
    },

    /**
     * @description Opens the component, ie shows the button list.
     * @public
     * @function
     */
    open: function() {
        this._table.show();
        this._button.select();
    },

    /**
     * @description Hides the component, ie hides the button list.
     * @public
     * @function
     */
    close: function() {
        this._table.hide();
        this._button.deselect();
    },

    selectNext: function() {
    },

    selectPrevious: function() {
    },

    /**
     * @description Adds a button to the list.
     * @param {ProviderSearchResult} providerSearchResult This is an object which
     *                               holds app information and provides methods
     *                               to start it.
     * @public
     * @function
     */
    addResultButton: function(providerSearchResult) {
        if (!providerSearchResult ) {
            Log.logWarning("GnoMenu.searchResultArea.ProviderResultGrid", "addResultButton", "providerSearchResult is null!");
            return;
        }

        let iconSize = this._mediator.getMenuSettings().getAppGridIconsize();
        let btn = new DraggableSearchGridButton(this._mediator, iconSize, providerSearchResult);

        // The number of items in a row could possibly be handled dynamically..
        let colMax = this._mediator.getMenuSettings().getSearchEntriesPerRow();
        let rowTmp = parseInt(this._buttonCount / colMax);
        let colTmp = this._buttonCount % colMax;
        this._table.add(btn.actor, { row: rowTmp, col: colTmp, x_fill: false });
        this._buttonCount++;
    },

    /**
     * @description Destroys the component.
     * @public
     * @function
     */
    destroy: function() {
        this.clear();
        this._table.destroy();
        this._button.destroy();
        this.actor.destroy();
    }
});


/**
 * @class ResultArea: This creates the result area which is shown while a
 *                    search is active.
 * @extends Component
 *
 * @param {MenuModel} model A model instance.
 * @param {MenuMediator} mediator A mediator instance.
 *
 *
 * @author AxP
 * @version 1.0
 */
const ResultArea = new Lang.Class({

    Name: 'GnoMenu.searchResultArea.ResultArea',
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

        this._viewMode = null;
        this._lastResults = null;
    },

    /**
     * @description Use this function to bring the view up-to-date.
     * @public
     * @function
     */
    refresh: function() {
        this._viewMode = this.menuSettings.getShortcutAreaViewMode();
        this._showResults(this._lastResults);
    },
    
    /**
     * @description Use this function to remove all actors from the component.
     * @public
     * @function
     */
    clear: function() {
        let actors = this._mainBox.get_children();
        if (actors) {
            for each (let actor in actors) {
                this._mainBox.remove_actor(actor);
            }
        }
        
        // Destroys all little result boxes.
        for each (let box in this._providerListBoxes) {
            box.destroy();
        }
        for each (let box in this._providerGridBoxes) {
            box.destroy();
        }

        this._providerListBoxes = {};
        this._providerGridBoxes = {};
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

    updateSearch: function(event) {
        switch (event.type) {
            
            case EEventType.SEARCH_UPDATE_EVENT:
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

    selectNext: function() {
    },

    selectPrevious: function() {
    },

    /**
     * @description Sets the viewmode.
     * @param {Enum} viewMode
     * @public
     * @function
     */
    setViewMode: function(viewMode) {
        if (!viewMode) {
            Log.logError("GnoMenu.searchResultArea.ResultArea", "setViewMode", "ViewMode may not be null!");
        }
        this._viewMode = viewMode;
        this._showResults(this._lastResults);
    },

    /**
     * @description This function updates or creates the needed result boxes.
     * @param {ProviderID Result Map} resultMetas The provider IDs and their results.
     * @private
     * @function
     */
    _showResults: function(resultMetas) {
        if (!resultMetas) {
            return;
        }
        
        // Gets the current map and box class. Depends on the viewmode.
        let boxMap = null;
        let currentBoxClass = null;
        switch (this._viewMode) {

            case EViewMode.LIST:
                boxMap = this._providerListBoxes;
                currentBoxClass = ProviderResultList;
                break;

            case EViewMode.GRID:
                boxMap = this._providerGridBoxes;
                currentBoxClass = ProviderResultGrid;
                break;

            default:
                Log.logWarning("GnoMenu.searchResultArea.ResultArea", "_showResults", "Unknown view mode!");
                return;
        }

        if (boxMap) {
            this.clear();
        }
        
        // Clean all up and show all boxes.
        for each (let box in boxMap) {
            box.clear();
            box.show();
        }

        // Look up if a provider box already exists, if not create it.
        for (let id in resultMetas) {
            if (id && !boxMap[id]) {
                boxMap[id] = new currentBoxClass(this.mediator, id);
            }
            this._mainBox.add(boxMap[id].actor);

            // Add the results to the box.
            let metaList = resultMetas[id];
            for each (let meta in metaList) {
                boxMap[id].addResultButton(meta);
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
                if (!isFirstVisible) {
                    box.open();
                    isFirstVisible = true;
                }
            }
        }

        // Store the last results for refreshs.
        this._lastResults = resultMetas;
    },
});