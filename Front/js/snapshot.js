//***********************************************************************
//*************************** Snapshot *************************
//***********************************************************************

var token = localStorage.getItem('MonToken');
var id = localStorage.getItem("id");

getSnapshot(id);

//***********************************************************************
//*************************** POST Snapshot *******************************
//***********************************************************************
$("#optSnapshot").click(function (e) {
    e.preventDefault();
    //Pop up "Snapshot loading"
    $('#general_info_popup').append('<p>Le snapshot est en cours de création !</p>');
    $('#general_info_popup').fadeIn();

    //Disable snap button to avoid multiple click
    $('#col1, #col2').css("opacity", 0.5); // OPACITY COLUMN 1 AND 2
    $('#col1, #col2').css("pointer-events", "none"); // UNABLE TO CLICK ON PAGE
    $('#tasks').css("opacity", 0.5);
    $('#tasks').css("pointer-events", "none");
    $("#haSelect").attr("disabled", "");

    $('#snapshot').append('<td colspan="4"><i class="fa fa-spin fa-spinner"></i> Please Wait</td>')

    //Launch job via ajax call
    $.ajax({
        url: BACKEND_URL +'/tasks/backup_snapshot/create_snapshot', //Request
        type: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        data : {
            "subId": id,
        },

        success: function (data) {
            console.log("create snapshot success" + data);
            //Pop up"Snapshot loading"
            $('#general_success_popup').empty().append('<p>Le snapshot a bien été créé !</p>');
            $('#general_success_popup').fadeIn();
            $('#general_success_popup').delay(3000).fadeOut();
        },

        error: function (jqXhr) {
            console.log(jqXhr.responseJSON.error);
            //Pop up "Error"
            if(jqXhr.responseJSON.error === "You have reached your limit of 5 snapshots") {
                console.log("nbok");
                $('#alert_nbMaxSnapshot_error').fadeIn();
                $('#alert_nbMaxSnapshot_error').delay(5000).fadeOut();
            } else {
                $('#alert_error').fadeIn();
                $('#alert_error').delay(5000).fadeOut();
            }


        },

        complete: function () {
            //Disable pop pup info
            $('#snapshot').append('');
            $('#general_info_popup').fadeOut();
            $('#general_info_popup').empty();

            //Restore all buttons
            $('#col1, #col2').css("opacity", 1); // OPACITY COLUMN 1 AND 2
            $('#col1, #col2').css("pointer-events", "auto"); // UNABLE TO CLICK ON PAGE
            $('#tasks').css("opacity", 1);
            $('#tasks').css("pointer-events", "auto");
            $("#haSelect").removeAttr("disabled");

            //Restore snapshot
            $('#snapshot').css("opacity", 1);
            loader('#snapshot', false);
            getSnapshot(id);
        }
    });
});

$("#optSnapshot").click(function (e) {
    e.preventDefault();

    bootbox.confirm({
        message:
            "Vous pouvez ajouter un NOM et/ou une DESCRIPTION :<br><br>" +
            "<label for='snapName'>Nom du snapshot</label><br>" +
            "<input id='snapName' name='snapName' type='text'><br><br>" +
            "<label for='snapDescription'>Description du snapshot</label><br>" +
            "<input id='snapDescription' name='snapDescription' type='text'>",
        buttons: {
            confirm: {
                label: 'Continuer',
                className: 'btn-success'
            },
            cancel: {
                label: 'Annuler',
                className: 'btn-danger'
            }
        },
        callback: function (result) {
            if (result) {
                //Pop up "Snapshot loading"
                $('#general_info_popup').append('<p>Le snapshot est en cours de création !</p>');
                $('#general_info_popup').fadeIn();
                $('#nav-snapshot-tab')[0].click();
                //Disable snap button to avoid multiple click
                $('#col1, #col2').css("opacity", 0.5);
                $('#col1, #col2').css("pointer-events", "none");
                $('#tasks').css("opacity", 0.5);
                $('#tasks').css("pointer-events", "none");
                $("#haSelect").attr("disabled", "");

                $('#snapshot').append('<td colspan="5"><i class="fa fa-spin fa-spinner"></i> Please Wait</td>')

                //Launch job via ajax call
                $.ajax({
                    url: BACKEND_URL + '/tasks/backup_snapshot/create_snapshot', //Request
                    type: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    data: {
                        "subId": id,
                        "snapName": $("#snapName").val(),
                        "snapDescription": $("#snapDescription").val()
                    },

                    success: function (data) {
                        console.log("create snapshot success" + data);
                        //Pop up"Snapshot loading"
                        $('#general_success_popup').empty().append('<p>Le snapshot a bien été créé !</p>');
                        $('#general_success_popup').fadeIn();
                        $('#general_success_popup').delay(3000).fadeOut();
                    },

                    error: function (jqXhr) {
                        console.log(jqXhr.responseJSON.error);
                        //Pop up "Error"
                        if (jqXhr.responseJSON.error === "You have reached your limit of 5 snapshots") {
                            console.log("nbok");
                            $('#alert_nbMaxSnapshot_error').fadeIn();
                            $('#alert_nbMaxSnapshot_error').delay(5000).fadeOut();
                        } else {
                            $('#alert_error').fadeIn();
                            $('#alert_error').delay(5000).fadeOut();
                        }
                    },

                    complete: function () {
                        //Disable pop pup info
                        $('#snapshot').append('');
                        $('#general_info_popup').fadeOut();
                        $('#general_info_popup').empty();

                        //Restore all buttons
                        $('#col1, #col2').css("opacity", 1);
                        $('#col1, #col2').css("pointer-events", "auto");
                        $('#tasks').css("opacity", 1);
                        $('#tasks').css("pointer-events", "auto");
                        $("#haSelect").removeAttr("disabled");

                        //Restore snapshot
                        getSnapshot(id);
                    }
                });
            }
        }
    })

});

