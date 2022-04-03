
async function startScript(nTabs) {
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    let url = tabs[0].url;
    let validUrl = url.indexOf('https://www.youtube.com/') === 0;
    validUrl = validUrl && url.includes('list=');

    if (!validUrl) {
      alert('URL is invalid. Open YouTube playlist.');
      return;
    }

    // if (typeof browser === "undefined") {
    //   var browser = chrome;
    // }

    chrome.storage.local.set({ startUrl: url, openTime: (new Date()).getTime(), nTabs });
    console.log('newUrl:', url);
    window.open(url);
  });
}

document.getElementById('clickactivity20').addEventListener('click', () => startScript(20));
document.getElementById('clickactivity15').addEventListener('click', () => startScript(15));
document.getElementById('clickactivity10').addEventListener('click', () => startScript(10));
document.getElementById('clickactivity5').addEventListener('click', () => startScript(5));
document.getElementById('clickactivity3').addEventListener('click', () => startScript(3));
document.getElementById('clickactivity2').addEventListener('click', () => startScript(2));

document.getElementById('githubLinkPlaylist').addEventListener('click', () => window.open('https://github.com/hattifn4ttar/youtube_promoteplaylist'));
document.getElementById('webLink').addEventListener('click', () => window.open('https://hattifn4ttar.github.io/supportfreemedia/'));

chrome.storage.local.set({ like: true });
var form = document.querySelector("form");
form.addEventListener("change", async function(event) {
  if (event.target.name === 'like') {
    let like = await chrome.storage.local.get('like');
    like = like.like;
    chrome.storage.local.set({ like: !like });
  }
  event.preventDefault();
}, false);