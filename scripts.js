"use strict"
let todoList = []; //declares a new array for Your todo list

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

initList();

let updateTodoList = function() {
    let todoListDiv =
        document.getElementById("todoListView");

    //remove all elements
    while (todoListDiv.firstChild) {
        todoListDiv.removeChild(todoListDiv.firstChild);
    }

    //add all elements and filter user input

    let filterInput = document.getElementById("inputSearch");
    

    for (let todo in todoList) {

        // filtering user input using search text field
        if ((filterInput.value == "")
            || (todoList[todo].title.includes(filterInput.value))
            || (todoList[todo].description.includes(filterInput.value))) 
            {
                let newDeleteButton = document.createElement("input");
                newDeleteButton.type = "button";
                newDeleteButton.value = "X";
                newDeleteButton.addEventListener("click", 
                    function() {
                        deleteTodo(todo);
                    }
                )
                let newElement = document.createElement("div");
                let newContent = document.createTextNode(
                    todoList[todo].title + " " + todoList[todo].description);
                newElement.appendChild(newContent);
                newElement.appendChild(newDeleteButton);
                todoListDiv.appendChild(newElement);
        }
    }
}


let deleteTodo = function(index) {
    todoList.splice(index, 1);
}



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

    todoList.push(newTodo);

    // adding todolist to browser cache
    window.localStorage.setItem("todos", JSON.stringify(todoList));

}

setInterval(updateTodoList, 1000);