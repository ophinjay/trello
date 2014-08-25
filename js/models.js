'use strict';

/*****************************************************************************************/
/*  Modules defined in this library are used to store and manipulate application data    */
/*****************************************************************************************/

/**
 *  Card module that creates instances of Card class
 *  ** Dependencies **
 *   - Utilities
 */
trello.ModuleManager.define("Card", ["Utilities"], function(Utilities) {

    /**
     *  ** Card class **
     *  Instances of this class act as the data model for storing and manipulating card information.
     *  ** Attributes **
     *      - content: contains the content of the card
     *      - list: reference to the list object in which the card is contained
     *      - board: reference to the board object in which the card is contained
     *      - index: zero based index of the card position in the list
     */
    function Card(inputObj) {
        this.content = inputObj.content;
        this.list = inputObj.list;
        this.board = inputObj.board;
        this.index = inputObj.index;
    }

    // Card prototype defines a read only property 'type' that can be used to identify the type of the model class
    Utilities.createReadOnlyProperty(Card.prototype, "type", "card");

    return {
        /**
         *  Creates and returns an instance of the Card class
         */
        create: function(inputObj) {
            return new Card(inputObj);
        }
    };
});

/**
 *  List module that creates instances of List class
 *  ** Dependencies **
 *   - Card
 *   - Utilities
 */
trello.ModuleManager.define("List", ["Card", "Utilities"], function(Card, Utilities) {
    /**
     *  ** Card class **
     *  Instances of this class act as the data model for storing and manipulating list information.
     *  ** Attributes **
     *      - title: contains the title of the list
     *      - cards: array of cards in the list, stored as instances of Card class
     *      - board: reference to the board object in which the card is contained
     *      - index: zero based index of the list position in the board
     */
    function List(inputObj) {
        this.title = inputObj.title;
        this.board = inputObj.board;
        this.index = inputObj.index;
        this.cards = [];
        if (inputObj.cards) {
            this.cards = inputObj.cards.map(function(card, index) {
                card.list = this;
                card.board = this.board;
                card.index = index;
                return Card.create(card);
            }, this);
        }
    }

    //prototype definition for List class
    List.prototype = (function() {

        /**
         *  Adds a new card to the list
         *  ** Inputs **
         *  card - new card to be inserted into the list as an instance of the Card class
         */
        function addCard(card) {
            var index = this.cards.push(card) - 1;
            card.index = index;
        }

        /**
         *  Deletes a card from the list. This method removes the provided card from the list and
         *  decrements the index of every subsequent card in the list.
         *  ** Inputs **
         *  card - card to be deleted as an instance of the Card class
         */
        function deleteCard(card) {
            Utilities.spliceAndUpdateIndex(this.cards, card.index);
        }

        return {
            addCard: addCard,
            deleteCard: deleteCard
        };
    })();

    // List prototype defines a read only property 'type' that can be used to identify the type of the model class
    Utilities.createReadOnlyProperty(List.prototype, "type", "list");

    return {
        /**
         *  Creates and returns an instance of the List class
         */
        create: function(inputObj) {
            return new List(inputObj);
        }
    };
});

/**
 *  Board module that creates instances of Board class
 *  ** Dependencies **
 *   - List
 *   - Utilities
 */
trello.ModuleManager.define("Board", ["List", "Utilities"], function(List, Utilities) {
    /**
     *  ** Board class **
     *  Instances of this class act as the data model for storing and manipulating board information.
     *  ** Attributes **
     *      - title: contains the title of the board
     *      - lists: array of lists in the board, stored as instances of List class
     *      - index: zero based index of the board position in the array of boards
     */
    function Board(inputObj) {
        this.title = inputObj.title;
        this.index = inputObj.index;
        this.lists = [];
        if (inputObj.lists) {
            this.lists = inputObj.lists.map(function(list, index) {
                list.board = this;
                list.index = index;
                return List.create(list);
            }, this);
        }
    }

    //prototype definition for Board class
    Board.prototype = (function() {

        /**
         *  Adds a new list to the board
         *  ** Inputs **
         *  list - new list to be inserted into the board as an instance of the List class
         */
        function addList(list) {
            var index = this.lists.push(list) - 1;
            list.index = index;
        }

        /**
         *  Deletes a list from the board. This method removes the provided list from the board and
         *  decrements the index of every subsequent list in the board.
         *  ** Inputs **
         *  list - list to be deleted as an instance of the List class
         */
        function deleteList(list) {
            Utilities.spliceAndUpdateIndex(this.lists, list.index);
        }

        return {
            addList: addList,
            deleteList: deleteList
        };

    })();

    // Board prototype defines a read only property 'type' that can be used to identify the type of the model class
    Utilities.createReadOnlyProperty(Board.prototype, "type", "board");

    return {
        /**
         *  Creates and returns an instance of the Board class
         */
        create: function(inputObj) {
            return new Board(inputObj);
        }
    };
});

/**
 *  AppData module that provides a common interface for the controller to interact with the data. The controller need not
 *  know about the existence of the Board, Card or List classes. The AppData module is an abstraction over them, that
 *  provides the controller with an interface to do every data related operation in the application
 *  ** Dependencies **
 *   - Board
 *   - Card
 *   - List
 *   - Utilities
 */
trello.ModuleManager.define("AppData", ["Board", "Card", "List", "Utilities"], function(Board, Card, List, Utilities) {

    var boards = [];

    //Fetches data from localStorage, which is an array of boards, and returns an array of Board instances
    function getData() {
        if (localStorage["trello"]) {
            var datas = JSON.parse(localStorage["trello"]);
            if (datas) {
                datas.forEach(function(data, index) {
                    data.index = index;
                    boards.push(Board.create(data));
                });
            }
        }
        return boards;
    }

    //Serializes the array of Board instances and stores it in localStorage
    function saveData() {
        var dataStr = JSON.stringify(boards, ["title", "lists", "cards", "content"]);
        localStorage["trello"] = dataStr;
        console.log(dataStr);
    }

    //Creates a new Board class instance with the given board name and adds it to the boards array
    function addBoard(boardName) {
        var newBoard = Board.create({
            "title": boardName,
            "index": boards.length
        });
        boards.push(newBoard);
        return newBoard;
    }

    //Adds a new list to the board
    function addList(board, title) {
        var newList = List.create({
            title: title,
            board: board
        });
        board.addList(newList);
        return newList;
    }

    //Adds a new card to a list
    function addCard(list, content) {
        var newCard = Card.create({
            content: content,
            list: list,
            board: list.board
        });
        list.addCard(newCard);
        return newCard;
    }

    //Updates the title of the board
    function setBoardTitle(board, title) {
        board.title = title;
    }

    //Updates the title of the list
    function setListTitle(list, title) {
        list.title = title;
    }

    //Updates the content of the card
    function setCardContent(card, content) {
        card.content = content;
    }

    //Deletes a board from the application
    function deleteBoard(board) {
        Utilities.spliceAndUpdateIndex(boards, board.index);
    }

    //Deletes a list from its board
    function deleteList(list) {
        list.board.deleteList(list);
    }

    //Deletes a card from its list
    function deleteCard(card) {
        card.list.deleteCard(card);
    }

    return {
        getData: getData,
        saveData: saveData,
        addBoard: addBoard,
        addList: addList,
        addCard: addCard,
        setBoardTitle: setBoardTitle,
        setListTitle: setListTitle,
        setCardContent: setCardContent,        
        deleteBoard: deleteBoard,
        deleteList: deleteList,
        deleteCard: deleteCard
    };
});
