// Get the form element by its id
let loginForm = document.getElementById("loginForm");

// Attach a submit event handler to the form
loginForm.addEventListener("submit", async (event) => {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Get the values of the email and password fields
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  // Send a POST request to the /api/user/login endpoint with the email and password values
  const pro = await fetch("/api/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  // Get the JSON response from the server
  const promise = await pro.json();

  // Log the response in the console
  console.log(promise);

  // Check if the login was successful
  if (!promise.success) {
      console.log(promise);
      alert("Please enter correct username password")
    document.getElementById("m").innerText = "Invalid credentials";
    return;
  }

  localStorage.setItem("auth_token", promise.token);
  alert("You are authenticated, Welcome " + email);

  // Redirect the user to the home page
  window.location.href = "/";
});
