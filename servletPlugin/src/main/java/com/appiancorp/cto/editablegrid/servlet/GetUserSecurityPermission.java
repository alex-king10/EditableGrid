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
import com.appiancorp.suiteapi.process.ProcessVariable;
import com.appiancorp.suiteapi.process.security.ProcessModelPermissions;
import com.appiancorp.suiteapi.servlet.AppianServlet;
import com.appiancorp.suiteapi.type.TypedValue;

public class GetUserSecurityPermission extends AppianServlet {
     ProcessDesignService pds;

    //    dependency injection
    public GetUserSecurityPermission(ProcessDesignService pds) {
        super();
        this.pds = pds;
    }


    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        JSONObject result = new JSONObject();
        try {

            String viewerGroupStr = req.getParameter("viewer");
            String editorGroupStr = req.getParameter("editor");
            TypedValue username = pds.evaluateExpression("loggedInUser()");
            String usernameStr = username.getValue().toString();

            int viewerGroupID;
            int editorGroupID;
            if (usernameStr != null) {

                if (editorGroupStr != null) {
                    editorGroupID = Integer.parseInt(editorGroupStr);
                    String isEditorExpression = String.format("a!isUserMemberOfGroup(\"%s\", %s)", usernameStr, editorGroupID);
                    TypedValue isEditor = pds.evaluateExpression(isEditorExpression);

                    if ( isEditor.getValue().toString().equals("1") ) {
                        result.put("editor", true);
                    }
                }

                if (viewerGroupStr != null) {
                    viewerGroupID = Integer.parseInt(viewerGroupStr);
                    String isViewerExpression = String.format("a!isUserMemberOfGroup(\"%s\", %s)", usernameStr, viewerGroupID);
                    TypedValue isViewer = pds.evaluateExpression(isViewerExpression);
                    if ( isViewer.getValue().toString().equals("1") ) {
                        result.put("viewer", true);
                    }
                }

            }

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
