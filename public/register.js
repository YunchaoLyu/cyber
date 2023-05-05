// Get the form element by its id
let registerForm = document.getElementById("registerForm");

// Attach a submit event handler to the form
registerForm.addEventListener("submit", async (event) => {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Get values from email and password input fields
  let email = document.querySelector("#email").value;
  let password = document.querySelector("#password").value;

  // Send a post request to the /api/user/register endpoint with email and password in the body
  const res = await fetch("/api/user/register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  // Read the response as JSON
  const response = await res.json();

  // If the response was not successful, log the response and display an error message
  if (!response.success) {
    console.log(response);
    document.getElementById("m").innerText = JSON.stringify(response);
  } else {
    alert("Registration Successful");

    // If the response was successful, navigate to the login page
    window.location.href = "/login.html";
  }
});
