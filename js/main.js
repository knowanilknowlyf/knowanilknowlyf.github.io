(function($) {

	'use strict';

	$(document).ready(function(){

		// VERTICAL PAGE
		var contentSections = $('.group'),
		navigationItems = $('#vertical-nav a');

		if ($("#vertical-nav").length > 0) {
			updateNavigation();
			$(".st-content").on('scroll', function(){
				updateNavigation();
			});
		}

        // fix dropdown menu on mobile
        $('.dropdown-toggle').click(function(e) {
            e.preventDefault();
            setTimeout($.proxy(function() {
                if ('ontouchstart' in document.documentElement) {
                    $(this).siblings('.dropdown-backdrop').off().remove();
                }
            }, this), 0);
        });

        // for contact form ajax
        jQuery.support.cors = true;
        $("#formContact").submit(function() {

            var url = "send.html";

            $.ajax({
                type: "POST",
                url: url,
                data: $("#formContact").serialize(),
                beforeSend: function(xhr){
                    $("#formContact").css('cssText', 'display: none !important');
                    $(".loading").css('cssText', 'display: table !important');
                },
                success: function(data)
                {
                    var msg = jQuery.parseJSON(data);
                    $(".loading").css('cssText', 'display: none !important');
                    if (msg.status == "success") {
                        $(".form-contact-status").css('cssText', 'display: block !important');
                    } else {
                        $("#formContact").css('cssText', 'display: block !important');
                        alert("Fail send contact");
                    }

                },
                error: function(msg)
                {
                    $(".loading").css('cssText', 'display: none !important');
                    $("#formContact").css('cssText', 'display: block !important');
                    alert("Fail send contact");
                }
            });

            return false;
        });

		//scroll to the section
		navigationItems.on('click', function(event){
	        event.preventDefault();
	        scrollGoTo($(this.hash));
	    });
	    
	    //scroll to second section
	    $('.scroll-down').on('click', function(event){
	        event.preventDefault();
	        scrollGoTo($(this.hash));
	    });

	    //close navigation on touch devices when selectin an elemnt from the list
	    $('.touch #vertical-nav a').on('click', function(){
	    	$('.touch #vertical-nav').removeClass('open');
	    });

		function updateNavigation() {
			contentSections.each(function(){
				var $this = $(this);
				var activeSection = $('#vertical-nav a[href="#'+$this.attr('id')+'"]').data('number') - 1;
				if ( ( $this.offset().top - $(window).height()/2 < $(window).scrollTop() ) && ( $this.offset().top + $this.height() - $(window).height()/2 > $(window).scrollTop() ) ) {
					navigationItems.eq(activeSection).addClass('is-selected');
				}else {
					navigationItems.eq(activeSection).removeClass('is-selected');
				}
			});
		}

		var firstSectionId = $('#vertical-nav a[data-number="' + 1 + '"]').attr("href"),
			$firstSection = $('section' + firstSectionId);
		function scrollGoTo(target) {
            var pageTopPadding = ($('.st-content-inner #page').length > 0) ? parseInt($('.st-content-inner #page').css('padding-top')) : 0;
	        var offsets = (target.offset().top - $firstSection.offset().top + pageTopPadding);
	        if (offsets < 0 ) { offsets * -1 };
	        $('body,html,.st-content').animate(
	        	{'scrollTop':offsets},
	        	600
	        );
		}

		// Flex Slider
		$('.flexslider:not(.with-nav)').flexslider({
		    animation: "fade",
		    start: function(){updateNavigation();},
		    controlNav: false
		});
		$('.flexslider.with-nav').flexslider({
		    animation: "fade",
		    controlNav: true
		});


		// PARALAX EFFECT
		/* detect touch */
		if("ontouchstart" in window){
		    document.documentElement.className = document.documentElement.className + " touch";
		}
		if(!$("html").hasClass("touch")){
		    /* background fix */
		    $(".parallax").css("background-attachment", "fixed");
		}

		/* fix vertical when not overflow
		call fullscreenFix() if .fullscreen content changes */
		function fullscreenFix(){
		    var h = $('body').height();
		    // set .fullscreen height
		    $(".content-b").each(function(i){
		        if($(this).innerHeight() <= h){
		            $(this).closest(".fullscreen").addClass("not-overflow");
		        }
		    });
		}
		$(window).resize(fullscreenFix);
		fullscreenFix();

		/* resize background images */
		function backgroundResize(){
		    var windowH = $(window).height();
		    $(".background").each(function(i){
		        var path = $(this);
		        // variables
		        var contW = path.width();
		        var contH = path.height();
		        var imgW = path.attr("data-img-width");
		        var imgH = path.attr("data-img-height");
		        var ratio = imgW / imgH;
		        // overflowing difference
		        var diff = parseFloat(path.attr("data-diff"));
		        diff = diff ? diff : 0;
		        // remaining height to have fullscreen image only on parallax
		        var remainingH = 0;
		        if(path.hasClass("parallax") && !$("html").hasClass("touch")){
		            var maxH = contH > windowH ? contH : windowH;
		            remainingH = windowH - contH;
		        }
		        // set img values depending on cont
		        imgH = contH + remainingH + diff;
		        imgW = imgH * ratio;
		        // fix when too large
		        if(contW > imgW){
		            imgW = contW;
		            imgH = imgW / ratio;
		        }
		        //
		        path.data("resized-imgW", imgW);
		        path.data("resized-imgH", imgH);
		        path.css("background-size", imgW + "px " + imgH + "px");
		    });
		}
		$(window).resize(backgroundResize);
		$(window).focus(backgroundResize);
		backgroundResize();

		/* set parallax background-position */
		function parallaxPosition(e){
		    var heightWindow = $(window).height();
		    var topWindow = $(window).scrollTop();
		    var bottomWindow = topWindow + heightWindow;
		    var currentWindow = (topWindow + bottomWindow) / 2;
		    $(".parallax").each(function(i){
		        var path = $(this);
		        var height = path.height();
		        var top = path.offset().top;
		        var bottom = top + height;
		        // only when in range
		        if(bottomWindow > top && topWindow < bottom){
		            var imgW = path.data("resized-imgW");
		            var imgH = path.data("resized-imgH");
		            // min when image touch top of window
		            var min = 0;
		            // max when image touch bottom of window
		            var max = - imgH + heightWindow;
		            // overflow changes parallax
		            var overflowH = height < heightWindow ? imgH - height : imgH - heightWindow; // fix height on overflow
		            top = top - overflowH;
		            bottom = bottom + overflowH;
		            // value with linear interpolation
		            var value = min + (max - min) * (currentWindow - top) / (bottom - top);
		            // set background-position
		            var orizontalPosition = path.attr("data-oriz-pos");
		            orizontalPosition = orizontalPosition ? orizontalPosition : "50%";
		            $(this).css("background-position", orizontalPosition + " " + value + "px");
		        }
		    });
		}
		if(!$("html").hasClass("touch")){
		    $(window).resize(parallaxPosition);
		    //$(window).focus(parallaxPosition);
            $(".st-content").scroll(
                parallaxPosition
            );
		    parallaxPosition();
		}
		// END PARALAX EFFECT



	});

	$(window).height(function(){
		if (window.innerWidth > 768) {
            $('.onscreen').css('height', window.innerHeight);
        }
        $('.slides .onscreen').css('height', window.innerHeight);
	});

	$(window).load(function(){

		// Container
		var $container = $('#foliowrap');
		$container.isotope({
			filter:'*',
			animationOptions: {
				duration: 750,
				easing: 'linear',
				queue: false,
			}
		});

		// Isotope Button
		$('#options li a').click(function(){
			var selector = $(this).attr('data-filter');
			$container.isotope({
				filter:selector,
				animationOptions: {
					duration: 750,
					easing: 'linear',
					queue: false,
				}
			});
			return false;
		});

		var $optionSets = $('#options'),
			$optionLinks = $optionSets.find('a');

			$optionLinks.click(function(){
				var $this = $(this);
				// don't proceed if already selected
				if ($this.hasClass('selected')) {
					return false;
				}
				var $optionSet = $this.parents('#options');
				$optionSet.find('.selected').removeClass('selected');
				$this.addClass('selected'); 
			});
		
	});

})( jQuery );
