Style Select
===========

Style Select is a nifty widget that allows you to style a SELECT box with CSS.
This widget respects one level of OPTGROUP, aswell as OPTION[disabled] attribute
It tries to mimic a default SELECT in its behaviour as much as possible.


How to use
----------

Javascript snippet to initialize the class:

	window.addEvent("domready", function() {
		var SS = new StyleSelect({
			element: document.getElement("SELECT"),
			skipfirst: true
		});
	});


HTML snippet:

	<form>
	<fieldset>
		<select>
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
    inheritCSSClass: (boolean) should it keep any existing css class instead of replacing with cssClass | default: true
    cloneEvents: (boolean) should it keep any existing events previously attached | default: true
    skipfirst: (boolean) should it skip the first OPTION in the list? | default: false


Methods
-----------------

The following methods are availible publicly:

    reset: reset the StyleSelect to its default state
    getSelected: retrieve the value and text of the selected StyleSelect


Notes
-----------------

Version 1.1

    * Won't throw an error if the SELECT lack OPTION elements
    * Fixed bug with OPTGROUP
    * Can use up/down arrow keys to highlight an option
    * Can use Enter key to select an option
    * Can use Escape key to close the StyleSelect
    * Can use any key character to pick the first occurence in the list

Version 1.0

	* First release
