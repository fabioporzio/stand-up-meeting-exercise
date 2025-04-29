function logout() {
    localStorage.removeItem("apiKey")
    window.location.href = "index.html"
}