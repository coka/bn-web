package model;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.testng.asserts.SoftAssert;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;

import enums.DoorTimeEnum;
import model.AdditionalOptionsTicketType.SaleEnd;
import model.AdditionalOptionsTicketType.SaleStart;
import model.interfaces.IAssertable;
import model.interfaces.IAssertableField;
import utils.DataConstants;
import utils.DataReader;
import utils.ProjectUtils;

public class Event implements Serializable, IAssertable<Event> {

	private static final long serialVersionUID = 6081396679346519203L;
	@JsonProperty("organization_ref")
	private String organizationRef;
	@JsonProperty("organization")
	private Organization organization;
	@JsonProperty("artist_name")
	private String artistName;
	@JsonProperty("event_name")
	private String eventName;
	@JsonProperty("venue_ref")
	private String venueRef;
	@JsonProperty("start_date")
	private String startDate;
	@JsonProperty("end_date")
	private String endDate;
	@JsonProperty("start_time")
	private String startTime;
	@JsonProperty("end_time")
	private String endTime;
	@JsonProperty("door_time")
	private String doorTime;
	@JsonProperty("ticket_types")
	private List<TicketType> ticketTypes = new ArrayList<>();
	@JsonProperty("artists")
	private Set<Artist> artists;
	private String comparableDoorTime;
	private Venue venue;

	private LocalDateTime date;

	public enum EventField implements IAssertableField {
		EVENT_NAME,
		START_DATE,
		END_DATE,
		START_TIME,
		END_TIME,
		DOOR_TIME
	}

	public String getOrganizationRef() {
		return organizationRef;
	}

	public void setOrganizationRef(String organizationRef) {
		this.organizationRef = organizationRef;
	}

	public Organization getOrganization() {
		if (this.organization == null) {
			if (this.organizationRef != null && !this.organizationRef.isEmpty()) {
				this.organization = Organization.generateOrganizationFromJson(this.organizationRef);
			}else {
				throw new NullPointerException("No organization reference provided");
			}
		}
		return organization;
	}

	public void setOrganization(Organization organization) {
		this.organization = organization;
	}

	public String getArtistName() {
		return artistName;
	}

	public void setArtistName(String artistName) {
		this.artistName = artistName;
	}

	public String getEventName() {
		return eventName;
	}

	public void setEventName(String eventName) {
		this.eventName = eventName;
	}

	public String getVenueRef() {
		return venueRef;
	}

	public void setVenueRef(String venueRef) {
		this.venueRef = venueRef;
	}

	public Venue getVenue() {
		if(this.venue == null) {
			if (this.venueRef != null && !this.venueRef.isEmpty()) {
				this.venue = Venue.generateVenueFromJson(this.venueRef);
			}else {
				throw new NullPointerException("No venue reference provided");
			}
		}
		return this.venue;
	}

	public void setVenue(Venue venue) {
		this.venue = venue;
	}

	public String getStartDate() {
		return startDate;
	}

	public void setStartDate(String startDate) {
		this.startDate = startDate;
	}

	public String getEndDate() {
		return endDate;
	}

	public void setEndDate(String endDate) {
		this.endDate = endDate;
	}

	public String getStartTime() {
		return startTime;
	}

	public void setStartTime(String startTime) {
		this.startTime = startTime;
	}

	public String getEndTime() {
		return endTime;
	}

	public void setEndTime(String endTime) {
		this.endTime = endTime;
	}

	public String getDoorTime() {
		return doorTime;
	}

	public void setDoorTime(String doorTime) {
		this.doorTime = doorTime;
	}

	public List<TicketType> getTicketTypes() {
		return ticketTypes;
	}

	public void setTicketTypes(List<TicketType> ticketTypes) {
		this.ticketTypes = ticketTypes;
	}

	public void addTicketType(TicketType ticketType) {
		this.ticketTypes.add(ticketType);
	}

	public void addArtist(Artist artist) {
		if (this.artists == null) {
			this.artists = new HashSet<>();
		}
		this.artists.add(artist);
	}

	public Set<Artist> getArtists() {
		return artists;
	}

	public void setArtists(Set<Artist> artists) {
		this.artists = artists;
	}

	public LocalDateTime getDate() {
		return date;
	}

	public void setDate(LocalDateTime date) {
		this.date = date;
	}

	public String getComparableDoorTime() {
		return comparableDoorTime;
	}
	/**
	 * Based on this.startTime and given doorTime this method adds door time to start time and
	 * returns string in pattern given, it expects this.startDate to follow the same pattern.
	 * @param pattern
	 * @param doorTime
	 * @return
	 */
	public String calculateComparableDoorTime(String pattern, String doorTime) {
		if (this.startTime != null && doorTime != null) {
			LocalTime lt = ProjectUtils.parseTime(pattern, this.startTime);
			DoorTimeEnum doorTimeEnum = DoorTimeEnum.findDoorEnum(doorTime);
			if (doorTimeEnum != null) {
				LocalTime calculated = lt.minusMinutes(doorTimeEnum.getMinutes());
				return ProjectUtils.formatTime(pattern, calculated);
			}
		}
		return null;
	}

	public void setDefaultTicketTypeDates() {
		for(TicketType tt : this.ticketTypes) {
			AdditionalOptionsTicketType option = tt.getAdditionalOptions();
			if (option != null) {
				if (option.getSaleStart() != null && option.getSaleStart().equals(SaleStart.AT_SPECIFIC_TIME) && option.getStartSaleDate() == null) {
					option.setStartSaleDate(ProjectUtils.formatDate(ProjectUtils.DATE_FORMAT, LocalDate.now()));
				}
				if (option.getSaleEnd() != null && option.getSaleEnd().equals(SaleEnd.AT_SPECIFIC_TIME) && option.getEndSaleDate() == null) {
					option.setEndSaleDate(this.endDate);
				}
			}
		}
	}

