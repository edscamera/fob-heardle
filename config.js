const artistName = "Fall Out Boy";
const startDate = new Date("03/27/24");
const songs = [
    {"title":"Love From The Other Side","url":"https://soundcloud.com/falloutboy/love-from-the-other-side?in=falloutboy/sets/so-much-for-stardust-1"},
	{"title":"Heartbreak Feels So Good","url":"https://soundcloud.com/falloutboy/heartbreak-feels-so-good?in=falloutboy/sets/so-much-for-stardust-1"},
	{"title":"Hold Me Like a Grudge","url":"https://soundcloud.com/falloutboy/hold-me-like-a-grudge?in=falloutboy/sets/so-much-for-stardust-1"},
	{"title":"Fake Out","url":"https://soundcloud.com/falloutboy/fake-out?in=falloutboy/sets/so-much-for-stardust-1"},
	{"title":"Heaven, Iowa","url":"https://soundcloud.com/falloutboy/heaven-iowa?in=falloutboy/sets/so-much-for-stardust-1"},
	{"title":"So Good Right Now","url":"https://soundcloud.com/falloutboy/so-good-right-now?in=falloutboy/sets/so-much-for-stardust-1"},
	{"title":"The Pink Seashell (feat. Ethan Hawke)","url":"https://soundcloud.com/falloutboy/the-pink-seashell-feat-ethan?in=falloutboy/sets/so-much-for-stardust-1"},
	{"title":"I Am My Own Muse","url":"https://soundcloud.com/falloutboy/i-am-my-own-muse?in=falloutboy/sets/so-much-for-stardust-1"},
	{"title":"Flu Game","url":"https://soundcloud.com/falloutboy/flu-game?in=falloutboy/sets/so-much-for-stardust-1"},
	{"title":"Baby Annihilation","url":"https://soundcloud.com/falloutboy/baby-annihilation?in=falloutboy/sets/so-much-for-stardust-1"},
	{"title":"The Kintsugi Kid (Ten Years)","url":"https://soundcloud.com/falloutboy/the-kintsugi-kid-ten-years?in=falloutboy/sets/so-much-for-stardust-1"},
	{"title":"What a Time To Be Alive","url":"https://soundcloud.com/falloutboy/what-a-time-to-be-alive?in=falloutboy/sets/so-much-for-stardust-1"},
	{"title":"So Much (For) Stardust","url":"https://soundcloud.com/falloutboy/so-much-for-stardust?in=falloutboy/sets/so-much-for-stardust-1"},
	{"title":"We Didn’t Start The Fire (Bonus Track)","url":"https://soundcloud.com/falloutboy/we-didnt-start-the-fire-bonus?in=falloutboy/sets/so-much-for-stardust-1"}
];

/* SoundCloud album scrape script
JSON.stringify(Array.from(document.getElementsByClassName("trackItem__trackTitle")).map(x => ({
  title: x.innerText,
    url: x.href
}))).replace(/\}\,/g, "},\n\t").replace(/\[|\]/g, "");
*/