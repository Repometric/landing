// require("https://cdnjs.cloudflare.com/ajax/libs/jquery/1.8.0/jquery-1.8.0.min.js");
(function () {

    document.addEventListener("readystatechange", function() {
        document.body.classList.remove('spinner')
    });

    var $dom = {
        email: $("#email"),
        subscribe: $("#subscribe"),
        send: $("#enter"),
        form: $("#form"),
        key: $("#subscribeKey")
    };
    
    var landing = {
        value: "",
        expand: function () {
            $dom.email.attr("placeholder", "Enter your email...");
            return landing;
        },
        collapse: function () {
            $dom.email.attr("placeholder", "Subscribe");
            $dom.email.val("");
            return landing;
        },
        focus: function () {
            setTimeout(function () {
                $dom.email.focus();
                $dom.email.val(landing.value);
                $dom.email.attr("placeholder", "Enter your email...");
            });
            return landing;
        },
        hideStatus: function (element) {
            $dom.email.removeClass("subscribe-error");
            $("#message").html("").hide();
            return landing;
        },
        toggle: function () {
            $("#enter, #loading").toggle();
            return landing;
        },
        reset: function (element) {
            landing.value = $dom.email.val();
            landing.collapse().hideStatus();
        },
        request: function (sucess, error) {
            var url = $dom.form.attr("action").replace("/post?u=", "/post-json?u=") + "&c=?";
            var data = $dom.email.attr("name") + "=" + $dom.email.val() + "&" + $dom.key.attr("name") + "=";
            var request = {
                url: url,
                type: "GET",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: data,
                success: sucess,
                error: error
            };
            $.ajax(request);
        },
        subscribe: function (element) {
            element.preventDefault();
            $dom.email.prop("readonly", true);
            landing.toggle().hideStatus().request(function (data) {
                var message;
                var div = $("#message");
                landing.toggle();
                if (data.result == "success") {
                    $dom.email.unbind("click");
                    $dom.email.blur();
                    $dom.email.unbind("blur");
                    $dom.email.addClass("subscibed");
                    $dom.email.removeClass("required");
                    $dom.email.val("Subscribed");
                    div.addClass("success");
                    message = data.msg;
                    $("body").bind("click", landing.hideStatus.bind(this));
                } else {
                    $dom.email.addClass("subscribe-error");
                    $dom.email.prop("readonly", false);
                    div.addClass("error");
                    message = "Error: " + data.msg.replace("0 - ", "");
                }
                div.html(message).show();
            });
        }
    };

    $dom.email.bind("click", landing.expand.bind(this));
    $dom.email.bind("input", landing.hideStatus.bind(this));
    $dom.email.bind("blur", landing.reset.bind(this));
    $dom.send.bind("mousedown", landing.focus.bind(this));
    $dom.subscribe.bind("click", landing.subscribe.bind(this));
})();