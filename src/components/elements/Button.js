//Base component https://material-ui.com/api/button/
import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import classNames from "classnames";
import servedImage from "../../helpers/imagePathHelper";

import {
	textColorPrimary,
	primaryHex,
	secondaryHex,
	warningHex,
	callToActionBackground,
	fontFamilyDemiBold
} from "../../config/theme";

const styles = theme => {
	return {
		root: {
			borderRadius: 8,
			borderStyle: "none",
			paddingLeft: 20,
			paddingRight: 20,
			paddingTop: 10,
			paddingBottom: 10,
			[theme.breakpoints.down("sm")]: {
				paddingLeft: 10,
				paddingRight: 10
			}
		},
		primary: {
			background: primaryHex,
			color: "#FFF"
		},
		secondary: {
			background: secondaryHex,
			color: "#FFF",
			borderRadius: 3,
			"&:hover": {
				background: secondaryHex,
				color: "#FFF"
			}
		},
		secondary8border: {
			background: secondaryHex,
			color: "#FFF",
			borderRadius: 8,
			"&:hover": {
				background: secondaryHex,
				opacity: 0.7,
				color: "#FFF"
			}
		},
		plainWhite: {
			boxSizing: " border-box",
			height: 42,
			width: 134,
			border: " 1px solid #979797",
			borderRadius: 3,
			padding: 10,
			[theme.breakpoints.down("md")]: {
				padding: 5
			}
		},
		default: {
			background: `linear-gradient(45deg, #FFF 10%, #FFF 90%)`,
			color: textColorPrimary,
			border: "solid 0.5px #979797"
		},
		callToAction: {
			background: callToActionBackground,
			color: "#FFF",
			boxShadow: "0 2px 7.5px 1px rgba(112, 124, 237, 0.47)",
			backgroundRepeat: "no-repeat"
		},
		whiteCTA: {
			background: "#FFFFFF",
			color: secondaryHex,
			boxShadow: "none",
			backgroundRepeat: "no-repeat",
			borderColor: "#FFFFFF"
		},
		pinkBorder: {
			background: "transparent",
			color: secondaryHex,
			boxShadow: "none",
			backgroundRepeat: "no-repeat",
			borderColor: secondaryHex,
			borderRadius: 3,
			fontSize: 18,
			boxSizing: "border-box",
			// height: 52,
			width: 268,
			border: "1px solid #FF22B2"
		},
		warning: {
			background: `linear-gradient(45deg, ${warningHex} 10%, ${warningHex} 90%)`,
			color: "#FFF",
			backgroundRepeat: "no-repeat"
		},
		additional: {
			height: 20,
			borderRadius: 20,
			backgroundColor: "rgba(112, 124, 237, 0.12)",
			boxShadow: "none"
		},
		disabled: {
			opacity: 0.35
		},
		addIcon: {
			position: "relative",
			top: -2,
			right: -10
		},
		text: {
			background: "transparent",
			boxShadow: "none"
		},
		label: {
			textTransform: "capitalize"
		},
		boldLabel: {
			textTransform: "capitalize",
			fontFamily: fontFamilyDemiBold
		},
		disabledLabel: {
			color: "#FFFFFF"
		},
		leftIcon: {
			marginRight: theme.spacing.unit,
			marginBottom: 2,
			width: 15,
			height: 15
		},
		small: {
			height: 30
		},
		medium: {
			paddingBottom: 6
		},
		mediumLarge: {
			height: 50
		},
		large: {
			height: 55
		}
	};
};

const CustomButton = props => {
	const {
		classes,
		children,
		variant,
		disabled,
		iconUrl,
		size,
		style,
		...rest
	} = props;

	const rootStyle = style || {};
	if (size === "small") {
		rootStyle.paddingTop = 8;
	} else if (size === "mediumLarge") {
		rootStyle.paddingTop = 14;
	}

	const useThinLabel =
		variant === "additional" ||
		variant === "text" ||
		variant === "default" ||
		variant === "plainWhite";

	return (
		<Button
			classes={{
				root: classNames({
					[classes.root]: true,
					[classes[variant || "default"]]: true,
					[classes.disabled]: disabled,
					[classes[size]]: true
				}),
				label: classNames({
					[classes.label]: useThinLabel,
					[classes.boldLabel]: !useThinLabel,
					[classes.disabledLabel]: disabled && !useThinLabel
				})
			}}
			disabled={disabled}
			style={rootStyle}
			{...rest}
		>
			{iconUrl ? (
				<img
					alt={children}
					className={classes.leftIcon}
					src={servedImage(iconUrl)}
				/>
			) : null}

			{children}
			{variant === "additional" ? (
				<img
					alt={children}
					className={classes.addIcon}
					src={servedImage("/icons/add-active.svg")}
				/>
			) : null}
		</Button>
	);
};
CustomButton.defaultProps = {
	size: "medium",
	variant: "default"
};

CustomButton.propTypes = {
	classes: PropTypes.object.isRequired,
	variant: PropTypes.oneOf([
		"primary",
		"secondary",
		"default",
		"callToAction",
		"warning",
		"text",
		"secondary8border",
		"additional",
		"plainWhite",
		"pinkBorder",
		"whiteCTA"
	]),
	size: PropTypes.oneOf(["small", "medium", "mediumLarge", "large"]),
	disabled: PropTypes.bool,
	children: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.element,
		PropTypes.array
	]).isRequired,
	iconUrl: PropTypes.string
};

export default withStyles(styles)(CustomButton);
