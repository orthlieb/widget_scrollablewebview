var args = arguments[0] || {};
_.extend($.main, args);

var scrollableArgs = ["cacheSize", "clipViews", "currentPage", "disableBounce", "hitRect", "overlayEnabled", "pagingControlAlpha", "pagingControlColor", "pagingControlHeight", "pagingControlOnTop", "pagingControlTimeout", "scrollingEnabled", "showPagingControl", "views" ];
var webViewArgs = [ "data", "disableBounce", "enableZoomControls", "hideLoadIndicator", "html", "loading", "pluginState", "scalePagesToFit", "scrollsToTop", "showScrollBars", "url", "userAgent", "willHandleTouches" ];


exports.init = function ScrollableWebViewInit(urlArray) {
    var self = this;
    self.urlArray = urlArray;
    var moreThanOnePage = self.urlArray.length > 1;
    var height = _.isUndefined(args.pagingControlHeight) ? (moreThanOnePage ? 30 : 0) : args.pagingControlHeight;
    
    if (OS_IOS) {
        $.scrollableViewBottom = 0;
    } else if (OS_ANDROID) {
        $.scrollableViewBottom = height;
    } else {
        Ti.API.error("ScrollableWebView: not implemented for " + Ti.Platform.osname);
    }
    _.extend($.scrollableView, _.pick(args, scrollableArgs));
    $.scrollableView.showPagingControl = _.isUndefined(args.showPagingControl) ? moreThanOnePage : args.showPagingControl;
    $.scrollableView.pagingControlHeight = height;
 
    if (OS_ANDROID) {
        if (moreThanOnePage) {
            // Set up next/previous indicators
            $.prevButton.on('click', function PrevButtonClicked(e) {
               $.scrollableView.movePrevious(); 
            });
            $.nextButton.on('click', function NextButtonClicked(e) {
               scrollableView.moveNext(); 
            });
            $.scrollableView.on('scroll', function ScrollableViewScroll(e) {
                // Enable/disable the prev next buttons as the user pages through the views
                $.nextButton.enabled = (e.currentPage < (self.urlArray.length - 1));
                $.prevButton.enabled = (e.currentPage != 0);
            });
        }
    }

    var aViews = [];
    var wv = _.defaults(_.pick(args, webViewArgs), {
        scalesPageToFit: false,
        enableZoomControls: false
    });
  
    for (var j = 0; j < self.urlArray.length; j++) {
        // If just a name then get a local file, else get a remote file.
        var url = self.urlArray[j].match(/^http/) ? self.urlArray[j] : '/HTML/' + self.urlArray[j] + '.html'
        console.debug("Accessing URL: " + url);
        wv.url = url;
        aViews[j] = Ti.UI.createWebView(wv);
    }
    $.scrollableView.views = aViews;
};
