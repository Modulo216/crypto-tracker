const adjustForUTCOffset = date => {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  );
}

let dateMixin = {
  methods: {
    dateIsInRange(dateString, monthYear) {
      //let utcDate = adjustForUTCOffset(new Date(dateString))
      let utcDate = new Date(dateString)
      return monthYear.month === utcDate.getMonth() && monthYear.year === utcDate.getFullYear()
    }
  }
}

export default dateMixin