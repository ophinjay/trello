'use strict';

/**
 *  Controller module for the application
 *  Integrates between views and the model. Events published by the views are listened to in this module and corresponding data changes
 *  and related UI changes(if any) are inititated
 */
trello.ModuleManager.define("Application", ["BoardView", "BoardMenuView", "AppData", "Events"], function(BoardView, BoardMenuView, AppData, Events) {
    var boards;

    /**
     *  Initializes the application
     *      - Retrieves data from localStorage
     *      - Creates BoardMenuView for creating new boards and switching between boards
     *      - Renders the first board in the application(if any)
     *      - Listens to change events published by views
     */
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
    /**
     *  Triggered when a new board is created in the UI
     *      - Creates a new board in the model
     *      - Saves the data in localStorage
     *      - Adds the new board in the board menu
     *      - Switches the application view to the new board
     */
    function boardCreateListener(boardName) {
        var newBoard = AppData.addBoard(boardName);
        AppData.saveData();
        BoardMenuView.add(newBoard);
        BoardView.render("#board", newBoard);
    }

    /**
     *  Triggered when a board is switched in the boards menu
     *      - Switches the application view to the new board
     */
    function boardChangeListener(board) {
        BoardView.render("#board", board);
    }

    /**
     *  Triggered when the board title is changed in the UI.
     *      - Updates the related board model with the new title
     *      - Saves the data in localStorage
     *      - Updates the board menu with the new title
     */
    function boardUpdateListener(data) {
        AppData.setBoardTitle(data["board"], data["newTitle"]);
        BoardMenuView.refresh(data["board"]);
        AppData.saveData();
    }

    /**
     *  Triggered when the board is deleted in the UI.
     *      - Deletes the related board from the model
     *      - Saves the data in localStorage
     *      - Deletes the board from the menu view
     */
    function boardDeleteListener(deletedBoard) {
        AppData.deleteBoard(deletedBoard);
        BoardMenuView.remove(deletedBoard);
        AppData.saveData();
    }

    //List create, update, delete listeners
    /**
     *  Triggered when a list is created in the UI
     *      - Adds new list to the data model
     *      - Creates new list view in the board
     *      - Saves the data in localStorage
     */    
    function listCreateListener(board) {
        var list = AppData.addList(board, "New List");
        BoardView.addList(list);
        AppData.saveData();
    }

    /**
     *  Triggered when a list title is updated in the UI
     *      - Updates related list title in the model
     *      - Saves the data in localStorage
     */  
    function listUpdateListener(data) {
        AppData.setListTitle(data["list"], data["newTitle"]);
        AppData.saveData();
    }

    /**
     *  Triggered when a list is deleted in the UI
     *      - Deletes related list in the model
     *      - Saves the data in localStorage
     */    
    function listDeleteListener(list) {
        AppData.deleteList(list);
        AppData.saveData();
    }
    
    //Card create, update, delete listeners
    /**
     *  Triggered when a new card is created in the UI
     *      - Creates a new card in the model
     *      - Saves the data in localStorage
     *      - Adds the new card in the board view
     */    
    function cardCreateListener(data) {
        var newCard = AppData.addCard(data["list"], data["content"]);
        BoardView.addCard(data["list"], newCard);
        AppData.saveData();
    }

    /**
     *  Triggered when the card content is changed in the UI
     *      - Updates related card model
     *      - Saves the data in localStorage
     */
    function cardUpdateListener(data) {
        AppData.setCardContent(data["card"], data["newContent"]);
    	AppData.saveData();
    }

    /**
     *  Triggered when the card is deleted in the UI
     *      - Deletes related card from the data model
     *      - Saves the data in localStorage
     */
    function cardDeleteListener(card) {
        AppData.deleteCard(card);
        AppData.saveData();
    }

    return {
        init: init
    };
});
