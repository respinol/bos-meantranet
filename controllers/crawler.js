const Xray = require('x-ray');
const async = require('async');
const _ = require('lodash');

var x = Xray({
    filters: {
        trim: function(value) {
            return typeof value === 'string' ? value.trim() : value
        },
        formatString: function(value) {
            value = value.replace(/,\s*$/, '');
            return value.replace(/\w\S*/g, function(s) {
                return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
            });
        },
        formatPhoneUK: function(value) {
            if (typeof value === 'string') {
                value = value.trim().split(' ').join('');
                return value.replace(/^0/, '44');
            } else {
                return value;
            }
        },
        formatPhone: function(value) {
            return typeof value === 'string' ? value.trim().replace(/\D/g, '') : value
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
 * Passess a json object to #results.
 */
exports.getData = (req, res) => {
    var website = req.query.website;
    var country = req.query.country;

    var parameters = {
        location: req.query.location,
        category: req.query.category
    };

    if (country = 'United Kingdom') {
        async.series([
                function(callback) {
                    scrapeYell(parameters, function(data) {
                        console.log('scrapeYell ' + data.business.length);
                        callback(null, data.business);
                        return;
                    });
                }

            ],
            function(err, results) {
                if (err) {
                    callback(err);
                    return;
                }

                var page = { business: {} };
                console.log('Results ' + results.length);

                for (var i = 0; i < results.length; i++) {
                    _.merge(page.business, results[i]);
                }

                console.log('Page ' + page.length);
                res.json(page);
            });

    } else if (country == 'United States') {
        async.series([
                function(callback) {
                    scrapeYellowpages(parameters, function(data) {
                        console.log('scrapeYellowpages ' + data.business.length);
                        callback(null, data.business);
                        return;
                    });
                }

            ],
            function(err, results) {
                if (err) {
                    callback(err);
                    return;
                }


                var page = [];
                console.log('Results ' + results.length);

                for (var i = 0; i < results.length; i++) {
                    _.concat(page, results[i]);
                }
                console.log('Page ' + page.length);
                res.json(page);
            });
    }

    // if (website == 'Yell') {
    //     scrapeYell(parameters, function(page) {
    //         res.json(page);
    //     })
    //
    // } else if (website == 'Yellowpages') {
    //     scrapeYellowpages(parameters, function(page) {
    //         res.json(page);
    //     })
    //
    // } else if (website == 'Yelp') {
    //     scrapeYelp(parameters, function(page) {
    //         res.json(page);
    //     })
    // }
};

function scrapeYell(params, callback) {
    var url = "https://www.yell.com/s/" + params.category + "-" + params.location.split(' ').join('+') + ".html";
    console.log('Scraping ' + url);

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
    })(function(err, data) {
        console.log('Yell Total: ' + data.business.length);
        callback(data);
    })
}


function scrapeYellowpages(params, callback) {
    var url = url = "https://www.yellowpages.com/search?search_terms=" + params.category + "&geo_location_terms=" + params.location.split(' ').join('+');
    console.log('Scraping ' + url);

    x(url, {
        business: x('.v-card', [{
                name: '.n a',
                phone: '.phones.phone.primary | formatPhone',
                street_address: '.street-address | formatString',
                address_locality: '.locality | formatString',
                address_region: '.adr span:nth-child(3) | formatString',
                postal_code: '.adr span:nth-child(4) | formatString',
                category: '.categories a | trim',
                website: '.track-visit-website@href',
                page_url: '.n a@href'
            }])
            .paginate('.next@href')
    })(function(err, data) {
        console.log('Yellowpages Total: ' + data.business.length);
        callback(data);
    })
}

function scrapeYelp(params, callback) {
    var url = url = "https://www.yelp.com/search?rpp=40&cflt=" + params.category + "&find_loc=" + params.location.split(' ').join('+');
    console.log('Scraping ' + url);

    x(url, {
        business: x('.regular-search-result', [{
                name: '.biz-name span',
                phone: '.biz-phone | formatPhone',
                street_address: '.neighborhood-str-list | formatString',
                address_locality: '.neighborhood-str-list | formatString',
                address_region: '.neighborhood-str-list | formatString',
                postal_code: '.neighborhood-str-list | formatString',
                category: '.category-str-list | trim',
                website: '.price-range',
                page_url: '.biz-name@href'
            }])
            .paginate('.next@href')
    })(function(err, data) {
        console.log('Yelp Total: ' + data.business.length);
        callback(data);
    })
}
