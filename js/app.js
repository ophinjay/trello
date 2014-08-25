'use strict';

trello.ModuleManager.define("Application", ["BoardView", "BoardMenuView", "AppData", "Events"], function(BoardView, BoardMenuView, AppData, Events) {
    var boards;

    function init() {
        boards = AppData.getData();
        BoardMenuView.render("#navbar", boards);
        BoardView.render("#board", boards[0]);
        Events.subscribe("board-created", boardCreateListener);
        Events.subscribe("board-changed", boardChangeListener);
        Events.subscribe("board-updated", boardUpdateListener);
        Events.subscribe("board-deleted", boardDeleteListener);
        Events.subscribe("card-created", cardCreateListener);
        Events.subscribe("card-updated", cardUpdateListener);
        Events.subscribe("card-deleted", cardDeleteListener);
        Events.subscribe("list-created", listCreateListener);
        Events.subscribe("list-updated", listUpdateListener);
        Events.subscribe("list-deleted", listDeleteListener);
    }

    //Board create, change, update, delete listeners
    function boardCreateListener(boardName) {
        var newBoard = AppData.addBoard(boardName);
        AppData.saveData();
        BoardMenuView.add(newBoard);
        BoardView.render("#board", newBoard);
    }

    function boardChangeListener(board) {
        BoardView.render("#board", board);
    }

    function boardUpdateListener(data) {
    	data["board"].title = data["newTitle"];
        AppData.saveData();
    }

    function boardDeleteListener(deletedBoard) {
        AppData.deleteBoard(deletedBoard);
        BoardMenuView.remove(deletedBoard);
        AppData.saveData();
    }

    //Card create, update, delete listeners
    function cardCreateListener(data) {
        var newCard = AppData.addCard(data["list"], data["content"]);
        BoardView.addCard(data["list"], newCard);
        AppData.saveData();
    }

    function cardUpdateListener(data) {
    	data["card"].content = data["newContent"];
    	AppData.saveData();
    }

    function cardDeleteListener(card) {
        AppData.deleteCard(card);
        AppData.saveData();
    }

    //List create, update, delete listeners
    function listCreateListener(board) {
    	var list = AppData.addList(board, "New List");
    	BoardView.addList(list);
    	AppData.saveData();
    }

    function listUpdateListener(data) {
    	data["list"].title = data["newTitle"];
    	AppData.saveData();
    }
    
    function listDeleteListener(list) {
        AppData.deleteList(list);
        AppData.saveData();
    }

    return {
        init: init
    };
});
