// Shared script for all three pages
(function() {
  const form = document.querySelector("form");
  const toast = document.getElementById("toast");
  if (!form) return;

  // Helper to show toast
  function showToast(message, isError = false) {
    if (!toast) return;
    toast.textContent = message;
    toast.className = isError ? "error" : "";
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 3000);
  }

  // Helper to get gmail from localStorage or URL param
  function getGmail() {
    const basicInfo = JSON.parse(localStorage.getItem("basicInfo") || "{}");
    if (basicInfo.gmail) return basicInfo.gmail;
    const params = new URLSearchParams(window.location.search);
    return params.get("gmail") || "";
  }

  // PAGE 1: Signup
  if (form.id === "signupForm") {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const firstName = document.getElementById("firstName").value.trim();
      const middleName = document.getElementById("middleName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const gmail = document.getElementById("gmail").value.trim();
      const password = document.getElementById("password").value;
      const number = document.getElementById("number").value.trim();
      if (!firstName || !lastName || !gmail || !password || !number) {
        showToast("Please fill in all required fields.", true);
        return;
      }
      if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(gmail)) {
        showToast("Enter a valid Gmail address.", true);
        return;
      }
      if (password.length < 6) {
        showToast("Password must be at least 6 characters.", true);
        return;
      }
      if (!/^\d{10,15}$/.test(number)) {
        showToast("Enter a valid phone number.", true);
        return;
      }
      const data = { firstName, middleName, lastName, gmail, password, number };
      try {
        const response = await fetch('http://localhost:3001/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
          localStorage.setItem("basicInfo", JSON.stringify(data));
          window.location.href = `page2.html?gmail=${encodeURIComponent(gmail)}`;
        } else {
          showToast("Signup failed. Try again.", true);
        }
      } catch (err) {
        showToast("Server error. Try again!", true);
      }
    });
  }

  // PAGE 2: Personal Info
  if (form.id === "infoForm") {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const requiredFields = ["identity", "dob", "ssn", "address", "city", "state", "zip", "country"];
      for (const fieldId of requiredFields) {
        const value = document.getElementById(fieldId).value.trim();
        if (!value) {
          showToast("Please fill all required fields.", true);
          return;
        }
      }
      const personalInfo = {
        identity: document.getElementById("identity").value.trim(),
        dob: document.getElementById("dob").value,
        ssn: document.getElementById("ssn").value.trim(),
        address: document.getElementById("address").value.trim(),
        apt: document.getElementById("apt").value.trim(),
        city: document.getElementById("city").value.trim(),
        state: document.getElementById("state").value.trim(),
        zip: document.getElementById("zip").value.trim(),
        country: document.getElementById("country").value.trim()
      };
      const gmail = getGmail();
      if (!gmail) {
        showToast("Missing user email from previous step.", true);
        return;
      }
      try {
        const response = await fetch('http://localhost:3001/api/signup/step2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gmail, ...personalInfo })
        });
        const result = await response.json();
        if (result.success) {
          localStorage.setItem("personalInfo", JSON.stringify(personalInfo));
          window.location.href = `page3.html?gmail=${encodeURIComponent(gmail)}`;
        } else {
          showToast("Failed to save info. Try again.", true);
        }
      } catch (err) {
        showToast("Server error. Try again!", true);
      }
    });
  }

  // PAGE 3: Payment Info
  if (form.id === "paymentForm") {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const cardNumber = document.getElementById("cardNumber").value.trim();
      const cvv = document.getElementById("cvv").value.trim();
      if (!/^\d{13,16}$/.test(cardNumber)) {
        showToast("Enter a valid card number.", true);
        return;
      }
      if (!/^\d{3,4}$/.test(cvv)) {
        showToast("Enter a valid CVV.", true);
        return;
      }
      const paymentInfo = {
        cardName: document.getElementById("cardName").value.trim(),
        cardNumber,
        expDate: document.getElementById("expDate").value,
        cvv,
        paymentMethod: document.getElementById("paymentMethod").value
      };
      const gmail = getGmail();
      if (!gmail) {
        showToast("Missing user email from previous steps.", true);
        return;
      }
      try {
        const response = await fetch('http://localhost:3001/api/signup/step3', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gmail, ...paymentInfo })
        });
        const result = await response.json();
        if (result.success) {
          showToast("Registration & Payment Complete!");
          form.reset();
          localStorage.clear();
        } else {
          showToast("Failed to save payment info. Try again.", true);
        }
      } catch (err) {
        showToast("Server error. Try again!", true);
      }
    });
  }
})();
