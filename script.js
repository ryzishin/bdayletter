/* ============================================================
   A LITTLE BIRTHDAY LETTER — interactions
   1. open the envelope -> play the opening sequence -> show letter
   2. reveal paragraphs and photos gently while scrolling
   3. "read again" returns to the initial screen
   4. play background music on open (subtle, no UI)
   ============================================================ */
(function () {
  'use strict';

  var hero = document.getElementById('hero');
  var envelope = document.getElementById('envelope');
  var letterView = document.getElementById('letter-view');
  var letterTitle = document.getElementById('letter-title');
  var readAgain = document.getElementById('read-again');
  
  // Grab the audio element
  var bgMusic = document.getElementById('bg-music');
  
  // Set a subtle volume (0.0 to 1.0) so it's not annoying
  if (bgMusic) {
    bgMusic.volume = 0.1; 
  }

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

    // Play the background music
    if (bgMusic) {
      bgMusic.play().catch(function(error) {
        // Silently catch if browser blocks it (e.g., strict autoplay policies)
        console.log("Audio play failed:", error); 
      });
    }

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

    // Pause and rewind the music when starting over
    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }

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
