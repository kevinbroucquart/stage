//***********************************************************************
//*************************** Shutdown Subscription ************************
//***********************************************************************
var token = localStorage.getItem('MonToken');
var id = localStorage.getItem("id");
var serviceType = localStorage.getItem('ServiceType');

$("#optStartVPS").click(function (e) {
    e.preventDefault();

    //Pop up "start loading"
    $('#general_info_popup').empty().append('<p>Démarrage en cours !</p>');
    $('#general_info_popup').fadeIn();

    //Disable snap button to avoid multiple click
    $('#col1, #col2').css("opacity", 0.5); // OPACITY COLUMN 1 AND 2
    $('#col1, #col2').css("pointer-events", "none"); // UNABLE TO CLICK ON PAGE
    $('#tasks').css("opacity", 0.5);
    $('#tasks').css("pointer-events", "none");
    $("#haSelect").attr("disabled", "");

    //Launch job via ajax call
    $.ajax({
        url: BACKEND_URL +'/tasks/start_subscription', //Request
        type: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        data: {
            "subId": id,
        },

        success: function () {
            //Pop up"Start end"
            let type = localStorage.getItem("ServiceType")
            $('#general_success_popup').empty().append('<p>Le '+serviceType+' est demarré !</p>');
            $('#general_success_popup').fadeIn();
            $('#general_success_popup').delay(5000).fadeOut();
            setTimeout(function(){
                $('#general_success_popup').empty();
            }, 5500);

            //Change button start and stop
            $("#optVPS").show();
            $('#optStartVPS').hide();
            $('.restart').show();
            $('#restartVPS').show();

            // UPDATE STATUS 
            $(document).ready(function () {
                var id = localStorage.getItem("id");
                $.ajax({
                    url: BACKEND_URL +'/user_subscriptions/get_subscription_status?id=' + id, //Request
                    type: 'GET',
                    dataType: 'json', //type de données qu'on attend en réponse du serveur
                    contentType: "application/json",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    success: function (response) {
            
                        // si le statut est "running" couleur de fond vert, sinon rouge
                            if (response.status === "running") {
                                // $(".stop").append('<a href="" id="stopVPS"><span title="Arreter le serveur"><img src="../../assets/icons/no-stopping.png" alt="" id="imgStop"><br>Arreter</span></a>')
                                $('#status').empty().append(response.status).css("color", "#619c5f");
                            }else{
                                // $(".stop").append('<a href="" id="optVPS"><span title="Demarrer le serveur"><img src="../../assets/icons/power.svg" alt="" id="imgStart"><br> Demarrer</span></a>')
                                $('#status').empty().append(response.status).css("color", "#cf4747");
                                $("#optVPS").hide();
                                $('#optStartVPS').show();
                            }
                    },
                    error: function (jqXhr) {
                        console.log(jqXhr);
                    },
                });
            
            });
            // END UPDATE STATUS 

        },

        error: function () {
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