function enableSnapMgmt() {
    //***********************************************************************
    //*************************** DELETE Snapshot *****************************
    //***********************************************************************

    $(".buttonDelete").click(function (e) {
        e.preventDefault();
        var subId = id;
        var snapId = $(this).attr('id');

        //Hides the backup
        $('#' + $.escapeSelector('snapshot_' + snapId)).fadeOut();

        //Disable snap button to avoid multiple click
        $('#col1, #col2').css("opacity", 0.5); // OPACITY COLUMN 1 AND 2
        $('#col1, #col2').css("pointer-events", "none"); // UNABLE TO CLICK ON PAGE
        $('#tasks').css("opacity", 0.5);
        $('#tasks').css("pointer-events", "none");
        $("#haSelect").attr("disabled", "");
        //Pop up "Delete loading"
        $('#general_info_popup').empty().append('<p>Le snapshot est en cours de suppression !</p>');
        $('#general_info_popup').fadeIn();

        //Launch job via ajax call
        $.ajax({
            url: BACKEND_URL + '/tasks/backup_snapshot/delete_snapshot?subId=' + subId + '&snapId=' + snapId,
            type: 'DELETE',
            dataType: 'json',
            headers: {
                Authorization: `Bearer ${token}`
            },
            success: function (response) {
                //Pop up "Delete Snapshot"
                $('#general_success_popup').empty().append('<p>Le snapshot a bien été supprimé !</p>');
                $('#general_success_popup').fadeIn();
                $('#general_success_popup').delay(3000).fadeOut();
            },
            error: function (jqXhr) {
                //Pop up "Error"
                $('#' + $.escapeSelector('snapshot_' + snapId)).fadeIn();
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


            },
        })
    });


    //***********************************************************************
    //*************************** Revert Snapshot *******************************
    //***********************************************************************
    $(".revertSnap").click(function (e) {
        e.preventDefault();
        var subId = id;
        var snapId = $(this).attr('id');

        //Disable snapshot table to indicate ongoing task
        $('#snapshot').append('<td colspan="5"><i class="fa fa-spin fa-spinner"></i> Please Wait</td>')

        //Pop up "Delete loading"
        $('#general_info_popup').empty().append('<p>Le revert snapshot est en cours !</p>');
        $('#general_info_popup').fadeIn();

        //Disable snap button to avoid multiple click
        $("#tasks").css("opacity", 0.5);
        $("#tasks").css("pointer-events", "none");
        $("#haSelect").attr("disabled", "");

        //Disable snap button to avoid multiple click
        $('#col1, #col2').css("opacity", 0.5); // OPACITY COLUMN 1 AND 2
        $('#col1, #col2').css("pointer-events", "none"); // UNABLE TO CLICK ON PAGE


        $.ajax({
            url: BACKEND_URL + '/tasks/backup_snapshot/revert_snapshot',
            type: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: {
                "subId": subId,
                "snapId": snapId,
            },

            success: function (response) {
                //Pop up "Revert Snapshot"
                $('#general_success_popup').empty().append('<p>Le snapshot a bien été restauré !</p>');
                $('#general_success_popup').fadeIn();
                $('#general_success_popup').delay(3000).fadeOut();

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

                //Disable pop pup info
                $('#general_info_popup').fadeOut();
                $('#general_info_popup').empty();

                //Restore all buttons
                $("#tasks").css("opacity", 1);
                $("#tasks").css("pointer-events", "auto");

                //Restore all buttons
                $('#col1, #col2').css("opacity", 1); // OPACITY COLUMN 1 AND 2
                $('#col1, #col2').css("pointer-events", "auto"); // UNABLE TO CLICK ON PAGE
                $("#haSelect").removeAttr("disabled");

                $('#snapshot').append('')
                getSnapshot(id);
            },
        })
    });
}
/*
********* FUNCTIONS DECLARATION *********
*/
/**
* @param id
*/
function getSnapshot(id) {
    $.ajax({
        url: BACKEND_URL + '/tasks/backup_snapshot/get_snapshots?subId=' + id, //Request
        type: 'GET',
        dataType: 'json', //type de données qu'on attend en réponse du serveur
        contentType: "application/json",
        headers: {
            Authorization: `Bearer ${token}`
        },

        success: function (response) {
            $('#snapshot').empty();
            $.each(response, function (i, snapshot) {
                if (i == 0) {
                    revert = '<a class="fas fa-redo-alt btn btn-link btn-xs pr-2 pl-2 revertSnap avoidSpam" id="' + snapshot.snapname + '"></a>';
                } else {
                    revert = '';
                }
                if (snapshot.snaptime === null) {
                    $('#snapshot').append(
                        '<tr>' +
                        '<td>' + snapshot.snapname + '</td>' +
                        '</tr>');
                } else {
                    $('#snapshot').append('<tr id="snapshot_' + snapshot.snapname + '">' +
                        '<td>' + snapshot.snapname + '</td>' +
                        '<td>' + snapshot.snaptime + '</td>' +
                        '<td>' + snapshot.description + '</td>' +
                        '<td><a class="fas fa-times-circle btn btn-link btn-xs pr-2 pl-2 buttonDelete avoidSpam" id="' + snapshot.snapname + '"></a></td>' +
                        '<td>' + revert + '</td>' +
                        '</tr>');
                }
            });

        },

        error: function (jqXhr) {
            //Pop up "Error"
            $('#alert_error').fadeIn();
            $('#alert_error').delay(5000).fadeOut();
        },
    });
}