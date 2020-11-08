//***********************************************************************
//*************************** Restart Subscription **********************
//***********************************************************************
var token = localStorage.getItem('MonToken');
var id = localStorage.getItem("id");


       
$("#restartVPS").click(function (e) {
    e.preventDefault();
    //Pop up "restart loading"
    $('#general_info_popup').empty().append('<p>Redémarrage en cours !</p>');
    $('#general_info_popup').fadeIn();

    //Disable all button to avoid multiple click
    $('#col1, #col2').css("opacity", 0.5); // OPACITY COLUMN 1 AND 2
    $('#col1, #col2').css("pointer-events", "none"); // UNABLE TO CLICK ON PAGE
    $('#tasks').css("opacity", 0.5);
    $('#tasks').css("pointer-events", "none");
    $("#haSelect").attr("disabled", "");

    //Launch job via ajax call
    $.ajax({
            url: BACKEND_URL +'/tasks/restart_subscription', //Request
            type: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            data:    {
                "subId": id,
                        
            },

            success: function () {
                //Pop up"Restart Subscription"
                $('#general_success_popup').empty().append('<p>Le redémarrage a bien été effectué !</p>');
                $('#general_success_popup').fadeIn();
                $('#general_success_popup').delay(5000).fadeOut();
                setTimeout(function(){
                    $('#general_success_popup').empty();
                    }, 5500);
            },

            error: function (jqXhr) {
                //Pop up "Error"
                 $('#alert_error').fadeIn();
                 $('#alert_error').delay(5000).fadeOut();
            },

            complete: function () {
                //Disable pop pup info
                $('#general_info_popup').fadeOut();
                $('#general_info_popup').empty();

                //Restore all buttons
                $('#col1, #col2').css("opacity", 1); // OPACITY COLUMN 1 AND 2
                $('#col1, #col2').css("pointer-events", "auto"); // UNABLE TO CLICK ON PAGE
                $('#tasks').css("opacity", 1);
                $('#tasks').css("pointer-events", "auto");
                $("#haSelect").removeAttr("disabled");

                getSnapshot(id);
        }
    });
});


