package com.appiancorp.cto.editablegrid.servlet;
// import com.appiancorp.suiteapi.security.external.SecureCredentialsStore;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.appiancorp.suiteapi.personalization.GroupService;
import com.appiancorp.suiteapi.personalization.GroupSummary;
import com.appiancorp.suiteapi.process.ProcessDesignService;
import com.appiancorp.suiteapi.servlet.AppianServlet;

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

//        result.put("Hello?", "hi");


        String financeUUID = "168e5b0c-8188-45be-be8a-588dcd20e84c";

        Long groupID = 43L;
//
        try {
//            Boolean groupExist = gs.getGroupName(groupID);
//            result.put("group exists?", groupExist);
////            groupID = req.getParameter("groupID");
//            String displayField = req.getParameter("displayField");
//
//            result.put("GroupID", groupID);
            result.put("Hello?", "hi");
//
////            if (groupID != -1) {
////                String groupName = gs.getGroupName(groupID);
////
////                result.put("Group Name", groupName);
////            }
//
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
