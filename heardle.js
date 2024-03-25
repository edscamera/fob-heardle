const $ = selector => document.querySelector(selector);

setAttempts = num => {
    const guessElms = Array.from($("#guesses").children);
    guessElms.forEach((elm, i) => {
        if (i < num) elm.classList.add("active");
        else elm.classList.remove("active");
    });

    const sliderChildren = Array.from($("#slider-container").children);
    sliderChildren.forEach((elm, i) => {
        if (i < num) elm.classList.add("active");
        else elm.classList.remove("active");
    });
};

window.addEventListener("load", () => {
    setAttempts(1);
});