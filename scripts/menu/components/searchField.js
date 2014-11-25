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
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;
const St = imports.gi.St;
const Meta = imports.gi.Meta;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Component = Me.imports.scripts.menu.components.component.Component;



/**
 * @class SearchField
 * @extends Component
 *
 * @classdesc This class creates the search entry at the top. The basic principle
 *            behind it is same as that of the normal Gnome search. When text is
 *            typed into the box or a textevent reaches the component it is send to
 *            the searchsystem, which then computes the results. The component is
 *            dependent on model update events which tell it when new results are
 *            available. Most functionallity is handled inside the class and the
 *            only thing needed is keyfocus. But nether the less the class provides
 *            some methods to interact with the component.
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
 * @author Gnome Shell
 * @version 1.0
 */
const SearchField = new Lang.Class({
    /*
     * This works like the normal Gnome search except for some parts. The field
     * listens for input and checks if it is search-worthy. If yes there are three
     * steps. First a search is started if there is no current search run. That is
     * of course the case if the field is empty. After that search runs are
     * updated and, if the field is empty again, stopped. All this action get
     * to a searchsystem by the mediator. The data is not returned with this call.
     * Instead the searchsystem and the model store the result for some user.
     */

    Name: 'Gnomenu.SearchField',
    Extends: Component,


    _init: function(model, mediator) {
        this.parent(model, mediator);

        this._searchActive = false;
        this._iconClickedId = 0;
        this._searchTimeoutId = 0;

        /*
         * The actor is a box which gets an Entry, which is the textfield.
         * The textfield has two optional icons/buttons at its borders.
         */
        this.actor = new St.BoxLayout({ style_class: 'gnomenu-search-box' });
        // This is the actual textfield.
        this._searchEntry = new St.Entry({ name: 'searchEntry', style_class: 'search-entry-icon gnomenu-search-searchEntry', hint_text: _('Type to Search'), track_hover: true, can_focus: true });
        this.actor.add(this._searchEntry, { expand: true, x_align: St.Align.START, y_align: St.Align.START });
        this._searchEntryText = this._searchEntry.clutter_text;

        this._searchIcon = new St.Icon({ style_class: 'search-entry-icon gnomenu-search-searchEntry-icon', icon_name: 'edit-find-symbolic' });
        this._searchEntry.set_primary_icon(this._searchIcon);

        // This icon is dependend of the writing direction. Later it is used as a clear button.
        if (this._searchEntry.get_text_direction() == Clutter.TextDirection.RTL) {
            this._clearIcon = new St.Icon({ style_class: 'search-entry-icon gnomenu-search-searchEntry-icon', icon_name: 'edit-clear-rtl-symbolic' });
        } else {
            this._clearIcon = new St.Icon({ style_class: 'search-entry-icon gnomenu-search-searchEntry-icon', icon_name: 'edit-clear-symbolic' });
        }

        // To search we need the keyboard events.
        this._keyPressID = this._searchEntryText.connect('key_release_event', Lang.bind(this, this._onKeyPress));
        // The mousebutton event is used to set the keyfocus properly. We need to tell the mediator that the focus is now here.
        this._btnPressID = this._searchEntryText.connect('button-press-event', Lang.bind(this, this._onButtonPress));
    },

    /**
     * @description Use this function to bring the view to starting state.
     * @function
     * @memberOf SearchField#
     */
    refresh: function() {
        this.reset();
    },

    /**
     * @description Use this function to remove all actors from the component.
     *              Not implemented for this class.
     * @function
     * @memberOf SearchField#
     */
    clear: function() {
        /*
         * It is not needed to remove the entry to reset this component.
         */
        Log.logWarning("Gnomenu.ControlPane", "clear", "This is not useful!");
    },

    /**
     * @description Destroys the component. Unregisters all connections.
     * @function
     * @memberOf SearchField#
     */
    destroy: function() {
        if (this._searchEntryText) {
            this._searchEntryText.disconnect(this._keyPressID);
            this._keyPressID = 0;

            this._searchEntryText.disconnect(this._btnPressID);
            this._btnPressID = 0;
        }

        if (this._iconClickedId > 0) {
            this._searchEntry.disconnect(this._iconClickedId);
            this._iconClickedId = 0;
        }

        if (this._searchTimeoutId > 0) {
            Mainloop.source_remove(this._searchTimeoutId);
            this._searchTimeoutId = 0;
        }

        this.actor.destroy();
    },

    /**
     * @description This function removes all text from the textfield and triggers
     *              a response on this action. So a manuel search stop is not
     *              needed.
     * @function
     * @memberOf SearchField#
     */
    reset: function() {
        this._searchEntry.text = '';
        this._onTextChanged();
    },

    /**
     * @description Returns if the textfield has more than zero chars.
     * @returns {Boolean}
     * @function
     * @memberOf SearchField#
     */
    hasText: function() {
        return this._searchEntry.text != '';
    },

    /**
     * @description This function sets the focus on to the search entry. Also it is possible
     *              to give it the last typed event. In this case the last typed
     *              char is entered into the field.
     * @param {Clutter.Actor} actor
     * @param {Clutter.Event} event
     * @function
     * @memberOf SearchField#
     */
    activateFocus: function(actor, event) {
        global.stage.set_key_focus(this._searchEntryText);

        if (event) {
            let symbolID = event.get_key_symbol();
            let unicode = Clutter.keysym_to_unicode(symbolID);

            // I can only use valid chars as input.
            if (unicode != 0 && this._getTermsForSearchString(String.fromCharCode(unicode)).length > 0) {
                this._searchEntry.text = String.fromCharCode(unicode);
                // This call runs the lost run of the search.
                this._onKeyPress(actor, event);
            }
        }
    },

    /**
     * @description Handler for mouseevents. It is simply a method that
     *              sets the keyfocus correctly.
     * @private
     * @function
     * @memberOf SearchField#
     */
    _onButtonPress: function(actor, unused) {
        // I dont want to send on the mouse event into the keyboard world.
        this.mediator.activateSearchfieldKeyFocus(actor, null);
    },

    /**
     * @description This function is called by the keyboard event handler. There
     *              are some special keys that are handled. The default is
     *              of course a search update.
     * @param actor
     * @param event
     * @returns {Boolean} Was the event handled and does not need to bubble?
     * @private
     * @function
     * @memberOf SearchField#
     */
    _onKeyPress: function(actor, event) {
        let returnVal = Clutter.EVENT_PROPAGATE;

        let symbolID = event.get_key_symbol();
        switch (symbolID) {

            case Clutter.Down:
                this.mediator.moveKeyFocusDown(actor, event);
                returnVal = Clutter.EVENT_STOP;
                break;

            case Clutter.KEY_Tab:
                this.mediator.moveKeyFocusDown(actor, event);
                returnVal = Clutter.EVENT_STOP;
                break;

            case Clutter.KEY_Return:
                this.mediator.moveKeyFocusDown(actor, event);
                returnVal = Clutter.EVENT_STOP;
                break;

            default:
                // I want to focus the other elements again if the search is empty.
                if (this._searchEntry.text == '' && (symbolID == Clutter.BackSpace ||
                                                    symbolID == Clutter.Delete ||
                                                    symbolID == Clutter.KEY_space)) {
                    this._stopSearch();
                    this.mediator.resetKeyFocus();
                    returnVal = Clutter.EVENT_STOP;
                } else {
                    this._onTextChanged();
                    returnVal = Clutter.EVENT_STOP;
                }
                break;
        }

        return returnVal;
    },

    /**
     * @description This function is called when the text is changed and
     *              the text affects the search. The function delegates
     *              the flow to start, continue, and stop functions.
     * @private
     * @function
     * @memberOf SearchField#
     */
    _onTextChanged: function () {
        // The terms are the words of the search phrase.
        let terms = this._getTermsForSearchString(this._searchEntryText.get_text());

        // The search is active if the field is not empty.
        let searchPreviouslyActive = this._searchActive;
        this._searchActive = (terms.length > 0);

        let startSearch = this._searchActive && !searchPreviouslyActive;
        if (startSearch)
            this._startSearch();

        if (this._searchActive) {
            this._searchEntry.set_secondary_icon(this._clearIcon);

            if (this._iconClickedId == 0)
                this._iconClickedId = this._searchEntry.connect('secondary-icon-clicked', Lang.bind(this, function() {
                    // The click resets the field. After the reset the field is empty and repeated call of this function
                    // leads to the stop. So no special function or else.
                    this._searchEntry.text = '';
                    this._onTextChanged();
                }));

            // Originally the first char starts the search countdown. This now
            // starts the search only after the user stopped typing for some time.
            if (this._searchTimeoutId > 0) {
                Mainloop.source_remove(this._searchTimeoutId);
            }
            this._searchTimeoutId = Mainloop.timeout_add(200, Lang.bind(this, this._updateSearch));

        } else {
            if (this._iconClickedId > 0) {
                this._searchEntry.disconnect(this._iconClickedId);
                this._iconClickedId = 0;
            }

            if (this._searchTimeoutId > 0) {
                Mainloop.source_remove(this._searchTimeoutId);
                this._searchTimeoutId = 0;
            }

            this._searchEntry.set_secondary_icon(null);
            this._stopSearch();
        }
    },

    /**
     * @description This function starts a new search run. It uses the text
     *              it gets from the entry as terms.
     * @private
     * @function
     * @memberOf SearchField#
     */
    _startSearch: function () {
        this._searchTimeoutId = 0;

        /*
         * Originally the search entry emitted some signals and stuff, but i
         * dont want to use eventsystems in the ui code.
         */
        let terms = this._getTermsForSearchString(this._searchEntry.get_text());
        this.mediator.startSearch(terms);
    },

    /**
     * @description This function updates the current search run.
     * @private
     * @function
     * @memberOf SearchField#
     */
    _updateSearch: function () {
        this._searchTimeoutId = 0;

        let terms = this._getTermsForSearchString(this._searchEntry.get_text());
        this.mediator.continueSearch(terms);
    },

    /**
     * @description This function stops the current search run.
     * @private
     * @function
     * @memberOf SearchField#
     */
    _stopSearch: function() {
        this._searchEntry.text = '';
        this.mediator.stopSearch();
    },

    /**
     * @description This function returns the terms of a string.
     * @param {String} searchstring
     * @returns {List} A list of terms.
     * @private
     * @function
     * @memberOf SearchField#
     */
    _getTermsForSearchString: function(searchString) {
        // Extracts the words/terms.
        searchString = searchString.replace(/^\s+/g, '').replace(/\s+$/g, '');
        if (searchString == '') {
            return [];
        }

        return searchString.split(/\s+/);
    },
});
