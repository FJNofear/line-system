<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Login</title>

<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;600&display=swap" rel="stylesheet">

<script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>

<style>
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
  font-family:'Prompt',sans-serif;
}

body{
  height:100vh;
  background:#000;
  overflow:hidden;
  display:flex;
  justify-content:center;
  align-items:center;
}

/* Hacker background */
body::before{
  content:"";
  position:fixed;
  width:100%;
  height:100%;
  background:url("https://images.unsplash.com/photo-1518779578993-ec3579fee39f") center/cover no-repeat;
  filter:brightness(0.2) contrast(1.2);
  z-index:-2;
}

/* particle layer */
#particles-js{
  position:fixed;
  width:100%;
  height:100%;
  z-index:-1;
}

/* login box */
.login-box{
  width:380px;
  padding:45px;
  background:rgba(20,20,20,0.95);
  border:2px solid #FFD700;
  border-radius:20px;
  box-shadow:0 0 40px rgba(255,215,0,0.4);
  text-align:center;
  animation:fadeIn 1s ease;
}

.logo{
  width:110px;
  margin-bottom:20px;
  animation:float 3s ease-in-out infinite;
}

h2{
  color:#FFD700;
  margin-bottom:30px;
}

input{
  width:100%;
  padding:13px;
  margin-bottom:18px;
  border-radius:10px;
  border:1px solid #FFD700;
  background:#111;
  color:#FFD700;
  font-size:14px;
}

input::placeholder{
  color:#aaa;
}

button{
  width:100%;
  padding:14px;
  border-radius:12px;
  border:none;
  background:#FFD700;
  color:#000;
  font-weight:bold;
  cursor:pointer;
  transition:0.3s;
}

button:hover{
  background:#ffcc00;
  transform:scale(1.05);
}

.loader{
  margin-top:20px;
  display:none;
}

.spinner{
  border:4px solid rgba(255,215,0,0.3);
  border-top:4px solid #FFD700;
  border-radius:50%;
  width:35px;
  height:35px;
  animation:spin 1s linear infinite;
  margin:auto;
}

.popup{
  position:fixed;
  top:25px;
  right:25px;
  padding:15px 20px;
  border-radius:12px;
  font-weight:600;
  display:none;
  animation:slideIn 0.5s ease;
}

.success{ background:#00c853; color:#fff; }
.error{ background:#d50000; color:#fff; }

@keyframes spin{
  100%{transform:rotate(360deg);}
}

@keyframes fadeIn{
  from{opacity:0; transform:translateY(20px);}
  to{opacity:1; transform:translateY(0);}
}

@keyframes slideIn{
  from{right:-200px; opacity:0;}
  to{right:25px; opacity:1;}
}

@keyframes float{
  0%,100%{transform:translateY(0);}
  50%{transform:translateY(-10px);}
}
</style>
</head>

<body>

<div id="particles-js"></div>

<div class="login-box">
  <img src="https://uppic.cloud/ib/LLTyVfpp4nz1XNA_1768309771.png" class="logo">
  <h2>ADMIN LOGIN</h2>

  <input type="text" id="username" placeholder="Username">
  <input type="password" id="password" placeholder="Password">

  <button onclick="login()">เข้าสู่ระบบ</button>

  <div class="loader" id="loader">
    <div class="spinner"></div>
  </div>
</div>

<div class="popup" id="popup"></div>

<audio id="successSound" src="https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3"></audio>
<audio id="errorSound" src="https://assets.mixkit.co/sfx/preview/mixkit-player-losing-or-failing-2042.mp3"></audio>

<script>

// Particle config
particlesJS("particles-js", {
  particles:{
    number:{value:80},
    color:{value:"#FFD700"},
    shape:{type:"circle"},
    opacity:{value:0.4},
    size:{value:3},
    line_linked:{
      enable:true,
      distance:150,
      color:"#FFD700",
      opacity:0.3
    },
    move:{enable:true, speed:2}
  }
});

// Login function
async function login(){
  const username=document.getElementById("username").value;
  const password=document.getElementById("password").value;
  const loader=document.getElementById("loader");

  if(!username || !password){
    showPopup("กรุณากรอกข้อมูลให้ครบ",false);
    return;
  }

  loader.style.display="block";

  const res=await fetch("/api/admin/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({username,password})
  });

  const data=await res.json();
  loader.style.display="none";

  if(data.success){
    sessionStorage.setItem("adminLogin","true");
    document.getElementById("successSound").play();
    showPopup("เข้าสู่ระบบสำเร็จ",true);
    setTimeout(()=>{window.location.href="/admin.html";},1200);
  }else{
    document.getElementById("errorSound").play();
    showPopup("Username หรือ Password ไม่ถูกต้อง",false);
  }
}

function showPopup(message,success){
  const popup=document.getElementById("popup");
  popup.innerText=message;
  popup.className="popup "+(success?"success":"error");
  popup.style.display="block";

  setTimeout(()=>{popup.style.display="none";},3000);
}

/* Auto logout เมื่อปิดแท็บ */
window.addEventListener("beforeunload",function(){
  sessionStorage.removeItem("adminLogin");
});

</script>

</body>
</html>
