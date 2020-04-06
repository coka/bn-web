import getAllUrlParams from "./getAllUrlParams";

export const MESSAGE_TYPES = {
	STRIPE: "stripe",
	NAVIGATION: "navigation"
};

export const isReactNative = () => {
	return !!window.ReactNativeWebView;
};

/**
 * Use the new system. The webviews in the app will now pass the ?rnNavigation=1 query parameter on all requests
 * That way we know it is a new version of the app and we can send the new messaging format
 */
export const useNewMessaging = () => {
	const { rnNavigation } = getAllUrlParams();
	return (localStorage.getItem("rnNavigation") || rnNavigation);
};

/**
 * Sends a string message, will format into the correct structure
 * @param json
 * @param messageType MESSAGE_TYPES
 */
export const sendReactNativeMessage = (json, messageType) => {
	if (!MESSAGE_TYPES.hasOwnProperty(messageType)) {
		console.error("Invalid type", messageType, "use one of", Object.keys(MESSAGE_TYPES));
		return;
	}
	if (!isReactNative()) {
		console.warn("Not in embedded environment, please check `isReactNative()` first");
		return;
	}

	let jsonString;
	if (useNewMessaging()) {
		jsonString = JSON.stringify({
			type: messageType,
			json
		});
	} else {
		jsonString = JSON.stringify(json);
	}
	try {
		return window.ReactNativeWebView.postMessage(jsonString);
	} catch (e) {
		window.postMessage(jsonString, "*");
		console.error(e);
	}
};

export const bindReactNativeMessageBridge = (callback) => {
	if (!isReactNative()) {
		return;
	}
	window.addEventListener("message", callback, false);
};
