const apiKey = 'dc7a96fc9f506ecab88343674023ba51'; // Replace with your actual API key from OpenWeatherMap

const cityInput = document.getElementById('cityInput');
const searchButton = document.getElementById('searchButton');
const currentLocationButton = document.getElementById('currentLocation').querySelector('button');

const cityNameElement = document.getElementById('cityName');
const weatherIconElement = document.getElementById('weatherIcon');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');
const hourlyForecastElement = document.getElementById('hourlyForecast');
const weeklyForecastElement = document.getElementById('weeklyForecast');

searchButton.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        fetchWeatherData(city);
    }
});

currentLocationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherDataByCoordinates(lat, lon);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

async function fetchWeatherData(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
        const data = await response.json();
        if (data.cod === 200) {
            updateWeatherInfo(data);
            fetchForecastData(data.coord.lat, data.coord.lon);
        } else {
            alert('City not found!');
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

async function fetchWeatherDataByCoordinates(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        const data = await response.json();
        updateWeatherInfo(data);
        fetchForecastData(lat, lon);
    } catch (error) {
        console.error('Error fetching weather data by coordinates:', error);
    }
}

async function fetchForecastData(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        const data = await response.json();
        updateForecastInfo(data);
    } catch (error) {
        console.error('Error fetching forecast data:', error);
    }
}

function updateWeatherInfo(data) {
    cityNameElement.textContent = data.name;
    weatherIconElement.style.backgroundImage = `url(http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png)`;
    temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
    descriptionElement.textContent = data.weather[0].description;
    updateBackground(data.weather[0].main);
}

function updateForecastInfo(data) {
    hourlyForecastElement.innerHTML = '';
    weeklyForecastElement.innerHTML = '';

    const hourlyData = data.list.slice(0, 8); // Next 24 hours (3-hour intervals)
    const weeklyData = data.list.filter(item => item.dt_txt.includes('12:00:00')); // Daily at 12:00 PM

    hourlyData.forEach(item => {
        const hourElement = document.createElement('div');
        hourElement.className = 'forecast-item';
        hourElement.innerHTML = `
            <div class="forecast-time">${new Date(item.dt_txt).getHours()}:00</div>
            <div class="forecast-icon" style="background-image: url(http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png);"></div>
            <div class="forecast-temp">${Math.round(item.main.temp)}°C</div>
        `;
        hourlyForecastElement.appendChild(hourElement);
    });

    weeklyData.forEach(item => {
        const dayElement = document.createElement('div');
        dayElement.className = 'forecast-item';
        dayElement.innerHTML = `
            <div class="forecast-day">${new Date(item.dt_txt).toLocaleDateString('en-US', { weekday: 'long' })}</div>
            <div class="forecast-icon" style="background-image: url(http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png);"></div>
            <div class="forecast-temp">${Math.round(item.main.temp)}°C</div>
        `;
        weeklyForecastElement.appendChild(dayElement);
    });
}

function updateBackground(weatherCondition) {
    const weatherBackgrounds = {
        Clear: 'linear-gradient(135deg, #FFD700, #FFA500)',
        Clouds: 'linear-gradient(135deg, #D3D3D3, #696969)',
        Rain: 'linear-gradient(135deg, #87CEFA, #4682B4)',
        Snow: 'linear-gradient(135deg, #FFFFFF, #B0E0E6)',
        Thunderstorm: 'linear-gradient(135deg, #4B0082, #800080)',
        Drizzle: 'linear-gradient(135deg, #ADD8E6, #4682B4)',
        Atmosphere: 'linear-gradient(135deg, #708090, #2F4F4F)',
    };

    const background = weatherBackgrounds[weatherCondition] || 'linear-gradient(135deg, #2b5876, #4e4376)';
    document.querySelector('.app-container').style.background = background;
}
