const login =
      '<button id="logout">Logout</button><input type="text" id="add-item" /> <p id="email"> ';
    const logout =
      '<a href="/register.html">Register</a> <a href="/login.html">Login</a>';

// Get the div element
      const div= document.getElementById("div");

// Check if the user has a valid token stored in local storage
      const token = localStorage.getItem("auth_token");
      if (!token) {

// If the user doesn't have a token, display the "register" and "login" links
        // div.innerHTML = logout;
      }else{

// If the user has a token, display the "logout" button and "add-item" input field
        div.innerHTML = login;

// Use an async function to send a post request to the "/api/private" endpoint
// with the token as the authorization header
        ((async() => {
            const aaa = await fetch('/api/private', {
              method: 'POST',
              headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,
              },
              body: JSON.stringify({
                token: token
              })
            })

// Get the JSON response and update the email field with the email from the response
            const res = await aaa.json()
            console.log(res)
            document.getElementById('email').innerText = res.email 

// Clear the existing items and add a new item to the list with the item from the response
            document.getElementById('items').innerHTML = ''
                let todo = document.createElement('li')
                todo.innerText = res.items
                document.getElementById('items').appendChild(todo)
          })())

// Add an onclick event to the "logout" button to remove the token from local storage and redirect to the homepage
          document.getElementById('logout').onclick = () => {
            localStorage.removeItem('auth_token')
            let a = document.createElement("a");
            a.setAttribute("href", "/");
            a.click();
          }

// Add an event listener to the "add-item" input field to send a post request to the "/api/todos" endpoint
// when the user presses "enter" and add the new item to the list
          document.getElementById('add-item').addEventListener("keyup", async (event) => {
            if (event.key === "Enter") {
              const pro = await fetch("/api/todos", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + token,
                },
                body: JSON.stringify({
                  items: document.getElementById("add-item").value,
                }),
              });
              
              const res = await pro.json();
              document.getElementById('items').innerHTML = ''
                let todo = document.createElement('li')
                todo.innerText = res.items
                document.getElementById('items').appendChild(todo)
              
            }
          });
      }