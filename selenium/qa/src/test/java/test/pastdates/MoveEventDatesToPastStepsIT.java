package test.pastdates;

import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

import junit.framework.Assert;
import model.Event;
import model.Purchase;
import model.User;
import pages.components.admin.events.EventSummaryComponent;
import pages.components.dialogs.IssueRefundDialog.RefundReason;
import test.BaseSteps;
import test.facade.FacadeProvider;
import utils.DataConstants;

public class MoveEventDatesToPastStepsIT extends BaseSteps {

	private static final Integer PURCHASE_QUANTITY = 3;
	private static final String EVENT_NAME = "TestMoveDatesNameEvent";
	private static final Integer START_DAY_OFFSET = 2;
	private static final Integer DAYS_RANGE = 0;
	private Event event;

	@Test(dataProvider = "move_event_dates_to_past_data_create_date_fixture", priority = 80, retryAnalyzer = utils.RetryAnalizer.class)
	public void moveEventDatesToPastWhenNoPurchaseOrRefundIsDone(User orgAdmin, Event event) {
		maximizeWindow();
		FacadeProvider fp = new FacadeProvider(driver);
		SoftAssert sa = new SoftAssert();
		createEvent(fp, orgAdmin, event, false);
		findEventAndExecuteMoveDatesSteps(fp, event, sa, true, 2, 1);
		sa.assertAll();
		fp.getLoginFacade().logOut();
	}

	@Test(dataProvider = "move_event_dates_test_data", priority = 82,
			retryAnalyzer = utils.RetryAnalizer.class )
	public void movingEventDateToPastWhenThereIsItemsInShopingBasket(User customer, User orgAdmin, Purchase purchase) {
		maximizeWindow();
		FacadeProvider fp = new FacadeProvider(driver);
		SoftAssert sa = new SoftAssert();
		purchase.getEvent().randomizeName();
		createEvent(fp, orgAdmin, purchase.getEvent(), true);
		this.event = purchase.getEvent();
		fp.getEventFacade().givenUserIsOnHomePage();
		fp.getEventFacade().whenUserPlacesItemsInBasket(purchase, customer);
		fp.getLoginFacade().logOut();

		fp.getLoginFacade().givenUserIsLogedIn(orgAdmin);
		fp.getAdminEventStepsFacade().thenUserIsAtEventsPage();
		findEventAndExecuteMoveDatesSteps(fp, purchase.getEvent(), sa, false, 6, 3);
		fp.getLoginFacade().logOut();

		emptyBasket(customer, fp);
		sa.assertAll();

	}

	private void createEvent(FacadeProvider fp, User orgAdmin, Event event, boolean logoutOrgAdmin) {
		fp.getLoginFacade().givenAdminUserIsLogedIn(orgAdmin);
		fp.getOrganizationFacade().givenOrganizationExist(event.getOrganization());
		fp.getAdminEventStepsFacade().createEvent(event);
		fp.getAdminEventStepsFacade().givenUserIsOnAdminEventsPage();
		if (logoutOrgAdmin) {
			fp.getLoginFacade().logOut();
		}
	}

	@Test(dataProvider = "move_event_dates_test_data", priority = 84
			, retryAnalyzer = utils.RetryAnalizer.class)
	public void purchaseTicketsAndMoveEventDatesToPast(User customer, User orgAdmin, Purchase purchase) {
		maximizeWindow();
		FacadeProvider fp = new FacadeProvider(driver);
		purchase.setEvent(this.event);
		SoftAssert sa = new SoftAssert();
		fp.getEventFacade().givenUserIsOnHomePage();
		fp.getEventFacade().whenUserDoesThePurchses(purchase, customer);
		fp.getLoginFacade().logOut();

		fp.getLoginFacade().givenUserIsLogedIn(orgAdmin);
		fp.getOrganizationFacade().givenOrganizationExist(purchase.getEvent().getOrganization());
		fp.getAdminEventStepsFacade().thenUserIsAtEventsPage();
		findEventAndExecuteMoveDatesSteps(fp, purchase.getEvent(), sa, false, 4, 2);
		sa.assertAll();

	}

