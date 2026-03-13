window.HELP_IMPROVE_VIDEOJS = false;

// Palette matching mesh colors from ms_to_temos.py LONG_SEQUENCE_PALETTE
var STREAM_TIMELINE_PALETTE = [
  '#599df2', '#f27359', '#59cc8c', '#f2bf40',
  '#a673d9', '#40d9d9', '#f28ca6', '#8cb366'
];

// Palette for streaming critique text (segment-colored failure descriptions)
var STREAMING_CRITIQUE_PALETTE = [
  '#1e40af', '#dc2626', '#15803d', '#d97706',
  '#a673d9', '#40d9d9', '#f28ca6', '#8cb366'
];

function formatStreamingCritiques() {
  var palette = STREAMING_CRITIQUE_PALETTE;
  var defaultColor = '#d32f2f'; // fallback for text without segment

  $('.streaming-critique').each(function() {
    var $el = $(this);
    var raw = $el.text().trim().replace(/\s+/g, ' ');
    var parts = raw.split(/[,;]\s*/);
    var fragments = [];

    for (var i = 0; i < parts.length; i++) {
      var part = parts[i].trim();
      if (!part) continue;

      // Match "in segment N" or "segment N" (at end)
      var match = part.match(/^(.+?)\s+(?:in\s+)?segment\s+(\d+)\s*$/i);
      var text, color;
      if (match) {
        text = match[1].trim();
        var segIdx = parseInt(match[2], 10) - 1; // 1-based segment -> 0-based index
        color = (segIdx >= 0 && segIdx < palette.length) ? palette[segIdx] : defaultColor;
      } else {
        text = part;
        color = defaultColor;
      }
      fragments.push({ text: text, color: color });
    }

    if (fragments.length === 0) return;

    var html = fragments.map(function(f, i) {
      var span = '<span style="color:' + f.color + '">' + escapeHtml(f.text) + '</span>';
      return (i > 0 ? ' <span class="streaming-critique-bullet">•</span> ' : '') + span;
    }).join('');
    $el.html(html);
  });
}

function escapeHtml(s) {
  var div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function initStreamingTimelines() {
  var data = window.STREAM_TIMELINE_DATA;
  if (!data) return;

  $('.streaming-timeline').each(function() {
    var $timeline = $(this);
    var videoId = $timeline.attr('data-video-id');
    var seqData = data[videoId];
    if (!seqData || !seqData.segments || seqData.segments.length === 0) {
      $timeline.hide();
      return;
    }

    var segments = seqData.segments;
    var fps = seqData.fps || 30;
    var totalFrames = segments.length > 0 ? segments[segments.length - 1].end_frame : 0;
    if (totalFrames <= 0) {
      $timeline.hide();
      return;
    }

    var $track = $timeline.find('.timeline-track');
    $track.empty();
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      var w = ((seg.end_frame - seg.start_frame) / totalFrames) * 100;
      var color = STREAM_TIMELINE_PALETTE[i % STREAM_TIMELINE_PALETTE.length];
      $track.append($('<div class="timeline-segment"></div>')
        .css({ width: w + '%', backgroundColor: color })
        .attr('title', seg.prompt));
    }

    var $video = $timeline.siblings('video');
    var $playhead = $timeline.find('.timeline-playhead');
    var $label = $timeline.closest('.video-container').find('p').first();
    if (!$label.length) {
      $label = $timeline.closest('.streaming-video-column').find('.streaming-segment-prompt');
    }

    function updatePlayhead() {
      var t = $video[0].currentTime;
      var frame = t * fps;
      var pct = Math.min(100, Math.max(0, (frame / totalFrames) * 100));
      $playhead.css('left', pct + '%');

      var currentSeg = null;
      for (var j = 0; j < segments.length; j++) {
        if (frame >= segments[j].start_frame && frame < segments[j].end_frame) {
          currentSeg = segments[j];
          break;
        }
      }
      if (!currentSeg && segments.length > 0) {
        currentSeg = segments[segments.length - 1];
      }
      if (currentSeg && $label.length) {
        $label.text(currentSeg.prompt);
      }
    }

    $video.on('timeupdate', updatePlayhead);
    $video.on('loadedmetadata', updatePlayhead);
    updatePlayhead();
  });
}

function initAutoplayVideos() {
  var $videos = $('video');
  if (!$videos.length) return;

  function tryPlay(video) {
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function() {});
    }
  }

  $videos.each(function() {
    this.muted = true;
    this.loop = true;
    this.autoplay = true;
    this.playsInline = true;
    this.setAttribute('muted', '');
    this.setAttribute('autoplay', '');
    this.setAttribute('playsinline', '');
    this.setAttribute('preload', 'metadata');
  });

  if (!('IntersectionObserver' in window)) {
    $videos.each(function() {
      tryPlay(this);
    });
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      var video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
        tryPlay(video);
      } else {
        video.pause();
      }
    });
  }, {
    threshold: [0, 0.35, 0.75]
  });

  $videos.each(function() {
    observer.observe(this);
  });
}

function initCarousel($carousel, slideClass, dotClass, prevClass, nextClass, dotsClass) {
  if (!$carousel.length) return;

  var $slides = $carousel.find('.' + slideClass);
  var $dots = $carousel.find('.' + dotsClass);
  var total = $slides.length;
  var current = 0;

  function goTo(idx) {
    current = ((idx % total) + total) % total;
    $slides.removeClass('active').eq(current).addClass('active');
    $dots.find('.' + dotClass).removeClass('active').eq(current).addClass('active');
  }

  for (var i = 0; i < total; i++) {
    $dots.append($('<button class="' + dotClass + '" aria-label="Go to slide ' + (i + 1) + '"></button>'));
  }

  $carousel.find('.' + prevClass).on('click', function() { goTo(current - 1); });
  $carousel.find('.' + nextClass).on('click', function() { goTo(current + 1); });
  $dots.on('click', '.' + dotClass, function() {
    goTo($(this).index());
  });

  goTo(0);
}

function initT2MCarousel() {
  initCarousel($('.t2m-carousel'), 't2m-carousel-slide', 't2m-carousel-dot', 't2m-carousel-prev', 't2m-carousel-next', 't2m-carousel-dots');
}

function initStreamingCarousel() {
  initCarousel($('.streaming-carousel'), 'streaming-carousel-slide', 'streaming-carousel-dot', 'streaming-carousel-prev', 'streaming-carousel-next', 'streaming-carousel-dots');
}

function initAppEditingCarousel() {
  initCarousel($('.app-editing-carousel'), 'app-editing-carousel-slide', 'app-editing-carousel-dot', 'app-editing-carousel-prev', 'app-editing-carousel-next', 'app-editing-carousel-dots');
}

function initAppInbetweeningCarousel() {
  initCarousel($('.app-inbetweening-carousel'), 'app-inbetweening-carousel-slide', 'app-inbetweening-carousel-dot', 'app-inbetweening-carousel-prev', 'app-inbetweening-carousel-next', 'app-inbetweening-carousel-dots');
}

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
			slidesToScroll: 1,
			slidesToShow: 1,
			loop: true,
			infinite: true,
			autoplay: true,
			autoplaySpeed: 20000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
	
    bulmaSlider.attach();

    initStreamingTimelines();
    formatStreamingCritiques();
    initAutoplayVideos();
})
