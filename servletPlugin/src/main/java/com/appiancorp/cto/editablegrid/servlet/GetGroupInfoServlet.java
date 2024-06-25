package com.appiancorp.cto.editablegrid.servlet;
// import com.appiancorp.suiteapi.security.external.SecureCredentialsStore;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.appiancorp.suiteapi.personalization.GroupService;
import com.appiancorp.suiteapi.personalization.GroupSummary;
import com.appiancorp.suiteapi.process.ProcessDesignService;
import com.appiancorp.suiteapi.servlet.AppianServlet;
import com.appiancorp.suiteapi.type.TypedValue;

public class GetGroupInfoServlet extends AppianServlet {
//    private static final Logger LOG = LogManager.getLogger(GetLoggedInUserServlet.class);
     ProcessDesignService pds;
//    GroupService gs;
    // SecureCredentialsStore scs;

    //    dependency injection
    public GetGroupInfoServlet(ProcessDesignService pds) {
        super();
        this.pds = pds;
//        this.gs = gs;
    }



    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        JSONObject result = new JSONObject();

//
        try {
//            get group ID from request
            String groupIDString = req.getParameter("groupID");
            int groupID = Integer.parseInt(groupIDString);
            String getGroupName = "group(" + groupID + ", \"groupName\")";
            TypedValue expressionResult = pds.evaluateExpression(getGroupName);
            result.put("Expression Result", expressionResult);

//            filter group name from response
            String resultString = expressionResult.getValue().toString();

            result.put("content", resultString);

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
