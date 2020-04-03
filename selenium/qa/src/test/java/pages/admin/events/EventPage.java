package pages.admin.events;

import model.TicketType;
import org.openqa.selenium.By;
import org.openqa.selenium.InvalidArgumentException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindAll;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import pages.BasePage;
import pages.components.GenericDropDown;
import pages.components.TimeMenuDropDown;
import pages.components.admin.UploadImageComponent;
import pages.components.admin.events.AddTicketTypeComponent;
import pages.components.admin.events.ArtistEventPageComponent;
import utils.Constants;
import utils.MsgConstants;
import utils.ProjectUtils;
import utils.SeleniumUtils;

import java.time.LocalDate;
import java.util.List;

public class EventPage extends BasePage {

	@FindBy(xpath = "//body//div//h2[contains(text(),'Upload event image')]")
	private WebElement uploadEventImage;

	@FindBy(xpath = "//div[contains(@title,'Event promo image')]")
	private WebElement imageEventUploaded;

	@FindBy(xpath = "//div[p[contains(text(),'Childish Gambino')]]")
	private WebElement artistInputDropDown;

	@FindBy(id = "react-select-2-input")
	private WebElement artistInputField;

	@FindAll(@FindBy(xpath = "//div[div[h2[contains(text(),'Artists')]]]/following-sibling::div[1]/div[1]/div"))
	private List<WebElement> artistList;

	@FindBy(id = "eventName")
	private WebElement eventNameField;

	@FindBy(xpath = "//input[@id='venues']/preceding-sibling::div")
	private WebElement venueDropDownSelect;

	@FindBy(id = "menu-venues")
	private WebElement venueDropDownContainer;

	@FindBy(id = "eventDate")
	private WebElement startDateField;

	// mm//dd//yyyy
	@FindBy(xpath = "//main//input[@id='endTime' and @placeholder='mm/dd/yyyy']")
	private WebElement endDateField;

	@FindBy(id = "show-time")
	private WebElement showTimeField;

	@FindBy(xpath = "//main//input[@id='endTime' and @name='endTime']")
	private WebElement endTimeField;

	@FindBy(id = "time-menu")
	private WebElement timeMenu;

	@FindBy(xpath = "//input[@id='doorTimeHours' and @type='hidden']/preceding-sibling::div")
	private WebElement doorTimeDropDownActivate;

	@FindBy(id = "menu-doorTimeHours")
	private WebElement doorTimeMenuHoursContainer;

	@FindBy(xpath = "//main//div[aside[contains(text(),'Add another ticket type')]]")
	private WebElement addTicketTypeButton;

	@FindBy(xpath = "//main//div//button[span[contains(text(),'Save draft')]]")
	private WebElement saveDraftButton;

	@FindBy(xpath = "//main//div//button[span[text()='Save']]")
	private WebElement saveButton;

	@FindBy(xpath = "//main//div//button[span[contains(text(),'Update')]]")
	private WebElement updateButton;

	@FindAll(@FindBy(xpath = "//div[div[h2[contains(text(),'Ticketing')]]]/following-sibling::div[1]/div/div[1]/div"))
	private List<WebElement> listOfTicketTypeRows;

	private final String CHANGE_CATEGORY_BUTTON_LABEL = "Change category";

	public EventPage(WebDriver driver) {
		super(driver);
	}

	@Override
	public void presetUrl() {
		setUrl(Constants.getAdminEventCreate());
	}

	public boolean isAtCreatePage() {
		return isExplicitAtPage(5);
	}

	public boolean isAtEditPage(){
		return isExplicitConditionTrue(5, ExpectedConditions.urlMatches(Constants.getAdminEvents() + "*.*/edit"));
	}

	public void uploadImage(String imageLink) {
		UploadImageComponent uploadImage = new UploadImageComponent(driver);
		uploadImage.uploadImageFromResources(imageLink, uploadEventImage);
	}

	/**
	 * @param startDate format "mm/dd/yyyy"
	 * @param endDate   format "mm/dd/yyyy"
	 * @param showTime  format "08:00 AM", "09:30 PM" ...
	 * @param endTime   format "08:00 AM", "09:30 PM" ...
	 * @param doorTime  format "0","0.5";"1";"2";..;"10"
	 */
	public void enterDatesAndTimes(String startDate, String endDate, String showTime, String endTime, String doorTime) {
		enterDate(startDateField, startDate);
		enterDate(endDateField, endDate);
		selectTime(showTimeField, showTime);
		waitForTime(1000);
		selectTime(endTimeField, endTime);
		waitForTime(1000);
		selectDoorTime(doorTime);

	}

	public void enterDates(LocalDate startDate, LocalDate endDate) {
		enterDate(startDateField, ProjectUtils.formatDate(ProjectUtils.DATE_FORMAT, startDate));
		enterDate(endDateField, ProjectUtils.formatDate(ProjectUtils.DATE_FORMAT, endDate));
	}

