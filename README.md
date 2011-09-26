Style Select
============

Style Select is a nifty widget that allows you to style a SELECT box with CSS.
This widget respects one level of OPTGROUP, aswell as OPTION[disabled] attribute
It tries to mimic a default SELECT in its behaviour as much as possible.

![Screenshot](http://23c.se/StyleSelect/screenshot.png)

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
    cssActions: (object) the names of the CSS classes used by the widget. Please change if you have conflicting CSS classes in your project. | default: {c: "clicked", d: "disabled", e: "expanded", h: "hover", m: "multiple", o: "optgroup", s: "selected"}
    inheritCSSClass: (boolean) should it keep any existing css class instead of replacing with cssClass | default: true
    cloneEvents: (boolean) should it keep any existing events previously attached | default: true
    skipfirst: (boolean) should it skip the first OPTION in the list? | default: false
    size: (integer) how many options should be visible? set value to 0 or null if you want size-attribute to dictate this option | default: 4
        NB! Only works with [multiple] attribute set


Methods
-----------------

The following methods are availible publicly:

    getSelected: (array)    retrieve the value and text of the selected StyleSelect
    rebuild: (void)         rebuild the StyleSelect to its default state


Notes
-----------------

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
