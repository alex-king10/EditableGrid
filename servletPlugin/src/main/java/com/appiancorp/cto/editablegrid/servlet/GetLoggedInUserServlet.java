package com.appiancorp.cto.editablegrid.servlet;
// import com.appiancorp.suiteapi.security.external.SecureCredentialsStore;

 import com.appiancorp.suiteapi.process.ProcessDesignService;
import com.appiancorp.suiteapi.servlet.AppianServlet;
// import com.appiancorp.suiteapi.type.TypedValue;

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

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        JSONObject result = new JSONObject();
        String financeUUID = "168e5b0c-8188-45be-be8a-588dcd20e84c";
        try {
            String getNameExpression = String.format("tostring(recordType!{%s})", financeUUID);
//            TypedValue expressionResult = pds.evaluateExpression(getNameExpression);
//            String ruleResult = expressionResult.getValue().toString();
            result.put("Result", getNameExpression);

        } catch (Exception e) {
            result.put("Error", e.toString());
        }

        result.put("yay", "it workin");
        result.put("success", true);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();
        out.write(result.toString());
        out.flush();
        out.close();
    }

//    public GetLoggedInUserServlet(ProcessDesignService pds, SecureCredentialsStore scs) {
//        super();
//        this.pds = pds;
//        this.scs = scs;
//    }

    private void sendResponse(PrintWriter printWriter, JSONObject message) {
        printWriter.write(message.toString());
        printWriter.flush();
        printWriter.close();
    }
}
