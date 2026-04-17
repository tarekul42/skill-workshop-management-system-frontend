const fetch = require('node-fetch');

async function test() {
  // 1. Login
  const loginRes = await fetch("http://localhost:5000/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@test.com", password: "Admin@123" })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.accessToken;

  console.log("Logged in, token:", token.substring(0, 20) + "...");

  // 2. Fetch users
  const usersRes = await fetch("http://localhost:5000/api/v1/user/all-users?page=1&limit=10", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  
  const usersData = await usersRes.json();
  console.log("Users success:", usersData.success);
  console.log("Users data keys:", Object.keys(usersData));
  if (Array.isArray(usersData.data)) {
      console.log("Users array length:", usersData.data.length);
  } else {
      console.log("Users data is not an array:", typeof usersData.data);
  }
}

test().catch(console.error);
