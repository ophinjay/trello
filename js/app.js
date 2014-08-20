'use strict';

trello.ModuleManager.define("Application", ["BoardListView", "Board"], function(BoardListView, Board) {
	function init() {
		//initSidePanel();
		var boards = getData();
		BoardListView.render(boards);
		//renderBoardList();

	}

	function getData() {
		//var data = JSON.parse(localStorage["trello"]);
		var data = JSON.parse('[{"title": "Welcome board","lastModified": 0,"lists": [{"title": "List 1","lastModified": 0,"cards": [{"title": "card1","lastModified": 0}]}]}]');
		var boards = [];
		if(data) {
			for(var i = 0; i < data.length; i++) {
				boards.push(Board.create(data[i]));
			}
		}
		return boards;
	}

	function saveData(boards) {
		var dataStr = JSON.stringify(boards, ["title", "lastModified", "lists", "cards"]);
		localStorage["trello"] = dataStr;
	}

	function renderBoardList() {

	}

	//Side panel functions
	function initSidePanel() {
		Element.get("#boards").on("mouseover", slideInHandler);
	}

	function slideInHandler(eventObject) {
		this.addClass("slide-visible");
		var clickOutElmt = Element.get("#clickout");
		clickOutElmt.addClass("show").on("click", sidePanelBlurHandler.bind(clickOutElmt, this));
		this.off("mouseover", slideInHandler);
	}

	function sidePanelBlurHandler(boardsElmt) {
		this.removeClass("show");
		boardsElmt.removeClass("slide-visible");
		boardsElmt.on("mouseover", slideInHandler);
	}

	return {
		init: init
	};
});