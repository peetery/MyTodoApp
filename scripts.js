"use strict"

// constant variables for jsonbin.io API
const JSONBIN_API_KEY = JSONBIN_CODES.API_KEY;
const JSONBIN_BIN_ID = JSONBIN_CODES.BIN_ID;
const GROQ_API_KEY = JSONBIN_CODES.GROQ_API_KEY;

console.log(JSONBIN_BIN_ID);

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




/* groqRequest.onreadystatechange = function() {
    if(groqRequest.readyState == XMLHttpRequest.DONE) {
        let groqResponse = groqRequest.responseText;
        if(groqResponse != null) {
            console.log("groq message:")
            let currResponse = JSON.parse(groqResponse);
            let currCategory = currResponse.choices[0].message.content;
            console.log(currCategory);
        }
    }
} */

let sendGroqRequest = function(description) {
    return new Promise(function (resolve, reject) {
            let groqRequest = new XMLHttpRequest();
            groqRequest.open("POST", "https://api.groq.com/openai/v1/chat/completions", true);
            groqRequest.setRequestHeader("Authorization", "Bearer ".concat(GROQ_API_KEY));
            groqRequest.setRequestHeader("Content-Type", "application/json");
            let requestData = 
            {
                "messages": [
                {
                    "role": "user",
                    "content": "You have to specify correct category to given desctiption - an item from todolist. Specify only one category. Return plain text - created category. Item description: " + description + ". Return only single phrase - category. Do not return anything else. Return category in the same language as provided description"
                }
                ],
                "model": "llama3-70b-8192"
            }
            groqRequest.send(JSON.stringify(requestData));

            groqRequest.onreadystatechange = () => {
                if(groqRequest.readyState == XMLHttpRequest.DONE) {
                    let groqResponse = groqRequest.responseText;
                    if(groqResponse != null) {
                        console.log("groq message:")
                        let currResponse = JSON.parse(groqResponse);
                        let currCategory = currResponse.choices[0].message.content;
                        console.log(currCategory);
                        resolve(currCategory);
                        console.log("Category: " + currCategory);
                } else {
                    reject(groqRequest.status);
                }
            }
        }
    });
};





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

// updateTodoList function - updates todoList view in browser
let updateTodoList = function(list = todoList) {
    if (isFilterActive) {
        list = filteredList;
    }

    if (list != null) {
        let todoListDiv = document.getElementById("todoListView");

        while (todoListDiv.firstChild) {
            todoListDiv.removeChild(todoListDiv.firstChild);
        }

        let filterInput = document.getElementById("inputSearch");
        let newTable = document.createElement("table");
        newTable.className = "table table-striped";

        let columnNumber = Object.values(list[0]).length;
        let deleteColumn = 1;

        let header = document.createElement("tr");
        let titleValues = ["Title", "Description", "Place", "Due date", "Category", "Delete"];

        for (let column = 0; column < columnNumber + deleteColumn; column++) {
            let currTh = document.createElement("th");
            let currText = document.createTextNode(titleValues[column]);
            currTh.appendChild(currText);
            header.appendChild(currTh);
        }

        newTable.appendChild(header);

        for (let todo in list) {
            let currTodoItem = list[todo];
            if ((filterInput.value === "")
                || (currTodoItem.title.includes(filterInput.value))
                || (currTodoItem.description.includes(filterInput.value))) {

                let newDeleteButton = document.createElement("input");
                newDeleteButton.type = "button";
                newDeleteButton.value = "X";
                newDeleteButton.className = "btn btn-danger";
                newDeleteButton.addEventListener("click",
                    function() {
                        deleteTodo(todo);
                    }
                );

                let trElement = document.createElement("tr");
                let textValues = [
                    currTodoItem.title,
                    currTodoItem.description,
                    currTodoItem.place,
                    new Date(currTodoItem.dueDate).toLocaleDateString("pl-PL"),
                    currTodoItem.category,
                ];

                for (let column = 0; column < columnNumber; column++) {
                    let currTd = document.createElement("td");
                    let currText = document.createTextNode(textValues[column]);
                    currTd.appendChild(currText);
                    trElement.appendChild(currTd);
                }

                let deleteTd = document.createElement("td");
                deleteTd.appendChild(newDeleteButton);
                deleteTd.style.textAlign = "center";
                trElement.appendChild(deleteTd);

                // Adding row to the table
                newTable.appendChild(trElement);
            }
        }
        todoListDiv.appendChild(newTable);
    }
}


// deleteTodo function - deletes specified item from toDoList and updates remote jsonbin data source
let deleteTodo = function(index) {
    todoList.splice(index, 1);
    updateJSONBin();
}


async function createCategory(description) {
    try {
        let createdCategory = await(sendGroqRequest(description));
        console.log("Created category: " + createdCategory);
        
    } catch(error) {
        console.log("Error while creating the category: " + error);
    }
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

    console.log("newCategory: " + newCategory);

    let newTodo = {
        title: newTitle,
        description: newDesc,
        place: newPlace,
        category: "Generating...",
        dueDate: newDate
    };

    //updating local toDoList
    todoList.push(newTodo);

    // updating remote jsonbinio data
    updateJSONBin();

    // adding todolist to browser cache - not used anymore
    window.localStorage.setItem("todos", JSON.stringify(todoList));

}

// filterByDate function - filters todoList by date range
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

// reset filter function - resets filter and updates todoList
let resetFilter = function() {
    isFilterActive = false;
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";
    updateTodoList();
}

// updating list every one second
setInterval(updateTodoList, 1000);