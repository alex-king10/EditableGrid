package com.appiancorp.cto.editablegrid.function;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.appiancorp.cto.editablegrid.servlet.GetUserSecurityPermission;
import com.appiancorp.suiteapi.expression.annotations.Function;
import com.appiancorp.suiteapi.expression.annotations.Parameter;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONObject;
@ColConfigCategory
public class ColConfig {
  private static final Logger logger = LogManager.getLogger(GetUserSecurityPermission.class);

  @Function
  public String validator(@Parameter String name, @Parameter String operator, @Parameter(required = false) String value) {
    HashMap<String, Object> result = new HashMap<>();
    List<String> validOperators = new ArrayList<>();
    validOperators.add("lessThan");
    validOperators.add("greaterThan");
    validOperators.add("equals");
    validOperators.add("notEquals");
    validOperators.add("regex");
    validOperators.add("isTrue");
    validOperators.add("isFalse");


    if (validOperators.contains(operator)) {
      result.put("name", name);
      if (operator.equals("isTrue")) {
        result.put("operator", "equals");
        result.put("value", true);
      } else if (operator.equals("isFalse")) {
        result.put("operator", "equals");
        result.put("value", false);
      }  else {
        result.put("operator", operator);
        result.put("value", value);
      }
    } else {
      result.put("validationMessage", String.format("Validator %s must use a valid operator. Valid operators include lessThan, greaterThan, equals, notEquals, regex, isTrue, and isFalse.", name));
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
      result.put("validationMessage", "A textColConfig has a null or invalid 'field' value. Each colConfig function must have a non-null value for the 'field' parameter.");
    }
    if (title != "") { result.put("title", title); }
    if (relationshipName != "") {
      result.put("relationshipName", relationshipName);
      readOnly = true;
    }
    if (readOnly != null) {
      result.put("readOnly", readOnly);
      if (readOnly.equals(true)) {  result.put("headerClassName", "myColHeader header-readOnly"); }
    }
    if (validator != "") { result.put("validator", validator); }

    return new JSONObject(result).toString();
  }

  @Function
  public String numericColConfig(@Parameter String field, @Parameter String format, @Parameter String title, @Parameter String relationshipName, @Parameter String validator, @Parameter Boolean readOnly) {
    HashMap result = new HashMap();
    List<String> validationMessages = new ArrayList<>();
    if (field != "") {
      result.put("data", field);
      result.put("type", "numeric");
    } else {
      validationMessages.add("A numericColConfig has a null or invalid 'field' value. Each colConfig function must have a non-null value for the 'field' parameter.");
    }
    if (format != "") {
      List<String> validPatterns = new ArrayList<>();
      validPatterns.add("$0,0.00");
      validPatterns.add("$0.00");
      validPatterns.add("0,0");
      validPatterns.add("0,0.00");
      validPatterns.add("0.0%");
      validPatterns.add("0.00%");
      validPatterns.add("0.00");

      if (validPatterns.contains(format)) {
        HashMap<String, String> patternObj = new HashMap<>();
        patternObj.put("pattern", format);
        result.put("numericFormat", patternObj);
      } else {
        validationMessages.add("The numericColConfig function must have a null or valid pattern input for the parameter 'format'.");
      }


    }
    if (title != "") { result.put("title", title); }
    if (relationshipName != "") {
      result.put("relationshipName", relationshipName);
      readOnly = true;
    }
    if (readOnly != null) {
      result.put("readOnly", readOnly);
      if (readOnly.equals(true)) {  result.put("headerClassName", "myColHeader header-readOnly"); }
    }
    if (validator != "") { result.put("validator", validator); }

    if (validationMessages.size() != 0) { result.put("validationMessage", validationMessages); }

    return new JSONObject(result).toString();

  }

