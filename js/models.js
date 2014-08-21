'use strict';

trello.ModuleManager.define("Card", ["Utilities"], function(Utilities) {
    function Card(inputObj) {
        this.title = inputObj.title;
        this.list = inputObj.list;
        this.board = inputObj.board;
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
        Utilities.createReadOnlyProperty(this, "type", "list");
        this.cards = [];
        if (inputObj.cards) {
            this.cards = inputObj.cards.map(function(card) {
                card.list = this;
                card.board = this.board;
                return Card.create(card);
            }, this);
        }
    }

    List.prototype = (function() {
        function addCard(card) {
            this.cards.push(card);
        }

        function deleteCard(index) {
            this.cards.splice(index, 1);
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
        Utilities.createReadOnlyProperty(this, "type", "board");
        this.lists = [];
        if (inputObj.lists) {
            this.lists = inputObj.lists.map(function(list) {
                list.board = this;
                return List.create(list);
            }, this);
        }
    }

    Board.prototype = (function() {
        function addList(list) {
            this.lists.push(list);
        }

        function deleteList(index) {
            this.lists.splice(index, 1);
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
