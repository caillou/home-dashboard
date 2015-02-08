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
      var $body, $h1, now, timetables;
      timetables = getNextConnections(vbzData);
      $body = $('body');
      $h1 = $('<h1>');
      now = moment().format('HH:mm:ss');
      if (now === previousTime) {
        window.requestAnimationFrame(loopFunction);
        return;
      }
      previousTime = now;
      $h1.text(now);
      $body.html($h1);
      timetables.forEach((function(_this) {
        return function(timetable) {
          var $ul;
          $ul = $('<ul>');
          timetable.leaving.forEach(function(momentObject) {
            return $ul.append($('<li/>').text(momentObject.fromNow() + ', (' + momentObject.format('HH:mm') + ')'));
          });
          return $('body').append($('<h1/>').text(timetable.line), $ul);
        };
      })(this));
      return window.requestAnimationFrame(loopFunction);
    };
    return loopFunction();
  });
})();
