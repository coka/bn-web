//Enable: Geolocation API, Maps JavaScript API, Places API for Web, Geocoding API
import React from "react";
import PropTypes from "prop-types";
import { Typography, withStyles, Collapse } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import PlacesAutocomplete, {
	geocodeByAddress,
	getLatLng
} from "react-places-autocomplete";
import AddressBlock from "../../common/form/AddressBlock";
import { primaryHex } from "../../../config/theme";
import Button from "../../elements/Button";
import Loader from "../../elements/loaders/Loader";
import loadGoogleMaps from "../../../helpers/loadGoogleMaps";
import FormatInputLabel from "../../elements/form/FormatInputLabel";

const styles = theme => {
	return {
		formControl: {
			width: "100%"
		},
		labelContainer: {
			marginBottom: theme.spacing.unit
		}
	};
};

class LocationInputGroup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showGoogle: !!process.env.REACT_APP_GOOGLE_PLACES_API_KEY,
			overrideManualEntry: false,
			scriptLoaded: false
		};
	}

	componentDidMount() {
		loadGoogleMaps();

		this.updateAPIScriptLoaded();
		this.checkForLoadedScriptTimeout = setTimeout(
			this.updateAPIScriptLoaded.bind(this),
			500
		);
	}

	componentWillUnmount() {
		this.stopCheckingAPIScriptLoaded();
	}

	stopCheckingAPIScriptLoaded() {
		if (this.checkForLoadedScriptTimeout) {
			clearTimeout(this.checkForLoadedScriptTimeout);
		}
	}

	updateAPIScriptLoaded() {
		if (window.google) {
			this.setState({ scriptLoaded: true });
			this.stopCheckingAPIScriptLoaded();
		}
	}

	onSelect(address, addressBlock) {
		const {
			onAddressChange,
			onLatLngResult,
			onFullResult,
			onError
		} = this.props;

		const { showGoogle } = this.state;

		const usingGoogleMaps = showGoogle;
		const geocodeByAddressPromise = usingGoogleMaps
			? geocodeByAddress
			: address =>
				new Promise((resolve, reject) => {
					resolve(addressBlock);
				});

		onAddressChange(address);
		geocodeByAddressPromise(address)
			.then(results => {
				onFullResult(results[0]);
				return getLatLng(results[0]);
			})
			.then(latLng => {
				onLatLngResult(latLng);
			})
			.catch(error => onError(error));
	}

	renderMissingGoogle() {
		const { addressBlock, errors = {} } = this.props;
		return (
			<div>
				<AddressBlock
					errors={errors}
					address={addressBlock}
					onChange={this.onSelect.bind(this)}
					returnGoogleObject={true}
				/>
			</div>
		);
	}

	renderGoogle() {
		const {
			address,
			placeholder,
			onAddressChange,
			error,
			onError,
			label,
			classes
		} = this.props;
		const { showGoogle, scriptLoaded } = this.state;

		if (!scriptLoaded || !showGoogle) {
			return;
		}

		return (
			<div>
				<PlacesAutocomplete
					style={{ flex: 1 }}
					value={address}
					onChange={onAddressChange}
					onSelect={this.onSelect.bind(this)}
					onError={e => {
						if (e !== "ZERO_RESULTS") {
							onError(e);
							this.setState({ showGoogle: false, overrideManualEntry: true });
						}
					}}
				>
					{({
						getInputProps,
						suggestions,
						getSuggestionItemProps,
						loading
					}) => (
						<div>
							<FormControl
								className={classes.formControl}
								aria-describedby={`location`}
								error
							>
								{label ? (
									<span className={classes.labelContainer}>
										<FormatInputLabel>{label}</FormatInputLabel>
									</span>
								) : null}
								<TextField
									{...getInputProps({
										placeholder:
											placeholder || "e.g. Tari Labs, Oakland, San Francisco",
										className: "location-search-input"
									})}
									error={!!error}
								/>
								<FormHelperText id={`${name}-error-text`}>
									{error}
								</FormHelperText>
							</FormControl>

							<div className="autocomplete-dropdown-container">
								{loading && (
									<div style={{ marginTop: 5, marginBottom: 5 }}>
										<Loader/>
									</div>
								)}
								{suggestions.map(suggestion => {
									const className = suggestion.active
										? "suggestion-item--active"
										: "suggestion-item";
									// inline style for demonstration purpose
									const style = suggestion.active
										? { backgroundColor: primaryHex, cursor: "pointer" }
										: { backgroundColor: "transparent", cursor: "pointer" };
									return (
										<div
											{...getSuggestionItemProps(suggestion, {
												className,
												style
											})}
										>
											<Typography variant="body1">
												{suggestion.description}
											</Typography>
										</div>
									);
								})}

								<div style={{ textAlign: "center" }}>
									<img
										style={{ width: "25%", maxWidth: 200, paddingTop: 5 }}
										src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3_hdpi.png"
									/>
								</div>
							</div>
						</div>
					)}
				</PlacesAutocomplete>
			</div>
		);
	}

	render() {
		const { overrideManualEntry } = this.state;
		const { showManualEntry } = this.props;
		return (
			<div>
				{this.renderGoogle()}
				{!showManualEntry || !overrideManualEntry ? (
					<div>
						<Button
							variant="additional"
							onClick={() => this.setState({ overrideManualEntry: true })}
						>
							Enter Address Manually
						</Button>
					</div>
				) : null}
				<Collapse in={overrideManualEntry || showManualEntry}>
					<div>{this.renderMissingGoogle()}</div>
				</Collapse>
			</div>
		);
	}
}

LocationInputGroup.propTypes = {
	label: PropTypes.string,
	error: PropTypes.string,
	errors: PropTypes.object,
	address: PropTypes.string.isRequired,
	addressBlock: PropTypes.object,
	placeholder: PropTypes.string,
	searchTypes: PropTypes.array,
	onError: PropTypes.func.isRequired,
	onAddressChange: PropTypes.func.isRequired,
	onLatLngResult: PropTypes.func.isRequired,
	onFullResult: PropTypes.func.isRequired,
	showManualEntry: PropTypes.bool
};

export default withStyles(styles)(LocationInputGroup);
