var DDS_slideshow = function (el) {
    'use strict';
    this.element = el;
    this.slides = {};
    this.navigationArrows = {};
    this.hover = {
        isHovering: false,
        timeout: undefined
    };

    this.config = {
        delay: 2000,
        transition: "swipe",
        styles: "dds_slideshow",
        transitionSpeed: 500,
        isPlaying: true,
        navigationArrows: "auto",
        verticalArrows: false,
        width: undefined,
        height: undefined
    };
    if (typeof(arguments[1])=="object") { for (var attrname in arguments[1]) { this.config[attrname] = arguments[1][attrname]; } }

    this.init = function () {
    	var i, elThis = this;

        /* make sure the styles are present on the container */
        $("#"+this.element).addClass(this.config.styles);

        /* insert placeholders for navigational arrows */
        $("#"+this.element).html(  
            $("#"+this.element).html() + 
            "<div id='"+this.element+"_previous'></div>"+ 
            "<div id='"+this.element+"_next'></div>");
        this.navigationArrows.previous = $("#"+this.element+"_previous");
        this.navigationArrows.next = $("#"+this.element+"_next");
        /* update navigation arrow visibility */
        this.arrowVisibility = this.arrowVisibility;
        /* add the styling to the arrows */
        this.navigationArrows.previous.addClass(this.config.styles+"_previous");
        this.navigationArrows.next.addClass(this.config.styles+"_next");
        /* add an onclick event to the arrows */
        this.navigationArrows.previous.click(function(){elThis.nextSlide(-1);});
        this.navigationArrows.next.click(function(){elThis.nextSlide();});

        /* find and store the children slides */
        this.slides = $("#"+this.element).children("div");
        this.slides.current = 0;
        this.slides.repeat = null;
        this.slides.length-=2; /* exclude the placeholders for the nav arrows */

        /* add styles to the slides */
        for (i=0; i < this.slides.length; i++){
            $(this.slides[i]).addClass(this.config.styles+"_slide");
        }

        /* update all the sizes */
        this.resize(this.config.width,this.config.height);

        document.getElementById(this.element).onmouseover = function(){elThis.mouseover();};
        document.getElementById(this.element).onmouseout = function(){elThis.mouseout();};

        /* call any additional init needed */
        if (this.config.moreInit) { this.config.moreInit.call(this); }

        /* all done, we can make the container visible */
        $("#"+this.element).css("visibility","visible");
    };
    this.mouseover = function(){
        /* this first bit avoids random event calls due to the animation */
        clearTimeout(this.hover.timeout);
        this.hover.timeout = undefined;
        if (this.hover.isHovering) return;
        this.hover.isHovering = true;

        /* if arrow visibility is auto, then make the arrows appear */
        if (this.config.navigationArrows=="auto") { this.showArrows(); }
    };
    this.mouseout = function(){
        /* this first bit avoids random event calls due to the animation */
        var elThis = this;
        if (this.hover.isHovering){
            this.hover.timeout = setTimeout(
                function(){
                    elThis.hover.isHovering = false;
                    elThis.mouseout.call(elThis);
                }, this.config.transitionSpeed);
            return;  
        } 

        /* if arrow visibility is auto, then hide the arrows */
        if (this.config.navigationArrows=="auto") { this.hideArrows(); }
    };

    /* getter and setter for navigation arrow visibility */
    Object.defineProperty(this,"arrowVisibility",{
        get: function (){return this.config.navigationArrows;},
        set: function (a){
            this.config.navigationArrows = a;
            if (this.config.navigationArrows == "on") { this.showArrows(); }
            else{                                       this.hideArrows(); }
            return this.config.navigationArrows;
            }
        });
    this.showArrows = function (){
        this.navigationArrows.previous.css({     visibility: "visible",    display: "block"});
        this.navigationArrows.next.css({         visibility: "visible",    display: "block"});
    };
    this.hideArrows = function (){
        this.navigationArrows.previous.css({     visibility: "hidden",     display: "none"});
        this.navigationArrows.next.css({         visibility: "hidden",     display: "none"});
    };

    /* getter and setter for playing and pausing */
    Object.defineProperty(this,"isPlaying",{
        get: function (){return this.config.isPlaying;},
        set: function (a){
            this.config.isPlaying = a;
            if (a) {    this.nextSlide(); }
            else    { clearTimeout(this.slides.repeat); this.slides.repeat = null; }
            return a;
            }
        });
    this.play = function(){this.isPlaying = true;};
    this.pause = function(){this.isPlaying = false;};
    this.togglePlay = function(){this.isPlaying = !this.isPlaying;};

    /*  this function resizes the box when provided two arguments (width, height).
        if no arguments are provided, it checks if the box was resized outside of 
        dds_slideshow and updates */
    this.resize = function (){
        var elThis = this;
        var w,w2,wp,wn,wp2,wn2;
        var h,h2,hp,hn,hp2,hn2;
        var i;

        /* stop all transition during the resize event */
        if (this.slides.repeat !== null) { clearTimeout(this.slides.repeat); this.slides.repeat = null; }

        /*  if arguments are provided, we set new sizes in the CSS styles 
            and move the arrows proportionally to remain centered */
        if (arguments[0] || arguments[1]){
            /*  save the current height/width 
                and the arrow offsets
                so that we can reposition the navigation arrows after resize */
            if (this.config.verticalArrows){
                w = $("#"+this.element).width();
                wp = parseFloat(this.navigationArrows.previous.css("left"));
                wn = parseFloat(this.navigationArrows.next.css("left"));
                wp2 = this.navigationArrows.previous.width();
                wn2 = this.navigationArrows.next.width();        
            }else{
                h = $("#"+this.element).height();
                hp = parseFloat(this.navigationArrows.previous.css("top"));
                hn = parseFloat(this.navigationArrows.next.css("top"));
                hp2 = this.navigationArrows.previous.height();
                hn2 = this.navigationArrows.next.height();
            }
                
            
            /* set the height and width in the styles */
            if (arguments[0])    $("#"+this.element).css({width: arguments[0]});
            if (arguments[1])    $("#"+this.element).css({height: arguments[1]});
    
            /* readjust the navigation arrow position proportionally with the origin at the center */
            if (this.config.verticalArrows){
                w2 = $("#"+this.element).width();
                this.navigationArrows.previous.css("left",((wp+wp2/2)*w2/w-wp2/2)+"px");
                this.navigationArrows.next.css("left",((wn+wn2/2)*w2/w-wn2/2)+"px");
            }else{
                h2 = $("#"+this.element).height();
                this.navigationArrows.previous.css("top",((hp+hp2/2)*h2/h-hp2/2)+"px");
                this.navigationArrows.next.css("top",((hn+hn2/2)*h2/h-hn2/2)+"px");
            }
        }

        /* update the configs with the new sizes in pixels */
        this.config.width = $("#"+this.element).width();
        this.config.height = $("#"+this.element).height();

        /* move all but the current slide off to the side */
        for (i=0; i < this.slides.length; i++){
            $(this.slides[i]).stop(false,true); /* stops all transition on the slide */
            this.slides[i].style.position = "absolute";

            /* calculate size including borders, padding, and margins */
            var borders = {
                x: $(this.slides[i]).outerWidth(true)-$(this.slides[i]).width(), 
                y: $(this.slides[i]).outerHeight(true)-$(this.slides[i]).height() };

            this.slides[i].style.width = this.config.width-borders.x + "px";
            this.slides[i].style.height = this.config.height-borders.y + "px";
            if (i!=this.slides.current){ 
                this.slides[i].style.left = this.config.width + "px";
            }
        }

        /* resume playing if autoplay is on */
        if (this.isPlaying) { this.slides.repeat = setTimeout(function(){elThis.nextSlide.call(elThis);}, this.config.delay); }
    };

    /*  shows the next slide when no arguments given
        pass -1 if you want to show the previous slide
        pass the slide number 1 through n if you want to select a slide */
    this.nextSlide = function (){
        /*     find the previously displayed slide and the current slide to display 
            depending on whether you want the next slide, previous slide, or specific slide number */
        var previous, i, elThis=this;
        if (arguments[0]===undefined){
            previous = this.slides.current++;
            if (this.slides.current >= this.slides.length) this.slides.current = 0;
        }else if (arguments[0]==-1) {
            previous = this.slides.current--;
            if (this.slides.current < 0) this.slides.current = this.slides.length - 1;
        }else if (!isNaN(parseInt(arguments[0]))) {
            previous = this.slides.current;
            this.slides.current = parseInt(arguments[0])-1;
            if (this.slides.current < 0) this.slides.current = 0;
            if (this.slides.current >= this.slides.length) this.slides.current = this.slides.length-1;
        }else{
            return;
        }

        /* stops all transitions and reset any repeats */
        for (i=0; i < this.slides.length; i++) $(this.slides[i]).stop(false,true);
        if (this.slides.repeat !== null) { clearTimeout(this.slides.repeat); this.slides.repeat = null; }

        /* start animating the transition if the slides are not the same */
        if (previous != this.slides.current) this[this.config.transition](previous,this.slides.current);

        /* continue the slideshow if autoplay is enabled */
        if (this.isPlaying) { this.slides.repeat = setTimeout( function(){elThis.nextSlide.call(elThis);}, this.config.delay + this.config.transitionSpeed); }
    };

    /* transition script for horizontal swipes */
    this.swipe = function (a,b){

        var a2, b1, b2;

        /* figure out the direction */
        if ((a<b || (a==(this.slides.length-1) && b===0)) && !(a===0 && b==(this.slides.length-1))){
            /* swipe left */
            b1 = this.config.width+"px";
            b2 = 0+"px";
            a2 = -this.config.width+"px";
        }else{
            /* swipe right */
            b1 = -this.config.width+"px";
            b2 = 0+"px";
            a2 = this.config.width+"px";            
        }

        /* place the incoming slide in the correct spot */
        this.slides[b].style.top=0;
        this.slides[b].style.left=b1;

        /* start the transition */
        $(this.slides[b]).animate({left: b2}, this.config.transitionSpeed);
        $(this.slides[a]).animate({left: a2}, this.config.transitionSpeed);
    };
    /* transition script for vertical swipes */
    this.swipe2 = function (a,b){

        var a2, b1, b2;

        /* figure out the direction */
        if ((a<b || (a==(this.slides.length-1) && b===0)) && !(a===0 && b==(this.slides.length-1))){
            /* swipe up */
            b1 = this.config.height+"px";
            b2 = 0+"px";
            a2 = -this.config.height+"px";
        }else{
            /* swipe down */
            b1 = -this.config.height+"px";
            b2 = 0+"px";
            a2 = this.config.height+"px";            
        }

        /* place the incoming slide in the correct spot */
        this.slides[b].style.top=b1;
        this.slides[b].style.left=0;

        /* start the transition */
        $(this.slides[b]).animate({top: b2}, this.config.transitionSpeed);
        $(this.slides[a]).animate({top: a2}, this.config.transitionSpeed);        
    };
    /* transition script for smooth fade */
    this.fade = function (a,b){
    	var elThis = this;

        /* place the outgoing slide in the correct spot */
        $(this.slides[a]).css({
            "z-index": 1,
            top: "0px",
            left: "0px",
            opacity: 1
        });

        /* place the incoming slide in the correct spot */
        $(this.slides[b]).css({
            "z-index": 0,
            top: "0px",
            left: "0px",
            opacity: 0
        });

        /* start the transition */
        $(this.slides[a]).animate({opacity: 0}, this.config.transitionSpeed, function(){
            $(elThis.slides[a]).css("z-index",0);
        });
        $(this.slides[b]).animate({opacity: 1}, this.config.transitionSpeed, function(){
            $(elThis.slides[a]).css("z-index",1);
        });
    };

    /* transition script for fade through background */
    this.fade2 = function (a,b){
    	var elThis = this;

        /* place the outgoing slide in the correct spot */
        $(this.slides[a]).css({
            "z-index": 1,
            top: "0px",
            left: "0px",
            opacity: 1
        });

        /* place the incoming slide in the correct spot */
        $(this.slides[b]).css({
            "z-index": 0,
            top: "0px",
            left: "0px",
            opacity: 0
        });

        /* start the transition */
        $(this.slides[a]).animate({opacity: 0}, this.config.transitionSpeed/2, function(){
            $(elThis.slides[a]).css("z-index",0);
            $(elThis.slides[a]).css("z-index",1);
            $(elThis.slides[b]).animate({opacity: 1}, elThis.config.transitionSpeed/2);
        });


    };
};