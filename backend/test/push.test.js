const test = require('node:test');
const assert = require('node:assert/strict');
const { buildMessagePayload } = require('../services/pushService');

test('buildMessagePayload groups notifications per sender and links to the conversation', () => {
  const payload = buildMessagePayload('11111111-1111-4111-8111-111111111111', 'Awa', 'Salut !', 3);
  assert.equal(payload.title, 'Nouveau message de Awa');
  assert.equal(payload.body, 'Salut !');
  assert.equal(payload.url, '/messages/11111111-1111-4111-8111-111111111111');
  assert.equal(payload.tag, 'message-11111111-1111-4111-8111-111111111111');
  assert.equal(payload.unread, 3);
});

test('buildMessagePayload collapses whitespace, truncates the preview and ignores an unknown unread count', () => {
  const payload = buildMessagePayload('s', 'Koffi', `  a\n\n b ${'x'.repeat(300)}`, undefined);
  assert.ok(payload.body.startsWith('a b x'));
  assert.equal(payload.body.length, 140);
  assert.equal(payload.unread, undefined);
  assert.equal(buildMessagePayload('s', 'K', 'm', 0).unread, undefined);
});
