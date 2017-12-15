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

    function request(url, success) {
        var request = new XMLHttpRequest();

        request.open('GET', url, true);
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                success(JSON.parse(request.responseText));
            }
        };
        request.send();
    }

    function subscribe(element) {
        element.preventDefault();
        $dom.subscribe.classList.add("loading");

        var url = $dom.form.getAttribute("action").replace("/post?u=", "/post-json?u=") + "&";
        var data = $dom.email.getAttribute("name") + "=" + $dom.email.value + "&" + $dom.key.getAttribute("name");

        request(url + data, checkResult);
    }

    function checkResult(response) {
        $dom.subscribe.classList.remove("loading");
        if (response["result"] === "success") {
            $dom.email.blur();
            $dom.email.value = "Subscribed";
            $dom.form.classList.add("subscribed");
            showMessage(response["msg"], "subscribe-success");
        } else if (response["result"] === "error"
            && response["msg"].toLowerCase().includes("is already subscribed")) {
            console.error("Error: " + response["msg"]);
        } else {
            showMessage(response["msg"].replace("0 -", "Error:"), "subscribe-error");
        }
    }

    $dom.email.addEventListener("click", expand);
    $dom.email.addEventListener("blur", collapse);

    $dom.subscribe.addEventListener("click", subscribe);
});
