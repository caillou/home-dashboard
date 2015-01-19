do ->

  getTimetables = (vbzData) =>
    todayString = moment().format('YYYY-MM-DD')
    isSunday = !!vbzData.sundays.filter((possibleSunday) =>
      return false
    ).length
    debugger

  $.getJSON 'data/vbz.json', (vbzData) =>

    timetables = getTimetables(vbzData)
