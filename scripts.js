"use strict"

// constant variables for jsonbin.io API
const JSONBIN_API_KEY = JSONBIN_CODES.API_KEY;
const JSONBIN_BIN_ID = JSONBIN_CODES.BIN_ID;

let todoList = []; //declares a new array for Your todo list
let isFilterActive = false;
let filteredList = [];


// loads todolist from local browser cache - not used anymore(data is loaded from jsonbin.io)
let initList = function() {

    //reading list values from browser cache(if any of them exists)
    let savedList = window.localStorage.getItem("todos");
    if (savedList != null) {
        todoList = JSON.parse(savedList);
    } else {
        todoList.push(
            {
                title: "Learn JS",
                description: "Create a demo application for my TODO's",
                place: "445",
                category: '',
                dueDate: new Date(2024,10,16)
            },
            {
                title: "Lecture test",
                description: "Quick test from the first three lectures",
                place: "F6",
                category: '',
                dueDate: new Date(2024,10,17)
            }
            // of course the lecture test mentioned above will not take place
        );
    }
}

//initList();



// jsonbinio API - getting data from external api

let req = new XMLHttpRequest();

req.onreadystatechange = () => {
  if (req.readyState == XMLHttpRequest.DONE) {
    let resp = req.responseText;

    if (resp != null) {

        // parsing data - getting record value, which are all todoList items in JSON format
        let loadedTodos = JSON.parse(resp).record;

        // iterating on every item and creating toDoList from received data
        for (let t in loadedTodos) {
            console.log(loadedTodos[t]);
            todoList.push(loadedTodos[t]);
        }
    }
  }
};


// Connection initialization, keys specification(jsonbin.io API)
req.open("GET", "https://api.jsonbin.io/v3/b/".concat(JSONBIN_BIN_ID), true);
req.setRequestHeader("X-Master-Key", JSONBIN_API_KEY);
req.send();



// jsonbinio API - updating data on external data source
let updateJSONBin = function() {
    let req = new XMLHttpRequest();

    req.onreadystatechange = () => {
        if (req.readyState == XMLHttpRequest.DONE) {
            console.log(req.responseText);
        }
    };

    // PUT request - updates data on remote data source(jsonbinio)
    // ALL DATA WILL BE OVERWRITTEN DURING THIS OPERATION, SO ALL ITEMS FROM TODOLIST WILL BE SEND TO THE JSONBINIO
    req.open("PUT", "https://api.jsonbin.io/v3/b/".concat(JSONBIN_BIN_ID), true);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("X-Master-Key", JSONBIN_API_KEY);


    console.log(JSON.stringify(todoList));

    //converting todoList to JSON and sending it to remote data source
    req.send(JSON.stringify(todoList));
}


// update toDoList 
let updateTodoList = function(list = todoList) {
    if (isFilterActive) {
        list = filteredList;
    }

    if (list != null) {
        let todoListDiv =
            document.getElementById("todoListView");

        //remove all elements
        while (todoListDiv.firstChild) {
            todoListDiv.removeChild(todoListDiv.firstChild);
        }

        //add all elements and filter user input

        let filterInput = document.getElementById("inputSearch");
        
        let newTable = document.createElement("table");

        let colmunNumber = Object.values(list[0]).length;
        let deleteColumn = 1;

        // table headers
        let header = document.createElement("tr");
        let titleValues = ["Category", "Description", "Due date", "Place", "Title", "Delete"];

        for (let column = 0; column < colmunNumber + deleteColumn; column++) {
            let currTh = document.createElement("th");
            let currText = document.createTextNode(titleValues[column]);
            currTh.appendChild(currText);
            header.appendChild(currTh);
        }

        newTable.appendChild(header)

        for (let todo in list) {

            // filtering user input using search text field
            // textfield empty - show all items
            // when user starts typing letters, filters will apply and output will become filtered

            let currTodoItem = list[todo];
            if ((filterInput.value == "")
                || (currTodoItem.title.includes(filterInput.value))
                || (currTodoItem.description.includes(filterInput.value))) 
                {
                    let newDeleteButton = document.createElement("input");
                    newDeleteButton.type = "button";
                    newDeleteButton.value = "X";
                    newDeleteButton.addEventListener("click", 
                        function() {
                            deleteTodo(todo);
                        }
                    )
                    // row
                    let trElement = document.createElement("tr");
                    let textValues = [currTodoItem.category, currTodoItem.description, new Date(currTodoItem.dueDate).toLocaleDateString("en-US"), currTodoItem.place, currTodoItem.title]

                    // columns - adding 5 columns from todoList
                    
                    for (let column = 0; column < colmunNumber; column++) {
                        let currTd = document.createElement("td");
                        let currText = document.createTextNode(textValues[column]);
                        currTd.appendChild(currText);
                        trElement.appendChild(currTd);
                    }

                    // Adding last column with delete button
                    trElement.appendChild(document.createElement("td")).appendChild(newDeleteButton);
                    
                    //adding row to the table
                    newTable.appendChild(trElement);

            }
        }
        //adding final table to the div
        todoListDiv.appendChild(newTable);
    }
}


// deleteTodo function - deletes specified item from toDoList and updates remote jsonbin data source
let deleteTodo = function(index) {
    todoList.splice(index, 1);
    updateJSONBin();
}


// function for adding item to todoList - adds item locally and updates item on remote data source(jsonbin)
let addTodo = function () {
    let inputTitle = document.getElementById("inputTitle");
    let inputDesc = document.getElementById("inputDesc");
    let inputPlace = document.getElementById("inputPlace");
    let inputDate = document.getElementById("inputDate");

    let newTitle = inputTitle.value;
    let newDesc = inputDesc.value;
    let newPlace = inputPlace.value;
    let newDate = new Date(inputDate.value);

    let newTodo = {
        title: newTitle,
        description: newDesc,
        place: newPlace,
        category: '',
        dueDate: newDate
    };

    //updating local toDoList
    todoList.push(newTodo);

    // updating remote jsonbinio data
    updateJSONBin();

    // adding todolist to browser cache - not used anymore
    window.localStorage.setItem("todos", JSON.stringify(todoList));

}

let filterByDate = function() {
    let startDate = new Date(document.getElementById("startDate").value);
    let endDate = new Date(document.getElementById("endDate").value);


    if (startDate != null || endDate != null) {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        filteredList = todoList.filter(todo => {
            let dueDate = new Date(todo.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate >= startDate && dueDate <= endDate;
        });

        isFilterActive = true;
        updateTodoList();
    }

}

let resetFilter = function() {
    isFilterActive = false;
    updateTodoList();
}

// updating list every one second
setInterval(updateTodoList, 1000);