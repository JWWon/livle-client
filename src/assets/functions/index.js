import moment from 'moment';

export function getTime(data) {
  const time = moment(data);
  return {
    timestamp: time,
    minutes: time.minutes(),
    hours: time.hours(),
    date: time.date(),
  };
}

export function convertTimeToString(time) {
  hour = getTime(time).hours.toString();
  minute = getTime(time).minutes.toString();

  convertHour = hour.length > 1 ? hour : '0' + hour;
  convertMinute = minute.length > 1 ? minute : '0' + minute;
  return `${convertHour} : ${convertMinute}`;
}
