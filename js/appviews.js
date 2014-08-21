"use strict";

trello.ModuleManager.define("BoardListView", ["Element", "DropDown", "Board", "Events"], function(Element, DropDown, Board, Events) {
	
	var dropDown;

    function render(container, boards) {
    	container = Element.get(container).html("");
        dropDown = DropDown.create({
            id: "boards",
            heading: "Boards",
            container: container,
            tabWidth: 55
        });

        boards.forEach(addToDropDown);

        var newBoard = dropDown.addEditableEntry("Add board");
        newBoard.on("keyup", keyUpHandler.bind(newBoard));

        return dropDown;
    }

    function menuEntryClickHandler() {
        
    }

    function keyUpHandler(eventObject) {
        var code = (typeof eventObject.which == "number") ? eventObject.which : eventObject.keyCode;
        if(code == 13) {
        	var boardName = this.value();
        	if(boardName) {
        		var newBoard = Board.create({
        			"title": boardName
        		});
        		Events.publish("board-created", newBoard);
        		addToDropDown(newBoard, -2);
        		this.value("");
        		dropDown.hide();
        	}
        }
    }

    function addToDropDown(board, index) {
        var entry = dropDown.addEntry(board.title, index + 1);
        entry.on("click", menuEntryClickHandler.bind(board));
    }

    return {
        render: render
    };
});
