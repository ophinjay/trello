'use strict';

trello.ModuleManager.define("Application", ["BoardListView", "Board", "Events"], function(BoardListView, Board, Events) {
	var boards;

	function init() {
		boards = getData();
		BoardListView.render("#navbar", boards);
		Events.subscribe("board-created", boardCreatedListener);
	}

	function boardCreatedListener(newBoard) {
		debugger;
		boards.push(newBoard);
		saveData();
	}

	function getData() {
		//var data = JSON.parse(localStorage["trello"]);
		var data = trello.data;
		var boards = [];
		if(data) {
			for(var i = 0; i < data.length; i++) {
				boards.push(Board.create(data[i]));
			}
		}
		return boards;
	}

	function saveData() {
		var dataStr = JSON.stringify(boards, ["title", "lists", "cards"]);
		localStorage["trello"] = dataStr;
	}

	return {
		init: init
	};
});