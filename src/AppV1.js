// import React from 'react';
// import Weather from './components/Weather';
// import Input from './components/Input';

// function convertToFlag(countryCode) {
//   const codePoints = countryCode
//     .toUpperCase()
//     .split('')
//     .map((char) => 127397 + char.charCodeAt());
//   return String.fromCodePoint(...codePoints);
// }

// class App extends React.Component {
//   state = {
//     location: '',
//     isLoading: false,
//     displayLocation: '',
//     weather: {},
//   };

//   // async fetchWeather() {
//   fetchWeather = async () => {
//     if (this.state.location.length < 2) return this.setState({ weather: {} });

//     try {
//       this.setState({ isLoading: true });
//       console.log('IS LOADING START:', this.state.isLoading);

//       // 1) Getting location (geocoding)
//       const geoRes = await fetch(
//         `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
//       );
//       const geoData = await geoRes.json();
//       console.log(geoData);

//       if (!geoData.results) throw new Error('Location not found');

//       const { latitude, longitude, timezone, name, country_code } =
//         geoData.results.at(0);
//       this.setState({
//         displayLocation: `${name} ${convertToFlag(country_code)}`,
//       });

//       // 2) Getting actual weather
//       const weatherRes = await fetch(
//         `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
//       );
//       const weatherData = await weatherRes.json();
//       this.setState({ weather: weatherData.daily });
//     } catch (err) {
//       console.error(err);
//     } finally {
//       this.setState({ isLoading: false });
//       console.log('IS LOADING END:', this.state.isLoading);
//     }
//   };

//   setLocation = (e) => this.setState({ location: e.target.value });

//   //Similar to a useEffect with an empty dependency array, only running on mounts but not rerenders
//   componentDidMount() {
//     // this.fetchWeather();
//     this.setState({ location: localStorage.getItem('location') || '' });
//   }

//   //Similar to a useEffect with some dependency in the array
//   componentDidUpdate(prevProps, prevState) {
//     if (this.state.location !== prevState.location) {
//       this.fetchWeather();
//     }

//     localStorage.setItem('location', this.state.location);
//   }

//   render() {
//     return (
//       <div className="app">
//         <h1>Local Weather</h1>

//         {/* Input Section */}
//         <div className="input-container">
//           <Input
//             location={this.state.location}
//             onChangeLocation={this.setLocation}
//           />
//         </div>

//         {/* Show Loader If Loading */}
//         {this.state.isLoading && <p className="loader">Loading...</p>}

//         {/* Weather Section Below Input */}
//         {this.state.weather.weathercode && (
//           <div className="weather-container">
//             <Weather
//               weather={this.state.weather}
//               location={this.state.displayLocation}
//             />
//           </div>
//         )}
//       </div>
//     );
//   }
// }

// export default App;

import React from 'react';
import Weather from './components/Weather';
import Input from './components/Input';

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

class App extends React.Component {
  state = {
    location: '',
    isLoading: false,
    displayLocation: '',
    weather: {},
    showWeather: false,
  };

  debounceTimeout = null;

  fetchWeather = async () => {
    if (this.state.location.length < 2) {
      this.setState({ weather: {} });
      return;
    }

    try {
      this.setState({ isLoading: true });

      // Fetch geolocation data
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results) throw new Error('Location not found');

      const { latitude, longitude, timezone, name, country_code } =
        geoData.results[0];

      this.setState({
        displayLocation: `${name} ${convertToFlag(country_code)}`,
      });

      // Fetch weather data
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();

      this.setState({ weather: weatherData.daily });
      this.setState({ weather: weatherData.daily, showWeather: true });
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  setLocation = (e) => {
    const newLocation = e.target.value;

    this.setState({ location: newLocation });

    // Debounce API Calls
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    this.debounceTimeout = setTimeout(() => {
      this.fetchWeather();
    }, 400);
  };

  // Clear input when user clicks away, reloads, or clicks the button
  clearInput = () => {
    this.setState({ location: '' });
  };

  componentDidMount() {
    const savedLocation = localStorage.getItem('location') || '';
    this.setState({ location: savedLocation });
    this.setState({ location: '' }); // Clear input on reload
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.location !== prevState.location) {
      localStorage.setItem('location', this.state.location);
    }
  }

  render() {
    return (
      <div className="app">
        <h1>Local Weather</h1>

        {/* Input Section */}
        <div className="input-container">
          <div className="input-wrapper">
            <Input
              location={this.state.location}
              onChangeLocation={this.setLocation}
              onBlur={this.clearInput} // 👈 Clears input when focus is lost
            />
            <button onClick={this.clearInput} className="clear-button">
              ✖
            </button>{' '}
            {/* 👈 Updated Clear Button for a more seamless UI */}
          </div>
        </div>

        {/* Show Loader If Loading */}
        {this.state.isLoading && <p className="loader">Loading...</p>}

        {/* Weather Section Below Input */}
        <div
          className={`weather-container ${
            this.state.showWeather ? 'show' : ''
          }`}
        >
          {this.state.weather.weathercode && (
            <Weather
              weather={this.state.weather}
              location={this.state.displayLocation}
            />
          )}
        </div>
      </div>
    );
  }
}

export default App;
