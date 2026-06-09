/**
 * Project:   Frontend Login Web Page
 * Developer: Mirza Hadi
 * Website:   hadi-mirza.com
 * GitHub:    github.com/Hadibaig
 */


const loggedIn =
sessionStorage.getItem("loggedIn") ||
localStorage.getItem("loggedIn");

if (
window.location.pathname.includes("index.html") &&
!loggedIn
){
window.location.href = "login.html";
}

/* ===================================
   LOGIN FORM
=================================== */

const loginForm =
document.getElementById("loginForm");

if(loginForm){

loginForm.addEventListener("submit",function(e){

e.preventDefault();

const email =
document.getElementById("email").value.trim();

const password =
document.getElementById("password").value.trim();

const rememberMe =
document.getElementById("rememberMe").checked;

const message =
document.getElementById("message");

/* Demo Credentials */

const validEmail =
"admin@example.com";

const validPassword =
"admin123";

if(
email === validEmail &&
password === validPassword
){

if(rememberMe){

localStorage.setItem(
"loggedIn",
"true"
);

}else{

sessionStorage.setItem(
"loggedIn",
"true"
);

}

message.innerHTML =
"<span class='text-success'>Login Successful...</span>";

setTimeout(()=>{

window.location.href =
"index.html";

},1000);

}else{

message.innerHTML =
"<span class='text-danger'>Invalid Email or Password</span>";

}

});

}

/* ===================================
   SHOW / HIDE PASSWORD
=================================== */

const togglePassword =
document.getElementById(
"togglePassword"
);

if(togglePassword){

togglePassword.addEventListener(
"click",
function(){

const password =
document.getElementById(
"password"
);

if(
password.type ===
"password"
){

password.type = "text";

togglePassword.innerHTML =
"🙈";

}else{

password.type =
"password";

togglePassword.innerHTML =
"👁";

}

}
);

}

/* ===================================
   DARK MODE
=================================== */

const themeToggle =
document.getElementById(
"themeToggle"
);

const savedTheme =
localStorage.getItem(
"theme"
);

if(savedTheme === "dark"){

document.body.classList.add(
"dark-mode"
);

}

if(themeToggle){

themeToggle.addEventListener(
"click",
function(){

document.body.classList.toggle(
"dark-mode"
);

if(
document.body.classList.contains(
"dark-mode"
)
){

localStorage.setItem(
"theme",
"dark"
);

themeToggle.innerHTML =
"☀️";

}else{

localStorage.setItem(
"theme",
"light"
);

themeToggle.innerHTML =
"🌙";

}

}
);

}

/* ===================================
   LOGOUT
=================================== */

function logout(){

sessionStorage.removeItem(
"loggedIn"
);

localStorage.removeItem(
"loggedIn"
);

}

/* ===================================
   PARTICLES
=================================== */

if(
typeof tsParticles !==
"undefined"
){

tsParticles.load(
"particles-js",
{

particles:{

number:{
value:60
},

color:{
value:"#ffffff"
},

shape:{
type:"circle"
},

opacity:{
value:0.6
},

size:{
value:3
},

move:{
enable:true,
speed:2
}

},

interactivity:{

events:{

onHover:{
enable:true,
mode:"repulse"
}

}

}

}
);

}
