package com.appiancorp.cto.editablegrid.servlet;

import com.appiancorp.suiteapi.process.ProcessDesignService;
import com.appiancorp.suiteapi.security.external.SecureCredentialsStore;
import com.appiancorp.suiteapi.servlet.AppianServlet;


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
    SecureCredentialsStore scs;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

//        PrintWriter out = resp.getWriter();
        JSONObject result = new JSONObject();
        result.put("yay", "it workin");
        result.put("success", true);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();
        out.write(result.toString());
        out.flush();
        out.close();

//        out.print(result);
//        sendResponse(out, result);
//        System.out.println("Servlet is working!");
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
