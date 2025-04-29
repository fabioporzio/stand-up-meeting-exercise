async function createStandupTable() {
    const url = "https://standupparo-apis.vercel.app/api/stand-ups";
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "x-api-key": localStorage.getItem("apiKey"),
                "Content-Type": "application/json"
            },
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        console.log(json);

        json.forEach(standUpMeeting => {
                addTableRecord(standUpMeeting)
        });
    } 
    catch (error) {
        console.error(error.message);
    }
}

function addTableRecord(standUpMeeting) {
    const tbody = document.getElementById("tbody")
    const tr = document.createElement("tr")
    tr.className = "pt-1 pb-1"

    const td1 = document.createElement("td")
    td1.innerHTML = standUpMeeting.companyId
    tr.appendChild(td1)

    const td2 = document.createElement("td")
    td2.innerHTML = formatDateTime(standUpMeeting.date)
    tr.appendChild(td2)

    const td3 = document.createElement("td")
    td3.innerHTML = standUpMeeting.durationMins
    tr.appendChild(td3)

    const td4  = document.createElement("td")
    td4.innerHTML = standUpMeeting.id
    tr.appendChild(td4)

    tbody.appendChild(tr)
}

function formatDateTime(inputDateTime) {
    splittedDateTime = inputDateTime.split("T")

    splittedDate = splittedDateTime[0].split("-")
    formattedDate = splittedDate[2] + "/" + splittedDate[1] + "/" + splittedDate[0]

    splittedTime = splittedDateTime[1].split(".")
    formattedTime = splittedTime[0]

    formattedDateTime = formattedDate + " " + formattedTime
    return formattedDateTime;
}