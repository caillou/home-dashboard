(function() {
  var getNextConnections;
  getNextConnections = function(vbzData) {
    var dayIndex, fiveHoursAgo, fiveHoursAgoAsAString, hourMinus5, isConsideredSunday, minute;
    fiveHoursAgo = moment().subtract(5, 'hours');
    fiveHoursAgoAsAString = fiveHoursAgo.format('YYYY-MM-DD');
    isConsideredSunday = vbzData.sundays.reduce((function(_this) {
      return function(previousValue, currentValue) {
        if (previousValue) {
          return true;
        }
        return fiveHoursAgoAsAString === currentValue.date;
      };
    })(this), false);
    dayIndex = (function() {
      if (isConsideredSunday) {
        return 3;
      } else {
        switch (fiveHoursAgo.day()) {
          case 7:
            return 3;
          case 6:
            return 2;
          case 5:
            return 1;
          default:
            return 0;
        }
      }
    })();
    hourMinus5 = fiveHoursAgo.hour();
    minute = fiveHoursAgo.minute();
    return vbzData.timetables.map((function(_this) {
      return function(currentValue) {
        var leaving;
        leaving = currentValue.leaving[dayIndex].reduce(function(previousValue, currentValue) {
          var currentlyItteratedHour, currentlyItteratedHourMinus5, isCurrentlyItteratedHourTheCurrentHour;
          if (previousValue.length >= 3) {
            return previousValue;
          }
          currentlyItteratedHour = currentValue.hour;
          currentlyItteratedHourMinus5 = (currentlyItteratedHour + 24 - 5) % 24;
          if (currentlyItteratedHourMinus5 < hourMinus5) {
            return previousValue;
          }
          isCurrentlyItteratedHourTheCurrentHour = currentlyItteratedHourMinus5 === hourMinus5;
          return currentValue.minutes.reduce(function(previousValue, currentlyItteratedMinute) {
            if (previousValue.length >= 3) {
              return previousValue;
            }
            if (isCurrentlyItteratedHourTheCurrentHour && currentlyItteratedMinute < minute) {
              return previousValue;
            }
            previousValue.push(moment().hour(currentlyItteratedHour).minute(currentlyItteratedMinute));
            return previousValue;
          }, previousValue);
        }, []);
        return $.extend({}, currentValue, {
          leaving: leaving
        });
      };
    })(this));
  };
  return $.getJSON('data/vbz.json', function(vbzData) {
    var loopFunction, previousTime;
    previousTime = '';
    loopFunction = function() {
      var $h1, $wrapper, now, timetables;
      now = moment().format('HH:mm:ss');
      if (now === previousTime) {
        window.requestAnimationFrame(loopFunction);
        return;
      }
      previousTime = now;
      timetables = getNextConnections(vbzData);
      $wrapper = $('<div class="wrapper"/>');
      $h1 = $('<h1 class="time">');
      $h1.text(now);
      $wrapper.append($h1);
      timetables.forEach((function(_this) {
        return function(timetable) {
          return timetable.leaving.forEach(function(momentObject) {
            var $media, $mediaBody, $mediaImage;
            $media = $('<div class="media media--tiny schedule"/>');
            $mediaImage = $('<div class="media__img schedule__line"/>').addClass("schedule__line--" + timetable.line).text(timetable.line);
            $mediaBody = $('<div class="media__body schedule__time"/>').text(momentObject.fromNow());
            $media.append($mediaImage, $mediaBody);
            return $wrapper.append($media);
          });
        };
      })(this));
      $('body').html($wrapper);
      return window.requestAnimationFrame(loopFunction);
    };
    return loopFunction();
  });
})();
