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
    HashMap<String, Object> result = new HashMap();
    List<String> validOperators = new ArrayList<>();
    validOperators.add("lessThan");
    validOperators.add("greaterThan");
    validOperators.add("equals");
    validOperators.add("regex");

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
  public String textColConfig(@Parameter String field, @Parameter String title, @Parameter String relationshipName, @Parameter String validator, @Parameter Boolean readOnly) {
    HashMap result = new HashMap();

    if (field != "") {
      result.put("data", field);
      result.put("type", "text");
    } else {
      result.put("validationMessage", "The textColConfig function must have a non-null value for the 'field' parameter.");
    }
    if (title != "") { result.put("title", title); }
    if (readOnly != null) { result.put("readOnly", readOnly); }
    if (relationshipName != "") { result.put("relationshipName", relationshipName); }
    if (validator != "") { result.put("validator", validator); }

    return new JSONObject(result).toString();
  }

  @Function
  public String numericColConfig(@Parameter String field, @Parameter String format, @Parameter String title, @Parameter String relationshipName, @Parameter String validator, @Parameter Boolean readOnly) {
    HashMap result = new HashMap();
    if (field != "") {
      result.put("data", field);
      result.put("type", "numeric");
    } else {
      result.put("validationMessage", "The textColConfig function must have a non-null value for the 'field' parameter.");
    }
    if (format != "") {
      HashMap<String, String> patternObj = new HashMap<>();
      patternObj.put("pattern", format);
      result.put("numericFormat", patternObj);
    }
    if (title != "") { result.put("title", title); }
    if (readOnly != null) { result.put("readOnly", readOnly); }
    if (relationshipName != "") { result.put("relationshipName", relationshipName); }
    if (validator != "") { result.put("validator", validator); }

    return new JSONObject(result).toString();

  }

  @Function
  public String checkboxColConfig(@Parameter String field,  @Parameter String label,  @Parameter String labelPosition, @Parameter String checkedTemplate, @Parameter String uncheckedTemplate, @Parameter String title, @Parameter String relationshipName, @Parameter String validator, @Parameter Boolean readOnly) {
    HashMap result = new HashMap();

    if (field != "") {
      result.put("data", field);
      result.put("type", "checkbox");
    } else {
      result.put("validationMessage", "The textColConfig function must have a non-null value for the 'field' parameter.");
    }
    if (label != "") {
      HashMap<String, String> labelMap = new HashMap<>();
      if (labelPosition != "" && ( labelPosition.equals("BEFORE") || labelPosition.equals("AFTER") )) { labelMap.put("position", labelPosition.toLowerCase()); } else { labelMap.put("position", "after"); }
      labelMap.put("value", label);
      result.put("label", labelMap);
    }
    if (checkedTemplate != "") {result.put("checkedTemplate", checkedTemplate); }
    if (uncheckedTemplate != "") { result.put("uncheckedTemplate", uncheckedTemplate); }
    if (title != "") { result.put("title", title); }
    if (readOnly != null) { result.put("readOnly", readOnly); }
    if (relationshipName != "") { result.put("relationshipName", relationshipName); }
    if (validator != "") { result.put("validator", validator); }

    return new JSONObject(result).toString();
  }

  @Function
  public String dateColConfig(@Parameter String field, @Parameter String dateFormat, @Parameter Boolean correctFormat, @Parameter String title, @Parameter String relationshipName, @Parameter String validator, @Parameter Boolean readOnly) {
    HashMap result = new HashMap();

    if (field != "") {
      result.put("data", field);
      result.put("type", "date");
    } else {
      result.put("validationMessage", "The textColConfig function must have a non-null value for the 'field' parameter.");
    }

    if (dateFormat != "") {
      result.put("dateFormat", dateFormat);
    } else {
//      default date format
      result.put("dateFormat", "MM-DD-YYYY");
    }
    if (correctFormat != null) { result.put("correctFormat", correctFormat); }
    if (title != "") { result.put("title", title); }
    if (readOnly != null) { result.put("readOnly", readOnly); }
    if (relationshipName != "") { result.put("relationshipName", relationshipName); }
    if (validator != "") { result.put("validator", validator); }

    return new JSONObject(result).toString();
  }

  @Function
  public String dropdownColConfig(@Parameter String field, @Parameter String[] source, @Parameter Boolean strict, @Parameter Boolean filter, @Parameter String title, @Parameter String relationshipName, @Parameter String validator, @Parameter Boolean readOnly) {
    HashMap result = new HashMap();

    if (field != "") {
      result.put("data", field);
      result.put("type", "autocomplete");
    } else {
      result.put("validationMessage", "The textColConfig function must have a non-null value for the 'field' parameter.");
    }
    if (source[0] != "") { result.put("source", source); }
    if (strict != null) { result.put("strict", strict); }
    if (filter != null) { result.put("filter", filter); }
    if (title != "") { result.put("title", title); }
    if (readOnly != null) { result.put("readOnly", readOnly); }
    if (relationshipName != "") { result.put("relationshipName", relationshipName); }
    if (validator != "") { result.put("validator", validator); }

    return new JSONObject(result).toString();
  }


}
