var errorBox = $(".alert-danger");
errorBox.slideUp(0);

$("#password , #username , #signUpPass , #signUpUser").keyup(function (event) {
    if (event.keyCode === 13) {
        if (window.location.pathname === '/') {
            $("#login_btn").click();
        }
        else {
            $("#sign_btn").click();
        }

    }
});

$("#login_btn").click(function () {
    console.log({username: $("#username").val(), password: $("#password").val()});
    $.post("/login", {username: $("#username").val(), password: $("#password").val()}, function (data) {
        if (data['status']) {
            window.location.href = '/';
            window.location.replace('/official');
        }
        else {
            errorBox.slideUp(0);
            errorBox.html(data['msg']).slideDown(500);
            getInfo();
        }
    })
});

$("#sign_btn").click(function () {
    $.post("/signup", {username: $("#signUpUser").val(), password: $("#signUpPass").val()}, function (data) {
        // $("#info").append("<p>" + data['status'] + " || " + data['msg'] + " </p>");
        if (data['status']) {
            getInfo();
            window.location.replace('/official')
        }
        else {
            errorBox.slideUp(0);
            errorBox.html(data['msg']).slideDown(500);
        }

    })
});


var getInfo = function () {
    $.post("/getInfo", function (data) {
        // var img_url = "/upload/";
        if (data['status']) {
            // if (data['profile']) {
            //     $('#profileImage').attr('src', img_url + data['profile']);
            // }
            show();
            document.getElementById("uploadBtn").onchange = function () {
                document.getElementById("uploadFile").value = this.value.replace("C:\\fakepath\\", "");
            };
            $("#auth").html(data['status']);

        }
    });
};

function liked(id) {
    $.post('/like', {ides: id}, function (data) {
        console.log(data['msg']);
        $('#' + id).find('.count').text(data['msg']);
        if (data['status'] === true) {
            $('#' + id).find('.btn_like').css('color', 'red');
        }
        else {
            $('#' + id).find('.btn_like').css('color', 'gray');
        }
    });
    console.log(id);
};

function comment(cm) {
    if ($('#' + cm).find('.input_cm').css('display') === "none") {
        $('#' + cm).find('.input_cm').css('display', 'flex');
    } else {
        $('#' + cm).find('.input_cm').css('display', 'none');
    }
};

var show = function () {
    $.post("/upload3", {}, function (data) {
        var img_url = "/upload/";
        $("#info").empty();
        data['msg'].forEach(function (img, index) {
            $.post("/postProfile", {user: img.user}, function (data) {
                console.log(data);
                $('#prof' + img._id).attr('src', "/imgProfile/" + data)
            });
            $("#info").append("<div id=" + img._id + " class='box_post'>" +"<div  class='div_img_profile'>"+"<img class='img_profile' id='prof" + img._id + "' src='../img/profile.png'>"+"</>"+"</div>"+"<p class='user_post'>" + img.user + "</p>" + "<div class='all_post'>"+"<img class='post_show' src= " + img_url + img.name + ">" +"</div>"+ "<div class='info_post'>" + "<div class='box'>" + "<i  class=\"fas fa-heart btn_like\" onClick='liked(\"" + img._id + "\")' >" + "</i>" + "</div>" + "<div class='box'> " + "<p class='count'>" + "</div>" + "</p>" + "<div class='box'>" + "<i class=\"far fa-comment cm_icon\" onClick='comment(\"" + img._id + "\")'>" + "</i>" + "</div>" + "</div>" + "<div class='div_all_info'>" + "<div class='commentBox' id='commentBox" + img._id + "'>" + "</div>" + "<div class='box_com'>" + "<div class='box_more' style='display:none;' id='more" + img._id + "'>" + "<p class='more'>" + "comment more" + "</p>" + "</div>" + "<div style='display: none' class=\"input-group mb-3 input_cm\">" + "<input type=\"text\"  class=\"form-control cm_input\" placeholder=\"comment's\" aria-label=\"Recipient\" aria-describedby=\"basic-addon2\">" + "<div class=\"input-group-append\">" + "<button class=\"btn btn-outline-secondary btn_send\" type=\"button\" onclick='cm_send(\"" + img._id + "\")'>" + "Send" + "</button>" + "</div>" + "</div>" + "</div>" + "</div>" + "</div>");
            var comment = img.comment;
            console.log(comment);
            $(".more").click(function () {
                var removed = comment.splice(comment.length - 5);
                console.log(removed);
                if (removed.length < 5) {
                    $('#more' + img._id).css('display', 'none');
                }
                for (var i in removed) {
                    var comments = JSON.parse(removed[i]);
                    console.log(comments.comment);
                    $('#commentBox' + img._id).append("<div class='cm_div'>" + "<p class=' cm_text'>" + comments.name + "</p>" + "<span class='center_cm'>" + ":" + "</span>" + "<div class='cm'>" + "<p class='text_com'>" + comments.comment + "</p>" + "</div>" + "</div>");
                }
            });
            if (comment.length > 5) {
                $('#more' + img._id).css('display', 'block');
                var removed = comment.splice(comment.length - 5);
                console.log(comment);
                for (var i in removed) {
                    var comments = JSON.parse(removed[i]);
                    console.log(comments.comment);
                    $('#commentBox' + img._id).append("<div class='cm_div'>" + "<p class=' cm_text'>" + comments.name + "</p>" + "<span class='center_cm'>" + ":" + "</span>" + "<div class='cm'>" + "<p class='text_com'>" + comments.comment + "</p>" + "</div>" + "</div>");
                }
            }
            else {
                for (i in comment) {
                    comments = JSON.parse(comment[i]);
                    console.log(comments.comment);
                    $('#commentBox' + img._id).append("<div class='cm_div'>" + "<p class=' cm_text'>" + comments.name + "</p>" + "<span class='center_cm'>" + ":" + "</span>" + "<div class='cm'>" + "<p class='text_com'>" + comments.comment + "</p>" + "</div>" + "</div>");
                }
            }
            $('#' + img._id).find('.count').text(img.like_count);
            if (img.liked_users) {
                if (img.liked_users.includes(data['status'])) {
                    $('#' + img._id).find('.btn_like').css('color', 'red');
                }
                else {
                    $('#' + img._id).find('.btn_like').css('color', 'gray');
                }
            }
            else {
                $('#' + img._id).find('.btn_like').css('color', 'gray');
            }
        })

    })
};

function cm_send(id) {
    var cm = $('#' + id).find('.cm_input').val();
    var comment = cm.trim();
    console.log(comment);
    if (comment === '' || null) {
        $('#' + id).find('.input_cm').css('display', 'none');
        console.log($('#' + id).find('.input_cm'));
        $('#' + id).find('.cm_input').val('');
    }
    else {
        $.post("/comment", {id: id, cm: comment}, function (data) {
            $('#' + id).find('.cm_input').val('');
            $('#commentBox' + id).append("<div class='cm_div'>" + "<p class=' cm_text'>" + data['name'] + "</p>" + "<span class='center_cm'>" + ":" + "</span>" + "<p>" + comment + "</p>" + "</div>");
        });
    }

}

getInfo();
