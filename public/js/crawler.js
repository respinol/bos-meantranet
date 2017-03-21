$(document).ready(function() {
    var scrapedData = [];
    var filterD121 = {
        name: '',
        phone: '',
        category: [
            'Hospitals',
            'Bakeries',
            'Restaurant',
            'Printers'
        ],
    };

    $('input[name=country]:radio').change(function() {
        var country = $('input[name=country]:checked').val();

        if (country == 'United Kingdom') {
            loadUkLocations();

        } else {
            loadUsStates();
        }

        loadCrawlers();
    });

    $('#state').change(loadUsCities);
    $('#scrape').click(scrapeThis);
    $('#download').click(downloadCSV);

    /**
     * Get random item.
     */
    function getRandomItem(options) {
        var items = [];

        options.each(function() {
            items.push($(this).val());
        });

        return items[Math.floor(Math.random() * items.length)];
    }

    /**
     * Loads list of available website crawlers.
     */
    function loadCrawlers(e) {
        var datalist = document.getElementById('website-crawlers');
        var country = $('input[name=country]:checked').val();
        var crawlers = {
            uk: [
                'Yell'
            ],
            us: [
                'Citysearch',
                'Yellowpages',
                'Restaurantdotcom',
                'Tripdavisor',
                'Yelp'
            ]
        }

        var crawler;

        if (country == 'United States') {
            crawler = crawlers['us'];

        } else if (country == 'United Kingdom') {
            crawler = crawlers['uk'];
        }

        if (datalist.hasChildNodes()) {
            while (datalist.firstChild) {
                datalist.removeChild(datalist.firstChild);
            }
        }

        for (var i = 0; i < crawler.length; i++) {
            var option = document.createElement('option');

            option.value = crawler[i];
            datalist.appendChild(option);
        }
    }

    function loadJSON(file, callback) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType('application/json');
        xobj.open('GET', file, true);
        xobj.onreadystatechange = function() {
            if (xobj.readyState == 4 && xobj.status == '200') {
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
    }

    function loadUsStates() {
        var datalist = document.getElementById('json-states');
        var input = document.getElementById('state');

        if (datalist.hasChildNodes()) {
            while (datalist.firstChild) {
                datalist.removeChild(datalist.firstChild);
            }
        }

        loadJSON('js/usLocations.json', function(res) {
            var json = JSON.parse(res);

            json.forEach(function(item) {
                var option = document.createElement('option');

                option.value = item['region'];
                option.text = item['region_abbrev'];
                if ($(`#json-states option[value='${option.value}']`).length == 0) {
                    datalist.appendChild(option);
                }
            });
        });
    }

    /**
     * Loads list of cities in the United States.
     */
    function loadUsCities() {
        var datalist = document.getElementById('json-cities');
        var input = document.getElementById('city');
        var state = document.getElementById('state');

        if (datalist.hasChildNodes()) {
            while (datalist.firstChild) {
                datalist.removeChild(datalist.firstChild);
            }
        }

        loadJSON('js/usLocations.json', function(res) {
            var json = JSON.parse(res);

            json.forEach(function(item) {
                if (item['region'] == state.value) {
                    var option = document.createElement('option');

                    option.value = item['locality'];
                    option.text = item['locality'];
                    if ($(`#json-cities option[value='${option.value}']`).length == 0) {
                        datalist.appendChild(option);
                    }
                }
            });
        });
    }

    /**
     * Loads list of cities in the United Kingdom.
     */
    function loadUkLocations(e) {
        var datalist = document.getElementById('json-cities');
        var input = document.getElementById('city');
        var req = new XMLHttpRequest();

        var jsonUrl = 'https://raw.githubusercontent.com/David-Haim/CountriesToCitiesJSON/master/countriesToCities.json';
        var placeholder = "e.g. Glasgow";

        req.onreadystatechange = function(res) {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    var json = JSON.parse(req.responseText);
                    var jsonOptions = json['United Kingdom'];

                    if (datalist.hasChildNodes()) {
                        while (datalist.firstChild) {
                            datalist.removeChild(datalist.firstChild);
                        }
                    }

                    jsonOptions.forEach(function(item) {
                        var option = document.createElement('option');

                        option.value = item;
                        datalist.appendChild(option);
                    });

                    input.placeholder = placeholder;
                } else {
                    input.placeholder = "Couldn't load datalist options...";
                }
            }
        };
        input.placeholder = "Loading options...";
        req.open('GET', jsonUrl, true);
        req.send();
    }

    /**
     * Start scraper function on button click.
     */
    function scrapeThis() {
      var categories = $('#category').val().split('\n');
      var parameters = {
          country: $('input[name=country]:checked').val(),
          website: $('#website').val(),
          city: $('#city').val(),
          state: $('#state').val(),
          state_abb: $('#state').text(),
          category: ''
      };

        var source = $("#search-results").html();
        var dataTemplate = Handlebars.compile(source);
        results = $('#results')

        for (var i = 0; i < categories.length; i++) {
            parameters.category = categories[i];

            newAlert("info",
                `Scraping ${parameters.category}(s) from ${parameters.city} ${parameters.state}`);

            $.get('/searching', parameters, function(data) {
                    if (data instanceof Object && data.business.length > 0) {
                        results.append(dataTemplate({
                            page: data
                        }));
                    } else {
                        results.append(data);
                    };

                    if (parameters.country == 'United Kingdom') {
                        data.business = filterArray(data.business, filterD121);
                    }

                    scrapedData.push(data);
                })
                .done(function(data) {
                    var type = "warning";

                    if (data.business.length > 0) {
                        type = "success"
                    }

                    newAlert(type,
                        `Scraped ${data.business.length} ${parameters.category}(s) from ${parameters.city} ${parameters.state}`);

                    if ($('input[type=checkbox]:checked').length > 0) {
                        $('#city').val(getRandomItem($('#json-cities > option')));
                        setTimeout(scrapeThis, 10000);

                    } else {
                        newAlert(type, `Finished scraping session...`);
                    }
                })
                .fail(function(err) {
                    newAlert('danger',
                        `Error encountered while scraping. Session stopped.`);
                    console.log(err);
                });
        }
    }

    /**
     * Filter specified array to remove matched values.
     */
    function filterArray(data, filters) {
        var filteredData,
            predicates = [
                function removeNames(data) {
                    for (var i = 0; i < filters.name.length; i++)
                        if (data.name.indexOf(filters.name[i]) != -1)
                            return false;
                    return true;
                },
                function removePhone(data) {
                    for (var i = 0; i < filters.phone.length; i++)
                        if (data.phone.indexOf(filters.phone[i]) != -1)
                            return false;
                    return true;
                },
                function removeCategories(data) {
                    for (var i = 0; i < filters.category.length; i++)
                        if (data.category.indexOf(filters.category[i]) != -1)
                            return false;
                    return true;
                }
            ];

        if (!filters) {
            filteredData = data;
        } else {
            filteredData = $.grep(data, function(el, index) {
                for (var i = 0; i < predicates.length; i++) {
                    if (!predicates[i](el)) return false;
                }
                return true;
            });
        }
        return filteredData;
    }

    /**
     * Add dynamic alert on page.
     */
    function newAlert(type, message) {
        $('#alert-area').append($(`<div class="alert alert-${type} alert-dismissible show" role="alert">` +
            `<button type="button" class="close" data-dismiss="alert" aria-label="Close">` +
            `<span aria-hidden="true">&times;</span></button>` +
            `<strong>${message}</strong></div>`));

        setTimeout(function() {
            $('#alert-area').children('.alert:first-child').fadeTo(3000, 0).slideUp(1000, function() {
                $(this).remove();
            });
        }, 5000);
    }

    function downloadCSV() {
        var csv = '';

        csv = Papa.unparse(scrapedData[0].business, {
            quotes: false,
            quoteChar: '"',
            delimiter: ",",
            header: true,
            newline: "\r\n"
        });

        if (scrapedData.length > 0) {
            for (var i = 1; i < scrapedData.length; i++) {
                csv += "\r\n" + Papa.unparse(scrapedData[i].business, {
                    quotes: false,
                    quoteChar: '"',
                    delimiter: ",",
                    header: false,
                    newline: "\r\n"
                });
            }
        }

        scrapedData.length = 0;

        var downloadLink = document.createElement("a");
        var blob = new Blob(["\ufeff", csv]);
        var url = URL.createObjectURL(blob);

        downloadLink.href = url;
        downloadLink.download = "data.csv";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
});
