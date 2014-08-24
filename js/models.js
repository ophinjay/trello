'use strict';

trello.ModuleManager.define("Card", ["Utilities"], function(Utilities) {
    function Card(inputObj) {
        this.content = inputObj.content;
        this.list = inputObj.list;
        this.board = inputObj.board;
        this.index = inputObj.index;
        Utilities.createReadOnlyProperty(this, "type", "card");
    }

    return {
        create: function(inputObj) {
            return new Card(inputObj);
        }
    };
});

trello.ModuleManager.define("List", ["Card", "Utilities"], function(Card, Utilities) {
    function List(inputObj) {
        this.title = inputObj.title;
        this.board = inputObj.board;
        this.index = inputObj.index;
        Utilities.createReadOnlyProperty(this, "type", "list");
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

    List.prototype = (function() {
        function addCard(card) {
            var index = this.cards.push(card) - 1;
            card.index = index;
        }

        function deleteCard(card) {
            Utilities.spliceAndUpdateIndex(this.cards, card.index);
        }

        return {
            addCard: addCard,
            deleteCard: deleteCard
        };
    })();

    return {
        create: function(inputObj) {
            return new List(inputObj);
        }
    };
});

trello.ModuleManager.define("Board", ["List", "Utilities"], function(List, Utilities) {
    function Board(inputObj) {
        this.title = inputObj.title;
        this.index = inputObj.index;
        Utilities.createReadOnlyProperty(this, "type", "board");
        this.lists = [];
        if (inputObj.lists) {
            this.lists = inputObj.lists.map(function(list, index) {
                list.board = this;
                list.index = index;
                return List.create(list);
            }, this);
        }
    }

    Board.prototype = (function() {
        function addList(list) {
            var index = this.lists.push(list) - 1;
            list.index = index;
        }

        function deleteList(list) {
            Utilities.spliceAndUpdateIndex(this.lists, list.index);
        }

        return {
            addList: addList,
            deleteList: deleteList
        };

    })();

    return {
        create: function(inputObj) {
            return new Board(inputObj);
        }
    };
});

trello.ModuleManager.define("AppData", ["Board", "Utilities", "Card", "List"], function(Board, Utilities, Card, List) {

    var boards = [];

    function getData() {
        //var data = JSON.parse(localStorage["trello"]);
        var datas = trello.data;
        if (datas) {
            datas.forEach(function(data, index) {
                data.index = index;
                boards.push(Board.create(data));
            });
        }
        return boards;
    }

    function saveData() {
        var dataStr = JSON.stringify(boards, ["title", "lists", "cards", "content"]);
        localStorage["trello"] = dataStr;
        console.log(dataStr);
    }

    function addBoard(boardName) {
        var newBoard = Board.create({
            "title": boardName,
            "index": boards.length
        });
        boards.push(newBoard);
        return newBoard;
    }

    function deleteCard(card) {
        card.list.deleteCard(card);
    }

    function deleteList(list) {
        list.board.deleteList(list);
    }

    function addCard(list, content) {
        var newCard = Card.create({
            content: content,
            list: list,
            board: list.board
        });
        list.addCard(newCard);
        return newCard;
    }

    function deleteBoard(board) {
        boards.splice(board.index, 1);
    }

    function addList(board, title) {
        var newList = List.create({
            title: title,
            board: board
        });
        board.addList(newList);
        return newList;
    }

    return {
        getData: getData,
        saveData: saveData,
        addBoard: addBoard,
        deleteCard: deleteCard,
        deleteList: deleteList,
        addCard: addCard,
        addList: addList,
        deleteBoard: deleteBoard
    }
});
