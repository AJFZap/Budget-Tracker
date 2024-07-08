
// Email Fields
const EMAILFIELD = document.querySelector('#emailField')
const INVALIDEMAIL = document.querySelector('.email-invalid');

// Username Fields
const USERNAMEFIELD = document.querySelector('#usernameField');
const INVALIDUSER = document.querySelector('.user-invalid');

// Passwords Fields
const PASSWORDFIELD = document.querySelector('#passwordField')
const CONFIRMFIELD = document.querySelector('#confirmField')
const SHOWTOGGLE = document.querySelector(".showPassToggle")

// Register Button
const REGISTERBTN = document.querySelector(".submit-btn")

// Get cookie from django:
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // If the cookie string begins with the name we want.
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }

EMAILFIELD.addEventListener('keyup', (e) => {
    const EMAILVAL = e.target.value;
    // console.log(EMAILVAL);

    EMAILFIELD.classList.remove('is-invalid');
    INVALIDEMAIL.style.display= 'none';

    if (EMAILVAL.length > 0){
        fetch('/authentication/validate-email', {
            method:'POST',
            headers:{
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'), // CSRF token for security.
            },
            body:JSON.stringify({email: EMAILVAL}),
            }).then((res) => res.json()).then((data) => {
            if (data.email_Error){
                REGISTERBTN.disabled = true;
                EMAILFIELD.classList.add('is-invalid');
                INVALIDEMAIL.style.display= 'block';
                INVALIDEMAIL.innerHTML=`<p>${data.email_Error}</p>`;
            } 
            else {
                REGISTERBTN.disabled = false;
            }
            // console.log("data", data);
        });
    }
});

USERNAMEFIELD.addEventListener('keyup', (e) => {
    const USERNAMEVAL = e.target.value;
    // console.log(USERNAMEVAL);

    USERNAMEFIELD.classList.remove('is-invalid');
    INVALIDUSER.style.display= 'none';

    if (USERNAMEVAL.length > 0){
        fetch('/authentication/validate-username', {
            method:'POST',
            headers:{
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'), // CSRF token for security.
            },
            body:JSON.stringify({username: USERNAMEVAL}),
            }).then((res) => res.json()).then((data) => {
            if (data.username_Error){
                REGISTERBTN.disabled = true;
                USERNAMEFIELD.classList.add('is-invalid');
                INVALIDUSER.style.display= 'block';
                INVALIDUSER.innerHTML=`<p>${data.username_Error}</p>`;
            }
            else {
                REGISTERBTN.disabled = false;
            }
            // console.log("data", data);
        });
    }
});

function ToggleVisualization(){
    // console.log(SHOWTOGGLE.type);
    if(SHOWTOGGLE.innerHTML == "Show Password"){
        SHOWTOGGLE.innerHTML = "Hide Password";
        PASSWORDFIELD.setAttribute("type", "text");
    }
    else {
        SHOWTOGGLE.innerHTML = "Show Password";
        PASSWORDFIELD.setAttribute("type", "password");
    }
}

SHOWTOGGLE.addEventListener("click", ToggleVisualization);

