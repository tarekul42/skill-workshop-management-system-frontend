const fetchHeaders = { "Content-Type": "application/json" };
const fetchOptions = {
    method: "GET",
    headers: fetchHeaders
};

fetchHeaders["Authorization"] = "Bearer new-token";
console.log(fetchOptions.headers);
