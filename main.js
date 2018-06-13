function getWeather(city) {
  // Fetch to return object containing relevant weather data
  const openWeatherApiKey = "c35ab95f79543c0b61bd103e6727ff56";
  const openUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${openWeatherApiKey}`;
  return fetch(openUrl)
    .then(response => response.json())
    .then(data => {
      return {
        location: data.name,
        description: data.weather[0].description,
        temp: {
          current: data.main.temp,
          min: data.main.temp_min,
          max: data.main.temp_max
        }
      };
    });
}
function sanitizeUnsplash(photo) {
  // Returns object containing relevant photo data

  return {
    id: photo.id,
    thumb: photo.urls.thumb,
    reg: photo.urls.regular,
    credit: photo.user.name,
    colour: photo.color
  };
}
function getPhotos(weatherDesc) {
  // Main fetch from unsplash to get photo data
  const clientId =
    "a5255c4a078d28299fe58d2aa417021c6b430871ead65c6821e833966d41cddf";
  const url = `http://api.unsplash.com/search/photos?query=${weatherDesc}&client_id=${clientId}`;
  return fetch(url)
    .then(response => response.json())
    .then(photos =>
      photos.results.map(eachPhoto => sanitizeUnsplash(eachPhoto))
    ); // get photo data & create new array
}
//Utility functions
function query(eleID) {
  return document.querySelector(`#${eleID}`);
}
function createNode(eleID) {
  return document.createElement(eleID);
}
function append(parent, eleID) {
  return parent.appendChild(eleID);
}

function displayMainPic(data, id = 0) {
  //html for displaying reg pic and credits
  const parent = query("photo");

  const srctoUse =
    id !== 0 ? data.photos.filter(photo => photo.id === id)[0] : data.photos[0];

  parent.innerHTML = `<img src=${srctoUse.reg} alt=${data.description}>`;

  const creditParent = query("credit-user");
  creditParent.innerHTML = data.photos[0].credit;
}

function displayWeather(data) {
  const parent = query("conditions");

  function tempConverter(temps) {
    const result = Object.values(temps).map(x => Math.round(x - 273.15));
    return ` ${result[0]}&#8451 min ${result[1]}&#8451 max ${result[2]}&#8451`;
  }
  tempConverter(data.temp);
  parent.innerHTML = `${data.location}: ${data.description} ${tempConverter(
    data.temp
  )}`;
}

function displayThumbnails(data) {
  const parent = query("thumbs");
  data.photos.forEach(img => {
    const child = createNode("a");
    child.setAttribute("id", img.id);
    child.setAttribute("href", img.reg);
    child.setAttribute("class", "thumbs__link");
    child.innerHTML = `<img src=${img.thumb} alt=${
      img.description
    } class='thumbs__link__img' data-color=${img.colour}>`;
    append(parent, child);
  });

  displayMainPic(data);
}

function submitRequest(city) {
  // reset image
  let ourWeather = {};
  getWeather(city).then(weather => {
    ourWeather = { ...ourWeather, ...weather };
    getPhotos(`${city} ${weather.description}`).then(photos => {
      ourWeather = { ...ourWeather, photos };
      displayThumbnails(ourWeather);
      displayWeather(ourWeather);
    });
  });
}

const currentThumbnail = query("thumbs");
currentThumbnail.addEventListener("click", function(event) {
  event.preventDefault();
  const mainImg = query("photo");
  mainImg.firstChild.src = event.path["0"].href;
  const body = document.querySelector("body");
  body.style.backgroundColor = event.path["0"].firstChild.dataset.color;
});

const searchButtonEle = query("search");

searchButtonEle.addEventListener("submit", event => {
  event.preventDefault();
  submitRequest(event.target["0"].value || "London");
});

// if ("geolocation" in navigator) {
//   let watchID = navigator.geolocation.watchPosition(function(position) {
//     console.log(position);
//     console.log(position.coords.latitude, position.coords.longitude);
//     submitRequest(position.coords.latitude, position.coords.longitude);
//   });
//   console.log(watchID);
// } else {
//   /* geolocation IS NOT available */
// }
