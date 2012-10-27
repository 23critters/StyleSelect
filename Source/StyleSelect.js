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
            b: "bottom",
            c: "clicked",
            d: "disabled",
            e: "expanded",
            h: "hover",
            m: "multiple",
            o: "optgroup",
            r: "root",
            s: "selected"
        },
        inheritCSSClass: true,
        skipfirst: false,
        usetitles: false
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

        return (!options.element.getProperty("multiple"))?new StyleSelect.Simple(options):new StyleSelect.Multiple(options);
    },
    _setup: function() {
        this.oCss = this.options.cssActions;
        this.container = new Element("div", {
            "class": this.options.cssClass,
            "styles": {
                "padding": Object.values(this.element.getStyles("padding")).toString(),
                "margin": Object.values(this.element.getStyles("margin")).toString()
            }
        }).inject(this.element, "after");

        if (!(Browser.ie && Browser.version <= 7)) {
            var iElementSize = this.element.getComputedSize();
            this.container.setStyles({
                "height": iElementSize.height.toInt(),
                "width": iElementSize.width.toInt()
            });
        }

        this.element.setStyle("display", "none");

        this.list = new Element("ul", {
            "class": this.oCss.r
        }).inject(this.container);

        this.fnNavigate = this._navigate.bind(this);

        this.rebuild();

        if (this.options.inheritCSSClass) {
            this.container.addClass(this.element.get("class"));
        }

        document.addEvent("click", function(e) {
            this.list.removeClass(this.oCss.e);
            this.list.removeProperty("style");
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
            iALILength = aLI.length,
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
                }
            case "esc":
                this.container.getElement("ul").removeClass(this.oCss.e);
                this.list.removeProperty("style");
                document.removeEvent("keydown", this.fnNavigate);
            break;
            default:
                if (e.key.length === 1) {
                    e.preventDefault();
                    for (var i=0 ; i < iALILength ; i++) {
                        if (e.code === aLI[i].get("html").charCodeAt(0)) {
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
            var oCheckbox = null;
            if ((oCheckbox = oLI.getElement("input[type=checkbox]"))) {
                oCheckbox.set("checked", oLI.hasClass(this.oCss.c));
            }
            if (oLI.hasClass(this.oCss.c)) {
                this.element.getElements("option")[idx].set("selected", true);
                if (this.showSelected) {
                    this.showSelected.set("html", oLI.get("html"));
                    this.showSelected.set("title", oLI.get("html"));
                    this.showSelected.set("data-value", oLI.get("data-value"));
                }
            }
        }, this);
    },
    /**
    * @return {Array} An array is returned with every selected option, text & value. Will break backward compability for v1.1
    */
    getSelected: function() {
        var aReturn = [],
            oSelected = Object.filter(this.element.getElements("option"), function(oOption) {
                if (typeof oOption === "object") {
                    return oOption.get("selected");
                }
            });

        Object.each(oSelected, function(oOpt) {
            aReturn.include({option: oOpt, "value":oOpt.get("value"),"text":oOpt.get("text")});
        });

        return aReturn;
    },
    getSelectElem: function() {
        return this.element;
    },
    rebuild: function() {
        this._reset();

        var iCount = 0;
        this.element.getElements("option,optgroup").each(function(oOpt) {
            var bOption = oOpt.get("tag") === "option";
            if (bOption) {
                if (!this.options.skipfirst || iCount > 0) {
                    if (oOpt.getParent() !== this.o_parent) {
                        this.o_parent = oOpt.getParent();
                        this.list = this.list.getParent("ul");
                    }
                    var oLI = new Element("li", {
                        "class": (oOpt.selected)?this.oCss.s:"",
                        "html": oOpt.get("text"),
                        "title": (this.options.usetitles)?oOpt.get("text"):"",
                        "data-value": oOpt.get("value")
                    }).inject(this.list);
                    if (this.options.checkboxes) {
                        oLI.set("html", "");
                        oLI.adopt(
                            new Element("label", {
                                "html": oOpt.get("text"),
                                "events": {
                                    "click": function(e) {
                                        e.preventDefault();
                                    }
                                }
                            }).grab(
                                new Element("input", {
                                    "type": "checkbox"
                                }), "top"
                            )
                        );
                    }
                    if (oOpt.hasAttribute("disabled")) {
                        oLI.addClass(this.oCss.d);
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
            e.preventDefault();
            var oUL = this.list,
                aUL = $$("select[style] + div." + this.options.cssClass + " > ul." + this.oCss.r),
                iXAxis = e.client.x, // if negative value, it was opened with enter key
                aParentCheck = [],
                fnHasFixedParent = function() {
                    var aParents = oUL.getParents("*:not(html,body)"),
                        aFiltered = aParents.filter(function(oEl) {
                            return oEl.getStyle("position") === "fixed";
                        });
                    return !!aFiltered.length;
                };
            oUL.removeClass(this.oCss.b);
            if (oUL.hasClass(this.oCss.e)) {
                aUL.removeClass(this.oCss.e);
                this.list.removeProperty("style");
                document.removeEvent("keydown", this.fnNavigate);
            } else {
                var oLI = oUL.getElement("li." + this.oCss.c)||oUL.getElement("li:first-child"),
                    iWindowHeight = window.getSize().y,
                    iWindowScroll = window.getScrollSize().y,
                    bAnchoredBottom = false;
                this._fnAlterClass(oLI, oUL.getElements("li"), this.oCss.h);
                this._fnAlterClass(oUL, aUL, this.oCss.e);
                var oCoords = oUL.getCoordinates();
                if (oCoords.top + oCoords.height > (fnHasFixedParent()?iWindowHeight:iWindowScroll)) {
                    oUL.addClass(this.oCss.b);
                    bAnchoredBottom = !bAnchoredBottom;
                }
                oUL.setStyle("max-height", iWindowHeight - (iWindowHeight - (bAnchoredBottom?this.container.getCoordinates().top:this.container.getCoordinates().bottom)));
                this.showSelected.blur();
                document.addEvent("keydown", this.fnNavigate);
            }
        }.bind(this));
    },
    _reset: function() {
        this._clearCustomEvents();
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
            "title": (this.options.usetitles)?oOption.get("text"):"",
            "data-value": oOption.get("data-value")
        }).inject(this.container);
    },
    _clearCustomEvents: function() {
        this.list.removeEvents("click");
        this.list.getElements("li").removeEvents("mouseover");
        this.list.getElements("li").removeEvents("click");
    },
    _addCustomEvents: function() {
        this.list.addEvent("click", function(e) {
            e.stopPropagation();
            e.preventDefault();
            this.list.removeClass(this.oCss.e);
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
                        document.removeEvent("keydown", this.fnNavigate);
                    }
                }.bind(this)
            });
        }, this);
    }
});

