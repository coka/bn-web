import { observable, action } from "mobx";
import Bigneon from "../helpers/bigneon";
import notifications from "./notifications";

class Announcement {
	@observable
	messages = [];

	@observable
	message = null;

	@action
	refreshAnnouncements() {
		Bigneon()
			.announcements.index()
			.then(response => {
				const { data } = response.data;
				this.messages = data;
			})
			.catch(error => {
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to load Announcements"
				});
			});
	}

	@action
	async getOrgAnnouncements() {
		try {
			const organization_id = localStorage.getItem("currentOrganizationId");
			const { data } = await Bigneon().organizations.announcements.index({
				organization_id
			});
			this.messages = [];
			data.forEach(orgMsg => {
				this.messages.push(orgMsg);
			});
		} catch (error) {
			if (error.status !== 404) {
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to load Announcements"
				});
			}
		}
	}
}

const announcement = new Announcement();

export default announcement;
