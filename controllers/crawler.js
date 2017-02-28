const Xray = require('x-ray');

var x = Xray({
    filters: {
        trim: function(value) {
            return typeof value === 'string' ? value.trim() : value
        },
        formatString: function(value) {
          value = value.replace(/,\s*$/, '');
          return value.replace(/\w\S*/g, function(s){return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();});
        },
        formatPhoneUK: function(value) {
          // return typeof value === 'string' ? value.trim().split(' ').join('') : value
          if (typeof value === 'string') {
            value = value.trim().split(' ').join('');
            return value.replace(/^0/, '44');
          } else {
            return value;
          }
        }
    }
});

/**
 * GET /crawler/crawler
 * Renders the crawler page.
 */
exports.getCrawler = (req, res) => {
  res.render('crawler/crawler', {
      title: 'Intern Tools'
  });
};

/**
 * Passess a json object of UK locations to #json-locations.
 */
exports.getUkLocations = (req, res) => {
  var url = "https://www.yell.com/l/popular+locations.html";

  x(url, {
      locations: x('.findLinks--item', ['a | trim'])
  })(function(err, page) {
      res.json(page);
  })
};

/**
 * Passess a json object of US locations to #json-locations.
 */
exports.getUsLocations = (req, res) => {
  var url = "https://www.yell.com/l/popular+locations.html";

  x(url, {
      locations: x('.findLinks--item', ['a | trim'])
  })(function(err, page) {
      res.json(page);
  })
};

/**
 * Passess a json object to #results.
 */
exports.getData = (req, res) => {
  var website = req.query.website;
  var search = req.query.search;
  var location = req.query.location;

  console.log(website);
  if (website = 'Yell') {
    var url = "https://www.yell.com/s/" + search + "-" + location.split(' ').join('+') + ".html";
    x(url, {
        business: x('.businessCapsule', [{
                name: '.businessCapsule--title h2',
                phone: '.businessCapsule--telephone strong | formatPhoneUK',
                street_address: '.businessCapsule--address a span span:nth-child(1) | formatString',
                address_locality: '.businessCapsule--address a span span:nth-child(2) | formatString',
                postal_code: '.businessCapsule--address a span span:nth-child(3)',
                category: '.businessCapsule--classificationText | trim',
                website: '.businessCapsule--callToAction a@href',
                page_url: '.col-sm-24 a@href'
            }])
            .paginate('.pagination--next@href')
    })(function(err, page) {
        res.json(page);
    })
  } else {
    res.send('No data found');
  }

  // x(url, {
  //     business: x('.businessCapsule', [{
  //             name: '.businessCapsule--title h2',
  //             phone: '.businessCapsule--telephone strong | formatPhoneUK',
  //             street_address: '.businessCapsule--address a span span:nth-child(1) | formatString',
  //             address_locality: '.businessCapsule--address a span span:nth-child(2) | formatString',
  //             postal_code: '.businessCapsule--address a span span:nth-child(3)',
  //             category: '.businessCapsule--classificationText | trim',
  //             website: '.businessCapsule--callToAction a@href',
  //             page_url: '.col-sm-24 a@href'
  //         }])
  //         .paginate('.pagination--next@href')
  // })(function(err, page) {
  //     res.json(page);
  // })
};

var scrapeYell = function(search, location) {
  var url = "https://www.yell.com/s/" + search + "-" + location.split(' ').join('+') + ".html";
  x(url, {
      business: x('.businessCapsule', [{
              name: '.businessCapsule--title h2',
              phone: '.businessCapsule--telephone strong | formatPhoneUK',
              street_address: '.businessCapsule--address a span span:nth-child(1) | formatString',
              address_locality: '.businessCapsule--address a span span:nth-child(2) | formatString',
              postal_code: '.businessCapsule--address a span span:nth-child(3)',
              category: '.businessCapsule--classificationText | trim',
              website: '.businessCapsule--callToAction a@href',
              page_url: '.col-sm-24 a@href'
          }])
          .paginate('.pagination--next@href')
  })(function(err, page) {
      res.json(page);
  })
};
