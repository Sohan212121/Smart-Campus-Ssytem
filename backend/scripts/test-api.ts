const API_BASE = "http://localhost:5000/api/v1";

async function runTests() {
  console.log("=== STARTING API INTEGRATION TESTS ===");
  
  let studentToken = "";
  let teacherToken = "";
  let leaveId = "";

  // 1. Log in as student
  try {
    console.log("\n[Test 1] Logging in as student (sohan.k@campus.edu)...");
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "sohan.k@campus.edu",
        password: "password123",
      }),
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    studentToken = data.token;
    console.log("✔ Student Logged In. Token:", studentToken.substring(0, 20) + "...");
  } catch (err: any) {
    console.error("❌ Student Login failed. (Make sure backend is running and db is seeded):", err.message);
    return;
  }

  // 2. Log in as teacher
  try {
    console.log("\n[Test 2] Logging in as instructor (prof.sharma@campus.edu)...");
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "prof.sharma@campus.edu",
        password: "password123",
      }),
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    teacherToken = data.token;
    console.log("✔ Instructor Logged In. Token:", teacherToken.substring(0, 20) + "...");
  } catch (err: any) {
    console.error("❌ Instructor Login failed:", err.message);
    return;
  }

  // 3. Test Student Analytics Dashboard endpoint
  try {
    console.log("\n[Test 3] Fetching Student Analytics Dashboard stats...");
    const res = await fetch(`${API_BASE}/attendance/student/stats`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    console.log("✔ Analytics fetched successfully. Student Overall Attendance:", data.overallRate + "%");
  } catch (err: any) {
    console.error("❌ Fetching analytics failed:", err.message);
  }

  // 4. Student Submits a Leave Exemption Request
  try {
    console.log("\n[Test 4] Student submitting a Medical Leave Request...");
    const res = await fetch(`${API_BASE}/leaves`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        type: "MEDICAL",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        reason: "Recovering from flu. Doctor advised resting.",
      }),
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    leaveId = data.leave.id;
    console.log("✔ Leave Request Submitted. ID:", leaveId);
  } catch (err: any) {
    console.error("❌ Submitting leave failed:", err.message);
  }

  // 5. Instructor fetches pending leave requests
  try {
    console.log("\n[Test 5] Instructor fetching pending leave request queue...");
    const res = await fetch(`${API_BASE}/leaves/pending`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    const pendingList = data.leaves;
    console.log(`✔ Fetched pending leaves. Queue count: ${pendingList.length}`);
  } catch (err: any) {
    console.error("❌ Fetching pending leaves failed:", err.message);
  }

  // 6. Instructor Approves Leave Request (retroactively adjusting attendance)
  if (leaveId) {
    try {
      console.log(`\n[Test 6] Instructor approving leave request ID: ${leaveId}...`);
      const res = await fetch(`${API_BASE}/leaves/${leaveId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          status: "APPROVED",
          reviewNote: "Approved - medical certificate verified.",
        }),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      console.log("✔ Exemption Approved successfully.");
      console.log(`System Message: "${data.message}"`);
    } catch (err: any) {
      console.error("❌ Approving leave request failed:", err.message);
    }
  }

  // 7. Get Active Sessions
  try {
    console.log("\n[Test 7] Fetching active sessions for student...");
    const res = await fetch(`${API_BASE}/sessions`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    console.log(`✔ Sessions retrieved. Active session count: ${data.sessions.length}`);
  } catch (err: any) {
    console.error("❌ Fetching sessions failed:", err.message);
  }

  // 8. Update Profile Details
  try {
    console.log("\n[Test 8] Updating profile (First Name) for student...");
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        firstName: "SohanUpdated",
      }),
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    console.log(`✔ Profile updated successfully. New First Name: ${data.user.firstName}`);

    // Revert profile update back to original Sohan
    await fetch(`${API_BASE}/users/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        firstName: "Sohan",
      }),
    });
    console.log("✔ Profile reverted back to original details.");
  } catch (err: any) {
    console.error("❌ Updating profile failed:", err.message);
  }

  // 9. Upload and then Remove Profile Avatar
  try {
    console.log("\n[Test 9] Uploading base64 avatar picture...");
    const dummyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const res = await fetch(`${API_BASE}/users/avatar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        base64Image: dummyBase64,
      }),
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    console.log("✔ Avatar uploaded successfully. URL starts with:", data.avatarUrl.substring(0, 30) + "...");

    console.log("Testing removing avatar photo...");
    const removeRes = await fetch(`${API_BASE}/users/avatar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        base64Image: null,
      }),
    });
    const removeData: any = await removeRes.json();
    if (!removeRes.ok) throw new Error(removeData.error || "Request failed");
    console.log("✔ Avatar removed successfully. Database value is:", removeData.avatarUrl);
  } catch (err: any) {
    console.error("❌ Avatar upload/remove test failed:", err.message);
  }

  // 10. Fetch Activity Logs
  try {
    console.log("\n[Test 10] Retrieving student activity logs...");
    const res = await fetch(`${API_BASE}/users/activity-logs`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    console.log(`✔ Activity logs fetched successfully. Log count: ${data.logs.length}`);
    console.log("Latest Action:", data.logs[0].action, "-", data.logs[0].details);
  } catch (err: any) {
    console.error("❌ Fetching activity logs failed:", err.message);
  }

  // 11. Test Password Reset Flow & Reversion
  try {
    console.log("\n[Test 11] Initiating Forgot Password flow for sohan.k@campus.edu...");
    const forgotRes = await fetch(`${API_BASE}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "sohan.k@campus.edu" }),
    });
    const forgotData: any = await forgotRes.json();
    if (!forgotRes.ok) throw new Error(forgotData.error || "Request failed");
    console.log("✔ Forgot Password request succeeded.");

    const resetUrl = forgotData.resetUrl;
    const resetToken = resetUrl.split("token=")[1];
    console.log("Parsed reset token:", resetToken);

    console.log("Executing password reset to 'newpassword123'...");
    const resetRes = await fetch(`${API_BASE}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: resetToken,
        newPassword: "newpassword123",
      }),
    });
    const resetData: any = await resetRes.json();
    if (!resetRes.ok) throw new Error(resetData.error || "Request failed");
    console.log("✔ Password reset successfully.");

    // Validate login with new password
    console.log("Attempting login with new password...");
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "sohan.k@campus.edu",
        password: "newpassword123",
      }),
    });
    const loginData: any = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.error || "Login with new password failed");
    console.log("✔ Logged in with new password successfully!");

    // Reset password back to original "password123" so that dev setup is unmodified
    console.log("Reverting password back to 'password123' for subsequent tests...");
    const revertForgotRes = await fetch(`${API_BASE}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "sohan.k@campus.edu" }),
    });
    const revertForgotData: any = await revertForgotRes.json();
    const revertResetUrl = revertForgotData.resetUrl;
    const revertResetToken = revertResetUrl.split("token=")[1];

    const revertResetRes = await fetch(`${API_BASE}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: revertResetToken,
        newPassword: "password123",
      }),
    });
    if (!revertResetRes.ok) throw new Error("Failed to revert password back to original");
    console.log("✔ Student password successfully reverted to 'password123'.");
  } catch (err: any) {
    console.error("❌ Password reset verification flow failed:", err.message);
  }

  console.log("\n=== API INTEGRATION TESTS COMPLETED ===");
}

runTests();
