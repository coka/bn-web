package test;

import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import model.Event;
import model.User;
import model.Venue;
import pages.components.admin.events.EventSummaryComponent;
import test.facade.AdminEventStepsFacade;
import test.facade.LoginStepsFacade;
import test.facade.OrganizationStepsFacade;
import utils.DataConstants;
import utils.MsgConstants;

public class EditEventInformationStepsIT extends BaseSteps {

	@Test(dataProvider = "edit_event_data", priority = 12, retryAnalyzer = utils.RetryAnalizer.class)
	public void editEvent(User superuser, Event event) throws Exception {
		LoginStepsFacade loginStepsFacade = new LoginStepsFacade(driver);
		maximizeWindow();
		OrganizationStepsFacade organizationFacade = new OrganizationStepsFacade(driver);
		AdminEventStepsFacade adminEventFacade = new AdminEventStepsFacade(driver);

		loginStepsFacade.givenAdminUserIsLogedIn(superuser);
		organizationFacade.givenOrganizationExist(event.getOrganization());

		adminEventFacade.givenUserIsOnAdminEventsPage();
		EventSummaryComponent eventComp = adminEventFacade.givenEventWithNameAndPredicateExists(event, comp -> !comp.isEventCanceled());

		eventComp.clickOnEditEvent(event);
		event.setEventName("Updated" + event.getEventName());
		adminEventFacade.whenUserUpdatesDataOfEvent(event);
		adminEventFacade.whenUserClicksOnUpdateEvent();

		boolean isNotificationDisplayed = adminEventFacade.thenMessageNotificationShouldAppear(MsgConstants.EVENT_PUBLISHED);
		adminEventFacade.givenUserIsOnAdminEventsPage();
		boolean isMatchedDate = adminEventFacade.thenUpdatedEventShoudExist(event);

		Assert.assertTrue(isNotificationDisplayed && isMatchedDate);
		loginStepsFacade.logOut();

	}

	@DataProvider(name = "edit_event_data")
	public static Object[][] editEventData() {
		User superuser = User.generateUserFromJson(DataConstants.SUPERUSER_DATA_KEY);
		Event event = Event.generateEventFromJson(DataConstants.EVENT_DATA_STANARD_KEY, "TestUNameEvent", false, 1, 5);
		Venue venue = Venue.generateVenueFromJson(DataConstants.VENUE_CST);
		event.setVenue(venue);
		return new Object[][] { { superuser, event } };
	}
}
