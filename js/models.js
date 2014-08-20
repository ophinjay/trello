'use strict';

trello.ModuleManager.define("Card", ["Utilities"], function(Utilities) {
    function Card(inputObj) {
        this.title = inputObj.title;
        this.list = inputObj.list;
        this.board = inputObj.board;
        this.lastModified = inputObj.lastModified;
        Utilities.createReadOnlyProperty(this, "type", "card");
        this.cards = [];
    }

    Card.prototype = (function() {
        function setDescription(description) {
            this.description = description;
        }

        return {
            setDescription: setDescription
        };
    })();

    function create(inputObj) {
        return new Card(inputObj);
    }

    return {
        create: create
    };
});

trello.ModuleManager.define("List", ["Card", "Utilities"], function(Card, Utilities) {
    function List(inputObj) {
        this.title = inputObj.title;
        this.board = inputObj.board;
        this.lastModified = inputObj.lastModified;
        Utilities.createReadOnlyProperty(this, "type", "list");
        this.cards = [];
        if(inputObj.cards) {
            this.cards = inputObj.cards.map(function(card) {
                card.list = this;
                card.board = this.board;
                return Card.create(card);
            });
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

    function create(inputObj) {
        return new List(inputObj);
    }

    return {
        create: create
    };
});

trello.ModuleManager.define("Board", ["List", "Utilities"], function(List, Utilities) {
    function Board(inputObj) {
        this.title = inputObj.title;
        this.lastModified = inputObj.lastModified;
        Utilities.createReadOnlyProperty(this, "type", "board");
        this.lists = [];
        if(inpuObj.lists) {
            this.lists = inputObj.lists.map(function(list) {
                list.board = this;
                return List.create(list);
            });
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

    function create(inputObj) {
        return new Board(inputObj);
    }

    return {
        create: create
    };
});