  @Function
  public String checkboxColConfig(@Parameter String field,  @Parameter String label,  @Parameter String labelPosition, @Parameter String checkedTemplate, @Parameter String uncheckedTemplate, @Parameter String title, @Parameter String relationshipName, @Parameter String validator, @Parameter Boolean readOnly) {
    HashMap result = new HashMap();
    List<String> validationMessages = new ArrayList<>();

    if (field != "") {
      result.put("data", field);
      result.put("type", "checkbox");
    } else {
      validationMessages.add("A checkboxColConfig has a null or invalid 'field' value. Each colConfig function must have a non-null value for the 'field' parameter.");
    }
    if (label != "") {
      HashMap<String, String> labelMap = new HashMap<>();
      if (labelPosition != "") {
        if (labelPosition.equals("BEFORE") || labelPosition.equals("AFTER")) {
          labelMap.put("position", labelPosition.toLowerCase());
        } else {
          validationMessages.add("Please provide a valid labelPosition. Valid values include null, \"BEFORE\", and \"AFTER\".");
        }
      }
      labelMap.put("value", label);
      result.put("label", labelMap);
    }
    if (checkedTemplate != "") {result.put("checkedTemplate", checkedTemplate); }
    if (uncheckedTemplate != "") { result.put("uncheckedTemplate", uncheckedTemplate); }
    if (title != "") { result.put("title", title); }
    if (relationshipName != "") {
      result.put("relationshipName", relationshipName);
      readOnly = true;
    }
    if (readOnly != null) {
      if (readOnly.equals(true) || readOnly.equals(false)) {
        result.put("readOnly", readOnly);
        if (readOnly.equals(true)) {  result.put("headerClassName", "myColHeader header-readOnly"); }
      } else {
        validationMessages.add("Please provide a valid readOnly value. Valid values include null, true, or false.");
      }
    }
    if (validator != "") { result.put("validator", validator); }

    if (validationMessages.size() != 0) { result.put("validationMessage", validationMessages); }

    return new JSONObject(result).toString();
  }

  @Function
  public String dateColConfig(@Parameter String field, @Parameter String dateFormat, @Parameter Boolean correctFormat, @Parameter String title, @Parameter String relationshipName, @Parameter String validator, @Parameter Boolean readOnly) {
    HashMap result = new HashMap();
    List<String> validationMessages = new ArrayList<>();

    if (field != "") {
      result.put("data", field);
      result.put("type", "date");
    } else {
      validationMessages.add("A dateColConfig has a null or invalid 'field' value. Each colConfig function must have a non-null value for the 'field' parameter.");
    }

    if (dateFormat != "") {
      result.put("dateFormat", dateFormat);
    } else {
//      default date format
      result.put("dateFormat", "MM-DD-YYYY");
    }
    if (correctFormat != null) {
      if (correctFormat.equals(true) || correctFormat.equals(false)) { result.put("correctFormat", correctFormat);  }
      else { validationMessages.add("Please provide a valid correctFormat value. Valid values include null, true, or false."); }
    }
    if (title != "") { result.put("title", title); }
    if (relationshipName != "") {
      result.put("relationshipName", relationshipName);
      readOnly = true;
    }
    if (readOnly != null) {
      result.put("readOnly", readOnly);
      if (readOnly.equals(true)) {  result.put("headerClassName", "myColHeader header-readOnly"); }
    }
    if (validator != "") { result.put("validator", validator); }

    if (validationMessages.size() != 0) { result.put("validationMessage", validationMessages); }

    return new JSONObject(result).toString();
  }

  @Function
  public String dropdownColConfig(@Parameter String field, @Parameter String[] source, @Parameter Boolean strict, @Parameter Boolean filter, @Parameter String title, @Parameter String relationshipName, @Parameter String validator, @Parameter Boolean readOnly) {
    HashMap result = new HashMap();
    List<String> validationMessages = new ArrayList<>();

    if (field != "") {
      result.put("data", field);
      result.put("type", "autocomplete");
    } else {
      validationMessages.add("A dropdownColConfig has a null or invalid 'field' value. Each colConfig function must have a non-null value for the 'field' parameter.");
    }
    if (source[0] != "") { result.put("source", source); }
    if (strict != null) {
      if (strict.equals(true) || strict.equals(false)) { result.put("strict", strict); }
      else { validationMessages.add("Please provide a valid strict value. Valid values include null, true, or false."); }
    }
    if (filter != null) {
      if (filter.equals(true) || filter.equals(false)) { result.put("filter", filter); }
      else { validationMessages.add("Please provide a valid filter value. Valid values include null, true, or false."); }
    }
    if (title != "") { result.put("title", title); }
    if (relationshipName != "") {
      result.put("relationshipName", relationshipName);
      readOnly = true;
    }
    if (readOnly != null) {
      if (readOnly.equals(true) || readOnly.equals(false)) {
        result.put("readOnly", readOnly);
        if (readOnly.equals(true)) {  result.put("headerClassName", "myColHeader header-readOnly"); }
      } else {
        validationMessages.add("Please provide a valid readOnly value. Valid values include null, true, or false.");
      }
    }
    if (validator != "") { result.put("validator", validator); }

    if (validationMessages.size() != 0) { result.put("validationMessage", validationMessages); }

    return new JSONObject(result).toString();
  }


}
