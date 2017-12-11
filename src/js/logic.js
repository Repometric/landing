document.addEventListener("readystatechange", function () {

    document.body.classList.remove('spinner');

    var $dom = {
        email: $("#email"),
        message: $("#message"),
        subscribe: $("#subscribe"),
        key: $("#subscribeKey"),
        form: $("#form")
    };

    function collapse() {
        if (!$dom.form.hasClass("subscribe-success")) {
            $dom.email.val("");
        }
    }

    function hideMessage() {
        if (!$dom.form.hasClass("subscribe-success")) {
            $dom.form.removeClass("subscribe-error");
            $dom.message.html("").hide();
        }
    }

    function showMessage(message) {
        $dom.message.html(message).show();
        setTimeout(function() {
            $dom.message.html("").hide();
        }, 3000);
    }

    function reset() {
        collapse();
        hideMessage();
    }

    function toggle() {
        $("#enter, #loading").toggle();
    }

    function request(success, error) {
        var url = $dom.form.attr("action").replace("/post?u=", "/post-json?u=") + "&c=?";
        var data = $dom.email.attr("name") + "=" + $dom.email.val() + "&" + $dom.key.attr("name") + "=";
        var request = {
            url: url,
            type: "GET",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: data,
            success: success,
            error: error
        };
        $.ajax(request);
    }
    
    function subscribe(element) {
        element.preventDefault();
        if (!$dom.form.hasClass("subscribe-success")) {
            toggle();
            request(checkResult.bind(this));
        }
    }
    
    function checkResult(data) {
        var message;
        toggle();
        if (data.result === "success") {
            $dom.form.addClass("subscribe-success");
            $dom.email.val("Subscribed");
            message = data.msg;
        } else if (data.result === "error"
            && data.msg.toLowerCase().includes("is already subscribed")){
            console.error("Error: " + data.msg);
            return;
        } else {
            $dom.form.addClass("subscribe-error");
            message = data.msg.replace("0 -", "Error:");
        }
        showMessage(message);
    }
    $dom.email.bind("input", hideMessage.bind(this));
    $dom.email.bind("blur", reset.bind(this));

    $dom.subscribe.bind("click", subscribe.bind(this));
});
