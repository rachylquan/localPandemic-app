'use strict';

// variables for subscription key and api urls
const searchStatsURL = 'https://coronavirus-smartable.p.rapidapi.com/stats/v1/';
const searchNewsURL = 'https://coronavirus-smartable.p.rapidapi.com/news/v1/';

// get the state name and the stats for the state selected
function displayStateStats(location, updatedDateTime, stats) {
  // empty state name, date and time
  $('.state-name').empty();
  $('.state-stats-list').empty();
  $('.updated-date').empty();
  $('.updated-time').empty();

  // add state name
  $('.state-name').append(`${location.provinceOrState}`);

  // variables for last updated
  const updateDate = moment(updatedDateTime).format('MM/DD/YYYY');
  const updateTime = moment(updatedDateTime).format('HH:MM');

  // add date and time
  $('.updated-date').append(updateDate);
  $('.updated-time').append(updateTime);

  // add stats
  $('.state-stats-list').append(`
    <li class="stat">${stats.totalConfirmedCases}
    <span class="stat-label">Total Confirmed Cases</span>
    <span class="new-stat">${stats.newlyConfirmedCases} today</span>
    </li>

    <li class="stat">${stats.totalDeaths}
    <span class="stat-label">Total Deaths</span>
    <span class="new-stat">${stats.newDeaths} today</span>
    </li>

    <li class="stat">${stats.totalRecoveredCases}
    <span class="stat-label">Total Recovered Cases</span>
    <span class="new-stat">${stats.newlyRecoveredCases} today</span>
    </li>
  `);
}

// add news articles
function displayStateNews(news) {
  // empty news list
  $('.state-news-list').empty();

  // if there are news articles add the html for each article; otherwsise, show a message saying no news articles
  if (news.length !== 0) {
    news.forEach((article) => {
      const date = moment(article.publishedDateTime).format('MM-DD-YYYY');
      $('.state-news-list').append(`
        <li class="news-article-card">
         <p class="news-meta-container">
          <span class="news-meta-info date">${date}</span>
          <span class="news-meta-info">${article.provider.name}</span>
        </p>
          <h3 class="article-title">${article.title}</h3>
          <p>${article.excerpt}</p>
          <a class="article-link" href="${article.webUrl}" target="_blank">Read More</a>\
        </li>
      `);
    });
  } else {
    $('.state-news-list').append(`
      <li>No news articles added today.</li>
    `);
  }
}

// display the county stats
function displayCountyData(countyData) {
  //empty the county stats
  $('.county-stats-list').empty();

  // html for county stats
  $('.county-stats-list').append(`
    <li class="stat">${countyData.totalConfirmedCases}
    <span class="stat-label">Total Confirmed Cases</span>
    <span class="new-stat">${countyData.newlyConfirmedCases} today</span>
    </li>

    <li class="stat">${countyData.totalDeaths}
    <span class="stat-label">Total Deaths</span>
    <span class="new-stat">${countyData.newDeaths} today</span>
    </li>

    <li class="stat">${countyData.totalRecoveredCases}
    <span class="stat-label">Total Recovered</span>
    <span class="new-stat">${countyData.newlyRecoveredCases} today</span>
    </li>
  `);

  // show the county list
  $('.county-stats-list').removeClass('hidden');
}

// watch for when a user searches for county stats
function watchCountyForm(countyList) {
  $('#js-county-form').submit((event) => {
    event.preventDefault();

    // get the value of the county selected
    const countySelected = $('#js-county').val();

    // display county stats for the county selected
    countyList.forEach((county) => {
      if (county.location.county === countySelected) {
        const countyData = county;
        displayCountyData(countyData);
      }
    });
  });
}

// create a county form
function createCountyForm(countyList) {
  // empty county list
  $('#js-county').empty();

  // add default value
  $('#js-county').append(` 
  <option disabled value selected> -- select a county -- </option>
  `);
  // for each county add an option
  countyList.forEach((county) => {
    $('#js-county').append(`
    <option value="${county.location.county}">${county.location.county}</option>
    `);
  });
}

// show state results
function displayStateResults([{ location, updatedDateTime, stats }, { news }]) {
  // empty the error message and county list, and hide the error container
  $('.js-error-message').empty();
  $('.error-container').addClass('hidden');
  $('.county-stats-list').addClass('hidden');

  // send data to display the stats and news
  displayStateStats(location, updatedDateTime, stats);
  displayStateNews(news);

  // show results
  $('.state-results-container').removeClass('hidden');
}

// get data from smartable api
function getStateData(state) {
  const location = 'US-' + state;
  const statsUrl = searchStatsURL + location + '/';
  const newsUrl = searchNewsURL + location + '/';

  const options = {
    headers: new Headers({
      'x-rapidapi-key': '0b0af2a8e1msh81bdee91f1b3cd3p1a38f0jsnef494e8e55c3',
      'x-rapidapi-host': 'coronavirus-smartable.p.rapidapi.com',
    }),
  };

  const urls = [statsUrl, newsUrl];

  Promise.all(
    urls.map((url) =>
      fetch(url, options)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error(response.statusText);
        })
        .catch((err) => {
          // hide any results
          $('.state-results-container').addClass('hidden');

          // empty error message
          $('#js-error-message').empty();

          // add error message
          $('#js-error-message').text(`Something went wrong: ${err.message}`);

          // show error message
          $('.error-container').removeClass('hidden');
        })
    )
  ).then((data) => {
    // move header to the top of the page
    $('header').addClass('top');

    // send data to get state results
    displayStateResults(data);

    // variable for county information
    const countyList = data[0].stats.breakdowns;

    //if there are counties send them to county forma and watch the county form; otherwise, hide the county container
    if (countyList.length !== 0) {
      $('.county-container').removeClass('hidden');
      createCountyForm(countyList);
      watchCountyForm(countyList);
    } else {
      $('.county-container').addClass('hidden');
    }
  });
}

function watchStateForm() {
  $('#js-state-form').submit((event) => {
    event.preventDefault();
    // get state selected
    const state = $('#js-state').val();
    getStateData(state);
  });
}

$(watchStateForm);

// reset page when you click the logo
function watchHomeClick() {
  $('.branding-link').click((event) => {
    event.preventDefault();
    $('main').addClass('hidden');
    $('header').removeClass('top');
  });
}

$(watchHomeClick);
