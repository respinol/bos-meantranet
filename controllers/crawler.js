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
                return typeof value === 'string' ? value.trim().replace(/[^0-9.]/g, '') : value
            },
            formatStreet: function(value) {
                return value;
            },
            formatCity: function(value) {
                return value;
            },
            formatState: function(value) {
                return value;
            },
            formatPostal: function(value) {
                return value;
            }
        }
    })
    .throttle(1, 500)
    .timeout(600000);

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
                        if (data.business) {
                            console.log(`Yell: ${data.business.length} records ready for merging...`);
                        }
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
                    scrapeYelp(parameters, function(data) {
                        if (data.business) {
                            console.log(`Yelp: ${data.business.length} records ready for merging...`);
                        }
                        callback(null, data.business);
                        return;
                    });
                },
                function(callback) {
                    scrapeYellowpages(parameters, function(data) {
                        if (data.business) {
                            console.log(`Yellowpages: ${data.business.length} records ready for merging...`);
                        }
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
    var city = params.city.split(' ').join('+');
    var url = `https://www.yell.com/ucs/UcsSearchAction.do?keywords=${category}&location=${city}`;

    console.log(`Scraping ${url}`);

    x(url, {
        business: x('.businessCapsule', [{
                name: '.businessCapsule--title h2',
                phone: '.businessCapsule--telephone strong | formatPhoneUK',
                street_address: 'span[itemprop="streetAddress"] | formatString',
                address_locality: 'span[itemprop="addressLocality"] | formatString',
                address_region: null,
                postal_code: 'span[itemprop="postalCode"] | trim',
                category: '.businessCapsule--classificationText | trim',
                price_range: null,
                star_rating: '.starRating@title',
                review_count: '.reviewStars--text | formatNumber',
                website: '.businessCapsule--callToAction a@href',
                email: null,
                page_url: '.col-sm-24 a@href',
                scraper: null
            }])
            .paginate('.pagination--next@href')
    })(function(err, data) {
        if (err) {
            console.log(`Error: ${err}`);
            return;
        }

        for (var i = 0; i < data.business.length; i++) {
            _.assign(data.business[i], {
                scraper: 'Yell.com'
            });
        }

        if (data.business.length > 0) {
            console.log(`Yell: ${data.business.length} ${params.category}(s) scraped from ${params.city} ${params.state}`);
        } else {
            console.log(`Yell: No ${params.category}(s) scraped from ${params.city} ${params.state}`);
        }
        callback(data);
    })
}

function scrapeYellowpages(params, callback) {
    var category = params.category.split(' ').join('+')
    var state = params.state.split(' ').join('+');
    var city = params.city.split(' ').join('+');
    var url = `https://www.yellowpages.com/search?search_terms=${category}&geo_location_terms=${city}%2C+${state}`;
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
                page_url: '.n a@href',
                scraper: null
            }])
            .paginate('.next@href')
    })(function(err, data) {
        if (err) {
            console.log(`Error: ${err}`);
            return;
        }

        for (var i = 0; i < data.business.length; i++) {
            _.assign(data.business[i], {
                scraper: 'Yellowpages.com'
            });
        }

        if (data.business.length > 0) {
            console.log(`Yellowpages: ${data.business.length} ${params.category}(s) scraped from ${params.city} ${params.state}`);
        } else {
            console.log(`Yell: No ${params.category}(s) scraped from ${params.city} ${params.state}`);
        }
        callback(data);
    })
}

function scrapeYelp(params, callback) {
    var category = params.category.split(' ').join('+');
    var state = params.state.split(' ').join('+');
    var city = params.city.split(' ').join('+');
    var url = `https://www.yelp.com/search?find_desc=${category}&find_loc=${city}%2C+${state}`;
    console.log(`Scraping ${url}`);

    x(url, {
        business: x('.regular-search-result', [{
                name: '.biz-name span',
                phone: '.biz-phone | formatNumber',
                street_address: x('.biz-name@href', 'span[itemprop="streetAddress"]'),
                address_locality: x('.biz-name@href', 'span[itemprop="addressLocality"]'),
                address_region: x('.biz-name@href', 'span[itemprop="addressRegion"]'),
                postal_code: x('.biz-name@href', 'span[itemprop="postalCode"]'),
                category: '.category-str-list | trim',
                price_range: '.price-range',
                star_rating: 'img.offscreen@alt | formatNumber',
                review_count: '.review-count | formatNumber',
                website: x('.biz-name@href', 'span.biz-website a'),
                email: null,
                contact_person: x('.biz-name@href', '.user-display-name'),
                contact_title: x('.biz-name@href', '.business-owner-role'),
                page_url: '.biz-name@href',
                scraper: null
            }])
            .paginate('a.next@href')
    })(function(err, data) {
        if (err) {
            console.log(`Error: ${err}`);
            return;
        }

        for (var i = 0; i < data.business.length; i++) {
            _.assign(data.business[i], {
                scraper: 'Yelp.com'
            });
        }

        if (data.business.length > 0) {
            console.log(`Yelp: ${data.business.length} ${params.category}(s) scraped from ${params.city} ${params.state}`);
        } else {
            console.log(`Yelp: No ${params.category}(s) scraped from ${params.city} ${params.state}`);
        }
        callback(data);
    })
}
