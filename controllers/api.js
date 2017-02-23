'use strict';

const async = require('async');
const request = require('request');
const cheerio = require('cheerio');
const graph = require('fbgraph');
const tumblr = require('tumblr.js');
const GitHub = require('github');
const Linkedin = require('node-linkedin')(process.env.LINKEDIN_ID, process.env.LINKEDIN_SECRET, process.env.LINKEDIN_CALLBACK_URL);
const foursquare = require('node-foursquare')({
  secrets: {
    clientId: process.env.FOURSQUARE_ID,
    clientSecret: process.env.FOURSQUARE_SECRET,
    redirectUrl: process.env.FOURSQUARE_REDIRECT_URL
  }
});

/**
 * GET /api
 * List of API examples.
 */
exports.getApi = (req, res) => {
  res.render('api/index', {
    title: 'API Examples'
  });
};

/**
 * GET /api/foursquare
 * Foursquare API example.
 */
exports.getFoursquare = (req, res, next) => {
  const token = req.user.tokens.find(token => token.kind === 'foursquare');
  async.parallel({
    trendingVenues: (callback) => {
      foursquare.Venues.getTrending('40.7222756', '-74.0022724', { limit: 50 }, token.accessToken, (err, results) => {
        callback(err, results);
      });
    },
    venueDetail: (callback) => {
      foursquare.Venues.getVenue('49da74aef964a5208b5e1fe3', token.accessToken, (err, results) => {
        callback(err, results);
      });
    },
    userCheckins: (callback) => {
      foursquare.Users.getCheckins('self', null, token.accessToken, (err, results) => {
        callback(err, results);
      });
    }
  },
  (err, results) => {
    if (err) { return next(err); }
    res.render('api/foursquare', {
      title: 'Foursquare API',
      trendingVenues: results.trendingVenues,
      venueDetail: results.venueDetail,
      userCheckins: results.userCheckins
    });
  });
};

/**
 * GET /api/tumblr
 * Tumblr API example.
 */
exports.getTumblr = (req, res, next) => {
  const token = req.user.tokens.find(token => token.kind === 'tumblr');
  const client = tumblr.createClient({
    consumer_key: process.env.TUMBLR_KEY,
    consumer_secret: process.env.TUMBLR_SECRET,
    token: token.accessToken,
    token_secret: token.tokenSecret
  });
  client.posts('mmosdotcom.tumblr.com', { type: 'photo' }, (err, data) => {
    if (err) { return next(err); }
    res.render('api/tumblr', {
      title: 'Tumblr API',
      blog: data.blog,
      photoset: data.posts[0].photos
    });
  });
};

/**
 * GET /api/scraping
 * Web scraping example using Cheerio library.
 */
exports.getScraping = (req, res, next) => {
  request.get('https://news.ycombinator.com/', (err, request, body) => {
    if (err) { return next(err); }
    const $ = cheerio.load(body);
    const links = [];
    $('.title a[href^="http"], a[href^="https"]').each((index, element) => {
      links.push($(element));
    });
    res.render('api/scraping', {
      title: 'Web Scraping',
      links
    });
  });
};

/**
 * GET /api/github
 * GitHub API Example.
 */
exports.getGithub = (req, res, next) => {
  const github = new GitHub();
  github.repos.get({ user: 'sahat', repo: 'hackathon-starter' }, (err, repo) => {
    if (err) { return next(err); }
    res.render('api/github', {
      title: 'GitHub API',
      repo
    });
  });
};

/**
 * GET /api/aviary
 * Aviary image processing example.
 */
exports.getAviary = (req, res) => {
  res.render('api/aviary', {
    title: 'Aviary API'
  });
};

/**
 * GET /api/nyt
 * New York Times API example.
 */
exports.getNewYorkTimes = (req, res, next) => {
  const query = {
    'list-name': 'young-adult',
    'api-key': process.env.NYT_KEY
  };
  request.get({ url: 'http://api.nytimes.com/svc/books/v2/lists', qs: query }, (err, request, body) => {
    if (err) { return next(err); }
    if (request.statusCode === 403) {
      return next(new Error('Invalid New York Times API Key'));
    }
    const books = JSON.parse(body).results;
    res.render('api/nyt', {
      title: 'New York Times API',
      books
    });
  });
};

/**
 * GET /api/linkedin
 * LinkedIn API example.
 */
exports.getLinkedin = (req, res, next) => {
  const token = req.user.tokens.find(token => token.kind === 'linkedin');
  const linkedin = Linkedin.init(token.accessToken);
  linkedin.people.me((err, $in) => {
    if (err) { return next(err); }
    res.render('api/linkedin', {
      title: 'LinkedIn API',
      profile: $in
    });
  });
};

/**
 * GET /api/upload
 * File Upload API example.
 */

exports.getFileUpload = (req, res) => {
  res.render('api/upload', {
    title: 'File Upload'
  });
};

exports.postFileUpload = (req, res) => {
  req.flash('success', { msg: 'File was uploaded successfully.' });
  res.redirect('/api/upload');
};


exports.getGoogleMaps = (req, res) => {
  res.render('api/google-maps', {
    title: 'Google Maps API'
  });
};
