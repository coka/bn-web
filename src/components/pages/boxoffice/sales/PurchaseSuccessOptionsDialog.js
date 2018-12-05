import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import Bigneon from "../../../../helpers/bigneon";
import notification from "../../../../stores/notifications";
import Dialog from "../../../elements/Dialog";
import { fontFamilyDemiBold, secondaryHex } from "../../../styles/theme";
import { validPhone } from "../../../../validators";
import Button from "../../../elements/Button";
import notifications from "../../../../stores/notifications";
import InputWithButton from "../../../common/form/InputWithButton";

const styles = theme => ({
	content: {
		maxWidth: 400,
		alignContent: "center",
		textAlign: "center",
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2
	},
	orderNumber: {
		fontFamily: fontFamilyDemiBold,
		marginBottom: theme.spacing.unit * 3
	},
	subText: {
		marginBottom: theme.spacing.unit * 3
	},
	smsLabel: {
		fontFamily: fontFamilyDemiBold,
		textTransform: "uppercase",
		textAlign: "left",
		fontSize: theme.typography.fontSize * 0.9,
		marginBottom: 2
	}
});

class PurchaseSuccessOptionsDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = { isSendingSMS: false, isCheckingIn: false };
	}

	onSendSMS(number) {
		if (!validPhone(number)) {
			return notifications.show({
				message: "Invalid cellphone number.",
				variant: "warning"
			});
		}

		this.setState({ isSendingSMS: true });
	}

	async redeemSingleTicket({ id, redeem_key, event_id }) {
		return new Promise(function(resolve, reject) {
			Bigneon()
				.events.tickets.redeem({
					event_id,
					ticket_id: id,
					redeem_key
				})
				.then(response => {
					resolve({ result: response });
				})
				.catch(error => {
					reject({ error });
				});
		});
	}

	async redeemTickets(tickets) {
		for (let index = 0; index < tickets.length; index++) {
			const ticket = tickets[index];

			const { error } = await this.redeemSingleTicket(ticket);

			if (error) {
				return { error };
			}
		}

		return { result: true };
	}

	async getTickets(order_id) {
		return new Promise(function(resolve, reject) {
			Bigneon()
				.orders.tickets.index({ order_id })
				.then(response => {
					resolve({ result: response.data });
				})
				.catch(error => {
					reject({ error });
				});
		});
	}

	async onCheckIn() {
		const { currentOrderDetails } = this.props;
		const { id } = currentOrderDetails;

		this.setState({ isCheckingIn: true });

		const { result, error } = await this.getTickets(id);

		if (error) {
			notifications.showFromErrorResponse({
				error,
				defaultMessage: "Retrieving tickets failed."
			});
		}

		const response = await this.redeemTickets(result);

		if (response.error) {
			notifications.showFromErrorResponse({
				error: response.error,
				defaultMessage: "Redeeming tickets failed."
			});
		}

		this.setState({ isCheckingIn: false });

		const { onCheckInSuccess } = this.props;
		onCheckInSuccess();
	}

	render() {
		const { currentOrderDetails, onClose, classes } = this.props;
		const { isSendingSMS, isCheckingIn } = this.state;

		const iconUrl = "/icons/tickets-white.svg";
		let orderNumber = "";
		let email = "";
		let orderId = "";

		if (currentOrderDetails) {
			const { id } = currentOrderDetails;

			orderNumber = id.slice(-8);
			orderId = id;
			email = currentOrderDetails.email;
		}

		const buttonStyle = { width: "100%", marginBottom: 20 };

		return (
			<Dialog
				open={!!currentOrderDetails}
				//onClose={onClose}
				title="Order complete"
				iconUrl={iconUrl}
			>
				<div className={classes.content}>
					<Typography className={classes.orderNumber}>
						Order #{orderNumber}
					</Typography>

					<Typography className={classes.subText}>
						We've sent your receipt to: {email}
					</Typography>

					<Typography className={classes.smsLabel}>
						Send ticket via SMS
					</Typography>
					<InputWithButton
						style={buttonStyle}
						iconUrl={"/icons/cellphone-gray.svg"}
						name={"cellNumber"}
						placeholder="Enter cellphone number"
						buttonText={isSendingSMS ? "Sending..." : "Send"}
						onSubmit={this.onSendSMS.bind(this)}
						disabled={isSendingSMS}
					/>

					<Button
						size="large"
						style={buttonStyle}
						onClick={this.onCheckIn.bind(this)}
						disabled={isCheckingIn}
					>
						{isCheckingIn ? "Checking in..." : "Check-in Guest"}
					</Button>
					<a href={`/orders/${orderId}`} target="_blank">
						<Button size="large" style={buttonStyle}>
							View order
						</Button>
					</a>

					<Button size="large" style={buttonStyle} onClick={onClose}>
						Return to Box Office
					</Button>
				</div>
			</Dialog>
		);
	}
}

PurchaseSuccessOptionsDialog.propTypes = {
	currentOrderDetails: PropTypes.object,
	classes: PropTypes.object.isRequired,
	onClose: PropTypes.func.isRequired,
	onCheckInSuccess: PropTypes.func.isRequired
};

export default withStyles(styles)(PurchaseSuccessOptionsDialog);
