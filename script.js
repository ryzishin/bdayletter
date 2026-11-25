/* ============================================================
   A LITTLE BIRTHDAY LETTER — interactions
   1. open the envelope -> play the opening sequence -> show letter
   2. reveal paragraphs and photos gently while scrolling
   3. "read again" returns to the initial screen
   ============================================================ */
(function () {
  'use strict';

  var hero = document.getElementById('hero');
  var envelope = document.getElementById('envelope');
  var letterView = document.getElementById('letter-view');
  var letterTitle = document.getElementById('letter-title');
  var readAgain = document.getElementById('read-again');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var OPEN_MS = reduceMotion ? 220 : 1900;   // envelope animation length
  var FADE_MS = reduceMotion ? 60 : 470;     // crossfade length
  var busy = false;

  /* ---------- reveal paragraphs / photos while scrolling ---------- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealItems.forEach(function (el) { io.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('on'); });
  }

  /* ---------- open the letter ---------- */
  function openLetter() {
    if (busy) return;
    busy = true;
    envelope.setAttribute('aria-expanded', 'true');

    hero.classList.add('is-open'); // lifts envelope, opens flap, slides paper, hides arrow

    window.setTimeout(function () {
      hero.classList.add('is-fading');           // hero melts away
      letterView.hidden = false;                 // letter appears
      window.scrollTo(0, 0);
      requestAnimationFrame(function () {
        letterView.classList.add('shown');
      });
      window.setTimeout(function () {
        hero.hidden = true;
        busy = false;
        letterTitle.focus({ preventScroll: true }); // keyboard users land on the letter
      }, FADE_MS);
    }, OPEN_MS);
  }

  /* ---------- back to the beginning ---------- */
  function resetLetter() {
    if (busy) return;
    busy = true;

    letterView.classList.remove('shown');
    window.setTimeout(function () {
      letterView.hidden = true;
      hero.hidden = false;

      // snap the envelope back to its closed state without replaying transitions
      hero.classList.add('no-anim');
      hero.classList.remove('is-open', 'is-fading');
      envelope.setAttribute('aria-expanded', 'false');
      window.scrollTo(0, 0);

      void hero.offsetWidth; // force reflow so the reset sticks

      requestAnimationFrame(function () {
        hero.classList.remove('no-anim'); // greeting entrance may replay softly
        busy = false;
        envelope.focus({ preventScroll: true });
      });
    }, FADE_MS);
  }

  envelope.addEventListener('click', openLetter);
  readAgain.addEventListener('click', resetLetter);
})();
