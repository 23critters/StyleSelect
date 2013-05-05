Style Select
============

Style Select is a nifty widget that allows you to style a SELECT box with CSS.
This widget respects one level of OPTGROUP, aswell as OPTION[disabled] attribute
It tries to mimic a default SELECT in its behaviour as much as possible.

![Screenshot](https://github.com/23critters/StyleSelect/raw/master/screenshot.png)

How to use
----------

Javascript snippet to initialize the class:

	window.addEvent("domready", function() {
		var SS = new StyleSelect({
			element: document.getElement("SELECT"),
			skipfirst: true,
			size: 0
		});
	});


HTML snippet:

	<form>
	<fieldset>
		<select multiple size="3">
            <option value="">Skip this</option>
            <option value="Hello">World!</option>
            <optgroup label="test">
                <option value="value">Text</option>
                <option value="Ooops" disabled>Disabled</option>
            </optgroup>
            <option>No value</option>
		</select>
	</fieldset>
	</form>

Options
-----------------

    element: (string||object) reference to select dom element container. if passing a string, supply it's id
    cssClass: (string) css class of the container | default: "styleme"
    cssActions: (object) the names of the CSS classes used by the widget. Please change if you have conflicting CSS classes in your project. | default: {b: "bottom", c: "clicked", d: "disabled", e: "expanded", h: "hover", m: "multiple", o: "optgroup", r: "root", s: "selected"}
    inheritCSSClass: (boolean) should it keep any existing css class instead of replacing with cssClass | default: true
    cloneEvents: (boolean) should it keep any existing events previously attached | default: true
    skipfirst: (boolean) should it skip the first OPTION in the list? | default: false
    size: (integer) how many options should be visible? set value to 0 or null if you want size-attribute to dictate this option | default: 4
        NB! Only works with [multiple] attribute set
    checkboxes: (boolean) show checkboxes with each option | default: false
        NB! Only works with [multiple] attribute set
	usetitles: (boolean) if you want to add the option.text to the list' title-attribute | default: false


Methods
-----------------

The following methods are availible publicly:

    getSelected: (array)    retrieve the value and text of the selected StyleSelect
	getSelectElem: (object)		returns the select box we're using for StyleSelect
    rebuild: (void)         rebuild the StyleSelect to its default state


Known bugs
-----------------

	* None! \o/


Notes
-----------------
Version 1.5.2

	* Fixed bug: if skipfirst was true, the wrong option would be sent to server

Version 1.5.1

	* Fixed bug: when clicking in the list, sometimes the list wouldn't hide

Version 1.5

	* Fixed bug: when using rebuild(), old events weren't removed properly.
	* Fixed bug: when opening the list with the enter key, one couldn't close it when selecting an item with the enter key
	* Fixed bug: lists that grew upwards got the wrong max-height the second time one clicked them
	* Fixed bug: When you click on an option you the document event wasn't removed.
	* New public method: getSelectElem() returns the select box we're using for StyleSelect
	* Added option: {r: "root"}, now you should never encounter css-conflicts

Version 1.4

	* Added option to add title-attribute to the list (taken from option.text)
	* Fixed bug: if list is too tall, set max-height and allow the contents to scroll
	* Fixed bug: if any parent has fixed property and is too close to the bottom of the screen, then flow the list upwards
	* Removed bundled minified js-file
	
Version 1.3

    * Added option to show checkboxes when showing multiple options, they're purely esthetic

Version 1.2.1

    * Bugfix for IE7 which returns erroneous values for Element.getComputedSize()

Version 1.2

    * Now have support for SELECT[multiple] attribute!
    * Major rework of code. Have separated the Multiple and Simple instances into their own classes.
    * getSelected method updated: An array is returned with every selected option, text & value. Will break backward compatability from 1.1 and previous
    * Replaced some strings with reference to object instead, if developer wants to change CSS classes that are being used.
    * Switched around some public methods
    * Fixed bug with cloneEvents option

Version 1.1

    * Won't throw an error if the SELECT lack OPTION elements
    * Fixed bug with OPTGROUP
    * Can use up/down arrow keys to highlight an option
    * Can use Enter key to select an option
    * Can use Escape key to close the StyleSelect
    * Can use any key character to pick the first occurence in the list

Version 1.0

	* First release
