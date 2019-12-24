/**/
/* Globals */
/**/
class CookieCache {
  // A class used to cache data about the browser's cookies, which we update as notifications come in.
  constructor() {
    this._cookies = {};
    this.reset = () => {
      this._cookies = {};
    }
    this.add = cookie => {
      let domain = cookie.domain;
      if (!this._cookies[domain]) {
        this._cookies[domain] = [];
      }
      this._cookies[domain].push(cookie);
    };
    this.getCookies = domain => this._cookies[domain];
    // Returns a sorted list of cookie domains that match |filter|. If |filter| is
    //  null, returns all domains.
    this.getDomains = (filter, sortBy) => {
      const result = [];
      if (sortBy === 'domains') {
        sortByDomains(this._cookies).forEach(domain => {
          if (!filter || domain.indexOf(filter) != -1) { result.push(domain) }
        });
      } else {
        sortByCookies(this._cookies).forEach(domain => {
          if (!filter || domain.indexOf(filter) != -1) { result.push(domain) }
        });
      }
      return result;
    }
    this.remove = cookie => {
      let domain = cookie.domain;
      if (this._cookies[domain]) {
        let i = 0;
        while (i < this._cookies[domain].length) {
          if (cookieMatch(this._cookies[domain][i], cookie)) {
            this._cookies[domain].splice(i, 1);
          } else { i++;}
        }
        if (this._cookies[domain].length == 0) {
          delete this._cookies[domain];
        }
      }
    };
  }
}
var cache = new CookieCache();
var reload_scheduled = false;

/**/
/* Query selectors */
/**/
const select = selector => document.querySelector(selector);
const selectAll = selector => document.querySelectorAll(selector);

/**/
/* Utilities */
/**/
const sortByCookies = obj => Object.keys(obj).sort((a, b) => obj[b].length - obj[a].length);
const sortByDomains = obj => Object.keys(obj).sort();


const cookieMatch = (c1, c2) => (
  (c1.name == c2.name) && (c1.domain == c2.domain) &&
  (c1.hostOnly == c2.hostOnly) && (c1.path == c2.path) &&
  (c1.secure == c2.secure) && (c1.httpOnly == c2.httpOnly) &&
  (c1.session == c2.session) && (c1.storeId == c2.storeId)
);
const alert = config => Swal.fire(config);

/**/
/* Handler functions */
/**/
const handleSubmitCleanup = e => {
  e.preventDefault();
  const checkedForRemoval = Array.from(selectAll('#browsing_data_form input[type=\'checkbox\']:checked'))
    .map(item => item.value);
  const selectedDateSince = select('#clean_since input').value;
  if (checkedForRemoval.length === 0) {
    return alert({
      title: 'Please select at least one data type',
      position: 'top-end',
      icon: 'error',
      toast: true,
      timer: 10000,
      showConfirmButton: false,
    })
  }
  return removeBrowsingData(checkedForRemoval, selectedDateSince);
}
const removeBrowsingData = (dataTypes, since) => {
  const dateSince = since ? new Date(since).getTime() : null;
  chrome.browsingData.remove({
    "since": dateSince
  }, {
    "appcache": dataTypes.appcache,
    "cache": dataTypes.cache,
    "cacheStorage": dataTypes.cacheStorage,
    "cookies": dataTypes.cookies,
    "downloads": dataTypes.downloads,
    "fileSystems": dataTypes.fileSystems,
    "formData": dataTypes.formData,
    "history": dataTypes.history,
    "indexedDB": dataTypes.indexedDB,
    "localStorage": dataTypes.localStorage,
    "pluginData": dataTypes.pluginData,
    "passwords": dataTypes.passwords,
    "serviceWorkers": dataTypes.serviceWorkers,
    "webSQL": dataTypes.webSQL
  }, () => {
    let typesRemovedText = '';
    dataTypes.forEach(type => typesRemovedText += `<li>${type}</li>`);
    alert({
      title: 'Cleanup Report',
      html: '<p style="text-align:left">The following data was removed</p>' +
      `<ul style="text-align:left">${typesRemovedText}</ul>`,
      footer: since ? `Only data accumulated since ${since} was removed` : null,
      position: 'top-end',
      timer: 10000,
      icon: 'success',
      toast: true,
      showConfirmButton: false,
    })
  })
}
const scheduleReloadCookieTable = () => {
  if (!reload_scheduled) {
    reload_scheduled = true;
    setTimeout(reloadCookieTable, 250);
  }
}
const reloadCookieTable = (sortBy) => {
  reload_scheduled = false;
  let filter = select('#cookie_filter').value;
  let domains = cache.getDomains(filter, sortBy);
  generateCookieTableSummary(domains);
  resetCookieTable();
  domains.forEach(domain => { generateCookieRow(domain)});
}
const removeAllCookiesWithFilter = () => {
  let filter = select('#cookie_filter').value;
  const domains = cache.getDomains(filter);
  domains.forEach(domain => removeCookiesForDomain(domain));
  let domainsRemovedList = '';
  domains.forEach(domain => domainsRemovedList += `<li>${domain}</li>`);
  alert({
    title: 'Cleanup Report',
    html: '<p style="text-align:left">Cookies have been removed from the following domains</p>' +
    `<ul style="text-align:left">${domainsRemovedList}</ul>`,
    position: 'top-end',
    icon: 'success',
    toast: true,
    timer: 10000,
    showConfirmButton: false,
  })
}
const removeCookie = cookie => {
  const url = 'http' + (cookie.secure ? 's' : '') + '://' + cookie.domain +
            cookie.path;
  chrome.cookies.remove({ 'url': url, 'name': cookie.name });
}
const removeCookiesForDomain = domain => {
  cache.getCookies(domain).forEach(cookie => {
    removeCookie(cookie);
  });
}
const cookiesChangeListener = changeInfo => {
  cache.remove(changeInfo.cookie);
  if (!changeInfo.removed) {
    cache.add(changeInfo.cookie);
  }
  scheduleReloadCookieTable();
}

