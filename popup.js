
async function startScript(nTabs) {
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    let url = tabs[0].url;
    let validUrl = url.indexOf('https://www.youtube.com/') === 0;
    validUrl = validUrl && url.includes('list=');

    if (!validUrl) {
      alert('URL is invalid. Open YouTube playlist.');
      return;
    }

    let [origin, search] = url.split('?');
    let urlObj = (new URLSearchParams('?' + search)); //.get('loopLength');
    let newUrl = url + '&openFirstTab=1&nTabs=' + nTabs;
    if (search.includes('&index=')) {
      urlObj.delete('index');
      newUrl = origin + '?' + urlObj.toString() + '&openFirstTab=1&nTabs=' + nTabs;
    }
    window.open(newUrl);
  });
}

document.getElementById('clickactivity20').addEventListener('click', () => startScript(20));
document.getElementById('clickactivity15').addEventListener('click', () => startScript(15));
document.getElementById('clickactivity10').addEventListener('click', () => startScript(10));
document.getElementById('clickactivity5').addEventListener('click', () => startScript(5));
document.getElementById('clickactivity3').addEventListener('click', () => startScript(3));
document.getElementById('clickactivity2').addEventListener('click', () => startScript(2));

document.getElementById('githubLink').addEventListener('click', () => window.open('https://github.com/hattifn4ttar/youtube_promoteplaylist'));
document.getElementById('youtubeLink').addEventListener('click', () => window.open('https://www.youtube.com/watch?v=eTSipyTLSjo'));
document.getElementById('preferablePlaylist').addEventListener('click', () => window.open('https://www.youtube.com/playlist?list=PLQxYKug91T31ixyCs81TwIl8wAiD9AZAH'));

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