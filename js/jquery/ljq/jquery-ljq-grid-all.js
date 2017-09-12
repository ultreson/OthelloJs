 $(function() {
    // **********************************************************************************************************************************
    // Addon to the Math class
    // **********************************************************************************************************************************
    // Return a random number between pMin and pMax (both min and max included)
    if(Math.randomBetween === undefined) {
        Math.randomBetween = function(pMin, pMax) {
            var that = this,
                result;
            
            return (Math.floor(Math.random() * (pMax + 1)) + pMin);
        };
    }
    // **********************************************************************************************************************************

    // **********************************************************************************************************************************
    // Addon to the Array class
    // **********************************************************************************************************************************
    // Return a random index for the Array (between 0 and the Array length - 1)
    if(Array.prototype.randomIndex === undefined) {
        Array.prototype.randomIndex = function() {
            var that = this;
            
            return Math.randomBetween(0, that.length-1);
        };
    }
    // **********************************************************************************************************************************

    // **********************************************************************************************************************************
    // Addon to $
    // **********************************************************************************************************************************
    // Simplify the action of throwing a new Error
    // and Standardize the message of the error
    if($.throwNewError === undefined) {
        $.throwNewError = function(name, desc, values) {
            var msg = name + ': ' + desc,
                val = $.extend({}, values);
            
            if(!$.isEmptyObject(val)) {
                msg += ' [';
                $.each(val, function(key, value) {
                    msg += key + ': ' + value;
                });
                msg += ']';
            }
            throw new Error(msg);
        };
    }
    // **********************************************************************************************************************************

    // **********************************************************************************************************************************
    // Grid Widget
    // **********************************************************************************************************************************
    $.widget( "ljq.grid", {
        version: "2.0.0b",
        // List of classes osed by the widget
        _classes: {
            main: 'ljq-grid'           
        },   
        options: {
            // Grid Settings Options
            cellsExist: true,
            preventContextMenu: true,
            
            rowCount: 0,
            columnCount: 0,
			cellClassFromValuePrefix: '',   
			cellValues: [],
            displayType: 'none',
            imagePath: '',

            autoSizeCells: false,
            makeCellsSquare: false,
            allowMultiSelect: false,
            
            autoSelectOnClick: false,
            autoOnOnClick: false,
            autoDisableOnClick: false,

            autoSelectOnRightClick: false,
            autoOnOnRightClick: false,
            autoDisableOnRightClick: false,

            initCellsOn: false,
            initCellsSelected: false,
            initCellsDisabled: false,
            
            preventDisableIfOn: false,
            preventDisableIfNotOn: false,
            preventDisableIfNotSelected: false,
            preventDisableIfSelected: false,
            preventOnIfDisabled: false,
            preventOnIfNotSelected: false,
            preventOnIfSelected: false,
            preventSelectIfDisabled: false,
            preventSelectIfOn: false,
            preventSelectIfNotOn: false,
            
            // callbacks for widget events
            change: null,
            click: null
        },
        // the constructor
        _create: function(options) {
                // Keep a reference to this
            var _self = this,
                options = {};
            
            // If the DOM element already has the ljq-grid class
            if(_self.element.hasClass(_self._classes.main)) {
                // Loop the data attributes of the DOM element
                $.each(_self.element.data(), function(key, value) {
                    // If the data attribute matches the name of a grid Widget option
                    if(_self.options.hasOwnProperty(key)) {
                        // Add the option to the options variable.
                        options[key] = value;
                    }
                });
            }
            else {
                _self.element
                    // Add the grid Widget's class
                    .toggleClass( _self._classes.main, true )
                    // empty the element
                    .empty();
            }
            
            _self.element
                // prevent double click to select text
                .disableSelection();
                
            if(options.preventContextMenu == true || (options.preventContextMenu == undefined && this.options.preventContextMenu)) {
                _self.element.on('contextmenu', function(e){e.preventDefault();});    
            }
            
            _self._on(
                _self.element,
                    {
                        "click .ljq-cell":  function(e){
                            if(_self.options.autoSelectOnClick) {
                                // Call the method to handle the grid multi-select option
                                _self._handleNotMultiSelect($(e.target));
                                // Call the cell's method to toggle it's selected state
                                $(e.target).cell('toggleSelected');
                            }
                            if(_self.options.autoOnOnClick) {
                                // Call the cell's method to toggle it's On state
                                $(e.target).cell('toggleOn');
                            }
                            if(_self.options.autoDisableOnClick) {
                                // Call the cell's method to toggle it's disabled state
                                $(e.target).cell('toggleDisabled');
                            }
                            _self._trigger(  e.type, e, {cellElement: $(e.target), cellAddress: $(e.target).cell("option", "address")});
                        },
                        "contextmenu .ljq-cell":  function(e){
                            if(_self.options.autoSelectOnRightClick) {
                                // Call the method to handle the grid multi-select option
                                _self._handleNotMultiSelect($(e.target));
                                // Call the cell's method to toggle it's selected state
                                $(e.target).cell('toggleSelected');
                            }
                            if(_self.options.autoOnOnRightClick) {
                                // Call the cell's method to toggle it's On state
                                $(e.target).cell('toggleOn');
                            }
                            if(_self.options.autoDisableOnRightClick) {
                                // Call the cell's method to toggle it's disabled state
                                $(e.target).cell('toggleDisabled');
                            }
                            _self._trigger(  "rightclick", e, {cellElement: $(e.target), cellAddress: $(e.target).cell("option", "address")});
                        },
                        "mouseover .ljq-cell":  function(e){
                            _self._trigger(  e.type, e, {cellElement: $(e.target), cellAddress: $(e.target).cell("option", "address")});
                        },
                        "mouseout .ljq-cell":  function(e){
                            _self._trigger(  e.type, e, {cellElement: $(e.target), cellAddress: $(e.target).cell("option", "address")});
                        }
                    }
            );
 
            // If there were options
            if($.map(options, function(key, value) {return [value];}).length) {
                // Update options (this will automatically trigger the refresh)
                // Set all options gathered in the options variable
                _self.option(options);
            }
            else {
                // call the refresh function
                _self._refresh();
            }
        },
        // called when changing options
        _refresh: function() {
                // Keep a reference to this
            var _self = this;
            
            if(_self.options.cellsExist) {
                $("div.ljq-cell", this.element).each(function(i){
                    var c = i % _self.options.columnCount,
                        r = Math.floor(i / _self.options.columnCount);
                    _self._initCellWidget($(this), r, c, i);
                });
            } else {
                this.element.empty();
                
                // Loop through the required rows
                for (var row = 0; row < _self.options.rowCount ; row++ )
                {
                    // For each row, loop through the required columns
                    for (var col = 0; col < _self.options.columnCount; col++) {
                            // calculate the index of the cell at row row and column col
                        var index = (row * _self.options.columnCount + col),

                        // Create a new div element
                        elem = $("<div>");

                        _self.element.append(elem);
                            
                        // Initialise the cell Widget on the new element
                        _self._initCellWidget($(elem), row, col, index);
                    }
                }
            }
            
            // trigger a callback/event
            _self._trigger( "change", $.Event(), {gridElement: _self.element} );
        },
        // Return the cell at the specified address
        _initCellWidget: function(elem, row, col, index) {
                // Keep a reference to this
            var _self = this;
            elem.cell({
                displayType: _self.options.displayType,
                imagePath: _self.options.imagePath, 
                address: {index: index, row: row, column: col},
                classFromValuePrefix: _self.options.cellClassFromValuePrefix,
                value: (_self.options.cellValues.length > index ? _self.options.cellValues[index] : 0),
                selected: _self.options.initCellsSelected,
                on: _self.options.initCellsOn,
                disabled: _self.options.initCellsDisabled,
                autoSize: _self.options.autoSizeCells ? (100.0 / _self.options.columnCount) + '%' : false,
                preventSelectIfNotOn: _self.options.preventSelectIfNotOn,
                preventSelectIfOn: _self.options.preventSelectIfOn,
                preventSelectIfDisabled: _self.options.preventSelectIfDisabled,
                preventOnIfSelected: _self.options.preventOnIfSelected,
                preventOnIfNotSelected: _self.options.preventOnIfNotSelected,
                preventOnIfDisabled: _self.options.preventOnIfDisabled,
                preventDisableIfNotOn: _self.options.preventDisableIfNotOn,
                preventDisableIfOn: _self.options.preventDisableIfOn,
                preventDisableIfSelected: _self.options.preventDisableIfSelected,
                preventDisableIfNotSelected: _self.options.preventDisableIfNotSelected,
                makeSquare: _self.options.makeCellsSquare
            });
        },
        // Return the length of the grid (the number of cells)
        length: function() {
            // return the number of row multiplied by the number of columns
            return this.options.rowCount * this.options.columnCount;
        },
        // Return a cell index ramdomly
        randomIndex: function() {
            // Return a number between 0 and the number of cell - 1.
            return Math.randomBetween(0, (this.length()-1));
        },
        // Return a column index ramdomly.
        randomColumnIndex: function() {
            // Return a number between 0 and columnCount - 1.
            return Math.randomBetween(0, (this.options.columnCount-1));
        },
        // Return a row index randomly
        randomRowIndex: function() {
            // Return a number between 0 and rowCount - 1.
            return Math.randomBetween(0, (this.options.rowCount-1));
        },
        // Return the all the grid cells
        cells: function() {
            // Return all the grid cells by selecting all the cells of the grid
            return this.element.find('.ljq-cell');
        },
        // Return the cell at the specified address
        cellAt: function(addr) {
            // Return the specified cell
            var s = "div.ljq-cell" + (typeof addr === "object" ?  "[data-row=" + addr.row + "][data-col=" + addr.column + "]" : "[data-index=" + addr + "]" );
            
            return $(s, this.element);
        },
        // Return all the cells of a row
        cellsByRow: function(row) {
            // If the row index provided is out of range
            if(row < 0 || row >= this.options.rowCount) {
                $.throwNewError('Invalid Row Index Value', 'The provided row index is not a valid row index. Must be between 0 and ' + (this.options.rowCount-1) + '.', {row: row});
            }
            var s = "div.ljq-cell.r" + row;
            
            return $(s, this.element);
        },
        // Return all the cells of a column
        cellsByColumn: function(col) {
            if(col < 0 || col >= this.options.columnCount) {
                // An error was returned, throw the exception with the proper message from the Validator Class
                $.throwNewError('Invalid Column Index Value', 'The provided column index is not a valid column index. Must be between 0 and ' + (this.options.columnCount-1) + '.', {column: col});
            }
            var s = "div.ljq-cell.c" + col;
            
            return $(s, this.element);
        },
        // Return all the cells of a range
        cellsByRange: function(minRow, maxRow, minCol, maxCol) {
            var s = "";
            for(var r = minRow; r <= maxRow; r++) {
                for(var c = minCol; c <= maxCol; c++) {
                    s += (s == "" ? "" : ",") + "div.ljq-cell.r" + r + ".c" + c;
                }
            }
            
            return $(s, this.element);
        },
        cellsBySelected: function(value) {
            value = value !== false;
            return $("div.ljq-cell" + (value?"":":not(") + ".selected" + (value?"":")"), this.element);
        },
        cellsByOn: function(value) {
            value = value !== false;
            return $("div.ljq-cell" + (value?"":":not(") + ".on" + (value?"":")"), this.element);
        },
        cellsByDisabled: function(value) {
            value = value !== false;
            return $("div.ljq-cell" + (value?"":":not(") + ".disabled" + (value?"":")"), this.element);
        },
        cellsByValue: function(value, equal) {
            equal = equal !== false;
            return $("div.ljq-cell[data-value" + (equal?"=":"!=") + "'" + value + "']", this.element);
        },
        // This function is called when a cell selction is being made
        _handleNotMultiSelect: function(elem) {
            // If the grid option allowMiltiSelect is set to false and 
            // the cell is currently not selected (it will then be selected)
            if(!this.options.allowMultiSelect && !elem.cell('option', 'selected')) {
                // Unselect all selected cells except for the current one
                
                // Get all selected cells
                this.cellsBySelected()
                    // Except the current one
                    .not(elem)
                    // call the option method setting their selected option to false
                    .cell('option', 'selected', false);
            }
        },
        // events bound via _on are removed automatically
        // revert other modifications here
        _destroy: function() {
            // Re-enable selection and set class and content back to initial value
            this.element
                .enableSelection();
        },
        // _setOptions is called with a hash of all options that are changing
        // always refresh when changing options
        _setOptions: function() {
            // _super and _superApply handle keeping the right this-context
            this._superApply( arguments );
            this._refresh();
        },
        // _setOption is called for each individual option that is changing
        _setOption: function( key, value ) {
                // Keep a reference to object this
            var _self = this;
            
            // prevent invalid options
            // if the option is not an option of the widget
            if(!_self.options.hasOwnProperty(key)) {
                var obj = {};
                obj[key] = value;
                $.throwNewError('Invalid Option', 'The provided option name is not an option of the cell widget.', obj);
                return;
            }
            _self._super( key, value );
        } 
    }); 
    // **********************************************************************************************************************************

    // **********************************************************************************************************************************
    // Cell Widget
    // **********************************************************************************************************************************
    $.widget( "ljq.cell", {
        version: "2.0.0b",
        // List of classes osed by the widget
        _classes: {
            main: 'ljq-cell'    
        },
        // **********************************************************************************************************************************
        // cell widget options:
        //      address:                        Is the object containing address info for the cell. The objects properties are:
        //                                          index:      The zero-based index of this cell.
        //                                                          Set at initialization.
        //                                          row:        The zero-based row index of this cell.
        //                                                          Set at initialization.
        //                                          column:     The zero-based column index of this cell.
        //                                                          Set at initialization.
        //
        //      autoSize:                       Is this cell'S width auto-sized.
        //                                          true:   the cells will be sized using a percentage of the grid width (100% / columnCount).
        //                                          false:  fixed width and height must be assigned 
        //                                                      (either with a class from cssClass option or ljq-cell class)
        //
        //      backgroundColor:                The color of the cell'S background. Empty String reset the value to default CSS value
        //
        //      classFromValuePrefix:           When set, the cell is given a class made of this prefix concatenated to the value option
        //
        //      color:                          The current background color of this cell. 
        //
        //      disabled:                       Is the cell disabled.
        //                                          If disabled, it prevents all event from firing.
        //                                          To modify this option use the toggleDisabled.
        //
        //      displayType:                    The display type for cell value ('none' or 'text').
        //
        //      image:                          Is the selection of the cell auto-fired on a click. 
        //
        //      imagePath:                      When set, it is used in the composition of the background-image source.
        //                                          This allow to set the image without always specifying the path.
        //
        //      makeSquare:                     When set, the height of the cell will be set to match the width, resulting in square cells.
        //
        //      on:                             Is the cell turned on.
        //                                          To modify this option use the toggleOn method.
        //
        //      preventDisableIfOn:             When set, prevent from disabling/enabling the cell if the on option is set to true (on)
        //
        //      preventDisableIfNotOn:          When set, prevent from disabling/enabling the cell if the on option is set to false (not on)
        //
        //      preventDisableIfNotSelected:    When set, prevent from disabling/enabling the cell if the selected option is set to false (not selected)
        //
        //      preventDisableIfSelected:       When set, prevent from disabling/enabling the cell if the selected option is set to true (selected)
        //
        //      preventOnIfDisabled:            When set, prevent from turning on/off the cell if the disabled option is set to true (disabled)
        //
        //      preventOnIfNotSelected:         When set, prevent from turning on/off the cell if the selected option is set to false (not selected)
        //
        //      preventOnIfSelected:            When set, prevent from turning on/off the cell if the selected option is set to true (selected)
        //
        //      preventSelectIfDisabled:        When set, prevent from selecting/unselecting the cell if the disabled option is set to true (disabled)
        //
        //      preventSelectIfNotOn:           When set, prevent from selecting/unselecting the cell if the on option is set to false (not on)
        //
        //      preventSelectIfOn:              When set, prevent from selecting/unselecting the cell if the on option is set to true (on)
        //
        //      selected:                       Is the cell selected
        //                                          To modify this option use the toggleSelected method.
        //
        //      value:                          The current value of this cell.
        // **********************************************************************************************************************************
        options: {
            address: {
                index: 0,
                row: 0,
                column: 0
            },
            autoSize: false,
            backgroundColor: '',
			classFromValuePrefix: '',
            color: '',
            disabled: false,
            displayType: 'none',
            image: '',
            imagePath: '',
            makeSquare: false,
            on: false,
            preventDisableIfOn: false,
            preventDisableIfNotOn: false,
            preventDisableIfNotSelected: false,
            preventDisableIfSelected: false,
            preventOnIfDisabled: false,
            preventOnIfNotSelected: false,
            preventOnIfSelected: false,
            preventSelectIfDisabled: false,
            preventSelectIfOn: false,
            preventSelectIfNotOn: false,
            selected: false,
            value: '',
     
            // callbacks for widget events
            change: null
        },
        // the constructor
        _create: function() {
                // Keep a reference to this
            var _self = this,
                options = {};
            
            _self._isInitializing = true;
            
            _self.element
                // add the cell Widget's class
                .toggleClass( _self._classes.main, true )
                // add the cell row and column classes
                .toggleClass( 'r' + _self.options.address.row + ' c' + _self.options.address.column, true )
                // prevent double click to select text
                .disableSelection()
                // empty the element
                .empty();
                    
			if(_self.options['classFromValuePrefix'] && _self.options['value']) {
				_self.element.addClass(_self.options['classFromValuePrefix'] + _self.options['value']);
			}
            
            $.each(_self.options, function(key, value) {
                if(value != null && /address|value|color|backgroundColor|image|makeSquare|disabled|selected|on|displayType|autoSize/.test(key)) {
                    options[key] = value;
                }
            });
            
            _self._setOptions(options);
            
            _self._isInitializing = false;
            
            // Call the _refresh function
            _self._refresh();
        }, 
        // called when created, and later when changing options
        _refresh: function() {
                // Keep a reference to this
            var _self = this;

            // trigger a callback/event
            _self._trigger( "change", $.Event(), {cellElement: _self.element, cellAddress: _self.options.address} );
        },
        // Clear the content of the cell but leave the selected and disabled state intact
        clear: function() {
                // Keep a reference to this
            var _self = this;
                
            _self._setOption('value', '');
            _self._setOption('color', '');
            _self._setOption('image', '');
            _self._setOption('backgroundColor', '');
            _self._setOption('on', false);
            _self._setOption('selected', false);
            
            return _self;
        },
        // Toggle the disabled state of the cell or set it to the specified state (parameter disabled)
        toggleDisabled: function(disabled) {
                // Keep a reference to this
            var _self = this;
            // return the result of the _setOption method, setting the disabled state either
            // to the value of the disabled parameter of the negation of the actual disabled value
            if((_self.options.on || !_self.options.preventDisableIfNotOn) && (!_self.options.selected || !_self.options.preventDisableIfSelected) &&
               (!_self.options.on || !_self.options.preventDisableIfOn) && (_self.options.selected || !_self.options.preventDisableIfNotSelected)) {
                return this._setOption('disabled', disabled === undefined ? !this.options.disabled : disabled);
            } else {
                return false;
            }
        },
        // Toggle the selected state of the cell or set it to the specified state (parameter selected)
        toggleSelected: function(selected) {
            var _self = this;
            // return the result of the _setOption method, setting the selected state either
            // to the value of the selected parameter of the negation of the actual selected value
            if((_self.options.on || !_self.options.preventSelectIfNotOn) && (!_self.options.on || !_self.options.preventSelectIfOn)
                && (!_self.options.disabled || !_self.options.preventSelectIfDisabled)) {
                return this._setOption('selected', selected === undefined ? !this.options.selected : selected);
            } else {
                return false;
            }
        },
        // Toggle the on state of the cell or set it to the specified state (parameter on)
        toggleOn: function(on) {
            // return the result of the _setOption method, setting the on state either
            // to the value of the on parameter of the negation of the actual on value
            var _self = this;
            // return the result of the _setOption method, setting the selected state either
            // to the value of the selected parameter of the negation of the actual selected value
            if((!_self.options.disabled || !_self.options.preventOnIfDisabled) && (!_self.options.selected || !_self.options.preventOnIfSelected)
                && (_self.options.selected || !_self.options.preventOnIfNotSelected)) {
                return this._setOption('on', on === undefined ? !this.options.on : on);
            } else {
                return false;
            }
        },
        // Handle all the option value change for options having an impact on the
        // cell elements (disabled, selected, on, value, color, backgroundColor, image)
        // prop is the option to be modified and val is the new value to set for the option
        _propsMethod: function(prop, val) {
                // Keep a reference to this
            var _self = this,
                oldOptions = {},
                newOptions = {};
                
            // If a value has been provided
            if(val !== undefined) {
                // set the prop property of the newOptions object to either val or if the prop is image, create the proper value including the image path from the parentGrid if available
                newOptions[prop] = (prop === 'image' && val !== '' && _self.options.imagePath !== '' ? _self.options.imagePath + '/' + val : val);
                
                // We want to do this only if the value is changing. There is no need
                // to perform any of this if the new value is the same as the actual one
                if(_self.options[prop] !== newOptions[prop] || _self._isInitializing) {
                    // set the actual value for the prop in the oldOptions object
                    oldOptions[prop] = _self.options[prop];
                    
                    // Depending on the property
                    switch(prop) {
                        case 'selected':
                            $(document.activeElement).blur();
                        case 'on':
                        case 'disabled':
                            _self.element.toggleClass(prop, newOptions[prop]);
                            break;
                        case 'value':
                            // set the value option of the _adapterElement displayAdapter.
                            if(_self.options.classFromValuePrefix) {
                                var pattern = new RegExp(_self.options.classFromValuePrefix + '\\S*'),
                                    tabClasses = _self.element.attr("class").match(pattern),
                                    curClass = (tabClasses && tabClasses.length ? tabClasses[0] : ''),
                                    newClass = _self.options.classFromValuePrefix + newOptions[prop];
                                    
                                _self.element.addClass(newClass).removeClass(curClass);
                            }                            
                            _self.element.text(_self.options.displayType != 'none' ? newOptions[prop] : '');
                            _self.element.attr({"data-value": newOptions[prop]});
                            break;
                        case 'color':
                            _self.element.css('color', newOptions[prop]);
                            break;
                        case 'image':
                            _self.element.css('background-image', newOptions[prop] === '' ? '' : 'url(' + newOptions[prop] + ')');
                            break;
                        case 'backgroundColor':
                            _self.element.css('background-color', newOptions[prop]);
                            break;
                        case 'displayType':
                            _self.element.toggleClass("display-" + oldOptions[prop], false).toggleClass("display-" + newOptions[prop], true);
                            _self.element.text(newOptions[prop] != 'none' ? _self.options.value : '');
                            break;
                        case 'autoSize':
                            _self.element.toggleClass('autoSize', _self.options.autoSize);
                            _self.element.css({'width': _self.options.autoSize});
                            break;
                        case 'makeSquare':
                            _self.element.toggleClass('makeSquare', _self.options.makeSquare);
                            break;
                        case 'address':
                            _self.element.attr({"data-index": newOptions[prop].index, "data-row": newOptions[prop].row, "data-col": newOptions[prop].column});
                            break;
                    }
                }
                else {
                    return false;
                }
            }
        },
        // events bound via _on are removed automatically
        // revert other modifications here
        _destroy: function() {
            // Re-enable selection and set class and content back to initial value
            this.element
                .enableSelection();
        },
        // _setOptions is called with a hash of all options that are changing
        // always refresh when changing options
        _setOptions: function() {
            // _super and _superApply handle keeping the right this-context
            this._superApply( arguments );
            this._refresh();
        },
        // _setOption is called for each individual option that is changing
        _setOption: function( key, value ) {
            // prevent invalid options
            // if the option is not an option of the widget
            if(!this.options.hasOwnProperty(key)) {
                var obj = {};
                obj[key] = value;
                $.throwNewError('Invalid Option', 'The provided option name is not an option of the cell widget.', obj);
                return;
            }
            if(/value|color|backgroundColor|image/.test(key)) {
                // Call the method to handle the change of value
				if(this._propsMethod(key, value) === false){
					return;
				}
            }
            // If the key is one of the boolean values
            else if(/makeSquare|disabled|selected|on|preventDisableIfOn|preventDisableIfNotOn|preventDisableIfNotSelected|preventDisableIfSelected|preventOnIfDisabled|preventOnIfNotSelected|preventOnIfSelected|preventSelectIfDisabled|preventSelectIfOn|preventSelectIfNotOn/.test(key)) {
                // if the value is not true or false, throw an error
                if(value !== true && value !== false) {
                    var obj = {};
                    obj[key] = value;
                    $.throwNewError('Invalid Value', 'The provided value is not valid for this option. Accepted values are: true and false.', obj);
                    return false;
                }
                // If the key is either disabled, selected or on
                if(/makeSquare|disabled|selected|on/.test(key)) {
                    // Call the method to handle the change of value
                    if(this._propsMethod(key, value) === false){
						return;
					}
                }
            }
            // If the key is the dataType
            else if(key === 'displayType') {
				if(value != 'none' && value != 'text') {
                    var obj = {};
                    obj[key] = value;
                    $.throwNewError('Invalid Value', 'The provided value is not valid for this option.', obj);
                    return false;
                } else {
                    // Call the method to handle the change of value
                    if(this._propsMethod(key, value) === false){
                        return;
                    }
                }
            }
            // If the key is the dataType
            else if(key === 'autoSize') {
				if(this._propsMethod(key, value) === false){
                    return;
                }
            }
            // If the key is the cell's address
            else if(key === 'address') {
                // If the value is not an object or if there is at least another ell with same address of if one of the address info is either missong, not a number or less than 0, then trow an error
                if(typeof value !== "object" || value.row === undefined || isNaN(parseInt(value.row)) || value.row < 0 || value.column === undefined || isNaN(parseInt(value.column)) || value.column < 0 || value.index === undefined || isNaN(parseInt(value.index)) || value.index < 0) {
                    var obj = {};
                    obj[key] = value;
                    jQuery.throwNewError('Invalid Value', 'The provided value is not valid for this option.', obj);
                    return false;
                } else {
                    // Call the method to handle the change of value
                    if(this._propsMethod(key, value) === false){
                        return;
                    }
                }
            }
 
            this._super( key, value );
        } 
    }); 
    // **********************************************************************************************************************************
    $('.' + $.ljq.grid.prototype._classes.main)
        .filter(function() {
            return  !$(this).data().hasOwnProperty($.ljq.grid.prototype._classes.main);
        })
        .grid();
});