/**/
/* Element creation & DOM updating */
/**/
const generateBrowsingDataOptions = dataRemovalTypes => {
  const inputForm = select('#browsing_data_form');
  dataRemovalTypes.forEach(removalType => {
    const inputLabel = document.createElement('label');
    inputLabel.setAttribute('class', 'inputLabel');
    inputLabel.setAttribute('data-tippy-content', removalType.hint) 
    const span = document.createElement('span');
    span.innerText = removalType.name;
    const input = document.createElement('input');
    input.setAttribute('class', 'select-bulk-item');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('name', removalType.type);
    input.setAttribute('value', removalType.type);
    input.innerText = removalType.name;
    inputLabel.appendChild(input);
    inputLabel.appendChild(span);
    inputForm.appendChild(inputLabel);
  });
  const selectAllLabel = select('#select-all');
  selectAllLabel.onclick = () => {
    const selectAllInput = selectAllLabel.firstElementChild;
    const opts = Array.from(selectAll('.select-bulk-item'));
    if (selectAllInput.checked === true) {
      return opts.forEach(opt => opt.checked = true);
    } else {
      return opts.forEach(opt => opt.checked = false);
    }
  }
  return select('#clean-all-btn').onclick = handleSubmitCleanup;
}
const generateCookieTableSummary = (domains) => {
  select('#filter_count').innerText = domains.length;
  select('#total_count').innerText = cache.getDomains().length;
  select('#delete_all_button').innerHTML = '';
  if (domains.length) {
    let button = document.createElement('button');
    button.onclick = removeAllCookiesWithFilter;
    button.innerText = 'Remove all ' + domains.length;
    select('#delete_all_button').appendChild(button);
  }
}
const generateCookieRow = domain => {
  let cookies = cache.getCookies(domain);
  let table = select('#cookies');
  let row = table.insertRow(-1);
  row.insertCell(-1).innerText = domain;
  let cell = row.insertCell(-1);
  cell.innerText = cookies.length;
  cell.setAttribute('class', 'cookie_count');
  let button = document.createElement('button');
  button.innerText = 'Remove';
  button.onclick = () => {
    removeCookiesForDomain(domain);
    alert({
      title: 'Cleanup complete!',
      html: '<p style="text-align:left">Cookies have been removed from the following domain</p>' +
      `<ul style="text-align:left">${domain}</ul>`,
      position: 'top-end',
      icon: 'success',
      toast: true,
      timer: 6000,
      showConfirmButton: false,
    })
  }
  let _cell = row.insertCell(-1);
  _cell.appendChild(button);
  _cell.setAttribute('class', 'button');
}
const resetCookieTable = () => {
  let table = select('#cookies');
  while (table.rows.length > 1) {
    table.deleteRow(table.rows.length - 1);
  }
}
