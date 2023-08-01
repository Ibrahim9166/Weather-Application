const cityList = $("#city-list");
const cities = [];
const key = "02e7aa4ac054b4e0ad1252478ddcb57d";

// Format current day
function formatDay(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${date.getFullYear()}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
}

// Initialize the application
function init() {
  const storedCities = JSON.parse(localStorage.getItem("cities")) || [];

  cities.push(...storedCities);
  renderCities();
}

// Store cities in local storage
function storeCities() {
  localStorage.setItem("cities", JSON.stringify(cities));
}

// Render the list of cities
function renderCities() {
  cityList.empty();

  cities.forEach(city => {
    const li = $("<li>").text(city).attr("class", "list-group-item").attr("data-city", city);
    cityList.prepend(li);
  });

  if (cities.length > 0) {
    getResponseWeather(cities[0]);
  }
}

// Add city when the form is submitted
$("#add-city").on("click", function(event) {
  event.preventDefault();
  const cityInput = $("#city-input");
  const city = cityInput.val().trim();

  if (city === "") {
    return;
  }

  cities.push(city);
  cityInput.val("");
  storeCities();
  renderCities();
});

// Get weather response for a city
function getResponseWeather(cityName) {
  const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${key}`;

  $("#today-weather").empty();

  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    const cityTitle = $("<h3>").text(`${response.name} ${formatDay(new Date())}`);
    const cityTemperature = $("<p>").text(`Temperature: ${parseInt(response.main.temp * 9/5 - 459)} °F`);
    const cityHumidity = $("<p>").text(`Humidity: ${response.main.humidity} %`);
    const cityWindSpeed = $("<p>").text(`Wind Speed: ${response.wind.speed} MPH`);
    const coordLon = response.coord.lon;
    const coordLat = response.coord.lat;
    const queryURL2 = `https://api.openweathermap.org/data/2.5/uvi?appid=${key}&lat=${coordLat}&lon=${coordLon}`;

    $("#today-weather").append(cityTitle, cityTemperature, cityHumidity, cityWindSpeed);

    $.ajax({
      url: queryURL2,
      method: "GET"
    }).then(function(responseuv) {
      const cityUV = $("<span>").text(responseuv.value);
      const cityUVp = $("<p>").text("UV Index: ").append(cityUV);
      
      $("#today-weather").append(cityUVp);

      if (responseuv.value > 0 && responseuv.value <= 2) {
        cityUV.attr("class", "green");
      } else if (responseuv.value > 2 && responseuv.value <= 5) {
        cityUV.attr("class", "yellow");
      } else if (responseuv.value > 5 && responseuv.value <= 7) {
        cityUV.attr("class", "orange");
      } else if (responseuv.value > 7 && responseuv.value <= 10) {
        cityUV.attr("class", "red");
      } else {
        cityUV.attr("class", "purple");
      }
    });

    const queryURL3 = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${key}`;

    $.ajax({
      url: queryURL3,
      method: "GET"
    }).then(function(response5day) {
      $("#boxes").empty();

      for (let i = 0, j = 0; j <= 5; i += 8) {
        const fivedayDiv = $("<div>").attr("class", "col-3 m-2 bg-primary");
        const d = new Date(response5day.list[i].dt * 1000);
        const dayOutput = formatDay(d);
        const fivedayh4 = $("<h6>").text(dayOutput);
        const imgtag = $("<img>");
        const skyconditions = response5day.list[i].weather[0].main;

        if (skyconditions === "Clouds") {
          imgtag.attr("src", "https://img.icons8.com/color/48/000000/cloud.png");
        } else if (skyconditions === "Clear") {
          imgtag.attr("src", "https://img.icons8.com/color/48/000000/summer.png");
        } else if (skyconditions === "Rain") {
          imgtag.attr("src", "https://img.icons8.com/color/48/000000/rain.png");
        }

        const pTemperatureK = response5day.list[i].main.temp;
        const pTemperature = $("<p>").text(`Temperature: ${parseInt(pTemperatureK * 9/5 - 459)} °F`);
        const pHumidity = $("<p>").text(`Humidity: ${response5day.list[i].main.humidity} %`);

        fivedayDiv.append(fivedayh4, imgtag, pTemperature, pHumidity);
        $("#boxes").append(fivedayDiv);
        j++;
      }
    });
  });
}

// Event delegation for city list items
cityList.on("click", "li", function() {
  const city = $(this).attr("data-city");
  getResponseWeather(city);
});

// Initialize the application
init();
