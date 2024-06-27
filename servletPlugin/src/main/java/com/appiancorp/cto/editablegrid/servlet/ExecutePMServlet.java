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
import com.appiancorp.suiteapi.process.ProcessModel;
//import com.appiancorp.suiteapi.process.ProcessStartConfig;
import com.appiancorp.suiteapi.process.ProcessVariable;
import com.appiancorp.suiteapi.process.security.ProcessModelPermissions;
import com.appiancorp.suiteapi.servlet.AppianServlet;
import com.appiancorp.suiteapi.type.TypedValue;

public class ExecutePMServlet extends AppianServlet {
//    private static final Logger LOG = LogManager.getLogger(GetLoggedInUserServlet.class);
     ProcessDesignService pds;
//     ProcessStartConfig psc;
    // SecureCredentialsStore scs;

    //    dependency injection
    public ExecutePMServlet(ProcessDesignService pds) {
        super();
        this.pds = pds;
//        this.psc = psc;
        //        this.scs = scs;
    }


    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
//do i need to add something to allow CORS requests??
        JSONObject result = new JSONObject();
        String pmUUID = "d10b0644-f5b5-4059-be50-baee40a1cf56";
        try {

            ProcessModel myPM = pds.getProcessModelByUuid(pmUUID);
            result.put("Process Model", myPM);

            Long pmID = pds.getProcessModelIdByUuid(pmUUID);
            result.put("PM ID", pmID);

            ProcessVariable[] pvs = pds.getProcessVariablesForModel(pmID, true);
            result.put("Process Vars", pvs);

            ProcessModelPermissions permissions = pds.getPermissionsForProcessModel(pmID);
            result.put("Permissions", permissions);

            int groupID = 43;
            String expression = "group(" + groupID + ", \"groupName\")";
            TypedValue groupName = pds.evaluateExpression(expression);
            result.put("Group Name", groupName);

        } catch (ServiceException e) {
            result.put("Service Exception Error: ", e.toString());
        }
        catch (Exception e) {
            System.out.println(e);
            result.put("Error", e.toString());
        }

        result.put("yay", "it workin");
//        result.put("success", true);

        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
//        resp.setHeader("Access-Control-Allow-Origin", "*"); // Or specify a particular domain instead of "*"
//        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
