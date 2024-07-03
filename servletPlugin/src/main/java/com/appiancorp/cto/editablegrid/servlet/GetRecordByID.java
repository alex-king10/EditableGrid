package com.appiancorp.cto.editablegrid.servlet;
// import com.appiancorp.suiteapi.security.external.SecureCredentialsStore;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.appiancorp.services.exceptions.ServiceException;
import com.appiancorp.suiteapi.process.ProcessDesignService;
import com.appiancorp.suiteapi.servlet.AppianServlet;
import com.appiancorp.suiteapi.type.TypedValue;

public class GetRecordByID extends AppianServlet {
     ProcessDesignService pds;

    //    dependency injection
    public GetRecordByID(ProcessDesignService pds) {
        super();
        this.pds = pds;
    }


    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        JSONObject result = new JSONObject();
        try {

            String recordUUID = req.getParameter("recordUuid");
            int id = Integer.parseInt(req.getParameter("id"));

            result.put("UUID", recordUUID);
            result.put("id", id);

//            String recordUUID = "168e5b0c-8188-45be-be8a-588dcd20e84c";
//            int recordID = 1;
            String queryString = String.format("a!queryRecordByIdentifier(recordType!{%s}, %d)", recordUUID, id);
//            String queryString2 = String.format("a!queryRecordByIdentifier(recordType!{%s}, %d)", recordUUID, 0);

            TypedValue queryResult = pds.evaluateExpression(queryString);

            boolean isRecord = queryResult.getValue() != null;
            result.put("doesRecordExist?", isRecord);
            result.put("value", queryResult.getValue());




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
