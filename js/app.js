'use strict';

trello.ModuleManager.define("Application", ["Element", "Board"], function(Element, Board) {
	function init() {
		//initSidePanel();

	}

	function getData() {
		var data = JSON.parse(localStorage["trello"]);
		var boards = [];
		if(data) {
			for(var i in data) {

			}
		}
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