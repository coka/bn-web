package enums;

public enum EventStatus {

	PUBLISHED("Published"),
	DRAFT("Draft"),
	SCHEDULED("Scheduled"),
	ON_SALE("On sale"),
	CANCELLED("Cancelled");

	private String value;

	EventStatus(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}
}
