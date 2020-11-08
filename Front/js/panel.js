//***********************************************************************
//*************************** Panel ************************
//***********************************************************************
var token = localStorage.getItem('MonToken');
var subscriptionId = localStorage.getItem("id");


//***********************************************************************
//*************************** Open panel ************************
//***********************************************************************

$("#panel").click(function (e) {
    e.preventDefault();

    $.ajax({
        url: BACKEND_URL + '/tasks/open_panel',
        type: 'GET',
        contentType: "application/json",
        headers: {
            Authorization: `Bearer ${token}`
        },
        data :{
            "subscriptionId": subscriptionId
        },

        success: function (data) {

            window.open(data, "console", "width=744,height=400");
        },
        error: function (jqXhr) {

        },

        complete: function () {

        }
    });
});