'use strict';

if (!window["trello"]) {
    window["trello"] = {};
}

trello.ModuleManager = (function() {
    var modules = {};

    function define(name, deps, fn) {
        if (modules[name]) {
            throw new Error("Module '" + name + "' already exists!!");
        }
        deps = deps || [];
        deps = deps.map(function(depName) {
            if (!modules[depName]) {
                throw new Error("Dependency not found - " + depName);
            } else if (depName == name) {
                throw new Error("A module cannot be dependent on itself");
            }
            return modules[depName];
        });
        modules[name] = fn.apply(null, deps);
        return modules[name];
    }

    function get(name) {
        if (!modules[name]) {
            throw new Error("No such module defined");
        }
        return modules[name];
    }

    return {
        define: define,
        get: get
    };
})();

trello.ModuleManager.define("Element", [], function() {
    function Element(htmlElmt) {
        this.htmlElmt = htmlElmt;
    }

    Element.prototype = (function() {
        function getHTMLElement(obj) {
            if (obj instanceof HTMLElement) {
                return obj;
            } else if (obj.htmlElmt && obj.htmlElmt instanceof HTMLElement) {
                return obj.htmlElmt;
            } else {
                return undefined;
            }
        }

        function id(id) {
            if (id) {
                this.htmlElmt.id = id;
                return this;
            } else {
                return this.id;
            }
        }

        function className(className) {
            this.htmlElmt.className = className;
            return this;
        }

        function attributes(map) {
            for (var i in map) {
                this.htmlElmt.setAttribute(i, map[i]);
            }
            return this;
        }

        function appendTo(parentElmt) {
            if (parentElmt) {
                var elmt = getHTMLElement(parentElmt);
                elmt.appendChild(this.htmlElmt);
            }
            return this;
        }

        function html(innerHTML) {
            if (innerHTML != undefined) {
                this.htmlElmt.innerHTML = innerHTML;
                return this;
            } else {
                return this.htmlElmt.innerHTML;
            }
        }

        function on(eventName, handler) {
            this.htmlElmt.addEventListener(eventName, handler);
            return this;
        }

        function off(eventName, handler) {
            this.htmlElmt.removeEventListener(eventName, handler);
        }

        function css(prop, value) {
            this.htmlElmt.style[prop] = value;
            return this;
        }

        function addClass(className) {
            this.htmlElmt.classList.add(className);
            return this;
        }

        function removeClass(className) {
            this.htmlElmt.classList.remove(className);
            return this;
        }

        function insertAt(parentElmt, index) {
            parentElmt = getHTMLElement(parentElmt);
            var children = parentElmt.children;
            var abIndex = Math.abs(index);
            if (abIndex > 0 && abIndex <= children.length) {
                var insertBefore = index > 0 ? (index - 1) : (index + children.length);
                parentElmt.insertBefore(this.htmlElmt, children[insertBefore]);
            } else {
                throw new Error("Invalid index to insert child - " + index);
            }
        }

        function value(val) {
            if (val != undefined) {
                this.htmlElmt.value = val;
                return this;
            } else {
                return this.htmlElmt.value;
            }
        }

        return {
            id: id,
            on: on,
            off: off,
            className: className,
            attributes: attributes,
            appendTo: appendTo,
            html: html,
            css: css,
            addClass: addClass,
            removeClass: removeClass,
            insertAt: insertAt,
            value: value
        };
    })();

    return {
        create: function(tagName, doc) {
            doc = doc || document;
            var elmt = doc.createElement(tagName);
            return new Element(elmt);
        },
        get: function(query, doc) {
            if (query instanceof HTMLElement) {
                var elmt = query;
            } else {
                doc = doc || document;
                elmt = doc.querySelector(query);
            }
            return new Element(elmt);
        }
    };
});

