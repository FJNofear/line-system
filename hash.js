const bcrypt = require("bcryptjs");

const password = "123456"; // 👈 เปลี่ยนเป็นรหัสที่ต้องการ
const hash = bcrypt.hashSync(password, 10);

console.log("Password:", password);
console.log("Hash:", hash);
