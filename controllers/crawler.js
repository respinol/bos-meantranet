const Xray = require('x-ray');
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
            // return typeof value === 'string' ? value.trim().split(' ').join('') : value
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
    var parameters = {
        location: req.query.location,
        category: req.query.category
    };

    if (website == 'Yell') {
        scrapeYell(parameters, function(page) {
            res.json(page);
        })

    } else if (website == 'Yellowpages') {
        scrapeYellowpages(parameters, function(page) {
            res.json(page);
        })
    }
};

// exports.startScrape = (req, res, next) => {
//     var website = req.query.website;
//     var location = req.query.location;
//     var category = req.query.category;
//
//     req.flash('info', {
//         msg: `Scraping ${location} for ${category}.`
//     });
//     next();
// };

function scrapeYell(params, callback) {
    var url = "https://www.yell.com/s/" + params.category + "-" + params.location.split(' ').join('+') + ".html";
    console.log(url);
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
        callback(page);
    })
};

function scrapeYellowpages(params, callback) {
    var url = url = "https://www.yellowpages.com/search?search_terms=" + params.category + "&geo_location_terms=" + params.location.split(' ').join('+');
    console.log(url);
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
    })(function(err, page) {
        callback(page);
    })
};
