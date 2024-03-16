import ToDoList from "./todolist.js";
import ToDoItem from "./todoitem.js";

const toDoList = new ToDoList();

//Launch App
document.addEventListener("readystatechange", (event) => {
    if(event.target.readyState === "complete") {
        initApp();
    }
});

const initApp = () => {
    //Add listners
    const itemEntryForm = document.getElementById("itemEntryForm");
    itemEntryForm.addEventListener("submit", (event) => {
        event.preventDefault();
        processSubmission();
    }); // default behav. of submit is to reload.

    const clearItems = document.getElementById("clearItems");
    clearItems.addEventListener("click", (event) => {
        const list = toDoList.getList();
        if(list.length) {
            const confirmed = confirm("Are you sure you want to clear entire list?");
            if(confirmed) {
                toDoList.clearList();
                //TODO:-update persistent data
                updatePersistentData(toDoList);
                refreshThePage();
            }
        }
    });
        
    //Procedural
    //load list object 
    loadListObject();
    //refresh the page
    refreshThePage();
};

const loadListObject = () => {
    const storedList = localStorage.getItem("myToDoList");
    if (typeof storedList !== "string") return;
    let parsedList;
    try {
        parsedList = JSON.parse(storedList);
        console.log(typeof parsedList);
    } catch (error) {
        console.error("Error parsing stored list:", error);
        return; // Stop execution if there's an error parsing
    }

    // Check if parsedList is an object with a _list property
    if (parsedList && Array.isArray(parsedList._list)) {
        parsedList._list.forEach((itemObj) => {
            const newToDoItem = createNewItem(itemObj._id, itemObj._item);
            toDoList.addItemToList(newToDoItem);
        });
    } else {
        console.error("Parsed list does not contain a valid _list array.");
    }
};

const refreshThePage = () => {
    clearListDisplay();
    renderList(); 
    clearItemEntryField();
    setFocusOnItemEntry();
};

const clearListDisplay = () => {
    const parentElement = document.getElementById("listItems");
    deleteContents(parentElement);
};

const deleteContents = (parentElement) => {
    let child = parentElement.lastElementChild;
    while(child) {
        parentElement.removeChild(child);
        child= parentElement.lastElementChild;
    }
};

const renderList = () => {
    const list = toDoList.getList();
    list.forEach(item => {
        buildListItem(item);
    });
};

const buildListItem = (item) => {
    const div = document.createElement("div");
    div.className = "item";
    const check = document.createElement("input");
    check.type = "checkbox";
    check.id = item.getId();
    check.tabIndex = 0;
    addClickListnerToCheckbox(check);
    const label = document.createElement("label");
    label.htmlFor = item.getId();
    label.textContent = item.getItem();
    div.appendChild(check);
    div.appendChild(label);
    const container = document.getElementById("listItems");
    container.appendChild(div);
};

const addClickListnerToCheckbox = (checkbox) => {
    checkbox.addEventListener("click", (event) => {
        toDoList.removeItemFromList(checkbox.id);
        // TODO:- remove from persistent data
        updatePersistentData(toDoList);
        const removedText = getLabelText(checkbox.id);
        updateScreenReaderConfirmation(removedText, "removed from the list");
        setTimeout(() => {
            refreshThePage();
        }, 1000);
    });
};

const getLabelText = (checkboxId) => {
    return document.getElementById(checkboxId).nextElementSibling.textContent;
};

const updatePersistentData = (listArray) => {
    localStorage.setItem("myToDoList", JSON.stringify(listArray));
};

const clearItemEntryField = () => {
    document.getElementById("newItem").value = "";
};

const setFocusOnItemEntry = () => {
    document.getElementById("newItem").focus();
};

const processSubmission = () => {
    const newEntryText = getNewEntry();
    if(!newEntryText.length) return;
    const nextItemId = calcNextItemId();
    const toDoItem = createNewItem(nextItemId, newEntryText);
    toDoList.addItemToList(toDoItem);
    //TODO:- update persistent data
    updatePersistentData(toDoList);
    updateScreenReaderConfirmation(newEntryText, "added");
    refreshThePage();
};

const getNewEntry = () => {
    return document.getElementById("newItem").value.trim();
};

const calcNextItemId = () => {
    let nextItemId = 1;
    const list = toDoList.getList();
    if(list.length > 0) {
        nextItemId = list[list.length - 1].getId() + 1;
    }
    return nextItemId;
};

const createNewItem = (itemId, itemText) => {
    const toDo = new ToDoItem();
    toDo.setId(itemId);
    toDo.setItem(itemText);
    return toDo;
};

const updateScreenReaderConfirmation = (newEntryText, actionVerb) => {
    document.getElementById("confirmation").textContent = `${newEntryText} ${actionVerb}.`;
};


