let cachedPkgs = {};
let cachedFuncs = {};
let docHost = "";
const tryHosts = [
  "http://localhost:6060",
  "https://tip.golang.org",
];

function highlight(text, words) {
  words
  .map(word => new RegExp(`(${word})`, 'ig'))
  .forEach(function(word) {
    if(text.match(word)) {
      text = text.replace(word, "\0$1\1")
    }
  });

  return htmlSafe(text).replace(new RegExp("\0", "g"), "<match>")
                       .replace(new RegExp("\1", "g"), "</match>");
}

function htmlSafe(unsafe) {
  return unsafe.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;");
}

function sendXHR(host, url) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", host+url, false);
  try {
    xhr.send();
  } catch(e) {
    console.error("Could not fetch", host+url);
  }
  return xhr.status && xhr.responseText;
}

function getPkgsHTML(url) {
  let html = '';
  for(let i = 0 ; i < tryHosts.length && !html ; i++) {
    docHost = tryHosts[i]
    html = sendXHR(docHost, url) || '';
  }
  return html;
}

function pkgFuncs(pkg) {
  if(cachedFuncs[pkg] && Object.keys(cachedFuncs[pkg]).length > 0) {
    return cachedFuncs[pkg];
  }

  let div = document.createElement('div');
  div.innerHTML = getPkgsHTML('/pkg/' + pkg);

  cachedFuncs[pkg] = {};
  div.querySelector('#manual-nav').querySelectorAll('dd a').forEach(function(a) {
    const synopsis = a.innerText;
    const name = a.attributes.href.value.substring(1);
    cachedFuncs[pkg][name] = {
      name: name,
      synopsis: synopsis,
    };
  });
  return cachedFuncs[pkg];
}

function allPkgs() {
  if(Object.keys(cachedPkgs).length > 0) {
    return cachedPkgs;
  }

  let div = document.createElement('div');
  div.innerHTML = getPkgsHTML('/pkg/');

  cachedPkgs = {};
  div.querySelectorAll('.pkg-dir tr').forEach(function(tr) {
    const link = tr.querySelector('.pkg-name a');
    if(!link) { return; }

    const synopsis = tr.querySelector('.pkg-synopsis').innerText.replace(/\s*(.*?)\s*/, "$1");
    const name = link.attributes.href.value.replace(/\/$/, '');
    cachedPkgs[name] = {
      name: name,
      synopsis: synopsis,
    };
  });
  return cachedPkgs;
}

function score(name, query, synopsis) {
  const nLen = name.length;
  const rLen = query.length;
  if(name.match(new RegExp(query, 'i'))) {
    return 1 - 0.5 * Math.abs(nLen - rLen)/Math.max(nLen, rLen);
  }
  if(!synopsis) {
    return 0;
  }
  if(synopsis.match(new RegExp(query, 'i'))) {
    return (1 - 1.0 * query.length/synopsis.length)/2;
  }
}

function sortedPkgs(pkgQuery) {
  return Object.keys(allPkgs())
    .sort(function(name1, name2) {
      const score1 = score(name1, pkgQuery);
      const score2 = score(name2, pkgQuery);
      if(score1 < score2) return 1;
      if(score1 > score2) return -1;
      return 0;
    })
    .map(name => allPkgs()[name])
    .slice(0, 5);
}

function sortedFuncs(pkg, funcQuery) {
  keys = Object.keys(pkgFuncs(pkg))
    r = keys.sort(function(name1, name2) {
      const score1 = score(name1, funcQuery);
      const score2 = score(name2, funcQuery);
      if(score1 < score2) return 1;
      if(score1 > score2) return -1;
      return 0;
    })
    .map(name => pkgFuncs(pkg)[name])
    .slice(0, 5);
  return r;
}

function parseUserInput(text) {
  if(text.length === 0) { return; } // TODO: suggest most commonly used

  let words = text.split(/[\s#]+/, 2)
  let pkgQuery = words[0].replace(/\/$/, '');
  let funcQuery = words[1];

  if(text.match(/\s$/) || words.length > 1) {
    let pkg = sortedPkgs(pkgQuery)[0];
    return sortedFuncs(pkg.name, funcQuery)
      .map(r => ({
        content: `${pkg.name}/#${r.name}`,
        description: `<url>${highlight(pkg.name, [pkgQuery])}#${highlight(r.name, [funcQuery])}</url> ${highlight(r.synopsis, [])}`,
        // description: r.description,
      }));
  } else {
    return sortedPkgs(pkgQuery).map(r => ({
      content: r.name,
      description: `<url>${highlight(r.name, [pkgQuery])}</url> ${highlight(r.synopsis, [])}`,
      // description: r.description,
    }));
  }
}

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    suggest(parseUserInput(text));
  }
);

chrome.omnibox.onInputEntered.addListener(
  function(text) {
    chrome.tabs.create({url: (function() {
      let results = parseUserInput(text);
      if(results.length === 0) return;
      return `${docHost}/pkg/${results[0].content}`;
    })()});
  }
);
