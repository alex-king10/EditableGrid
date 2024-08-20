package com.appiancorp.cto.editablegrid.function;

import java.util.HashMap;

import com.appiancorp.suiteapi.expression.annotations.Function;
import com.appiancorp.suiteapi.expression.annotations.Parameter;
import org.json.JSONObject;
@ColConfigCategory
public class TextColConfig {

  @Function
  public String textColConfig(@Parameter Boolean readOnly) {
    System.out.println(readOnly);
    HashMap result = new HashMap();
    result.put("readOnly", readOnly);
    return new JSONObject(result).toString();
  }
}
