import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import Creatable from "react-select/lib/Creatable";

import { withStyles } from "@material-ui/core/styles";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import FormatInputLabel from "../../elements/form/FormatInputLabel";

const styles = theme => {
	return {
		formControl: {
			width: "100%",
			marginTop: theme.spacing.unit
		},
		input: {
			display: "flex",
			padding: 0
		},
		valueContainer: {
			display: "flex",
			flexWrap: "wrap",
			flex: 1,
			alignItems: "center"
		},
		noOptionsMessage: {
			padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`
		},
		placeholder: {
			position: "absolute",
			left: 2,
			fontSize: theme.overrides.MuiInput.root.fontSize
		},
		labelContainer: {
			marginBottom: theme.spacing.unit
		}
	};
};

function NoOptionsMessage(props) {
	return (
		<Typography
			color="textSecondary"
			className={props.selectProps.classes.noOptionsMessage}
			{...props.innerProps}
		>
			{props.children}
		</Typography>
	);
}

function inputComponent({ inputRef, ...props }) {
	return <div ref={inputRef} {...props}/>;
}

function Control(props) {
	return (
		<TextField
			fullWidth
			InputProps={{
				inputComponent,
				inputProps: {
					className: props.selectProps.classes.input,
					inputRef: props.innerRef,
					children: props.children,
					...props.innerProps
				}
			}}
			{...props.selectProps.textFieldProps}
		/>
	);
}

function Option(props) {
	return (
		<MenuItem
			buttonRef={props.innerRef}
			selected={props.isFocused}
			component="div"
			style={{
				fontWeight: props.isSelected ? 500 : 400
			}}
			{...props.innerProps}
		>
			{props.children}
		</MenuItem>
	);
}

function Placeholder(props) {
	return (
		<Typography
			color="textSecondary"
			className={props.selectProps.classes.placeholder}
			{...props.innerProps}
		>
			{props.children}
		</Typography>
	);
}

function ValueContainer(props) {
	return (
		<div className={props.selectProps.classes.valueContainer}>
			{props.children}
		</div>
	);
}

class AutoCompleteGroup extends React.Component {
	constructor(props) {
		super(props);

		// this.state = {
		// 	value: ""
		// };
	}

	//TODO test and uncomment when needed
	// static getDerivedStateFromProps(props, state) {
	// 	const { value } = props;
	// 	if (value) {
	// 		return { value };
	// 	}
	// 	return null;
	// }

	// handleChange = value => {
	// 	this.setState({
	// 		value
	// 	});
	// };

	render() {
		const {
			classes,
			theme,
			value,
			items,
			error,
			name,
			onCreateOption,
			onInputChange,
			formatCreateLabel,
			label,
			placeholder,
			onChange,
			onBlur,
			onFocus,
			style,
			renderSelectOption,
			renderValueContainer
		} = this.props;

		const selectStyles = {
			input: base => ({
				...base,
				color: theme.palette.text.primary
			})
		};

		const suggestions = Object.keys(items).map(key => ({
			value: key,
			label: items[key]
		}));

		//If they pass through the function to create a new entry then it needs to be a different component
		const SelectComponent = onCreateOption ? Creatable : Select;

		const components = {
			Option: renderSelectOption || Option,
			Control,
			NoOptionsMessage,
			Placeholder,
			ValueContainer: renderValueContainer || ValueContainer
		};

		return (
			<div>
				<FormControl
					className={classes.formControl}
					error={!!error}
					aria-describedby={`%${name}-error-text`}
					style={style}
				>
					{label ? (
						<span className={classes.labelContainer}>
							<FormatInputLabel>{label}</FormatInputLabel>
						</span>
					) : null}
					<SelectComponent
						classes={classes}
						styles={selectStyles}
						options={suggestions}
						components={components}
						value={value}
						onChange={chosen => {
							if (chosen) {
								const { value, label } = chosen;
								onChange(value, label);
							} else {
								onChange(null, null);
							}
						}}
						onCreateOption={onCreateOption}
						isClearable
						formatCreateLabel={formatCreateLabel}
						placeholder={placeholder}
						onBlur={onBlur}
						onFocus={onFocus}
						onInputChange={onInputChange}
					/>
					<FormHelperText id={`${name}-error-text`}>{error}</FormHelperText>
				</FormControl>
			</div>
		);
	}
}

AutoCompleteGroup.propTypes = {
	items: PropTypes.object.isRequired,
	error: PropTypes.string,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	onCreateOption: PropTypes.func,
	formatCreateLabel: PropTypes.func,
	name: PropTypes.string.isRequired,
	label: PropTypes.string,
	placeholder: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	onBlur: PropTypes.func,
	onFocus: PropTypes.func,
	style: PropTypes.object,
	onInputChange: PropTypes.func,
	renderSelectOption: PropTypes.func,
	renderValueContainer: PropTypes.func
};

export default withStyles(styles, { withTheme: true })(AutoCompleteGroup);
