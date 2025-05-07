const timers = new Map();
const chronometerIntervals = new Map();
var counter = 0;
var expectedTimeForDeveloper = createTimers();

function createTimers() {
    const infoContainer = document.getElementById("infoContainer");

    const h4 = document.createElement("h4")
    h4.innerHTML = "Info generali:"
    infoContainer.appendChild(h4)

    const p1 = document.createElement("p")
    const expectedTime = getQueryParameter("expectedTime")
    p1.className = "fs-5"
    p1.innerHTML = "Durata prevista: " + expectedTime + " minuti"
    infoContainer.appendChild(p1)

    const p2 = document.createElement("p")
    const developersNumber = getQueryParameter("developersNumber")
    p2.className = "fs-5"
    p2.innerHTML = "Numero di sviluppatori: " + developersNumber
    infoContainer.appendChild(p2)

    const expectedTimeForDeveloper = (expectedTime * 60) / developersNumber;
    const convertedTime = secondsToTime(expectedTimeForDeveloper)
    const p3 = document.createElement("p")
    p3.className = "fs-5"
    p3.innerHTML = "Tempo previsto per ogni sviluppatore: " + convertedTime
    infoContainer.appendChild(p3)

    return convertedTime
}

async function getOldMeetings() {
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

        const lastMeetingId = json[0].id;
        return lastMeetingId
    }
    catch (error) {
        console.error(error.message);
    }
}

async function getLastMeetingNotes(lastMeetingId) {
    const url = "https://standupparo-apis.vercel.app/api/stand-up?id=" + lastMeetingId;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "x-api-key": localStorage.getItem("apiKey"),
                "Content-Type": "application/json"
            },
        });
        const json = await response.json();

        const notes = [];
        json.standUps.forEach(employee => {
            notes.push(employee.notes)
        });

        return notes;

    }
    catch (error) {
        console.error(error.message);
    }
}

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
        json.sort((a, b) => a.name.localeCompare(b.name));

        const lastMeetindId = await getOldMeetings();
        const notes = await getLastMeetingNotes(lastMeetindId);

        json.forEach(employee => {
            addTableRecord(employee, notes[counter]);
        });
    }
    catch (error) {
        console.error(error.message);
    }
}

function addTableRecord(employee, note) {
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
    td2.className = "d-flex align-itmes-center justify-content-center"

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
    timerDisplay.innerHTML = "00:00:00";

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

    const td4 = document.createElement("td");
    td4.innerHTML = note;
    tr.appendChild(td4);

    tbody.appendChild(tr);

    timers.set(timerDisplay, {
        id: counter,
        elapsedTime: 0,
        intervalId: null,
        running: false,
        warned: false
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
    if (!timer) return;

    timers.forEach((otherTimer, otherDisplay) => {
        if (otherDisplay !== displayElement && otherTimer.running) {
            stopChronometer(otherDisplay);
        }
    });

    if (timer.running) return;

    timer.startTime = Date.now() - (timer.elapsedTime || 0);
    timer.running = true;

    const intervalId = setInterval(() => {
        const now = Date.now();
        const newElapsed = now - timer.startTime;
        const newSeconds = Math.floor(newElapsed / 1000);

        if (newSeconds !== timer.lastSeconds) {
            timer.elapsedTime = newElapsed;
            timer.lastSeconds = newSeconds;
            updateDisplay(displayElement, newElapsed);
            checkTimer(displayElement, displayElement.textContent, expectedTimeForDeveloper, timer);
            updateGlobalTimer(timers);
        }
    }, 200);

    chronometerIntervals.set(displayElement, intervalId);
}

function stopChronometer(displayElement) {
    const intervalId = chronometerIntervals.get(displayElement);
    const timer = timers.get(displayElement);

    if (intervalId) {
        clearInterval(intervalId);
        chronometerIntervals.delete(displayElement);
    }
    if (timer) timer.running = false;
}

function updateGlobalTimer(timers) {
    const globalTimer = document.getElementById("globalTimer")
    let totalTime = 0;

    timers.forEach(timer => {
        totalTime += timer.elapsedTime;
    });

    updateDisplay(globalTimer, totalTime)
}

function checkTimer(displayElement, time, expectedTimeForDeveloper, timer) {
    if (!timer) return;
    const remaining = timeToSeconds(expectedTimeForDeveloper) - timeToSeconds(time);

    if (remaining < 60 && remaining >= 30 && timer.warnedLevel !== "warning") {
        displayElement.classList.add("warningText");
        timer.warnedLevel = "warning";
    }
    else if (remaining < 30 && timer.warnedLevel !== "danger") {
        displayElement.classList.remove("warningText");
        displayElement.classList.add("dangerText");
        timer.warnedLevel = "danger";
    }
}

async function createRequestBody() {
    var totalTime = extractSeconds(document.getElementById("globalTimer").textContent);
    const employeeIds = document.getElementsByClassName("employeeId")
    const employeeTimes = Array.from(document.getElementsByClassName("employeeTime"))
    const employeeNotes = document.getElementsByClassName("employeeNotes")

    for (let i = 0; i < employeeTimes.length; i += 1) {
        employeeTimes[i] = extractSeconds(employeeTimes[i].textContent)
    }

    const standUpsInfo = new Array;
    for (let i = 0; i < counter; i += 1) {
        standUpsInfo.push({
            devId: Number(employeeIds[i].textContent),
            durationMins: Number(employeeTimes[i]),
            notes: String(employeeNotes[i].value)
        })
    }

    const requestBody = {
        date: dateData = getTodaysDate(),
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
        window.location.href = "dashboard.html";
    }
    catch (error) {
        console.error(error.message);
    }
}

function getTodaysDate() {
    const now = new Date;
    const todayDate = now.toLocaleDateString();
    const formatteddDate = formatdDate(todayDate);

    const currentTime = now.toLocaleTimeString();

    return formatteddDate + "T" + currentTime + "Z"
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

function timeToSeconds(time) {
    let parts = time.split(':');
    return (+parts[0]) * 3600 + (+parts[1]) * 60 + (+parts[2]);
}

function secondsToTime(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let secs = Math.round(seconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getQueryParameter(parameterName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(parameterName);
}