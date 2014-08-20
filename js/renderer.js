"use strict";

trello.ModuleManager.define("BoardListView", ["DropDown", "Board"], function(DropDown, Board) {
    var template = '<div name="dropdown" class="slide rounded">' +
        '<div name="list"></div>' +
        '<span name="tab" class="subtitle center rounded"></span>' +
        '</div>'

    var dropDown;
    function render(boards) {
    	dropDown = DropDown.create({
    		id: "boards",
    		heading: "Boards",
    		container: document.querySelector("#navbar"),
    		tabPosition: 20
    	});
    }

    return {
        render: render
    };
});
