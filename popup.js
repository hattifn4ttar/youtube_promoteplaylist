
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
    console.log('url:', url, newUrl);
    // return;
    window.open(newUrl);
  });
}

document.getElementById('clickactivity20').addEventListener('click', () => startScript(20));
document.getElementById('clickactivity10').addEventListener('click', () => startScript(10));
document.getElementById('clickactivity5').addEventListener('click', () => startScript(5));
document.getElementById('clickactivity3').addEventListener('click', () => startScript(3));
document.getElementById('clickactivity2').addEventListener('click', () => startScript(2));

document.getElementById('githubLink').addEventListener('click', () => window.open('https://github.com/hattifn4ttar/youtube_promoteplaylist'));
document.getElementById('youtubeLink').addEventListener('click', () => window.open('https://www.youtube.com/watch?v=eTSipyTLSjo'));
