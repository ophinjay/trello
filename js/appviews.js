"use strict";

trello.ModuleManager.define("BoardMenuView", ["Element", "DropDown", "Events"], function(Element, DropDown, Events) {

    var dropDown;

    function render(container, boards) {
        container = Element.get(container).html("");
        dropDown = DropDown.create({
            id: "boards",
            heading: "Boards",
            container: container,
            tabWidth: 55
        });

        boards.forEach(addToDropDown);

        var newBoard = dropDown.addEditableEntry("Add board");
        newBoard.on("keyup", keyUpHandler.bind(newBoard));
        return dropDown;
    }

    function menuEntryClickHandler(eventObject) {
        Events.publish("board-changed", this);
    }

    function keyUpHandler(eventObject) {
        var code = (typeof eventObject.which == "number") ? eventObject.which : eventObject.keyCode;
        if (code == 13) {
            var boardName = this.value();
            if (boardName) {
                Events.publish("board-created", boardName);
                dropDown.hide();
            }
        }
    }

    function addToDropDown(board, index) {
        dropDown.addEntry(board.title, index + 1).on("click", menuEntryClickHandler.bind(board));
    }

    function add(board) {
        addToDropDown(board, -2);
    }

    function remove(board) {
        dropDown.remove(board.index);
    }

    return {
        render: render,
        add: add,
        remove: remove
    };
});


trello.ModuleManager.define("CardView", ["Events", "Utilities"], function(Events, Utilities) {
    var template = '<div class="entry list-entry rounded"><div name="content"><div name="removecard" class="remove" title="Remove card">x</div><pre class="content">{content}</pre></div></div>';
    var updateCardTemplate = '<div><textarea class="newcard rounded"></textarea><div><button name="save" class="button rounded">Save</button><button name="cancel" class="button rounded">Cancel</button></div></div>';

    function CardView(container, card) {
        this.container = container;
        this.card = card;
        this.mouseDownHandler = mouseDownHandler.bind(this);
        this.editCardHandler = editCardHandler.bind(this);
    }

    function mouseDownHandler(eventObject) {
        eventObject.preventDefault();
    }

    function editCardHandler(eventObject) {
        this.cardElmt.off("dblclick", this.editCardHandler);
        this.editField = Utilities.getLoadedHTML(updateCardTemplate).appendTo(this.cardElmt);
        this.cardElmt.get("[name=content]").addClass("hide");
        var textarea = this.cardElmt.get("textarea");
        textarea.value(this.card.content);
        this.cardElmt.get("[name=cancel]").on("click", cancelHandler.bind(this));
        this.cardElmt.get("[name=save]").on("click", saveHandler.bind(this, textarea));
        this.cardElmt.off("mousedown", this.mouseDownHandler);
    }

    function saveHandler(textarea) {
        var newContent = textarea.value();
        Events.publish("card-updated", {
            card: this.card,
            newContent: newContent
        });
        hideEdit.call(this);
        this.cardElmt.get("[name=content]>pre").html(newContent);
    }

    function cancelHandler() {
        hideEdit.call(this);
    }

    function hideEdit() {
        this.editField.remove();
        this.cardElmt.on("mousedown", this.mouseDownHandler);
        this.cardElmt.get("[name=content]").removeClass("hide");
        this.cardElmt.on("dblclick", this.editCardHandler);
    }

    CardView.prototype = (function() {
        function render(position) {
            this.cardElmt = Utilities.getLoadedHTML(template.replace(/\{content\}/, this.card.content));
            if (position) {
                this.cardElmt.insertAt(this.container, position);
            } else {
                this.container.appendTo(this.cardElmt);
            }
            this.cardElmt.get("[name = removecard]").on("click", removeCardHandler.bind(this));
            this.cardElmt.on("dblclick", this.editCardHandler);
            this.cardElmt.on("mousedown", this.mouseDownHandler);
        }

        function removeCardHandler() {
            this.remove();
            Events.publish("card-deleted", this.card);
        }

        function remove() {
            this.cardElmt.remove();
        }

        return {
            render: render,
            remove: remove
        }
    })();

    function create(container, card, position) {
        var cardView = new CardView(container, card);
        cardView.render(position);
        return cardView;
    }

    return {
        create: create
    }
});

