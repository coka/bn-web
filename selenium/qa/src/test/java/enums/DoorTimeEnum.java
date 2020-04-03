package enums;

public enum DoorTimeEnum {
	ZERO("0",0),
	HALF_HOUR("0.5",30),
	ONE_HOURS("1",60),
	TWO_HOURS("2",120),
	THREE_HOURS("3",180),
	FOUR_HOURS("4",240),
	FIVE_HOURS("5",300),
	SIX_HOURS("6",360),
	SEVEN_HOURS("7",420),
	EIGHT_HOURS("8",480),
	NINE_HOURS("9",540),
	TEN_HOURS("10",600);
	
	private String value;
	private long minutes;
	
	private DoorTimeEnum(String value, long minutes) {
		this.value = value;
		this.minutes = minutes;
	}
	
	public static DoorTimeEnum findDoorEnum(String hours) {
		DoorTimeEnum retVal = null;
		for(DoorTimeEnum timeEnum : values()) {
			if (timeEnum.getValue().equals(hours)) {
				retVal = timeEnum;
				break;
			}
		}
		return retVal;
	}
	
	
	public String getValue() {
		return value;
	}


	public void setValue(String value) {
		this.value = value;
	}


	public long getMinutes() {
		return minutes;
	}


	public void setMinutes(long minutes) {
		this.minutes = minutes;
	}
}