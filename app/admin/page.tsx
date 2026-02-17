<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Panel</title>

<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;600&display=swap" rel="stylesheet">

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<style>
*{box-sizing:border-box;font-family:'Prompt',sans-serif;}
body{
  margin:0;
  background:#0f0f0f;
  color:#ffd700;
}
header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:20px;
  background:#111;
  border-bottom:2px solid #ffd700;
}
header img{width:60px;}
.logout{
  background:red;
  border:none;
  padding:8px 15px;
  color:#fff;
  border-radius:6px;
  cursor:pointer;
}
.container{
  padding:30px;
}
.section{
  background:#1a1a1a;
  padding:20px;
  margin-bottom:30px;
  border-radius:12px;
  box-shadow:0 0 20px rgba(255,215,0,0.2);
}
input,select{
  width:100%;
  padding:8px;
  margin:5px 0;
  border-radius:6px;
  border:1px solid #444;
  background:#222;
  color:#ffd700;
}
button{
  background:#ffd700;
  border:none;
  padding:8px 15px;
  margin:5px;
  border-radius:6px;
  cursor:pointer;
}
.grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:10px;
}
.progress-bar{
  width:100%;
  background:#333;
  border-radius:10px;
  overflow:hidden;
}
.progress{
  height:20px;
  background:#ffd700;
  width:0%;
  transition:0.4s;
}
.steps{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:10px;
}
.popup{
  position:fixed;
  top:20px;
  right:20px;
  background:#ffd700;
  color:#000;
  padding:10px 15px;
  border-radius:6px;
  display:none;
}
.spinner{
  display:none;
  text-align:center;
}
.loader{
  border:4px solid #333;
  border-top:4px solid #ffd700;
  border-radius:50%;
  width:40px;
  height:40px;
  animation:spin 1s linear infinite;
  margin:auto;
}
@keyframes spin{100%{transform:rotate(360deg);}}
</style>
</head>

<body>

<script>
if(!sessionStorage.getItem("admin_logged_in")){
  window.location.href="login.html";
}
window.addEventListener("beforeunload",()=>{
  sessionStorage.clear();
});
</script>

<header>
  <div style="display:flex;align-items:center;gap:15px;">
    <img src="https://uppic.cloud/ib/LLTyVfpp4nz1XNA_1768309771.png">
    <h2>ระบบบริหารจัดการ Survey Status</h2>
  </div>
  <button class="logout" onclick="logout()">Logout</button>
</header>

<div class="container">

<div class="section">
  <h3>ค้นหา Case จาก RW12</h3>
  <input type="text" id="searchRw12" placeholder="เช่น 345/2569">
  <button onclick="searchCase()">ค้นหา</button>
</div>

