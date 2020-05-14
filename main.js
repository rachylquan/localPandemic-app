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
}

function displayStateResults([{location, stats}, {news}]) {
console.log(news);
console.log(location);
console.log(stats);
  displayStateStats(location, stats);
  displayStateNews(news);

  // show results
  $('.state-results-container').removeClass('hidden');
}

function getStateData(state) {
  const location = "US-" + state;
  const statsUrl = searchStatsURL + location;
  const newsUrl = searchNewsURL + location;
  
  console.log(statsUrl);
  console.log(newsUrl);

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

function watchForm() {
  $('form').submit(event =>{
    event.preventDefault();
    const state = $('#js-state').val();
    getStateData(state);
  });
}

$(watchForm);