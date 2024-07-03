package com.appiancorp.cto.editablegrid.servlet;
// import com.appiancorp.suiteapi.security.external.SecureCredentialsStore;

import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Type;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.appiancorp.cto.editablegrid.utils.Constants;
import com.appiancorp.services.exceptions.ServiceException;
import com.appiancorp.suiteapi.process.ProcessDesignService;
import com.appiancorp.suiteapi.servlet.AppianServlet;
import com.appiancorp.suiteapi.type.TypedValue;
public class GetRecordTypeInfo extends AppianServlet {
     ProcessDesignService pds;

    //    dependency injection
    public GetRecordTypeInfo(ProcessDesignService pds) {
        super();
        this.pds = pds;
    }


    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        JSONObject result = new JSONObject();
        try {

            String recordUUID = req.getParameter("recordUuid");
            String pkName = req.getParameter("pkFieldName");

            result.put("UUID", recordUUID);
            result.put("PK Name", pkName);

            String queryStr = String.format(Constants.GET_UUID_FROM_FIELD_NAME, recordUUID, pkName);
            result.put("queryStr", queryStr);

            TypedValue queryResult = pds.evaluateExpression(queryStr);
            result.put("Result Str", queryResult.getValue());



        } catch (ServiceException e) {
            result.put("Service Exception Error: ", e.toString());
        }
        catch (Exception e) {
            System.out.println(e);
            result.put("Error", e.toString());
        }

        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        PrintWriter out = resp.getWriter();

        out.write(result.toString());
        out.flush();
        out.close();


    }


    private void sendResponse(PrintWriter printWriter, JSONObject message) {
        printWriter.write(message.toString());
        printWriter.flush();
        printWriter.close();
    }
}
