
document.addEventListener("DOMContentLoaded", function () {

    let loginBtn = document.getElementById("loginBtn");
    let userName = document.getElementById("userName");

    // check لو فيه يوزر محفوظ
    let user = localStorage.getItem("user");

    if (user) {
        loginBtn.innerText = "Logout";
        userName.innerText = "👋 " + user;
    }

    // لما تضغطي
    loginBtn.onclick = function () {

        let user = localStorage.getItem("user");

        if (!user) {
            let name = prompt("Enter your name:");

            if (name) {
                localStorage.setItem("user", name);
                loginBtn.innerText = "Logout";
                userName.innerText = "👋 " + name;
            }

        } else {
            localStorage.removeItem("user");
            loginBtn.innerText = "Login";
            userName.innerText = "";
        }
    };

});
















document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("sendBtn").addEventListener("click", function () {

        let name = document.querySelector("input[type='text']").value;
        let email = document.querySelector("input[type='email']").value;
        let message = document.querySelector("textarea").value;

        if (name === "" || email === "" || message === "") {
            alert("thank you for your message, we will contact you soon");
        } else {

            // إظهار رسالة الشكر
            document.getElementById("thankMsg").style.display = "block";

            // مسح الفورم
            document.querySelector("form").reset();

            // إخفاء الرسالة بعد 3 ثواني
            setTimeout(() => {
                document.getElementById("thankMsg").style.display = "none";
            }, 3000);

        }

    });

});
document.getElementById("loginBtn").addEventListener("click", function () {

    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;
    let msg = document.getElementById("loginMessage");

    // بيانات تجريبية
    let correctEmail = "test@gmail.com";
    let correctPassword = "123456";

    if (email === "" || password === "") {
        msg.innerHTML = "<span style='color:red;'>Please fill all fields!</span>";
    } 
    else if (email === correctEmail && password === correctPassword) {

        msg.innerHTML = "<span style='color:green;'>Login successful 🎉</span>";

        // يقفل المودال
        setTimeout(() => {
            let modal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
            modal.hide();
        }, 1000);

    } 
    else {
        msg.innerHTML = "<span style='color:red;'>Wrong email or password</span>";
    }

});

const toggleBtn = document.getElementById("themeToggle");

// تحميل الثيم من قبل
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  toggleBtn.textContent = "☀️";
}

// عند الضغط
toggleBtn.onclick = function () {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
    toggleBtn.textContent = "☀️";
  } else {
    localStorage.setItem("theme", "light");
    toggleBtn.textContent = "🌙";
  }
};


function toggleMode() {
  document.body.classList.toggle("dark-mode");

  let btn = document.getElementById("modeBtn");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("mode", "dark");
    btn.innerHTML = "☀️";
  } else {
    localStorage.setItem("mode", "light");
    btn.innerHTML = "🌙";
  }
}

// تحميل الحالة
window.onload = function () {
  let btn = document.getElementById("modeBtn");

  if (localStorage.getItem("mode") === "dark") {
    document.body.classList.add("dark-mode");
    btn.innerHTML = "☀️";
  }
}


function toggleMode() {
    document.body.classList.toggle("light-mode");

    let btn = document.getElementById("modeBtn");

    // تغيير الأيقونة
    if (document.body.classList.contains("light-mode")) {
        btn.innerHTML = "☀️";
        localStorage.setItem("mode", "light");
    } else {
        btn.innerHTML = "🌙";
        localStorage.setItem("mode", "dark");
    }
}

// عشان يفضل محفوظ بعد الريفريش
window.onload = function () {
    let mode = localStorage.getItem("mode");

    let btn = document.getElementById("modeBtn");

    if (mode === "light") {
        document.body.classList.add("light-mode");
        btn.innerHTML = "☀️";
    } else {
        btn.innerHTML = "🌙";
    }
};
fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4",
    messages: [{ role: "user", content: input }]
  })
})
.then(res => res.json())
.then(data => {
  console.log(data.choices[0].message.content);
});