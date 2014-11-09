
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Component = Me.imports.scripts.menu.components.component.Component;

    

const SearchField = new Lang.Class({
    
    Name: 'Gnomenu.SearchField',
    Extends: Component,
   
   
    _init: function(model, mediator) {
        this.parent(model, mediator);
        
        this._searchActive = false;
        this._iconClickedId = 0;
        this._searchTimeoutId = 0;
        
        this.actor = new St.BoxLayout({ style_class: 'gnomenu-search-box' });
        this._searchEntry = new St.Entry({ name: 'searchEntry', style_class: 'search-entry-icon gnomenu-search-searchEntry', hint_text: _('Type to search…'), track_hover: true, can_focus: true });
        this.actor.add(this._searchEntry, { expand: true, x_align: St.Align.START, y_align: St.Align.START });
        this._searchEntryText = this._searchEntry.clutter_text;
        
        this._searchIcon = new St.Icon({ style_class: 'search-entry-icon gnomenu-search-searchEntry-icon', icon_name: 'edit-find-symbolic' });
        this._searchEntry.set_primary_icon(this._searchIcon);
        
        if (this._searchEntry.get_text_direction() == Clutter.TextDirection.RTL) {
            this._clearIcon = new St.Icon({ style_class: 'search-entry-icon gnomenu-search-searchEntry-icon', icon_name: 'edit-clear-rtl-symbolic' });
        } else {
            this._clearIcon = new St.Icon({ style_class: 'search-entry-icon gnomenu-search-searchEntry-icon', icon_name: 'edit-clear-symbolic' });
        }
        
        this._keyPressID = this._searchEntryText.connect('key_release_event', Lang.bind(this, this._onKeyPress));
        
        this.actor.connect('destroy', Lang.bind(this, this._onDestroy));
    },
    
    reset: function() {
        this._searchEntry.text = '';
        this._onTextChanged();
    },
    
    _onKeyPress: function(actor, event) {
        let symbolID = event.get_key_symbol();
        
        if (this._shouldTriggerSearch(symbolID)) {
            this._onTextChanged();
        }
    },
    
    _shouldTriggerSearch: function(symbolID) {
        if (( symbolID == Clutter.BackSpace ||
              symbolID == Clutter.Delete ||
              symbolID == Clutter.KEY_space) &&
              this._searchActive) {
            return true;
        }
    
        let unicode = Clutter.keysym_to_unicode(symbolID);
        if (unicode == 0) {
            return false;
        }
        
        if (this._getTermsForSearchString(String.fromCharCode(unicode)).length > 0) {
            return true;
        }
        
        return false;
    },
    
    _onTextChanged: function () {
        // The terms are the words of the search phrase.
        let terms = this._getTermsForSearchString(this._searchEntryText.get_text());

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
            if (this._searchTimeoutId > 0)
                Mainloop.source_remove(this._searchTimeoutId);
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
    
    _startSearch: function () {
        this._searchTimeoutId = 0;

        let terms = this._getTermsForSearchString(this._searchEntry.get_text());
        this.mediator.startSearch(terms);
    },
    
    _updateSearch: function () {
        this._searchTimeoutId = 0;

        let terms = this._getTermsForSearchString(this._searchEntry.get_text());
        this.mediator.continueSearch(terms);
    },
    
    _stopSearch: function() {
        this._searchEntry.text = '';
        this.mediator.stopSearch();
    },
    
    _getTermsForSearchString: function(searchString) {
        searchString = searchString.replace(/^\s+/g, '').replace(/\s+$/g, '');
        if (searchString == '')
            return [];
    
        let terms = searchString.split(/\s+/);
        return terms;
    },

    destroy: function() {
        this.actor.destroy();
    },
    
    _onDestroy: function() {
        if (this._searchEntryText) {
            this._searchEntryText.disconnect(this._keyPressID);
            this._keyPressID = 0;
        }
        
        if (this._iconClickedId > 0) {
            this._searchEntry.disconnect(this._iconClickedId);
            this._iconClickedId = 0;
        }

        if (this._searchTimeoutId > 0) {
            Mainloop.source_remove(this._searchTimeoutId);
            this._searchTimeoutId = 0;
        }
    }
});