<div class="section" id="formSection" style="display:none;">
  <h3>แก้ไขข้อมูล</h3>
  <div class="grid">
    <input id="rw12" placeholder="rw12">
    <input type="date" id="survey_date">
    <input id="full_name" placeholder="ชื่อ-สกุล">

    <input id="title_deed" placeholder="เลขโฉนด">

    <select id="district">
      <option>เมืองหนองบัวลำภู</option>
      <option>โนนสัง</option>
      <option>นากลาง</option>
      <option>นาวัง</option>
      <option>สุวรรณคูหา</option>
      <option>ศรีบุญเรือง</option>
    </select>

    <select id="survey_type">
      <option>แบ่งเเยกในนามเดิม</option>
      <option>สอบเขตโฉนดที่ดิน</option>
      <option>แบ่งกรรมสิทธ์รวม</option>
      <option>รวมโฉนดที่ดิน</option>
      <option>รวมโฉนดที่ดินและแบ่งเเยกในนามเดิม</option>
      <option>รวมโฉนดที่ดินและแบ่งกรรมสิทธ์รวม</option>
      <option>แบ่งหักเป็นที่สาธารณประโยชน์</option>
      <option>แบ่งเเยกในนามเดิมและแบ่งหักเป็นที่สาธารณประโยชน์</option>
      <option>แบ่งกรรมสิทธ์รวมและแบ่งหักเป็นที่สาธารณประโยชน์</option>
      <option>ตรวจสอบ น.ส. ๓ ก.</option>
    </select>

    <input id="phone" placeholder="เบอร์โทร">

    <select id="surveyor_name">
      <option>นายณัฐพล อุทัยเลี้ยง</option>
      <option>นายสุรชัย สอนเฒ่า</option>
      <option>นางสาวสุจิรา เวทย์จรัส</option>
      <option>นายณัฐกร จุลทะนันท์</option>
      <option>นายชัยมงคล คงปิ่น</option>
      <option>นายวัชรินทร์ คาระบุตร</option>
      <option>นายอาเขตต์ ข้ามหก</option>
      <option>นายจีรศักดิ์ ศรีสมบัติ</option>
      <option>นายอรรถไกรวิทย์ กลางหล้า</option>
      <option>นายภาณุพงศ์ ผสมพืช</option>
    </select>
  </div>

  <div class="progress-bar">
    <div class="progress" id="progressBar"></div>
  </div>
  <p id="progressText">0%</p>

  <div class="steps">
    <label><input type="checkbox" onchange="toggleStep(1)">Step 1</label>
    <label><input type="checkbox" onchange="toggleStep(2)">Step 2</label>
    <label><input type="checkbox" onchange="toggleStep(3)">Step 3</label>
    <label><input type="checkbox" onchange="toggleStep(4)">Step 4</label>
    <label><input type="checkbox" onchange="toggleStep(5)">Step 5</label>
    <label><input type="checkbox" onchange="toggleStep(6)">Step 6</label>
    <label><input type="checkbox" onchange="toggleStep(7)">Step 7</label>
    <label><input type="checkbox" onchange="toggleStep(8)">Step 8</label>
  </div>

  <button onclick="saveData()">บันทึก</button>
  <button onclick="clearForm()">ล้างข้อมูล</button>
</div>

<div class="spinner" id="spinner">
  <div class="loader"></div>
</div>

</div>

<div class="popup" id="popup"></div>

<script>
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";
const client = supabase.createClient(supabaseUrl, supabaseKey);

let currentData=null;
let completedSteps=0;

function logout(){
  sessionStorage.clear();
  window.location.href="login.html";
}

function showPopup(msg){
  const p=document.getElementById("popup");
  p.innerText=msg;
  p.style.display="block";
  setTimeout(()=>p.style.display="none",3000);
}

function toggleStep(step){
  completedSteps = document.querySelectorAll(".steps input:checked").length;
  const percent=Math.round((completedSteps/8)*100);
  document.getElementById("progressBar").style.width=percent+"%";
  document.getElementById("progressText").innerText=percent+"%";
}

async function searchCase(){
  const rw12=document.getElementById("searchRw12").value;
  if(!rw12){showPopup("กรุณากรอก rw12");return;}
  document.getElementById("spinner").style.display="block";

  const {data,error}=await client.from("case").select("*").eq("rw12",rw12).single();

  document.getElementById("spinner").style.display="none";

  if(error||!data){showPopup("ไม่พบข้อมูล");return;}

  currentData=data;
  document.getElementById("formSection").style.display="block";

  Object.keys(data).forEach(key=>{
    if(document.getElementById(key)){
      document.getElementById(key).value=data[key]||"";
    }
  });
}

async function saveData(){
  if(!currentData){showPopup("ไม่มีข้อมูล");return;}
  const updated={
    rw12:document.getElementById("rw12").value,
    survey_date:document.getElementById("survey_date").value,
    full_name:document.getElementById("full_name").value,
    title_deed:document.getElementById("title_deed").value,
    district:document.getElementById("district").value,
    survey_type:document.getElementById("survey_type").value,
    phone:document.getElementById("phone").value,
    surveyor_name:document.getElementById("surveyor_name").value
  };

  const {error}=await client.from("case").update(updated).eq("rw12",updated.rw12);

  if(error){showPopup("บันทึกไม่สำเร็จ");}
  else{showPopup("บันทึกสำเร็จ");}
}

function clearForm(){
  document.querySelectorAll("#formSection input").forEach(i=>i.value="");
  document.getElementById("formSection").style.display="none";
}
</script>

</body>
</html>