trello.ModuleManager.define("ListView", ["Element", "Events", "CardView", "Utilities"], function(Element, Events, CardView, Utilities) {
    var listTemplate = '<div class="list rounded"><div name="header" class="rounded-top"><div name="title">{title}</div><input type="text" class="left hide" name="edit"><div name="actions"><div name="addcard" title="Add card">+</div><div name="removelist" title="Remove list">x</div></div></div><div name="content" class="rounded-bottom"><div class="entry list-entry rounded hide" name="newcard"><textarea class="newcard rounded"></textarea><div><button name="add" class="button rounded">Add</button><button name="cancel" class="button rounded">Cancel</button></div></div></div></div>';

    function ListView(container, list, index) {
        this.container = container;
        this.list = list;
        this.clickoutHandler = clickoutHandler.bind(this, "outside-clicked");
    }

    function clickoutHandler(clickLocation, eventObject) {
        if (clickLocation == "outside-clicked") {
            this.editField.value(this.list.title);
            hideEdit.call(this);
        } else {
            Utilities.stopPropagation(eventObject);
        }
    }

    function hideEdit() {
        this.title.removeClass("hide");
        this.editField.addClass("hide");
    }

    ListView.prototype = (function() {
        function render() {
            this.listView = createList(this.list, this.container);
            this.listView.get("[name=removelist]").on("click", removeListHandler.bind(this));
            this.listView.get("[name=addcard]").on("click", newCardHandler.bind(this));
            this.newCard = this.listView.get("[name=newcard]");
            this.newCard.get("button[name=add]").on("click", addBtnHandler.bind(this));
            this.newCard.get("button[name=cancel]").on("click", cancelBtnHandler.bind(this));
            this.title = this.listView.get("[name=title]").on("dblclick", editTitleHandler.bind(this));
            this.editField = this.listView.get("[name=edit]");
            this.editField.on("click", clickoutHandler.bind(this, "field-clicked"));
            this.editField.on("keyup", editKeyUpHandler.bind(this, this.editField)).value(this.list.title);
            this.cardContainer = this.listView.get("[name = content]");
            for (var j = 0; j < this.list.cards.length; j++) {
                this.addCard(this.list.cards[j]);
            }
        }

        function removeListHandler() {
            this.remove();
            Events.publish("list-deleted", this.list);
        }

        function remove() {
            this.listView.remove();
        }

        function createList(list, container) {
            var listElmt = Utilities.getLoadedHTML(listTemplate.replace(/\{title\}/, list.title)).appendTo(container);
            return listElmt;
        }

        function editTitleHandler() {
            this.editField.removeClass("hide");
            this.title.addClass("hide");
            Element.get(document.body).on("click", this.clickoutHandler);
        }

        function editKeyUpHandler(editField, eventObject) {
            var code = (typeof eventObject.which == "number") ? eventObject.which : eventObject.keyCode;
            if (code == 13) {
                var listTitle = editField.value();
                if (listTitle) {
                    Events.publish("list-updated", {
                        list: this.list,
                        newTitle: listTitle
                    });
                    this.title.html(listTitle);
                    hideEdit.call(this);
                }
                Element.get(document.body).off("click", this.clickoutHandler);
            }
        }

        function newCardHandler() {
            this.newCard.removeClass("hide");
        }

        function addBtnHandler() {
            var text = this.newCard.get("textarea").value();
            Events.publish("card-created", {
                "list": this.list,
                "content": text
            });
            hideNewCard.call(this);
        }

        function hideNewCard() {
            this.newCard.addClass("hide").get("textarea").value("");
        }

        function cancelBtnHandler() {
            hideNewCard.call(this);
        }

        function addCard(card) {
            CardView.create(this.cardContainer, card, -1);
        }

        return {
            render: render,
            addCard: addCard,
            remove: remove
        }
    })();

    function create(container, list) {
        var list = new ListView(container, list);
        list.render();
        return list;
    }

    return {
        create: create
    };
});

trello.ModuleManager.define("BoardView", ["Element", "ListView", "Events", "Utilities"], function(Element, ListView, Events, Utilities) {
    var listViews;
    var template = '<div class="boardheader rounded" name="boardheading"><div name="title" class="boardtitle">{title}</div><input type="text" name="edit" class="hide"><button name="add" class="button remboard rounded">Add List</button><button name="remove" class="button remboard rounded">Delete Board</button></div><div name="lists"></div>';
    var currentBoard;
    var boardContainer;
    var editField;
    var bodyClickHandler = clickoutHandler.bind(null, "outside-clicked");
    var title;
    var listContainer;

    function render(container, board) {
        if (!board) {
            return;
        }
        listViews = [];
        currentBoard = board;
        boardContainer = Element.get(container);
        container = boardContainer.html(template.replace(/\{title\}/, board.title));
        editField = container.get("input[name=edit]").value(board.title).on("click", clickoutHandler.bind(null, "field-clicked")).on("keyup", editKeyUpHandler);
        container.get("[name=add]").on("click", addListHandler);
        container.get("button[name=remove]").on("click", deleteBoardHandler);
        title = container.get("[name=title]").on("dblclick", editBoardHandler);
        listContainer = container.get("[name=lists]");
        var lists = board.lists;
        for (var i = 0; i < lists.length; i++) {
            listViews[i] = ListView.create(listContainer, lists[i]);
        }
    }

    function deleteBoardHandler() {
        Events.publish("board-deleted", currentBoard);
        boardContainer.html("");
    }

    function clickoutHandler(clickLocation, eventObject) {
        if (clickLocation == "outside-clicked") {
            editField.value(currentBoard.title);
            hideEdit();
        } else {
            Utilities.stopPropagation(eventObject);
        }
    }

    function hideEdit() {
        editField.addClass("hide");
        title.removeClass("hide");
        Element.get(document.body).off("click", bodyClickHandler);
    }

    function editBoardHandler() {
        editField.removeClass("hide");
        title.addClass("hide");
        Element.get(document.body).on("click", bodyClickHandler);
    }

    function editKeyUpHandler(eventObject) {
        var code = (typeof eventObject.which == "number") ? eventObject.which : eventObject.keyCode;
        if (code == 13) {
            var boardTitle = editField.value();
            if (boardTitle) {
                Events.publish("board-updated", {
                    board: currentBoard,
                    newTitle: boardTitle
                });
                title.html(boardTitle);
                hideEdit();
            }
        }
    }

    function addListHandler() {
        Events.publish("list-created", currentBoard);
    }

    function addCard(list, card) {
        listViews[list.index].addCard(card);
    }

    function addList(list) {
        listViews.push(ListView.create(listContainer, list));
    }

    return {
        render: render,
        addCard: addCard,
        addList: addList
    };
});