	@Test(dataProvider = "move_event_dates_test_data", priority = 86,
			dependsOnMethods="purchaseTicketsAndMoveEventDatesToPast" , alwaysRun = true,
			retryAnalyzer = utils.RetryAnalizer.class)
	public void refundAndMoveEventDatesToPast(User customer, User orgAdmin, Purchase purchase) throws Exception {
		maximizeWindow();
		FacadeProvider fp = new FacadeProvider(driver);
		SoftAssert sa = new SoftAssert();
		Event event = this.event;
		fp.getLoginFacade().givenUserIsLogedIn(orgAdmin);
		fp.getOrganizationFacade().givenOrganizationExist(event.getOrganization());
		navigateAndRefundAllTickets(fp, event);
		fp.getAdminEventStepsFacade().givenUserIsOnAdminEventsPage();
		findEventAndExecuteMoveDatesSteps(fp, event, sa, false, 6, 3);

		fp.getAdminEventStepsFacade().attemptEventCancel(event);
		fp.getLoginFacade().logOut();
	}

	private void findEventAndExecuteMoveDatesSteps(FacadeProvider fp, Event event, SoftAssert sa,
			boolean expectedResult, int startDaysSubtract, int endDaysSubtract) {
		fp.getOrganizationFacade().givenOrganizationExist(event.getOrganization());
		fp.getAdminEventStepsFacade().thenUserIsAtEventsPage();
		EventSummaryComponent eventComp = fp.getAdminEventStepsFacade().findEventWithName(event);
		eventComp.clickOnEditEvent(event);
		fp.getAdminEventStepsFacade().whenUserExecutesMoveDatesToPastSteps(expectedResult, sa, startDaysSubtract,
				endDaysSubtract);
	}

	private void emptyBasket(User customer, FacadeProvider fp) {
		try {
			fp.getLoginFacade().givenUserIsLogedIn(customer);
			fp.getEventFacade().whenShoppingBasketFullEmptyIt();
			fp.getLoginFacade().logOut();
		} catch (Exception e) {
			Assert.fail("Failed to empty basket");
		}
	}

	public void navigateAndRefundAllTickets(FacadeProvider fp, Event event) {
		fp.getAdminEventStepsFacade().thenUserIsAtEventsPage();
		driver.navigate().refresh();
		EventSummaryComponent eventCardComp = fp.getAdminEventStepsFacade().findEventWithName(event);
		eventCardComp.clickOnEvent();
		fp.getEventDashboardFacade().givenUserIsOnManageOrdersPage();
		fp.getEventDashboardFacade().whenUserClickOnOrderLinkOfFirstOrder(fp.getOrderManageFacade());
		fp.getOrderManageFacade().refundSteps(RefundReason.OTHER, true);
	}

	@DataProvider(name = "move_event_dates_to_past_data_create_date_fixture")
	public static Object[][] moveEventDatesToPastDataProvider() {
		Event event = Event.generateEventFromJson(DataConstants.EVENT_DATA_STANARD_KEY, EVENT_NAME, true,
				START_DAY_OFFSET, DAYS_RANGE);
		User orgAdmin = User.generateUserFromJson(DataConstants.ORGANIZATION_ADMIN_USER_KEY);
		return new Object[][] { { orgAdmin, event } };

	}

	@DataProvider(name = "move_event_dates_test_data")
	public static Object[][] moveEventDatesToPastTestData() {
		Purchase purchase = preparePurchase();
		User orgAdmin = User.generateUserFromJson(DataConstants.ORGANIZATION_ADMIN_USER_KEY);
		User customer = User.generateUserFromJson(DataConstants.USER_STANDARD_KEY);
		return new Object[][] { { customer, orgAdmin, purchase } };
	}

	private static Purchase preparePurchase() {
		Purchase purchase = Purchase.generatePurchaseFromJson(DataConstants.REGULAR_USER_PURCHASE_KEY);
		purchase.setNumberOfTickets(PURCHASE_QUANTITY);
		purchase.setEvent(Event.generateEventFromJson(DataConstants.EVENT_DATA_STANARD_KEY, EVENT_NAME, false,
				START_DAY_OFFSET, DAYS_RANGE));
		return purchase;
	}
}
