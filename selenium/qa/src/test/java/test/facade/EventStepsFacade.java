package test.facade;

import org.openqa.selenium.WebDriver;
import org.testng.Assert;
import org.testng.asserts.SoftAssert;

import data.holders.DataHolder;
import data.holders.events.results.EventResultCardData;
import model.CreditCard;
import model.Event;
import model.Purchase;
import model.TicketType;
import model.User;
import model.Venue;
import pages.EventsPage;
import pages.HomePage;
import pages.LoginPage;
import pages.components.chatboot.ChatBotFrame;
import pages.tickets.TicketsConfirmationPage;
import pages.tickets.TicketsPage;
import pages.tickets.TicketsSuccesPage;
import utils.DateTimeCompareBuilder;
import utils.ProjectUtils;

public class EventStepsFacade extends BaseFacadeSteps {

	private EventsPage eventsPage;
	private TicketsPage ticketPage;
	private TicketsConfirmationPage ticketsConfirmationPage;
	private TicketsSuccesPage succesPage;
	private LoginPage loginPage;
	private HomePage homePage;

	public EventStepsFacade(WebDriver driver) {
		super(driver);
		this.eventsPage = new EventsPage(driver);
		this.ticketsConfirmationPage = new TicketsConfirmationPage(driver);
		this.ticketPage = new TicketsPage(driver);
		this.succesPage = new TicketsSuccesPage(driver);
		this.loginPage = new LoginPage(driver);
		this.homePage = new HomePage(driver);
	}

	public LoginPage getLoginPage() {
		return loginPage;
	}

	public EventsPage givenThatEventExist(Event event, User user) {
		givenThatEventExist(event, user, true);
		return eventsPage;
	}

	public void givenThatEventExist(Event event, User user, boolean random) {
		if (!isEventPresent(event)) {
			boolean isLoggedIn = false;
			if (!loginPage.getHeader().isLoggedOut()) {
				isLoggedIn = true;
				loginPage.logOut();
			}

			createEventWithSuperuserLoginAndLogout(event, random);
			if (isLoggedIn) {
				loginPage.login(user);
			}

			homePage.navigate();
			homePage.navigate();
		}
	}

	public boolean isEventPresent(Event event) {
		return eventsPage.isEventPresent(event.getEventName());
	}

	public void givenUserIsOnEventPage() {
		eventsPage.navigate();
	}

	public void givenUserIsOnHomePage() {
		homePage.navigate();
	}

	private void createEventWithSuperuserLoginAndLogout(Event event, boolean randomizeName) {
		if (!loginPage.getHeader().isLoggedOut()) {
			loginPage.logOut();
		}

		User superuser = User.generateSuperUser();
		loginPage.login(superuser.getEmailAddress(), superuser.getPass());
		AdminEventStepsFacade createEvent = new AdminEventStepsFacade(driver);
		OrganizationStepsFacade organizationFacade = new OrganizationStepsFacade(driver);

		organizationFacade.givenOrganizationExist(event.getOrganization());
		if (randomizeName) {
			event.setEventName(event.getEventName() + ProjectUtils.generateRandomInt(1000000));
		}
		boolean retVal = createEvent.createEvent(event);

		if (!retVal) {
			Assert.fail("Event creationg in purchase steps failed");
		}
		loginPage.logOut();
	}

	public void whenUserChangesTicketOptions(Purchase purchase) {
		ticketsConfirmationPage.clickOnChangeTicketLink();
		ticketPage.isAtPage();
		ticketPage.removeNumberOfTickets(purchase.getRemoveNumberOfTickets());
		ticketPage.clickOnContinue();
	}

	public void whenUserExecutesEventPagesSteps(Event event) {
		whenUserSearchesAndClicksOnEvent(event);
		whenUserClickOnViewMap();
		whenUserClicksOnPurchaseTicketLink();
	}

