package pages.components;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;

import pages.BaseComponent;
import pages.tickets.TicketsConfirmationPage;
import pages.user.MyEventsPage;
import utils.Constants;
import utils.SeleniumUtils;

public class Header extends BaseComponent {

	@FindBy(xpath = "//header")
	private WebElement header;

	@FindBy(css = "header form input")
	private WebElement searchEvents;

	@FindBy(xpath = "//header//a/img[@alt='Header logo']")
	private WebElement headerLogo;

	@FindBy(css = "header form img[alt='Search icon']")
	private WebElement searchImage;

	@FindBy(xpath = "//body//header//span[@aria-owns='menu-appbar']/img[contains(@src,'down-active.svg')]")
	private WebElement profileOptionsLowResolution;

	@FindBy(xpath = "//header//div/span[contains(text(),'Welcome back')]")
	private WebElement profileOptions;

	@FindBy(xpath = "//body//header//a[@href='/box-office/sell']/div")
	private WebElement boxOffice;

	@FindBy(xpath = "//body//header//a[@href='/admin/events']/div")
	private WebElement toStudioButton;

	@FindBy(xpath = "//body//header//div[span[@aria-owns='menu-appbar' and @aria-haspopup='true']//span[contains(text(),'Current organization')]]")
	private WebElement currentOrganizationDropDown;

	@FindBy(xpath = "//body//header//div[span[@aria-owns='menu-appbar' and @aria-haspopup='true']]//div[span[contains(text(),'Current organization')]]/h3")
	private WebElement selectedOrganization;

	@FindBy(xpath = "//header//span[a[contains(@href,'tickets/confirmation')]]|//header//span/div[contains(@to,'tickets/confirmation')]")
	private WebElement shoppingBasket;

	@FindBy(xpath = "//body//header//button[span[contains(text(),'Sign In')]]")
	private WebElement signInButton;

	@FindBy(xpath = "//header//a[@href='/admin/events']/following-sibling::div[2][span[@aria-owns='menu-appbar' and @aria-haspopup='true']]")
	private WebElement adminEventDropDownButton;

	@FindBy(xpath = "//header/div/div[2]//span[@aria-owns='menu-appbar' and @aria-haspopup='true']")
	private WebElement boxOfficeEventDropDownButton;

	@FindBy(id = "menu-appbar")
	private WebElement adminEventDropDownContainer;

	private ProfileMenuDropDown profileMenuDropDown;

	public Header(WebDriver driver) {
		super(driver);
		profileMenuDropDown = new ProfileMenuDropDown(driver);
	}

	public boolean isVisible(int waitTime) {
		return isExplicitlyWaitVisible(waitTime, header);
	}

	public void clickOnHeaderLogo() {
		waitVisibilityAndBrowserCheckClick(headerLogo);
	}

	public void searchEvents(String event) {
		if (event == null) {
			return;
		}
		SearchAndSignInMainPageComponent searchComponent = new SearchAndSignInMainPageComponent(driver);
		if (searchComponent.isSearchFieldVisible()) {
			searchComponent.searchForEvents(event);
		} else if (isExplicitlyWaitVisible(4, searchEvents)) {
			waitVisibilityAndClearFieldSendKeysF(searchEvents, event);
			searchEvents.submit();
		}
	}

	public void clickOnSignInButton() {
		if (isVisible(4)) {
			explicitWaitForVisibilityAndClickableWithClick(signInButton);
		} else {
			SearchAndSignInMainPageComponent searchAndSignIn = new SearchAndSignInMainPageComponent(driver);
			searchAndSignIn.clickOnSignIn();
		}
	}

	public void clickOnBoxOfficeLink() {
		explicitWaitForVisiblity(boxOffice);
		explicitWaitForClickable(boxOffice);
		waitForTime(1000);
		waitVisibilityAndBrowserCheckClick(boxOffice);
	}

	public void clickOnToStudioLink() {
		explicitWaitForVisiblity(toStudioButton);
		waitVisibilityAndBrowserCheckClick(toStudioButton);
	}

