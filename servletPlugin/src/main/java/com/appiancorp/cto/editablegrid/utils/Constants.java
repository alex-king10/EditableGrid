package com.appiancorp.cto.editablegrid.utils;

public interface Constants {
  String GET_UUID_FROM_FIELD_NAME =
      "a!localVariables(\n" +
      "  local!record: index(\n" +
      "    a!queryRecordType(\n" +
      "      recordType: 'recordType!{%s}',\n" +
      "      pagingInfo: a!pagingInfo(startIndex: 1, batchSize: 1)\n" +
      "    ).data,\n" +
      "    1,\n" +
      "    null\n" +
      "  ),\n" +
      "  local!fieldList: a!keys(value: local!record),\n" +
      "  local!fieldNameToUuid: reduce(\n" +
      "    a!update(_, _, _),\n" +
      "    a!map(),\n" +
      "    merge(\n" +
      "      toUniformString(local!fieldList),\n" +
      "      local!fieldList\n" +
      "    )\n" +
      "  ),\n" +
      "  local!primaryKey: a!forEach(\n" +
      "    \"%s\",\n" +
      "    index(local!fieldNameToUuid, fv!item)\n" +
      "  ),\n" +
      "  local!primaryKey\n" +
      ")\n" ;

}


