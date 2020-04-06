import React, { Component } from "react";
import { withStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import selectedEvent from "../../../stores/selectedEvent";
import Loader from "../../elements/loaders/Loader";
import TicketSelection from "./TicketSelection";
import cart from "../../../stores/cart";

class TicketTypes extends Component {
	constructor(props) {
		super(props);
		const { ticketSelection } = this.props;
		this.state = {
			ticketSelection: ticketSelection
		};
	}

	render() {
		const { event, ticket_types } = selectedEvent;
		const { ticketSelection, errors, checkOut, replaceCart, ticketItemList } = this.props;
		const { cartSummary } = cart;
		let selectedTicketType;
		let ticketTypes;

		if (!ticket_types) {
			return <Loader>Loading tickets...</Loader>;
		}

		const eventIsCancelled = !!(event && event.cancelled_at);

		checkOut && ticketItemList ? ticketTypes = ticketItemList : ticketTypes = ticket_types;

		const ticketTypeRendered = ticketTypes
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
					status,
					item_type,
					pricePerTicketInCents,
					quantity,
					ticketTypeId
				} = ticketType;

				if (checkOut) {
					if (!cart.cartExpired && ticket_types && checkOut) {
						selectedTicketType = ticket_types.find(o => o.id === ticketTypeId);
					}
				}

				if (selectedTicketType) {
					const {
						name,
						ticket_pricing,
						increment,
						limit_per_person,
						start_date,
						end_date,
						redemption_code,
						available,
						discount_as_percentage,
						status
					} = selectedTicketType;
				}

				let price_in_cents;
				let ticketsAvailable = false;
				let discount_in_cents = 0;
				if (ticket_pricing) {
					price_in_cents = ticket_pricing.price_in_cents;
					ticketsAvailable = available > 0;
					discount_in_cents = ticket_pricing.discount_in_cents || 0;
				} else {
					price_in_cents = pricePerTicketInCents;
				}

				//0 is returned for limit_per_person when there is no limit
				const limitPerPerson =
					limit_per_person > 0
						? Math.min(available, limit_per_person)
						: available;

				this.submitAttempted = true;

				if(checkOut) {
					return (
						<TicketSelection
							key={id}
							name={name}
							description={description}
							ticketsAvailable={ticketsAvailable}
							price_in_cents={price_in_cents}
							amount={
								ticketSelection ? ticketSelection[ticketTypeId].quantity : 0
							}
							subTotal={`$ ${((pricePerTicketInCents / 100) * quantity).toFixed(
								2
							)}`}
							increment={selectedTicketType && selectedTicketType.increment}
							limitPerPerson={limitPerPerson}
							available={selectedTicketType && selectedTicketType.available}
							discount_in_cents={discount_in_cents}
							discount_as_percentage={discount_as_percentage}
							redemption_code={redemption_code}
							onNumberChange={amount => {
								this.setState(
									({ ticketSelection }) => {
										ticketSelection[ticketTypeId] = {
											quantity: Number(amount) < 0 ? 0 : amount,
											redemption_code
										};
										return {
											ticketSelection
										};
									},
									() => {
										replaceCart();
									}
								);
							}}
							status={status}
							eventIsCancelled={eventIsCancelled}
							checkOut={checkOut}
						/>
					);
				} else  {
					return (
						<TicketSelection
							key={id}
							name={name}
							description={description}
							ticketsAvailable={ticketsAvailable}
							price_in_cents={price_in_cents}
							amount={ticketSelection[id] ? ticketSelection[id].quantity : 0}
							subTotal={`$ ${((pricePerTicketInCents / 100) * quantity).toFixed(
								2
							)}`}
							increment={increment}
							limitPerPerson={limitPerPerson}
							available={available}
							discount_in_cents={discount_in_cents}
							discount_as_percentage={discount_as_percentage}
							redemption_code={redemption_code}
							onNumberChange={amount =>
								this.setState(
									({ ticketSelection }) => {
										ticketSelection[id] = {
											quantity: Number(amount) < 0 ? 0 : amount,
											redemption_code
										};
										return {
											ticketSelection
										};
									},
									() => {
										checkOut && replaceCart();
									}
								)
							}
							submitAttempted={this.submitAttempted}
							ticketSelection={ticketSelection}
							status={status}
							eventIsCancelled={eventIsCancelled}
							checkOut={checkOut}
						/>
					);
				}
			})
			.filter(item => !!item);

		if (!ticketTypeRendered.length) {
			return null;
		}
		return ticketTypeRendered;
	}
}

TicketTypes.propTypes = {
	ticketSelection: PropTypes.object,
	ticketItemList: PropTypes.array,
	errors: PropTypes.object,
	checkOut: PropTypes.bool,
	replaceCart: PropTypes.func
};

const styles = theme => ({});

export default withStyles(styles)(TicketTypes);
