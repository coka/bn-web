package test.event.overview;

import java.net.URISyntaxException;
import java.util.function.Predicate;

import enums.EventStatus;
import model.Venue;
import org.apache.commons.lang3.SerializationUtils;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

import model.Event;
import model.User;
import pages.admin.events.EventPage;
import pages.components.admin.events.EventSummaryComponent;
import test.BaseSteps;
import test.facade.FacadeProvider;
import utils.DataConstants;
import utils.ProjectUtils;

public class EventOverviewStepsIT extends BaseSteps {

	private static final String EVENT_NAME = "TestOverviewEventName";
	private static Integer DATE_OFFSET = 1;
	private static Integer DATE_RANGE = 0;
	private Event fieldEvent;

	@Test(dataProvider = "event_overview_data_provider", priority = 102)
	public void eventOverviewCompareData(Event event, User admin) throws URISyntaxException {
		maximizeWindow();
		FacadeProvider fp = new FacadeProvider(driver);
		SoftAssert sa = new SoftAssert();
		if (this.fieldEvent == null) {
			this.fieldEvent = event;
		}
		loginAndNavigateToOverviewPage(fp, this.fieldEvent, admin);
		fp.getEventOverviewFacade().whenUserComparesInfoOnOverviewWithGivenEvent(this.fieldEvent, sa);
		sa.assertAll();
	}

	@Test(dataProvider = "event_overview_data_provider", priority = 104)
	public void overviewPageShouldUpdateImmediatelyAfterEventIsUpdated(Event event, User admin) throws URISyntaxException {
		maximizeWindow();
		FacadeProvider fp = new FacadeProvider(driver);
		SoftAssert sa = new SoftAssert();
		if (this.fieldEvent == null) {
			this.fieldEvent = event;
		}
		loginAndNavigateToOverviewPage(fp, this.fieldEvent, admin);
		Event overviewEventData = fp.getEventOverviewFacade().whenUserRemembersEventInfoFromOverviewPage();
		fp.getEventOverviewFacade().whenUserSelectsEditEvent();
		Event editedEvent = SerializationUtils.clone(this.fieldEvent);
		editedEvent.setDoorTime("5");
		editedEvent.setComparableDoorTime(editedEvent.calculateComparableDoorTime(ProjectUtils.TIME_FORMAT_FULL, editedEvent.getDoorTime()));
		editedEvent.setVenue(Venue.generateVenueFromJson(DataConstants.VENUE_CST));
		EventPage eventPage = fp.getAdminEventStepsFacade().getEventPage();
		eventPage.selectVenue(editedEvent.getVenue().getName());
		eventPage.selectDoorTime(editedEvent.getDoorTime());
		eventPage.clickOnUpdateButton();
		findEventAndGoToOverviewPage(fp, editedEvent,null);
		fp.getEventOverviewFacade().whenUserComparesInfoOnOverviewWithGivenEvent(editedEvent, sa);
		sa.assertAll();

		fp.getAdminEventStepsFacade().givenUserIsOnAdminEventsPage();
		EventSummaryComponent eventSummaryComponent = fp.getAdminEventStepsFacade().findEventWithName(editedEvent);
		eventSummaryComponent.deleteEvent(editedEvent);
	}

	@Test(dataProvider = "event_overview_data_provider" , priority = 106)
	public void overviewPageShouldReflectStatusOnAfterChange(Event event, User user) {
		maximizeWindow();
		FacadeProvider fp = new FacadeProvider(driver);
		SoftAssert sa = new SoftAssert();
		event.randomizeName();
		fp.getLoginFacade().givenAdminUserIsLogedIn(user);
		fp.getOrganizationFacade().givenOrganizationExist(event.getOrganization());
		fp.getAdminEventStepsFacade().thenUserIsAtEventsPage();
		fp.getAdminEventStepsFacade().whenUserEntesDataAndClicksOnSaveDraft(event);
		String fullEventName = findEventAndGoToOverviewPage(fp,event, card->card.isEventDrafted());
		fp.getEventOverviewFacade().thenEventStatusShouldBe(EventStatus.DRAFT, sa);
		sa.assertAll();
		fp.getEventOverviewFacade().whenUserSelectsEditEvent();
		fp.getAdminEventStepsFacade().thenUserIsAtEditPage();
		fp.getAdminEventStepsFacade().getEventPage().clickOnSave();
		event.setEventName(fullEventName);
		findEventAndGoToOverviewPage(fp, event, null);
		fp.getEventOverviewFacade().thenEventStatusShouldBe(EventStatus.PUBLISHED, sa);
		sa.assertAll();
		fp.getAdminEventStepsFacade().givenUserIsOnAdminEventsPage();
		EventSummaryComponent eventSummaryComponent = fp.getAdminEventStepsFacade().findEventWithName(event);
		eventSummaryComponent.deleteEvent(event);
	}

	private String findEventAndGoToOverviewPage(FacadeProvider fp, Event event, Predicate<EventSummaryComponent> predicate) {
		fp.getAdminEventStepsFacade().givenUserIsOnAdminEventsPage();
		EventSummaryComponent eventCard;
		if (predicate != null) {
			eventCard = fp.getAdminEventStepsFacade().findEventWithNameAndPredicate(event, predicate);
		} else {
			eventCard = fp.getAdminEventStepsFacade().findEventWithName(event);
		}
		String fullEventName = eventCard.getEventName();
		eventCard.clickOnEventOverview();
		fp.getEventOverviewFacade().setEventOverviewPage(fullEventName);
		return fullEventName;
	}


	@Test(dataProvider = "event_overview_data_provider", priority = 100, retryAnalyzer = utils.RetryAnalizer.class)
	public void prepareDataFixture(Event event, User user) {
		FacadeProvider fp = new FacadeProvider(driver);
		maximizeWindow();
		fp.getLoginFacade().givenUserIsLogedIn(user);
		fp.getOrganizationFacade().givenOrganizationExist(event.getOrganization());
		fp.getAdminEventStepsFacade().createEvent(event);
	}

	private void loginAndNavigateToOverviewPage(FacadeProvider fp, Event event, User user) throws URISyntaxException {
		fp.getLoginFacade().givenAdminUserIsLogedIn(user);
		fp.getOrganizationFacade().givenOrganizationExist(event.getOrganization());
		String eventFullName = findEventAndGoToOverviewPage(fp,event, card-> !card.isEventCanceled());
		Assert.assertTrue(fp.getEventOverviewFacade().thenUserIsAtOverviewPage(), "User is not at event overview page for event: " +eventFullName);
	}

	@DataProvider(name = "event_overview_data_provider")
	public static Object[][] dataProvider(){
		Event event = Event.generateEventFromJson(DataConstants.EVENT_DATA_WITH_ADDITIONAL_STEPS_KEY, EVENT_NAME, false, DATE_OFFSET , DATE_RANGE);

		User user = User.generateUserFromJson(DataConstants.ORGANIZATION_ADMIN_USER_KEY);
		return new Object[][] {{event, user}};
	}

}
