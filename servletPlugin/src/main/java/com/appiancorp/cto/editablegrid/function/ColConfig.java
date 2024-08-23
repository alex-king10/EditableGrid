package com.appiancorp.cto.editablegrid.function;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.appiancorp.cto.editablegrid.servlet.GetUserSecurityPermission;
import com.appiancorp.suiteapi.expression.annotations.Function;
import com.appiancorp.suiteapi.expression.annotations.Parameter;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;
@ColConfigCategory
public class ColConfig {
  private static final Logger logger = LogManager.getLogger(GetUserSecurityPermission.class);

  @Function
  public String validator(@Parameter String name, @Parameter String operator, @Parameter String value) {
    HashMap result = new HashMap();
    List<String> validOperators = new ArrayList<>();
    validOperators.add("lessThan");
    validOperators.add("greaterThan");
    validOperators.add("equals");

    if (validOperators.contains(operator)) {
      result.put("name", name);
      result.put("operator", operator);
      result.put("value", value);
    } else {
      result.put("validationMessage", String.format("Validator %s must use a valid operator. Valid operators include lessThan, greaterThan, and equals.", name));
    }
    return new JSONObject(result).toString();
  }

  @Function
//  public String textColConfig(@Parameter String field, @Parameter String title, @Parameter Boolean readOnly, @Parameter String relationshipName, @Parameter String validator) {
public String textColConfig(@Parameter(required = true) String field, @Parameter(required = false) String title, @Parameter(required = false) String relationshipName, @Parameter(required = false) String validator, @Parameter(required = false) Boolean readOnly) {
    HashMap result = new HashMap();

    if (field != null) { result.put("data", field); } else {
      result.put("validationMessage", "The textColConfig function must have a non-null value for the 'field' parameter.");
    }
    if (title != null) { result.put("title", title); }
    if (readOnly != null) { result.put("readOnly", readOnly); }
    if (relationshipName != null) { result.put("relationshipName", relationshipName); }
    if (validator != null) { result.put("validator", validator); }

    return new JSONObject(result).toString();
  }

  @Function
  public String numericColConfig(@Parameter String testObj) {
//    System.out.println(testObj);
    HashMap result = new HashMap();
//    JSONObject testObjJSON = new JSONObject(testObj);
//    Iterator<String> keys = testObjJSON.keys();
//    while (keys.hasNext()) {
//      String key = keys.next();
//      result.put(key, key);
//    }

    result.put("testObj", testObj);
    return new JSONObject(result).toString();
  }


}