	public void enterArtistName(String artistName) {
		waitForTime(1000);
		waitVisibilityAndSendKeys(artistInputField, artistName);
		waitForTime(2000);
		WebElement select = driver.findElement(
				By.xpath("//div[contains(@class,'menu')]//div[span[contains(text(),'" + artistName + "')]]"));
		waitVisibilityAndClick(select);
	}

	public ArtistEventPageComponent getArtistComponentByName(String name) {
		explicitWait(15, ExpectedConditions.visibilityOfAllElements(artistList));
		ArtistEventPageComponent artistComponent = artistList.stream()
				.map(el -> new ArtistEventPageComponent(driver, el))
				.filter(art -> art.isArtistName(name)).findFirst().orElse(null);
		return artistComponent;
	}

	public void enterEventName(String eventName) {
		waitVisibilityAndClick(eventNameField);
		SeleniumUtils.clearInputField(eventNameField, driver);
		waitForTime(500);
		waitVisibilityAndSendKeys(eventNameField, eventName);
	}

	public void selectVenue(String venueName) {
		explicitWaitForVisiblity(venueDropDownSelect);
		SeleniumUtils.jsScrollIntoView(venueDropDownSelect, driver);
		GenericDropDown dropDown = new GenericDropDown(driver, venueDropDownSelect, venueDropDownContainer);
		dropDown.selectElementFromDropDownHiddenInput(
				By.xpath(".//ul//li[contains(text(),'" + venueName + "')]"),
				venueName);
	}

	public void changeCategory(String category) {
		clickOnButtonWithLabel(CHANGE_CATEGORY_BUTTON_LABEL);
	}


	public void addTicketTypes(List<TicketType> list) {
		if (list == null) {
			return;
		}
		for (TicketType type : list) {
			addNewTicketType(type);
		}
	}

	private void addNewTicketType(TicketType type) {
		waitVisibilityAndBrowserCheckClick(addTicketTypeButton);
		AddTicketTypeComponent ticketType = new AddTicketTypeComponent(driver);
		ticketType.addNewTicketType(type);
	}

	public void clickOnSaveDraft() {
		waitVisibilityAndBrowserCheckClick(saveDraftButton);
	}

	public void clickOnSave() {
		waitVisibilityAndBrowserCheckClick(saveButton);
	}

	public void clickOnUpdateButton() {
		waitVisibilityAndBrowserCheckClick(updateButton);
	}

	public boolean checkMessage() {
		if (!isNotificationDisplayedWithMessage(MsgConstants.EVENT_PUBLISHED)) {
			Assert.fail(getNotificationMessage(2));
		}
		return true;
	}

	public boolean checkSaveDraftMessage() {
		return isNotificationDisplayedWithMessage(MsgConstants.EVENT_SAVED_TO_DRAFT);
	}

	public LocalDate getStartDateValue() {
		String startDateStr = getAccessUtils().getValue(startDateField);
		return getDate(startDateStr);
	}

	public LocalDate getEndDateValue() {
		String endDateStr = getAccessUtils().getValue(endDateField);
		return getDate(endDateStr);
	}

	private LocalDate getDate(String dateStr) {
		if (dateStr == null || dateStr.isEmpty()) {
			throw new InvalidArgumentException("Value passed to getDate in " + getClass().getName() + " is invalid: " + dateStr);
		}
		LocalDate retVal = ProjectUtils.parseDate(ProjectUtils.DATE_FORMAT, dateStr);
		return retVal;
	}

	private void clickOnUploadImage() {
		waitVisibilityAndClick(uploadEventImage);
	}

	/**
	 * Valid doorTime values are 0;0.5;1;1;2;3;4;5;6;7;8;9;10
	 *
	 * @param doorTime
	 * @return
	 */
	public void selectDoorTime(String doorTime) {
		if (doorTime != null && !doorTime.isEmpty()) {
			GenericDropDown dropDown = new GenericDropDown(driver, doorTimeDropDownActivate, doorTimeMenuHoursContainer);
			dropDown.selectElementFromDropDownNoValueCheck(By.xpath(".//ul//li[@data-value='" + doorTime + "']"));
		}
	}

	/**
	 * WebElement element param is one that need to be clicked for timeMenu to
	 * appear. String time is time to be selected in drop down. format of time arg
	 * is 12:30 AM,13:00 AM, 13:30 AM with 30 minutes increments
	 *
	 * @param element
	 * @param time
	 */
	private void selectTime(WebElement element, String time) {
		TimeMenuDropDown timeDropDown = new TimeMenuDropDown(driver);
		timeDropDown.selectTime(element, time);

	}

}
