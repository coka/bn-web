package test.facade;

import java.net.URISyntaxException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Predicate;

import org.openqa.selenium.WebDriver;
import org.testng.Assert;
import org.testng.asserts.SoftAssert;

import model.Event;
import pages.admin.events.AdminEventsPage;
import pages.admin.events.EventPage;
import pages.components.admin.AdminSideBar;
import pages.components.admin.events.EventSummaryComponent;
import pages.components.dialogs.DeleteEventDialog;
import utils.MsgConstants;
import utils.ProjectUtils;
import utils.SeleniumUtils;

public class AdminEventStepsFacade extends BaseFacadeSteps {

	private EventPage eventPage;
	private AdminEventsPage adminEvents;
	private AdminSideBar adminSideBar;

	private Map<String, Object> dataMap;

	public AdminEventStepsFacade(WebDriver driver) {
		super(driver);
		this.eventPage = new EventPage(driver);
		this.adminEvents = new AdminEventsPage(driver);
		this.adminSideBar = new AdminSideBar(driver);
		this.dataMap = new HashMap<>();
	}

	public void givenUserIsOnAdminEventsPage() {
		adminSideBar.clickOnEvents();
		adminEvents.isAtPage();
	}

	public EventSummaryComponent givenEventExistAndIsNotCanceled(Event event) throws URISyntaxException {
		return givenEventWithNameAndPredicateExists(event, comp -> !comp.isEventCanceled());
	}

	public EventSummaryComponent findEventWithName(Event event) {
		return adminEvents.findEventByName(event.getEventName());
	}

	public EventSummaryComponent findEventWithNameAndPredicate(Event event,
			Predicate<EventSummaryComponent> predicate) {
		EventSummaryComponent selectedEvent = adminEvents.findEvent(event.getEventName(), predicate);
		return selectedEvent;
	}

	public EventSummaryComponent findEventIsOpenedAndHasSoldItem(Event event) {
		EventSummaryComponent selectedEvent = adminEvents.findEvent(event.getEventName(),
				comp -> comp.isEventPublished() && comp.isEventOnSale() && comp.isSoldToAmountGreaterThan(0));
		return selectedEvent;
	}

	public EventSummaryComponent givenAnyEventWithPredicateExists(Event event,
			Predicate<EventSummaryComponent> predicate) throws URISyntaxException {
		EventSummaryComponent selectedEvent = adminEvents.findEvent(predicate);
		if (selectedEvent == null) {
			createNewRandomEvent(event);
			selectedEvent = adminEvents.findEvent(predicate);
		}
		return selectedEvent;
	}

	public EventSummaryComponent givenEventWithNameAndPredicateExists(Event event,
			Predicate<EventSummaryComponent> predicate) throws URISyntaxException {
		return givenEventWithNameAndPredicateExists(event, predicate, true);
	}

	public EventSummaryComponent givenEventWithNameAndPredicateExists(Event event,
			Predicate<EventSummaryComponent> predicate, boolean randomizeName) throws URISyntaxException {
		EventSummaryComponent selectedEvent = adminEvents.findEvent(event.getEventName(), predicate);
		if (selectedEvent == null) {
			createNewEvent(event, randomizeName);
			selectedEvent = adminEvents.findEvent(event.getEventName(), predicate);
		}
		return selectedEvent;
	}

	private Event createNewRandomEvent(Event event) throws URISyntaxException {
		return createNewEvent(event, true);
	}

	private Event createNewEvent(Event event, boolean randomizeName) throws URISyntaxException {
		if (randomizeName) {
			event.setEventName(event.getEventName() + ProjectUtils.generateRandomInt(10000000));
		}
		boolean retVal = createEvent(event);

		Assert.assertTrue(retVal,
				"Event with name: " + event.getEventName() + " does not exist and could not be created");
		String path = SeleniumUtils.getUrlPath(driver);
		retVal = retVal && path.contains("edit");
		Assert.assertTrue(retVal);
		adminSideBar.clickOnEvents();
		adminEvents.isAtPage();
		driver.navigate().refresh();
		return event;
	}

	public void whenUserGoesToEventDashboard(Event event) {
		givenUserIsOnAdminEventsPage();
		EventSummaryComponent eventSummary = findEventWithNameAndPredicate(event, comp -> !comp.isEventCanceled());
		eventSummary.clickOnEvent();
	}

	public boolean whenUserDeletesEvent(Event event) {
		EventSummaryComponent component = adminEvents.findEventByName(event.getEventName());
		DeleteEventDialog deleteDialog = component.deleteEvent(event);
		if (adminEvents.isNotificationDisplayedWithMessage(MsgConstants.EVENT_DELETION_FAILED, 4)) {
			deleteDialog.clickOnKeepEvent();
			return false;
		}
		return true;
	}

