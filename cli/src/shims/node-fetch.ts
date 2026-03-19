// Shim: use native fetch instead of node-fetch to avoid deprecation warnings
// (punycode via tr46/whatwg-url, and url.parse)
export default fetch;
