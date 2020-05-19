'use strict';

const subscriptionKey = "6ea9f93d63424313806ab35bbbbcc97e";
const searchStatsURL = "https://api.smartable.ai/coronavirus/stats/";
const searchNewsURL = "https://api.smartable.ai/coronavirus/news/";

function displayStateStats(location, stats) {
  // empty state name and list
  $('.state-name').empty();
  $('.state-stats-list').empty();

  // add state name
  $('.state-name').append(`${location.provinceOrState}`);

  // add stats
  $('.state-stats-list').append(`
    <li><span class="stat-label">Total Confirmed Cases: </span>${stats.totalConfirmedCases}</li>
    <li><span class="stat-label">Newly Confirmed Cases: </span>${stats.newlyConfirmedCases}</li>
    <li><span class="stat-label">Total Deaths: </span>${stats.totalDeaths}</li>
    <li><span class="stat-label">New Deaths: </span>${stats.newDeaths}</li>
    <li><span class="stat-label">Total Recovered Cases: </span>${stats.totalRecoveredCases}</li>
    <li><span class="stat-label">Newly Recovered Cases: </span>${stats.newlyRecoveredCases}</li>
  `);
}

function displayStateNews(news) {
  // empty news
  $('.state-news-list').empty();
  if (news.length !== 0) {
    // add each news article
    for (let i = 0; i < news.length; i++) {
      $('.state-news-list').append(`
        <li class="news-article-card">
        <p>
        ${news[i].publishedDateTime}
        ${news[i].provider.name}</p>
        <h3>${news[i].title}</h3>
        <p>${news[i].excerpt}</p>
        <a href="${news[i].webUrl}" target="_blank">Read More</a>
        </li>
      `);
    }
  } else {
    $('.state-news-list').append(`
      <li>No news articles added today.</li>
    `);
  }
}

function displayCountyData(countyData) {
  $('.county-stats-list').empty();

  $('.county-stats-list').append(`
    <li><span class="stat-label">Total Confirmed Cases: </span>${countyData.totalConfirmedCases}</li>
    <li><span class="stat-label">Newly Confirmed Cases: </span>${countyData.newlyConfirmedCases}</li>
    <li><span class="stat-label">Total Deaths: </span>${countyData.totalDeaths}</li>
    <li><span class="stat-label">New Deaths: </span>${countyData.newDeaths}</li>
    <li><span class="stat-label">Total Recovered Cases: </span>${countyData.totalRecoveredCases}</li>
    <li><span class="stat-label">Newly Recovered Cases: </span>${countyData.newlyRecoveredCases}</li>
  `);

  $('.county-stats-list').removeClass('hidden');
}

function watchCountyForm(breakdowns) {
  $('#js-county-form').submit(event =>{
    event.preventDefault();
    const county = $('#js-county').val();
    for (let i = 0; i < breakdowns.length; i++) {
      if (breakdowns[i].location.county === county) {
        const countyData = breakdowns[i];
        displayCountyData(countyData);
      }
    }
  });
}

function createCountyForm(countyList) {
  $('#js-county').empty();

  $('#js-county').append(` 
  <option disabled value selected> -- select a county -- </option>
  `);

  for (let i = 0; i < countyList.length; i++) {
    $('#js-county').append(`
    <option value="${countyList[i].location.county}">${countyList[i].location.county}</option>
    `);
  }
}

function displayStateResults([{location, stats}, {news}]) {
  $('.js-error-message').empty();
  $('.error-container').addClass('hidden');
  $('.county-stats-list').addClass('hidden');
  displayStateStats(location, stats);
  displayStateNews(news);
  const countyList = stats.breakdowns;
  createCountyForm(countyList);
  watchCountyForm(stats.breakdowns);

  // show results
  $('.state-results-container').removeClass('hidden');
}

function getStateData(state) {
  const location = "US-" + state;
  const statsUrl = searchStatsURL + location;
  const newsUrl = searchNewsURL + location;

  const options = {
    headers: new Headers({
      "Subscription-Key": subscriptionKey})
  };

  const urls = [
    statsUrl,
    newsUrl
  ];

  Promise.all(urls.map(url => 
    fetch(url, options)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .catch(err => {
        $('.results-container').addClass('hidden');
        $('.error-container').removeClass('hidden');
        $('#js-error-message').empty();
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
      })
    ))
    .then(data => {
      displayStateResults(data);
    })
}

function watchStateForm() {
  $('#js-state-form').submit(event =>{
    event.preventDefault();
    const state = $('#js-state').val();
    getStateData(state);
  });
}

$(watchStateForm);