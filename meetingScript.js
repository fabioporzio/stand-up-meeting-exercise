const timers = new Map();
var counter = 0;

async function createEmployeesTable() {
    const url = "https://standupparo-apis.vercel.app/api/devs";
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "x-api-key": localStorage.getItem("apiKey")
            },
        });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      console.log(json);

      json.forEach(employee => {
            addTableRecord(employee);
      });
    } catch (error) {
      console.error(error.message);
    }
}

function addTableRecord(employee) {
    const tbody = document.getElementById("tbody");
    const tr = document.createElement("tr");

    const hiddenEmployeeId = document.createElement("div");
    hiddenEmployeeId.innerHTML = employee.id;
    hiddenEmployeeId.style.display = "none";
    hiddenEmployeeId.className = "employeeId";
    tr.appendChild(hiddenEmployeeId);

    const td1 = document.createElement("td");
    td1.innerHTML = employee.name
    tr.appendChild(td1);

    const td2 = document.createElement("td");
    td2.className ="d-flex align-itmes-center justify-content-center"

    const playButton = document.createElement("button");
    playButton.type = "button";
    playButton.className = "btn btn-secondary d-flex align-items-center justify-content-center me-4";

    const playIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    playIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    playIcon.setAttribute("width", "16");
    playIcon.setAttribute("height", "16");
    playIcon.setAttribute("fill", "currentColor");
    playIcon.setAttribute("class", "bi bi-play-fill");
    playIcon.setAttribute("viewBox", "0 0 16 16");

    const playPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    playPath.setAttribute("d", "m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393");

    playIcon.appendChild(playPath);
    playButton.appendChild(playIcon);

    const pauseButton = document.createElement("button");
    pauseButton.type = "button";
    pauseButton.className = "btn btn-secondary d-flex align-items-center justify-content-center me-4";

    const pauseIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    pauseIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    pauseIcon.setAttribute("width", "16");
    pauseIcon.setAttribute("height", "16");
    pauseIcon.setAttribute("fill", "currentColor");
    pauseIcon.setAttribute("class", "bi bi-play-fill");
    pauseIcon.setAttribute("viewBox", "0 0 16 16");

    const pausePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pausePath.setAttribute("d", "M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5");

    pauseIcon.appendChild(pausePath);
    pauseButton.appendChild(pauseIcon);

    const timerDisplay = document.createElement("div");
    timerDisplay.className = "employeeTime";
    timerDisplay.innerHTML ="00:00:00";
    
    td2.appendChild(playButton);
    td2.appendChild(pauseButton);
    td2.appendChild(timerDisplay);

    tr.appendChild(td2);

    const td3 = document.createElement("td");
    const textInput = document.createElement("input");
    textInput.className = "employeeNotes";
    textInput.type = "text";
    textInput.style.width = "100%";
    td3.appendChild(textInput);
    tr.appendChild(td3);

    tbody.appendChild(tr);

    timers.set(timerDisplay, {
        elapsedTime: 0,
        intervalId: null,
        running: false
    });

    playButton.addEventListener("click", () => startChronometer(timerDisplay));
    pauseButton.addEventListener("click", () => stopChronometer(timerDisplay));
    timerDisplay.addEventListener("change", () => updateGlobalTimer(timers))

    counter += 1;
}

function updateDisplay(displayElement, elapsedTime) {
    const time = new Date(elapsedTime);
    const hours = String(time.getUTCHours()).padStart(2, '0');
    const minutes = String(time.getUTCMinutes()).padStart(2, '0');
    const seconds = String(time.getUTCSeconds()).padStart(2, '0');
    displayElement.textContent = `${hours}:${minutes}:${seconds}`;
}

function startChronometer(displayElement) {
    const timer = timers.get(displayElement);
    if (!timer.running) {
        timer.startTime = Date.now() - timer.elapsedTime;
        timer.intervalId = setInterval(() => {
            timer.elapsedTime = Date.now() - timer.startTime;
            updateDisplay(displayElement, timer.elapsedTime);
        }, 1000);
        timer.running = true;
    }
}

function stopChronometer(displayElement) {
    const timer = timers.get(displayElement);
    if (timer.running) {
        clearInterval(timer.intervalId);
        timer.running = false;
    }
}

function updateGlobalTimer(timers) {
    const globalTimer = document.getElementById("globalTimer")
    let totalTime = 0;

    timers.forEach(timer => {
        totalTime += timer.elapsedTime;
    });

    updateDisplay(globalTimer, totalTime)
}

setInterval(() => {
    updateGlobalTimer(timers);
}, 1000);

const dateData = getTodaysDate();

function getTodaysDate() {
    const now = new Date;
    const todayDate = now.toLocaleDateString();
    const formatteddDate = formatdDate(todayDate);
    console.log(formatteddDate)

    const currentTime = now.toLocaleTimeString();
    
    return formatteddDate + "T" + currentTime + "Z"
}

async function sendData() {
    var totalTime = extractSeconds(document.getElementById("globalTimer").textContent);
    const employeeIds = document.getElementsByClassName("employeeId")
    const employeeTimes = Array.from(document.getElementsByClassName("employeeTime"))
    const employeeNotes = document.getElementsByClassName("employeeNotes")

    for (let i = 0; i < employeeTimes.length; i += 1) {
        console.log(employeeTimes[i])
        employeeTimes[i] = extractSeconds(employeeTimes[i].textContent)
        console.log(employeeTimes[i])
    }
    
    const standUpsInfo = new Array;
    for (let i = 0; i < counter; i += 1) {
        console.log(employeeIds[i])
        standUpsInfo.push({
            devId: Number(employeeIds[i].textContent),
            durationMins: Number(employeeTimes[i]),
            notes: String(employeeNotes[i].value)
        })
    }

    const requestBody = {
        date: dateData,
        durationMins: totalTime,
        standUpsInfo: standUpsInfo
    }

    const url = "https://standupparo-apis.vercel.app/api/stand-up";
    await fetchPost(url, requestBody)
}

async function fetchPost(url, requestBody) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": localStorage.getItem("apiKey")
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        alert("Salvataggio avvenuto!")
    } catch (error) {
        console.error(error.message);
    }
}

function formatdDate(inputDate) {
    var splittedDate = inputDate.split("/")
    var formattedDate = splittedDate[2] + "-" + splittedDate[1] + "-" + splittedDate[0]
    return formattedDate;
}

function extractSeconds(time) {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}