StyleSelect.Multiple = new Class({
    Extends: StyleSelect,
    options: {
        size: 4,
        checkboxes: false
    },
    initialize: function(options) {
        this.setOptions(options);
        this.element = this.o_parent = this.options.element;

        this._setup();

        this.container.addClass(this.oCss.m);
        var iSize = this.options.size||this.element.getProperty("size");
        this.container.setStyle("height", this.list.getElement("li:first-child").getSize().y * iSize);
        this.list.getElements("li").each(function(oLI) {
            if (oLI.hasClass(this.oCss.s)) {
                oLI.addClass(this.oCss.c);
            }
        }, this);
    },
    _reset: function() {
        this._clearCustomEvents();
        this.list.set("html", "");
    },
    _clearCustomEvents: function() {
        this.list.removeEvents("click");
        this.list.removeEvents("focus");
        this.list.removeEvents("blur");
        this.list.getElements("li").removeEvents("click");
    },
    _addCustomEvents: function() {
        this.list.addEvents({
            "click": function(e) {
                e.stopPropagation();
            },
            "focus": function(e) {
                var oUL = this.list,
                    aUL = $$("select[style] + div." + this.options.cssClass + " > ul." + this.oCss.r);
                aUL.removeClass(this.oCss.e);
                aUL.removeProperty("style");

                var oLI = oUL.getElement("li." + this.oCss.c)||oUL.getElement("li:first-child");
                this._fnAlterClass(oLI, oUL.getElements("li"), this.oCss.h);
                document.addEvent("keydown", this.fnNavigate);
            }.bind(this),
            "blur": function(e) {
                this.list.getElements("li").removeClass(this.oCss.h);
                document.removeEvent("keydown", this.fnNavigate);
            }.bind(this)
        });

        var aLI = this.list.getElements("li:not(.optgroup)");
        aLI.each(function(oLI) {
            oLI.addEvents({
                "click": function(e) {
                    var oTarget = (e.target === oLI)?e.target:oLI;
                    if (!oTarget.hasClass(this.oCss.d)) {
                        if (e.control) {
                            oTarget.addClass(this.oCss.c);
                        } else {
                            this._fnAlterClass(oTarget, aLI, this.oCss.c);
                        }
                        this._setSelected();
                        this.list.fireEvent("focus", e);
                    }
                }.bind(this)
            });
        }, this);
    }
});