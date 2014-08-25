'use strict';

if (!window["trello"]) {
    window["trello"] = {};
}

/**
 * A basic module manager utility.
 */
trello.ModuleManager = (function() {
    //All modules are stored in this object referenced by their names
    var modules = {};

    /**
     *	Defines a module.
     *	** Inputs **
     * 	name - name of the module
     *  deps - string array of dependencies that have to be injected into the module that is being defined
     *  fn - the initializer function that initializes the module and returns an object with functions that are to be exposed
     *  ** Returns **
     *  The defined module
     *  ** Exceptions **
     *		- If any of the dependencies listed are not already defined
     *		- If there is a self-dependency
     *		- If the module initializer returns an undefined value
     *		- If another module already exists in the same name
     */
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
        var newModule = fn.apply(null, deps);
        if (!newModule) {
            throw new Error("The module constructor for " + name + " returned an undefined value!!");
        } else {
            modules[name] = newModule;
        }
        return newModule;
    }

    /**
     *	To retrieve an already existing module
     *	** Inputs **
     *	name - name of the module that is to be fetched
     *	** Returns **
     *	Returns the requested module
     *	** Exceptions **
     *	If the module requested does not exist
     */
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

/**
 *	A utility module that wraps an HTML element providing it a number of HTML element based apis(much like $ in jQuery).
 *	It provides the advantages of chaining multiple operations on an element.
 */
trello.ModuleManager.define("Element", [], function() {

    //Element class
    function Element(htmlElmt) {
        this.htmlElmt = htmlElmt;
    }

    //Prototype definition for element class
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

        function appendChild(childElmt) {
            if (childElmt) {
                var elmt = getHTMLElement(childElmt);
                this.htmlElmt.appendChild(elmt);
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

        function on(eventName, handler, capture) {
            this.htmlElmt.addEventListener(eventName, handler, capture);
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
            } else if (abIndex === 0) {
                parentElmt.insertBefore(this.htmlElmt, children[0]);
            } else {
                parentElmt.appendChild(this.htmlElmt);
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

        function get(query) {
            if (typeof query != "string") {
                throw new Error("Ivalid query!!");
            }
            return getInstance(this.htmlElmt.querySelector(query));
        }

        function child(n) {
            return getInstance(this.htmlElmt.childNodes[n]);
        }

        function remove() {
            try {
                this.htmlElmt.parentNode.removeChild(this.htmlElmt);
            } catch (ex) {}
        }

        function replaceChild(replaceThis, withThis) {
            replaceThis = getHTMLElement(replaceThis);
            withThis = getHTMLElement(withThis);
            this.htmlElmt.replaceChild(withThis, replaceThis);
            return this;
        }

        function clone(deepClone) {
            return getInstance(this.htmlElmt.cloneNode(deepClone));
        }

        function childIndex() {
            var count = 0;
            var child = this.htmlElmt.previousSibling;
            while (child) {
                count++;
                child = child.previousSibling;
            }
            return count;
        }

        function parent() {
            return getInstance(this.htmlElmt.parentNode);
        }

        function childCount() {
            return this.htmlElmt.children.length;
        }

        function insertBefore(elmt) {
            elmt = getHTMLElement(elmt);
            this.htmlElmt.insertBefore(elmt.parentNode, elmt);
        }

        return {
            //gets id of the element if id input is null else sets id to the provided value
            id: id,
            //removes the element from its parent
            remove: remove,
            //sets the specified eventhandler for the specified event
            on: on,
            //removed the specified eventhandler for the specified event
            off: off,
            //gets a child element from the query passed
            get: get,
            //gets the nth child of the element
            child: child,
            //sets css class name
            className: className,
            //sets attributes
            attributes: attributes,
            //appends the element to the parent element provided
            appendTo: appendTo,
            //sets/gets innerHTML property of the element
            html: html,
            //sets a css property in the element
            css: css,
            //adds a class to the list of css classes
            addClass: addClass,
            //removes a class from the list of css classes
            removeClass: removeClass,
            //inserts an element at a specified position in the parent element
            insertAt: insertAt,
            //sets/gets the value of an input/textarea element
            value: value,
            //appends a child to the element
            appendChild: appendChild,
            //replaces a child in the element with another element
            replaceChild: replaceChild,
            //clones the element
            clone: clone,
            //get the index of the element in its parent
            childIndex: childIndex,
            //gets the parent of the element
            parent: parent,
            //gets the count of children in the element
            childCount: childCount,
            //insert the element before the specifeid element
            insertBefore: insertBefore
        };
    })();

    function getInstance(query, doc) {
        if (query instanceof Element) {
            return query;
        }
        if (query instanceof HTMLElement) {
            var elmt = query;
        } else {
            doc = doc || document;
            elmt = doc.querySelector(query);
        }
        return new Element(elmt);
    }

    return {
        /**
         *	Creates a new tag and attaches it to a document
         *	** Inputs **
         *	tagName - name of the HTML tag that is to be created
         *	doc - the document on which the new element is to be created. Defaults to document reference of the current page
         *	** Returns **
         *	Instance of Element class
         */
        create: function(tagName, doc) {
            doc = doc || document;
            var elmt = doc.createElement(tagName);
            return new Element(elmt);
        },
        /**
         *	Retrieves an element
         *	** Inputs **
         *	query - A string query to get the element/an object of HTMLElement/an object of Element class(defined above)
         *	doc - the document on which the element is to be queried for. Defaults to document reference of the current page
         *	** Returns **
         * 	Instance of Element class
         *		- If query input is a string, the query is run on the document with document.querySelector
         *		  and the resultant element is wrapped as an Element object
         *		- If query input is a HTMLElement object, it is wrapped as an Element object
         *		- If query input is already an Element object, it is returned as such
         */
        get: getInstance
    };
});

/**
 *	A basic events module for communication between views and the controller. Events like board creation, card deletion etc.
 *	have to be notified to the controller so that it can update the model. Views publish events as they happen in the UI. The
 *	controller subscribes to these events and update the model accordingly.
 */
trello.ModuleManager.define("Events", [], function() {

    //Maintains an array for every event that is supported. Subscribers to an event are pushed to the array corresponding
    //to the eventName.
    var subRegistry = {
        "board-created": [],
        "board-changed": [],
        "board-deleted": [],
        "board-updated": [],
        "card-deleted": [],
        "card-updated": [],
        "card-created": [],
        "list-deleted": [],
        "list-updated": [],
        "list-created": []
    };

    /**
     *	To subscribe to an event
     *	** Inputs **
     *	eventName - name of the event to which subscription is required
     * 	handler - handler to be called when the event is published
     *	** Returns **
     *	An object with a single property 'remove' set to a function that can be called if the subscription is to be revoked at
     *	some other time
     *	** Exceptions **
     *	If subscription is attempted for an unsupported event
     */
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

    /**
     *	Private method that removes a subscriber for the specified event
     */
    function remove(eventName, index) {
        subRegistry[eventName].splice(index, 1);
    }

    /**
     *	To publish an event
     *	** Inputs **
     *	eventName - name of the event to publish
     * 	eventObject - data that is to be passed to subscribers of this event
     *	** Exceptions **
     *	If publish is attempted for an unsupported event
     */
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

    /**
     *	Private method that checks if an event is valid. An event is valid if it has an entry in the subRegistry object
     */
    function isSupported(eventName) {
        return subRegistry[eventName];
    }

    return {
        subscribe: subscribe,
        publish: publish
    };
});

/**
 *	Utility module for functions used throughout the application.
 *	** Dependencies **
 *		- Element
 */
trello.ModuleManager.define("Utilities", ["Element"], function(Element) {
    /**
     *	Create a readonly property in an object
     *	** Inputs **
     *	object - object in which the property is to be created
     *	property - name of the property
     *	value - value of the property
     *	** Returns **
     *	Updated object
     */
    function createReadOnlyProperty(object, property, value) {
        return Object.defineProperty(object, property, {
            value: value,
            enumerable: true,
            writable: false,
            configurable: false
        });
    }

    /**
     *	Stops further propagation of an event
     *	** Inputs **
     *	eventObject - eventObject returned to the event handler
     */
    function stopPropagation(eventObject) {
        eventObject = eventObject || window.event;
        eventObject.stopPropagation();
    }

    /**
     *	Used by model classes to delete an element from the specified index position and to update
     *	index proprty of succeeding elements in the array
     *	** Inputs **
     *	array - array of model class objects
     *	index - index that is to be deleted
     *	** Returns **
     *	Updated array
     */
    function spliceAndUpdateIndex(array, index) {
        array.splice(index, 1);
        for (var i = index; i < array.length; i++) {
            array[index].index--;
        }
        return array;
    }

    /**
     *	Loads an html string in a dummy element and returns the resultant DOM structure of the html string
     *	!!WARNING - The html string should have a single root parent, else only the first child of the resultant
     *	structure will be returned
     */
    function getLoadedHTML(html) {
        return Element.create("div").html(html).child(0);
    }

    return {
        createReadOnlyProperty: createReadOnlyProperty,
        stopPropagation: stopPropagation,
        spliceAndUpdateIndex: spliceAndUpdateIndex,
        getLoadedHTML: getLoadedHTML
    };
});

/**
 *	Module to create a dropdown UI component. The created structure will have a tab on click of which the entries in the dropdown
 *	will be displayed. When the user clicks somewhere outside the dropdown, the menu will be hidden and the tab will be shown again
 *	** Dependencies **
 *		- Element
 *		- Utilities
 */
trello.ModuleManager.define("DropDown", ["Element", "Utilities"], function(Element, Utilities) {

    //Dropdown class
    function DropDown(inputObj) {
        this.heading = inputObj.tabName;
        this.id = inputObj.id;
        this.container = Element.get(inputObj.container).addClass("dropdown");
        this.widget = Element.create("div").id(inputObj.id).className("rounded-bottom").appendTo(this.container);
        this.list = Element.create("div").attributes({
            "name": "list"
        }).className("rounded-bottom hide").appendTo(this.widget);
        this.btn = Element.create("div").attributes({
            "name": "tab"
        }).className("subtitle rounded-bottom").html(this.heading).css("width", inputObj.tabWidth + "px").appendTo(this.widget);
        this.editableEntries = [];

        //Setting tab click handler
        this.btn.on("click", tabClickHandler.bind(this));
        //Click handlers for detecting when the user has clicked outside an open menu. See documentation for clickoutHandler
        this.menuClickHandler = clickoutHandler.bind(this, "menu-clicked");
        this.outClickHandler = clickoutHandler.bind(this, "outside-clicked");
        //Click handlers to detect when an entry is clicked.
        this.entryClickedHandler = entryClickedHandler.bind(this);
    }

    /**
     *	Handler called when the tab is clicked. This handler does the following
     *		- hides the tab
     *		- shows the menu
     *		- attaches click handler on the menu
     *		- attaches click handler on the document
     *	** this object **
     *	DropDown instance
     */
    function tabClickHandler(eventObject) {
        Utilities.stopPropagation(eventObject);
        this.list.removeClass("hide");
        this.btn.addClass("hide");
        this.list.on("click", this.menuClickHandler);
        Element.get(document.body).on("click", this.outClickHandler);
    }

    /**
     *	This handler is attached to both an open menu and the document body. 
     *		- When the user clicks inside the menu, this handler is called with 'clickLocation' as "menu-clicked". This means that
     *		  the menu should stay open. In this case Utilities.stopPropagation() is called to prevent the event from bubbling up
     *		- When the user clicks outside the menu(document.body), this handler is called with 'clickLocation' as "outside-clicked".
     *		  This means that the user wants to close the menu and hide() method is called
     *	** this object **
     *	DropDown instance
     */
    function clickoutHandler(clickLocation, eventObject) {
        if (clickLocation == "outside-clicked") {
            this.hide();
        } else {
            Utilities.stopPropagation(eventObject);
        }
    }

    /**
     *	Handler called when an entry is clicked. This handler will call hide() method of the dropdown
     *	** this object **
     *	DropDown instance
     */
    function entryClickedHandler(eventObject) {
        this.hide();
    }

    //Dropdown prototype
    DropDown.prototype = (function() {

        /**
         *	To add an entry in the dropdown. Internally attaches the entryClickedHandler to the entry to track click events on the
         *	dropdown entry
         *	** Inputs **
         *	heading - heading to be shown for the dropdown entry
         *	index - position in the dropdown in which the new entry is to be added
         *	** Returns **
         *	Created entry element
         */
        function addEntry(heading, index) {
            return createEntry({
                content: heading,
                container: this.list,
                index: index
            }).on("click", this.entryClickedHandler);
        }

        /**
         *	Private method to add an entry to the dropdown
         */
        function createEntry(inputObj) {
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

        /**
         *	To add an editable entry in the dropdown. Created entry is pushed to the array 'editableEntries' maintained on the
         *	dropdown object for purpose of clearing all editable entries in the menu when the menu is closed.
         *	** Inputs **
         *	placeholder - placeholder text for the editable entry
         *	** Returns **
         *	Created entry element
         */
        function addEditableEntry(placeholder) {
            var entry = Element.create("input").attributes({
                "type": "text",
                "placeholder": placeholder
            }).appendTo(this.list).className("entry editable rounded");
            this.editableEntries.push(entry);
            return entry;
        }

        /**
         *	Hides the menu and unhides the tab. All editable entries are cleared of their value. Click handlers registered for
         *	document body and the menu are removed.
         */
        function hide() {
            this.list.addClass("hide");
            this.btn.removeClass("hide");
            for (var i = 0; i < this.editableEntries.length; i++) {
                this.editableEntries[i].value("");
            }
            this.list.off("click", this.menuClickHandler);
            Element.get(document.body).off("click", this.outClickHandler);
        }

        /**
         *	Removes a dropdown entry in the specified index
         */
        function remove(index) {
            this.list.child(index).remove();
        }

        return {
            addEntry: addEntry,
            addEditableEntry: addEditableEntry,
            hide: hide,
            remove: remove
        };
    })();

    return {
        /**
         *	Creates a new dropdown
         *	** Inputs **
         *	inputObj - object with the following properties
         *		- id: id to be assigned to the menu HTMLElement
         *		- tabName: name to be displayed for the tab
         *		- container: container/query of element inside with the menu is to be rendered
         *		- tabWidth: width of the tab element
         *	** Returns**
         *	Object of the DropDown class
         */
        create: function(inputObj) {
            return new DropDown(inputObj);
        }
    };
});
