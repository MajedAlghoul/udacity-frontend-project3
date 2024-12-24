/* Global Variables */
const generate = document.getElementById("generate");
const zipInput = document.getElementById("zip");
const feelingsInput = document.getElementById("feelings");
const temp = document.getElementById("temp");
const date = document.getElementById("date");
const content = document.getElementById("content");
const emptyTitle = document.getElementsByClassName("title")[0];
const entryHolder = document.getElementById("entryHolder");

//openweathermap API key
const apiKey = "&units=imperial";

//===============================================================
// Main function to run when page loads
run();

//===============================================================
async function run() {
  //pull data from server to initialize the UI
  await pullServer();

  //attach event listener to the generate button
  generate.addEventListener("click", updateData);
}

//pull data already stored from server
async function pullServer() {
  try {
    console.log("Fetching data...");
    //GET request on /all endpoint
    const request = await fetch("http://localhost:8000/all", {
      method: "GET",
      credentials: "same-origin",
    });

    const data = await request.json();
    console.log("Data received");

    //update UI with the data if found
    if (Object.keys(data).length > 0) {
      updateUI(data.newDate, data.temprature, data.feelings);
    } else {
      throw new Error("No data found");
    }
  } catch (error) {
    //if no data found, hide feeling box and show empty title
    entryHolder.style.display = "none";
  }
}

function updateUI(newDate, temprature, feelings) {
  //fill the UI with the data
  date.innerHTML = "Last Updated: " + newDate;
  temp.innerHTML = Math.round(temprature) + " °";
  content.innerHTML = feelings;

  //show the entry holder and hide the empty title
  emptyTitle.style.display = "none";
  entryHolder.style.display = "flex";

  //clear the input fields
  feelingsInput.value = "";
  zipInput.value = "";
}

async function updateData() {
  //check if zip code is entered
  if (zipInput.value === "") {
    alert("Please enter a zip code");
    return;
  }

  console.log("Generating data...");

  //get the weather data
  const temprature = await getWeatherData(zipInput.value);
  //prepare the other data
  const feelings = feelingsInput.value;
  const d = new Date();
  const newDate = d.getMonth() + "." + d.getDate() + "." + d.getFullYear();

  updateUI(newDate, temprature, feelings);

  //update the server with the new data
  await updateServer(newDate, temprature, feelings);
}

async function getWeatherData(zip) {
  try {
    //get the latitude and longitude of the zip code
    const zipURL = `http://api.openweathermap.org/geo/1.0/zip?zip=${zip}&appid=${apiKey}`;

    const response = await fetch(zipURL);
    const data = await response.json();
    const lat = data.lat;
    const lon = data.lon;

    //get the weather data using the latitude and longitude
    const weatherURL = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    const weatherResponse = await fetch(weatherURL);
    const weatherData = await weatherResponse.json();

    return weatherData.main.temp;
  } catch (error) {
    //if zip code is invalid, show an alert
    alert("Invalid zip code");
    return;
  }
}

// Update the server with the new data
async function updateServer(newDate, temprature, feelings) {
  const entry = { temprature, newDate, feelings };
  //POST request on /add endpoint
  fetch("http://localhost:8000/add", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entry),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    });
}
