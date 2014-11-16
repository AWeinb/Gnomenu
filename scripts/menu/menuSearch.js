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

const Me = imports.misc.extensionUtils.getCurrentExtension();
const SearchSystem = Me.imports.scripts.data.searchSystem.SearchSystem;
const AppSearchProvider = Me.imports.scripts.data.searchprovider.appSearchProvider.AppSearchProvider;
const GnoSearchProvider = Me.imports.scripts.data.searchprovider.gnoSearchProvider.GnoSearchProvider;



const MenuSearch = new Lang.Class({
    
    Name: 'GnoMenu.MenuSearch',
    
    
    _init: function() {
        this._searchSystem = new SearchSystem();
        
        this._appProvider = new AppSearchProvider();
        this._gnoProvider = new GnoSearchProvider();
        
        this._searchSystem.registerProvider(this._appProvider);
        this._searchSystem.registerProvider(this._gnoProvider);
    },
    
    destroy: function() {
        this._searchSystem.unregisterProvider(this._appProvider);
        this._searchSystem.unregisterProvider(this._gnoProvider);
    },
    
    getSearchSystem: function() {
        return this._searchSystem;
    },
});