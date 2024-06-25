package com.appiancorp.cto.editablegrid.servlet;
// import com.appiancorp.suiteapi.security.external.SecureCredentialsStore;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.appiancorp.suiteapi.process.ProcessDesignService;
import com.appiancorp.suiteapi.process.security.ProcessModelPermissions;
import com.appiancorp.suiteapi.servlet.AppianServlet;
import com.appiancorp.suiteapi.type.TypedValue;

public class WriteRecordServlet extends AppianServlet {
//    private static final Logger LOG = LogManager.getLogger(GetLoggedInUserServlet.class);
     ProcessDesignService pds;
    //    dependency injection
    public WriteRecordServlet(ProcessDesignService pds) {
        super();
        this.pds = pds;
    }



    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        JSONObject result = new JSONObject();

        Long processModelID = 177L;
//
        try {
//            get group ID from request
            ProcessModelPermissions permissions = pds.getPermissionsForProcessModel(processModelID);
//            i think only says if the user has permissions to modify the PM not run it
            result.put("Permissions", permissions.toString());
//            result.put("content", resultString);

        } catch (Exception e) {
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
