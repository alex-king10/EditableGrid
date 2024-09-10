package com.appiancorp.cto.gridplus.servlet;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.appiancorp.services.ServiceContext;
import com.appiancorp.services.WebServiceContextFactory;
import com.appiancorp.services.exceptions.ServiceException;
import com.appiancorp.suiteapi.process.ProcessDesignService;
import com.appiancorp.suiteapi.servlet.AppianServlet;
import com.appiancorp.suiteapi.type.TypedValue;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class GetUserSecurityPermission extends AppianServlet {
     ProcessDesignService pds;
    private static final Logger logger = LogManager.getLogger(GetUserSecurityPermission.class);

    public GetUserSecurityPermission(ProcessDesignService pds) {
        super();
        this.pds = pds;
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        JSONObject result = new JSONObject();
        try {
            String viewerGroupStr = req.getParameter("viewer");
            String editorGroupStr = req.getParameter("editor");
            ServiceContext context = WebServiceContextFactory.getServiceContext(req);
            String usernameStr = context.getName();

            if (usernameStr != null) {
                if (editorGroupStr != null) {
                    String isEditorExpression = String.format("a!isUserMemberOfGroup(\"%s\", {%s})", usernameStr, editorGroupStr);
                    TypedValue isEditor = pds.evaluateExpression(isEditorExpression);

                    result.put("editor", isEditor.getValue().toString().equals("1"));
                }

                if (viewerGroupStr != null) {
                    String isViewerExpression = String.format("a!isUserMemberOfGroup(\"%s\", {%s})", usernameStr, viewerGroupStr);
                    TypedValue isViewer = pds.evaluateExpression(isViewerExpression);
                    result.put("viewer", isViewer.getValue().toString().equals("1"));
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