trello.ModuleManager.define("Events", [], function() {
    var subRegistry = {};

    var supported = {
        "board-created": true,
        "board-title-changed": true,
        "board-deleted": true,
        "list-created": true,
        "list-title-changed": true,
        "list-deleted": true,
        "card-created": true,
        "card-moved": true,
        "card-title-changed": true,
        "card-deleted": true
    };

    function subscribe(eventName, handler) {
        if (!isSupported(eventName)) {
            throw new Error("Event '" + eventName + "' is not supported");
        } else {
            if (!subRegistry[eventName]) {
                subRegistry[eventName] = [];
            }
            var index = subRegistry[eventName].length;
            subRegistry[eventName][index] = handler;
        }
        return {
            remove: remove.bind(null, eventName, index)
        };
    }

    function remove(eventName, index) {
        subRegistry[eventName].splice(index, 1);
    }

    function publish(eventName, eventObject) {
        if (!isSupported(eventName)) {
            throw new Error("Event '" + eventName + "' is not supported");
        } else {
            var subscribers = subRegistry[eventName];
            if (subscribers && subscribers.length > 0) {
                for (var i = 0; i < subscribers.length; i++) {
                    setTimeout(subscribers[i].bind(null, eventObject), 0);
                }
            }
        }
    }

    function isSupported(eventName) {
        return supported[eventName];
    }

    return {
        subscribe: subscribe,
        publish: publish
    };
});

trello.ModuleManager.define("Utilities", [], function() {
    function createReadOnlyProperty(object, property, value) {
        return Object.defineProperty(object, property, {
            value: value,
            enumerable: true,
            writable: false,
            configurable: false
        });
    }

    function stopPropagation(eventObject) {
        eventObject = eventObject || window.event;
        eventObject.stopPropagation();
    }
    return {
        createReadOnlyProperty: createReadOnlyProperty,
        stopPropagation: stopPropagation
    };
});

trello.ModuleManager.define("ListEntry", ["Element"], function(Element) {

    return {
        create: function(inputObj) {
            var className = inputObj.className || "entry dd-entry rounded";
            var entry = Element.create("div").className(className).html(inputObj.content);
            if (typeof inputObj.index == "number") {
                try {
                    entry.insertAt(inputObj.container, inputObj.index);
                } catch (ex) {
                    entry.appendTo(inputObj.container);
                }
            } else {
                entry.appendTo(inputObj.container);
            }
            return entry;
        }
    };
});

trello.ModuleManager.define("DropDown", ["Element", "Utilities", "ListEntry"], function(Element, Utilities, ListEntry) {
    function DropDown(inputObj) {
        this.heading = inputObj.heading;
        this.tabPosition = inputObj.tabPosition;
        this.id = inputObj.id;
        this.container = inputObj.container.addClass("dropdown");
        this.widget = Element.create("div").id(inputObj.id).className("rounded-bottom").appendTo(this.container);
        this.list = Element.create("div").attributes({
            "name": "list"
        }).className("rounded-bottom hide").appendTo(this.widget);
        this.btn = Element.create("div").attributes({
            "name": "tab"
        }).className("subtitle rounded-bottom").html(inputObj.heading).css("width", inputObj.tabWidth + "px").appendTo(this.widget);

        //Event handlers
        this.btn.on("click", tabClickHandler.bind(this));
        this.menuClickHandler = clickoutHandler.bind(this, "menu-clicked");
        this.outClickHandler = clickoutHandler.bind(this, "outside-clicked");
    }

    function tabClickHandler(eventObject) {
        Utilities.stopPropagation(eventObject);
        this.list.removeClass("hide");
        this.btn.addClass("hide");
        this.list.on("click", this.menuClickHandler);
        Element.get(document.body).on("click", this.outClickHandler);
    }

    function clickoutHandler(clickLocation, eventObject) {
        if (clickLocation == "outside-clicked") {
        	this.hide();
        } else {
            Utilities.stopPropagation(eventObject);
        }
    }

    DropDown.prototype = (function() {
        function addEntry(heading, index) {
            return ListEntry.create({
                content: heading,
                container: this.list,
                index: index
            });
        }

        function addEditableEntry(placeholder) {
            return Element.create("input").attributes({
                "type": "text",
                "placeholder": placeholder
            }).appendTo(this.list).className("entry editable rounded");
        }

        function hide() {
            this.list.addClass("hide");
            this.btn.removeClass("hide");
            this.list.off("click", this.menuClickHandler);
            Element.get(document.body).off("click", this.outClickHandler);
        }

        return {
            addEntry: addEntry,
            addEditableEntry: addEditableEntry,
            hide: hide
        };
    })();

    return {
        create: function(inputObj) {
            return new DropDown(inputObj);
        }
    };
});
