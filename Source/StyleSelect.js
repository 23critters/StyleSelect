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
                    var oUL = this.container.getElement("ul"),
                        aUL = $$("select[style] + div." + this.options.cssClass + " > ul.root");
                    if (oUL.hasClass("expanded")) {
                        aUL.removeClass("expanded");
                        document.removeEvent("keydown", this.fnNavigate);
                    } else {
                        aUL.removeClass("expanded");
                        oUL.addClass("expanded");
                        oUL.getElements("li").removeClass("hover");
                        var oLI = oUL.getElement("li.clicked")||oUL.getElement("li:first-child");
                        oLI.addClass("hover");
                        document.addEvent("keydown", this.fnNavigate);
                    }
                }.bind(this)
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

        this.fnNavigate = this._navigate.bind(this);

        this._rebuild();

        if (this.options.inheritCSSClass) {
            this.container.addClass(this.element.get("class"));
        }

        document.addEvent("click", function(e) {
            this.container.getElement("ul").removeClass("expanded");
            document.removeEvent("keydown", this.fnNavigate);
        }.bind(this));
    },
    _fnAlterClass: function(oAdd, mRemove, sClass) {
        mRemove.removeClass(sClass);
        oAdd.addClass(sClass);
    },
    _navigate: function(e) {
        var oLI = this.container.getElement("li.hover"),
            aLI = this.container.getElements("li:not(.optgroup)"),
            oNext = null;

        switch(e.key) {
            case "down":
                e.preventDefault();
                if ((oNext = aLI[aLI.indexOf(oLI)+1])) {
                    this._fnAlterClass(oNext, oLI, "hover");
                }
            break;
            case "up":
                e.preventDefault();
                if ((oNext = aLI[aLI.indexOf(oLI)-1])) {
                    this._fnAlterClass(oNext, oLI, "hover");
                }
            break;
            case "enter":
                if (oLI.get("html") && !oLI.getProperty("disabled")) {
                    this._fnAlterClass(oLI, aLI, "clicked");
                    this._setSelected(aLI.indexOf(oLI));
                }
                this.list.removeClass("expanded");
            break;
            case "esc":
                this.container.getElement("ul").removeClass("expanded");
                document.removeEvent("keydown", this.fnNavigate);
            break;
            default:
                if (e.key.length == 1) {
                    e.preventDefault();
                    for (var i=0 ; i < aLI.length ; i++) {
                        if (e.code == aLI[i].get("html").charCodeAt(0)) {
                            this._fnAlterClass(aLI[i], aLI, "hover");
                            break;
                        }
                    }
                }
            break;
        }
    },
    _setSelected: function(idx) {
        var oLI = this.list.getElement("li.clicked");
        this.element.selectedIndex = idx;
        this.showSelected.set("html", oLI.get("html"));
        this.showSelected.set("data-value", oLI.get("data-value"));
    },
    reset: function() {
        this.list.set("html", "");
        if (this.list.getNext("a")) {
            this.list.getNext("a").dispose();
        }

        var oOption = this.element.getElements("option")[this.element.selectedIndex]||new Element("option", {"text":"","data-value":""});
        this.showSelected = new Element("a", {
            "href": "",
            "events": {
                "click": function(e) {
                    e.preventDefault();
                },
                "mousedown": function(e) {
                    e.preventDefault();
                }
            },
            "html": oOption.get("text"),
            "data-value": oOption.get("data-value")
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
    _rebuild: function() {
        this.reset();

        var iCount = 0;
        this.element.getElements("option,optgroup").each(function(oOpt) {
            var bOption = oOpt.get("tag") == "option";
            if (bOption) {
                if (!this.options.skipfirst || iCount > 0) {
                    if (oOpt.getParent() !== this.parent) {
                        this.parent = oOpt.getParent();
                        this.list = this.list.getParent("ul");
                    }
                    var oLI = new Element("li", {
                        "class": (this.element.selectedIndex == iCount)?"selected":"",
                        "html": oOpt.get("text"),
                        "data-value": oOpt.get("value"),
                        "events": {
                            "click": function(e) {
                                if (!e.target.hasClass("disabled")) {
                                    this._fnAlterClass(e.target, this.list.getElements("li"), "clicked");
                                    this._setSelected(this.list.getElements("li:not(.optgroup)").indexOf(e.target));
                                    oLI.getParent("ul.root").fireEvent("click");
                                }
                            }.bind(this),
                            "mouseover": function(e) {
                                if (!e.target.hasClass("disabled")) {
                                    this._fnAlterClass(e.target, this.container.getElements("li"), "hover");
                                }
                            }.bind(this)
                        }
                    }).inject(this.list);
                    if (oOpt.hasAttribute("disabled")) {
                        oLI.addClass("disabled")
                    }
                }
                iCount++;
            } else {
                this.parent = oOpt;
                var oLIGroup = new Element("li", {
                        "class": oOpt.get("tag"),
                        "data-value": ""
                    }).inject(this.list),
                    oUL = new Element("ul", {
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
            }.bind(this));
        }
    }
});