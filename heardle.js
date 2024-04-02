const $ = selector => document.querySelector(selector);

let attempt = 1;
let maxAttempts = 6;
let song = null;
let playTimeout = null;
let guesses = (new Array(maxAttempts)).fill(null).map(x => null);

const gameDay = Math.floor((new Date() - startDate)/1000/60/60/24);

setAttempts = num => {
    const guessContainer = $("#guesses");
    while (guessContainer.children[0]) guessContainer.children[0].remove();
    for(let i = 0; i < maxAttempts; i++) {
        const div = document.createElement("div");
        const span = document.createElement("span");
        if (i < num) div.classList.add("active");
        if (guesses[i] !== null) {
            if (guesses[i] === 0) span.innerText = `⏭️ Skipped`;
            else if (guesses[i] === song.title) span.innerText = `✅ ${song.title}`;
            else span.innerText = `❌ ${guesses[i]}`;
        }

        div.appendChild(span);
        guessContainer.appendChild(div);
    };

    const sliderChildren = Array.from($("#slider-container").children);
    sliderChildren.forEach((elm, i) => {
        if (i < num) elm.classList.add("active");
        else elm.classList.remove("active");
    });

    if (num === maxAttempts + 1) $("#btnSkip").classList.add("hidden");
    else $("#btnSkip").innerText = `SKIP (+${(getMaxDuration(num + 1) - getMaxDuration(num))/1000}s)`;
};

window.addEventListener("load", () => {
    song = songs[Math.floor(Math.random() * songs.length)];
    widget.load(song.url, {
        callback: () => {
            $("#loading").classList.add("hidden");
            window.setTimeout(() => {
                $("#loading").remove();
                setAttempts(attempt);

                checkWin();
            }, .3 * 1000);
        },
    });

    $("title").innerHTML = `Heardle | ${artistName}`;
    $("#header").innerHTML = `${artistName} Heardle`;
    $("#songTitle").innerText = song.title;
});

const widget = SC.Widget($("#soundcloud"));
widget.seekTo(0);
const playBtn = $("#btnPlay");

playBtn.addEventListener("click", () => {
    if (playBtn.innerText === "||") {
        widget.pause();
        window.clearTimeout(playTimeout);
    } else {
        widget.getPosition(data => {
            if (data > getMaxDuration(attempt)) widget.seekTo(0);
            else playTimeout = window.setTimeout(() => {
                widget.pause();
                window.setTimeout(() => widget.seekTo(0), 10)
                playBtn.innerText = "▶";
            }, getMaxDuration(attempt) - data);
            widget.play();
        });
    }
    playBtn.innerText = playBtn.innerText === "||" ? "▶" : "||";
});

const getMaxDuration = (attNum) => {
    switch (attNum) {
        case 1: return 1000;
        case 2: return 2000;
        case 3: return 4000;
        case 4: return 7000;
        case 5: return 10000;
        case 6:
        default:
            return 16000;
    }
}
window.setInterval(() => {
    widget.getPosition(data => {
        $("#slider").style.width = `${Math.round(data/16000*100)}%`;
        $("#timestamp").innerText = `0:${Math.floor(data / 1000).toString().padStart(2, "0")}`;
    });
}, 150);

const autocomplete = $("#autocomplete");
$("#textbox").addEventListener("focusin", () => {
    autocomplete.style.display = "flex";
});
$("#textbox").addEventListener("focusout", (event) => {
    window.addEventListener("mouseup", () => {
        autocomplete.style.display = "none";
    }, { once: true, });
});
$("#textbox").addEventListener("input", () => {
    while (autocomplete.children[0]) autocomplete.children[0].remove();
    songs
        .map(x => x.title)
        .filter(x => x.toLowerCase().replace(/\s/g, "").includes($("#textbox").value.toLowerCase().replace(/\s/g, "")))
        .filter((x, i) => i < 10)
        .forEach(song => {
            const span = document.createElement("span");
            span.innerText = song;
            $("#autocomplete").appendChild(span);
            span.addEventListener("click", () => {
                $("#textbox").value = song;
                autocomplete.style.display = "none";
            });
        });
});

$("#btnSkip").addEventListener("click", () => {
    guesses[attempt - 1] = 0;
    attempt++;
    setAttempts(attempt);
});
$("#btnSubmit").addEventListener("click", () => {
    if (!$("#textbox").value.toLowerCase().replace(/\s/g, "")) return;
    if (song.title.toLowerCase().replace(/\s/g, "") === $("#textbox").value.toLowerCase().replace(/\s/g, "")) {
        guesses[attempt - 1] = song.title;
        const history = getData("history") ?? {};
        history[gameDay] = attempt;
        setData({
            "history": history,
        });
        checkWin();
    } else {
        guesses[attempt - 1] = $("#textbox").value;   
    }
    $("#textbox").value = "";
    attempt++;
    setAttempts(attempt);
});

const lsKey = `heardle-${artistName.toLowerCase().replace(/\s/g, "")}`;
const setData = newData => {
    let data = JSON.parse(localStorage.getItem(lsKey));
    localStorage.setItem(lsKey, JSON.stringify(Object.assign(data ?? {}, newData)));
};
const getData = prop => {
    let data = JSON.parse(localStorage.getItem(lsKey)) ?? {};
    if (!prop) return data;
    return data[prop];
};
const deleteData = prop => {
    let data = JSON.parse(localStorage.getItem(lsKey));
    delete data[prop];
    localStorage.setItem(lsKey, JSON.stringify(data));
}

const checkWin = () => {
    const history = getData("history");
    if (history.hasOwnProperty(gameDay)) {
        Array.from(document.getElementsByClassName("game")).forEach(elm => {
            elm.style.display = "none";
        });
        Array.from(document.getElementsByClassName("end")).forEach(elm => {
            elm.style.display = "block";
        });
        attempt = maxAttempts;
        setAttempts(attempt);
    }
}