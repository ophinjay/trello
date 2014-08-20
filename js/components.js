'use strict';

trello.ModuleManager.define("Board", ["Element"], function(Element) {
    function Board(title) {
        this.title = title;
        this.lists = [];
    };

    Board.prototype = (function() {

        function addList(list) {
            this.lists.push(list);
        }

        function deleteList(index) {
            this.lists.splice(index, 1);
        }

        function render(container) {
        	if(typeof container == "string") {
        		container = document.querySelector(container);
        	}
        	this.boardDiv = Element.create("div").appendTo(container);
        	this.lists.forEach(function(list) {
        		list.render();
        	});
        }

        return {
            addList: addList,
            deleteList: deleteList
        };

    })();

    function creat(title) {
    	return new Board(title);
    }

    return {
        create: function(title) {
            return new Board(title);
        }
    };
});
