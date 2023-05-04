var getInfo = function () {
    $.post("/getInfo", function (data) {
        var img_url = "imgProfile/";
        if (data['status']) {
            if (data['profile']) {
                $('#profileImage').attr('src', img_url + data['profile']);
            }
            $("#auth").html(data['status']);

        }
    });
};
$('#new_pass').on('input', function (evt) {
    var pass = $("#new_pass").val().replace(/\s/g,'');
    $("#new_pass").val($("#new_pass").val().replace(/\s/g,''));
    console.log(pass);
    $.post("/checkPass", {passNew: pass}, function (data) {
        console.log(data['msg']);
        if (data['status']) {
            $('#save_pass').css('display', 'block');
            $('#check_pass').html('');
        }
        else {
            $('#check_pass').html(data['msg']);
            $('#check_pass').css('color' , 'red');
            $('#save_pass').css('display', 'none')
        }
        $('#save_pass').click(function () {
            $.post("/changePass", {passNew: $("#new_pass").val()}, function (data) {
                $('#new_pass' ).val('');
            });
        });

    });
});


$("#profileImage").click(function(e) {
    $("#profileBtn").click();
});
function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            $('#profileImage').attr('src', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

$("#profileBtn").change(function() {
    readURL(this);
    $('#set_btn' ).css('display' , 'block');
});

getInfo();