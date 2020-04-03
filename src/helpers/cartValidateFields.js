import selectedEvent from "../stores/selectedEvent";

export default (submitAttempted, ticketSelection) => {
	//Don't validate every field if the user has not tried to submit at least once
	if (!submitAttempted) {
		return true;
	}

	const { ticket_types } = selectedEvent;

	const errors = {};

	Object.keys(ticketSelection).forEach(ticketTypeId => {
		const selectedTicketCount = ticketSelection[ticketTypeId];
		if (selectedTicketCount && selectedTicketCount.quantity > 0) {
			//Validate the user is buying in the correct increments
			const ticketType = ticket_types.find(({ id }) => {
				return id === ticketTypeId;
			});

			const increment = ticketType ? ticketType.increment : 1;

			if (selectedTicketCount.quantity % increment !== 0) {
				errors[ticketTypeId] = `Please order in increments of ${increment}`;
			}
		}
	});

	if (Object.keys(errors).length > 0) {
		return false;
	}

	return true;
};