'use strict';

const subscriptionKey = "6ea9f93d63424313806ab35bbbbcc97e";
const searchStatsURL = "https://api.smartable.ai/coronavirus/stats/";
const searchNewsURL = "https://api.smartable.ai/coronavirus/news/";

function displayStateStats(location, updatedDateTime, stats) {
  // empty state name and list
  $('.state-name').empty();
  $('.state-stats-list').empty();
  $('.updated-date').empty();
  $('.updated-time').empty();

  // add state name
  $('.state-name').append(`${location.provinceOrState}`);

  // add last updated
  const updateDate = moment(updatedDateTime).format('MM/DD/YYYY');
  const updateTime = moment(updatedDateTime).format('HH:MM');
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

function displayStateNews(news) {
  // empty news
  $('.state-news-list').empty();
  // add each news article
  if (news.length !== 0) {
    news.forEach(article => {
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

function displayCountyData(countyData) {
  $('.county-stats-list').empty();

  $('.county-stats-list').append(`
    <li class="stat">${countyData.totalConfirmedCases}
    <span class="stat-label">Total Confirmed Cases</span>
    <span class="new-stat">${countyData.newlyConfirmedCases} today</span>
    </li>

    <li class="stat">${countyData.totalDeaths}
    <span class="stat-label">Total Confirmed Cases</span>
    <span class="new-stat">${countyData.newDeaths} today</span>
    </li>

    <li class="stat">${countyData.totalRecoveredCases}
    <span class="stat-label">Total Confirmed Cases</span>
    <span class="new-stat">${countyData.newlyRecoveredCases} today</span>
    </li>
  `);

  $('.county-stats-list').removeClass('hidden');
}

function watchCountyForm(countyList) {
  $('#js-county-form').submit(event =>{
    event.preventDefault();
    const countySelected = $('#js-county').val();
    countyList.forEach(county => {
      if (county.location.county === countySelected) {
        const countyData = county;
        displayCountyData(countyData);
      }
    });
  });
}

function createCountyForm(countyList) {
  // empty county list
  $('#js-county').empty();

  // add default value
  $('#js-county').append(` 
  <option disabled value selected> -- select a county -- </option>
  `);
  // for each county add an option
  countyList.forEach(county => {
    $('#js-county').append(`
    <option value="${county.location.county}">${county.location.county}</option>
    `);
  });
}

function displayStateResults([{location, updatedDateTime, stats}, {news}]) {
  $('.js-error-message').empty();
  $('.error-container').addClass('hidden');
  $('.county-stats-list').addClass('hidden');
  displayStateStats(location, updatedDateTime, stats);
  displayStateNews(news);

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
      $('header').addClass('top');
       
      displayStateResults(data);

      const countyList = data[0].stats.breakdowns;
      if (countyList.length !== 0) {
        $('.county-container').removeClass('hidden');
        createCountyForm(countyList);
        watchCountyForm(countyList);
        
      } else {
        $('.county-container').addClass('hidden');
      }
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

function watchHomeClick() {
  $('.branding-link').click(event => {
    event.preventDefault();
    $('main').addClass('hidden');
    $('header').removeClass('top');
  });
}

$(watchHomeClick);