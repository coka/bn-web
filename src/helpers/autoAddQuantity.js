const AUTO_SELECT_TICKET_AMOUNT = 2;

export default (index, ticketTypes) => {
	//Check if this ticket type is the only available one. If user has more than one option don't auto select.
	let otherAvailableTickets = false;
	ticketTypes.forEach((tt, ttIndex) => {
		if (ttIndex !== index && tt.status === "Published") {
			otherAvailableTickets = true;
		}
	});

	if (otherAvailableTickets) {
		return 0;
	}

	const { increment, limit_per_person, available, status } = ticketTypes[index];

	//Check that the status of the ticket we
	if (status !== "Published") {
		return 0;
	}

	let quantity = AUTO_SELECT_TICKET_AMOUNT;

	//If the default auto select amount is NOT divisible by the increment amount, rather auto select the first increment
	if (AUTO_SELECT_TICKET_AMOUNT % increment != 0) {
		quantity = increment;
	}

	//If limit_per_person is set don't allow auto selecting more than the user is allowed to buy
	if (limit_per_person && quantity > limit_per_person) {
		quantity = limit_per_person;
	}

	//Will first display `Sold out` for this rule anyways.
	if (available < increment) {
		quantity = 0;
	}

	return quantity;
};