	public void setComparableDoorTime(String comparableDoorTime) {
		this.comparableDoorTime = comparableDoorTime;
	}

	@Override
	public void assertEquals(SoftAssert sa, Object obj, Map<Class, List<IAssertableField>> mapListFilds) {
		Event other = isCorrectType(obj);
		assertEquals(sa, obj, mapListFilds.get(this.getClass()));
		if (this.getTicketTypes() != null && other.getTicketTypes() != null
				&& (this.getTicketTypes().size() == other.getTicketTypes().size())) {
			for(TicketType ticketType : ticketTypes) {
				int index = other.getTicketTypes().indexOf(ticketType);

				if (index != -1) {
					TicketType otherTT = other.getTicketTypes().get(index);
					Map<Class,List<IAssertableField>> ticketTypeFieldMap = new HashMap();
					ticketTypeFieldMap.put(TicketType.class, mapListFilds.get(TicketType.class));
					ticketTypeFieldMap.put(AdditionalOptionsTicketType.class, mapListFilds.get(AdditionalOptionsTicketType.class));
					ticketType.assertEquals(sa, otherTT, ticketTypeFieldMap);
				} else {
					sa.fail("TicketType not found in event ticket types");
				}
			}
		}
		if ((this.venue != null) && (other.venue != null)) {
			venue.assertEquals(sa, other.getVenue(), mapListFilds.get(Venue.class));
		}
		if (this.artists != null && other.artists != null) {
			if (this.artists.size() == other.artists.size()) {
				for(Artist artist : artists) {
					if(other.getArtists().contains(artist)) sa.assertTrue(true);
				}
			} else {
				sa.fail("Event compare: Artist set size not the same ");
			}
		}
	}

	@Override
	public void assertEquals(SoftAssert sa, Object obj, List<IAssertableField> fields) {
		Event other = isCorrectType(obj);
		if (fields != null) {
			for (IAssertableField fieldEnum : fields) {
				switch ((EventField) fieldEnum) {
				case EVENT_NAME:
					assertEquals(sa, fieldEnum, this.getEventName(), other.getEventName());
					break;
				case START_DATE:
					assertEquals(sa, fieldEnum, this.getStartDate(), other.getStartDate());
					break;
				case END_DATE:
					assertEquals(sa, fieldEnum, this.getEndDate(), other.getEndDate());
					break;
				case START_TIME:
					assertEquals(sa, fieldEnum, this.getStartTime(), other.getStartTime());
					break;
				case END_TIME:
					assertEquals(sa, fieldEnum, this.getEndTime(), other.getEndTime());
					break;
				case DOOR_TIME:
					assertEquals(sa, fieldEnum, this.getComparableDoorTime(), other.getComparableDoorTime());
					break;
				default:
					break;
				}
			}
		}
	}

	public void setDates(int offset, int range) {
		String[] dateSpan = ProjectUtils.getDatesWithSpecifiedRangeInDaysWithStartOffset(offset, range);
		this.startDate = dateSpan[0];
		this.endDate = dateSpan[1];
		this.comparableDoorTime = calculateComparableDoorTime(ProjectUtils.TIME_FORMAT, getDoorTime());
	}

	public void randomizeName() {
		this.eventName = this.eventName + ProjectUtils.generateRandomInt(DataConstants.RANDOM_NUMBER_SIZE_10M);
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
		String[] fields = { this.eventName, this.artistName, this.getVenue().getName(), this.startDate, this.endDate,
				this.startTime, this.endDate,
				this.getOrganization() != null ? this.getOrganization().getName() : null };
		ProjectUtils.appendFields(fields, sb);
		return sb.toString();

	}

	public static TypeReference<List<Event>> getListTypeReference() {
		return new TypeReference<List<Event>>() {
		};
	}

	public static TypeReference<Event> getTypeReference(){
		return new TypeReference<Event>() {
		};
	}

	public static Object[] generateEventsFromJson(String key, boolean randomizeName, int dateOffset, int dateRangeInDays) {
		Object[] events = DataReader.getInstance().getObjects(key, Event.getListTypeReference());
		for(Object e : events) {
			if(e instanceof Event) {
				Event event =(Event)e;
				event.setDates(dateOffset, dateRangeInDays);
				if(randomizeName)
					event.randomizeName();
			}
		}
		return events;
	}

	public static Event generateEventFromJson(String key, boolean randomizeName, int dateOffset, int dateRangeInDays) {
		Event event = (Event) DataReader.getInstance().getObject(key, Event.getTypeReference());
		event.setDates(dateOffset, dateRangeInDays);
		if(randomizeName) {
			event.randomizeName();
		}
		event.setDefaultTicketTypeDates();
		return event;
	}

	public static Event generateEventFromJson(String key, String replaceName ,
			boolean randomizeName, int dateOffset, int dateRangeInDays) {
		Event event = (Event) DataReader.getInstance().getObject(key, Event.getTypeReference());
		event.setEventName(replaceName);
		event.setDates(dateOffset, dateRangeInDays);
		if(randomizeName) {
			event.randomizeName();
		}
		event.setDefaultTicketTypeDates();
		return event;
	}
}
