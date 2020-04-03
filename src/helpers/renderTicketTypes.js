import selectedEvent from "../stores/selectedEvent";
import Loader from "../components/elements/loaders/Loader";
import React from "react";
import TicketSelection from "../components/pages/events/TicketSelection";

export default (ticketSelection, errors, component) => {
	const { event, ticket_types } = selectedEvent;
	if (!ticket_types) {
		return <Loader>Loading tickets...</Loader>;
	}

	const eventIsCancelled = !!(event && event.cancelled_at);

	const ticketTypeRendered = ticket_types
		.map(ticketType => {
			const {
				id,
				name,
				ticket_pricing,
				increment,
				limit_per_person,
				start_date,
				end_date,
				redemption_code,
				available,
				description,
				discount_as_percentage,
				status
			} = ticketType;

			let price_in_cents;
			let ticketsAvailable = false;
			let discount_in_cents = 0;
			if (ticket_pricing) {
				price_in_cents = ticket_pricing.price_in_cents;
				ticketsAvailable = available > 0;
				discount_in_cents = ticket_pricing.discount_in_cents || 0;
			} else {
				//description = "(Tickets currently unavailable)";
			}

			//0 is returned for limit_per_person when there is no limit
			const limitPerPerson =
				limit_per_person > 0
					? Math.min(available, limit_per_person)
					: available;

			this.submitAttempted = true;
			
			return (
				<TicketSelection
					key={id}
					name={name}
					description={description}
					ticketsAvailable={ticketsAvailable}
					price_in_cents={price_in_cents}
					error={errors[id]}
					amount={ticketSelection[id] ? ticketSelection[id].quantity : 0}
					increment={increment}
					limitPerPerson={limitPerPerson}
					available={available}
					discount_in_cents={discount_in_cents}
					discount_as_percentage={discount_as_percentage}
					redemption_code={redemption_code}
					onNumberChange={amount =>
						this.setState(({ ticketSelection }) => {
							ticketSelection[id] = {
								quantity: Number(amount) < 0 ? 0 : amount,
								redemption_code
							};
							return {
								ticketSelection
							};
						})
					}
					submitAttempted={this.submitAttempted}
					ticketSelection={ticketSelection}
					status={status}
					eventIsCancelled={eventIsCancelled}
				/>
			);
		})
		.filter(item => !!item);

	if (!ticketTypeRendered.length) {
		return null;
	}
	return ticketTypeRendered;
};