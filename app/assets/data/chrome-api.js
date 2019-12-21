// Config options for chrome.browsingData.remove()
// see: https://developer.chrome.com/extensions/browsingData
const dataRemovalTypes = [
  { type: 'history', name: 'Browsing History', hint: 'Your history of websites visited with Chrome.' },
  { type: 'cache', name: 'HTTP Cache', hint: 'Stores pairs of Request and Response objects in order for future requests for that data to be served faster. This let\'s your browser \"remember\" parts of web pages, like images, to help them open faster during your next visit. Cache items do not expire unless deleted.' },
  { type: 'appcache', name: 'App Cache', hint: '[Deprecated] Websites using Application cache are intended to load and work correctly even if users click the refresh button when they are offline. It is no longer maintained.' },
  { type: 'cacheStorage', name: 'Cache Storage', hint: 'CacheStorage represents the storage of Cache objects by mapping names (strings) to their corresponding Cache objects. It enables a Service Worker to cache network responses so that they can provide offline capabilities when a user is disconnected from the network.'},
  { type: 'cookies', name: 'Cookies', hint: 'Cookies are files created by websites you visit. They make your online experience easier by saving browsing information. With cookies, sites can keep you signed in, remember your site preferences, and give you locally relevant content.' },
  { type: 'downloads', name: 'Download History', hint: 'Your history of downloaded files.' },
  { type: 'fileSystems', name: 'File Systems', hint: 'Let\'s websites create, read, navigate, and write to a sandboxed section of your local file system.' },
  { type: 'formData', name: 'Autofill Form Data', hint: 'Let\'s Chrome fill out forms automatically with saved info, like your addresses or payment info.' },
  { type: 'indexedDB', name: 'IndexedDB', hint: 'IndexedDB is a low-level API for browser storage of significant amounts of structured data, including files/blobs. It uses indexes to enable high performance searches of this data.' },
  { type: 'localStorage', name: 'Local Storage', hint: 'Local storage data is per domain (it\'s available to all scripts from the domain that originally stored the data) and persists after the browser is closed.' },
  { type: 'passwords', name: 'Passwords', hint: 'A storage of passwords for different websites you have visited.' },
  { type: 'pluginData', name: 'Plugin Data', hint: 'Plugins\' data, i.e Adobe Flash Player' },
  { type: 'serviceWorkers', name: 'Service Workers', hint: 'Service workers are javascript files that run in the background and enable web sites to work offline using Cached data.' },
  { type: 'webSQL', name: 'WebSQL Data', hint: 'WebSQL is an API for storing data in databases which can then be queried using a variant of SQL.' },
];