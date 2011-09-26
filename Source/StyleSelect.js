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
    Implements: [Options],
    options: {
        cloneEvents: true,
        cssClass: "styleme",
        cssActions: {
            c: "clicked",
            d: "disabled",
            e: "expanded",
            h: "hover",
            m: "multiple",
            o: "optgroup",
            s: "selected"
        },
        inheritCSSClass: true,
        skipfirst: false
    },
    /**
        @constructor
        @this {SelectStyle}
        @throws {String} If element can't be found, throw error
        @param {Object} Options for behaviours of the styled Select element
    */
    initialize: function(options) {
        try {
            options.element = document.id(options.element) || options.element;
            if (options.element === null) {
                throw("DOM object not found");
            }
        } catch(e) {
            if (console) {
                console.log(e);
            }
            throw e;
        }

        if (!options.element.getProperty("multiple")) {
            return new StyleSelect.Simple(options);
        } else {
            return new StyleSelect.Multiple(options);
        }
    },
    _setup: function() {
        var iElementSize = this.element.getComputedSize();
        this.oCss = this.options.cssActions;
        this.container = new Element("div", {
            "class": this.options.cssClass,
            "styles": {
                "height": iElementSize.height.toInt(),
                "width": iElementSize.width.toInt(),
                "padding": Object.values(this.element.getStyles("padding")).toString(),
                "margin": Object.values(this.element.getStyles("margin")).toString()
            }
        }).inject(this.element, "after");

        this.element.setStyle("display", "none");

        this.list = new Element("ul", {
            "class": "root"
        }).inject(this.container);

        this.fnNavigate = this._navigate.bind(this);

        this.rebuild();

        if (this.options.inheritCSSClass) {
            this.container.addClass(this.element.get("class"));
        }

        document.addEvent("click", function(e) {
            this.list.removeClass(this.oCss.e);
            this.list.fireEvent("blur", e);
            document.removeEvent("keydown", this.fnNavigate);
        }.bind(this));
    },
    _fnAlterClass: function(oAdd, mRemove, sClass) {
        mRemove.removeClass(sClass);
        oAdd.addClass(sClass);
    },
    _navigate: function(e) {
        var oLI = this.container.getElement("li." + this.oCss.h),
            aLI = this.container.getElements("li:not(." + this.oCss.o + ",." + this.oCss.d + ")"),
            oNext = null;

        switch(e.key) {
            case "down":
                e.preventDefault();
                if ((oNext = aLI[aLI.indexOf(oLI)+1]) && !oNext.hasClass(this.oCss.d)) {
                    this._fnAlterClass(oNext, oLI, this.oCss.h);
                }
            break;
            case "up":
                e.preventDefault();
                if ((oNext = aLI[aLI.indexOf(oLI)-1]) && !oNext.hasClass(this.oCss.d)) {
                    this._fnAlterClass(oNext, oLI, this.oCss.h);
                }
            break;
            case "space":
                e.preventDefault();
                if (oLI.get("html") && !oLI.hasClass(this.oCss.d)) {
                    if (e.control) {
                        oLI.addClass(this.oCss.c);
                    } else {
                        this._fnAlterClass(oLI, aLI, this.oCss.c);
                    }
                    this._setSelected();
                }
            break;
            case "enter":
                if (oLI.get("html") && !oLI.hasClass(this.oCss.d)) {
                    this._fnAlterClass(oLI, aLI, this.oCss.c);
                    this._setSelected();
                    this.list.removeClass(this.oCss.e);
                }
            break;
            case "esc":
                this.container.getElement("ul").removeClass(this.oCss.e);
                document.removeEvent("keydown", this.fnNavigate);
            break;
            default:
                if (e.key.length == 1) {
                    e.preventDefault();
                    for (var i=0 ; i < aLI.length ; i++) {
                        if (e.code == aLI[i].get("html").charCodeAt(0)) {
                            this._fnAlterClass(aLI[i], aLI, this.oCss.h);
                            break;
                        }
                    }
                }
            break;
        }
    },
    _setSelected: function() {
        var aLI = this.list.getElements("li:not(." + this.oCss.o + ")");
        this.element.getElements("option").set("selected", false);
        aLI.each(function(oLI, idx) {
            if (oLI.hasClass(this.oCss.c)) {
                this.element.getElements("option")[idx].set("selected", true);
                if (this.showSelected) {
                    this.showSelected.set("html", oLI.get("html"));
                    this.showSelected.set("data-value", oLI.get("data-value"));
                }
            }
        }, this)
    },
    /**
    * @return {Array} An array is returned with every selected option, text & value. Will break backward compability for v1.1
    */
    getSelected: function() {
        var aReturn = [],
            oSelected = Object.filter(this.element.getElements("option"), function(oOption) {
                if (typeof oOption == "object") {
                    return oOption.get("selected");
                }
            });

        Object.each(oSelected, function(oOpt) {
            aReturn.include({option: oOpt, "value":oOpt.get("value"),"text":oOpt.get("text")})
        });

        return aReturn;
    },
    rebuild: function() {
        this._reset();

        var iCount = 0;
        this.element.getElements("option,optgroup").each(function(oOpt) {
            var bOption = oOpt.get("tag") == "option";
            if (bOption) {
                if (!this.options.skipfirst || iCount > 0) {
                    if (oOpt.getParent() !== this.o_parent) {
                        this.o_parent = oOpt.getParent();
                        this.list = this.list.getParent("ul");
                    }
                    var oLI = new Element("li", {
                        "class": (oOpt.selected)?this.oCss.s:"",
                        "html": oOpt.get("text"),
                        "data-value": oOpt.get("value")
                    }).inject(this.list);
                    if (oOpt.hasAttribute(this.oCss.d)) {
                        oLI.addClass(this.oCss.d)
                    }
                }
                iCount++;
            } else {
                this.o_parent = oOpt;
                var oLIGroup = new Element("li", {
                        "class": oOpt.get("tag"),
                        "data-value": ""
                    }).inject(this.list);
                this.list = new Element("ul", {
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
            }
        }, this);

        this._addCustomEvents();

        if (this.options.cloneEvents) {
            this.container.cloneEvents(this.element);
            this.container.removeEvents("change");
            this.container.getElements("li:not(." + this.oCss.o + ",." + this.oCss.d + ")").addEvent("click", function(e) {
                this.element.fireEvent("change", e);
            }.bind(this));
        }
    }
});

