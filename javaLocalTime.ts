import * as moment from 'moment-timezone';

export function localTimeString( date?: Date | number): string {
  if (!date) {
    date = new Date();
  }
  if (typeof date === 'number') {
    date = new Date(date);
  }
  return moment(date).tz('America/Chicago').format('YYYY-MM-DDTHH:mm:ss.SSS');
}