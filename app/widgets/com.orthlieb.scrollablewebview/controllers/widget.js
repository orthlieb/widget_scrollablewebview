var args = _.defaults(arguments[0], { pagingControlStyle: "native", showPagingControl: "auto", currentPage: 0, urlArray: [] });

var properties = [ "urlArray", "pagingControlStyle", "showPagingControl", "currentPage" ];
var subviews = [ "scrollableView", "toolbar", "prevButton", "nextButton", "label" ];
var dimensions =  [ "left", "top", "right", "bottom", "center", "width", "height" ];

// Style the subviews.
_.extend($.main, _.chain(args).omit(properties).omit(subviews).value());
_.extend($.scrollableView, _.chain(args.scrollableView).omit([ "showPagingControl", "currentPage", "views" ]).omit(dimensions).value());
_.extend($.prevButton, args.prevButton);
_.extend($.nextButton, args.nextButton);
_.extend($.label, args.label);
_.extend($.toolbar, _.omit(args.toolbar, dimensions));

// Various event callbacks
function NextButtonClick(e) {
    $.currentPage++;
}

function PrevButtonClick(e) {
    $.currentPage--;
}

function ScrollableViewScrollEnd(e) {
    $.currentPage = e.currentPage;
}

function UpdateLabel(page) {
    // Enable/disable the prev next buttons and update the label.
    $.nextButton.enabled = (page < ($.urlArray.length - 1));
    $.prevButton.enabled = (page != 0);
    var pageControlString = "";
    for ( i = 0; i < $.urlArray.length; i++) {
        pageControlString += ((i!= page) ? '\u26cb' : '\u26cf');
    }
    $.label.text = pageControlString;    
}

// Hide show the toolbar and paging control as needed
function UpdateToolbar() {
    var pagingControlIsOn = $.showPagingControl == "on" || ($.showPagingControl == "auto" && $.urlArray.length > 1);        
    if (pagingControlIsOn) {
        if (OS_IOS && $.pagingControlStyle == "native") {
            // If we are native then the scrollableView should take up the entire control,
            // The toolbar should be hidden and the PagingControl should be shown.
            $.scrollableView.bottom = 0;
            $.toolbar.visible = false;
            $.scrollableView.showPagingControl = true;
        } else {
            // If we are toolbar style, reduce the scrollableView size to accomodate the toolbar.
            // Hide the pagingControl, and update the label and make the toolbar visible.
            $.scrollableView.pagingControl = false;
            $.scrollableView.bottom = Alloy.isTablet ? "60 dp" : "30 dp";
            UpdateLabel($.currentPage);
            $.toolbar.visible = true;                      
        }
    } else {
        // PagingControl is off: hide the toolbar and the paging control. 
        $.scrollableView.bottom = 0;
        $.toolbar.visible = false;
        $.scrollableView.showPagingControl = false;
    }   
}

// Property: showPagingControl   
$._showPagingControl = "auto";
Object.defineProperty($, "showPagingControl", {
    get: function() { 
        return $._showPagingControl; 
    },
    set: function(showPagingControl) { 
        if (_.indexOf([ "on", "off", "auto" ], showPagingControl) == -1 || showPagingControl == $._showPagingControl)
            return;
        $._showPagingControl = showPagingControl;
        UpdateToolbar();
     }
});

// Property: pagingControlStyle   
$._pagingControlStyle = "native";
Object.defineProperty($, "pagingControlStyle", {
    get: function() { 
        return $._pagingControlStyle; 
    },
    set: function(pagingControlStyle) { 
        if (_.indexOf([ "native", "toolbar" ], pagingControlStyle) == -1 || pagingControlStyle == $._pagingControlStyle)
            return;
        $._pagingControlStyle = pagingControlStyle;       
        UpdateToolbar();
     }
});

// Property: currentPage   
$._currentPage = 0;
Object.defineProperty($, "currentPage", {
    get: function() { 
        return $._currentPage; 
    },
    set: function(currentPage) { 
        if (currentPage < 0 || currentPage >= $.urlArray.length || currentPage == $._currentPage)
            return;
        $._currentPage = currentPage;
        $.scrollableView.currentPage = currentPage;  
        UpdateToolbar();     
     }
});

// Property: urlArray   
Object.defineProperty($, "urlArray", {
    get: function() { 
        return $._urlArray; 
    },
    set: function(urlArray) { 
        $._urlArray = urlArray; 

        var aViews = [];
        var wv = _.chain(args.webView).omit([ "url", "html" ]).omit(dimensions).value();
      
        for (var j = 0; j < urlArray.length; j++) {
            // If just a name then get a local file, else get a remote file.
            var url = urlArray[j].match(/^http/) ? urlArray[j] : '/HTML/' + urlArray[j] + '.html'
            Ti.API.info("Accessing URL: " + url);
            wv.url = url;
            aViews[j] = Ti.UI.createWebView(wv);
            aViews[j].addEventListener('load', function (e) { $.trigger('load', e); });
        }
        $.scrollableView.views = aViews; 
        UpdateToolbar();   
    }
});

var x = _.pick(args, properties);
_.extend($, x);
