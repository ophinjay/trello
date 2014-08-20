'use strict';

if(!window["trello"]) {
	window["trello"] = {};
}

trello.ModuleManager = (function () {
	
	var modules = {};

	function define(name, deps, fn) {
		if(modules[name]) {
			throw new Error("Module '" + name + "' already exists!!");
		}
		deps = deps || [];
		deps = deps.map(function(depName) {
			if(!modules[depName]) {
				throw new Error("Dependency not found - " + depName);
			} else if(depName == name) {
				throw new Error("A module cannot be dependent on itself");
			}
			return modules[depName];
		});
		modules[name] = fn.apply(null, deps);
		return modules[name];
	}

	function get(name) {
		if(!modules[name]) {
			throw new Error("No such module defined");
		}
		return modules[name];
	}

	return {
		define: define,
		get: get
	}
	
})();

trello.ModuleManager.define("Element", [], function() {
	function Element(htmlElmt) {
		this.htmlElmt = htmlElmt;
	}
	
	Element.prototype = (function () {
		function id(id) {
			if(id) {
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
			for(var i in map) {
				this.htmlElmt.setAttribute(i, map[i]);
			}
			return this;
		}

		function appendTo(parentElmt) {
			parentElmt.appendChild(this.htmlElmt);
			return this;
		}

		function html(innerHTML) {
			if(innerHTML) {
				this.htmlElmt.innerHTML = innerHTML;
				return this;
			} else {
				return this.htmlElmt.innerHTML;
			}
		}

		function on(event, handler) {
			this.htmlElmt.addEventListener(event, handler);
			return this;
		}

		function css(prop, value) {
			this.htmlElmt.style[prop] = value;
			return this;
		}

		return {
			id: id,
			on: on,
			className: className,
			attributes: attributes,
			appendTo: appendTo,
			html: html,
			css: css
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
	}
});