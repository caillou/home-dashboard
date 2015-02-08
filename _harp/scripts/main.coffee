do ->

  # getTimetables = (vbzData) =>
  #   todayString = moment().format('YYYY-MM-DD')
  #   isSunday = !!vbzData.sundays.filter((possibleSunday) =>
  #     return false
  #   ).length

  getNextConnections = (vbzData) ->
    fiveHoursAgo = moment().subtract(5, 'hours')
    fiveHoursAgoAsAString = fiveHoursAgo.format('YYYY-MM-DD')

    isConsideredSunday = vbzData.sundays.reduce(
      (previousValue, currentValue) =>
        return true if previousValue

        return fiveHoursAgoAsAString is currentValue.date
      , false
    )

    dayIndex = if isConsideredSunday
      3
    else
      switch fiveHoursAgo.day()
        when 7 then 3
        when 6 then 2
        when 5 then 1
        else 0

    hourMinus5 = fiveHoursAgo.hour()
    minute = fiveHoursAgo.minute()

    vbzData.timetables.map (currentValue) =>

      leaving = currentValue.leaving[dayIndex].reduce(
        (previousValue, currentValue) =>

          if previousValue.length >= 3
            return previousValue

          currentlyItteratedHour = currentValue.hour
          currentlyItteratedHourMinus5 = (currentlyItteratedHour + 24 - 5) % 24;

          if currentlyItteratedHourMinus5 < hourMinus5
            return previousValue

          isCurrentlyItteratedHourTheCurrentHour = currentlyItteratedHourMinus5 is hourMinus5

          currentValue.minutes.reduce(
            (previousValue, currentlyItteratedMinute) =>
              if previousValue.length >= 3
                return previousValue

              if isCurrentlyItteratedHourTheCurrentHour and currentlyItteratedMinute < minute
                return previousValue

              previousValue.push(moment().hour(currentlyItteratedHour).minute(currentlyItteratedMinute))
              previousValue

            , previousValue
          )

        , []
      )
      $.extend {}, currentValue, {leaving}

  $.getJSON 'data/vbz.json', (vbzData) ->
    previousTime = ''
    loopFunction = () ->
      timetables = getNextConnections(vbzData)
      $body = $('body')

      $h1 = $('<h1>')

      now = moment().format 'HH:mm:ss'
      if now is previousTime
        window.requestAnimationFrame loopFunction
        return

      previousTime = now;
      $h1.text now
      $body.html($h1)
      timetables.forEach (timetable) =>
        $ul = $('<ul>');
        timetable.leaving.forEach (momentObject) =>
          $ul.append $('<li/>').text(momentObject.fromNow() + ', (' + momentObject.format('HH:mm') + ')')
        $('body').append(
          $('<h1/>').text(timetable.line),
          $ul
        )

      window.requestAnimationFrame loopFunction

    loopFunction()
