//***********************************************************************
//*************************** Backup *************************
//***********************************************************************

var token = localStorage.getItem('MonToken');
var id = localStorage.getItem("id");

//***********************************************************************
//*************************** GET Backup *******************************
//***********************************************************************

getBackups(id);

function enableBackMgmt() {
//***********************************************************************
//************************* Restore Backup ******************************
//***********************************************************************
    $(".restoreBackup").click(function (e) {
        e.preventDefault();
        var subId = id;
        var backupId = $(this).attr('id').split('&&_')[0];

        //Display popup to inform user
        $('#general_info_popup').append('<p>La sauvegarde est en cours de restauration !</p>');
        $('#general_info_popup').fadeIn();

        //Disable snapshot table to indicate ongoing task
        $('#backup').append('<td colspan="6"><i class="fa fa-spin fa-spinner"></i> Please Wait</td>')

        //Disable snap button to avoid multiple click
        $('#col1, #col2').css("opacity", 0.5); // OPACITY COLUMN 1 AND 2
        $('#col1, #col2').css("pointer-events", "none"); // UNABLE TO CLICK ON PAGE
        $('#tasks').css("opacity", 0.5);
        $('#tasks').css("pointer-events", "none");


        $.ajax({
            url: BACKEND_URL + '/tasks/backup_snapshot/restore_backup',
            type: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: {
                "subId": subId,
                "backupId": backupId

            },
            success: function () {
                $('#general_info_popup').empty();
                $('#general_success_popup').empty().append('<p>La sauvegarde a bien été restaurée !</p>');
                $('#general_success_popup').fadeIn();
                $('#general_success_popup').delay(3000).fadeOut();
            },
            error: function (jqXhr) {
                //Pop up "Error"
                $('#general_info_popup').empty();
                $('#alert_error').fadeIn();
                $('#alert_error').delay(5000).fadeOut();
            },

            complete: function () {
                //Hide popup
                $('#backup').append('')
                $('#general_info_popup').fadeOut();

                //Restore all buttons
                $('#col1, #col2').css("opacity", 1); // OPACITY COLUMN 1 AND 2
                $('#col1, #col2').css("pointer-events", "auto"); // UNABLE TO CLICK ON PAGE
                $('#tasks').css("opacity", 1);
                $('#tasks').css("pointer-events", "auto");

                // Restore snap button and disable loader
                $('#backup').css("opacity", 1);
                $('#backup').css("pointer-events", "auto");
                loader('#backup', false);
                getBackups(id);

            }
        });
    });


//***********************************************************************
//*************************** DELETE Backup *****************************
//***********************************************************************

    $(".buttonDeleteBackup").click(function (e) {
        var subId = id;
        var backupId = $(this).attr('id');
        var backupTrim = backupId.replace("&&_delete", "");

        //Hides the backup
        $('#'+$.escapeSelector(backupTrim+'&&_row')).fadeOut();

        //Display popup to inform user
        $('#general_info_popup').append('<p>La sauvegarde est en cours de suppression !</p>');
        $('#general_info_popup').fadeIn();

        //Disable snapshot table to indicate ongoing task
        $('#col1, #col2').css("opacity", 0.5); // OPACITY COLUMN 1 AND 2
        $('#col1, #col2').css("pointer-events", "none"); // UNABLE TO CLICK ON PAGE


        //Disable task buttons to avoid multiple click
        $("#tasks").css("opacity", 0.5);
        $("#tasks").css("pointer-events", "none");
        $("#haSelect").attr("disabled", "");



        //Launch job via ajax call
        $.ajax({
            url: BACKEND_URL + '/tasks/backup_snapshot/delete_backup?subId=' + subId + '&backupId=' + backupTrim, //changer l'url backup
            type: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            },
            success: function (response) {
                $('#general_info_popup').empty();
                $('#general_success_popup').empty().append('<p>La sauvegarde a bien été supprimée !</p>');
                $('#general_success_popup').fadeIn();
                $('#general_success_popup').delay(3000).fadeOut();

            },
            error: function (response) {
                $('#general_info_popup').empty();
                $('#'+$.escapeSelector(backupTrim+'&&_row')).fadeIn();
            },
            complete: function () {
                //Hide popup
                $('#general_info_popup').fadeOut();

                //Restore buttons
                $("#tasks").css("opacity", 1);
                $("#tasks").css("pointer-events", "auto");

                //Restore snap button and disable loader
                $('#col1, #col2').css("opacity", 1); // OPACITY COLUMN 1 AND 2
                $('#col1, #col2').css("pointer-events", "auto"); // UNABLE TO CLICK ON PAGE
                $("#haSelect").removeAttr("disabled");
                getBackups(id);
            },
        })
    });
}

/*
********* FUNCTIONS DECLARATION *********
*/
/**
 * Retrieve the backups and display them in backup table
 * @param id
 */
function getBackups(id) {
    $.ajax({
        url: BACKEND_URL +'/tasks/backup_snapshot/get_backups?subId=' + id, //Request
        type: 'GET',
        dataType: 'json', //type de données qu'on attend en réponse du serveur
        contentType: "application/json",
        headers: {
            Authorization: `Bearer ${token}`
        },

        success: function (response) {
            $('#backup').empty();
            $.each(response, function (i, backup) {
                var backupDate = backup.backupName.split('-');
                var backupDay = backupDate[3];
                var backupInfo = backupDate[4].split('.');
                var backupHour = backupInfo[0];
                var backupName = backupDay + "-" + backupHour;
                $('#backup').append('<tr id="'+ backup.backupId +'&&_row">' +
                    '<td>' + backupName + '</td>' +
                    '<td>' + backup.format + '</td>' +
                    '<td>' + fileConvertSize(backup.size) + '</td>' +
                    '<td> <a class="fa fa-cloud-upload btn btn-link btn-xs pr-2 pl-2 buttonUpload" onclick=upload("'+ backup.backupName +'") id="'+ backup.backupId +'&&_upload"></a> </td>' +
                    '<td> <a class="fas fa-times-circle btn btn-link btn-xs pr-2 pl-2 buttonDeleteBackup" id="'+ backup.backupId +'&&_delete"></a> </td>' +
                    '<td> <a class="fas fa-redo-alt btn btn-link btn-xs pr-2 pl-2 restoreBackup"  id="'+ backup.backupId +'&&_restore"></a> </td>' +
                    '</tr>');
            });
            enableBackMgmt();
        },

        error: function (jqXhr) {

        },
    });
}

