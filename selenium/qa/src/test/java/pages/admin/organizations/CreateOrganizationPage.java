package pages.admin.organizations;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import model.Organization;
import pages.BasePage;
import pages.components.GenericDropDown;
import utils.Constants;
import utils.MsgConstants;

public class CreateOrganizationPage extends BasePage {

	@FindBy(id = "name")
	private WebElement nameField;

	@FindBy(id = "phone")
	private WebElement phoneNumberField;

	@FindBy(xpath = "//input[@id='timezone']/preceding-sibling::div[@role='button']")
	private WebElement timeZoneDropDown;

	@FindBy(id = "menu-timezone")
	private WebElement timeZoneList;

	@FindBy(id = "address")
	private WebElement streetAddressField;

	@FindBy(id = "city")
	private WebElement cityField;

	@FindBy(xpath = "//form//input[@id='state']/preceding-sibling::div[@aria-haspopup='true']")
	private WebElement stateDropDownActivate;

	@FindBy(id = "menu-state")
	private WebElement stateDropDownContainer;

	@FindBy(id = "postal_code")
	private WebElement postalCodeField;

	@FindBy(xpath = "//body//main//form//button[@type='submit']")
	private WebElement createButton;

	public CreateOrganizationPage(WebDriver driver) {
		super(driver);
	}

	@Override
	public void presetUrl() {
		setUrl(Constants.getAdminOrganizationsCreate());
	}

	public void fillFormAndConfirm(Organization org) {
		fillForm(org);
		waitVisibilityAndBrowserCheckClick(createButton);
	}

	private void fillForm(Organization org) {
		enterOrganizationName(org);
		enterPhoneNumber(org);
		selectTimeZone(org);
		enterStreetAddress(org);
		enterCity(org);
		enterState(org);
		enterPostalCode(org);
	}

	private void enterOrganizationName(Organization org) {
		waitVisibilityAndClearFieldSendKeysF(nameField, org.getName());
	}

	private void enterPhoneNumber(Organization org) {
		waitVisibilityAndClearFieldSendKeysF(phoneNumberField, org.getPhoneNumber());
	}

	private void selectTimeZone(Organization org) {
		GenericDropDown dropDown = new GenericDropDown(driver, timeZoneDropDown, timeZoneList);
		dropDown.selectElementFromDropDownHiddenInput(
				GenericDropDown.dropDownListContainsXpath(org.getTimeZone()),
				org.getTimeZone());
	}

	private void enterStreetAddress(Organization org) {
		waitVisibilityAndClearFieldSendKeysF(streetAddressField, org.getStreetAddress());
	}

	private void enterCity(Organization org) {
		waitVisibilityAndClearFieldSendKeysF(cityField, org.getCity());
	}

	private void enterState(Organization org) {
		GenericDropDown dropDown = new GenericDropDown(driver, stateDropDownActivate, stateDropDownContainer);
		String state = org.getState() + " (" + org.getStateAbbr() + ")";
		dropDown.selectElementFromDropDownHiddenInput(
				GenericDropDown.dropDownListContainsXpath(state),
				org.getState());
	}

	private void enterPostalCode(Organization org) {
		waitVisibilityAndClearFieldSendKeysF(postalCodeField, org.getPostalCode());
	}

	public boolean checkPopupMessage() {
		explicitWaitForVisiblity(message);
		return isNotificationDisplayedWithMessage(MsgConstants.ORGANIZATION_CREATED_SUCCESS);
	}

}
