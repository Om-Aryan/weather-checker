

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";



function log(message, type = "sync") {
  const output = document.getElementById("consoleOutput");
  const line = document.createElement("div");
  line.className = "log-" + type;
  line.textContent = message;
  output.appendChild(line);
  console.log(message);
}

function clearConsole() {
  document.getElementById("consoleOutput").innerHTML = "";
}



function getHistory() {
  const saved = localStorage.getItem("weatherHistory");
  return saved ? JSON.parse(saved) : [];
}

function saveToHistory(city) {
  let history = getHistory();

  
  const alreadyExists = history.find(c => c.toLowerCase() === city.toLowerCase());
  if (!alreadyExists) {
    history.unshift(city);       
    if (history.length > 5) {
      history.pop();             
    }
    localStorage.setItem("weatherHistory", JSON.stringify(history));
  }

  renderHistory();
}

function renderHistory() {
  const container = document.getElementById("historyContainer");
  container.innerHTML = "";

  const history = getHistory();

  history.forEach(function (city) {
    const btn = document.createElement("button");
    btn.className = "history-tag";
    btn.textContent = city;

    
    btn.onclick = function () {
      document.getElementById("cityInput").value = city;
      handleSearch();
    };

    container.appendChild(btn);
  });
}



async function getCoordinates(city) {
  const url = `${GEO_URL}?name=${city}&count=1&language=en&format=json`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("City not found");
  }

  const result = data.results[0];
  return {
    name: result.name,
    country: result.country,
    lat: result.latitude,
    lon: result.longitude
  };
}




async function getWeather(lat, lon) {
  const url = `${WEATHER_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=ms`;
  const response = await fetch(url);
  const data = await response.json();
  return data.current;
}



function getWeatherDescription(code) {
  if (code === 0)             return "Clear Sky";
  if (code <= 2)              return "Partly Cloudy";
  if (code === 3)             return "Overcast";
  if (code <= 49)             return "Foggy / Haze";
  if (code <= 59)             return "Drizzle";
  if (code <= 69)             return "Rain";
  if (code <= 79)             return "Snow";
  if (code <= 84)             return "Rain Showers";
  if (code <= 99)             return "Thunderstorm";
  return "Unknown";
}




async function fetchWeather(city) {

 
  log("Sync Start", "sync");
  log("Sync End", "sync");

  log("[ASYNC] Starting fetch...", "async");

  
  Promise.resolve().then(function () {
    log("Promise.then (Microtask)", "promise");
  });

  
  setTimeout(function () {
    log("setTimeout (Macrotask)", "macro");
  }, 0);

  
  try {

    const location = await getCoordinates(city);
    const weather = await getWeather(location.lat, location.lon);

    log("[ASYNC] Data received", "async");

    displayWeather(location, weather);
    saveToHistory(location.name);

  } catch (error) {
    log("[ERROR] " + error.message, "error");
    displayError(error.message);
  }
}




function displayWeather(location, weather) {
  const output = document.getElementById("weatherOutput");

  const city        = location.name + ", " + location.country;
  const temp        = weather.temperature_2m + " °C";
  const condition   = getWeatherDescription(weather.weather_code);
  const humidity    = weather.relative_humidity_2m + "%";
  const wind        = weather.wind_speed_10m + " m/s";

  output.innerHTML = `
    <div class="weather-row">
      <span class="weather-label">City</span>
      <span class="weather-value">${city}</span>
    </div>
    <div class="weather-row">
      <span class="weather-label">Temp</span>
      <span class="weather-value">${temp}</span>
    </div>
    <div class="weather-row">
      <span class="weather-label">Weather</span>
      <span class="weather-value">${condition}</span>
    </div>
    <div class="weather-row">
      <span class="weather-label">Humidity</span>
      <span class="weather-value">${humidity}</span>
    </div>
    <div class="weather-row">
      <span class="weather-label">Wind</span>
      <span class="weather-value">${wind}</span>
    </div>
  `;
}




function displayError(message) {
  const output = document.getElementById("weatherOutput");
  output.innerHTML = `<span class="error-msg">${message}</span>`;
}





function handleSearch() {
  const city = document.getElementById("cityInput").value.trim();

  if (!city) {
    displayError("Please enter a city name.");
    return;
  }

  clearConsole();
  document.getElementById("weatherOutput").innerHTML =
    `<span class="placeholder-msg">Loading...</span>`;

  fetchWeather(city);
}



document.getElementById("cityInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    handleSearch();
  }
});



window.onload = function () {
  renderHistory();
};