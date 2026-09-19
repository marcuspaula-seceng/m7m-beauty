// Offline DOM regression checks. Test dependency: jsdom@26.1.0.
// npm install --no-save --package-lock=false jsdom@26.1.0
// node --test tests/chat-widget.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const source = fs.readFileSync(path.join(__dirname, '..', 'chat-widget.js'), 'utf8');

function fixture(reply) {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    runScripts: 'outside-only', url: 'https://example.test/'
  });
  Object.defineProperty(dom.window.document, 'readyState', { value: 'complete' });
  dom.window.setTimeout = callback => { callback(); return 0; };
  dom.window.fetch = async () => ({ json: async () => ({ reply }) });
  const configured = reply === undefined ? source :
    source.replace('N8N_WEBHOOK: ""', 'N8N_WEBHOOK: "https://example.test/mock"');
  dom.window.eval(configured);
  return dom;
}

function submit(dom, value) {
  const document = dom.window.document;
  document.querySelector('#lschatInput').value = value;
  document.querySelector('#lschatForm').dispatchEvent(new dom.window.Event('submit', {
    bubbles: true, cancelable: true
  }));
}

test('visitor markup is displayed literally, without creating HTML elements', () => {
  const dom = fixture();
  try {
    const payload = '<img src=x onerror="window.injected=true"><script>window.injected=true</script>';
    submit(dom, payload);
    const message = dom.window.document.querySelector('.lschat-msg.me');
    assert.equal(message.textContent, payload);
    assert.equal(message.children.length, 0);
    assert.equal(dom.window.injected, undefined);
  } finally { dom.window.close(); }
});

test('external webhook markup is also displayed as text', async () => {
  const payload = '<svg onload="window.injected=true"><a href="javascript:alert(1)">link</a></svg>';
  const dom = fixture(payload);
  try {
    submit(dom, 'Test question');
    await new Promise(resolve => setImmediate(resolve));
    const message = dom.window.document.querySelector('.lschat-msg.bot');
    assert.equal(message.textContent, payload);
    assert.equal(message.children.length, 0);
    assert.equal(dom.window.injected, undefined);
  } finally { dom.window.close(); }
});

test('the static welcome keeps its bold shop name', () => {
  const dom = fixture();
  try {
    dom.window.document.querySelector('.lschat-btn').click();
    const welcome = dom.window.document.querySelector('.lschat-msg.bot');
    assert.equal(welcome.querySelector('b').textContent, 'M7M Beauty');
    assert.ok(welcome.textContent.includes('Oi! 💛 Sou o atendimento da M7M Beauty.'));
    assert.equal(welcome.textContent.includes('<b>'), false);
  } finally { dom.window.close(); }
});

test('the local FAQ still returns its delivery answer', () => {
  const dom = fixture();
  try {
    submit(dom, 'frete');
    const reply = dom.window.document.querySelector('.lschat-msg.bot');
    assert.ok(reply.textContent.includes('Enviamos para todo o Brasil'));
  } finally { dom.window.close(); }
});
