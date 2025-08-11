export function DateTime(props) {
	const tzDate = props.date?.includes('Z') ? props.date : props.date + '+00:00';
	const date = new Date(tzDate);
	const time = props.time ?? true;
	const options = { dateStyle: 'short', timeStyle: time ? 'short' : undefined };

	if (isNaN(date)) return 'Неверная дата';

	return new Intl.DateTimeFormat('ru-RU', options).format(date);
}
