/*
---
description: Create styleable Select boxes built on the MooTools Framework

license: 
- MIT-style

authors:
- Thomas Kunambi, 23 Critters

requires:
- core/1.3: [Class, Element.Event, Element.Style, Element.Measure]

provides: StyleSelect
...
*/

var StyleSelect = new Class({
    Implements: Options,
    options: {
        cssClass: "styleme",
        inheritCSSClass: true,
        cloneEvents: true,
        skipfirst: false
    },
    /**
        @constructor
        @this {Select}
        @throws {String} If this.element can't be found, throw error
        @param {Object} Options for behaviours of the styled Select element
    */
    initialize: function(options) {
        this.setOptions(options);
        try {
            this.element = this.parent = document.id(this.options.element) || this.options.element;
            if (this.element === null) {
                throw("DOM object not found");
            }
        } catch(e) {
            if (console) {
                console.log(e);
            }
            return;
        }

        var iElementSize = this.element.getComputedSize();
        this.container = new Element("div", {
            "class": this.options.cssClass,
            "styles": {
                "height": iElementSize.height.toInt(),
                "width": iElementSize.width.toInt(),
                "padding": Object.values(this.element.getStyles("padding")).toString(),
                "margin": Object.values(this.element.getStyles("margin")).toString()
            },
            "events": {
                "click": function(e) {
                    e.stop();
                    var oUL = this.getElement("ul"),
                        aUL = $$("select[style] + div > ul.root");
                    if (oUL.hasClass("expanded")) {
                        aUL.removeClass("expanded");
                    } else {
                        aUL.removeClass("expanded");
                        oUL.addClass("expanded");
                    }
                }
            }
        }).inject(this.element, "after");

        this.element.setStyle("display", "none");

        this.list = new Element("ul", {
            "class": "root",
            "events": {
                "click": function(e) {
                    this.toggleClass("expanded");
                }
            }
        }).inject(this.container);

        this.rebuild();

        if (this.options.inheritCSSClass) {
            this.container.addClass(this.element.get("class"));
        }

        document.addEvent("click", function(e) {
            this.container.getElement("ul").removeClass("expanded")
        }.bind(this));
    },
    reset: function() {
        this.list.set("html", "");
        if (this.list.getNext("span")) {
            this.list.getNext("span").dispose();
        }

        this.showSelected = new Element("span", {
            "html": this.element.getElements("option")[this.element.selectedIndex].get("text"),
            "data-value": this.element.getElements("option")[this.element.selectedIndex].get("data-value")
        }).inject(this.container);
    },
    /**
    @return {Object} "text" is the text-value of the selected option, "value" is the value-part of the selected option
    */
    getSelected: function() {
        return {
            "text": this.showSelected.get("html"),
            "value": this.showSelected.get("data-value")
        }
    },
    rebuild: function() {
        this.reset();

        var iCount = 0;
        this.element.getElements("option,optgroup").each(function(oOpt, idx) {
            var bOption = oOpt.get("tag") == "option";
            if (bOption) {
                if (!this.options.skipfirst || iCount > 0) {
                    if (oOpt.getParent() !== this.parent) {
                        this.parent = oOpt.getParent();
                        this.list = this.list.getParent("ul");
                    }
					console.log(this.element.selectedIndex, iCount);
                    var oLI = new Element("li", {
                        "class": (this.element.selectedIndex == iCount)?"selected":"",
                        "html": oOpt.get("text"),
                        "data-value": oOpt.get("value"),
                        "events": {
                            "click": function() {
                                var oLIdx = arguments[0];
                                this.list.getElements("li").removeClass("clicked");
								this.list.getElements("li")[oLIdx + (this.options.skipfirst?-1:0)].addClass("clicked");
                                if (oOpt.get("value") && !oOpt.getProperty("disabled")) {
                                    this.element.selectedIndex = oLIdx;
                                    this.showSelected.set("html", oLI.get("html"));
                                    this.showSelected.set("data-value", oLI.get("data-value"));
                                }
                                oLI.getParent("ul.root").fireEvent("click");
                            }.bind(this, iCount)
                        }
                    }).inject(this.list);
                }
                iCount++;
            } else {
                this.parent = oOpt;
                var oLIGroup = new Element("li", {
                        "class": oOpt.get("tag"),
                        "data-value": ""
                    }).inject(this.list),
                    oUL = new Element("ul", {
                        "id": "ul-" + idx,
                        "class": "ul-" + oOpt.get("tag")
                    }).inject(oLIGroup);

                if (oOpt.get("label")) {
                    new Element("span", {
                        "html": oOpt.get("label"),
                        "events": {
                            "click": function(e) {
                                e.stop();
                            }
                        }
                    }).inject(oLIGroup, "top");
                }
                this.list = oUL;
            }
        }, this);

        if (this.options.cloneEvents) {
            this.container.cloneEvents(this.element);
            this.container.removeEvents("change");
            this.container.getElements("li").addEvent("click", function(e) {
                this.element.fireEvent("change", e);
            }.bind(this))
        }
    }
});