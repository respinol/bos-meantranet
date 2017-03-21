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
            formatNumber: function(value) {
                return typeof value === 'string' ? value.trim().replace(/\D/g, '') : value
<<<<<<< HEAD
            },
            formatStreet: function(value) {
                var regex = /^(\w*\s*)*$/
                var result = string.match(regex);
                return result[1];
            },
            formatCity: function(value) {
                var regex = /^(\w*\s*)*$/
                var result = string.match(regex);
                return result[2];
            },
            formatState: function(value) {
                var regex = /^(\w*\s*)*$/
                var result = string.match(regex);
                return result[3];
            },
            formatPostal: function(value) {
                var regex = /^(\w*\s*)*$/
                var result = string.match(regex);
                return result[4];
            }
        }
    })
    .timeout(600000);
=======
            }
        }
    })
    // .delay(500)
    .timeout(30000);
    // .throttle(1, 1000);
>>>>>>> 49fc19ee56f830dc876ddfa0aed5228fa3f9c6b5

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
        city: req.query.city,
        state: req.query.state,
        category: req.query.category
    };

    if (country == 'United Kingdom') {
        async.parallel([
                function(callback) {
                    scrapeYell(parameters, function(data) {
                        console.log(`Yell: ${data.business.length} records ready for merging...`);
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

                var page = {
                    business: []
                };

                console.log(`Merging ${results.length} results...`);
                for (var i = 0; i < results.length; i++) {
                    console.log(`Appending ${results[i].length} records to object...`);
                    page.business = page.business.concat(results[i]);
                }

                console.log(`Parsing ${page.business.length} records to page...`);
                res.json(page);
            });

    } else if (country == 'United States') {
        async.parallel([
                function(callback) {
                    scrapeYellowpages(parameters, function(data) {
                        console.log(`Yellowpages: ${data.business.length} records ready for merging...`);
                        callback(null, data.business);
                        return;
                    });
                },
                function(callback) {
                    scrapeYelp(parameters, function(data) {
                        console.log(`Yelp: ${data.business.length} records ready for merging...`);
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

                var page = {
                    business: []
                };

                console.log(`Merging ${results.length} results...`);
                for (var i = 0; i < results.length; i++) {
                    console.log(`Appending ${results[i].length} records to object...`);
                    page.business = page.business.concat(results[i]);
                }

                console.log(`Parsing ${page.business.length} records to page...`);
                res.json(page);
            });
    }
};

function scrapeYell(params, callback) {
    var category = params.category.split(' ').join('+')
    var state = params.state.split(' ').join('+');
    var city = params.city.split(' ').join('+');
<<<<<<< HEAD
    var state_abb = params.state_abb.split(' ').join('+');
    var url = `https://www.yell.com/ucs/UcsSearchAction.do?keywords=${category}&location=${city}%2C+${state_abb}`;
=======
    var url = `https://www.yell.com/ucs/UcsSearchAction.do?keywords=${category}` +
        `&location=${city}%2C+${state}`;
>>>>>>> 49fc19ee56f830dc876ddfa0aed5228fa3f9c6b5
    console.log(`Scraping ${url}`);

    x(url, {
        business: x('.businessCapsule', [{
                name: '.businessCapsule--title h2',
                phone: '.businessCapsule--telephone strong | formatPhoneUK',
                street_address: '.businessCapsule--address a span span:nth-child(1) | formatString',
                address_locality: '.businessCapsule--address a span span:nth-child(2) | formatString',
                postal_code: '.businessCapsule--address a span span:nth-child(3)',
                category: '.businessCapsule--classificationText | trim',
                price_range: null,
                star_rating: null,
                review_count: '.ta-rating | formatNumber',
                website: '.businessCapsule--callToAction a@href',
                email: null,
                contact_person: null,
                contact_title: null,
                page_url: '.col-sm-21 a@href',
                scraper: null
            }])
            .paginate('.pagination--next@href')
    })(function(err, data) {
        if (err) {
            console.log(`Error: ${err}`);
            callback(err);
            return;
        }

        for (var i = 0; i < data.business.length; i++) {
            _.assign(data.business[i], {
                scraper: 'Yell.com'
            });
        }

        console.log(`Yell: ${data.business.length} ${params.category} scraped from ${params.city} ${params.state}`);
        callback(data);
    })
}

function scrapeYellowpages(params, callback) {
    var category = params.category.split(' ').join('+')
    var state = params.state.split(' ').join('+');
    var city = params.city.split(' ').join('+');
<<<<<<< HEAD
    var url = `https://www.yellowpages.com/search?search_terms=${category}&geo_location_terms=${city}%2C+${state}`;
=======
    var url = `https://www.yellowpages.com/search?search_terms=${category}` +
        `&geo_location_terms=${city}%2C+${state}`;
>>>>>>> 49fc19ee56f830dc876ddfa0aed5228fa3f9c6b5
    console.log(`Scraping ${url}`);

    x(url, {
        business: x('.v-card', [{
                name: '.n a',
                phone: '.phones.phone.primary | formatNumber',
                street_address: '.street-address | formatString',
                address_locality: '.locality | formatString',
                address_region: '.adr span:nth-child(3) | trim',
                postal_code: '.adr span:nth-child(4) | formatString',
                category: '.categories a | trim',
                price_range: x('.n a@href', 'dd:contains("$")'),
                star_rating: null,
                review_count: '.primary-info section a span',
                website: '.track-visit-website@href',
                email: null,
                contact_person: null,
                contact_title: null,
                page_url: '.n a@href',
                scraper: null
            }])
            .paginate('.next@href')
    })(function(err, data) {
        if (err) {
<<<<<<< HEAD
            callback(err);
            console.log(err);
=======
            console.log(`Error: ${err}`);
            callback(err);
>>>>>>> 49fc19ee56f830dc876ddfa0aed5228fa3f9c6b5
            return;
        }

        for (var i = 0; i < data.business.length; i++) {
            _.assign(data.business[i], {
                scraper: 'Yellowpages.com'
            });
        }

        console.log(`Yellowpages: ${data.business.length} ${params.category} scraped from ${params.city} ${params.state}`);
        callback(data);
    })
}

function scrapeYelp(params, callback) {
    var category = params.category.split(' ').join('+')
    var state = params.state.split(' ').join('+');
    var city = params.city.split(' ').join('+');
<<<<<<< HEAD
    var url = `https://www.yelp.com/search?find_desc=${category}&find_loc=${city}%2C+${state}`;
=======
    var url = `https://www.yelp.com/search?rpp=40&find_desc=${category}` +
        `&find_loc=${city}%2C+${state}`;
>>>>>>> 49fc19ee56f830dc876ddfa0aed5228fa3f9c6b5
    console.log(`Scraping ${url}`);

    x(url, {
        business: x('.regular-search-result', [{
                name: '.biz-name span',
                phone: '.biz-phone | formatNumber',
<<<<<<< HEAD
                street_address: '.secondary-attributes address | formatStreet',
                address_locality: '.secondary-attributes address | formatCity',
                address_region: '.secondary-attributes address | formatState',
                postal_code: '.secondary-attributes address | formatPostal',
                category: '.category-str-list | trim',
                price_range: '.price-range',
                star_rating: 'img.offscreen@alt',
                review_count: '.review-count | formatNumber',
                website: x('.biz-name@href', 'span.biz-website a'),
                email: null,
                contact_person: x('.biz-name@href', '.user-display-name'),
                contact_title: x('.biz-name@href', '.business-owner-role'),
=======
                street_address: '.neighborhood-str-list | formatString',
                address_locality: '.neighborhood-str-list | formatString',
                address_region: '.neighborhood-str-list | trim',
                postal_code: '.neighborhood-str-list | formatString',
                category: '.category-str-list | trim',
                price_range: '.price-range',
                star_rating: null,
                review_count: '.review-count | formatNumber',
                website: null,
                email: null,
>>>>>>> 49fc19ee56f830dc876ddfa0aed5228fa3f9c6b5
                page_url: '.biz-name@href',
                scraper: null
            }])
            .paginate('.next@href')
    })(function(err, data) {
        if (err) {
            console.log(`Error: ${err}`);
            callback(err);
            return;
        }

        for (var i = 0; i < data.business.length; i++) {
            _.assign(data.business[i], {
                scraper: 'Yelp.com'
            });
        }

        console.log(`Yelp: ${data.business.length} ${params.category} scraped from ${params.city} ${params.state}`);
        callback(data);
    })
}
