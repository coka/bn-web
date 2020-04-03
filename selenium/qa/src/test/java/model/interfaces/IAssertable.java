package model.interfaces;

import java.util.List;
import java.util.Map;

import org.testng.asserts.SoftAssert;


public interface IAssertable<T> {
	/**
	 * Contract is following, provide list of IAssertableField type (mostly enum types extend IAssertableField)
	 * and do SoftAssert sa.assertEquals() only on provided list of fields, between this object and param obj
	 * @param sa
	 * @param obj
	 * @param fields
	 */
	void assertEquals(SoftAssert sa, Object obj, List<IAssertableField> fields);
	
	/**
	 * In case when object contains other IAssertable objects, we can provide Map of List's that contain
	 * fields we want to compare, and key is Class of IAssertable field object of this object
	 * @param sa
	 * @param obj
	 * @param mapListFilds
	 */
	default void assertEquals(SoftAssert sa, Object obj, Map<Class,List<IAssertableField>> mapListFilds) {};
	
	default void assertEquals(SoftAssert sa, IAssertableField fieldEnum, Object first, Object second) {
		sa.assertEquals(first, second, composeAssertMessage(fieldEnum.toString(), first, second));
	}
	
	default T isCorrectType(Object obj) {
		if(!this.getClass().equals(obj.getClass())) {
			throw new IllegalArgumentException(this.getClass().getSimpleName() + ": obj is wrong type: " + obj.getClass());
		} else {
			return (T)obj;
		}
	}
	
	default String composeAssertMessage(String fieldName, Object thisValue, Object otherValue) {
		return this.getClass().getSimpleName() + " " +  fieldName + " not the same: this." + thisValue + " ; other." + otherValue +"|";
	}

}