	public void whenUserDoesThePurchses(Purchase purchase, User customer) {
		whenUserPlacesItemsInBasket(purchase, customer);
		whenUserEntersCreditCardDetailsAndClicksOnPurchase(purchase.getCreditCard());
		thenUserIsAtTicketPurchaseSuccessPage();
		whenUserClosesChatbot();
	}

	public void whenUserPlacesItemsInBasket(Purchase purchase, User customer) {
		whenUserExecutesEventPagesStepsWithoutMapView(purchase.getEvent());
		whenUserSelectsNumberOfTicketsAndClicksOnContinue(purchase);
		whenUserLogsInOnTicketsPage(customer);
		thenUserIsAtConfirmationPage();
	}

	public void whenUserLogsInOnTicketsPage(User user) {
		ticketPage.clickOnAlreadyHaveAnAccount();
		ticketPage.login(user.getEmailAddress(), user.getPass());
		if (ticketPage.checkIfMoreEventsAreBeingPurchased()) {
			ticketPage.getHeader().clickOnShoppingBasketIfPresent();
		}
	}

	public DataHolder whenUserExecutesEventPageStepsWithDataAndWithoutMapView(Event event) {
		DataHolder holder = whenUserSearchesAndClickOnEventWithDataCollection(event);
		whenUserClicksOnPurchaseTicketLink();
		return holder;
	}

	public void whenUserExecutesEventPagesStepsWithoutMapView(Event event) {
		whenUserSearchesAndClicksOnEvent(event);
		whenUserClicksOnPurchaseTicketLink();
	}

	public void whenUserClicksOnPurchaseTicketLink() {
		eventsPage.purchaseTicketLinkClick();
	}

	public boolean whenShoppingBasketIsPresentAndClickOnBasket() {
		return eventsPage.getHeader().clickOnShoppingBasketIfPresent();
	}

	public void whenShoppingBasketFullEmptyIt() {
		if(eventsPage.getHeader().clickOnShoppingBasketIfPresent()) {
			thenUserIsAtConfirmationPage();
			ticketsConfirmationPage.clickOnChangeTicketLink();
			ticketPage.checkIfTicketAreSelectedAndRemoveAllTickets();
			ticketPage.clickOnContinue();
		}
	}

	public void whenSearchingForEventByEventArtistName(Purchase purchase) {
		eventsPage.getHeader().searchEvents(purchase.getEvent().getArtistName());
	}

	public void whenSearchingForEvent(Event event) {
		eventsPage.getHeader().searchEvents(event.getEventName());
	}

	public void whenUserSelectsNumberOfTicketsForEachTicketTypeAndClicksOnContinue(Purchase purchase) {
		ticketPage.addNumberOfTicketsForEachType(purchase.getNumberOfTickets());
		ticketPage.clickOnContinue();
	}

	public void whenUserSelectsNumberOfTicketsAndClicksOnContinue(Purchase purchase) {
		ticketPage.addNumberOfTickets(purchase.getNumberOfTickets());
		ticketPage.clickOnContinue();
	}

	public void whenUserSelectsNumberOfTicketsAndClicksOnContinue(Purchase purchase, TicketType ticketType) {
		ticketPage.addNumberOfTickets(purchase.getNumberOfTickets(), ticketType);
		ticketPage.clickOnContinue();
	}

	public void whenUserEntersCreditCardDetailsAndClicksOnPurchase(CreditCard card) {
		this.ticketsConfirmationPage.ticketsConfirmationPageSteps(card);
	}

	public void whenUserChecksValidityOfInfoOnTicketSuccessPage(DataHolder holder, User user) {
		SoftAssert softAssert = new SoftAssert();
		compareEventAndVenueInfoFromResultsPageAndSuccesPage(holder, softAssert);
		compareInfoOnTicketSuccessPage(softAssert, user);
		softAssert.assertAll();
	}

