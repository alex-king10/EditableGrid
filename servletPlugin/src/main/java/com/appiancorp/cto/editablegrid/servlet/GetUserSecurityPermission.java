package com.appiancorp.cto.editablegrid.servlet;
// import com.appiancorp.suiteapi.security.external.SecureCredentialsStore;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.appiancorp.common.logging.ConfigureLog4j;
import com.appiancorp.services.exceptions.ServiceException;
import com.appiancorp.suiteapi.process.ProcessDesignService;
import com.appiancorp.suiteapi.process.ProcessModel;
import com.appiancorp.suiteapi.process.ProcessVariable;
import com.appiancorp.suiteapi.process.security.ProcessModelPermissions;
import com.appiancorp.suiteapi.servlet.AppianServlet;
import com.appiancorp.suiteapi.type.TypedValue;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class GetUserSecurityPermission extends AppianServlet {
     ProcessDesignService pds;
    private static final Logger logger = LogManager.getLogger(GetUserSecurityPermission.class);


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
            usernameStr = req.getRemoteUser();
            result.put("Username", usernameStr);

            int viewerGroupID;
            int editorGroupID;
            if (usernameStr != null) {
                if (editorGroupStr != null) {
                    editorGroupID = Integer.parseInt(editorGroupStr);
                    String isEditorExpression = String.format("a!isUserMemberOfGroup(\"%s\", %s)", usernameStr, editorGroupID);
                    TypedValue isEditor = pds.evaluateExpression(isEditorExpression);

                    if ( isEditor.getValue().toString().equals("1") ) {
                        result.put("editor", true);
                    } else {
                        result.put("editor", false);
                    }
                }

                if (viewerGroupStr != null) {
                    viewerGroupID = Integer.parseInt(viewerGroupStr);
                    String isViewerExpression = String.format("a!isUserMemberOfGroup(\"%s\", %s)", usernameStr, viewerGroupID);
                    TypedValue isViewer = pds.evaluateExpression(isViewerExpression);
                    if ( isViewer.getValue().toString().equals("1") ) {
                        result.put("viewer", true);
                    } else {
                        result.put("viewer", false);
                    }
                }

            }

        } catch (ServiceException e) {
            result.put("Service Exception Error: ", e.toString());
        }
        catch (Exception e) {
            logger.error("An error occurred", e);
            result.put("Error", e.toString());
        }

        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        PrintWriter out = resp.getWriter();

        out.write(result.toString());
        out.flush();
        out.close();


    }
}
