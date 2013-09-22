/**
 * Copy from production site /home/edwardrf/phantomjs-1.7.0/examples/rasterize.js
 * 
 * If this file changed, exec the below command in production site terminal:
 * 
 * cp /var/www/sites/www.tradesparq.com/js/user2/libs/phantom/rasterize.js /home/edwardrf/phantomjs-1.7.0/examples/rasterize.js
 */
var page = require('webpage').create(),
    system = require('system'),
    address, output, size;

if (system.args.length < 3 || system.args.length > 5) {
    console.log('Usage: rasterize.js URL filename [paperwidth*paperheight|paperformat] [zoom]');
    console.log('  paper (pdf output) examples: "5in*7.5in", "10cm*20cm", "A4", "Letter"');
    phantom.exit(1);
} else {
    // start time
    var startTime = Date.now();

    address = system.args[1];
    output = system.args[2];
    page.viewportSize = { width: 960, height: 960 };
    page.clipRect = { top: 0, left: 0, width: 960, height: 960 };
    if (system.args.length > 3 && system.args[2].substr(-4) === ".pdf") {
        size = system.args[3].split('*');
        page.paperSize = size.length === 2 ? { width: size[0], height: size[1], margin: '0px' }
                                           : { format: system.args[3], orientation: 'portrait', margin: '1cm' };
    }
    if (system.args.length > 4) {
        page.zoomFactor = system.args[4];
    }
    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('Unable to load the address!');
            phantom.exit(2);
        } else {
            window.setTimeout(function () {
                page.render(output);

                // Time-consuming
                var timeconsuming = Date.now() - startTime;

                // return string
                console.log(timeconsuming + 'tradesparq_separator' + page.evaluate(function(){
                    var result = document.title ? document.title + 'tradesparq_separator' : '';
                    var description = document.getElementsByName('description')[0];
                    if (description) result += description.content;
                    return result;
                }));

                phantom.exit();
            }, 200);
        }
    });
}