	private void compareEventAndVenueInfoFromResultsPageAndSuccesPage(DataHolder holder, SoftAssert softAssert) {
		EventResultCardData dataHolder = (EventResultCardData) holder;
		Event resultsEvent = dataHolder.getEvent();
		Venue resultsVenue = dataHolder.getVenue();

		Event succesPageEvent = succesPage.getEventInfo();
		Venue succesPageVenue = succesPage.getVenueInfo();

		boolean isMonthDateTimeEqual = new DateTimeCompareBuilder()
				.compareMonth().compareDayOfMonth().compareDayOfWeek().compareHour().compareMinute()
				.compare(resultsEvent.getDate(), succesPageEvent.getDate());

		softAssert.assertTrue(resultsEvent.getEventName().equals(succesPageEvent.getEventName()),
				"Event names on event result card and ticket purchase page not the same");
		softAssert.assertTrue(isMonthDateTimeEqual,
				"Event times on event result card and ticket purchase page not the same");
		softAssert.assertTrue(
				resultsVenue.getName().equals(succesPageVenue.getName()),
				"Venue names on event result card and ticket purchase page not the same");
//		softAssert.assertTrue(dataHolder.getImageUrl().equals(succesPage.getImageUrl()),
//				"Image url on on event result card and ticket purchase page not the same");
	}

	private void compareInfoOnTicketSuccessPage(SoftAssert softAssert, User user) {
		softAssert.assertTrue(succesPage.compareOnPageEventInformation(),
				"Event information on success page and order details not the same");
		softAssert.assertTrue(succesPage.compareOnPageVenueInfos(),
				"Venue inforamtion on success page and order details not the same");
		softAssert.assertTrue(succesPage.compareOrderNumberAndNumberOfTickets(),
				"Order number or ticket number on success page and order details not the same");
		softAssert.assertTrue(succesPage.isTotalSumCalculationCorrect(),
				"Sum of subtotal and fees total not equal of order total");
		softAssert.assertTrue(succesPage.isTicketTotalEqualToOrderDetailsSubtotal(),
				"Ticket Total and Subtotal not equal");
		softAssert.assertTrue(succesPage.getPurchasedUser().equals(user),
				"Logged in user: [" + user.toString() + "]\n and purchaser user: [" +
						succesPage.getPurchasedUser().toString() + " displayed not the same");
		softAssert.assertTrue(succesPage.isCustomerSupportLinkCorrect(),
				"Customer support linke not valid");
		softAssert.assertTrue(succesPage.checkValidityOfAppDownloadLinks(),
				"App download links not valid");
	}

	public DataHolder getOrderDetailsData() {
		return succesPage.getDataHolder();
	}

	private void whenUserSearchesAndClicksOnEvent(Event event) {
		eventsPage.searchAndClickOnEvent(event.getEventName());
	}

	private DataHolder whenUserSearchesAndClickOnEventWithDataCollection(Event event) {
		return eventsPage.searchAndClickWithInfoCollection(event.getEventName());
	}

	private void whenUserClickOnViewMap() {
		eventsPage.clickOnViewMap();
	}

	public int thenTicketQuantityIs() {
		return ticketsConfirmationPage.getTicketQuantity();
	}

	public boolean thenUserIsAtTicketsPage() {
		return ticketPage.isAtPage();
	}

	public boolean thenUserIsAtConfirmationPage() {
		return ticketsConfirmationPage.isAtPage();
	}

	public boolean thenUserIsAtTicketPurchaseSuccessPage() {
		return this.succesPage.isAtPage();
	}

	public void whenUserClosesChatbot() {
		thenUserIsAtTicketPurchaseSuccessPage();
		ChatBotFrame chatBot = new ChatBotFrame(driver);
		if(chatBot.isChatBotOpened()) {
			chatBot.closeChatBot();
		}
	}

	public void whenUserEntersPhoneNumberAndClicksSend(String phoneNumber) {
		this.succesPage.enterPhoneNumberAndClickSend(phoneNumber);
	}

	@Override
	protected void setData(String key, Object value) {
	}

	@Override
	protected Object getData(String key) {
		return null;
	}

}