StyleSelect.Simple = new Class({
    Extends: StyleSelect,
    initialize: function(options) {
        this.setOptions(options);
        this.element = this.o_parent = this.options.element;

        this._setup();

        this.container.addEvent("click", function(e) {
            e.stop();
            var oUL = this.list,
                aUL = $$("select[style] + div." + this.options.cssClass + " > ul.root");
            if (oUL.hasClass(this.oCss.e)) {
                aUL.removeClass(this.oCss.e);
                document.removeEvent("keydown", this.fnNavigate);
            } else {
                var oLI = oUL.getElement("li." + this.oCss.c)||oUL.getElement("li:first-child");
                this._fnAlterClass(oLI, oUL.getElements("li"), this.oCss.h);
                this._fnAlterClass(oUL, aUL, this.oCss.e);
                document.addEvent("keydown", this.fnNavigate);
            }
        }.bind(this));
    },
    _reset: function() {
        this.list.set("html", "");
        var oA = null;
        if ((oA = this.list.getNext("a"))) {
            oA.dispose();
        }

        var oOption = this.element.getSelected()[0]||new Element("option", {"text":"","data-value":""});
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
    _addCustomEvents: function() {
        this.list.addEvent("click", function(e) {
            e.stopPropagation();
            e.preventDefault();
            this.list.toggleClass(this.oCss.e);
        }.bind(this));

        var aLI = this.list.getElements("li");
        aLI.each(function(oLI) {
            oLI.addEvents({
                "mouseover": function(e) {
                    if (!e.target.hasClass(this.oCss.d)) {
                        this._fnAlterClass(e.target, aLI, this.oCss.h);
                    }
                }.bind(this),
                "click": function(e) {
                    if (!e.target.hasClass(this.oCss.d)) {
                        this._fnAlterClass(e.target, aLI, this.oCss.c);
                        this._setSelected();
                    }
                }.bind(this)
            });
        }, this)
    }
});

StyleSelect.Multiple = new Class({
    Extends: StyleSelect,
    options: {
        size: 4
    },
    initialize: function(options) {
        this.setOptions(options);
        this.element = this.o_parent = this.options.element;

        this._setup();

        this.container.addClass(this.oCss.m);
        var iSize = this.options.size||this.element.getProperty("size");
        this.container.setStyle("height", this.list.getElement("li:first-child").getSize().y * iSize)
        this.list.getElements("li").each(function(oLI) {
            if (oLI.hasClass(this.oCss.s)) {
                oLI.addClass(this.oCss.c)
            }
        }, this)
    },
    _reset: function() {
        this.list.set("html", "");
    },
    _addCustomEvents: function() {
        this.list.addEvents({
            "click": function(e) {
                e.stopPropagation();
            },
            "focus": function(e) {
                var oUL = this.list,
                    aUL = $$("select[style] + div." + this.options.cssClass + " > ul.root");
                aUL.removeClass(this.oCss.e);

                var oLI = oUL.getElement("li." + this.oCss.c)||oUL.getElement("li:first-child");
                this._fnAlterClass(oLI, oUL.getElements("li"), this.oCss.h);
                document.addEvent("keydown", this.fnNavigate);
            }.bind(this),
            "blur": function(e) {
                this.list.getElements("li").removeClass(this.oCss.h);
                document.removeEvent("keydown", this.fnNavigate);
            }.bind(this)
        });

        var aLI = this.list.getElements("li");
        aLI.each(function(oLI) {
            oLI.addEvents({
                "click": function(e) {
                    if (!e.target.hasClass(this.oCss.d)) {
                        if (e.control) {
                            e.target.addClass(this.oCss.c);
                        } else {
                            this._fnAlterClass(e.target, aLI, this.oCss.c);
                        }
                        this._setSelected();
                        this.list.fireEvent("focus", e);
                    }
                }.bind(this)
            });
        }, this)
    }
});