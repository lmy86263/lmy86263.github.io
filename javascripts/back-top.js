// $("#back-top").hide();
$(document).ready(function() {
    // $("#back-top").show()

    $(window).scroll(function() {
        $("#back-top").attr("style", "display:block;");
        if ($(this).scrollTop() > 300) {
            $('#back-top').fadeIn();
        } else {
            $('#back-top').fadeOut();
        }
    });
    $('#back-top a').click(function() {
        $('body,html').animate({
            scrollTop: 0
        }, 500);
        return false;
    });
});