package com.appiancorp.cto.editablegrid.servlet;
// import com.appiancorp.suiteapi.security.external.SecureCredentialsStore;

 import com.appiancorp.suiteapi.process.ProcessDesignService;
import com.appiancorp.suiteapi.servlet.AppianServlet;
 import com.appiancorp.suiteapi.type.TypedValue;

 import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

import org.json.JSONObject;

public class GetLoggedInUserServlet extends AppianServlet {
//    private static final Logger LOG = LogManager.getLogger(GetLoggedInUserServlet.class);
     ProcessDesignService pds;
    // SecureCredentialsStore scs;

    //    dependency injection
    public GetLoggedInUserServlet(ProcessDesignService pds) {
        super();
        this.pds = pds;
        //        this.scs = scs;
    }


    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
//do i need to add something to allow CORS requests??
        JSONObject result = new JSONObject();
        String financeUUID = "168e5b0c-8188-45be-be8a-588dcd20e84c";
        try {
            String getNameExpression = String.format("tostring(recordType!{%s})", financeUUID);
            TypedValue expressionResult = pds.evaluateExpression(getNameExpression);
            String ruleResult = expressionResult.getValue().toString();
            result.put("String", getNameExpression);
            result.put("Result", ruleResult);

        } catch (Exception e) {
            result.put("Error", e.toString());
        }

        result.put("yay", "it workin");
        result.put("success", true);

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
