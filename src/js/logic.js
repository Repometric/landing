document.addEventListener("DOMContentLoaded", function () {

    document.body.classList.remove('spinner');

    var $dom = {
        email: document.getElementById("email"),
        message: document.getElementById("message"),
        subscribe: document.getElementById("subscribe"),
        key: document.getElementById("subscribeKey"),
        form: document.getElementById("form")
    };

    function expand() {
        $dom.email.placeholder = $dom.email.dataset.placeholder_active;
    }

    function collapse() {
        $dom.email.placeholder = $dom.email.dataset.placeholder_inactive;
        $dom.email.value = "";
    }

    function showMessage(message, className) {
        $dom.message.innerHTML = message;
        $dom.form.classList.add(className);
        setTimeout(function() {
            $dom.form.classList.remove(className);
        }, 3000);
    }

    function subscribe(element) {
        element.preventDefault();
        $dom.subscribe.classList.add("loading");

        var url = $dom.form.getAttribute("action").replace("/post?u=", "/post-json?u=") + "&";
        var data = $dom.email.getAttribute("name") + "=" + $dom.email.value + "&" + $dom.key.getAttribute("name");

        $jsonp.send(url + data + '&c=checkResult', {
            callbackName: 'checkResult',
            onSuccess: checkResult,
            onTimeout: function() {
                console.error('timeout!');
            }
        });
    }

    function checkResult(data) {
        $dom.subscribe.classList.remove("loading");
        if (data.result === "success") {
            $dom.email.blur();
            $dom.email.value = "Subscribed";
            $dom.form.classList.add("subscribed");
            showMessage(data.msg, "subscribe-success");
        } else if (data.result === "error"
            && data.msg.toLowerCase().includes("is already subscribed")) {
            console.error("Error: " + data.msg);
        } else {
            showMessage(data.msg.replace("0 -", "Error:"), "subscribe-error");
        }
    }

    $dom.email.addEventListener("click", expand);
    $dom.email.addEventListener("blur", collapse);

    $dom.subscribe.addEventListener("click", subscribe);
});
