var scrapedData = [];

$(function() {
    var source = $("#search-results").html();
    var dataTemplate = Handlebars.compile(source);
    $results = $('#results')

    $('#search').on('keyup', function(e) {
        if (e.keyCode === 13) {
            var parameters = {
                crawler: $('#website').val(),
                search: $('#search').val(),
                location: $('#location').val()
            };

            newAlert("Please Wait!", "We're still scraping...");

            $.get('/searching', parameters, function(data) {

                if (data instanceof Object) {
                    $results.append(dataTemplate({
                        page: data
                    }));
                } else {
                    $results.append(data);
                };

                var D121 = {
                  name: '',
                  phone: '',
                  category: [
                    'Hospitals',
                    'Bakeries',
                    'Restaurant',
                    'Printers'
                  ],
                };

                showModal(parameters, data.business.length);
                data.business = filterArray(data.business, D121);
                scrapedData.push(data);
            });
        };

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

        function newAlert(header, message) {
            $("#alert-area").append($("<div class='alert alert-warning alert-dismissible show' role='alert'>" +
                "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" +
                "<span aria-hidden='true'>&times;</span></button>" +
                "<strong>" + header + "</strong> " + message + "</div>"));
        }

        function showModal(parameters, count) {
            var msg = "Scraped " + count + " " + parameters.search + " from " + parameters.location + ".";

            $('#scraperModal').modal('show');
            $('.modal-msg').text(msg);
            $(".alert").delay(3000).fadeOut("slow", function() {
                $(this).remove();
            });
        }
    });

    $("#download").click(function() {
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
        console.log(scrapedData.length);

        var downloadLink = document.createElement("a");
        var blob = new Blob(["\ufeff", csv]);
        var url = URL.createObjectURL(blob);

        downloadLink.href = url;
        downloadLink.download = "data.csv";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });
});

$(function() {
    var datalist = document.getElementById('json-locations');
    var input = document.getElementById('location');
    var req = new XMLHttpRequest();

    // Handle state changes for the request.
    req.onreadystatechange = function(res) {
        if (req.readyState === 4) {
            if (req.status === 200) {
                // Parse JSON
                var json = JSON.parse(req.responseText);
                var jsonOptions = json.locations;

                // Loop over JSON array
                jsonOptions.forEach(function(item) {
                    // Create a new <option> element.
                    var option = document.createElement('option');

                    // Set the value using the item in the JSON array.
                    option.value = item;
                    // Add the <option> element to the <datalist>.
                    datalist.appendChild(option);
                });

                // Update the placeholder text.
                input.placeholder = "e.g. Glasgow";
            } else {
                // An error occured.
                input.placeholder = "Couldn't load datalist options...";
            }
        }
    };
    // Update the placeholder text.
    input.placeholder = "Loading options...";

    // Set up and make the request.
    req.open('GET', '/uk-locations.json', true);
    req.send();
});