	public void whenUserUpdatesDataOfEvent(Event event) {
		eventPage.enterEventName(event.getEventName());
		eventPage.selectVenue(event.getVenue().getName());
		eventPage.enterDatesAndTimes(event.getStartDate(), event.getEndDate(), null, null, null);
		eventPage.waitForTime(1000);
	}

	public EventPage getEventPage(){
		return this.eventPage;
	}

	public void whenUserClicksOnUpdateEvent() {
		eventPage.clickOnUpdateButton();
	}

	public boolean whenUserEntesDataAndClicksOnSaveDraft(Event event) {
		adminEvents.clickCreateEvent();
		eventPage.isAtCreatePage();
		createEventFillData(event);
		eventPage.clickOnSaveDraft();
		boolean retVal = eventPage.checkSaveDraftMessage();
		return retVal;
	}

	public void whenUserClicksOnViewEventOfSelecteEvent(Event event) {
		EventSummaryComponent eventComp = findEventWithName(event);
		eventComp.viewEvent();
	}

	public boolean thenEventShouldBeCanceled(Event event) {
		EventSummaryComponent componentEvent = adminEvents.findEventByName(event.getEventName());
		if (componentEvent != null) {
			return componentEvent.isEventCanceled();
		} else {
			return false;
		}
	}

	public boolean thenUpdatedEventShoudExist(Event event) {
		EventSummaryComponent component = this.adminEvents.findEventByName(event.getEventName());
		if (component != null) {
			return component.checkIfDatesMatch(event.getStartDate());
		} else {
			return false;
		}
	}

	public boolean thenUserIsAtEditPage() {
		return eventPage.isAtEditPage();
	}

	public boolean thenUserIsAtEventsPage() {
		return adminEvents.isAtPage();
	}

	public void whenUserRefreshesThePage() {
		driver.navigate().refresh();
		adminEvents.waitForTime(3000);
	}

	public boolean thenMessageNotificationShouldAppear(String msg) {
		return eventPage.isNotificationDisplayedWithMessage(msg);
	}

	public boolean thenEventShouldBeDrafted(Event event) {
		EventSummaryComponent component = adminEvents.findEventByName(event.getEventName());
		return component.isEventDrafted();
	}

	public boolean createEvent(Event event) {
		adminEvents.clickCreateEvent();
		eventPage.isAtCreatePage();
		createEventFillData(event);
		eventPage.clickOnSave();
		boolean retVal = eventPage.checkMessage();
		adminEvents.waitForTime(10000);
		return retVal;
	}

	private void createEventFillData(Event event) {
		eventPage.enterArtistName(event.getArtistName());
		eventPage.enterEventName(event.getEventName());
		eventPage.selectVenue(event.getVenue().getName());
		eventPage.enterDatesAndTimes(event.getStartDate(), event.getEndDate(), event.getStartTime(),
				event.getEndTime(), event.getDoorTime());
		eventPage.addTicketTypes(event.getTicketTypes());
	}

	public void whenUserExecutesMoveDatesToPastSteps(boolean isTestValid, SoftAssert sa, int minusStartDateDays, int minusEndDateDays) {
		if (minusEndDateDays > minusStartDateDays) {
			throw new IllegalArgumentException("start date must be before or same as end date");
		}
		LocalDate startDate = eventPage.getStartDateValue();
		LocalDate endDate = eventPage.getEndDateValue();
		LocalDate currentDate = LocalDate.now();
		startDate = currentDate.minusDays(minusStartDateDays);
		endDate = currentDate.minusDays(minusEndDateDays);
		eventPage.enterDates(startDate, endDate);
		eventPage.clickOnUpdateButton();
		if (!isTestValid) {
			boolean retVal = eventPage.isNotificationDisplayedWithMessage(MsgConstants.INVALID_EVENT_DETAILS);
			if (!retVal) {
				retVal = eventPage.isNotificationDisplayedWithMessage(MsgConstants.EVENT_WITH_SALES_CANT_MOVE_TO_PAST_DATE);
			}
			sa.assertTrue(retVal, MsgConstants.INVALID_EVENT_DETAILS + " message notification not displayed");
		} else {
			boolean retVal = eventPage.isNotificationDisplayedWithMessage(MsgConstants.EVENT_PUBLISHED);
			sa.assertTrue(retVal, MsgConstants.EVENT_PUBLISHED + " message not displayed");
		}
	}

	public void attemptEventCancel(Event event) {
		try {
			givenUserIsOnAdminEventsPage();
			EventSummaryComponent component = findEventWithName(event);
			component.cancelEvent();
		}catch (Exception e) {
		}
	}

	protected void setData(String key, Object value) {
		dataMap.put(key, value);
	}

	protected Object getData(String key) {
		return dataMap.get(key);
	}
}
