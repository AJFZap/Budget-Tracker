
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

EMAILFIELD.addEventListener('keyup', (e) => {
    const EMAILVAL = e.target.value;
    console.log(EMAILVAL);

    EMAILFIELD.classList.remove('is-invalid');
    INVALIDEMAIL.style.display= 'none';

    if (EMAILVAL.length > 0){
        fetch('/authentication/validate-email', {body:JSON.stringify({email: EMAILVAL}), method:'POST',}).then((res) => res.json()).then((data) => {
            if (data.email_Error){
                REGISTERBTN.disabled = true;
                EMAILFIELD.classList.add('is-invalid');
                INVALIDEMAIL.style.display= 'block';
                INVALIDEMAIL.innerHTML=`<p>${data.email_Error}</p>`;
            } 
            else {
                REGISTERBTN.disabled = false;
            }
            console.log("data", data);
        });
    }
});

USERNAMEFIELD.addEventListener('keyup', (e) => {
    const USERNAMEVAL = e.target.value;
    console.log(USERNAMEVAL);

    USERNAMEFIELD.classList.remove('is-invalid');
    INVALIDUSER.style.display= 'none';

    if (USERNAMEVAL.length > 0){
        fetch('/authentication/validate-username', {body:JSON.stringify({username: USERNAMEVAL}), method:'POST',}).then((res) => res.json()).then((data) => {
            if (data.username_Error){
                REGISTERBTN.disabled = true;
                USERNAMEFIELD.classList.add('is-invalid');
                INVALIDUSER.style.display= 'block';
                INVALIDUSER.innerHTML=`<p>${data.username_Error}</p>`;
            }
            else {
                REGISTERBTN.disabled = false;
            }
            console.log("data", data);
        });
    }
});

function ToggleVisualization(){
    console.log(SHOWTOGGLE.type);
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

