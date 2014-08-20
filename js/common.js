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
            parentElmt.appendChild(this.htmlElmt);
            return this;
        }

        function html(innerHTML) {
            if (innerHTML) {
                this.htmlElmt.innerHTML = innerHTML;
                return this;
            } else {
                return this.htmlElmt.innerHTML;
            }
        }

        function on(eventName, handler) {
            this.htmlElmt.addEventListener(eventName, handler.bind(this));
            return this;
        }

        function off(eventName, handler) {
            this.htmlElmt.removeEventListener(eventName, handler.bind(this));
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
            removeClass: removeClass
        };
    })();

    function create(tagName) {
        var elmt = document.createElement(tagName);
        return new Element(elmt);
    }

    function get(query) {
        var elmt = document.querySelector(query);
        return new Element(elmt);
    }

    return {
        create: create,
        get: get
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
        "card-title-changed": true,
        "card-deleted": true
    };

    function subscribe(eventName, handler) {
    	if(!isSupported(eventName)) {
    		throw new Error("Event '" + eventName + "' is not supported");
    	} else {
    		if(!subRegistry[eventName]) {
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
    	if(!isSupported(eventName)) {
    		throw new Error("Event '" + eventName + "' is not supported");
    	} else {
    		var subscribers = subRegistry[eventName];
    		if(subscribers &&  subscribers.length > 0) {
    			for(var i = 0; i < subscribers.length; i++) {
    				subscribers[i](eventObject);
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

	return {
		createReadOnlyProperty: createReadOnlyProperty
	};
});
