'use strict';

trello.ModuleManager.define("Controller", ["Element"], function(Element) {
	function init() {
		initSidePanel();
	}

	//Side panel functions
	function initSidePanel() {
		Element.get("#boards").on("mouseover", slideInHandler);
		Element.get("#clickout").css("")
		var boardPanel = document.querySelector("#boards");

		boardPanel.addEventListener("mouseover", slideInHandler);
		document.querySelector("#boards").addEventListener("mouseover", slideOutHandler);
	}

	function slideInHandler(eventObject) {
		eventObject.srcElement.classList.add("slide");
	}

	function slideOutHandler() {
		
	}

	return {
		init: init
	};
});