	public void openProfileOptions() {
		waitForTime(1000);
		if (isVisible(3)) {
			explicitWaitForVisibilityAndClickableWithClick(profileOptions);
		} else {
			SearchAndSignInMainPageComponent searchAndSigning = new SearchAndSignInMainPageComponent(driver);
			searchAndSigning.openProfileOptions();
		}
		waitForTime(1000);
	}


	public void clickOnMyEvents() {
		openProfileOptions();
		profileMenuDropDown.myEventsClick();
	}

	public void logOut() {
		openProfileOptions();
		profileMenuDropDown.logout();
	}

	public MyEventsPage clickOnMyEventsInProfileDropDown() {
		openProfileOptions();
		profileMenuDropDown.myEventsClick();
		return new MyEventsPage(driver);
	}

	public boolean checkLogedInFirstNameInHeader(String firstName) {
		String xpath = "/html/body/div[1]/div/header//h3[contains(text(),'" + firstName + "')]";
		explicitWait(5, 200, ExpectedConditions.visibilityOfElementLocated(By.xpath(xpath)));
		return true;
	}

	public void selectOrganizationFromDropDown(String organizationName) {
		waitForTime(1000);
		waitVisibilityAndClick(currentOrganizationDropDown);
		CurrentOrganizationDropDown dropDown = new CurrentOrganizationDropDown(driver);
		dropDown.selectOrganizationByName(organizationName);
	}

	public boolean isOrganizationPresent(String organizationName) {
		boolean retVal = false;
		if (isExplicitlyWaitVisible(selectedOrganization)){
			if(selectedOrganization.getText().equals(organizationName)){
				return true;
			}
		}
		if(isExplicitlyWaitVisible(currentOrganizationDropDown)) {
			waitVisibilityAndBrowserCheckClick(currentOrganizationDropDown);
			CurrentOrganizationDropDown dropDown = new CurrentOrganizationDropDown(driver);
			try {
				dropDown.findOrganizationByName(organizationName);
				retVal = true;
			} catch (Exception e) {
				retVal = false;
			}
			//close the drop down
			WebElement element = explicitWait(15,
					ExpectedConditions.visibilityOfElementLocated(By.xpath("//body//div[@id='menu-appbar']")));
			element.click();
		}

		return retVal;
	}

	public boolean clickOnShoppingBasketIfPresent() {
		boolean isPresent = isExplicitlyWaitVisible(4, shoppingBasket);
		if (isPresent) {
			String innerHtml = shoppingBasket.getAttribute("innerHTML");
			Document document = Jsoup.parse(innerHtml);
			Elements paragraphs = document.getElementsByTag("a");
			String href = null;
			for (Element paragraph : paragraphs) {
				href = paragraph.attr("href");
				if(href.contains(TicketsConfirmationPage.partialPath)) {
					String formatedPath = href.substring(1);
					SeleniumUtils.openLink(Constants.getBaseUrlBigNeon() + formatedPath, driver);
					return true;
				}
			}

		}
		return false;
	}

	public boolean isLoggedOut() {
		boolean isSignInButtonVisible = false;
		if(isVisible(3)) {
			isSignInButtonVisible = isExplicitlyWaitVisible(3, signInButton);
		} else {
			SearchAndSignInMainPageComponent mainSearch = new SearchAndSignInMainPageComponent(driver);
			isSignInButtonVisible = mainSearch.isSignInButtonVisible();
		}
		return isSignInButtonVisible;
	}

	/**
	 * opens event select drop down for superadmin users
	 * @param eventName
	 */
	public void selectEventFromAdminDropDown(String eventName) {
		GenericDropDown dropDown = new GenericDropDown(driver, boxOfficeEventDropDownButton, adminEventDropDownContainer);
		dropDown.selectElementFromDropDownNoValueCheck(
				By.xpath(".//ul//li//div/span[contains(text(),'" + eventName + "')]"));
		waitForTime(2000);
	}

	/**
	 * opens event select drop down for boxOffice user
	 * @param eventName
	 */
	public void selectEventFromBoxOfficeDropDown(String eventName) {
		GenericDropDown dropDown = new GenericDropDown(driver, boxOfficeEventDropDownButton, adminEventDropDownContainer);
		dropDown.selectElementFromDropDownNoValueCheck(By.xpath(".//ul//li//div/span[contains(text(),'" + eventName + "')]"));
		waitForTime(2000);
	}

}
