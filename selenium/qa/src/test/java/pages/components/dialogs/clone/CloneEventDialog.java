package pages.components.dialogs.clone;

import java.time.LocalDate;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import pages.components.TimeMenuDropDown;
import pages.components.dialogs.DialogContainerComponent;
import utils.ProjectUtils;

public class CloneEventDialog extends DialogContainerComponent{
	
	@FindBy(id="eventName")
	private WebElement eventNameField; 
	
	@FindBy(id="eventDate")
	private WebElement eventStartDateField;
	
	@FindBy(xpath = "//span[span[contains(text(),'End date')]]/following-sibling::div//input[@id='endTime']")
	private WebElement eventEndDateField;
	
	@FindBy(id = "show-time")
	private WebElement eventStartTimeField;
	
	@FindBy(xpath = "//span[span[contains(text(),'End time')]]/following-sibling::span//input[@id='endTime']")
	private WebElement eventEndTimeField;
	
	private final String CREATE_BUTTON_LABEL = "Create";
	
	private final String CANCEL_BUTTON_LABEL = "Cancel";
	
	public CloneEventDialog(WebDriver driver) {
		super(driver);
	}
	
	public void fillFields(LocalDate startDate, LocalDate endDate, String startTime, String endTime) {
		enterDate(eventStartDateField, ProjectUtils.formatDate(ProjectUtils.DATE_FORMAT,startDate));
		enterDate(eventEndDateField, ProjectUtils.formatDate(ProjectUtils.DATE_FORMAT,endDate));
		
		enterTime(eventStartTimeField, startTime);
		enterTime(eventEndTimeField, endTime);
	}
	
	public void clickOnCreateButton() {
		clickOnButtonWithLabel(CREATE_BUTTON_LABEL);
	}
	
	public void clickOnCancelButton() {
		clickOnButtonWithLabel(CANCEL_BUTTON_LABEL);
	}
	
	private void enterTime(WebElement inputField, String time) {
		TimeMenuDropDown timeDropDown = new TimeMenuDropDown(driver);
		timeDropDown.enterDate(inputField, time);
	}	
}
