import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import CheckoutForm from "../../common/cart/CheckoutFormWrapper";
import user from "../../../stores/user";
import { withStyles } from "@material-ui/core";
import Bigneon from "../../../helpers/bigneon";
import notifications from "../../../stores/notifications";
import Loader from "../../elements/loaders/Loader";
import { sendReactNativeMessage, MESSAGE_TYPES } from "../../../helpers/reactNative";

const styles = theme => ({
	root: { padding: theme.spacing.unit }
});

@observer
class MobileStripeAuth extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isReady: false
		};
	}

	componentWillMount() {
		let {
			match: {
				params: { access_token, refresh_token }
			}
		} = this.props;

		// Set the access and refresh tokens based on the URL parameters
		access_token = decodeURIComponent(access_token);
		refresh_token = decodeURIComponent(refresh_token);

		// Refresh/authorize the user
		Bigneon()
			.auth.refresh({ refresh_token })
			.then(response => {
				this.setState({ isReady: true });
			})
			.catch(error => {
				console.error(error);
				sendReactNativeMessage(
					{
						error:
							"User could not be authenticated. " +
							JSON.stringify(error.response)
					},
					MESSAGE_TYPES.STRIPE
				);
			});
	}

	onToken = (stripeToken, onError) => {
		const { id, type } = stripeToken;
		const data = stripeToken[type];
		// If we receive a credit card Token, pass credit card info back to the WebView
		try {
			if (type === "card") {
				sendReactNativeMessage(
					{
						id: id,
						type: type,
						last4: data.last4,
						brand: data.brand,
						card_id: data.id,
						exp_month: data.exp_month,
						exp_year: data.exp_year,
						name: data.name
					},
					MESSAGE_TYPES.STRIPE
				);
			}
		}catch(e) {
			onError();
		}

	};

	onMobileError = (message, _type) => {
		// If we receive a Stripe error, return it
		sendReactNativeMessage({ error: message }, MESSAGE_TYPES.STRIPE);
	};

	render() {
		const { classes } = this.props;
		const { isReady } = this.state;
		if (!isReady) {
			return <Loader/>;
		}

		return (
			<div className={classes.root}>
				<CheckoutForm
					mobile
					onToken={this.onToken}
					onMobileError={this.onMobileError}
				/>
			</div>
		);
	}
}

export default withStyles(styles)(MobileStripeAuth);
