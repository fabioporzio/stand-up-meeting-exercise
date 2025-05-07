async function checkApiKey(event) {
    event.preventDefault();
    const apiKey = document.getElementById("apiKey").value;
    const url = "https://standupparo-apis.vercel.app/api/company-name";
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "x-api-key": apiKey
            },
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        console.log(json);

        localStorage.setItem("apiKey", apiKey);
        window.location.href = "dashboard.html";
    } 
    catch (error) {
        const errorMessage = document.getElementById("errorMessage");
        errorMessage.innerHTML = "Api Key is not registered";

        console.error(error.message);
    }
}

async function forceRedirect() {
    const apiKey = localStorage.getItem("apiKey")
    if (apiKey) {
        const url = "https://standupparo-apis.vercel.app/api/company-name";
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "x-api-key": apiKey
                },
            });

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            window.location.href = "dashboard.html";
        } 
        catch (error) {
    
            console.error(error.message);
        }
    }
    else {
        return;
    }
    
}