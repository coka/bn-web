import cart from "../stores/cart";
import user from "../stores/user";
import notifications from "../stores/notifications";
import analytics from "./analytics";
import getAllUrlParams from "./getAllUrlParams";
import cartValidateFields from "./cartValidateFields";
import selectedEvent from "../stores/selectedEvent";

export default (submitAttempted, ticketSelection, history, component) => {
	const { id, event } = selectedEvent;
	cart.setLatestEventId(id);

	submitAttempted = true;
	if (!cartValidateFields(submitAttempted, ticketSelection)) {
		console.warn("Validation errors: ");
		console.warn(this.state.errors);
		return false;
	}

	if (!user.isAuthenticated) {
		//Show dialog for the user to signup/login, try again on success
		user.showAuthRequiredDialog(this.onSubmit.bind(this));
		return;
	}

	let emptySelection = true;
	Object.keys(ticketSelection).forEach(ticketTypeId => {
		if (
			ticketSelection[ticketTypeId] &&
			ticketSelection[ticketTypeId].quantity > 0
		) {
			emptySelection = false;
		}
	});

	//If the existing cart is empty and they haven't selected anything
	if (cart.ticketCount === 0 && emptySelection) {
		return notifications.show({
			message: "Select tickets first."
		});
	}
	this.debounce = setTimeout(async () => {
		try {
			await cart.replace(
				ticketSelection,
				data => {
					if (!emptySelection) {
						const cartItems = [];
						for (let i = 0; i < data.items.length; i++) {
							if (data.items[i].item_type === "Tickets") {
								cartItems.push({
									eventId: event.id,
									name: event.name,
									category: event.event_type,
									organizationId: event.organization_id,
									ticketTypeName: data.items[i].description,
									price: data.items[i].unit_price_in_cents / 100,
									quantity: data.items[i].quantity
								});
							}
						}
						const total = data.total_in_cents / 100;
						analytics.initiateCheckout(
							event.id,
							getAllUrlParams(),
							"USD",
							cartItems,
							total
						);
						component === "selection" && history.push(`/tickets/${id}/tickets/confirmation${window.location.search}`);
					} else {
						//They had something in their cart, but they removed and updated
						return false;
					}
				},
				error => {
					const formattedError = notifications.showFromErrorResponse({
						error,
						defaultMessage: "Failed to add to cart.",
						variant: "error"
					});

					console.error(formattedError);

					return false;
				}
			);
		} catch (e) {
			console.error(e);
		}
	}, 500);
};