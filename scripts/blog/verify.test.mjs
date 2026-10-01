import { test } from 'vitest';
import '../generate-blog.mjs';
import '../generate-gallery.mjs';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { ARTICLES } from '../blog-content.mjs';
import { reviewArticles } from './editorial.mjs';
const read=p=>readFileSync(p,'utf8');
const runtime=read('public/assets/blog/editorial.js');
function page(path){return new JSDOM(read(path),{url:'https://www.vasia.dev/blog/',runScripts:'outside-only'});}
test('search and category filters combine, with a truthful empty state',()=>{
 const dom=page('public/blog/index.html'),w=dom.window;w.eval(runtime);
 const visible=()=>[...w.document.querySelectorAll('[data-card]')].filter(x=>!x.hidden);
 assert.equal(visible().length,13);
 w.document.querySelector('[data-filter=ai]').click();assert.equal(visible().length,3);
 const input=w.document.querySelector('input');input.value='וואטסאפ';input.dispatchEvent(new w.Event('input'));assert.equal(visible().length,1);
 input.value='missing123';input.dispatchEvent(new w.Event('input'));assert.equal(visible().length,0);assert.equal(w.document.querySelector('#empty-results').hidden,false);
 input.value='';input.dispatchEvent(new w.Event('input'));w.document.querySelector('[data-filter=all]').click();assert.equal(visible().length,13);dom.window.close();
});
test('every translated guide has resolvable citations, local images and sections',()=>{
 for(const l of ['he','en','ar'])for(const a of reviewArticles(ARTICLES)){
  const base=l==='he'?'public':`public/${l}`,dom=page(`${base}/blog/${a.slug}/index.html`),d=dom.window.document;
  assert.equal(d.querySelectorAll('h1').length,1);
  assert.ok(d.querySelectorAll('.cite').length>0);
  for(const link of d.querySelectorAll('a[href^="#"]'))assert.ok(d.querySelector(link.getAttribute('href')),link.href);
  for(const img of d.querySelectorAll('img[src^="/"]'))assert.ok(existsSync('public'+img.getAttribute('src')));
  assert.equal(d.documentElement.dir,l==='en'?'ltr':'rtl');dom.window.close();
 }
});
test('reading tools change text size and preserve native checklist state',()=>{
 const dom=page('public/en/blog/itzuv-atarim-3d/index.html'),w=dom.window;w.eval(runtime);
 w.document.querySelector('#text-size').click();assert.ok(w.document.querySelector('#article-body').classList.contains('large-text'));
 w.document.querySelector('input[type=checkbox]').click();assert.equal(w.document.querySelector('input[type=checkbox]').checked,true);dom.window.close();
});
test('tracking honours consent and sends no contact/query text; one event per click',()=>{
 const dom=new JSDOM('<div id="root"></div><a href="https://wa.me/972534260632?text=PRIVATE">Contact</a>',{url:'https://www.vasia.dev/?email=PRIVATE',runScripts:'outside-only'}),w=dom.window;
 const sent=[];w.va=(...args)=>sent.push(args);w.eval(read('public/assets/site-engagement.js'));
 const click=()=>w.document.querySelector('a').dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
 // Prevent navigation while preserving the delegated capture listener.
 w.document.querySelector('a').addEventListener('click',e=>e.preventDefault());
 click();assert.equal(sent.length,0);
 w.localStorage.setItem('cookie-consent',JSON.stringify({analytics:true}));w.dispatchEvent(new w.Event('vasia:consent'));click();
 assert.equal(sent.filter(e=>e[0]==='event').length,1);assert.equal(sent.find(e=>e[0]==='event')[1].name,'contact_intent');assert.ok(!JSON.stringify(sent).includes('PRIVATE'));
 const before=sent.find(e=>e[0]==='beforeSend')[1];assert.equal(before({url:w.location.href}).url,'https://www.vasia.dev/');
 w.localStorage.setItem('cookie-consent',JSON.stringify({analytics:false}));click();assert.equal(sent.filter(e=>e[0]==='event').length,1);assert.equal(before({url:w.location.href}),null);dom.window.close();
});
