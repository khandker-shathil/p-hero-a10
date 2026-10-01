import test from 'node:test'
import assert from 'node:assert/strict'
import { lessonPrintDocument } from '../lib/lesson-pdf.js'

test('lesson export includes full text and escapes user content', () => {
  const story = 'First paragraph.\n\n' + 'A long reflection. '.repeat(3000) + '<script>alert(1)</script>'
  const html = lessonPrintDocument({title:'<img src=x onerror=alert(1)>',description:story,author:{name:'A & B'},createdAt:'invalid',category:'Growth',emotionalTone:'Gratitude',visibility:'public',accessLevel:'free'})
  assert.ok(html.includes('A &amp; B'))
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'))
  assert.ok(!html.includes('<script>'))
  assert.ok(!html.includes('<img'))
  assert.ok(html.includes('A long reflection. '.repeat(3000)))
  assert.ok(!html.includes('Invalid Date'))
  assert.ok(html.includes('white-space: pre-wrap'))
})
