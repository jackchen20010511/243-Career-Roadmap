export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// ✅ Define SignupFormData interface (Same structure as in signup/page.tsx)
interface SignupFormData {
    name: string;
    email: string;
    password: string;
    security_question: string;
    security_answer: string;
}

export async function fetchUserData(userId: string, token: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/user-login/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user data");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
}

// ✅ Fetch User Goal
export const fetchUserGoal = async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/user-goal/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch user goal");
    console.log(response);
    return response.json();
};

// ✅ Update User Goal (Includes Resume Text)
export const updateUserGoal = async (userId: number, goalData: any) => {
    const response = await fetch(`${API_BASE_URL}/user-goal/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
    });
    if (!response.ok) throw new Error("Failed to update user goal");
    return response.json();
};

// ✅ Save Resume File
export const saveResumeFile = async (userId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/user-goal/save-resume/${userId}`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) throw new Error("Failed to save resume");
    return response.json();
};

// ✅ Remove Resume File
export const removeResumeFile = async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/user-goal/remove-resume/${userId}`, {
        method: "POST",
    });

    if (!response.ok) throw new Error("Failed to remove resume");
    return response.json();
};

// ✅ Get Resume File Url
export const fetchResumeUrl = async (userId: number): Promise<string | null> => {
    const response = await fetch(`${API_BASE_URL}/user-goal/get-resume-url/${userId}`);
    if (response.ok) {
        const data = await response.json();
        return `${API_BASE_URL}${data.url}`;
    } else {
        return null;
    }
};

// ✅ Unified Function for Updating User Info (Name, Password, or Future Fields)
export const updateUserInfo = async (userId: number, updateFields: any) => {
    const token = localStorage.getItem("access_token"); // ✅ Get token once
    if (!token) throw new Error("Unauthorized: No access token found");

    try {
        const response = await fetch(`${API_BASE_URL}/user-login/update/${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updateFields),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to update user info");
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating user info:", error);
        throw error;
    }
};
// ✅ Fetch Security Question
export const fetchSecurityQuestion = async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/user-login/reset-password/question?email=${email}`);
    if (!response.ok) throw new Error("Email not found");
    return response.json();
};

// ✅ Verify Security Answer
export const verifySecurityAnswer = async (email: string, securityAnswer: string) => {
    const response = await fetch(`${API_BASE_URL}/user-login/reset-password/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, security_answer: securityAnswer }),
    });

    if (!response.ok) throw new Error("Incorrect security answer");
    return response.json();
};


// ✅ User Login
export const loginUser = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/user-login/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Login failed");
    return data; // ✅ Return token & user_id
};

// ✅ User Registration
export const registerUser = async (formData: SignupFormData) => {
    const response = await fetch(`${API_BASE_URL}/user-login/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Signup failed");
    return data; // ✅ Return success message or response data
};

