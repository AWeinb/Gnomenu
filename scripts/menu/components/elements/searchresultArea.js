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
const DraggableSearchGridButton = Me.imports.scripts.menu.components.elements.menubutton.DraggableGridButton;
const DraggableSearchListButton = Me.imports.scripts.menu.components.elements.menubutton.DraggableListButton;
const ButtonGroup = Me.imports.scripts.menu.components.elements.menubutton.ButtonGroup;
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
        
        this.actor.connect('notify::destroy', Lang.bind(this, this._onDestroy));
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
    _onDestroy: function() {
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
            Log.logWarning("GnoMenu.searchresultArea.ProviderResultBoxButton", "destroy", "Unregister error occured!");
        }
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

    Name: 'GnoMenu.searchresultArea.ProviderResultBoxBase',


    _init: function(mediator, boxlabel) {
        if (!mediator || !boxlabel) {
            Log.logError("GnoMenu.searchresultArea.ProviderResultBoxBase", "_init", "mediator, boxlabel, may not be null!");
        }
        this._mediator = mediator;

        // Creates the button and the box. Other elements are added in the subclasses.
        this._button = new ProviderResultBoxButton(boxlabel);
        this._button.setOnClickHandler(Lang.bind(this, this.toggleOpenState));

        this.actor = new St.BoxLayout({ style_class: 'gnomenu-searchArea-category-box', vertical: true });
        this.actor.add(this._button.actor);
    },

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
     * @public
     * @function
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
     * @description Opens the component, ie shows the button list.
     * @public
     * @function
     */
    open: function() {
        this._box.show();
        this._button.select();
        this._isBoxShown = true;
        this.actor.add_style_pseudo_class('open');
    },

    /**
     * @description Hides the component, ie hides the button list.
     * @public
     * @function
     */
    close: function() {
        this._box.hide();
        this._button.deselect();
        this._isBoxShown = false;
        this.actor.remove_style_pseudo_class('open');
    },
    
    /**
     * @description Shows or hides the elements of the box.
     * @public
     * @function
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
     * @public
     * @function
     */
    isEmpty: function() {
        return this._buttonGroup.getButtonCount() == 0;
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
            Log.logWarning("GnoMenu.searchresultArea.ProviderResultList", "addResultButton", "providerSearchResult is null!");
            return;
        }

        let iconSize = this._mediator.getMenuSettings().getAppListIconsize();
        let btn = new DraggableSearchListButton(this._mediator, iconSize, providerSearchResult);
        this._box.add_actor(btn.actor);
        
        this._buttonGroup.addButton(btn);
    },
    
    selectFirst: function() {
        this._buttonGroup.selectFirst();
    },
    
    selectLast: function() {
        this._buttonGroup.selectLast();
    },
    
    selectNext: function() {
        return this._buttonGroup.selectNext();
    },

    selectPrevious: function() {
        return this._buttonGroup.selectPrevious();
    },
    
    activateSelected: function(button, params) {
        return this._buttonGroup.activateSelected(button, params);
    },
    
    resetSelection: function() {
        this._buttonGroup.clearButtonStates();
    },

    /**
     * @description Destroys the component.
     * @public
     * @function
     */
    destroy: function() {
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
     * @public
     * @function
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
     * @description Opens the component, ie shows the button list.
     * @public
     * @function
     */
    open: function() {
        this._table.show();
        this._button.select();
        this._isBoxShown = true;
        this.actor.add_style_pseudo_class('open');
    },

    /**
     * @description Hides the component, ie hides the button list.
     * @public
     * @function
     */
    close: function() {
        this._table.hide();
        this._button.deselect();
        this._isBoxShown = false;
        this.actor.remove_style_pseudo_class('open');
    },
    
    /**
     * @description Shows or hides the elements of the box.
     * @public
     * @function
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
     * @public
     * @function
     */
    isEmpty: function() {
        return this._buttonGroup.getButtonCount() == 0;
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
            Log.logWarning("GnoMenu.searchresultArea.ProviderResultGrid", "addResultButton", "providerSearchResult is null!");
            return;
        }

        let iconSize = this._mediator.getMenuSettings().getAppGridIconsize();
        let btn = new DraggableSearchGridButton(this._mediator, iconSize, providerSearchResult);

        // The number of items in a row could possibly be handled dynamically..
        let colMax = this._mediator.getMenuSettings().getSearchEntriesPerRow();
        let buttonCount = this._buttonGroup.getButtonCount();
        let rowTmp = parseInt(buttonCount / colMax);
        let colTmp = buttonCount % colMax;
        this._table.add(btn.actor, { row: rowTmp, col: colTmp, x_fill: false });
        
        this._buttonGroup.addButton(btn);
    },
    
    selectFirst: function() {
        this._buttonGroup.selectFirst();
    },
    
    selectLast: function() {
        this._buttonGroup.selectLast();
    },
    
    selectNext: function() {
        return this._buttonGroup.selectNext();
    },

    selectPrevious: function() {
        return this._buttonGroup.selectPrevious();
    },
    
    activateSelected: function(button, params) {
        let ret = this._buttonGroup.activateSelected(button, params);
        if (!ret) {
            this.selectFirst();
            this._buttonGroup.activateSelected(button, params);
        }
    },
    
    resetSelection: function() {
        this._buttonGroup.clearButtonStates();
    },

    /**
     * @description Destroys the component.
     * @public
     * @function
     */
    destroy: function() {
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
    
        this._emptySign = new St.Label();
        this._emptySign.set_text(_("No Result"));
            
        this._viewMode = null;
        this._lastResults = null;
        
        this._viewmodeProviderBoxMap = {};
        this._selectedIdx = 0;
        this._selectedBox = null;
    },

    /**
     * @description Use this function to bring the view up-to-date.
     * @public
     * @function
     */
    refresh: function() {
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
                actor.destroy();
            }
        }

        this._viewmodeProviderBoxMap = {};
        this._selectedIdx = 0;
        this._selectedBox = null;
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

    /**
     * @description Sets the viewmode.
     * @param {Enum} viewMode
     * @public
     * @function
     */
    setViewMode: function(viewMode) {
        if (!viewMode) {
            Log.logError("GnoMenu.searchresultArea.ResultArea", "setViewMode", "ViewMode may not be null!");
        }
        this._viewMode = viewMode;
        this._showResults(this._lastResults);
    },
    
    selectFirst: function() {
        this._selectedIdx = 0;
        let box = this._getVisibleBox(false);
        if (box) box.selectFirst();
    },
    
    selectLast: function() {
        this._selectedIdx = -1;
        let box = this._getVisibleBox(true);
        if (box) box.selectFirst();
    },
    
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
    
    cycleForwardInBox: function() {
        let box = this._selectedBox;
        if (box) box.selectNext();
    },
    
    activateSelected: function(button, params) {
        let box = this._selectedBox;
        if (box) box.activateSelected(button, params);
    },
    
    _getVisibleBox: function(searchUpwards) {
        if (!this._viewMode || !this._viewmodeProviderBoxMap) {
            return null;
        }
        
        if (!this._viewmodeProviderBoxMap[this._viewMode]) {
            return null;
        }
        
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
    
    resetSelection: function() {
        for each (let box in this._viewmodeProviderBoxMap[this._viewMode]) {
            box.resetSelection();
        }
        
        this._selectedIdx = 0;
        this._selectedBox = null;
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
        
        if (!this._viewMode) {
            return;
        }
        
        if (!this._viewmodeProviderBoxMap[this._viewMode]) {
            this._viewmodeProviderBoxMap[this._viewMode] = {};
        }
        let boxMap = this._viewmodeProviderBoxMap[this._viewMode];
        
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
                if (!isFirstVisible) {
                    box.open();
                    box.selectFirst();
                    isFirstVisible = true;
                }
            }
        }
        
        if (!isFirstVisible) {
            this._mainBox.add(this._emptySign, { x_fill: false, y_fill: false, expand: true, x_align: St.Align.MIDDLE, y_align: St.Align.MIDDLE });
        }

        // Ok, it seems that changing the reference does not change the original...
        this._viewmodeProviderBoxMap[this._viewMode] = boxMap;
        // Store the last results for refreshs.
        this._lastResults = resultMetas;
    },
});
