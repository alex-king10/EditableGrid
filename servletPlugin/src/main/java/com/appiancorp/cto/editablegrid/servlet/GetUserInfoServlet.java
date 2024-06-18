package com.appiancorp.cto.editablegrid.servlet;
// import com.appiancorp.suiteapi.security.external.SecureCredentialsStore;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

//import com.appiancorp.security.user.User;
import com.appiancorp.services.UserService;
import com.appiancorp.services.types.UserProfile;
import com.appiancorp.suiteapi.personalization.User;
//import com.appiancorp.suiteapi.personalization.UserProfile;
import com.appiancorp.suiteapi.process.ProcessDesignService;
import com.appiancorp.suiteapi.servlet.AppianServlet;
import com.appiancorp.suiteapi.type.TypedValue;

public class GetUserInfoServlet extends AppianServlet {
//    private static final Logger LOG = LogManager.getLogger(GetLoggedInUserServlet.class);
     ProcessDesignService pds;
     UserService us;
    // SecureCredentialsStore scs;

    //    dependency injection
    public GetUserInfoServlet(ProcessDesignService pds, UserService us) {
        super();
        this.pds = pds;
        this.us = us;
    }



    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        JSONObject result = new JSONObject();

        String financeUUID = "168e5b0c-8188-45be-be8a-588dcd20e84c";

//        String userID = "admin.user";
//        String displayField = "fullName";

        try {
            String userID = req.getParameter("userID");
            String displayField = req.getParameter("displayField");

            result.put("UserID", userID);
            result.put("displayField", displayField);

            if (userID != null) {
                UserProfile userProfile = us.getUserProfile(userID);

                if (displayField.equals("fullName") || displayField.equals("firstName") || displayField.equals("lastName")) {
                    String firstName = userProfile.getFirstName();
                    String lastName = userProfile.getLastName();
                    if (displayField.equals("fullName")) {
                        String fullName = firstName + ' ' + lastName;
                        result.put("content", fullName);
                    } else if (displayField.equals("firstName")){
                        result.put("content", firstName);
                    } else {
                        result.put("content", lastName);
                    }
                } else if (displayField.equals("email")) {
                    String email = userProfile.getEmail();
                    result.put("content", email);
                } else  {
                    result.put("content", userID);
                }
            }


            Boolean userExists = us.doesUserExist(userID);
//            String email = userProfile.getEmail();
//            String firstName = userProfile.getFirstName();
//            String lastName = userProfile.getLastName();

            result.put("Existing User?", userExists);
//            result.put("Email", email);
//            result.put("First name", firstName);
//            result.put("Last Name", lastName);

        } catch (Exception e) {
            result.put("Error", e.toString());
        }

        result.put("yay", "it workin");

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
