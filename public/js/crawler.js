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
        loadLocations();
        loadCrawlers();
    });
    $('#scrape').click(scrapeThis);
    $('#download').click(downloadCSV);
    $('#reset').click(function(){$('input, textarea').val('');});
    /**
     * Functions:
     */

    /**
     * Loads list of available website crawlers.
     */
    function loadCrawlers(e) {
        var datalist = document.getElementById('website-crawlers');
        var country = $('input[name=country]:checked').val();
        var crawlers = {uk:['Yell.com'],us:['Citysearch.com','Yellowpages.com','Restaurant.com','Tripdavisor.com','Yelp.com']}

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

    /**
     * Loads location data depending on selected radio button.
     */
    function loadLocations(e) {
        var country = $('input[name=country]:checked').val();
        var datalist = document.getElementById('json-locations');
        var input = document.getElementById('locations');
        var req = new XMLHttpRequest();

        var jsonUrl = 'https://raw.githubusercontent.com/David-Haim/CountriesToCitiesJSON/master/countriesToCities.json';
        var placeholder = 'Loading options...';

        if (country == 'United States') {
            jsonUrl = 'https://raw.githubusercontent.com/David-Haim/CountriesToCitiesJSON/master/countriesToCities.json';
            placeholder = 'e.g. New York';
        } else if (country == 'United Kingdom') {
            jsonUrl = 'https://raw.githubusercontent.com/David-Haim/CountriesToCitiesJSON/master/countriesToCities.json';
            placeholder = "e.g. Glasgow";
        } else {
            jsonUrl = '';
            placeholder = "Couldn't load datalist options...";
        }

        req.onreadystatechange = function(res) {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    var json = JSON.parse(req.responseText);
                    var jsonOptions = json[country];

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
    function scrapeThis(e) {
        var categories = $('#category').val().split('\n');
        var parameters = {

            website: $('#website').val(),
            search: $('#search').val(),
            location: $('#locations').val(),

            country: $('input[name="country"]:checked').val(),
            location: $('#locations').val(),
            category: ''

        };

        var source = $("#search-results").html();
        var dataTemplate = Handlebars.compile(source);
        results = $('#results')

        // newAlert("Please Wait!", "We're still scraping...");

        for (var i = 0; i < categories.length; i++) {
          parameters.category = categories[i];

          $.get('/searching', parameters, function(data) {

              if (data instanceof Object) {
                  results.append(dataTemplate({
                      page: data
                  }));
              } else {
                  results.append(data);
              };

              showModal(parameters, data.business.length);
              data.business = filterArray(data.business, filterD121);
              scrapedData.push(data);
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
    function newAlert(header, message) {
        $("#alert-area").append($("<div class='alert alert-warning alert-dismissible show' role='alert'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" +
            "<span aria-hidden='true'>&times;</span></button>" +
            "<strong>" + header + "</strong> " + message + "</div>"));
    }

    /**
     * Show modal with results.
     */
    function showModal(parameters, count) {
        var msg = "Scraped " + count + " " + parameters.category + " from " + parameters.location + ".";

        $('#scraperModal').modal('show');
        $('.modal-msg').text(msg);
        $(".alert").delay(3000).fadeOut("slow", function() {
            $(this).first().remove();
        });
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
